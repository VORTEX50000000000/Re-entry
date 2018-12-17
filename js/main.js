// =============================================================================
// sprites
// =============================================================================

//
// hero sprite
//
function Hero(game, x, y) {
    Phaser.Sprite.call(this, game, x, y, 'hero');
    this.anchor.set(0.5, 0.5);

    // physic properties
    this.game.physics.enable(this);
    this.body.collideWorldBounds = true;

    this.animations.add('stop', [0,1,2,3,4,5], 5, true);
    this.animations.add('run', [6, 7], 5, true); // 8fps looped
    this.animations.add('jump', [0]);
    this.animations.add('fall', [0]);
}

// inherit from Phaser.Sprite
Hero.prototype = Object.create(Phaser.Sprite.prototype);
Hero.prototype.constructor = Hero;

Hero.prototype.move = function (direction) {
    const SPEED = 800;
    this.body.velocity.x = direction * SPEED;

    // update image flipping & animations
    if (this.body.velocity.x < 0) {
        this.scale.x = -1;
    }
    else if (this.body.velocity.x > 0) {
        this.scale.x = 1;
    }
};

Hero.prototype.jump = function () {
    const JUMP_SPEED = 600;
    let canJump = this.body.touching.down;

    if (canJump) {
        this.body.velocity.y = -JUMP_SPEED;
    }

    return canJump;
};

Hero.prototype.bounce = function () {
    const BOUNCE_SPEED = 200;
    this.body.velocity.y = -BOUNCE_SPEED;
};

Hero.prototype.update = function () {
    // update sprite animation, if it needs changing
    let animationName = this._getAnimationName();
    if (this.animations.name !== animationName) {
        this.animations.play(animationName);
    }
};

Hero.prototype._getAnimationName = function () {
    let name = 'stop'; // default animation

    // jumping
    if (this.body.velocity.y < 0) {
        name = 'jump';
    }
    // falling
    else if (this.body.velocity.y >= 0 && !this.body.touching.down) {
        name = 'fall';
    }
    else if (this.body.velocity.x !== 0 && this.body.touching.down) {
        name = 'run';
    }

    return name;
};

//
// Spider (enemy)
//
function Spider(game, x, y) {
    Phaser.Sprite.call(this, game, x, y, 'spider');

    // anchor
    this.anchor.set(0.5);
    // animation
    this.animations.add('crawl', [6, 7], 8, true); // 8fps, looped
    this.animations.add('die', [0, 1, 2, 3, 4, 5], 8);
    this.animations.play('crawl');

    // physic properties
    this.game.physics.enable(this);
    this.body.collideWorldBounds = true;
    this.body.velocity.x = Spider.SPEED;
}

Spider.SPEED = 100;

// inherit from Phaser.Sprite
Spider.prototype = Object.create(Phaser.Sprite.prototype);
Spider.prototype.constructor = Spider;

Spider.prototype.update = function () {
    // check against walls and reverse direction if necessary
    if (this.body.touching.right || this.body.blocked.right) {
        this.body.velocity.x = -Spider.SPEED; // turn left
    }
    else if (this.body.touching.left || this.body.blocked.left) {
        this.body.velocity.x = Spider.SPEED; // turn right
    }
};

Spider.prototype.die = function () {
    this.body.enable = false;

    this.animations.play('die').onComplete.addOnce(function () {
        this.kill();
    }, this);
};


// =============================================================================
// game states
// =============================================================================

PlayState = {};

const LEVEL_COUNT = 4;

PlayState.init = function (data) {
    this.game.renderer.renderSession.roundPixels = true;

    this.keys = this.game.input.keyboard.addKeys({
        left: Phaser.KeyCode.LEFT,
        right: Phaser.KeyCode.RIGHT,
        up: Phaser.KeyCode.UP
    });

    this.keys.up.onDown.add(function () {
        let didJump = this.hero.jump();
        if (didJump) {
            this.sfx.jump.play();
        }
    }, this);

    this.coinPickupCount = 0;
    this.hasKey = false;
    this.level = (data.level || 0) % LEVEL_COUNT;
};

