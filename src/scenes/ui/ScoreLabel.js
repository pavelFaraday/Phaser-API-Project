import Phaser from "phaser";

/* We've chosen to do so to keep all the score updating logic in one place. This will keep our GameScene class smaller and easier to read.

Also, Encapsulating common logic for reusability is a best practice. Because we made a ScoreLabel class we can use it again in a different Scene without duplicating
*/

// template literals - ('Score:' + score)
const formatScore = (score) => `Score: ${score}`;

export default class ScoreLabel extends Phaser.GameObjects.Text {
	constructor(scene, x, y, score, style) {
		super(scene, x, y, formatScore(score), style);

		this.score = score;
	}

	setScore(score) {
		this.score = score;
		this.updateScoreText();
	}

	add(points) {
		this.setScore(this.score + points);
	}

	updateScoreText() {
		this.setText(formatScore(this.score));
	}
}
