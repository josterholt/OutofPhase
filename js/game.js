var UI;

var trigger_objects = {};
var sections = {};
var game;
var stage;
var map;
var speed = 100;
var PLAYERS = [];
var CURRENT_PLAYER_INDEX = 0;
var CURRENT_PLAYER;
var foo = 0;
var mobs;
var players;

var WebFontConfig = {
    active: function () {
        //game.time.events.add(Phaser.Timer.SECOND, createText, this);
    },
    google: { families: [ 'Dancing+Script::latin', 'Covered+By+Your+Grace::latin' ] }
};

var FONTS = ['Dancing Script', 'Covered By Your Grace'];

var layer;
var wall_layer;
var collide_layer;
var object_layer;
var spaceKey;
var text = null;
var soundFXs = {};
var OVERLAPPED_ITEMS = [];

var ws;
function initGame(game_token) {
    console.debug("Game: " + game_token);
    ws = new WebSocket('ws://ubuntu:8888/websocket', ['soap', 'xmpp', 'binary']);

    ws.onopen = function () {
        if (PLAYER_NUM == 1) {
            console.debug("Create game...");
            if (game_token != null) {
                request = JSON.stringify([{
                    "action": "joinGame",
                    "gameToken": game_token
                }])
            } else {
                request = JSON.stringify([{"action": "createGame"}])
            }
        } else {
            if (localStorage['game_token'] == null) {
                localStorage['game_token'] = prompt("Enter token")
            }

            if (game_token != null) {
                request = JSON.stringify([{
                    "action": "joinGame",
                    "gameToken": game_token
                }])
            }
        }
        isConnected = true;
        CLIENT.send(request)
    }

    ws.onerror = function (error) {
        console.debug('Websocket Error ' + error);
    }

    ws.onmessage = function (e) {
        if ("data" in e) {
            var responses = JSON.parse(e.data);

            for (i in responses) {
                var response = responses[i];

                var action = null;
                if (response.status != "OK") {
                    if (response.message == "Token is invalid" && PLAYER_NUM == 1) {
                        request = JSON.stringify([{"action": "createGame"}])
                        CLIENT.send(request)
                    }
                } else {

                    if ("data" in response && response.data != null && response.data != false && "action" in response.data) {
                        action = response.data.action;
                    }

                    //console.debug(action);
                    if (action == "INIT") {
                        if ("data" in response && response.data != null && response.data != false && "gameToken" in response.data) {
                            localStorage['game_token'] = response.data.gameToken;
                            prompt("Game Token", response.data.gameToken)
                        }

                        if (response.data != null && "playerToken" in response.data) {
                            localStorage['player_token'] = response.data.playerToken;
                        }

                        SERVER_STATE.status = "FRESH";
                        SERVER_STATE.data.players[0] = response.data.players[0];
                        SERVER_STATE.data.players[1] = response.data.players[1];
                        SERVER_STATE.data.mobs = response.data.mobs;
                        startGame();
                        window.setInterval(com_update, 100);
                    } else if (action == "UPDATE") {
                        if ("data" in response && response.data != null) {
                            SERVER_STATE.status = "FRESH";
                            SERVER_STATE.data.players[0] = response.data.players[0];
                            SERVER_STATE.data.players[1] = response.data.players[1];
                        }
                    } else if (action == "runTrigger") {
                        console.debug("Adding remote event");
                        REMOTE_EVENTS.push({"action": "TRIGGER", "data": response.data.data});
                    } else if (action == "updateObject") {
                        REMOTE_EVENTS.push({"action": "OBJECT", "data": response.data.data});
                    } else {
                        console.debug("Bad message, discarding")
                        console.debug(response)
                        console.debug(response.data)
                    }
                }
            }
        }
    }
}

function boot() {
    
}

function startGame() {
    game = new Phaser.Game(800, 650, Phaser.AUTO, 'main');
    game.state.add('Boot', boot);
    game.state.add('Menu', OPGame.Menu);
    game.state.add('Level1', OPGame.Level1);
    game.state.start('Level1');
}