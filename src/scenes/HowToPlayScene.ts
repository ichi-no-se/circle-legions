// src/scenes/HowToPlayScene.ts
import Phaser from "phaser";
import {createButton} from "../ui/Button";

export class HowToPlayScene extends Phaser.Scene {
	constructor() {
		super({ key: "HowToPlayScene" });
	}

	create() {
		this.cameras.main.setBackgroundColor(0x0b0b12);

		this.add.text(this.cameras.main.width / 2, 100, "How To Play", {
			fontSize: "48px",
			color: "#ffffff"
		}).setOrigin(0.5);

		const instructions = "ドラッグで自ユニットを囲って選択します．\n" +
			"その後に，ドラッグで選択した自ユニットの移動ルートを指定します．\n" +
			"自ユニットは敵ユニットに近づくと自動で攻撃します．\n\n";
		this.add.text(this.cameras.main.width / 2, 250, instructions, {
			fontSize: "24px",
			color: "#ffffff",
			align: "center"
		}).setOrigin(0.5);

		const backButton = createButton(this, "Back to Title", this.cameras.main.width / 2, 500);
		backButton.on('pointerdown', () => {
			this.scene.start("TitleScene");
		});
		this.input.keyboard?.once("keydown-ESC", () => {
			this.scene.start("TitleScene");
		});
	}
}