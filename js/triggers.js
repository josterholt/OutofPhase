var triggers = {};

triggers['message1'] = function (player, object) {
    if(player.name == "player1") {
        UI.show("Hello player 1");
    } else {
        UI.show("Hello player 2");
    }
}

triggers['openWall'] = function (obj1, obj2) {
    var count = 0;
    var t = [];
    for(i in trigger_objects.children) {
        if(trigger_objects.children[i].group == "trigger1") {
            t.push(trigger_objects.children[i]);
        }
    }

    var overlap1 = game.physics.arcade.intersects(PLAYERS[0].body, t[0].body);
    var overlap2 = game.physics.arcade.intersects(PLAYERS[1].body, t[1].body)

    console.debug(overlap1 + " / " + overlap2);
    if(overlap1 && overlap2) {
        for(i in trigger_objects.children) {
            if(trigger_objects.children[i].groupID == obj2.target) {
                trigger_objects.children[i].kill();
            }
        }
    }
    return true;
}

triggers['voodoo'] = function (target) {
    if(UI.active == false) {
        UI.show("This is a sticky prompt");
        UI.isSticky = true;
    } else {
        UI.isSticky = false;
    }
}