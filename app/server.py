import uuid
import tornado.ioloop
import tornado.web
import json
import redis
from tornado import websocket

r = redis.StrictRedis(host='localhost', port=6379, db=10)
session_id = 1234

class EventMgr:
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

    def updatePlayerPosition(selfself, request):
        print(r.hset(session_id, "x", request.get("x")))
        r.hset(session_id, "y", request.get("y"))

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

    def check_origin(self, origin):
        return True

    def select_subprotocol(self, subprotocols):
        return "binary"

    def open(self):
        self.id = uuid.uuid4()
        self.clients.append(self)

        # Add to game list

        # Add players to variable
        
        print("WebSocket opened")

    def on_message(self, message):
        response = {"status": None, "data": None}
        print(message)
        request = json.loads(message)

        em = EventMgr()

        if "action" not in request or request.get("action") not in dir(em):
            response = em.default(request)
        else:
            response['data'] = getattr(em, request.get("action"))(request)

        response['status'] = 'OK'
        self.write_message(json.dumps(response))



    def on_close(self):
        self.clients.remove(self)
        print("WebSocket closed")

application = tornado.web.Application([
    (r"/websocket", GameClient),
], autoreload=True)

if __name__ == "__main__":
    application.listen(8888)
    tornado.ioloop.IOLoop.instance().start()
