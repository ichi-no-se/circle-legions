// src/scenes/ResultScene.ts
import Phaser from "phaser";
import { createButton } from "../ui/Button";

export class ResultScene extends Phaser.Scene {
    constructor() { super({ key: "ResultScene" }); }

    create(data: { stage: number, didWin: boolean, time: number }) {
        this.cameras.main.setBackgroundColor(0x0b0b12);

        const resultText = data.didWin ? "You Win!" : "You Lose!";
        this.add.text(this.cameras.main.width / 2, 150, resultText, {
            fontSize: "48px",
            color: "#ffffff"
        }).setOrigin(0.5);
        this.add.text(this.cameras.main.width / 2, 250, `Stage: ${data.stage}`, {
            fontSize: "32px",
            color: "#ffffff"
        }).setOrigin(0.5);
        this.add.text(this.cameras.main.width / 2, 300, `Time: ${data.time.toFixed(2)} seconds`, {
            fontSize: "32px",
            color: "#ffffff"
        }).setOrigin(0.5);

        if (data.didWin) {
            if (data.stage < 5) {
                const nextStageButton = createButton(this, "Next Stage", this.cameras.main.width / 2, 400);
                nextStageButton.on('pointerdown', () => {
                    this.scene.start("PlayScene", { stage: data.stage + 1 });
                });
            }
        }
        else {
            const retryButton = createButton(this, "Retry Stage", this.cameras.main.width / 2, 400);
            retryButton.on('pointerdown', () => {
                this.scene.start("PlayScene", { stage: data.stage });
            });
        }

        const backButton = createButton(this, "Back to Stage Select", this.cameras.main.width / 2, 500);

        backButton.on('pointerdown', () => {
            this.scene.start("StageSelectScene");
        });

        this.input.keyboard?.once("keydown-ESC", () => {
            this.scene.start("TitleScene");
        });
    }
}