function Guardian(x, y, sprite_name) {
    //this.imagePath = "images/mobs/Elemental_Earth/$Monster_Elemental_Earth.png"

    Phaser.Sprite.call(this, game, x, y, sprite_name)

    //this.name = "player" + player_num;
    //this.group = "player" + player_num;
    this.speed = 100;
    this.solid = true;
    this.stunned = false;
    this.animations.add('walk_down', [0,1,2,3,4,5,6,7], true);
    this.animations.add('walk_left', [8,9,10,11,12,13,14,15], true);
    this.animations.add('walk_right', [16,17,18,19,20,21,22,23], true);
    this.animations.add('walk_up', [24, 25, 26, 27, 28,29, 30,21, 32], true);

    game.physics.enable(this, Phaser.Physics.ARCADE);
    this.body.facing = Phaser.RIGHT;
    this.body.collideWorldBounds = true;
    this.body.setSize(57, 77, 18, 5)
    this.body.maxVelocity.x = 100;
    this.body.maxVelocity.y = 100;
    this.body.drag.x = 2000;
    this.body.drag.y = 2000;


}
Guardian.prototype = Object.create(Phaser.Sprite.prototype);
Guardian.prototype.constructor = Guardian;

Guardian.prototype.update = function () {
    if(this.body.facing == Phaser.RIGHT) {
        this.body.setSize(35, 77, 25, 5)
        this.body.velocity.x += this.speed;
        this.animations.play('walk_right', 5, true);
    } else if(this.body.facing == Phaser.LEFT) {
        this.body.setSize(35, 77, 35, 5)
        this.body.velocity.x -= this.speed;
        this.animations.play('walk_left', 5, true);
    } else if(this.body.facing == Phaser.UP) {
        this.body.setSize(57, 77, 18, 5)
        this.body.velocity.y -= this.speed;
        this.animations.play('walk_up', 5, true);
    } else if(this.body.facing == Phaser.DOWN) {
        this.body.setSize(57, 77, 18, 5)
        this.body.velocity.y += this.speed;
        this.animations.play('walk_down', 5, true);
    }

    if(this.stunned == true) {
        this.body.velocity.x = 0;
        this.body.velocity.y = 0;
        this.animations.paused = true;
    }

    game.physics.arcade.collide(this, collide_layer, function () {
        if(this.body.facing == Phaser.RIGHT) {
            this.body.facing = Phaser.LEFT;
        } else if(this.body.facing == Phaser.LEFT) {
            this.body.facing = Phaser.RIGHT;
        } else if(this.body.facing == Phaser.UP) {
            this.body.facing = Phaser.DOWN;
        } else if(this.body.facing == Phaser.DOWN) {
            this.body.facing = Phaser.UP;
        }
    }, null, this);

    //body = this.body;
    //g1 = game.add.graphics(body.x, body.y)
    //g1.beginFill(0xFF0000)
    //g1.drawCircle(0, 0, 5);
    //game.add.tween(g1).to({ alpha: 0 }, 500, Phaser.Easing.Linear.None, true);
    //
    //g2 = game.add.graphics(body.x, body.bottom)
    //g2.beginFill(0x00FF00)
    //g2.drawCircle(0, 0, 5);
    //game.add.tween(g2).to({ alpha: 0 }, 500, Phaser.Easing.Linear.None, true);
    //
    //g3 = game.add.graphics(body.right, body.y)
    //g3.beginFill(0xFF00FF)
    //g3.drawCircle(0, 0, 5);
    //game.add.tween(g3).to({ alpha: 0 }, 500, Phaser.Easing.Linear.None, true);
    //
    //g4 = game.add.graphics(body.right, body.bottom)
    //g4.beginFill(0xCCCCCC)
    //g4.drawCircle(0, 0, 5);
    //game.add.tween(g4).to({ alpha: 0 }, 500, Phaser.Easing.Linear.None, true);
}