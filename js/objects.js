var PressureTrigger = function(game, x, y, sprite_name) {
    Phaser.Sprite.call(this, game, x, y, sprite_name)
    game.add.existing(this);

    this.active = false;
    this.pressed = false;
    this._pressedInUpdate = false;
}

PressureTrigger.prototype = Object.create(Phaser.Sprite.prototype);
PressureTrigger.prototype.constructor = PressureTrigger;

PressureTrigger.prototype.preUpdate = function () {
    this._pressedInUpdate = false;
}

PressureTrigger.prototype.update = function () {

}

PressureTrigger.prototype.postUpdate = function () {
    if(this.active && !this._pressedInUpdate) {
        this.deactivate();
    }
}

PressureTrigger.prototype.run = function (target) {
    // If this is the beginning of the press event, set flags
    this.active = true;
    if(!this.pressed) {
        this.onActivate();
        this.justPressed = true;
    } else {
        this.justPressed = false;
    }

    this.pressed = true;
    this._pressedInUpdate = true;
}

PressureTrigger.prototype.onActivate = function () {
    // Broadcast onActivate
    console.debug("Activate");
}

/**
 * Deactivate trigger and broadcast signal
 */
PressureTrigger.prototype.deactivate = function () {
    console.debug("Deactivate 1");
    this.pressed = false;
    this.active = false;
}

PressureTrigger.prototype.onDeactivate = function () {

}