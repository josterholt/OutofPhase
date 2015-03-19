/**
 * Menu setup
 */
OPGame.Menu = function (game) {

}

OPGame.Menu.prototype = {
    preload: function () {

    },
    create: function () {

    },
    loadGame: function () {
      console.debug("Load game");
    },
    update: function () {
        console.debug("Update");
    }
}

/**
 * Level one setup
 */
OPGame.Level1 = function (game) {

}


OPGame.Level1.prototype = {
    preload: function () {
        game.load.tilemap('level1', 'tilesets_json/level1.json', null, Phaser.Tilemap.TILED_JSON);

        // Scene assets
        game.load.image('candyshop', 'images/scene/candyshop.png');
        game.load.image('candyshopwall', 'images/scene/candyshopwall_transparent.png');
        game.load.image('collide', 'images/map/collide.png');

        game.load.spritesheet('player1', 'images/characters/tremel.png', 32, 48);
        game.load.spritesheet('player2', 'images/characters/xmasgirl1.png', 32, 48);

        game.load.spritesheet('mob.guardian', 'images/mobs/Elemental_Earth/$Monster_Elemental_Earth_FullFrame.png', 100, 100);

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
        game.load.audio('attack2', 'sounds/attack/knife_attack2.mp3');
        game.load.audio('hit1', 'sounds/attack/attack_hit1.mp3');
        game.load.audio('hit2', 'sounds/attack/attack_hit2.mp3');


    },
    create: function () {
        game.physics.startSystem(Phaser.Physics.ARCADE);
        game.stage.backgroundColor = '#000000';
        game.stage.disableVisibilityChange = true;


        sound = game.add.audio('attack1');
        sound.allowMultiple = true;
        soundFXs['attack1'] = sound;

        sound = game.add.audio('attack2');
        sound.allowMultiple = true;
        soundFXs['attack2'] = sound;

        sound = game.add.audio('hit1');
        sound.allowMultiple = true;
        soundFXs['hit1'] = sound;

        sound = game.add.audio('hit2');
        sound.allowMultiple = true;
        soundFXs['hit2'] = sound;

        map = game.add.tilemap('level1');
        //map.resizeWorld();
        game.world.setBounds(0, 0, map.width * map.tileWidth, map.height * map.tileHeight);

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

        PLAYERS[0] = new Player(1, "player1", SERVER_STATE.data.players[0].position[0], SERVER_STATE.data.players[0].position[1]);
        PLAYERS[1] = new Player(2, "player2", SERVER_STATE.data.players[1].position[0], SERVER_STATE.data.players[1].position[1]);

        mobs = game.add.group();
        for (var i in SERVER_STATE.data.mobs) {
            var mob = SERVER_STATE.data.mobs[i];
            MOB = new Guardian(mob.x, mob.y, "mob.guardian");
            game.add.existing(MOB);
            mobs.add(MOB);
        }

        if (CURRENT_PLAYER_INDEX == undefined) {
            CURRENT_PLAYER_INDEX = 0;
        }
        CURRENT_PLAYER = PLAYERS[CURRENT_PLAYER_INDEX];

        initTargetObjects(true);

        /**
         * Add player
         */
        game.add.existing(PLAYERS[0]);
        game.add.existing(PLAYERS[1]);
        players = game.add.group();
        players.add(PLAYERS[0]);
        players.add(PLAYERS[1]);


        /**
         * Wall added here so it overlaps players
         */
        map.addTilesetImage('candyshopwall', 'candyshopwall');
        wall_layer = map.createLayer('wall');

        /**
         * Remaining initialization
         */
        game.camera.follow(CURRENT_PLAYER, Phaser.Camera.FOLLOW_TOPDOWN_TIGHT);

        UI = new _ui(game);
        UI.init();
        UI.show("Use arrow keys to move, and spacebar to interact.");
        UI.isSticky = true;
    },
    update: function () {
        if (UI.isSticky == false) {
            UI.hide();
        }

        processRemoteEvents();

        game.physics.arcade.collide(PLAYERS[0], PLAYERS[1]);


        game.physics.arcade.overlap(trigger_objects, trigger_objects, function (obj1, obj2) {
            // Make sure these aren't the same object, and it has a condition
            if (obj1.id != obj2.id && "condition" in obj2) {
                processTrigger(obj1, obj2);
            } else if (obj1.id != obj2.id && obj2.hasOwnProperty('callback')) {
                processTrigger(obj1, obj2);
            }
            return false;
        });

        updateReleaseTriggers();


    },
    render: function () {

    }
}

