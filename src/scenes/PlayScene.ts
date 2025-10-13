// src/scenes/PlayScene.ts
import Phaser from "phaser";
import { LassoAndRouteManager } from "../interaction/LassoAndRouteManager";
import { InputService } from "../input/InputService";
import { World } from "../core/World";
import { PlayerDecisionController } from "../controllers/Player/PlayerController";
import { PlayerVisualController } from "../controllers/Player/PlayerController";

export class PlayScene extends Phaser.Scene {
    private inputService!: InputService;
    private world!: World;
    private infantryCount = 200;
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

        // ランダムに歩兵を配置
        for (let i = 0; i < this.infantryCount; i++) {
            const x = Phaser.Math.Between(20, this.scale.width - 20);
            const y = Phaser.Math.Between(20, this.scale.height - 20);
            this.world.addUnit({ maxHp: 100, maxSpeed: 20, detectRange: 100, attackRange: 100, attackInterval: 1, attackDamage: 10, faction: "Player" }, undefined, new Phaser.Math.Vector2(x, y), Math.random() * Math.PI * 2, new PlayerDecisionController(), new PlayerVisualController());
        }

        // T キーで TitleScene へ遷移する例（データを渡す）
        this.input.keyboard?.once("keydown-T", () => {
            this.scene.start("TitleScene", { from: "PlayScene", score: 0 });
        });
    }

    // 毎フレームの更新（必要になったら使う）
    update(_time: number, _delta: number) {
        this.lassoAndRouteManager.update(this.inputService.intent, this.world);
        this.inputService.endFrame();
        this.world.update(_delta);
    }
}
