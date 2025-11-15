// src/scenes/PlayScene.ts
import Phaser from "phaser";
import { LassoAndRouteManager } from "../interaction/LassoAndRouteManager";
import { InputService } from "../input/InputService";
import { World } from "../core/World";
import { PlayerDecisionController, PlayerVisualController } from "../controllers/PlayerController";
import { EnemyDecisionControllerChase, EnemyVisualController } from "../controllers/EnemyController";
import { LineObstacle, CircleObstacle, RectangleObstacle, type Obstacle } from "../core/Obstacle";

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

        const centerX = this.cameras.main.width / 2;
        const centerY = this.cameras.main.height / 2;

        if (data.stage === 1) {
            for (let i = 0; i < 5; i++) {
                const x = 150;
                const y = centerY + (i - 2) * 80;
                this.world.addUnit(playerSpec, new Phaser.Math.Vector2(x, y), 0, new PlayerDecisionController(), new PlayerVisualController());
            }

            for (let i = 0; i < 4; i++) {
                const x = this.cameras.main.width - 150;
                const y = centerY + (i - 1.5) * 100;
                this.world.addUnit(enemySpec, new Phaser.Math.Vector2(x, y), Math.PI, new EnemyDecisionControllerChase(), new EnemyVisualController());
            }

            const obstacles: Obstacle[] = [];
            const edgeBuffer = 50;
            obstacles.push(new RectangleObstacle(edgeBuffer, edgeBuffer, this.cameras.main.width - 2 * edgeBuffer, this.cameras.main.height - 2 * edgeBuffer, 0xffffff, 0.0, 5.0, 1.0, this));
            obstacles.push(new CircleObstacle(centerX, centerY, 60, 0xffffff, 0.0, 2.0, 1.0, this));
            this.world.addObstacles(obstacles);
        }
        else if (data.stage === 2) {
            for (let i = 0; i < 6; i++) {
                for (let j = 0; j < 3; j++) {
                    const x = 180 - j * 35;
                    const y = centerY + (i - 2.5) * 75;
                    this.world.addUnit(playerSpec, new Phaser.Math.Vector2(x, y), 0, new PlayerDecisionController(), new PlayerVisualController());
                }
            }

            for (let i = 0; i < 6; i++) {
                for (let j = 0; j < 3; j++) {
                    const x = this.cameras.main.width - 180 + j * 35;
                    const y = centerY + (i - 2.5) * 75;
                    this.world.addUnit(enemySpec, new Phaser.Math.Vector2(x, y), Math.PI, new EnemyDecisionControllerChase(), new EnemyVisualController());
                }
            }

            const obstacles: Obstacle[] = [];
            const edgeBuffer = 50;
            obstacles.push(new RectangleObstacle(edgeBuffer, edgeBuffer, this.cameras.main.width - 2 * edgeBuffer, this.cameras.main.height - 2 * edgeBuffer, 0xffffff, 0.0, 5.0, 1.0, this));
            obstacles.push(new CircleObstacle(centerX, centerY, 40, 0xffffff, 0.0, 2.0, 1.0, this));
            obstacles.push(new CircleObstacle(centerX - 30, centerY - 150, 40, 0xffffff, 0.0, 2.0, 1.0, this));
            obstacles.push(new CircleObstacle(centerX + 30, centerY + 150, 40, 0xffffff, 0.0, 2.0, 1.0, this));
            this.world.addObstacles(obstacles);
        }
        else if (data.stage === 3) {
            for (let i = 0; i < 3; i++) {
                for (let j = 0; j < 3; j++) {
                    if (i + j == 1) continue;
                    const x = centerX - 220 + j * 30;
                    const y = centerY - 220 + i * 30;
                    this.world.addUnit(playerSpec, new Phaser.Math.Vector2(x, y), Math.PI * 1 / 4, new PlayerDecisionController(), new PlayerVisualController());
                }
            }

            for (let i = 0; i < 3; i++) {
                for (let j = 0; j < 3; j++) {
                    if (i + j == 1) continue;
                    const x = centerX + 220 - j * 30;
                    const y = centerY + 220 - i * 30;
                    this.world.addUnit(playerSpec, new Phaser.Math.Vector2(x, y), Math.PI * 5 / 4, new PlayerDecisionController(), new PlayerVisualController());
                }
            }

            for (let i = 0; i < 3; i++) {
                for (let j = 0; j < 3; j++) {
                    const x = centerX - 220 + j * 30;
                    const y = centerY + 220 - i * 30;
                    this.world.addUnit(enemySpec, new Phaser.Math.Vector2(x, y), Math.PI * 7 / 4, new EnemyDecisionControllerChase(), new EnemyVisualController());
                }
            }

            for (let i = 0; i < 3; i++) {
                for (let j = 0; j < 3; j++) {
                    const x = centerX + 220 - j * 30;
                    const y = centerY - 220 + i * 30;
                    this.world.addUnit(enemySpec, new Phaser.Math.Vector2(x, y), Math.PI * 3 / 4, new EnemyDecisionControllerChase(), new EnemyVisualController());
                }
            }

            const obstacles: Obstacle[] = [];
            const edgeLength = 500;
            obstacles.push(new RectangleObstacle(centerX - edgeLength / 2, centerY - edgeLength / 2, edgeLength, edgeLength, 0xffffff, 0.0, 5.0, 1.0, this));
            obstacles.push(new CircleObstacle(centerX, centerY, 60, 0xffffff, 0.0, 2.0, 1.0, this));
            obstacles.push(new LineObstacle(centerX - edgeLength / 2, centerY - 80, centerX - edgeLength / 2 + 80, centerY, 0xffffff, 1.0, 2, this));
            obstacles.push(new LineObstacle(centerX - edgeLength / 2, centerY + 80, centerX - edgeLength / 2 + 80, centerY, 0xffffff, 1.0, 2, this));
            obstacles.push(new LineObstacle(centerX + edgeLength / 2, centerY + 80, centerX + edgeLength / 2 - 80, centerY, 0xffffff, 1.0, 2, this));
            obstacles.push(new LineObstacle(centerX + edgeLength / 2, centerY - 80, centerX + edgeLength / 2 - 80, centerY, 0xffffff, 1.0, 2, this));
            obstacles.push(new LineObstacle(centerX - 80, centerY - edgeLength / 2, centerX, centerY - edgeLength / 2 + 80, 0xffffff, 1.0, 2, this));
            obstacles.push(new LineObstacle(centerX + 80, centerY - edgeLength / 2, centerX, centerY - edgeLength / 2 + 80, 0xffffff, 1.0, 2, this));
            obstacles.push(new LineObstacle(centerX - 80, centerY + edgeLength / 2, centerX, centerY + edgeLength / 2 - 80, 0xffffff, 1.0, 2, this));
            obstacles.push(new LineObstacle(centerX + 80, centerY + edgeLength / 2, centerX, centerY + edgeLength / 2 - 80, 0xffffff, 1.0, 2, this));
            this.world.addObstacles(obstacles);
        }
        else if (data.stage === 4) {
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

            const obstacles: Obstacle[] = [];
            const edgeBuffer = 50;
            obstacles.push(new RectangleObstacle(edgeBuffer, edgeBuffer, this.cameras.main.width - 2 * edgeBuffer, this.cameras.main.height - 2 * edgeBuffer, 0xffffff, 0.0, 5.0, 1.0, this));
            obstacles.push(new CircleObstacle(centerX, centerY, 60, 0xffffff, 0.0, 2.0, 1.0, this));
            this.world.addObstacles(obstacles);
        }
        else if (data.stage === 5) {
            for (let i = 0; i < 3; i++) {
                for (let j = 0; j < 3; j++) {
                    const xBase = centerX - (i - 1) * 200;
                    const yBase = centerY - (j - 1) * 200;
                    for (let k = 0; k < 2; k++) {
                        for (let l = 0; l < 2; l++) {
                            const x = xBase + (k - 0.5) * 40;
                            const y = yBase + (l - 0.5) * 40;
                            const angle = Phaser.Math.Angle.Between(x, y, centerX, centerY);
                            if ((i + j) % 2 === 0) {
                                this.world.addUnit(enemySpec, new Phaser.Math.Vector2(x, y), angle, new EnemyDecisionControllerChase(), new EnemyVisualController());
                            }
                            else {
                                this.world.addUnit(playerSpec, new Phaser.Math.Vector2(x, y), angle, new PlayerDecisionController(), new PlayerVisualController());
                            }
                        }
                    }
                }
            }
            const obstacles: Obstacle[] = [];
            const edgeLength = 500;
            obstacles.push(new RectangleObstacle(centerX - edgeLength / 2, centerY - edgeLength / 2, edgeLength, edgeLength, 0xffffff, 0.0, 5.0, 1.0, this));
            for (let i = 0; i < 2; i++) {
                for (let j = 0; j < 2; j++) {
                    const x = centerX - 100 + i * 200;
                    const y = centerY - 100 + j * 200;
                    obstacles.push(new CircleObstacle(x, y, 50, 0xffffff, 0.0, 2.0, 1.0, this));
                }
            }
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
