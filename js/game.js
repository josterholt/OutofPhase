var UI;
var PLAYERS = [];
var CURRENT_PLAYER_INDEX = 0;
var CURRENT_PLAYER;
var PLAYER_HITBOXES = [];
var trigger_objects = {};
var sections = {};
var game;
var stage;
var map;
var speed = 100;

var WebFontConfig = {
    active: function () {
        //game.time.events.add(Phaser.Timer.SECOND, createText, this);
    },
    google: { families: [ 'Dancing+Script::latin', 'Covered+By+Your+Grace::latin' ] }
};

var FONTS = ['Dancing Script', 'Covered By Your Grace'];

function startGame() {
    console.debug("start game");
    game = new Phaser.Game(800, 650, Phaser.AUTO, 'main', { preload: preload, create: create, update: update, render: render });
}

var layer;
var wall_layer;
var collide_layer;
var object_layer;
var object2_layer;
var groups;
var spaceKey;
var text = null;
var fx;

var CURRENT_PLAYER_HITBOX;

function preload () {
    game.load.tilemap('level1', 'tilesets_json/level1.json', null, Phaser.Tilemap.TILED_JSON);

    // Scene assets
    game.load.image('candyshop', 'images/scene/candyshop.png');
    game.load.image('candyshopwall', 'images/scene/candyshopwall_transparent.png');
    game.load.image('collide', 'images/map/collide.png');

    game.load.spritesheet('player1', 'images/characters/tremel.png', 32, 48);
    game.load.spritesheet('player2', 'images/characters/xmasgirl1.png', 32, 48);

    // Trigger image assets
    game.load.image('empty', 'images/full.png');
    game.load.image('trigger.help', 'images/triggers/letter.png');
    game.load.image('trigger.trigger1', 'images/triggers/trigger1.png');
    game.load.image('trigger.flowers1', 'images/triggers/flowers1.png');
    game.load.image('trigger.flowers2', 'images/triggers/flowers2.png');
    game.load.image('wall.top', 'images/triggers/wall_top.png');
    game.load.image('wall.left', 'images/triggers/wall_left.png');
    game.load.image('wall.right', 'images/triggers/wall_right.png');
    game.load.image('wall.bottom', 'images/triggers/wall_bottom.png');
    game.load.image('trigger.barrel', 'images/triggers/barrel.png');

    // Attack image assets
    game.load.image('attack.swipe', 'images/attack/sword_swipe.png');

    // Fonts
    game.load.script('webfont', '//ajax.googleapis.com/ajax/libs/webfont/1.4.7/webfont.js');

    // Sounds
    game.load.audio('attack1', 'sounds/attack/knife_attack1.mp3');
    game.load.audio('attack1', 'sounds/attack/knife_attack2.mp3');
}

function findObjectsByType(type, map, layer) {
    var results = [];
    map.objects[layer].forEach(function(element) {
        if(element.properties.type == type) {
            element.y -= map.tileHeight;
            results.push(element);
        }
    });
    return results;
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
}

