function Guardian(x, y, sprite_name) {
    //this.imagePath = "images/mobs/Elemental_Earth/$Monster_Elemental_Earth.png"

    Phaser.Sprite.call(this, game, x, y, sprite_name)

    //this.name = "player" + player_num;
    //this.group = "player" + player_num;
    this.speed = 50;
    this.animations.add('walk_down', [0,1,2,3,4,5,6,7], true);
    this.animations.add('walk_left', [8,9,10,11,12,13,14,15], true);
    this.animations.add('walk_right', [16,17,18,19,20,21,22,23], true);
    this.animations.add('walk_up', [24, 25, 26, 27, 28,29, 30,21, 32], true);

    game.physics.enable(this, Phaser.Physics.ARCADE);
    this.body.collideWorldBounds = true;
    //this.body.setSize(32, 10, 0, (this.height - 20));

    this.body.facing = Phaser.RIGHT;



    //PLAYERS[player_num - 1] = this;
    //this.hitbox = this.initPlayerHitBox(player_num);
}
Guardian.prototype = Object.create(Phaser.Sprite.prototype);
Guardian.prototype.constructor = Guardian;

Guardian.prototype.update = function () {
    this.body.velocity.x = 0;
    this.body.velocity.y = 0;

    if(this.body.facing == Phaser.RIGHT) {
        this.body.velocity.x += this.speed;
        this.animations.play('walk_right', 5, true);
    } else if(this.body.facing == Phaser.LEFT) {
        this.body.velocity.x -= this.speed;
        this.animations.play('walk_left', 5, true);
    } else if(this.body.facing == Phaser.UP) {
        this.body.velocity.y -= this.speed;
        this.animations.play('walk_up', 5, true);
    } else if(this.body.facing == Phaser.DOWN) {
        this.body.velocity.y += this.speed;
        this.animations.play('walk_down', 5, true);
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

}