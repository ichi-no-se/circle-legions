import Phaser from 'phaser';
import { type DecisionController, type VisualController, Unit, type MoveIntent } from '../core/Unit';
import { World } from '../core/World';
import { createArrowTexture } from "../util/Textures";
import { HPBar } from '../ui/HPBar';


export class PlayerDecisionController implements DecisionController {
    private owner!: Unit;
    private targetPoints: Phaser.Math.Vector2[] = [];
    private currentTargetIndex: number = 0;
    private static readonly THRESHOLD_REACHED = 4;
    private static readonly ENEMY_SEARCH_INTERVAL = 0.5;
    private enemySearchTimer: number = Phaser.Math.Between(0, PlayerDecisionController.ENEMY_SEARCH_INTERVAL);
    private currentEnemyId: number | null = null;

    bind(owner: Unit): void {
        this.owner = owner;
    }

    update(dt: number, world: World): MoveIntent {
        const prevEnemyId = this.currentEnemyId;
        this.enemySearchTimer -= dt;
        while (this.enemySearchTimer <= 0) {
            this.enemySearchTimer += PlayerDecisionController.ENEMY_SEARCH_INTERVAL;
            let nearestEnemy = world.queryAliveNearestUnit(this.owner.getPos(), this.owner.spec.detectRange, 'Enemy');
            if (nearestEnemy) {
                this.currentEnemyId = nearestEnemy.id;
            }
            else {
                this.currentEnemyId = null;
            }
        }
        if (this.currentEnemyId !== null) {
            const enemy = world.getUnitById(this.currentEnemyId);
            if (!enemy || !enemy.isAlive()) {
                this.currentEnemyId = null;
            }
            else {
                return { type: 'MoveTo', point: enemy.getPos(), speed: this.owner.spec.maxSpeed };
            }
        }
        if (prevEnemyId !== null && this.currentEnemyId === null) {
            // 敵を見失った・倒した場合、ルートの最寄り地点の次の点から再開
            // 最寄り地点だと少し戻ることになる可能性があるため
            let closestIndex = -1;
            let closestDist = Number.MAX_VALUE;
            for (let i = this.currentTargetIndex; i < this.targetPoints.length; i++) {
                const dist = this.owner.getPos().distance(this.targetPoints[i]);
                if (dist < closestDist) {
                    closestDist = dist;
                    closestIndex = i;
                }
            }
            if (closestIndex !== -1) {
                // 次の点から再開
                // もし最寄り地点が最後の点ならルート完了扱いにする
                this.currentTargetIndex = closestIndex + 1;
            }
        }
        while (this.currentTargetIndex < this.targetPoints.length && this.owner.getPos().distance(this.targetPoints[this.currentTargetIndex]) < PlayerDecisionController.THRESHOLD_REACHED) {
            this.currentTargetIndex++;
        }
        if (this.isRouteComplete()) {
            return { type: 'RandomWalk' };
        }
        else {
            return { type: 'MoveTo', point: this.targetPoints[this.currentTargetIndex], speed: this.owner.spec.maxSpeed };
        }
    }

    isRouteComplete(): boolean {
        return this.currentTargetIndex >= this.targetPoints.length;
    }

    setRoute(points: Phaser.Math.Vector2[]) {
        if (points.length === 0) return;
        this.targetPoints = [];
        const currentPos = this.owner.getPos();
        const firstPoint = points[0];
        for (let i = 1; i < points.length; i++) {
            const p = points[i];
            this.targetPoints.push(p.subtract(firstPoint).add(currentPos));
        }
        this.currentTargetIndex = 0;
    }

    getCurrentEnemyId(): number | null {
        return this.currentEnemyId;
    }
}

export class PlayerVisualController implements VisualController {
    private owner!: Unit;
    private characterSprite!: Phaser.GameObjects.Image;
    private hpBar!: HPBar;
    private isSelected: boolean = false;
    private routeGraphics!: Phaser.GameObjects.Graphics;
    private static readonly OFFSET_HP_BAR = new Phaser.Math.Vector2(0, -25);


    bind(owner: Unit, scene: Phaser.Scene): void {
        this.owner = owner;
        this.updateCharacterSprite(scene);
        this.hpBar = new HPBar(scene);
        this.routeGraphics = scene.add.graphics();
    }

    update(dt: number, world: World): void {
        const scene = world.getScene();
        this.updateCharacterSprite(scene);
        const hpBarPos = this.owner.getPos().add(PlayerVisualController.OFFSET_HP_BAR);
        this.hpBar.setPosition(hpBarPos.x, hpBarPos.y);
        const hpRatio = this.owner.getHp() / this.owner.spec.maxHp;
        this.hpBar.setRatio(hpRatio);
        this.updateRouteGraphics();
    }

    destroy(): void {
        this.characterSprite.destroy();
        this.hpBar.destroy();
        this.routeGraphics.destroy();
    }

    updateCharacterSprite(scene: Phaser.Scene): void {
        if (this.characterSprite) {
            this.characterSprite.destroy();
        }
        const fillColor = this.isSelected ? 0x00ff00 : 0xffff00;
        let strokeColor = 0xffffff;
        const decisionController = this.owner.getDecisionController();
        if (decisionController instanceof PlayerDecisionController) {
            if (decisionController.getCurrentEnemyId() !== null) {
                strokeColor = 0xff0000;
            }
            else if (!decisionController.isRouteComplete()) {
                strokeColor = 0xff00ff;
            }
        }
        const textureKey = createArrowTexture(scene, { width: 12, height: 10, fillColor: fillColor, strokeColor: strokeColor, strokeWidth: 1 })
        this.characterSprite = scene.add.image(this.owner.getPos().x, this.owner.getPos().y, textureKey).setOrigin(0.5);

        const pos = this.owner.getPos();
        this.characterSprite.setPosition(pos.x, pos.y);
        this.characterSprite.setRotation(this.owner.getAngle());
    }

    updateRouteGraphics(): void {
        this.routeGraphics.clear();
        const decisionController = this.owner.getDecisionController();
        if (decisionController instanceof PlayerDecisionController) {
            if (decisionController.isRouteComplete()) {
                return;
            }
            const points = decisionController['targetPoints'];
            const currentIndex = decisionController['currentTargetIndex'];
            this.routeGraphics.lineStyle(2, 0xff0000, 0.2);
            this.routeGraphics.beginPath();
            this.routeGraphics.moveTo(this.owner.getPos().x, this.owner.getPos().y);
            for (let i = currentIndex; i < points.length; i++) {
                const p = points[i];
                this.routeGraphics.lineTo(p.x, p.y);
            }
            this.routeGraphics.strokePath();
        }
    }

    setSelected(selected: boolean) {
        this.isSelected = selected;
    }
}