function create () {
    game.physics.startSystem(Phaser.Physics.ARCADE);
    game.stage.backgroundColor = '#000000';
    game.stage.disableVisibilityChange = true;

    fx = game.add.audio('attack1');
    fx.allowMultiple = true;

    map = game.add.tilemap('level1');

    map.addTilesetImage('candyshop', 'candyshop');


    map.addTilesetImage('collide', 'collide');
    collide_layer = map.createLayer('collide');
    map.setCollisionBetween(400, 500, true, 'collide');

    layer1 = map.createLayer('floor');


    object_layer = map.createLayer('object');
    map.setCollisionBetween(100, 199, true, 'object');


    trigger_objects = game.add.group();
    trigger_objects.enableBody = true;

    sections = game.add.group();
    sections.enableBody = true;

    results = findObjectsByType('help', map, 'triggers');
    results.forEach(function(element) {
        createFromTiledObject(element, trigger_objects)
    }, this);

    results = findObjectsByType('wall', map, 'triggers');
    results.forEach(function(element) {
        createFromTiledObject(element, trigger_objects)
    }, this);

    results = findObjectsByType('trigger', map, 'triggers');
    results.forEach(function(element) {
        createFromTiledObject(element, trigger_objects)
    }, this);

    results = findObjectsByType('trigger.pressure', map, 'triggers');
    results.forEach(function(element) {
        createFromTiledObject(element, trigger_objects, PressureTrigger)
    }, this);

    results = findObjectsByType('trigger.object', map, 'triggers');
    results.forEach(function(element) {
        createFromTiledObject(element, trigger_objects)
    }, this);

    results = findObjectsByType('section', map, 'triggers');
    results.forEach(function(element) {
        createFromTiledObject(element, sections)
    }, this);

    /**
     * Add player
     */
    PLAYERS[0] = initPlayer(1, "player1", SERVER_STATE.data.players[0].position[0], SERVER_STATE.data.players[0].position[1]);
    PLAYER_HITBOXES[0] = initPlayerHitBox(1);

    PLAYERS[1] = initPlayer(2, "player2", SERVER_STATE.data.players[1].position[0], SERVER_STATE.data.players[1].position[1]);
    //PLAYERS[1] = initPlayer(2, "player2", 450, 450);
    PLAYER_HITBOXES[1] = initPlayerHitBox(2);

    if(CURRENT_PLAYER_INDEX == undefined) {
        CURRENT_PLAYER_INDEX = 0;
    }
    CURRENT_PLAYER = PLAYERS[CURRENT_PLAYER_INDEX];
    CURRENT_PLAYER_HITBOX = PLAYER_HITBOXES[CURRENT_PLAYER_INDEX];

    initTargetObjects(true);

    /**
     * Wall added here so it overlaps players
     */
    map.addTilesetImage('candyshopwall', 'candyshopwall');
    wall_layer = map.createLayer('wall');
    //map.setCollisionBetween(100, 199, true, 'wall');


    // Keyboard init
    this.spaceKey = game.input.keyboard.addKey(Phaser.Keyboard.SPACEBAR);
    this.tabKey = game.input.keyboard.addKey(Phaser.Keyboard.TAB);
    game.input.keyboard.addKeyCapture([Phaser.Keyboard.SPACEBAR, Phaser.Keyboard.TAB]);

    /**
     * Remaining initialization
     */
     //game.physics.enable(player1, Phaser.Physics.ARCADE);
    game.camera.follow(CURRENT_PLAYER, Phaser.Camera.FOLLOW_TOPDOWN_TIGHT);

    UI = new _ui(game);
    UI.init();
    UI.show("Use arrow keys to move, spacebar to interact, tab to change character.");
    UI.isSticky = true;
}

