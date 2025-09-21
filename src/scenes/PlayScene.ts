// src/scenes/PlayScene.ts
import Phaser from "phaser";
import { Lasso } from "../objects/Lasso";
import { Route } from "../objects/Route";
import { InputService } from "../input/InputService";
import { Infantry } from "../units/Infantry";

export class PlayScene extends Phaser.Scene {
    private lasso!: Lasso;
    private route!: Route;
    private inputService!: InputService;
    private infantry!: Infantry[];
    private infantryCount = 200;
    private nowDrawing!: 'Lasso' | 'Route' | 'None';

    constructor() {
        super({ key: "PlayScene" });
    }

    preload() {
    }

    // シーンのセットアップ
    create() {
        this.lasso = new Lasso(this.add.graphics());
        this.route = new Route(this.add.graphics());
        this.inputService = new InputService(this);
        this.cameras.main.setBackgroundColor(0x101015);
        this.infantry = [];
        this.nowDrawing = 'None';

        // ランダムに歩兵を配置
        for (let i = 0; i < this.infantryCount; i++) {
            const x = Phaser.Math.Between(20, this.scale.width - 20);
            const y = Phaser.Math.Between(20, this.scale.height - 20);
            const infantry = new Infantry(this, new Phaser.Math.Vector2(x, y));
            this.infantry.push(infantry);
        }

        // T キーで TitleScene へ遷移する例（データを渡す）
        this.input.keyboard?.once("keydown-T", () => {
            this.scene.start("TitleScene", { from: "PlayScene", score: 0 });
        });
    }

    // 毎フレームの更新（必要になったら使う）
    update(_time: number, _delta: number) {
        if (this.nowDrawing === 'None') {
            if (this.inputService.intent.isDown) {
                let anySelected = false;
                for (const infantry of this.infantry) {
                    anySelected = anySelected || infantry.isSelected();
                }
                if (anySelected) {
                    this.nowDrawing = 'Route';
                } else {
                    this.nowDrawing = 'Lasso';
                }
            }
        }
        if (this.nowDrawing === 'Lasso') {
            this.lasso.update(this.inputService.intent);
            if (this.lasso.isValid()) {
                for (const infantry of this.infantry) {
                    infantry.setSelected(this.lasso.contains(infantry.getPosition()));
                }
            }
            else {
                for (const infantry of this.infantry) {
                    infantry.setSelected(false);
                }
            }
            if (this.inputService.intent.isDown === false) {
                this.nowDrawing = 'None';
                this.lasso.clear();
            }
            this.lasso.draw();
        }
        if (this.nowDrawing === 'Route') {
            this.route.update(this.inputService.intent);
            if (this.inputService.intent.isDown === false) {
                for (const infantry of this.infantry) {
                    if (infantry.isSelected()) {
                        infantry.setRoute(this.route.getRandomSampledPoints(20));
                        infantry.setSelected(false);
                    }
                }
                this.route.clear();
                this.nowDrawing = 'None';
            }
            this.route.draw();
        }
        this.inputService.endFrame();
        for (const infantry of this.infantry) {
            infantry.update(_delta);
        }
    }
}
