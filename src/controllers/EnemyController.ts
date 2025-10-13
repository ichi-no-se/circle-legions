import Phaser from 'phaser';
import { type DecisionController, type VisualController, Unit, type MoveIntent } from '../core/Unit';
import { World } from '../core/World';
import { createArrowTexture } from "../util/Textures";


export class EnemyDecisionControllerChase implements DecisionController {
    private owner!: Unit;
    private actionTimer!: number;
    private currentTargetIndex: number | null = null;
    private static readonly ACTION_INTERVAL = 2.0;

    bind(owner: Unit): void {
        this.owner = owner;
        this.actionTimer = Phaser.Math.FloatBetween(0, EnemyDecisionControllerChase.ACTION_INTERVAL);
    }

    update(dt: number, world: World): MoveIntent {
        this.actionTimer -= dt;
        if (this.actionTimer < 0) {
            this.actionTimer = EnemyDecisionControllerChase.ACTION_INTERVAL;
            let closestDist = Number.MAX_VALUE;
            for (const unit of world.getUnitIterator()) {
                if (unit.spec.faction === "Player" && unit.isAlive()) {
                    const dist = this.owner.getPos().distance(unit.getPos());
                    if (dist < closestDist) {
                        closestDist = dist;
                        this.currentTargetIndex = unit.id;
                    }
                }
            }
        }
        if (this.currentTargetIndex === null) {
            return { type: 'RandomWalk' };
        }
        else {
            const targetUnit = world.getUnitById(this.currentTargetIndex);
            if (targetUnit) {
                return { type: 'MoveTo', point: targetUnit.getPos() };
            }
            else {
                this.currentTargetIndex = null;
                return { type: 'RandomWalk' };
            }
        }
    }
}

export class EnemyVisualController implements VisualController {
    private owner!: Unit;

    bind(owner: Unit): void {
        this.owner = owner;
    }

    update(dt: number, world: World): void {
        const scene = world.getScene();
        const fillColor = 0x888888;
        let strokeColor = 0xffffff;
        const textureKey = createArrowTexture(scene, { width: 12, height: 10, fillColor: fillColor, strokeColor: strokeColor, strokeWidth: 1 })
        const sprite = scene.add.image(this.owner.getPos().x, this.owner.getPos().y, textureKey).setOrigin(0.5);
        this.owner.setSprite(sprite);
    }
}
