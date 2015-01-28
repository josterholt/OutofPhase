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