import Phaser from 'phaser';
import { type DecisionController, type VisualController, Unit, type MoveIntent } from '../core/Unit';
import { World } from '../core/World';
import { createArrowTexture } from "../util/Textures";
import { HPBar } from '../ui/HPBar';


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
    private characterSprite!: Phaser.GameObjects.Image;
    private currentTextureKey!: string;
    private hpBar!: HPBar;
    private static readonly OFFSET_HP_BAR = new Phaser.Math.Vector2(0, -25);

    bind(owner: Unit, scene: Phaser.Scene): void {
        this.owner = owner;
        this.currentTextureKey = this.getTextureKey(scene);
        this.characterSprite = scene.add.image(this.owner.getPos().x, this.owner.getPos().y, this.currentTextureKey).setOrigin(0.5);
        this.hpBar = new HPBar(scene);
    }

    update(_dt: number, world: World): void {
        const scene = world.getScene();
        this.updateCharacterSprite(scene);
        const hpBarPos = this.owner.getPos().add(EnemyVisualController.OFFSET_HP_BAR);
        this.hpBar.setPosition(hpBarPos.x, hpBarPos.y);
        const hpRatio = this.owner.getHp() / this.owner.spec.maxHp;
        this.hpBar.setRatio(hpRatio);
    }

    destroy(): void {
        this.characterSprite.destroy();
        this.hpBar.destroy();
    }

    private updateCharacterSprite(scene: Phaser.Scene) {
        const textureKey = this.getTextureKey(scene);
        if (this.currentTextureKey !== textureKey) {
            this.currentTextureKey = textureKey;
            this.characterSprite.setTexture(this.currentTextureKey).setOrigin(0.5);
        }
        const pos = this.owner.getPos();
        this.characterSprite.setPosition(pos.x, pos.y);
        this.characterSprite.setRotation(this.owner.getAngle());
    }

    private getTextureKey(scene: Phaser.Scene): string {
        const fillColor = 0x888888;
        let strokeColor = 0xffffff;
        const newTextureKey = createArrowTexture(scene, { width: 20, height: 15, fillColor: fillColor, strokeColor: strokeColor, strokeWidth: 1 });
        return newTextureKey;
    }
}
