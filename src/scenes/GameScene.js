import Phaser from "phaser";
import ScoreLabel from "./ui/ScoreLabel";
import BombSpawner from "./BombSpawner";

// define constants variables for avoid typing/misspelling
const GROUND_KEY = "ground";
const DUDE_KEY = "dude";
const STAR_KEY = "star";
const BOMB_KEY = "bomb";

/* Scene means the place, where all the actions take place. That is where you will be adding your game characters, your enemies - everything in the game will go in SCENE.

You can have as a single scene, as well as multiple scenes & you can use scenes to represent for different screens, for different game levels and so on.. Also, You can multiple scenes open at once & pass data between them. 

Scene has differnet methods, that we use for different purposes. 
lifecycle of Scene : init() > preload() > create() > update()

-- init() --- when a new scene started, it called 'init()' method. It is called once & and it is used to initiate certain parameters of scene. It is not always used.
-- preload() --- in this phase, Phaser will load all the images or audio files, or other external files that you want to use in your game. It will automatically look for this function when it starts and load anything defined within it. All those files will be loaded to memory. So that, they can be used without any delay. 
-- create() --- This method is called only once, after the preload() phase finishes. Exactly on this phase you create sprites/images and display them on the screen.
-- update() --- it is called on each frame, during the gameplay. So it is used for the things need to be checked at all time. we can access all the methods and sprites we had created For changing properties of something we need. It is called up to 60 times per second (in new devices), and less then 60 times per second (in old devices). This method provides the movement of objects, different movements, the dynamism of the game. 

*/

// Create Scene - Main Logic of game
export default class GameScene extends Phaser.Scene {
	constructor() {
		super("game-scene");

		// Declaring all instance properties before using them makes it easier to see all the properties are at a glance. This is not strictly necessary !!!
		this.player = undefined;
		this.cursors = undefined;
		this.scoreLabel = undefined;
		this.bombSpawner = undefined;
		this.stars = undefined;

		this.timer(false);
		this.gameOver = false;
	}

	preload() {
		// Loading assests/images
		// load.image() is a method which loads all the images
		// first parameter is a label for image, second is location of image
		this.load.image("sky", "assets/sky.png");
		this.load.image(GROUND_KEY, "assets/platform.png");
		this.load.image(STAR_KEY, "assets/star.png");
		this.load.image(BOMB_KEY, "assets/bomb.png");

		// add a sprite sheet (main character of the game) to the loader
		// 32x48 size of each frame
		this.load.spritesheet(DUDE_KEY, "assets/dude.png", {
			frameWidth: 32,
			frameHeight: 48,
		});
	}

	create() {
		// display background image- set initial position of background on x-y axis
		// from left-top corner - x horizontal coordinate, y vertical coordinate
		// all Game Objects are positioned based on their center by default. The background image is 800 x 600 pixels in size (see 'main.js'), so if we were to display it centered at 0 x 0 you'd only see the bottom-right corner of it. If we display it at 400 x 300 you see the whole thing.

		// add.image(x, y, label)
		this.add.image(400, 300, "sky");

		// store methods createing sprites in variables
		const platforms = this.createPlatforms();
		this.player = this.createPlayer();
		this.stars = this.createStars();

		// add scoreboard from top to bottom on 16px (Y axis), from left to right on 16px
		// 0 - initial score
		this.scoreLabel = this.createScoreLabel(16, 16, 0);

		this.bombSpawner = new BombSpawner(this, BOMB_KEY);
		const bombsGroup = this.bombSpawner.group;

		// adding a collider to avoid collision & overlaps between two objects (in these case, all main objects are compared to the platform)
		this.physics.add.collider(this.player, platforms);
		this.physics.add.collider(this.stars, platforms);
		this.physics.add.collider(bombsGroup, platforms);

		this.physics.add.collider(
			this.player,
			bombsGroup,
			this.hitBomb,
			null,
			this
		);

		// check overlaping between stars & player
		// If found overlap then they are passed ---> to the 'collectStar' function
		this.physics.add.overlap(
			this.player,
			this.stars,
			this.collectStar,
			null,
			this
		);

		// this.input.keyboard - for commands for keybord buttons
		// createCursorKeys() - concretly for hotkeys for Up, Down, Left and Right (and also Space Bar and shift (Phaser3 referance))
		this.cursors = this.input.keyboard.createCursorKeys();
	}