function initTargetObjects(initial) {
    for(i in trigger_objects.children) {
        var obj = trigger_objects.children[i];
        if("visible_condition" in obj) {
            if (obj.visible_condition == "PLAYER1" || obj.visible_condition == "PLAYER2") {
                // Hard coded hack intended to abstract
                // Player should be in region trigger is in to see change
                if (initial || game.physics.arcade.intersects(PLAYERS[1].body, sections.children[0])) {
                    if (CURRENT_PLAYER.name.toUpperCase() != obj.visible_condition.toUpperCase()) {
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

function initPlayer(player_num, player_sprite, x, y) {
    player = game.add.sprite(x, y, player_sprite);
    player.name = "player" + player_num;
    player.group = "player" + player_num;
    player.animations.add('walk_down', [0,1,2,3], true);
    player.animations.add('walk_left', [4,5,6,7], true);
    player.animations.add('walk_right', [8,9,10,11], true);
    player.animations.add('walk_up', [12,13,14,15], true);

    game.physics.enable(player, Phaser.Physics.ARCADE);
    player.body.collideWorldBounds = true;
    player.body.setSize(32, 10, 0, (player.height - 20));

    return player;
}

function initPlayerHitBox(player_num) {
    //player_hitbox = game.add.sprite(5, 100, 'empty');
    player_hitbox = game.add.sprite(0, 0);

    //var circle = game.add.graphics(0, 0);
    //circle.beginFill(0x000000);
    //circle.drawCircle(0,0,10);
    //player_hitbox.addChild(circle);

    var graphic = game.add.graphics(0, 0);
    graphic.boundsPadding = 0;
    graphic.lineStyle(2, 0xFFFFFF, 1);
    graphic.arc(0, 0, 32, 0.90, -0.90, true);
    player_hitbox.addChild(graphic);

    player_hitbox.group = "PLAYER" + player_num;
    player_hitbox.alpha = 1;
    game.physics.enable(player_hitbox, Phaser.Physics.ARCADE);
    player_hitbox.body.allowRotation = true;

    return player_hitbox;
}

function setPlayer(index) {
    CURRENT_PLAYER_INDEX = index;
    CURRENT_PLAYER = PLAYERS[CURRENT_PLAYER_INDEX];
    CURRENT_PLAYER_HITBOX = PLAYER_HITBOXES[CURRENT_PLAYER_INDEX];
    initTargetObjects();
}


var OVERLAPPED_ITEMS = [];
function update() {
    //if(this.tabKey.justUp) {
        //if(CURRENT_PLAYER_INDEX == 0) {
            //setPlayer(1);
        //} else {
            //setPlayer(0);
        //}
    //}


    if(UI.isSticky == false) {
        UI.hide();
    }

    CURRENT_PLAYER.body.velocity.x = 0;
    CURRENT_PLAYER.body.velocity.y = 0;

    processRemoteEvents();

    game.physics.arcade.collide(CURRENT_PLAYER, collide_layer);
    game.physics.arcade.collide(PLAYERS[0], PLAYERS[1]);

    game.physics.arcade.collide(CURRENT_PLAYER, trigger_objects, function (obj1, obj2) {
        return false;
    },
    function (obj1, obj2) {
        if(obj2.solid  || obj1.key == "player1" && obj2.solid == "player1" || obj1.key == "player2" && obj2.solid == "player2") {
            return true;
        }
        return false;
    });

    var overlapping = game.physics.arcade.overlap(CURRENT_PLAYER, trigger_objects, function (obj1, obj2) {
        if("condition" in obj2) {
            processTrigger(obj1, obj2);
        } else if(obj2.hasOwnProperty('callback')) {
            processTrigger(obj1, obj2);
        }
        return false;
    });

    game.physics.arcade.overlap(trigger_objects, trigger_objects, function (obj1, obj2) {
        // Make sure these aren't the same object, and it has a condition
        if(obj1.id != obj2.id && "condition" in obj2) {
            processTrigger(obj1, obj2);
        } else if(obj1.id != obj2.id && obj2.hasOwnProperty('callback')) {
            processTrigger(obj1, obj2);
        }
        return false;
    });

    updateReleaseTriggers();

    if(game.input.keyboard.isDown(Phaser.Keyboard.LEFT)) {
        CURRENT_PLAYER.body.velocity.x -= speed;
        CURRENT_PLAYER.animations.play('walk_left', 5, true);
        CURRENT_PLAYER.body.facing = Phaser.LEFT;
        UI.clearSticky();
    } else if (game.input.keyboard.isDown(Phaser.Keyboard.RIGHT)) {
        CURRENT_PLAYER.body.velocity.x += speed;
        CURRENT_PLAYER.animations.play('walk_right', 5, true);
        CURRENT_PLAYER.body.facing = Phaser.RIGHT;
        UI.clearSticky();
    } else if (game.input.keyboard.isDown(Phaser.Keyboard.UP)) {
        CURRENT_PLAYER.body.velocity.y -= speed;
        CURRENT_PLAYER.animations.play('walk_up', 5, true);
        CURRENT_PLAYER.body.facing = Phaser.UP;
        UI.clearSticky();
    } else if (game.input.keyboard.isDown(Phaser.Keyboard.DOWN)) {
        CURRENT_PLAYER.body.velocity.y += speed;
        CURRENT_PLAYER.animations.play('walk_down', 5, true);
        CURRENT_PLAYER.body.facing = Phaser.DOWN;
        UI.clearSticky();
    } else {
        CURRENT_PLAYER.animations.stop(null, 0);
    }

    if(CURRENT_PLAYER.body.immovable == true) {
        CURRENT_PLAYER.body.velocity.y = 0;
        CURRENT_PLAYER.body.velocity.x = 0;
        CURRENT_PLAYER.animations.stop(null, 0);
    }

    if(this.spaceKey.justDown) {
        CURRENT_PLAYER.body.velocity.y = 0;
        CURRENT_PLAYER.body.velocity.x = 0;
        CURRENT_PLAYER.animations.stop(null, 0);
        CURRENT_PLAYER.body.immovable = true;

        UI.clearSticky();
        if(CURRENT_PLAYER.body.facing == Phaser.RIGHT) {
            CURRENT_PLAYER_HITBOX.reset(CURRENT_PLAYER.x + (CURRENT_PLAYER.width / 2), CURRENT_PLAYER.y + (CURRENT_PLAYER_HITBOX.body.height / 2));
            CURRENT_PLAYER_HITBOX.body.facing = Phaser.RIGHT;
            CURRENT_PLAYER_HITBOX.pivot.x = 0;
            CURRENT_PLAYER_HITBOX.pivot.y = -5;
            CURRENT_PLAYER_HITBOX.body.rotation = 0;
        } else if(CURRENT_PLAYER.body.facing == Phaser.LEFT) {
            CURRENT_PLAYER_HITBOX.reset(CURRENT_PLAYER.x - (CURRENT_PLAYER_HITBOX.body.width/2), CURRENT_PLAYER.y + (CURRENT_PLAYER_HITBOX.body.height/2));
            CURRENT_PLAYER_HITBOX.pivot.x = 32;
            CURRENT_PLAYER_HITBOX.pivot.y = 5;
            CURRENT_PLAYER_HITBOX.body.rotation = 180// Math.PI;
            CURRENT_PLAYER_HITBOX.body.facing = Phaser.LEFT;
        } else if(CURRENT_PLAYER.body.facing == Phaser.DOWN) {
            CURRENT_PLAYER_HITBOX.body.facing = Phaser.DOWN;
            CURRENT_PLAYER_HITBOX.reset(CURRENT_PLAYER.body.x, CURRENT_PLAYER.body.y);
            CURRENT_PLAYER_HITBOX.pivot.x = -2;
            CURRENT_PLAYER_HITBOX.pivot.y = 15
            CURRENT_PLAYER_HITBOX.body.rotation = 90;
        } else if(CURRENT_PLAYER.body.facing == Phaser.UP) {
            CURRENT_PLAYER_HITBOX.reset(CURRENT_PLAYER.body.x, CURRENT_PLAYER.y - (CURRENT_PLAYER_HITBOX.height / 2));
            CURRENT_PLAYER_HITBOX.body.facing = Phaser.UP;
            CURRENT_PLAYER_HITBOX.pivot.x = 32;
            CURRENT_PLAYER_HITBOX.pivot.y = -15
            CURRENT_PLAYER_HITBOX.body.rotation = -90;

            //CURRENT_PLAYER_HITBOX.rotation = (3 * Math.PI) / 2;

        }

        //body1 = CURRENT_PLAYER_HITBOX.body;
        //g1 = game.add.graphics(body1.x, body1.y)
        //g1.beginFill(0xFF0000)
        //g1.drawCircle(0, 0, 5);
        //game.add.tween(g1).to({ alpha: 0 }, 3000, Phaser.Easing.Linear.None, true);
        //
        //g2 = game.add.graphics(body1.x, body1.bottom)
        //g2.beginFill(0x00FF00)
        //g2.drawCircle(0, 0, 5);
        //game.add.tween(g2).to({ alpha: 0 }, 3000, Phaser.Easing.Linear.None, true);
        //
        //g3 = game.add.graphics(body1.right, body1.y)
        //g3.beginFill(0xFF00FF)
        //g3.drawCircle(0, 0, 5);
        //game.add.tween(g3).to({ alpha: 0 }, 3000, Phaser.Easing.Linear.None, true);
        //
        //g4 = game.add.graphics(body1.right, body1.bottom)
        //g4.beginFill(0xCCCCCC)
        //g4.drawCircle(0, 0, 5);
        //game.add.tween(g4).to({ alpha: 0 }, 3000, Phaser.Easing.Linear.None, true);


        fx.play();

        CURRENT_PLAYER_HITBOX.visible = true;
        s = game.add.tween(CURRENT_PLAYER_HITBOX)
        CURRENT_PLAYER_HITBOX.alpha = 1;
        s.to({ alpha: 0 }, 500, Phaser.Easing.Linear.None, true)
        s.onComplete.add(function () {
            CURRENT_PLAYER.body.immovable = false;
        })

        //s.start();
        console.debug(CURRENT_PLAYER_HITBOX.body.x + " / " + CURRENT_PLAYER_HITBOX.body.y)



        game.physics.arcade.overlap(CURRENT_PLAYER_HITBOX, trigger_objects, function (obj1, obj2) {
            console.debug("Hit");
            processTrigger(obj1, obj2);
        });
    }

    if(CURRENT_PLAYER_INDEX == 0) {
        updateOtherPlayer(1);
    } else {
        updateOtherPlayer(0);
    }
}

function render() {

}