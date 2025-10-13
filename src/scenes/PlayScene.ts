// src/scenes/PlayScene.ts
import Phaser from "phaser";
import { Lasso } from "../objects/Lasso";
import { Route } from "../objects/Route";
import { InputService } from "../input/InputService";
import { World } from "../core/World";
import { PlayerController } from "../controllers/Player/PlayerController";
import { createArrowTexture } from "../util/Textures";

export class PlayScene extends Phaser.Scene {
    private lasso!: Lasso;
    private route!: Route;
    private inputService!: InputService;
    private world!: World;
    private infantryCount = 200;
    private nowDrawing!: 'Lasso' | 'Route' | 'None';
    private selectedUnitIds!: number[];

    constructor() {
        super({ key: "PlayScene" });
    }

    preload() {
    }

    // シーンのセットアップ
    create() {
        this.lasso = new Lasso(this.add.graphics());
        this.route = new Route(this.add.graphics());
        this.world = new World();
        this.inputService = new InputService(this);
        this.cameras.main.setBackgroundColor(0x101015);
        this.nowDrawing = 'None';
        this.selectedUnitIds = [];

        // ランダムに歩兵を配置
        for (let i = 0; i < this.infantryCount; i++) {
            const x = Phaser.Math.Between(20, this.scale.width - 20);
            const y = Phaser.Math.Between(20, this.scale.height - 20);
            const textureKey = createArrowTexture(this, { width: 12, height: 10, fillColor: 0x00ff00, strokeColor: 0xffff00, strokeWidth: 1 });
            const sprite = this.add.image(x, y, textureKey).setOrigin(0.5);
            this.world.addUnit({ maxHp: 100, maxSpeed: 20, detectRange: 100, attackRange: 100, attackInterval: 1, attackDamage: 10, faction: "Player" }, sprite, new Phaser.Math.Vector2(x, y), 0, new PlayerController());
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
                let selectedCount = 0;
                for (const id of this.selectedUnitIds) {
                    const unit = this.world.getUnitById(id);
                    if (unit && unit.isAlive() && unit.getController() instanceof PlayerController) {
                        selectedCount++;
                    }
                }
                if (selectedCount > 0) {
                    this.nowDrawing = 'Route';
                } else {
                    this.nowDrawing = 'Lasso';
                }
            }
        }
        if (this.nowDrawing === 'Lasso') {
            this.lasso.update(this.inputService.intent);
            this.selectedUnitIds = [];
            if (this.lasso.isValid()) {
                for (const unit of this.world.getUnitIterator()) {
                    if (unit.getController() instanceof PlayerController) {
                        if (this.lasso.contains(unit.getPos())) {
                            this.selectedUnitIds.push(unit.id);
                        }
                    }
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
                for (const id of this.selectedUnitIds) {
                    const unit = this.world.getUnitById(id);
                    const controller = unit?.getController();
                    if (controller instanceof PlayerController) {
                        controller.setRoute(this.route.getRandomSampledPoints(20));
                    }
                }
                this.route.clear();
                this.selectedUnitIds = [];
                this.nowDrawing = 'None';
            }
            this.route.draw();
        }
        this.inputService.endFrame();
        this.world.update(_delta);
        console.log(`Selected: ${this.selectedUnitIds.length}`);
    }
}
