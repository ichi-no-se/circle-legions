// src/scenes/PlayScene.ts
import Phaser from "phaser";
import { LassoAndRouteManager } from "../interaction/LassoAndRouteManager";
import { InputService } from "../input/InputService";
import { World } from "../core/World";
import { PlayerDecisionController, PlayerVisualController } from "../controllers/PlayerController";
import { EnemyDecisionControllerChase, EnemyVisualController } from "../controllers/EnemyController";

export class PlayScene extends Phaser.Scene {
    private inputService!: InputService;
    private world!: World;
    private lassoAndRouteManager!: LassoAndRouteManager;

    constructor() {
        super({ key: "PlayScene" });
    }

    preload() {
    }

    // シーンのセットアップ
    create() {
        this.world = new World(this);
        this.inputService = new InputService(this);
        this.cameras.main.setBackgroundColor(0x101015);
        this.lassoAndRouteManager = new LassoAndRouteManager(this);

        for (let i = 0; i < 5; i++) {
            for (let j = 0; j < 5; j++) {
                const x = 100 + i * 40;
                const y = 100 + j * 100;
                this.world.addUnit({ maxHp: 100, maxSpeed: 10, detectRange: 100, attackRange: 100, attackInterval: 1, attackDamage: 10, faction: "Player" }, undefined, new Phaser.Math.Vector2(x, y), 0, new PlayerDecisionController(), new PlayerVisualController());
            }
        }

        for (let i = 0; i < 5; i++) {
            for (let j = 0; j < 5; j++) {
                const x = 700 - i * 40;
                const y = 500 - j * 100;
                this.world.addUnit({ maxHp: 100, maxSpeed: 10, detectRange: 100, attackRange: 100, attackInterval: 1, attackDamage: 10, faction: "Enemy" }, undefined, new Phaser.Math.Vector2(x, y), Math.PI, new EnemyDecisionControllerChase(), new EnemyVisualController());
            }
        }

        // T キーで TitleScene へ遷移する例（データを渡す）
        this.input.keyboard?.once("keydown-T", () => {
            this.scene.start("TitleScene", { from: "PlayScene", score: 0 });
        });
    }

    update(_time: number, _delta: number) {
        this.lassoAndRouteManager.update(this.inputService.intent, this.world);
        this.inputService.endFrame();
        this.world.update(_delta);
    }
}
