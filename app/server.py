import tornado.ioloop
import tornado.web
from tornado import websocket

class EventMgr:
    # Sync user position
    def syncUsers():
        print("Sync users from game")

    # Sync all object states
    def syncAllObjects():
        print("Sending all objects from game")

    # Sync objects in room
    def syncObjectsInRoom(room):
        print("Room: " + room)

    # Send event trigger
    def sendEvent(event):
        print(event)

# Add session to keep track of player
# Store data in Memcache
class GameClient(websocket.WebSocketHandler):
    def check_origin(self, origin):
        return True

    def select_subprotocol(self, subprotocols):
        return "binary"

    def open(self):
        print("WebSocket opened")

    def on_message(self, message):
        print(message.action)

        self.write_message(u"Received")



    def on_close(self):
        print("WebSocket closed")

application = tornado.web.Application([
    (r"/websocket", GameClient),
])

if __name__ == "__main__":
    application.listen(8888)
    tornado.ioloop.IOLoop.instance().start()
