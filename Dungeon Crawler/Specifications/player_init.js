function init_player(game, player) {
    game.physics.arcade.enable(player, Phaser.Physics.ARCADE)
    // player.body.immovable = true 
    player.enableBody = true
    player.body.facing = 2;

    player.putBackpack = function (item, quantity = 1) {
        index = item["name"];
        if (index in player.backpack) {
            player.backpack[index]["quantity"] += quantity;
        } else {
            if (Object.keys(player.backpack).length >= MAX_BACKPACK_SIZE) {
                return "fail";
            } else {
                player.backpack[index] = item;
            }
        }
        return "success";
    }

    //~~~~~ Switch the players current active item ~~~~~
    // [Equiped] [Active1, Active2, Active3 ...]
    // Call method!
    // [Active1] [Active2, ... Equiped]
    // Moves player.current_item to end of player.active_items
    // and moves player.active_items[0] to player.current_item
    player.switchActiveItem = function () {
        item = player.active_items[0];
        item2 = Object.keys(player.current_item)

        player.current_item[item["name"]] = item;
        player.active_items.splice(0, 1);
        player.active_items.push(item2[0])

        player.current_item.delete(item2[0])
    }

    player.moveBackpackToActive = function (item, index) {
        if (player.active_items.length < MAX_ACTIVE_SIZE) {
            player.active_items.splice(index, 0, item);
            player.backpack.delete(item);
        } else {
            item_moved = player.active_items[index];
            player.active_items.splice(index, 1, item);
            player.backpack.delete(item);
            player.backpack[item_moved["name"]] = item_moved;
        }
    }

    player.moveActiveToBackpack = function (item, index) {
        if (player.backpack.length < MAX_BACKPACK_SIZE) {
            idx = player.active_items.indexOf(item);
            player.backpack[item["name"]] = item;
            player.active_items.splice(idx, 1);
        } else {
            return "fail";
        }
    }
    /*
    function moveToCurrent(item=null, src='backpack'){

        if(item.weapon != 'undefined'){
            if(current.size > 0){
                // Call api to move current to backpack
            }
            player.current = {
                item.name....
            }
    
            either delete from backpack or splice from actives
        }
    }
    */
    player.moveBackpackToCurrent = function (item, index) {
        // Only accept an item if it's a weapon and the current item slot is empty.

        if (Object.keys(player.current_item).length != 0 | item.Weapon_Type == 'undefined') {
            return;
        }
        else {
            player.current_item = {};
            var idx = player.active_items.indexOf(item);

            for (const [key, value] of Object.entries(item)) {
                player.current_item.key = value;
            }

            player.backpack.delete(item);
        }
    }

    player.moveActiveToCurrent = function (item, index) {
        // 

        if (Object.keys(player.current_item).length != 0 | item.Weapon_Type == 'undefined') {
            return;
        }
        else {
            player.current_item = {};

            for (const [key, value] of Object.entries(item)) {
                player.current_item.key = value;
            }

            player.active_items.splice(idx, 1);
        }
    }

    player.moveCurrentToBackpack = function (item) {
        if (player.backpack.length < MAX_BACKPACK_SIZE) {
            player.backpack[item["name"]] = item;
            player.current_item = null
        } else {
            return "fail";
        }

    }

    player.moveCurrentToActive = function (item, index) {

    }

    player.moveBackpackToCurrent = function (item, index) {

    }

    player.healthchange = function () {
        if (player.health > 10) { //makes sure the array doesn't go out of bounds
            console.log("invalid health")
            player.health = 10
        }
        else if (player.health < 0) {
            player.health = 1
        }

        if (health_bars[player.health - 1] != null) { //if there is a
            for (i = player.health; i < 10; i++) {
                if (health_bars[i] != null) {
                    health_bars[i].kill()
                    health_bars[i] = null
                }
            }
        }

        else {
            for (i = 0; i < player.health; i++) {
                if (health_bars[i] == null) {
                    health_bars[i] = bars.create(8 + i * 16, 5, 'health_heart')
                    health_bars[i].fixedToCamera = true
                }
            }
        }
    }


    // Exp() = 100(level)^1.5
    player.getCurrentLevel = function () {
        player.level = Math.floor(Math.pow((player.exp / 100.0), 2.0 / 3.0)) + 1
        return player.level
    }


    player.current_item = game.player_attributes.current;
    

    player.current_item.group = game.add.group();
    player.current_item.group.enableBody = true;
    

    player.skills = {}

    player.speed = game.playerSpeed

    player.damage = game.playerDamage

    player.attack_speed = game.playerAttackSpeed

    player.exp = game.playerExp

    player.level = player.getCurrentLevel()

    player.used_skill_points = game.playerUsedSkillPoints

    player.crit_chance = game.playerCritical

    player.health = game.playerHealth

    player.defense = game.playerDefense

    player.knockback = false

    player.swing = false

    player.luck = game.playerLuck

    player.money = game.player_attributes.money

    player.crit_damage = function () {
        if (probability(player.crit_chance)) {
            return player.damage * player.crit_chance
        }
        return 0
    }

    player.backpack = game.player_attributes["backpack"]
    player.active_items = game.player_attributes["actives"]

    console.log("BPCK", player.backpack)
    console.log("AI", player.active_items)

    player.use_potion = [
        console.log("speed")
        ,

        function useHealh() {
            console.log("health")
        }
    ]

    return player
}