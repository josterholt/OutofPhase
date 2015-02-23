from mobs.utils import MobEncoder
class EventMgr:
    gamePlayer = None

    def __init__(self, gamePlayer):
        self.gamePlayer = gamePlayer

    def updatePlayer(self, request):
        self.gamePlayer.game.updatePosition(self.gamePlayer.playerIndex, request.get("player"))
        return {
            "action": "UPDATE",
            "players": self.gamePlayer.game.getPlayerPositions(),
            "mobs": MobEncoder().encode(self.gamePlayer.game.mobs)
        }

    def runTrigger(self, request):
        response = {"action": "runTrigger", "data": request.get("data")}
        self.gamePlayer.broadcast(response)
        return {}

    def updateObject(self, request):
        response = {"action": "updateObject", "data": request.get("data")}
        self.gamePlayer.broadcast(response)
        return {}

    def default(self, request):
        return {}