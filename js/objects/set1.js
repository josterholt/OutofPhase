function Torch(player_sprite, x, y) {
    Phaser.Sprite.call(this, OPGame.game, x, y-55, player_sprite)
    this.lit = true;
    this.animations.add('lit', [0,1,2], true);
    this.animations.add('unlit', [3], true);
    
    //OPGame.masks.vision
    
    game.physics.enable(this, Phaser.Physics.ARCADE);    
}

Torch.prototype = Object.create(Phaser.Sprite.prototype);
Torch.prototype.constructor = Torch;

Torch.prototype.update = function () {
	if(!this.lit) {
		this.animations.stop(null, 3);
	} else {
		this.animations.play('lit', 5, true);	
	}
}
