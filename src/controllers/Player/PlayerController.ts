import Phaser from 'phaser';
import { type Controller, Unit, type Intent } from '../../core/Unit';
import { World } from '../../core/World';


export class PlayerController implements Controller {
    private owner!: Unit;
    private targetPoints: Phaser.Math.Vector2[] = [];
    private currentTargetIndex: number = 0;
    private static readonly THRESHOLD_REACHED = 4;

    bind(owner: Unit): void {
        this.owner = owner;
    }

    update(dt: number, world: World): Intent {
        while (this.currentTargetIndex < this.targetPoints.length && this.owner.getPos().distance(this.targetPoints[this.currentTargetIndex]) < PlayerController.THRESHOLD_REACHED) {
            this.currentTargetIndex++;
        }
        if (this.currentTargetIndex >= this.targetPoints.length) {
            return { type: 'Idle' };
        }
        else {
            return { type: 'MoveTo', point: this.targetPoints[this.currentTargetIndex], speed: this.owner.spec.maxSpeed };
        }
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
