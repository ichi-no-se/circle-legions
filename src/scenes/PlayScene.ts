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

        const defaultSpec = { maxHp: 100, maxSpeed: 12, intersectRange: 10, detectRange: 100, attackRange: 80, attackInterval: 1, attackDamage: 20 };
        const playerSpec = { ...defaultSpec, faction: "Player" as const };
        const enemySpec = { ...defaultSpec, faction: "Enemy" as const };
        const edgeBuffer = 50;
        this.world.addObstacle(new RectangleObstacle(edgeBuffer, edgeBuffer, this.cameras.main.width - 2 * edgeBuffer, this.cameras.main.height - 2 * edgeBuffer, 0xffffff, 0.0, 5.0, 1.0, this));

        const centerX = this.cameras.main.width / 2;
        const centerY = this.cameras.main.height / 2;

        if (data.stage === 1) {
            for (let i = 0; i < 5; i++){
                const x = 150;
                const y = centerY + (i - 2) * 80;
                this.world.addUnit(playerSpec, new Phaser.Math.Vector2(x, y), 0, new PlayerDecisionController(), new PlayerVisualController());
            }

            for (let i = 0; i < 4; i++){
                const x = this.cameras.main.width - 150;
                const y = centerY + (i - 1.5) * 100;
                this.world.addUnit(enemySpec, new Phaser.Math.Vector2(x, y), Math.PI, new EnemyDecisionControllerChase(), new EnemyVisualController());
            }

            const obstacles = [];
            obstacles.push(new LineObstacle(centerX - 100, centerY, centerX, centerY - 100, 0xffffff, 1.0, 2, this));
            obstacles.push(new LineObstacle(centerX - 100, centerY, centerX, centerY + 100, 0xffffff, 1.0, 2, this));
            obstacles.push(new LineObstacle(centerX + 100, centerY, centerX, centerY - 100, 0xffffff, 1.0, 2, this));
            obstacles.push(new LineObstacle(centerX + 100, centerY, centerX, centerY + 100, 0xffffff, 1.0, 2, this));
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
        else if (data.stage === 4) {
            // Stage 4のユニット・障害物配置をここに追加
        }
        else if (data.stage === 5) {
            for (let i = 0; i < 3; i++) {
                const x = 150;
                const y = centerY + (i - 1) * 100;
                this.world.addUnit(playerSpec, new Phaser.Math.Vector2(x, y), 0, new PlayerDecisionController(), new PlayerVisualController());
            }

            for (let i = 0; i < 5; i++) {
                const x = this.cameras.main.width - 150;
                const y = centerY + (i - 2) * 80;
                this.world.addUnit(enemySpec, new Phaser.Math.Vector2(x, y), Math.PI, new EnemyDecisionControllerChase(), new EnemyVisualController());
            }

            const obstacles = [];
            obstacles.push(new LineObstacle(centerX - 100, centerY, centerX, centerY - 100, 0xffffff, 1.0, 2, this));
            obstacles.push(new LineObstacle(centerX - 100, centerY, centerX, centerY + 100, 0xffffff, 1.0, 2, this));
            obstacles.push(new LineObstacle(centerX + 100, centerY, centerX, centerY - 100, 0xffffff, 1.0, 2, this));
            obstacles.push(new LineObstacle(centerX + 100, centerY, centerX, centerY + 100, 0xffffff, 1.0, 2, this));
            this.world.addObstacles(obstacles);
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
