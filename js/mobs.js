Number.prototype.toFixedDown = function(digits) {
    var re = new RegExp("(\\d+\\.\\d{" + digits + "})(\\d)"),
        m = this.toString().match(re);
    return m ? parseFloat(m[1]) : this.valueOf();
};

function Mouse(x, y, sprite_name) {
	Phaser.Sprite.call(this, game, x,y, sprite_name);
	
	this.script = null;
	this.scriptIndex = 0;
    this.tileDimensions = {x: 32, y: 32};
    this._initialProperties = { x: x, y: y }
    this.eventState = { originalX: x, originalY: y }
	
    this.speed = 150;
    this.solid = true;
    this.stunned = false;
    this.animations.add('walk_down', [0,1,2], true);
    this.animations.add('walk_left', [3,4,5], true);
    this.animations.add('walk_right', [6,7,8], true);
    this.animations.add('walk_up', [9,10,11], true);

    this.chaseThreshold = 125;
    this.distanceThreshold = 33;
    
    game.physics.enable(this, Phaser.Physics.ARCADE);
    this.body.facing = Phaser.RIGHT;
    this.body.collideWorldBounds = true;

    this.body.maxVelocity.x = 125;
    this.body.maxVelocity.y = 125;
    //this.body.drag.x = 2000;
    //this.body.drag.y = 2000;
    this.body.drag.x = 100;
    this.body.drag.y = 100;    

    this.fullHealth = 3;
    this.health = this.fullHealth;
    
    // Override postUpdate so body.facing isn't changed.
    this.body.postUpdate = function () {
        if (!this.enable)
        {
            return;
        }

        //  Only allow postUpdate to be called once per frame
        if (this.phase === 2)
        {
            return;
        }

        this.phase = 2;

        if (this.moves)
        {
            this._dx = this.deltaX();
            this._dy = this.deltaY();

            if (this.deltaMax.x !== 0 && this._dx !== 0)
            {
                if (this._dx < 0 && this._dx < -this.deltaMax.x)
                {
                    this._dx = -this.deltaMax.x;
                }
                else if (this._dx > 0 && this._dx > this.deltaMax.x)
                {
                    this._dx = this.deltaMax.x;
                }
            }

            if (this.deltaMax.y !== 0 && this._dy !== 0)
            {
                if (this._dy < 0 && this._dy < -this.deltaMax.y)
                {
                    this._dy = -this.deltaMax.y;
                }
                else if (this._dy > 0 && this._dy > this.deltaMax.y)
                {
                    this._dy = this.deltaMax.y;
                }
            }

            this.sprite.x += this._dx;
            this.sprite.y += this._dy;
        }

        this.center.setTo(this.position.x + this.halfWidth, this.position.y + this.halfHeight);

        if (this.allowRotation)
        {
            this.sprite.angle += this.deltaZ();
        }

        this.prev.x = this.position.x;
        this.prev.y = this.position.y;
    }    
}

Mouse.prototype = Object.create(Phaser.Sprite.prototype);
Mouse.prototype.constructor = Mouse;
Mouse.prototype.update = function () {
	// Process script
	if(this.script != null) {
		var script_node = this.script['events'][this.scriptIndex];
		// Have we fulfiled the last action?
		

		
		if("delay" in script_node) {
			// Check if the delay duration has passed
		}		
		
		/**
		 * Process event
		 */	
		var script_node = this.script['events'][this.scriptIndex];
		if(this.stunned == false) {
			if("velocity" in script_node) {
				//console.debug(this.eventState.originalX + script_node.velocity[0] * this.tileDimensions.x + " / " + this.eventState.originalY + script_node.velocity[1] * this.tileDimensions.y)
				if(!this.stunned) {
					game.physics.arcade.moveToXY(this, this.eventState.originalX + script_node.velocity[0] * this.tileDimensions.x, this.eventState.originalY + script_node.velocity[1] * this.tileDimensions.y, this.speed)
				}
			}
			
			//console.debug(game.physics.arcade.distanceBetween(this, PLAYERS[0]));
			var distance = game.physics.arcade.distanceBetween(this, PLAYERS[0])
			if(distance <= this.chaseThreshold) {
				//console.debug("Following")
				if(!this.stunned) {
					game.physics.arcade.moveToXY(this, Math.round(PLAYERS[0].body.x + (PLAYERS[0].body.width /2)), Math.round(PLAYERS[0].body.y + (PLAYERS[0].body.height / 2)), this.speed);
				}
			}
			
			if(Math.floor(this.body.velocity.x) > 0) {
				this.body.facing = Phaser.RIGHT;
			} else if(Math.floor(this.body.velocity.x) < 0) {
				this.body.facing = Phaser.LEFT;
			} else if(Math.floor(this.body.velocity.y) > 0) {
				this.body.facing = Phaser.UP;
			} else if(Math.floor(this.body.velocity.y) < 0) {
				this.body.facing = Phaser.DOWN;
			}
			
			if(this.body.facing == Phaser.RIGHT) {
				this.animations.play('walk_right', 5, true);
				this.body.facing = Phaser.RIGHT;
			} else if(this.body.facing == Phaser.LEFT) {
				this.animations.play('walk_left', 5, true);
				this.body.facing = Phaser.LEFT;
			} else if(this.body.facing == Phaser.UP) {
				this.animations.play('walk_up', 5, true);
				this.body.facing = Phaser.UP;
			} else if(this.body.facing == Phaser.DOWN) {
				this.animations.play('walk_down', 5, true);
				this.body.facing = Phaser.DOWN;
			}
	
			var next_action = false;
			if("velocity" in script_node) {
				if(Math.abs(this.x - (this.eventState.originalX + script_node.velocity[0] * this.tileDimensions.x)) < 10
					&& Math.abs(this.y - (this.eventState.originalY + script_node.velocity[1] * this.tileDimensions.y)) < 10			
			) {
					next_action = true;
				}
			}		
			
			if(next_action == true) {
				this.eventState.originalX = this.body.x;
				this.eventState.originalY = this.body.y;
				this.scriptIndex++;
				if(this.scriptIndex >= this.script['events'].length) {
					this.scriptIndex = 0;
				}
			}
		}
	}
	
	if(this.stunned) {
		//console.debug(this.body.velocity.x + "/" + this.body.velocity.y);
		//console.debug(this.body.x + "/" + this.body.y);
		//console.debug(PLAYERS[0].testing);
	}
}

Mouse.prototype.attachScript = function (script) {
	this.script = script;
}

Mouse.prototype.damage = function () {
	this.health -= 1;
	if(this.health == 0) {
		this.kill();
		
		// @todo probably should create a universal respawn timer
		var timer = OPGame.game.time.create(true);
		var self = this;
		timer.add(10*1000, function () {
			this.x = this._initialProperties.x;
			this.body.x = this._initialProperties.x;
			this.y = this._initialProperties.y;
			this.body.y = this._initialProperties.y;
			this.revive(this.fullHealth);
		}, this)
		timer.start();
		
		
	}
}


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