PlayState.preload = function () {
    this.game.load.json('level:0', 'data/level00.json');
    this.game.load.json('level:1', 'data/level01.json');
    this.game.load.json('level:2', 'data/level02.json');
    this.game.load.json('level:3', 'data/level03.json');

    this.game.load.image('font:numbers', 'images/numbers.png');

    this.game.load.image('background', 'images/background.png');
    this.game.load.image('ground', 'images/ground.png');
    this.game.load.image('ground2', 'images/ground2.png');
    this.game.load.image('grass:8x1', 'images/grass_8x1.png');
    this.game.load.image('grass:6x1', 'images/grass_6x1.png');
    this.game.load.image('grass:4x1', 'images/grass_4x1.png');
    this.game.load.image('grass:2x1', 'images/grass_2x1.png');
    this.game.load.image('grass:1x1', 'images/grass_1x1.png');
    this.game.load.image('grass2:8x1', 'images/grass2_8x1.png');
    this.game.load.image('grass2:6x1', 'images/grass2_6x1.png');
    this.game.load.image('grass2:4x1', 'images/grass2_4x1.png');
    this.game.load.image('grass2:1x4', 'images/grass2_1x4.png');
    this.game.load.image('grass2:2x1', 'images/grass2_2x1.png');
    this.game.load.image('grass2:1x1', 'images/grass2_1x1.png');
    this.game.load.image('invisible-wall', 'images/invisible_wall.png');
    this.game.load.image('icon:coin', 'images/coin_icon.png');
    
    

    this.game.load.spritesheet('coin', 'images/coin_animated.png', 32, 25);
    
    this.game.load.spritesheet('spider', 'images/spider.png', 30, 54);
    this.game.load.spritesheet('hero', 'images/hero.png', 30, 54);
    this.game.load.spritesheet('door', 'images/door.png', 56, 52);
    this.game.load.spritesheet('icon:key', 'images/key_icon.png', 30, 34);
    this.game.load.spritesheet('key', 'images/key.png', 30, 34);
    
    this.game.load.audio('sfx:jump', 'audio/jump.wav');
    this.game.load.audio('sfx:coin', 'audio/coin.wav');
    this.game.load.audio('sfx:stomp', 'audio/stomp.wav');
    this.game.load.audio('sfx:key', 'audio/key.wav');
    this.game.load.audio('sfx:door', 'audio/door.wav');
};

PlayState.create = function () {
    // create sound entities
    this.sfx = {
        jump: this.game.add.audio('sfx:jump'),
        coin: this.game.add.audio('sfx:coin'),
        stomp: this.game.add.audio('sfx:stomp'),
        key: this.game.add.audio('sfx:key'),
        door: this.game.add.audio('sfx:door')
    };

    // create level
    this.game.add.image(0, 0, 'background');
    this._loadLevel(this.game.cache.getJSON(`level:${this.level}`));

    // crete hud with scoreboards)
    this._createHud();
};

PlayState.update = function () {
    this._handleCollisions();
    this._handleInput();

    this.coinFont.text = `x${this.coinPickupCount}`;
    this.keyIcon.frame = this.hasKey ? 1 : 0;
};

PlayState._handleCollisions = function () {
    this.game.physics.arcade.collide(this.spiders, this.platforms);
    this.game.physics.arcade.collide(this.spiders, this.enemyWalls);
    this.game.physics.arcade.collide(this.hero, this.platforms);

    this.game.physics.arcade.overlap(this.hero, this.coins, this._onHeroVsCoin,
        null, this);
    this.game.physics.arcade.overlap(this.hero, this.spiders,
        this._onHeroVsEnemy, null, this);
    this.game.physics.arcade.overlap(this.hero, this.key, this._onHeroVsKey,
        null, this);
    this.game.physics.arcade.overlap(this.hero, this.door, this._onHeroVsDoor,
        // ignore if there is no key or the player is on air
        function (hero, door) {
            return this.hasKey && hero.body.touching.down;
        }, this);
};

