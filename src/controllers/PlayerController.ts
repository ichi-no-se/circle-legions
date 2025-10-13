import Phaser from 'phaser';
import { type DecisionController, type VisualController, Unit, type MoveIntent } from '../core/Unit';
import { World } from '../core/World';
import { createArrowTexture } from "../util/Textures";


export class PlayerDecisionController implements DecisionController {
    private owner!: Unit;
    private targetPoints: Phaser.Math.Vector2[] = [];
    private currentTargetIndex: number = 0;
    private static readonly THRESHOLD_REACHED = 4;

    bind(owner: Unit): void {
        this.owner = owner;
    }

    update(_dt: number, _world: World): MoveIntent {
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
}

export class PlayerVisualController implements VisualController {
    private owner!: Unit;
    private isSelected: boolean = false;

    bind(owner: Unit): void {
        this.owner = owner;
    }

    update(dt: number, world: World): void {
        const scene = world.getScene();
        const fillColor = this.isSelected ? 0x00ff00 : 0xffff00;
        let strokeColor = 0xffffff;
        const decisionController = this.owner.getDecisionController();
        if (decisionController instanceof PlayerDecisionController && !decisionController.isRouteComplete()) {
            strokeColor = 0xff00ff;
        }
        const textureKey = createArrowTexture(scene, { width: 12, height: 10, fillColor: fillColor, strokeColor: strokeColor, strokeWidth: 1 })
        const sprite = scene.add.image(this.owner.getPos().x, this.owner.getPos().y, textureKey).setOrigin(0.5);
        this.owner.setSprite(sprite);
    }

    setSelected(selected: boolean) {
        this.isSelected = selected;
    }
}
