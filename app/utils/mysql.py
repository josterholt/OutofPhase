from settings import config
import mysql.connector

class DB:
    @staticmethod
    def fetch(sql, args = None):
        db = mysql.connector.connect(user=config.db.get("user"), password=config.db.get("password"), host=config.db.get("host"), database=config.db.get("database"))
        cursor = db.cursor()
        cursor.execute(sql, args);
        rows = cursor.fetchall()
        cursor.close()
        db.close()

        return rows

    @staticmethod
    def fetchOne(sql, args = None):
        db = mysql.connector.connect(user=config.db.get("user"), password=config.db.get("password"), host=config.db.get("host"), database=config.db.get("database"))
        cursor = db.cursor()
        cursor.execute(sql, args);
        row = cursor.fetchone()
        cursor.close()
        db.close()
        return row

    @staticmethod
    def fetchAll(sql, args = None):
        return DB.fetch(sql, args)

    @staticmethod
    def execute(sql, args = None):
        db = mysql.connector.connect(user=config.db.get("user"), password=config.db.get("password"), host=config.db.get("host"), database=config.db.get("database"))
        cursor = db.cursor()
        result = cursor.execute(sql, args);
        db.commit()
        cursor.close()
        db.close()