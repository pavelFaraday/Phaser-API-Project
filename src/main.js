import Phaser from "phaser";
import GameScene from "./scenes/GameScene";

/* 
-- WebGL is used to render interactive 2D and 3D graphics in compatible web browsers.\
-- Canvas API provides a means for drawing graphics via JavaScript and the HTML `<canvas>` element. Among other things, it can be used for animation, game graphics, data visualization, photo manipulation, and real-time video processing. 


*/

// set configuration as a JS object:
const config = {
	// how will Phaser render this game in the browser: will it use 'WebGL' or it will use 'Canvas API' `type: Phaser.AUTO` - means let Phaser decide which to choose ('WebGL' or 'Canvas API'). Phaser will use 'WebGL' if it will be available. And if not, it will use 'Canvas API'.
	type: Phaser.AUTO,
	// size/dimentions of a game/gamescene, expressed in pixels (game dimensions can be any size)
	width: 800,
	height: 600,
	physics: {
		default: "arcade", // we're using the Arcade Physics system
		arcade: {
			gravity: { y: 300 }, // gravity range on y axis (value to 300 from 200 to match the official Phaser guide.)
		},
	},
	// scene - we had created
	scene: [GameScene],
};

// Create a new game & pass the configuration we had created
export default new Phaser.Game(config);
