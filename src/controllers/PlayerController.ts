import Phaser from 'phaser';
import { type DecisionController, type VisualController, Unit, type MoveIntent } from '../core/Unit';
import { World } from '../core/World';
import { createArrowTexture } from "../util/Textures";
import { HPBar } from '../ui/HPBar';


export class PlayerDecisionController implements DecisionController {
    private owner!: Unit;
    private targetVectors: Phaser.Math.Vector2[] = [];
    private currentSegmentIndex: number = 0;
    private distanceTraveledOnSegment: number = 0;
    private static readonly ENEMY_SEARCH_INTERVAL = 0.5;
    private enemySearchTimer: number = Phaser.Math.Between(0, PlayerDecisionController.ENEMY_SEARCH_INTERVAL);
    private currentEnemyId: number | null = null;

    bind(owner: Unit): void {
        this.owner = owner;
    }

    update(dt: number, world: World): MoveIntent {
        this.distanceTraveledOnSegment += this.owner.spec.maxSpeed * dt;
        this.enemySearchTimer -= dt;
        while (!this.isRouteComplete() && this.distanceTraveledOnSegment >= this.targetVectors[this.currentSegmentIndex].length()) {
            this.distanceTraveledOnSegment -= this.targetVectors[this.currentSegmentIndex].length();
            this.currentSegmentIndex++;
        }
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
        if (this.isRouteComplete()) {
            return { type: 'RandomWalk' };
        }
        else {
            const vec = this.targetVectors[this.currentSegmentIndex].clone().normalize().scale(this.owner.spec.maxSpeed);
            return { type: 'MoveVel', vel: vec };
        }
    }

    isRouteComplete(): boolean {
        return this.currentSegmentIndex >= this.targetVectors.length;
    }

    setRoute(points: Phaser.Math.Vector2[]) {
        if (points.length === 0) return;
        this.targetVectors = [];
        for (let i = 1; i < points.length; i++) {
            this.targetVectors.push(points[i].clone().subtract(points[i - 1]));
        }
        this.currentSegmentIndex = 0;
        this.distanceTraveledOnSegment = 0;
    }

    getCurrentEnemyId(): number | null {
        return this.currentEnemyId;
    }

    getTargetVectors(): Phaser.Math.Vector2[] {
        return this.targetVectors.map(v => v.clone());
    }

    getDistanceTraveledOnSegment(): number {
        return this.distanceTraveledOnSegment;
    }

    getCurrentSegmentIndex(): number {
        return this.currentSegmentIndex;
    }
}

export class PlayerVisualController implements VisualController {
    private owner!: Unit;
    private characterSprite!: Phaser.GameObjects.Image;
    private currentTextureKey!: string;
    private hpBar!: HPBar;
    private isSelected: boolean = false;
    private routeGraphics!: Phaser.GameObjects.Graphics;
    private static readonly OFFSET_HP_BAR = new Phaser.Math.Vector2(0, -25);


    bind(owner: Unit, scene: Phaser.Scene): void {
        this.owner = owner;
        this.currentTextureKey = this.getTextureKey(scene);
        this.characterSprite = scene.add.image(this.owner.getPos().x, this.owner.getPos().y, this.currentTextureKey).setOrigin(0.5);
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

    private updateCharacterSprite(scene: Phaser.Scene): void {
        const newTextureKey = this.getTextureKey(scene);
        if (this.currentTextureKey !== newTextureKey) {
            this.currentTextureKey = newTextureKey;
            this.characterSprite.setTexture(this.currentTextureKey).setOrigin(0.5);
        }
        const pos = this.owner.getPos();
        this.characterSprite.setPosition(pos.x, pos.y);
        this.characterSprite.setRotation(this.owner.getAngle());
    }

    private updateRouteGraphics(): void {
        this.routeGraphics.clear();
        const decisionController = this.owner.getDecisionController();
        if (decisionController instanceof PlayerDecisionController) {
            if (decisionController.isRouteComplete()) {
                return;
            }
            const vectors = decisionController.getTargetVectors();
            const currentIndex = decisionController.getCurrentSegmentIndex();
            const distanceTraveled = decisionController.getDistanceTraveledOnSegment();
            this.routeGraphics.lineStyle(2, 0xff0000, 0.2);
            let pos = this.owner.getPos().clone();
            this.routeGraphics.beginPath();
            this.routeGraphics.moveTo(pos.x, pos.y);
            let firstLength = vectors[currentIndex].length() - distanceTraveled;
            pos.add(vectors[currentIndex].clone().normalize().scale(firstLength));
            this.routeGraphics.lineTo(pos.x, pos.y);
            for (let i = currentIndex + 1; i < vectors.length; i++) {
                pos.add(vectors[i]);
                this.routeGraphics.lineTo(pos.x, pos.y);
            }
            this.routeGraphics.strokePath();
        }
    }

    setSelected(selected: boolean) {
        this.isSelected = selected;
    }

    private getTextureKey(scene: Phaser.Scene): string {
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
        const newTextureKey = createArrowTexture(scene, { width: 20, height: 15, fillColor: fillColor, strokeColor: strokeColor, strokeWidth: 1 });
        return newTextureKey;
    }
}
