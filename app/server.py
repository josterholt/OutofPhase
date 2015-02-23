import hashlib
import string
import random
import os
from settings import config
import tornado.ioloop, tornado.httpserver
import tornado.web
import redis
from utils.mysql import DB

from pycket.session import SessionMixin

from system.client import GameClient


r = redis.StrictRedis(host='localhost', port=6379, db=5)

class RegisterHandler(tornado.web.RequestHandler):
    def post(self):
        request = tornado.escape.json_decode(self.request.body)
        username = request.get("username")
        password = request.get("password")


        m = hashlib.md5()
        m.update(password.encode(encoding='UTF-8'))
        encrypted_password = m.hexdigest()

        DB.fetchOne(("SELECT COUNT(*) FROM users WHERE username = %(username)s AND password = %(password)s"), {"username": username, "password": encrypted_password})

        if row[0] > 0:
            self.write({"status": "ERROR", "message": "Account with username already exists"})
        else:
            code = ''.join(random.choice(string.ascii_uppercase) for _ in range(6))
            #cursor.execute("INSERT INTO users (username, password, code) VALUES(%(username)s, %(password)s, %(code)s)", {"username": username, "password": encrypted_password, "code": code});
            DB.execute("INSERT INTO users (username, password, code) VALUES(%(username)s, %(password)s, %(code)s)", {"username": username, "password": encrypted_password, "code": code})
            self.write({"status": "SUCCESS"})



class RegisterConfirmHandler(tornado.web.RequestHandler, SessionMixin):
    def get(self):
        (code, ) = self.get_arguments("code")
        if code != "":
            self.write("Invalid request")

        row = DB.fetchone("SELECT id FROM users WHERE code = %s", code)

        id = row[0]

        self.write("foo")

class LoginHandler(tornado.web.RequestHandler, SessionMixin):
    def post(self):
        if self.request.body:
            request = tornado.escape.json_decode(self.request.body.decode("utf-8"))

        username = request.get("username")
        password = request.get("password")

        m = hashlib.md5()
        m.update(password.encode(encoding='UTF-8'))
        encrypted_password = m.hexdigest()

        row = DB.fetchOne("SELECT id FROM users WHERE username = %(username)s AND password = %(password)s", {"username": username, "password": encrypted_password})
        self.session.set('userID', row[0])

        response = {"status": "SUCCESS"}
        self.write(response)

class GameListHandler(tornado.web.RequestHandler, SessionMixin):
    def get(self):
        userid = self.session.get("userID")
        if userid is None:
            print("Invalid user")
            self.write({"error": "Invalid userid"})
            return

        rows = DB.fetchAll("SELECT gameinstances.token, u1.display_name, u2.display_name " \
            "FROM gameinstances " \
            "JOIN users u1 ON u1.id = gameinstances.user1 " \
            "LEFT JOIN users u2 ON u2.id = gameinstances.user2 " \
            "WHERE u1.id = %(userid)s OR u2.id = %(userid)s", {"userid": userid})

        games = []
        for game in rows:
            games.append({"gameToken": game[0], "user1": game[1], "user2": game[2]})

        self.write({"games": games})


class Application(tornado.web.Application):
    def __init__(self):
        handlers = [
        (r"/rest/login", LoginHandler),
        (r"/rest/register", RegisterHandler),
        (r"/rest/games", GameListHandler),
        (r"/confirm", RegisterConfirmHandler),
        (r"/websocket", GameClient),
        (r"/", tornado.web.RedirectHandler, {"url": "/index.html"}),
        (r"/(.*)", tornado.web.StaticFileHandler, dict(path=os.path.join(os.path.dirname(__file__), "../"))),

        ]

        settings = dict(debug = True,
                        autoreload = True,
                        cookie_secret = ''.join(random.choice(string.ascii_uppercase) for _ in range(128)))

        pycket_settings =  {
            'engine': 'redis',
            'storage': {
                'host': 'localhost',
                'port': 6379,
                'db_sessions': 10,
                'db_notifications': 11,
                'max_connections': 2 ** 31,
            },
            'cookies': {
                'expires_days': 120,
            },
        }
        settings.update(pycket = pycket_settings)
        tornado.web.Application.__init__(self, handlers, **settings)

if __name__ == "__main__":
    http_server = tornado.httpserver.HTTPServer(Application())
    http_server.listen(8888)
    tornado.ioloop.IOLoop.instance().start()
