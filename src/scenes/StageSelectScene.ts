// src/scenes/StageSelectScene.ts
import Phaser from "phaser";
import {createButton} from "../ui/Button";

export class StageSelectScene extends Phaser.Scene {
	constructor() {
		super({ key: "StageSelectScene" });
	}
	create() {
		this.cameras.main.setBackgroundColor(0x0b0b12);

		this.add.text(this.cameras.main.width / 2, 100, "Stage Select", {
			fontSize: "48px",
			color: "#ffffff"
		}).setOrigin(0.5);

		const stages = ["Stage 1", "Stage 2", "Stage 3", "Stage 4", "Stage 5"];
		stages.forEach((stage, index) => {
			const stageButton = createButton(this, stage, this.cameras.main.width / 2, 180 + index * 60);
			stageButton.on('pointerdown', () => {
				this.scene.start("PlayScene", { stage: index + 1 });
			});
		});
		const backButton = createButton(this, "Back to Title", this.cameras.main.width / 2, 500);
		backButton.on('pointerdown', () => {
			this.scene.start("TitleScene");
		});
		this.input.keyboard?.once("keydown-ESC", () => {
			this.scene.start("TitleScene");
		});
	}
}