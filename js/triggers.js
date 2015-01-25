var triggers = {};

triggers['message1'] = function (player, object) {
    if(player.name == "player1") {
        UI.show("Hello player 1");
    } else {
        UI.show("Hello player 2");
    }
}

triggers['message2'] = function (player, object) {
    UI.show("If these walls could talk");
}

triggers['openWall'] = function (obj1, obj2) {
    var count = 0;
    var t = [];
    for(i in trigger_objects.children) {
        if(trigger_objects.children[i].group == "trigger1") {
            t.push(trigger_objects.children[i]);
        }
    }

    var overlap1 = game.physics.arcade.intersects(PLAYERS[0].body, t[1].body);
    var overlap2 = game.physics.arcade.intersects(PLAYERS[1].body, t[0].body)

    if(overlap1 && overlap2) {
        triggers['kill'](obj2.target);
    }
    return true;
}

triggers['openWall2'] = function (obj1, obj2) {
    var count = 0;
    var t = [];
    for(i in trigger_objects.children) {
        if(trigger_objects.children[i].group == "trigger3") {
            t.push(trigger_objects.children[i]);
        }
    }

    console.debug("testing");

    var overlap1 = game.physics.arcade.intersects(PLAYERS[0].body, t[1].body);
    var overlap2 = game.physics.arcade.intersects(PLAYERS[1].body, t[0].body)

    if(overlap1 && overlap2) {
        triggers['kill'](obj2.target);
    }
    return true;
}


triggers['kill'] = function(target_group) {
    console.debug("Killing " + target_group);
    for(i in trigger_objects.children) {
        if(trigger_objects.children[i].group == target_group) {
            trigger_objects.children[i].kill();
        }
    }
}

triggers['voodoo'] = function (target) {
    if(UI.active == false) {
        UI.show("This is a sticky prompt");
        UI.isSticky = true;
    } else {
        UI.isSticky = false;
    }
}