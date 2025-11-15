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

		const instructions = "操作方法\n\n" +
			"1. ドラッグでユニットを囲って選択\n" +
			"2. ドラッグで選択したユニットの移動ルートを指定\n\n" +
			"敵ユニットに近づくと自動で攻撃します\n" +
			"敵ユニットを全て倒すとステージクリアです\n\n" +
			"Esc キーまたは下のボタンでタイトルに戻ります";
		this.add.text(this.cameras.main.width / 2, 300, instructions, {
			fontSize: "24px",
			color: "#ffffff",
			align: "center"
		}).setOrigin(0.5);

		const backButton = createButton(this, "Back to Title", this.cameras.main.width / 2, 480);
		backButton.on('pointerdown', () => {
			this.scene.start("TitleScene");
		});
		this.input.keyboard?.once("keydown-ESC", () => {
			this.scene.start("TitleScene");
		});
	}
}