/**
 *  Western Kingdom Level
 */
OPGame.WesternKingdom = function (game) {

}


OPGame.WesternKingdom.prototype = {
    preload: function () {
        game.load.tilemap('western_kingdom', 'tilesets_json/western_kingdom.json', null, Phaser.Tilemap.TILED_JSON);

        // Scene assets
        game.load.image('celianna_TileB1', 'images/scene/outside/celianna_TileB1.png');
        //game.load.image('Dungeon', 'images/scene/B-E_HF1R_Dungeon_1.png');
        game.load.image('GermaniaA2', 'images/scene/GermaniaA2.png');
        game.load.image('GermaniaA5', 'images/scene/GermaniaA5.png');
        game.load.image('GermaniaA3', 'images/scene/GermaniaA3.png');
        game.load.image('celianna_TileA1', 'images/scene/outside/celianna_TileA1.png');
        game.load.image('celianna_TileA2', 'images/scene/town/celianna_TileA2.png');
        game.load.image('TileC', 'images/scene/town/TileC.png');
        game.load.image('medievalhouses_1', 'images/scene/town/medievalhouses_1.png');
        game.load.image('medievalhouses_2', 'images/scene/town/medievalhouses_2.png');
        game.load.image('AT-A2-CliffVS01-GroundTiles', 'images/scene/outside/AT-A2-CliffVS01-GroundTiles.png')
        

        game.load.spritesheet('gallery_501_35_8432', 'images/scene/objects/gallery_501_35_8432.png', 35, 70);

        //game.load.spritesheet('player1', 'images/characters/Female_Elf_7/$Elf_Female_7_HF1R_FullFrame.png', 70, 70);
        game.load.spritesheet('player1', 'images/characters/xmasgirl1.png', 32, 48);
        game.load.spritesheet('player2', 'images/characters/xmasgirl1.png', 32, 48);

        //game.load.spritesheet('mob.guardian', 'images/mobs/Elemental_Earth/$Monster_Elemental_Earth_FullFrame.png', 100, 100);
        game.load.spritesheet('mouse', 'images/mobs/creatures/mouse.png', 16, 16);

        // Trigger image assets
        game.load.image('empty', 'images/full.png');
        game.load.image('trigger.help', 'images/triggers/letter.png');
        game.load.image('trigger.trigger1', 'images/triggers/trigger1.png');
        game.load.image('trigger.flowers1', 'images/triggers/flowers1.png');
        game.load.image('trigger.flowers2', 'images/triggers/flowers2.png');

        // Attack image assets
        game.load.image('attack.swipe', 'images/attack/sword_swipe.png');

        // Fonts
        game.load.script('webfont', '//ajax.googleapis.com/ajax/libs/webfont/1.4.7/webfont.js');
        game.load.json('mob_script', 'js/scripts/western_kingdom.json');
        

        // Sounds
        game.load.audio('attack1', 'sounds/attack/knife_attack1.mp3');
        game.load.audio('attack2', 'sounds/attack/knife_attack2.mp3');
        game.load.audio('hit1', 'sounds/attack/attack_hit1.mp3');
        game.load.audio('hit2', 'sounds/attack/attack_hit2.mp3');


    },
    create: function () {
        game.physics.startSystem(Phaser.Physics.ARCADE);
        game.stage.backgroundColor = '#000000';
        game.stage.disableVisibilityChange = true;


        sound = game.add.audio('attack1');
        sound.allowMultiple = true;
        soundFXs['attack1'] = sound;

        sound = game.add.audio('attack2');
        sound.allowMultiple = true;
        soundFXs['attack2'] = sound;

        sound = game.add.audio('hit1');
        sound.allowMultiple = true;
        soundFXs['hit1'] = sound;

        sound = game.add.audio('hit2');
        sound.allowMultiple = true;
        soundFXs['hit2'] = sound;

        map = game.add.tilemap('western_kingdom');
        //map.resizeWorld();
        game.world.setBounds(0, 0, map.width * map.tileWidth, map.height * map.tileHeight);

        map.addTilesetImage('GermaniaA2', 'GermaniaA2');    
        map.addTilesetImage('GermaniaA5', 'GermaniaA5');
        map.addTilesetImage('GermaniaA3', 'GermaniaA3');
        map.addTilesetImage('GermaniaA2', 'GermaniaA2');
        map.addTilesetImage('celianna_TileA1', 'celianna_TileA1');
        map.addTilesetImage('celianna_TileA2', 'celianna_TileA2');
        map.addTilesetImage('TileC', 'TileC');
        map.addTilesetImage('medievalhouses_1', 'medievalhouses_1');
        map.addTilesetImage('medievalhouses_2', 'medievalhouses_2');
        map.addTilesetImage('celianna_TileB1', 'celianna_TileB1');
        map.addTilesetImage('gallery_501_35_8432', 'gallery_501_35_8432');
        map.addTilesetImage('AT-A2-CliffVS01-GroundTiles', 'AT-A2-CliffVS01-GroundTiles');
        
        //map.addTilesetImage('dungeon1', 'dungeon1');

        //map.addTilesetImage('collide', 'collide');
        //collide_layer = map.createLayer('collide');
        //map.setCollisionBetween(400, 500, true, 'collide');

        layer1 = map.createLayer('floor');
        //border_layer = map.createLayer('border');
        //map.setCollisionBetween(0, 100, true, 'border');
        
        map.createLayer('town_floor');
        map.createLayer('buildings');
        //map.createLayer('orbs');
        
        //OPGame.terrain = game.add.group();
        OPGame.terrain = []
        OPGame.terrain.push(map.createLayer('trees'))
        map.createLayer('houses')
        map.createLayer('town')
        map.createLayer('path')
        map.createLayer('water')
        //OPGame.terrain.push(map.createLayer('forrest1_a'));
        //OPGame.terrain.push(map.createLayer('forrest1_b'));
        
        var  orbs = game.add.group();
        if(results = findObjectsByType('orb', map, 'orb')) {
            results.forEach(function(element) {
                createFromTiledObject(element, orbs)
            }, this);
        }
        


        //object_layer = map.createLayer('object');
        //map.setCollisionBetween(100, 199, true, 'object');

        //trigger_objects = game.add.group();
        //trigger_objects.enableBody = true;

        //sections = game.add.group();
        //sections.enableBody = true;
                
        OPGame.mobs = game.add.group();
        mouse = new Mouse(1609, 2700, 'mouse');
        mouse.attachScript(this.cache.getJSON('mob_script')['mouse'][0]);
        OPGame.mobs.add(mouse);

        PLAYERS[0] = new Player(1, "player1", SERVER_STATE.data.players[0].position[0], SERVER_STATE.data.players[0].position[1]);
        PLAYERS[1] = new Player(2, "player2", SERVER_STATE.data.players[1].position[0], SERVER_STATE.data.players[1].position[1]);

        //mobs = game.add.group();
//        for (var i in SERVER_STATE.data.mobs) {
//            var mob = SERVER_STATE.data.mobs[i];
//            MOB = new Guardian(mob.x, mob.y, "mob.guardian");
//            game.add.existing(MOB);
//            mobs.add(MOB);
//        }

        if (CURRENT_PLAYER_INDEX == undefined) {
            CURRENT_PLAYER_INDEX = 0;
        }
        CURRENT_PLAYER = PLAYERS[CURRENT_PLAYER_INDEX];

        initTargetObjects(true);

        /**
         * Add player
         */
        game.add.existing(PLAYERS[0]);
        game.add.existing(PLAYERS[1]);
        players = game.add.group();
        players.add(PLAYERS[0]);
        players.add(PLAYERS[1]);



        /**
         * Remaining initialization
         */
        game.camera.follow(CURRENT_PLAYER, Phaser.Camera.FOLLOW_TOPDOWN_TIGHT);

        UI = new _ui(game);
        UI.init();
        UI.show("Use arrow keys to move, and spacebar to interact.");
        UI.isSticky = true;
    },
    update: function () {
        if (UI.isSticky == false) {
            UI.hide();
        }

        processRemoteEvents();

        game.physics.arcade.collide(PLAYERS[0], PLAYERS[1]);
        
        game.physics.arcade.collide(PLAYERS[0], OPGame.terrain[0]);
        game.physics.arcade.collide(PLAYERS[0], OPGame.terrain[1]);
        game.physics.arcade.collide(PLAYERS[1], OPGame.terrain[0]);
        game.physics.arcade.collide(PLAYERS[1], OPGame.terrain[1]);


        game.physics.arcade.overlap(trigger_objects, trigger_objects, function (obj1, obj2) {
            // Make sure these aren't the same object, and it has a condition
            if (obj1.id != obj2.id && "condition" in obj2) {
                processTrigger(obj1, obj2);
            } else if (obj1.id != obj2.id && obj2.hasOwnProperty('callback')) {
                processTrigger(obj1, obj2);
            }
            return false;
        });

        updateReleaseTriggers();


    },
    render: function () {

    }
}
