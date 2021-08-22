var cursors
var backpack
var active_items
var current_item
const MAX_BACKPACK_SIZE = 16

maingame.BackPack = function (game) {

};

maingame.BackPack.prototype = {
        preload: function () {
                game.load.image('boots', '../Assets/General assets/Skill Tree/speed.png')
                game.load.image('arrow', '../Assets/General assets/Skill Tree/atks.png')
                game.load.image('backpack', '../Assets/General assets/backpack.png')
                game.load.image('actives', '../Assets/General assets/ActiveItems.png')
                game.load.image('current', '../Assets/General assets/CurrentItem.png')
                game.load.image('button', '../Assets/General assets/Backbtn.png')
                game.load.image('bpckBackground', '../Assets/General assets/bpckBackground2.png')
                game.load.image('invtBackground', '../Assets/General assets/invtBackround1.png')
                game.load.atlas(
                        "potion_set",
                        "../Assets/General assets/Potions/potions.png",
                        "../Assets/General assets/Potions/potions.json"
                );
                game.load.atlas('sword',
                        '../Assets/Example assets/0x72_DungeonTilesetII_v1.3.1/Spritesheets/sword_spritesheet.png',
                        '../Assets/Example assets/0x72_DungeonTilesetII_v1.3.1/Spritesheets/sword.json')

                game.load.image('eng', '../Assets/General assets/Player/idile-down-4.png')



        },

        create: function () {
                game.add.image(0, 0, 'bpckBackground')
                game.add.image(25, 25, 'invtBackground')
                player = game.add.sprite(400, 200, 'eng', 'idle_down.png')

                cursors = game.input.keyboard.createCursorKeys()
                cursors.bckpck = game.input.keyboard.addKey(Phaser.Keyboard.B)
                button = game.add.button(700, 70, 'button', actionOnClick, this, 2, 1, 0);
                button.scale.setTo(2, 2)

                backpack = game.player_attributes["backpack"];
                active_items = game.player_attributes["actives"];
                current_item = {}//game.player_attributes["current"];
                inventory = []
                actives = Array(3).fill(0);
                current = [0];

                console.log("Backpack: ", backpack)
                console.log("Active Items", active_items)

                for (var i = 0; i < 4; i++) {
                        inventory.push([])
                        for (var j = 0; j < 4; j++) {
                                inventory[i][j] = 0
                        }
                }

                this.add.image(50, 50, 'backpack');
                this.add.image(120, 400, 'actives')
                this.add.image(50, 401, 'current');

                var item = game.add.group();

                item.inputEnableChildren = true;


                //initializing backpack interface with items
                bpList = Object.keys(backpack)
                console.log(bpList)
                count = 0;
                for (var j = 1; j <= 4; j++) {
                        for (var i = 1; i <= 4; i++) {
                                if (count == bpList.length) {
                                        break;
                                }
                                backpack[bpList[count]]["group"] = item.create(i * 70, j * 70, backpack[bpList[count]]["atlas"], backpack[bpList[count]]["src"])
                                backpack[bpList[count]]["group"].inputEnabled = true;
                                backpack[bpList[count]]["group"].input.enableDrag();
                                backpack[bpList[count]]["group"].events.onDragStart.add(onDragStart, this);
                                backpack[bpList[count]]["group"].events.onDragStop.add(onDragStop, this);
                                backpack[bpList[count]]["group"].inv_x = i - 1
                                backpack[bpList[count]]["group"].inv_y = j - 1
                                backpack[bpList[count]]["group"].inv = [i - 1, j - 1]
                                backpack[bpList[count]]["group"].name = backpack[bpList[count]]["name"]
                                inventory[i - 1][j - 1] = 1;
                                count++;
                                console.log(count)
                        }
                }

                //initializing active items interface 
                for (var i = 0; i < active_items.length; i++) {
                        if (active_items[i] != null) {
                                active_items[i]["group"] = item.create((i + 2) * 70, 70 * 6, active_items[i]["atlas"], active_items[i]["src"])
                                active_items[i]["group"].inputEnabled = true;
                                active_items[i]["group"].input.enableDrag();
                                active_items[i]["group"].events.onDragStart.add(onDragStart, this);
                                active_items[i]["group"].events.onDragStop.add(onDragStop, this);
                                active_items[i]["group"].inv_x = i
                                active_items[i]["group"].inv_y = 5
                                active_items[i]["group"].inv = [i, 5]
                                actives[i] = 1
                        }
                }

                function actionOnClick() {
                        console.log("return to game")
                        game.state.start("Game");
                }
                function onDragStart(sprite, pointer) {
                        console.log("Dragging " + sprite.key);
                        sprite.input.enableSnap(70, 70, false, true);

                }

                function onDragStop(sprite, pointer) {
                        var inv_x = (sprite.x / 70) - 1
                        var inv_y = (sprite.y / 70) - 1
                        console.log(sprite.x + ", " + sprite.y);
                        console.log(inventory);
                        console.log(actives)

                        // inv_y == 5 && inv_x > 4 => In active item range
                        // inv_x >= 4
                        // inv_y >= 4 && (inv_y != 5) => In backpack range
                        // inv_x < 0 => out of bounds check
                        // inv_y < 0 => out of bounds check
                        if (inv_y == 5 && inv_x > 4 || inv_x >= 4 || inv_y >= 4 && (inv_y != 5) || inv_x < 0 || inv_y < 0) {
                                //move it back / fail
                                console.log("Out of range")
                                sprite.position.x = (sprite.inv[0] + 1) * 70
                                sprite.position.y = (sprite.inv[1] + 1) * 70
                                return
                        }
                        // Check if it's going to either an active item or current item...
                        else if (inv_y == 5) {
                                act_x = inv_x;
                                // If active item slot is full send it back
                                if (actives[act_x] == 1) {
                                        //move it back/fail
                                        console.log(1)
                                        sprite.position.x = (sprite.inv[0] + 1) * 70
                                        sprite.position.y = (sprite.inv[1] + 1) * 70
                                        return
                                } else {
                                        //success
                                        // Move item from backpack to active
                                        // Check to see where the item is coming from...
                                        if (sprite.inv[1] == 5) {
                                                // Item came from actives
                                                if (inv_x != 0) {
                                                        console.log("Actives")
                                                        actives[sprite.inv[0]] = 0
                                                }
                                                else {
                                                        sprite.position.x = (sprite.inv[0] + 1) * 70
                                                        sprite.position.y = (sprite.inv[1] + 1) * 70
                                                        return
                                                }
                                        } else {
                                                inventory[sprite.inv[1]][sprite.inv[0]] = 0
                                        }

                                        if (inv_x == 0) {
                                                console.log(current_item)
                                                moveBackpackToCurrent(backpack, sprite, act_x);
                                        }
                                        else {
                                                moveBackpackToActive(backpack, sprite, act_x)
                                                actives[act_x] = 1
                                        }
                                        sprite.inv[0] = inv_x
                                        sprite.inv[1] = inv_y
                                        return
                                }
                        } else if (inventory[inv_y][inv_x] === 1) {
                                console.log("Occupied")
                                //move it back / fail
                                sprite.position.x = (sprite.inv[0] + 1) * 70
                                sprite.position.y = (sprite.inv[1] + 1) * 70
                                return
                        } else {
                                //can move item with success
                                if (sprite.inv[1] == 5) {
                                        if (inv_x == 0) {
                                                console.log("MoveActiveToCurrent")
                                                return;
                                        }
                                        else {
                                                // Moving active item to backpack
                                                moveActiveToBackpack(backpack, active_items, active_items[sprite.inv_x], 0)
                                                actives[sprite.inv[0]] = 0

                                        }
                                } else {
                                        inventory[sprite.inv[1]][sprite.inv[0]] = 0
                                }
                                inventory[inv_y][inv_x] = 1
                                sprite.inv[0] = inv_x
                                sprite.inv[1] = inv_y
                                return
                        }
                }
                moveBackpackToActive = function (backpack, item, index) {
                        console.log("MoveBTA", item.name)
                        if (active_items.length < 3) {
                                active_items.splice(index, 1, backpack[item.name]);
                                delete backpack[item.name];
                        } else {
                                item_moved = player.active_items[index];
                                active_items.splice(index, 1, item);
                                backpack.delete(item);
                                backpack[item_moved["name"]] = item_moved;
                        }
                }

                moveActiveToBackpack = function (backpack, active_items, item, index) {
                        console.log("MoveATB", item)
                        if (Object.keys(backpack).length < MAX_BACKPACK_SIZE) {
                                idx = active_items.indexOf(item);
                                backpack[item["name"]] = item;
                                active_items.splice(idx, 1);
                                console.log(backpack, active_items)
                        } else {
                                console.log("Failed");
                        }
                }

                moveBackpackToCurrent = function (backpack, item, index) {
                        // removed for testing...
                        // | moveBackpackToCurrent
                        if (Object.keys(current_item).length != 0) {
                                console.log("Failed");
                                return;
                        }
                        else {
                                console.log("Move Backpack to Current")
                                current_item = {};

                                for (const [key, value] of Object.entries(item)) {
                                        current_item.key = value;
                                }
                                
                                delete backpack[item.name]

                        }
                }

                moveActiveToCurrent = function (active_items, item, index) {
                        // Only accept an item if it's a weapon and the current item slot is empty.

                        if (Object.keys(current_item).length != 0 | item.Weapon_Type == 'undefined') {
                                return;
                        }
                        else {
                                current_item = {};
                                var idx = player.active_items.indexOf(item);

                                for (const [key, value] of Object.entries(item)) {
                                        player.current_item.key = value;
                                }

                                active_items.splice(idx, 1);
                        }
                }

                //-------------------- Speed run timer --------------------
                timeLimit = game.current_time
                var minutes = Math.floor(timeLimit / 6000);
                var seconds = Math.floor((timeLimit - (minutes * 6000)) / 100);
                var miliseconds = timeLimit - (seconds / 100) - (minutes * 6000);
                var timeString = addZeros(minutes) + ":" + addZeros(seconds) + "." + addZeros(miliseconds);
                this.timeText = game.add.text(650, 20, timeString)
                this.timeText.fill = "#FFFFFF"
                this.timeText.fixedToCamera = true;
                this.timer = game.time.events.loop(10, tick, this)
        },

        update: function () {
                if (cursors.bckpck.isDown) {
                        game.player_attributes = {
                                backpack: backpack,
                                actives: active_items,
                                current: current_item,
                        };
                        game.current_time = timeLimit
                        game.state.start("Game");
                }



        }

}