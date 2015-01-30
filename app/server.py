import uuid
import tornado.ioloop
import tornado.web
import json
import redis
from tornado import websocket

r = redis.StrictRedis(host='localhost', port=6379, db=10)
session_id = 1234

class GameState:
    gameID = None
    players = [{"x": 0, "y": 0}, {"x": 0, "y": 0 }]

    def __init__(self):
        print("Setting game id")
        self.gameID = 1

    def setPlayer(self, index, player):
        self.players[index] = player

    def updatePosition(self, indx, x, y):
        self.players[indx]['x'] = x;
        self.players[indx]['y'] = y;

    def getPlayerPositions(self):
        return self.players

class EventMgr:
    sessionid = None
    game = None

    def __init__(self, handler, game):
        self.handler = handler
        self.sessionid = handler.id
        self.game = game

        print(self.game.gameID)

    # Create game
    def createGame(self, request):
        # Add to game list
        unique_id = uuid.uuid4()
        game_id = "game:" + str(unique_id)

        if self.get_cookie("player") == 1:
            self.gs.setPlayer(0, self)
        elif self.get_cookie("player") == 2:
            self.gs.setPlayer(1, self)
        else:
            print("Invalid player")


        # Add to users personal game list
        #r.rpush("games:" + str(self.sessionid), game_id)

        # Initialize in-memory game variables
        state = {
            "x": 0,
            "y": 0,
            "velocity": {
                "x": 0,
                "y": 0
            }
        }
        #r.hset(game_id, "player1", state)
        #r.hset(game_id, "player2", {})

    # Retrieve game state of all players
    def getGameStates(self, request):
        game_states = []
        #Get game states
        return(game_states)

    # Retrieve game state of a player
    def getGameState(self, request):
        print("Sync users from game")
        game_state = {
            "player1": {
                "x": 0,
                "y": 0
            },
            "player2": {
                "x": 0,
                "y": 0
            }
        }
        return(game_state)


    def updatePlayer(self, request):
        print(self.handler.get_cookie("player"))
        if(self.handler.get_cookie("player") == 1):
            player_indx = 0
        else:
            player_indx = 1

        self.game.updatePosition(player_indx, request.get("x"), request.get("y"))
        return self.game.getPlayerPositions()

    # Sync all object states
    def syncAllObjects(self, request):
        print("Sending all objects from game")

    # Sync objects in room
    def syncObjectsInRoom(self, request):
        print("Room: " + room)

    # Send event trigger
    def sendEvent(self, request):
        print("Send event")

    def default(self, request):
        return({"error": "Unknown command"})


# Add session to keep track of player
# Store data in Memcache
class GameClient(websocket.WebSocketHandler):
    clients = []
    em = None
    gs = GameState()

    def check_origin(self, origin):
        return True

    def select_subprotocol(self, subprotocols):
        return "binary"

    def open(self):
        game_session = self.get_cookie("game_session")
        if game_session is None:
            self.id = uuid.uuid4()
        else:
            self.set_cookie("game_session", self.id)

        self.clients.append(self)
        print("Initial cookie")
        print(self.get_cookie("player"))


        self.em = EventMgr(self, self.gs)
        print("WebSocket opened")

    def on_message(self, message):
        response = {"status": None, "data": None}
        print(message)


        try:
            request = json.loads(message)

            if "action" not in request or request.get("action") not in dir(self.em):
                response = self.em.default(request)
            else:
                response['data'] = getattr(self.em, request.get("action"))(request)

            response['status'] = 'OK'
            self.write_message(json.dumps(response))
        except ValueError as e:
            self.write_message(json.dumps({"error": "Bad Value"}))



    def on_close(self):
        self.clients.remove(self)
        print("WebSocket closed")

application = tornado.web.Application([
    (r"/websocket", GameClient),
], autoreload=True)

if __name__ == "__main__":
    application.listen(8888)
    tornado.ioloop.IOLoop.instance().start()
