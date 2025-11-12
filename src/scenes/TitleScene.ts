// src/scenes/TitleScene.ts
import Phaser from "phaser";
import { createButton } from "../ui/Button";
export class TitleScene extends Phaser.Scene {
    constructor() {
        super({ key: "TitleScene" });
    }
    create() {
        this.cameras.main.setBackgroundColor(0x0b0b12);

        this.add.text(this.cameras.main.width / 2, 100, "Legion's Path", {
            fontSize: "64px",
            color: "#ffffff"
        }).setOrigin(0.5);

        const stageSelectButton = createButton(this, "Stage Select", this.cameras.main.width / 2, 350);
        stageSelectButton.on('pointerdown', () => {
            this.scene.start("StageSelectScene");
        });

        const howToPlayButton = createButton(this, "How To Play", this.cameras.main.width / 2, 450);
        howToPlayButton.on('pointerdown', () => {
            this.scene.start("HowToPlayScene");
        });
    }
}