	update() {
		// If the left key is being held down.
		if (this.cursors.left.isDown) {
			this.player.setVelocityX(-160);
			// speed + direction on horyzontal X axis
			// positive number means direction from left to right (X Axis orientation --->),  negative number direction from right to left (X Axis orientation <---).
			// The higher the number, the higher the speed (although positive or negative it is)
			// setVelocityX(0) - means no speed, no direction.

			// set animation active (without animation it moves & flies as a DRACULA :))
			this.player.anims.play("left", true);
		} else if (this.cursors.right.isDown) {
			this.player.setVelocityX(160);

			this.player.anims.play("right", true);
		} else {
			this.player.setVelocityX(0);

			this.player.anims.play("turn");
		}

		// If the 'UP' key is being held down && player touches down after each jumping
		// this.body.touching.down - when player touches down after each jumping to the platform
		if (this.cursors.up.isDown && this.player.body.touching.down) {
			this.player.setVelocityY(-330);
			// speed + direction on vertical y axis (at this point, jumping)
			// positive number means direction from top to bottom (Y Axis orientation),  negative number direction from bottom to top (Y Axis orientation).
			// The higher the number, the higher the speed (although positive or negative it is)
			// setVelocityY(0) - means no speed, no direction on Vertical axis.
		}

		if (this.gameOver) {
			return;
		}
	}

	createPlatforms() {
		// creates a new static/motionless Physics Group. It isn't touched by gravity - it never moves. perfect for the ground and motionless  platforms
		const platforms = this.physics.add.staticGroup();

		// create new 4 platforms (ground)
		// increase dimensions of physics by 2 (both - x,y)
		// refreshBody() - Syncs the Body's position and size with its parent Game Object. This method is only for static platforms (not dynamic ones), because it's a useful way of modifying the position of a Static Body in the Physics World.
		platforms.create(400, 568, GROUND_KEY).setScale(2).refreshBody();
		platforms.create(600, 400, GROUND_KEY);
		platforms.create(50, 250, GROUND_KEY);
		platforms.create(750, 220, GROUND_KEY);

		return platforms;
	}

	createPlayer() {
		// create new 'player' sprite
		const player = this.physics.add.sprite(100, 450, DUDE_KEY);

		player.setBounce(0.2); // Bounce is the amount of restitution, or elasticity, the body has when it collides with another object. A value of 1 means that it will retain its full velocity after the rebound. A value of 0 means it will not rebound at all. in simple words: Sensitivity of a collision or jump

		player.setCollideWorldBounds(true); // Sets whether this Body collides with the world boundary. true if the Body should collide with the world bounds, otherwise false. In the false case the object will go beyond the boundaries of the scene and Will be lost from screen !!!!

		// anims.create() - method that creates new animation
		// key: "left", - The key for the texture containing the animation frames. (defined for movements by pressing left keybord key)
		// generateFrameNumbers() - method for extracting the frames
		// We have a sprite sheet loaded called 'DUDE_KEY' and it contains 9 frames (see public/assets/dude.png)
		// The 'start' value tells it to start after from first (index 1) frames.
		// The 'end' value tells it to stop after 4 (index 3) frames.
		// 'frameRate: 10' - The frame rate of playback in frames per second (default 24 if duration is null). Say simple: Speed of transition between frames per second
		// 'repeat: -1' - Number of times to repeat the animation. Set to -1 to repeat forever.
		this.anims.create({
			key: "left",
			frames: this.anims.generateFrameNumbers(DUDE_KEY, {
				start: 0,
				end: 3,
			}),
			frameRate: 10,
			repeat: -1,
		});

		this.anims.create({
			key: "turn",
			frames: [{ key: DUDE_KEY, frame: 4 }],
			frameRate: 20,
		});

		this.anims.create({
			key: "right",
			frames: this.anims.generateFrameNumbers(DUDE_KEY, {
				start: 5,
				end: 8,
			}),
			frameRate: 10,
			repeat: -1,
		});

		return player;
	}

