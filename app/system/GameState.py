import json
from mobs.models import Mob
from globals import ACTIVE_GAMES
from utils.mysql import DB


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

        # @todo: GamePlayers and player should be merged
        self.gamePlayers = []
        self.players = [{"token": None, "position": [0,0], "velocity": [0,0], "facing": 0}, {"token": None, "position": [150, 150], "velocity": [0,0], "facing": 0}]
        self.mobs = []

        json_data = open('/var/www/outofphase/tilesets_json/level1.json')
        data = json.load(json_data)
        tile_width = data.get("tilewidth")
        for layer in data.get("layers"):
            if layer.get("name") == "markers":
                marker_layer = layer

        for object in marker_layer.get("objects"):
            if object.get("properties").get("type") == "spawn.player":
                player_index = int(object.get("properties").get("player")) - 1
                self.players[player_index]["position"] = [object.get("x"), object.get("y")]
            elif object.get("properties").get("type") == "spawn.mob":
                self.mobs.append(Mob(object.get("x"), object.get("y"), object.get("properties").get("class")))

        DB.execute("INSERT INTO gameinstances (token) VALUES(%(token)s);", {"token": str(game_token)})


    @staticmethod
    def getGameByToken(token):
        gameID = str(token)
        if gameID not in ACTIVE_GAMES:
            return None
        else:
            return ACTIVE_GAMES[gameID]

    def addPlayer(self, player_index, player):
        self.gamePlayers.insert(player_index, player)
        if player_index == 0:
            DB.execute("UPDATE gameinstances SET user1 = %s WHERE token = %s", (player.userID, str(self.token)))
        else:
            DB.execute("UPDATE gameinstances SET user2 = %s WHERE token = %s", (player.userID, str(self.token)))

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