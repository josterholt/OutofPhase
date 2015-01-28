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

    var overlap1 = game.physics.arcade.intersects(PLAYERS[0].body, t[1].body);
    var overlap2 = game.physics.arcade.intersects(PLAYERS[1].body, t[0].body)

    if(overlap1 && overlap2) {
        triggers['kill'](obj2.target);
    }
    return true;
}

var flower_dialogue1 = [
    "Achoo!",
    "These look nice. I guess.",
    "I think I see a bee...",
    "I know someone who would like these."
];
var flower_dialogue2 = [
    "I love flowers!",
    "These smell wonderful!",
    "*smiles*",
    "Hehehe"
];

triggers['flowerCheck'] = function(obj1, obj2) {
    if(obj1.group == "PLAYER1") {
        var text_indx = getRandomInt(0,3);
        UI.show(flower_dialogue1[text_indx]);
        UI.isSticky = true;
    } else {
        UI.show("Oh! These are pretty!");
        UI.isSticky = true;
    }
}

var flower_count = 0;
var ALL_THE_FLOWERS = 6;
var flowers_smelt = [];


triggers['flowerCount'] = function(obj1, obj2) {
    if(obj1.group == "PLAYER1") {
        triggers['flowerCheck'](obj1, obj2);
    } else {
        var flower_key = obj2.x + ":" + obj2.y;
        if(flowers_smelt.indexOf(flower_key) != -1) {
            UI.show("Mmmmm");
            UI.isSticky = true;
        } else {
            flower_count++;
            flowers_smelt.push(flower_key)
            if (flower_count != ALL_THE_FLOWERS) {
                var text_indx = getRandomInt(0,3);
                UI.show(flower_dialogue2[text_indx]);
                UI.isSticky = true;
            } else {
                triggers['kill']("wall2");
            }
        }
    }
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