PlayState._handleInput = function () {
    if (this.keys.left.isDown) { // move hero left
        this.hero.move(-1);
    }
    else if (this.keys.right.isDown) { // move hero right
        this.hero.move(1);
    }
    else { // stop
        this.hero.move(0);
    }
};

PlayState._loadLevel = function (data) {
    // create all the groups/layers that we need
    this.bgDecoration = this.game.add.group();
    this.platforms = this.game.add.group();
    this.coins = this.game.add.group();
    this.spiders = this.game.add.group();
    this.enemyWalls = this.game.add.group();
    this.enemyWalls.visible = false;

    // spawn all platforms
    data.platforms.forEach(this._spawnPlatform, this);
    // spawn hero and enemies
    this._spawnCharacters({hero: data.hero, spiders: data.spiders});
    // spawn important objects
    data.coins.forEach(this._spawnCoin, this);
    this._spawnDoor(data.door.x, data.door.y);
    this._spawnKey(data.key.x, data.key.y);

    // enable gravity
    const GRAVITY = 1200;
    this.game.physics.arcade.gravity.y = GRAVITY;
};

PlayState._spawnPlatform = function (platform) {
    let sprite = this.platforms.create(
        platform.x, platform.y, platform.image);

    this.game.physics.enable(sprite);
    sprite.body.allowGravity = false;
    sprite.body.immovable = true;

    this._spawnEnemyWall(platform.x, platform.y, 'left');
    this._spawnEnemyWall(platform.x + sprite.width, platform.y, 'right');
};

PlayState._spawnEnemyWall = function (x, y, side) {
    let sprite = this.enemyWalls.create(x, y, 'invisible-wall');
    // anchor and y displacement
    sprite.anchor.set(side === 'left' ? 1 : 0, 1);
    // physic properties
    this.game.physics.enable(sprite);
    sprite.body.immovable = true;
    sprite.body.allowGravity = false;
};

PlayState._spawnCharacters = function (data) {
    // spawn spiders
    data.spiders.forEach(function (spider) {
        let sprite = new Spider(this.game, spider.x, spider.y);
        this.spiders.add(sprite);
    }, this);

    // spawn hero
    this.hero = new Hero(this.game, data.hero.x, data.hero.y);
    this.game.add.existing(this.hero);
};

PlayState._spawnCoin = function (coin) {
    let sprite = this.coins.create(coin.x, coin.y, 'coin');
    sprite.anchor.set(0.5, 0.5);

    this.game.physics.enable(sprite);
    sprite.body.allowGravity = false;

    sprite.animations.add('rotate', [0, 1, 2, 3, 4, 5, 6, 7, 8, 9], 10, true); // 6fps, looped
    sprite.animations.play('rotate');
};



PlayState._spawnDoor = function (x, y) {
    this.door = this.bgDecoration.create(x, y, 'door');
    this.door.anchor.setTo(0.5, 1);
    this.game.physics.enable(this.door);
    this.door.body.allowGravity = false;
};

PlayState._spawnKey = function (x, y) {
    this.key = this.bgDecoration.create(x, y, 'key');
    this.key.anchor.set(0.5, 0.5);
    // enable physics to detect collisions, so the hero can pick the key up
    this.game.physics.enable(this.key);
    this.key.body.allowGravity = false;
    // add a small 'up & down' animation via a tween
    this.key.y -= 3;
    this.game.add.tween(this.key)
        .to({y: this.key.y + 6}, 800, Phaser.Easing.Sinusoidal.InOut)
        .yoyo(true)
        .loop()
        .start();
};


PlayState._onHeroVsCoin = function (hero, coin) {
    this.sfx.coin.play();
    coin.kill();
    this.coinPickupCount++;
    window.scoreBoard.dataArr[0] = " VORTEX 50000000 - " + coinPickupCount;
};

PlayState._onHeroVsEnemy = function (hero, enemy) {
    if (hero.body.velocity.y > 0) { // kill enemies when hero is falling
        hero.bounce();
        enemy.die();
        this.sfx.stomp.play();
    }
    else { // game over -> restart the game
        this.sfx.stomp.play();
        this.game.state.restart(true, false, {level: this.level});
    }
};

