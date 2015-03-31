function Torch(player_sprite, x, y) {
    Phaser.Sprite.call(this, OPGame.game, x, y-55, player_sprite)
    this.lit = true;
    this.animations.add('lit', [0,1,2], true);
    this.animations.add('unlit', [3], true);
    
    this.lightRadius = 100;
    this.shadowTexture = null;
    
    //OPGame.masks.vision
    
    game.physics.enable(this, Phaser.Physics.ARCADE);    
}

Torch.prototype = Object.create(Phaser.Sprite.prototype);
Torch.prototype.constructor = Torch;

Torch.prototype.setShadowTexture = function (texture) {
	this.shadowTexture = texture;
}

Torch.prototype.update = function () {
	if(!this.lit) {
		this.animations.play('unlit');
	} else {
		this.animations.play('lit', 5, true);
		
		if(OPGame.environment.dayPeriod != "DAY" && OPGame.environment.dayPeriod != "AFTERNOON" && OPGame.environment.dayPeriod != "LATE_AFTERNOON") {
		    var radius = this.lightRadius + this.game.rnd.integerInRange(1,10);

		    // Draw circle of light with a soft edge
		    var gradient = this.shadowTexture.context.createRadialGradient(
					this.x + (this.width / 2), this.y + (this.height / 2), this.lightRadius * 0.75,
					this.x + (this.width / 2), this.y + (this.height / 2), radius);
		    gradient.addColorStop(0, 'rgba(255, 255, 255, 1.0)');
		    gradient.addColorStop(1, 'rgba(255, 255, 255, 0.0)');
		    
		    this.shadowTexture.context.beginPath();
		    this.shadowTexture.context.fillStyle = gradient; //'rgb(255, 255, 255)';        	
		    this.shadowTexture.context.arc(this.x + (this.width / 2), this.y + (this.height / 2), radius, 0, Math.PI*2);
		    this.shadowTexture.context.fill();
		    this.shadowTexture.dirty = true;	
			
		}
	}	
}
