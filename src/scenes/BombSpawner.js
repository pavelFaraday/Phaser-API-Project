import Phaser from "phaser";

export default class BombSpawner {
	/**
	 * @param {Phaser.Scene} scene //  include scene from Phaser packgage
	 */
	constructor(scene, bombKey = "bomb") {
		this.scene = scene;
		this.key = bombKey;

		this._group = this.scene.physics.add.group();
	}

	get group() {
		return this._group;
	}

	// set bombs random movements
	spawn(playerX = 0) {
		const x =
			playerX < 400
				? Phaser.Math.Between(400, 800)
				: Phaser.Math.Between(0, 400);

		const bomb = this.group.create(x, 16, this.key); // create bombKey group
		bomb.setBounce(1); //  Sensitivity of a collision or jump
		bomb.setCollideWorldBounds(true); // bombs collide with the other bodies/characters
		bomb.setVelocity(Phaser.Math.Between(-200, 200), 20); // Set range of velocity/speed of the bomb body

		return bomb;
	}
}