PlayState._onHeroVsKey = function (hero, key) {
    this.sfx.key.play();
    key.kill();
    this.hasKey = true;
};

PlayState._onHeroVsDoor = function (hero, door) {
    this.sfx.door.play();
    this.game.state.restart(true, false, { level: this.level + 1 });
};

PlayState._createHud = function () {
    const NUMBERS_STR = '0123456789X ';
    this.coinFont = this.game.add.retroFont('font:numbers', 20, 26,
        NUMBERS_STR);

    this.keyIcon = this.game.make.image(0, 19, 'icon:key');
    this.keyIcon.anchor.set(0, 0.5);

    let coinIcon = this.game.make.image(this.keyIcon.width + 7, 0, 'icon:coin');
    let coinScoreImg = this.game.make.image(coinIcon.x + coinIcon.width,
        coinIcon.height / 2, this.coinFont);
    coinScoreImg.anchor.set(0, 0.5);

    this.hud = this.game.add.group();
    this.hud.add(coinIcon);
    this.hud.add(coinScoreImg);
    this.hud.add(this.keyIcon);
    this.hud.position.set(10, 10);
};

var ScoreBoard = function(game, conf) {
    this.game = game;
    this.group = game.add.group();

    this.defaults = {
        R: 10,
        x: 30,
        y: 20,
        margin: {
            x: 0,
            y: 22
        },
        width: 210,
        height: 16,
        color: {
            border: 0x000000,
            rect: 0x1E90FF
        },
        scale: 1,
        label: "Scoreboard",
        fixToCamera: true,
    };
    conf = conf || {};
    this.conf = Object.assign(this.defaults, conf);

    this._offset = {
        x: 0,
        y: 0
    };
    this.group.scale.setTo(this.conf.scale);

    this._subscribers = [];

    if (this.conf.label !== false) {
        this._drawLabel();
    }

    if (this.conf.fixToCamera) {
        this.setFixedToCamera(true);
    }

    this.hide();
};

ScoreBoard.prototype.constructor = ScoreBoard;

ScoreBoard.prototype._getDrawBoxes = function() {
    return this.group.children.filter(function(el) {
        return el.name === "drawBox";
    }) || [];
};

/**
 * Redraw cells with new data
 * @param {array||string} dataArr data for cell
 * @returns {undefined}
 */
ScoreBoard.prototype.redraw = function(dataArr) {
    if (!Array.isArray(dataArr) || Array.isArray(dataArr) && dataArr.length === 0) {
        return
    }
    this.show();
    var inC = (this.conf.label !== false) ? 1 : 0,
        boxes = this.group.children;
    if (boxes.length - inC === 0) {
        this.draw(dataArr);
    } else if (boxes.length - inC < dataArr.length) {
        for (var i = inC; i < boxes.length; i++) {
            boxes[i].children[1].text = dataArr[i - inC];
        }
        this.draw(dataArr.slice(boxes.length - inC));
    } else if (boxes.length - inC > dataArr.length) {
        for (var i = inC; i < dataArr.length; i++) {
            boxes[i].children[1].text = dataArr[i - inC];
        }
        var children = this.group.children.splice(dataArr.length + inC);
        for (var j = 0; j < children.length; j++) {
            children[j].destroy();
            this.__removeOffset();
        }
    } else {
        for (var i = inC; i < boxes.length; i++) {
            boxes[i].children[1].text = dataArr[i - inC];
        }
    }
};

/**
 * Draw to cell
 * @param {array||string} dataArr data for cell
 * @returns {undefined}
 */
ScoreBoard.prototype.draw = function(dataArr) {
    dataArr = (!Array.isArray(dataArr) && typeof dataArr === "string") ? [dataArr] : dataArr;
    for (var i = 0; i < dataArr.length; i++) {
        this._drawBox(dataArr[i]);
    }
    this.show();
};

/**
 * Clear cells
 * @returns {undefined}
 */
