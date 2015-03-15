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

function processRemoteEvents() {
    if(REMOTE_EVENTS.length > 0) {
        console.debug("Running remote events");
        console.debug(REMOTE_EVENTS);

        for (var i in REMOTE_EVENTS) {
            if(REMOTE_EVENTS[i].action == "TRIGGER") {
                runTrigger(REMOTE_EVENTS[i].data.name, REMOTE_EVENTS[i].data.object1, REMOTE_EVENTS[i].data.object2, true);
            } else if(REMOTE_EVENTS[i].action == "OBJECT") {
                var data = REMOTE_EVENTS[i].data;
                for(var i in trigger_objects.children) {
                    if(trigger_objects.children[i].id == data.id) {
                        var target = trigger_objects.children[i];
                        var update = data;
                        target.body.x = update.x;
                        target.body.y = update.y;
                    }
                }

            } else {
                console.debug("Unknown remote event");
            }
        }
        REMOTE_EVENTS = []
    }
}


var OBJECT_UNIQUE_ID = 0;
function createFromTiledObject(element, group, sprite_class) {
    var sprite;
    if(sprite_class) {
        sprite = new sprite_class(game, element.x, element.y, element.properties.sprite);
        game.physics.enable(sprite, Phaser.Physics.ARCADE);
        group.add(sprite);

    } else {
        sprite = group.create(element.x, element.y, element.properties.sprite);
    }


    if("pushable" in element.properties && element.properties.pushable == "true") {
        sprite.body.immovable = false;
    } else {
        sprite.body.immovable = true;
    }

    sprite['id'] = OBJECT_UNIQUE_ID++;
    sprite.body['id'] = sprite['id'];

    Object.keys(element.properties).forEach(function(key) {
        if(element.properties[key] == "true") {
            value = true;
        } else if(element.properties[key] == "false") {
            value = false;
        } else {
            value = element.properties[key];
        }
        sprite[key] = value;
    })

    sprite.body.drag.x = 2000;
    sprite.body.drag.y = 2000;
    if(sprite.sprite == 'trigger.barrel') {

        sprite.update = function () {

        }
    }
}

function findObjectsByType(type, map, layer) {
    var results = [];
    if(!(layer in map.objects)) {
        return false;    
    }
    
    map.objects[layer].forEach(function(element) {
        if(element.properties.type == type) {
            element.y -= map.tileHeight;
            results.push(element);
        }
    });
    return results;
}

function initTargetObjects(initial) {
    if(results = findObjectsByType('help', map, 'triggers')) {
        results.forEach(function(element) {
            createFromTiledObject(element, trigger_objects)
        }, this);
    }

    if(results = findObjectsByType('wall', map, 'triggers')) {
        results.forEach(function(element) {
            createFromTiledObject(element, trigger_objects)
        }, this);
    }

    if(results = findObjectsByType('trigger', map, 'triggers')) {
        results.forEach(function(element) {
            createFromTiledObject(element, trigger_objects)
        }, this);
    }

    if(results = findObjectsByType('trigger.pressure', map, 'triggers')) {
        results.forEach(function(element) {
            createFromTiledObject(element, trigger_objects, PressureTrigger)
        }, this);
    }

    if(results = findObjectsByType('trigger.object', map, 'triggers')) {
        results.forEach(function(element) {
            createFromTiledObject(element, trigger_objects)
        }, this);
    }

    if(results = findObjectsByType('section', map, 'triggers')) {
        results.forEach(function(element) {
            createFromTiledObject(element, sections)
        }, this);
    }

    for(i in trigger_objects.children) {
        var obj = trigger_objects.children[i];
        if("visible_condition" in obj) {
            if (obj.visible_condition == "PLAYER1" || obj.visible_condition == "PLAYER2") {
                // Hard coded hack intended to abstract
                // Player should be in region trigger is in to see change
                if (initial || game.physics.arcade.intersects(PLAYERS[1].body, sections.children[0])) {
                    var player = PLAYERS[CURRENT_PLAYER_INDEX];
                    if (player.name.toUpperCase() != obj.visible_condition.toUpperCase()) {
                        obj.visible = false;
                    } else {
                        obj.visible = true;
                    }
                }
            } else if (obj.visible == "FALSE") {
                obj.visible = false;
            }
        }
    }
}

function updateOtherPlayer() {

}