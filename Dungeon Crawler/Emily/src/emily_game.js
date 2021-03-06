const game = new Phaser.Game(
    800,
    600, Phaser.AUTO, '', {
        preload: preload,
        create: create,
        update: update,
        render: render
    }
)

//-------------------- Tile map --------------------
var map
var ground
var walls

//-------------------- Player --------------------
var player
var player_facing = 3
const MAX_BACKPACK_SIZE = 16
const MAX_ACTIVE_SIZE = 3

//-------------------- Enemies --------------------
var lizard
var lizard_direction = 1
var big_guy
var new_nme

//-------------------- Utilities --------------------
var keyReset = false
var cursors

//-------------------- Weapons --------------------
var default_sword
var weapon

var maingame = {}
maingame.emilygame = function(game){

};
maingame.emilygame.prototype = {
    preload: function() {
        this.load.image('tiles',
            '../Assets/Example assets/0x72_DungeonTilesetII_v1.3.1/0x72_DungeonTilesetII_v1.3.png')

        this.load.tilemap('example_map',
            '../Assets/Example assets/Tiled Map/Example_tile.json',
            null,
            Phaser.Tilemap.TILED_JSON)

        this.load.atlas('player',
            '../Assets/Example assets/legend of faune files/spritesheet.png',
            '../Assets/Example assets/legend of faune files/faun_spritesheet.json')

        this.load.atlas('lizard',
            '../Assets/Example assets/0x72_DungeonTilesetII_v1.3.1/Spritesheets/lizard_spritesheet.png',
            '../Assets/Example assets/0x72_DungeonTilesetII_v1.3.1/Spritesheets/lizard.json')


        this.load.atlas('sword',
            '../Assets/Example assets/0x72_DungeonTilesetII_v1.3.1/Spritesheets/sword_spritesheet.png',
            '../Assets/Example assets/0x72_DungeonTilesetII_v1.3.1/Spritesheets/sword.json')

        this.load.atlas('big_guy',
            '../Assets/Example assets/0x72_DungeonTilesetII_v1.3.1/Spritesheets/biguy_spritesheet.png',
            '../Assets/Example assets/0x72_DungeonTilesetII_v1.3.1/Spritesheets/bigguy.json')

    },

    create: function() {
        //-------------------- Start physics engine --------------------
        game.physics.startSystem(Phaser.Physics.ARCADE)

        //-------------------- Add tile map and tile set --------------------
        map = game.add.tilemap('example_map')
        map.addTilesetImage('dungeon', 'tiles')

        //-------------------- Create layer --------------------
        ground = map.createLayer('Ground')
        walls = map.createLayer('Walls')

        //-------------------- Add wall colision --------------------
        map.setCollisionBetween(1, 999, true, 'Walls')

        //-------------------- Add player model --------------------
        player = game.add.sprite(128, 128, 'player', 'walk-down-3.png')
        player.swing = false
        player.health = 3
        player.backpack = {}
        player.active_items = []
        player.current_item = {}


        //~~~~~ Switch the players current active item ~~~~~
        // [Equiped] [Active1, Active2, Active3 ...]
        // Call method!
        // [Active1] [Active2, ... Equiped]
        // Moves player.current_item to end of player.active_items
        // and moves player.active_items[0] to player.current_item
        player.switchActiveItem = function (){
            item = player.active_items[0];
            item2 = Object.keys(player.current_item)

            player.current_item[item["name"]] = item;
            player.active_items.splice(0,1);
            player.active_items.push(item2[0])

            player.current_item.delete(item2[0])
        }
        //max 
        player.putBackpack = function(item, quantity = 1) {
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

        player.moveBackpackToActive = function(item, index) {
            if (player.active_items.length < MAX_ACTIVE_SIZE){
                player.active_items.splice(index, 0, item);
                player.backpack.delete(item);
            } else {
                item_moved = player.active_items[index];
                player.active_items.splice(index, 1, item);
                player.backpack.delete(item);
                player.backpack[item_moved["name"]] = item_moved;
            }
        }

        player.moveActiveToBackpack = function(item, index){
            if (player.backpack.length < MAX_BACKPACK_SIZE){
                idx = player.active_items.indexOf(item);
                player.backpack[item["name"]] = item;
                player.active_items.splice(idx,1);
            } else {
                return "fail";
            }
        }

        player.animations.add(
            'walk-down',
            Phaser.Animation.generateFrameNames(
                'walk-down-',
                1,
                8,
                '.png'
            ),
            8,
            true
        )
        player.animations.add(
            'walk-up',
            Phaser.Animation.generateFrameNames(
                'walk-up-',
                1,
                8,
                '.png'
            ),
            8,
            true
        )
        player.animations.add(
            'walk-right',
            Phaser.Animation.generateFrameNames(
                'walk-side-',
                1,
                8,
                '.png'
            ),
            8,
            true
        )
        player.animations.add(
            'walk-left',
            Phaser.Animation.generateFrameNames(
                'walk-left-',
                1,
                8,
                '.png'
            ),
            8,
            true
        )
        player.animations.add(
            'idle-down',
            Phaser.Animation.generateFrameNames(
                'walk-down-',
                3,
                3,
                '.png'
            ),
            8,
            true
        )
        player.animations.add(
            'idle-up',
            Phaser.Animation.generateFrameNames(
                'walk-up-',
                3,
                3,
                '.png'
            ),
            8,
            true
        )
        player.animations.add(
            'idle-right',
            Phaser.Animation.generateFrameNames(
                'walk-side-',
                3,
                3,
                '.png'
            ),
            8,
            true
        )
        player.animations.add(
            'idle-left',
            Phaser.Animation.generateFrameNames(
                'walk-left-',
                3,
                3,
                '.png'
            ),
            8,
            true
        )

        //-------------------- Add example weapon --------------------
        default_sword = game.add.group()
        default_sword.enableBody = true

        //-------------------- Add example enemies --------------------
        lizard = game.add.physicsGroup(Phaser.Physics.ARCADE);
        lizard.enableBody = true

        new_nme = lizard.create(600, 142, 'lizard', 'lizard_m_idle_anim_f0.png')
        big_guy = lizard.create(600, 200, 'big_guy', 'big_demon_idle_anim_f3.png')
        var big_guy_tween = game.add.tween(big_guy)
        big_guy_tween.to({ x: 700, y: 200 }, 1000, null, true, 0, -1, true)

        big_guy.animations.add(
            'idle',
            Phaser.Animation.generateFrameNames(
                'big_demon_idle_anim_f',
                0,
                3,
                '.png'
            ),
            10,
            true
        )
        big_guy.animations.add(
            'run',
            Phaser.Animation.generateFrameNames(
                'big_demon_run_anim_f',
                0,
                3,
                '.png'
            ),
            10,
            true
        )
        big_guy.animations.play('run')

        new_nme.animations.add(
            'idle',
            Phaser.Animation.generateFrameNames(
                'lizard_m_idle_anim_f',
                0,
                3,
                '.png'
            ),
            10,
            true
        )
        new_nme.animations.add(
            'run',
            Phaser.Animation.generateFrameNames(
                'lizard_m_run_anim_f',
                0,
                3,
                '.png'
            ),
            10,
            true
        )


        new_nme.animations.play('run')
        new_nme.body.velocity.x = 120
        new_nme.body.bounce.set(-1)

        game.physics.arcade.enable(player, Phaser.Physics.ARCADE)
        game.physics.arcade.enable(lizard, Phaser.Physics.ARCADE)
        game.world.setBounds(0, 0, 16 * 100, 16 * 100)
        game.camera.follow(player)

        cursors = game.input.keyboard.createCursorKeys()
        cursors.space = game.input.keyboard.addKey(Phaser.Keyboard.SPACEBAR)
    },

    update: function() {
        game.physics.arcade.collide(player, walls)
        game.physics.arcade.collide(lizard, walls, lizard_turn_around, null, this)
        game.physics.arcade.collide(default_sword, lizard, function test(default_sword, lizard) { console.log('default_sword x lizard collision') }, null, this)

        var speed = 175
        idle_direction = ['idle-left', 'idle-right', 'idle-up', 'idle-down']

        if (!player.swing) {
            if (cursors.left.isDown) {
                player_facing = 0
                player.body.velocity.x = -speed
                player.animations.play('walk-left', true)


            } else if (cursors.right.isDown) {
                player_facing = 1
                player.body.velocity.x = speed
                player.animations.play('walk-right', true)

            } else if (cursors.down.isDown) {
                player_facing = 3
                player.body.velocity.y = speed
                player.animations.play('walk-down', true)

            } else if (cursors.up.isDown) {
                player_facing = 2
                player.body.velocity.y = -speed
                player.animations.play('walk-up', true)

            } else {
                player.animations.play(idle_direction[player_facing])
                player.body.velocity.x = 0
                player.body.velocity.y = 0

            }
        } else {
            player.body.velocity.x = 0
            player.body.velocity.y = 0
        }

        if (cursors.space.downDuration(100) && !keyReset) {
            keyReset = true;
            swing_default_sword(player)
        }
        if (!cursors.space.isDown) {
            keyReset = false
        }
    },

    render: function() {
        game.debug.bodyInfo(player, 32, 32);
        // game.debug.body(player);
        game.debug.body(new_nme)
        if (weapon) {
            game.debug.body(weapon)
        }
    }
}

// ~~~~~
function lizard_turn_around(enemy, walls) {
    current = enemy.body.velocity.x
    lizard_direction *= -1
    enemy.body.velocity.x = -current
}

function swing_default_sword(player) {
    player.body.velocity.x = 0
    player.body.velocity.y = 0
    player.swing = true

    // Left
    if (player_facing == 0) {
        weapon = default_sword.create(player.position.x - 10, player.position.y + 16, 'sword', 'weapon_regular_sword_left.png')
    }
    // Right
    else if (player_facing == 1) {
        weapon = default_sword.create(player.position.x + 22, player.position.y + 16, 'sword', 'weapon_regular_sword_right.png')
    }
    // Up
    else if (player_facing == 2) {
        weapon = default_sword.create(player.position.x + 11, player.position.y - 14, 'sword', 'weapon_regular_sword_up.png')

    }
    // Down
    else if (player_facing == 3) {
        weapon = default_sword.create(player.position.x + 11, player.position.y + 24, 'sword', 'weapon_regular_sword_down.png')
    }

    var event = game.time.events.add(Phaser.Timer.SECOND * 0.2, sheath_sword, this, [weapon])
}

function sheath_sword(weapon) {
    weapon[0].kill()
    player.swing = false
}