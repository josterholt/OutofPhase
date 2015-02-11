function Player(player_num, player_sprite, x, y) {
    Phaser.Sprite.call(this, game, x, y, player_sprite)

    this.playerIndex = player_num - 1;
    this.name = "player" + player_num;
    this.group = "player" + player_num;
    this.animations.add('walk_down', [0,1,2,3], true);
    this.animations.add('walk_left', [4,5,6,7], true);
    this.animations.add('walk_right', [8,9,10,11], true);
    this.animations.add('walk_up', [12,13,14,15], true);

    game.physics.enable(this, Phaser.Physics.ARCADE);
    this.body.collideWorldBounds = true;
    this.body.setSize(32, 10, 0, (this.height - 20));

    //PLAYERS[player_num - 1] = this;
    this.hitbox = this.initPlayerHitBox(player_num);

    // Keyboard init
    this.spaceKey = game.input.keyboard.addKey(Phaser.Keyboard.SPACEBAR);
    this.tabKey = game.input.keyboard.addKey(Phaser.Keyboard.TAB);
    game.input.keyboard.addKeyCapture([Phaser.Keyboard.SPACEBAR, Phaser.Keyboard.TAB]);
}

Player.prototype = Object.create(Phaser.Sprite.prototype);
Player.prototype.constructor = Player;

