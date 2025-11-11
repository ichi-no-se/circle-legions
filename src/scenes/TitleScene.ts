// src/scenes/TitleScene.ts
import Phaser from "phaser";

export class TitleScene extends Phaser.Scene {
    constructor() { super({ key: "TitleScene" }); }

    create() {
        this.cameras.main.setBackgroundColor(0x0b0b12);
        this.add.text(16, 16, "TitleScene (Press SPACE)", { color: "#fff" });

        this.input.keyboard?.once("keydown-SPACE", () => {
            this.scene.start("PlayScene", { stage: 1 });
        });
    }
}

