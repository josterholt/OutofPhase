import mysql.connector
import hashlib


#connect
# db = mysql.connector.connect(user'dbuser', password='dbuser', host='localhost', database='outofphase')
# cursor = db.cursor()
#
# m = hashlib.md5()
# m.update(b"testing")
# username = "josterholt"
# password = m.hexdigest()
# cursor.execute("INSERT INTO users (username, password) VALUES(%s, %s);" % (username, password))
# db.commit()
#
# cursor.execute(("SELECT * FROM users WHERE id = %(id)s"), {"id": 1});
# for row in cursor:
#     print(row[2])
# cursor.close()
# db.close()
#
# r = redis.StrictRedis(host='localhost', port=6379, db=10)
# session_id = 1234
# ACTIVE_GAMES = {}
# CONNECTION_MGR_LOOKUP = {}