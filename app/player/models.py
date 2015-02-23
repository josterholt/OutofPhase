import json
from events.manager import EventMgr


class GamePlayer:
    def __init__(self, connection, game, player_index, user_id, player_token):
        self.connection = connection
        self.userID = user_id
        self.game = game
        self.eventMgr = EventMgr(self)
        self.playerIndex = player_index
        self.token = player_token
        print("Player Index: " + str(self.playerIndex))

    def getToken(self):
        return self.token

    def broadcast(self, data):
        message = json.dumps([{"status": "OK", "data": data }])
        for player in self.game.gamePlayers:
            if player.playerIndex != self.playerIndex:
                try:
                    player.connection.write_message(message)
                except:
                    pass