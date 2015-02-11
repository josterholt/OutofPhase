function probe(sprite) {
    //sprite.body.immovable = true;
    circle = game.add.graphics(sprite.x + (sprite.width / 2), sprite.y + (sprite.height / 2))
    circle.beginFill(0xFFFFFF)
    circle.drawCircle(0, 0, 25);
    circle.alpha = 0.5;
    circle.radius = 25;
    s = game.add.tween(circle)
    s.to({"alpha": 0, "width": 100, "height": 100}, 2000, Phaser.Easing.Linear.None, true);
    //s.onComplete.add(function () {
    //    sprite.body.immovable = false;
    //}, this);
}