	//  create group of Stars
	createStars() {
		const stars = this.physics.add.group({
			key: STAR_KEY,
			repeat: 11, // Create a star and add/clone 11 more
			// Place them on the X horizontal axis 14 pixels from the left
			// Place them on the Y vertical axis 0 pixels from the top
			// Distance between the stars should be 70px
			setXY: { x: 14, y: 0, stepX: 70 },
		});

		// iterate() -  apply some method to all elements in a group - (such as map())
		stars.children.iterate((child) => {
			child.setBounceY(Phaser.Math.FloatBetween(0.4, 0.8)); // random Y axis bounce value between 0.4 and 0.8
		});

		return stars;
	}

	collectStar(player, star) {
		// when player touches the star, star's body is disabled and its parent Game Object is made inactive & invisible ('deactivate this Game Object', 'hide this Game Object')
		star.disableBody(true, true);
		this.scoreLabel.add(10); // every type player touches the star - increase score by 10

		// if there are not left (is not active stars) any stars, we use the iterate function to re-enable all of the stars and reset their Y position to 0. This will make all of the stars drop from the top of the screen again.
		if (this.stars.countActive(true) === 0) {
			this.stars.children.iterate((child) => {
				child.enableBody(true, child.x, 0, true, true);
			});
		}

		this.bombSpawner.spawn(player.x);
	}

	createScoreLabel(x, y, score) {
		const style = { fontSize: "32px", fill: "#000" }; // style of the scoreboard
		const label = new ScoreLabel(this, x, y, score, style);

		// Add an Arcade Physics Body to the scoreboard - adds scoreboard to the Scene
		this.add.existing(label);

		return label;
	}

	hitBomb(player, bomb) {
		this.physics.pause(); // pause game

		player.setTint(0xff0000); // change player color to '0xff0000'

		player.anims.play("turn"); // set animation active

		this.gameOver = true;

		// call modall - show modal after pausing game
		this.modalShow();
	}

	// set parameters for restarting - set game in initial point
	restartGame() {
		this.registry.destroy(); // destroy registry
		this.events.off(); // disable all active events
		this.scene.restart(); // restart current scene
	}

	// all Modal logic goes here..
	modalShow() {
		let modal = document.getElementById("myModal");
		let restartBtn = document.getElementsByClassName("close")[0];

		modal.style.display = "block";
		restartBtn.addEventListener("click", (e) => {
			e.preventDefault();
			modal.style.display = "none";

			// restart after clicking 'restart'
			this.restartGame();
			this.resetTimer();
		});
	}

	/* ---------------------------------- Timer --------------------------------- */

	timer(isPaused) {
		(function start_timer() {
			var timer = document.getElementById("my_timer").innerHTML;
			var arr = timer.split(":");
			var hour = arr[0];
			var min = arr[1];
			var sec = arr[2];

			if (isPaused == false) {
				if (sec == 59) {
					if (min == 59) {
						hour++;
						min = 0;
						if (hour < 10) hour = "0" + hour;
					} else {
						min++;
					}
					if (min < 10) min = "0" + min;
					sec = 0;
				} else {
					sec++;
					if (sec < 10) sec = "0" + sec;
				}
			}

			document.getElementById("my_timer").innerHTML =
				hour + ":" + min + ":" + sec;
			setTimeout(start_timer, 1000);
		})();
	}

	resetTimer() {
		document.getElementById("my_timer").innerHTML =
			"00" + ":" + "00" + ":" + "00";
	}

	/* ---------------------------------- Timer --------------------------------- */
}
