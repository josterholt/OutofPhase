# Add session to keep track of player
# Store data in Memcache
import json
import uuid
from pycket.session import SessionMixin
from tornado import websocket
from mobs.utils import MobEncoder
from player.models import GamePlayer
from globals import ACTIVE_GAMES
from system.GameState import GameState


class GameClient(websocket.WebSocketHandler, SessionMixin):
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

        print(self.session.get('userID'))


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

        print("User ID: " + str(self.session.get("userID")))

        if player_token is not None:
            if game.players[0].get("userID") == self.session.get("userID"):
                player_index = 0
                self.gamePlayer = GamePlayer(self, game, 0, user_id, player_token)
                game.addPlayer(0, self.gamePlayer)
            elif game.players[1].get("userID") == self.session.get("userID"):
                player_index = 1
                self.gamePlayer = GamePlayer(self, game, 1, user_id, player_token)
                game.addPlayer(1, self.gamePlayer)

        # No matching player token found, and second player slot is occupied
        if player_index is None:
            if game.players[0].get("userID") is None:
                print("First player joined")
                # Game is fresh, generate new player token and assign as first player
                player_token = str(uuid.uuid4())
                game.players[0]['token'] = player_token
                game.players[1]['userID'] = self.session.get("userID")
                print("First player ID: " + str(self.session.get("userID")))
                self.gamePlayer = GamePlayer(self, game, 0, self.session.get("userID"), player_token)
                game.addPlayer(0, self.gamePlayer)
            elif game.players[1].get("userID") is None:
                print("Second player joined")
                player_token = str(uuid.uuid4())
                game.players[1]['token'] = player_token
                game.players[1]['userID'] = self.sesion.get("userID")
                self.gamePlayer = GamePlayer(self, game, 1, self.session.get("userID"), player_token)
                game.addPlayer(1, self.gamePlayer)
            else:
                return False

            # This may need to be abstracted out
            # self.session['playerToken'] = player_token
            # self.session['playerIndex'] = player_index

        return game

    def getGame(self):
        return self.games[self.id]

    def on_message(self, message):
        responses = []

        requests = json.loads(message)

        for request in requests:
            responses.append(self.process_request(request))

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
                    response['data'] = {
                        "action": "INIT",
                        "players": game.getPlayerPositions(),
                        "gameToken": str(game_token),
                        "playerToken": self.gamePlayer.getToken(),
                        "mobs": MobEncoder().encode(self.gamePlayer.game.mobs)
                    }
            elif request.get("action") == "joinGame":
                print("Join game")

                # Does this game exist?
                if "gameToken" not in request:
                    response['status'] = 'ERROR'
                    response['message'] = 'Token must be specified'
                elif request.get("gameToken") not in ACTIVE_GAMES:
                    print("Token not in active games")
                    response['status'] = 'ERROR'
                    response['message'] = 'Token is invalid'
                else:
                    game = self.joinGame(request.get("gameToken"), request.get("playerToken"))

                    if not game:
                        response['status'] = 'ERROR'
                        response['message'] = 'Unable to join game'
                    else:
                        response['data'] = {
                            "action": "INIT",
                             "players": game.getPlayerPositions(),
                             "gameToken": str(game.getToken()),
                             "playerToken": self.gamePlayer.getToken(),
                             "mobs": MobEncoder().encode(self.gamePlayer.game.mobs)
                         }

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