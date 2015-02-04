import uuid
import tornado.ioloop
import tornado.web
import json
import redis
from tornado import websocket

r = redis.StrictRedis(host='localhost', port=6379, db=10)
session_id = 1234
ACTIVE_GAMES = {}
CONNECTION_MGR_LOOKUP = {}


class EventMgr:
    gamePlayer = None

    def __init__(self, gamePlayer):
        self.gamePlayer = gamePlayer

    def updatePlayer(self, request):
        self.gamePlayer.game.updatePosition(self.gamePlayer.playerIndex, request.get("player"))
        return {"action": "UPDATE", "players": self.gamePlayer.game.getPlayerPositions() }

    def runTrigger(self, request):
        response = {"action": "runTrigger", "data": request.get("data")}
        self.gamePlayer.broadcast(response)
        return {}

    def default(self, request):
        return {}

class GameState:
    token = ""
    gameID = None
    events = None

    def __init__(self, game_token):
        print("Setting game id")
        if id is None:
            self.token = str(uuid.uuid4())
            self.gameID = str(self.token)
        else:
            self.token = game_token
            self.gameID = str(game_token)

        self.players = [{"token": None, "position": [0,0], "velocity": [0,0], "facing": 0}, {"token": None, "position": [150, 150], "velocity": [0,0], "facing": 0}]
        self.gamePlayers = []

    @staticmethod
    def getGameByToken(token):
        gameID = str(token)
        if gameID not in ACTIVE_GAMES:
            return None
        else:
            return ACTIVE_GAMES[gameID]

    def addPlayer(self, player_index, player):
        self.gamePlayers.insert(player_index, player)

    def getStateUpdates(self):
        return {"action": "UPDATE", "players": self.getPlayerPositions() }

    def getPlayerPositions(self):
        return self.players

    def getToken(self):
        return self.token

    def updatePosition(self, indx, player):
        self.players[indx]['position'] = player.get("position")
        self.players[indx]['velocity'] = player.get("velocity")
        self.players[indx]['facing'] = player.get("facing")



class GamePlayer:
    def __init__(self, connection, game, player_index, player_token):
        self.connection = connection
        self.game = game
        self.eventMgr = EventMgr(self)
        self.playerIndex = player_index
        self.token = player_token
        print("Player Index: " + str(self.playerIndex))

    def getToken(self):
        return self.token

    def broadcast(self, data):
        #message = json.dumps([{"status": "OK", "data": { "action": "runTrigger", "data": data } }])
        message = json.dumps([{"status": "OK", "data": data }])
        for player in self.game.gamePlayers:
            if player.playerIndex != self.playerIndex:
                print(player.playerIndex)
                print(message)
                player.connection.write_message(message)



# Add session to keep track of player
# Store data in Memcache
class GameClient(websocket.WebSocketHandler):
    clients = []
    em = None
    id = None
    #game = None
    #gamePlayer = None

    def check_origin(self, origin):
        return True

    def select_subprotocol(self, subprotocols):
        return "binary"

    def open(self):
        self.game = None
        self.gamePlayer = None
        self.id = uuid.uuid4()
        self.clients.append(self)
        print("WebSocket opened")

    def createGame(self, request):
        if "gameID" in request:
            print("Request has game ID")
            self.game = ACTIVE_GAMES.get(request.get("gameID"))
        else:
            print("New game")
            self.gamePlayer = None
            self.game = GameState(uuid.uuid4())


        ACTIVE_GAMES[self.game.gameID] = self.game
        return self.game.getToken()

    def joinGame(self, game_token, player_token):
        print("Looking up game with token: " + str(game_token))
        game = GameState.getGameByToken(game_token)

        # Scenarios:
        # - Completely fresh game
        # - Continued game
        player_index = None

        if player_token is not None:
            if game.players[0].get("token") == player_token:
                player_index = 0
                self.gamePlayer = GamePlayer(self, game, 0, player_token)
                game.addPlayer(0, self.gamePlayer)
            elif game.players[1].get("token") == player_token:
                player_index = 1
                self.gamePlayer = GamePlayer(self, game, 1, player_token)
                game.addPlayer(1, self.gamePlayer)

        # No matching player token found, and second player slot is occupied
        if player_index is None:
            if game.players[0].get("token") is None:
                print("First player joined")
                # Game is fresh, generate new player token and assign as first player
                player_token = str(uuid.uuid4())
                game.players[0]['token'] = player_token
                self.gamePlayer = GamePlayer(self, game, 0, player_token)
                game.addPlayer(0, self.gamePlayer)
            elif game.players[1].get("token") is None:
                print("Second player joined")
                player_token = str(uuid.uuid4())
                game.players[1]['token'] = player_token
                self.gamePlayer = GamePlayer(self, game, 1, player_token)
                game.addPlayer(1, self.gamePlayer)
            else:
                return false

        return game

    def getGame(self):
        return self.games[self.id]

    def on_message(self, message):
        responses = []
        #response = {"status": None, "data": None}

        #try:
        requests = json.loads(message)

        for request in requests:
            responses.append(self.process_request(request))
        #except e:
            #responses.append({"status": "ERROR", "message": "An error occurred"})
            #raise e

        self.write_message(json.dumps(responses))


    def process_request(self, request):
        try:
            response = {}
            response['status'] = 'OK'

            #print("testing");
            #print(request)

            if "action" not in request:
                #response = self.gamePlayer.eventMgr.default(request)
                response['status'] = "ERROR"
                response['message'] = "No action specified"
            elif request.get("action") == "createGame":
                print("Creating game")
                game_token = self.createGame(request)
                game = self.joinGame(game_token, None)
                if not game:
                    response['status'] = "ERROR"
                    response['message'] = "Unable to create game"
                else:
                    response['data'] = {"action": "INIT", "players": game.getPlayerPositions(), "gameToken": str(game_token), "playerToken": self.gamePlayer.getToken() }
            elif request.get("action") == "joinGame":
                print("Join game")

                # Does this game exist?
                if "gameToken" not in request:
                    response['status'] = 'ERROR'
                    response['message'] = 'Token must be specified'
                elif request.get("gameToken") not in ACTIVE_GAMES:
                    response['status'] = 'ERROR'
                    response['message'] = 'Token is invalid'
                else:
                    game = self.joinGame(request.get("gameToken"), request.get("playerToken"))

                    if not game:
                        response['status'] = 'ERROR'
                        response['message'] = 'Unable to join game'
                    else:
                        response['data'] = {"action": "INIT", "players": game.getPlayerPositions(), "gameToken": str(game.getToken()), "playerToken": self.gamePlayer.getToken() }

            elif self.gamePlayer is not None and request.get("action") in dir(self.gamePlayer.eventMgr):
                response['status'] = 'OK'
                response['data'] = getattr(self.gamePlayer.eventMgr, request.get("action"))(request)
            else:
                response['status'] = 'ERROR'
                response['data'] = 'INVALID STATE'

            return response
        except ValueError as e:
            return {"error": "Bad Value"}


    def on_close(self):
        self.clients.remove(self)
        print("WebSocket closed")

application = tornado.web.Application([
    (r"/websocket", GameClient),
], autoreload=True)

if __name__ == "__main__":
    application.listen(8888)
    tornado.ioloop.IOLoop.instance().start()
