// src/scenes/PlayScene.ts
import Phaser from "phaser";
import { Lasso } from "../objects/Lasso";
import { InputService } from "../input/InputService";

export class PlayScene extends Phaser.Scene {
    private lasso!: Lasso;
    private inputService!: InputService;

    private dots: Phaser.GameObjects.Arc[] = [];
    private dotCount = 100;

    constructor() {
        super({ key: "PlayScene" });
    }

    preload() {
    }

    // シーンのセットアップ
    create() {
        this.lasso = new Lasso(this.add.graphics());
        this.inputService = new InputService(this);
        this.cameras.main.setBackgroundColor(0x101015);

        // ランダムな点を配置
        for (let i = 0; i < this.dotCount; i++) {
            const x = Phaser.Math.Between(20, this.scale.width - 20);
            const y = Phaser.Math.Between(20, this.scale.height - 20);
            const dot = this.add.circle(x, y, 3, 0xffffff);
            this.dots.push(dot);
        }

        // T キーで TitleScene へ遷移する例（データを渡す）
        this.input.keyboard?.once("keydown-T", () => {
            this.scene.start("TitleScene", { from: "PlayScene", score: 0 });
        });
    }

    // 毎フレームの更新（必要になったら使う）
    update(_time: number, _delta: number) {
        this.lasso.update(this.inputService.intent);
        if (this.inputService.intent.isDown === false) {
            this.lasso.clear();
        }
        this.lasso.draw();
        this.updateDotColors();
        this.inputService.endFrame();
    }

    private resetDotColors() {
        this.dots.forEach(dot => {
            dot.setFillStyle(0xffffff);
        });
    }

    private updateDotColors() {
        if (!this.lasso.isValid()) {
            this.resetDotColors();
            return;
        }
        for (const dot of this.dots) {
            const inside = this.lasso.isInside(new Phaser.Math.Vector2(dot.x, dot.y));
            if (inside) {
                dot.setFillStyle(0x22cc66);
            }
            else {
                dot.setFillStyle(0xffffff);
            }
        }
    }
}