Player.prototype.update = function () {
    if(this.playerIndex == CURRENT_PLAYER_INDEX) {
        this.body.velocity.x = 0;
        this.body.velocity.y = 0;

        if (game.input.keyboard.isDown(Phaser.Keyboard.LEFT)) {
            this.body.velocity.x -= speed;
            this.animations.play('walk_left', 5, true);
            this.body.facing = Phaser.LEFT;
            UI.clearSticky();
        } else if (game.input.keyboard.isDown(Phaser.Keyboard.RIGHT)) {
            this.body.velocity.x += speed;
            this.animations.play('walk_right', 5, true);
            this.body.facing = Phaser.RIGHT;
            UI.clearSticky();
        } else if (game.input.keyboard.isDown(Phaser.Keyboard.UP)) {
            this.body.velocity.y -= speed;
            this.animations.play('walk_up', 5, true);
            this.body.facing = Phaser.UP;
            UI.clearSticky();
        } else if (game.input.keyboard.isDown(Phaser.Keyboard.DOWN)) {
            this.body.velocity.y += speed;
            this.animations.play('walk_down', 5, true);
            this.body.facing = Phaser.DOWN;
            UI.clearSticky();
        } else {
            this.animations.stop(null, 0);
        }

        if(this.body.immovable == true) {
            this.body.velocity.y = 0;
            this.body.velocity.x = 0;
            this.animations.stop(null, 0);
        }

        if(this.spaceKey.justDown) {
            this.body.velocity.y = 0;
            this.body.velocity.x = 0;
            this.animations.stop(null, 0);


            UI.clearSticky();
            if (this.body.facing == Phaser.RIGHT) {
                this.hitbox.reset(this.x + (this.width / 2), this.y + (this.hitbox.body.height / 2));
                this.hitbox.body.facing = Phaser.RIGHT;
                this.hitbox.pivot.x = 0;
                this.hitbox.pivot.y = -5;
                this.hitbox.body.rotation = 0;
            } else if (this.body.facing == Phaser.LEFT) {
                this.hitbox.reset(this.x - (this.hitbox.body.width / 2), this.y + (this.hitbox.body.height / 2));
                this.hitbox.pivot.x = 32;
                this.hitbox.pivot.y = 5;
                this.hitbox.body.rotation = 180// Math.PI;
                this.hitbox.body.facing = Phaser.LEFT;
            } else if (this.body.facing == Phaser.DOWN) {
                this.hitbox.body.facing = Phaser.DOWN;
                this.hitbox.reset(this.body.x, this.body.y);
                this.hitbox.pivot.x = -2;
                this.hitbox.pivot.y = 15
                this.hitbox.body.rotation = 90;
            } else if (this.body.facing == Phaser.UP) {
                this.hitbox.reset(this.body.x, this.y - (this.hitbox.height / 2));
                this.hitbox.body.facing = Phaser.UP;
                this.hitbox.pivot.x = 32;
                this.hitbox.pivot.y = -15
                this.hitbox.body.rotation = -90;
            }

            //fx.play();
            // this.body.immovable = true;
            //this.hitbox.visible = true;
            //s = game.add.tween(this.hitbox)
            //this.hitbox.alpha = 1;
            //s.to({ alpha: 0 }, 500, Phaser.Easing.Linear.None, true)
            //s.onComplete.add(function () {
            //    this.body.immovable = false;
            //}, this);
            //
            //game.physics.arcade.overlap(this.hitbox, trigger_objects, function (obj1, obj2) {
            //    console.debug("Hit");
            //    processTrigger(obj1, obj2);
            //});

            probe(this)
        }
    } else {
        var player_indx = this.playerIndex;
        if(player_indx in SERVER_STATE.data.players && SERVER_STATE.status == "FRESH") {
            PLAYERS[player_indx].x = SERVER_STATE.data.players[player_indx].position[0];
            PLAYERS[player_indx].y = SERVER_STATE.data.players[player_indx].position[1];
            PLAYERS[player_indx].body.velocity.x = SERVER_STATE.data.players[player_indx].velocity[0];
            PLAYERS[player_indx].body.velocity.y = SERVER_STATE.data.players[player_indx].velocity[1];
            PLAYERS[player_indx].body.facing = SERVER_STATE.data.players[player_indx].facing;

            PLAYERS[player_indx].isMoving = !(PLAYERS[player_indx].body.velocity.x == 0 && PLAYERS[player_indx].body.velocity.y == 0);
            if(PLAYERS[player_indx].isMoving) {
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

            if(!PLAYERS[player_indx].isMoving) {
                PLAYERS[player_indx].animations.stop(null, 0);
            }
            SERVER_STATE.status = "OLD";
        } else if( player_indx in SERVER_STATE.data.players && SERVER_STATE.status == "OLD") {
            //this.body.velocity.x = SERVER_STATE.data.players[player_indx].velocity[0];
            //this.body.velocity.y = SERVER_STATE.data.players[player_indx].velocity[1];
        }
    }

    game.physics.arcade.collide(this, trigger_objects, function (obj1, obj2) {
            console.debug(obj2.body.x + "/" + obj2.body.y);
            if(this.playerIndex == CURRENT_PLAYER_INDEX)
            CLIENT.queueObjectEvent(obj2);
            return true;
        },
        function (obj1, obj2) {
            if(obj2.solid  || obj1.key == "player1" && obj2.solid == "player1" || obj1.key == "player2" && obj2.solid == "player2") {
                return true;
            }
            return false;
        }, this);

    game.physics.arcade.collide(this, collide_layer);

    var overlapping = game.physics.arcade.overlap(this, trigger_objects, function (obj1, obj2) {
        if("condition" in obj2) {
            processTrigger(obj1, obj2);
        } else if(obj2.hasOwnProperty('callback')) {
            processTrigger(obj1, obj2);
        }
        return false;
    });

}

Player.prototype.initPlayerHitBox = function (player_num) {
    player_hitbox = game.add.sprite(0, 0);

    var graphic = game.add.graphics(0, 0);
    graphic.boundsPadding = 0;
    graphic.lineStyle(2, 0xFFFFFF, 1);
    graphic.arc(0, 0, 32, 0.90, -0.90, true);
    player_hitbox.addChild(graphic);

    player_hitbox.group = "PLAYER" + player_num;
    player_hitbox.alpha = 0;
    game.physics.enable(player_hitbox, Phaser.Physics.ARCADE);
    player_hitbox.body.allowRotation = true;

    return player_hitbox;
}

Player.prototype.setPlayer = function (index) {
    CURRENT_PLAYER_INDEX = index;
    CURRENT_PLAYER = PLAYERS[CURRENT_PLAYER_INDEX];
    //this.hitbox = PLAYER_HITBOXES[CURRENT_PLAYER_INDEX];
    initTargetObjects();
}