ScoreBoard.prototype.clear = function() {
    var el;
    var i = this.group.children.length;
    while (i--) {
        if (this.group.children[i].name === "drawBox") {
            el = this.group.children.splice(i, 1);
            el[0].destroy();
            this.__removeOffset();
        }
    }
    this.hide();
};

/**
 * Increase offset between margins
 * @returns {undefined}
 */
ScoreBoard.prototype.__addOffset = function() {
    this._offset.x += this.conf.margin.x;
    this._offset.y += this.conf.margin.y;
};

/**
 * Decreate offset between margins
 * @returns {undefined}
 */
ScoreBoard.prototype.__removeOffset = function() {
    this._offset.x -= this.conf.margin.x;
    this._offset.y -= this.conf.margin.y;
};

/**
 * Draw header label and attach to board
 * @returns {undefined}
 */
ScoreBoard.prototype._drawLabel = function() {
    var text = this.game.add.text(this.conf.x + this._offset.x + this.conf.width / 2, this.conf.y + this._offset.y, this.conf.label);
    text.stroke = '#000000';
    text.font = '30px Arial';
    text.strokeThickness = 4;
    text.fill = '#ffffff';
    text.anchor.set(0.5, 0);
    this._offset.y += text.height / 2;

    this.__addOffset();
    this.group.add(text);
};

/**
 * Draw box and attach to board
 * @returns {undefined}
 */
ScoreBoard.prototype._drawBox = function(stroke) {
    var gridSize = 2;
    var boxGr = this.game.add.group();
    boxGr.name = "drawBox";

    boxGr.inputEnableChildren = true;
    boxGr.onChildInputOver.add(item => {
        if (item instanceof Phaser.Graphics) {
            item.graphicsData[0].fillAlpha = 0.7;
        } else {
            item.parent.children[0].graphicsData[0].fillAlpha = 0.7;
        }
    }, this.game);
    boxGr.onChildInputOut.add(item => {
        if (item instanceof Phaser.Graphics) {
            item.graphicsData[0].fillAlpha = 1;
        } else {
            item.parent.children[0].graphicsData[0].fillAlpha = 1;
        }
    }, this.game);

    var gr = this.game.add.graphics();
    gr.beginFill(this.conf.color.rect);
    gr.lineStyle(gridSize, this.conf.color.border, 1);
    gr.drawRoundedRect(this.conf.x + this._offset.x, this.conf.y + this._offset.y, this.conf.width, this.conf.height, this.conf.R);
    gr.endFill();
    boxGr.add(gr);

    var text = this.game.add.text(this.conf.x + this._offset.x + this.conf.width / 2, this.conf.y + this._offset.y, stroke);
    text.anchor.set(0.5, 0);
    text.fontSize = this.conf.height - gridSize;
    boxGr.add(text);

    this.group.add(boxGr);
    this.__addOffset();
};

/**
 * Set position of current board
 * @param {number} x Coordinate on x axe
 * @param {number} y Coordinate on y axe
 * @returns {undefined}
 */
ScoreBoard.prototype.setPosition = function(x, y) {
    this.group.x = x;
    this.group.y = y;
};

/**
 * Fix board to camera
 * @param {boolean} fixedToCamera Need to fix to camera or not
 * @returns {undefined}
 */
ScoreBoard.prototype.setFixedToCamera = function(fixedToCamera) {
    this.group.fixedToCamera = fixedToCamera;
};

/**
 * Show display of current board
 * @returns {undefined}
 */
ScoreBoard.prototype.show = function() {
    this.group.visible = true;
};

/**
 * Hide display of current board
 * @returns {undefined}
 */
ScoreBoard.prototype.hide = function() {
    this.group.visible = false;
};

/**
 * Destroy current board on canvas
 * @returns {undefined}
 */
ScoreBoard.prototype.destroy = function() {
    this.group.destroy();
};
// =============================================================================
// entry point
// =============================================================================

window.onload = function () {
    let game = new Phaser.Game(960, 600, Phaser.AUTO, 'game');
    game.state.add('play', PlayState);
    game.state.start('play', true, false, {level: 0});
};