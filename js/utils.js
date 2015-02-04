_ui = function (game) {
    this.game = game;
    this.self = this;
    this.message;
    this.font_indx = 0;
    this.dialogue_height = 100;
    this.text_padding = 10;
    this.isSticky = false;
    this.active = false;

    this.init = function () {
        graphics = this.game.add.graphics(0,0);
        this.graphics = graphics;
        this.graphics.visible = false;
        this.graphics.beginFill(0x000000);
        this.graphics.drawRect(0, (game.stage.height - this.dialogue_height), game.stage.width, this.dialogue_height);
        this.graphics.endFill();

        this.message = this.game.add.text((graphics.getBounds().x + this.text_padding), (graphics.getBounds().y + this.text_padding), "Placeholder");
        this.message.visible = false;

        this.message.font = FONTS[this.font_indx];
        this.message.fontSize = 28;
        this.message.fill = "white";
    };

    this.setText = function (text) {
        this.message.text = text;
    }

    this.setFont = function (indx) {
        this.font_indx = indx;
    };

    this.show = function (text) {
        if(text != null) {
            this.setText(text);
        }
        this.graphics.visible = true;
        this.message.visible = true;
        this.active = true;
    };

    this.hide = function () {
        this.graphics.visible = false;
        this.message.visible = false;
        this.active = false;
    }

    this.clearSticky = function () {
        this.isSticky = false;
    }
}

function getRandomInt(min, max) {
    return Math.floor(Math.random() * (max - min)) + min;
}

function updateOtherPlayer(player_indx) {
    if(player_indx in SERVER_STATE.data.players && SERVER_STATE.status == "FRESH") {
        PLAYERS[player_indx].x = SERVER_STATE.data.players[player_indx].position[0];
        PLAYERS[player_indx].y = SERVER_STATE.data.players[player_indx].position[1];
        PLAYERS[player_indx].body.velocity.x = SERVER_STATE.data.players[player_indx].velocity[0];
        PLAYERS[player_indx].body.velocity.y = SERVER_STATE.data.players[player_indx].velocity[1];
        PLAYERS[player_indx].body.facing = SERVER_STATE.data.players[player_indx].facing;

        var is_moving = !(PLAYERS[player_indx].body.velocity.x == 0 && PLAYERS[player_indx].body.velocity.y == 0);
        if(is_moving) {
            if(PLAYERS[player_indx].body.facing == Phaser.LEFT) {
                PLAYERS[player_indx].animations.play('walk_left', 5, true);
            } else if(PLAYERS[player_indx].body.facing == Phaser.RIGHT) {
                PLAYERS[player_indx].animations.play('walk_right', 5, true);
            } else if(PLAYERS[player_indx].body.facing == Phaser.UP) {
                PLAYERS[player_indx].animations.play('walk_up', 5, true);
            } else if(PLAYERS[player_indx].body.facing == Phaser.DOWN) {
                PLAYERS[player_indx].animations.play('walk_down', 5, true);
            }
        }

        if(!is_moving) {
            PLAYERS[player_indx].animations.stop(null, 0);
        }
        SERVER_STATE.status = "OLD";
    }
}

function processRemoteEvents() {
    if(REMOTE_EVENTS.length > 0) {
        console.debug("Running remote events");
        console.debug(REMOTE_EVENTS);
        for (var i in REMOTE_EVENTS) {
            runTrigger(REMOTE_EVENTS[i].name, REMOTE_EVENTS[i].object1, REMOTE_EVENTS[i].object2, true);
        }
        REMOTE_EVENTS = []
    }
}

var Client = function () {
    this.triggerQueue = {}
    this.messageQueue = [];
    // Add trigger to queue. This will be sent next update
    this.queueTrigger = function (name, obj1, obj2) {
        console.debug("Queueing trigger: " + name)
        var data = {};
        data['name'] = name;

        // Extract needed info from objects
        data['object1'] = {
            "target": obj1.target,
            "group": obj1.group
        }

        data['object2'] = {
            "target": obj2.target,
            "group": obj2.group
        }
        this.triggerQueue[obj1.id + obj2.id] = {"action": "runTrigger", "data": data };
    }

    this.queueRequest = function (request) {
        this.messageQueue.push(request);
    }

    this.sendQueueMessages = function () {
        var finalQueue = [];
        for(var i in this.messageQueue) {
            finalQueue.push(this.messageQueue[i]);
        }

        for(var i in this.triggerQueue) {
            finalQueue.push(this.triggerQueue[i]);
        }

        if(finalQueue.length > 0) {
            this.send(finalQueue);
        }

        this.messageQueue = [];
        this.triggerQueue = {};
    }

    this.send = function (data) {
        if(typeof(data) != "string") {
            var requests = JSON.stringify(data);
        } else {
            var requests = data;
        }

        ws.send(requests)
    }
}