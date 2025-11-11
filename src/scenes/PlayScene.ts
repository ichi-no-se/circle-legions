// src/scenes/PlayScene.ts
import Phaser from "phaser";
import { LassoAndRouteManager } from "../interaction/LassoAndRouteManager";
import { InputService } from "../input/InputService";
import { World } from "../core/World";
import { PlayerDecisionController, PlayerVisualController } from "../controllers/PlayerController";
import { EnemyDecisionControllerChase, EnemyVisualController } from "../controllers/EnemyController";
import { LineObstacle, CircleObstacle, RectangleObstacle } from "../core/Obstacle";

export class PlayScene extends Phaser.Scene {
    private inputService!: InputService;
    private world!: World;
    private lassoAndRouteManager!: LassoAndRouteManager;
    private stage!: number

    constructor() {
        super({ key: "PlayScene" });
    }

    preload() {
    }

    // シーンのセットアップ
    create(data: { stage: number }) {
        this.world = new World(this);
        this.inputService = new InputService(this);
        this.cameras.main.setBackgroundColor(0x0b0b12);
        this.lassoAndRouteManager = new LassoAndRouteManager(this);
        this.input.keyboard?.once("keydown-ESC", () => {
            this.scene.start("TitleScene");
        });
        this.stage = data.stage;

        if (data.stage === 1) {
            for (let i = 0; i < 5; i++) {
                for (let j = 0; j < 5; j++) {
                    const x = 100 + i * 40;
                    const y = 100 + j * 100;
                    this.world.addUnit({ maxHp: 100, maxSpeed: 10, intersectRange: 10, detectRange: 100, attackRange: 80, attackInterval: 1, attackDamage: 20, faction: "Player" }, new Phaser.Math.Vector2(x, y), 0, new PlayerDecisionController(), new PlayerVisualController());
                }
            }

            for (let i = 0; i < 5; i++) {
                for (let j = 0; j < 5; j++) {
                    const x = 700 - i * 40;
                    const y = 500 - j * 100;
                    this.world.addUnit({ maxHp: 100, maxSpeed: 10, intersectRange: 10, detectRange: 100, attackRange: 80, attackInterval: 1, attackDamage: 20, faction: "Enemy" }, new Phaser.Math.Vector2(x, y), Math.PI, new EnemyDecisionControllerChase(), new EnemyVisualController());
                }
            }

            const obstacles = [];
            obstacles.push(new LineObstacle(300, 100, 300, 500, 0xffffff, 1.0, 2, this));
            obstacles.push(new LineObstacle(350, 100, 350, 500, 0xffffff, 1.0, 2, this));
            obstacles.push(new LineObstacle(300, 100, 350, 100, 0xffffff, 0.5, 2, this));
            obstacles.push(new LineObstacle(300, 500, 350, 500, 0xffffff, 0.2, 2, this));

            obstacles.push(new RectangleObstacle(400, 100, 50, 200, 0xff0000, 1.0, this));
            obstacles.push(new CircleObstacle(600, 400, 30, 0x00ff00, 1.0, this));

            this.world.addObstacles(obstacles);
        }
        else if (data.stage === 2) {
            // Stage 2のユニット・障害物配置をここに追加
            this.world.addUnit({ maxHp: 100, maxSpeed: 10, intersectRange: 10, detectRange: 100, attackRange: 80, attackInterval: 1, attackDamage: 20, faction: "Player" }, new Phaser.Math.Vector2(0, 0), 0, new PlayerDecisionController(), new PlayerVisualController());
        }
        else if (data.stage === 3) {
            // Stage 3のユニット・障害物配置をここに追加
            this.world.addUnit({ maxHp: 100, maxSpeed: 10, intersectRange: 10, detectRange: 100, attackRange: 80, attackInterval: 1, attackDamage: 20, faction: "Enemy" }, new Phaser.Math.Vector2(0, 0), Math.PI, new EnemyDecisionControllerChase(), new EnemyVisualController());
        }

    }

    update(_time: number, _delta: number) {
        this.lassoAndRouteManager.update(this.inputService.intent, this.world);
        this.inputService.endFrame();
        this.world.update(_delta);
        if (this.world.enemyUnitsAllDead()) {
            this.scene.start("ResultScene", { stage: this.stage, didWin: true, time: this.world.getElapsedTime() });
        }
        if (this.world.allyUnitsAllDead()) {
            this.scene.start("ResultScene", { stage: this.stage, didWin: false, time: this.world.getElapsedTime() });
        }
    }
}
