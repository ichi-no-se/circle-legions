import Phaser from 'phaser';
import { World } from './World';


export type MoveIntent = { type: 'MoveTo'; point: Phaser.Math.Vector2; speed?: number; }
    | { type: 'MoveVel'; vel: Phaser.Math.Vector2; }
    | { type: 'Idle' }
    | { type: 'RandomWalk'; speed?: number; }
    | { type: 'SameAsBefore' };

export interface DecisionController {
    bind(owner: Unit): void;
    update(dt: number, world: World): MoveIntent;
}

export interface VisualController{
    bind(owner: Unit): void;
    update(dt: number, world: World): void;
}

export interface UnitSpec {
    maxHp: number;
    maxSpeed: number;
    detectRange: number;
    attackRange: number;
    attackInterval: number;
    attackDamage: number;
    faction: "Player" | "Enemy";
}

export class Unit {
    private sprite: Phaser.GameObjects.Image | null;
    readonly id: number;
    readonly spec: UnitSpec;
    private pos: Phaser.Math.Vector2;
    private angle: number;
    private speed: number;
    private hp: number;
    private alive: boolean;
    private decisionController: DecisionController | null;
    private visualController: VisualController | null;

    constructor(id: number, spec: UnitSpec, pos?: Phaser.Math.Vector2, angle?: number, sprite?: Phaser.GameObjects.Image, decisionController?: DecisionController, visualController?: VisualController) {
        this.id = id;
        this.spec = spec;
        this.pos = pos?.clone() ?? new Phaser.Math.Vector2();
        this.angle = angle ?? 0;
        this.speed = 0;
        this.hp = spec.maxHp;
        this.alive = true;
        this.sprite = sprite ?? null;
        this.decisionController = decisionController ?? null;
        if (this.decisionController) {
            this.decisionController.bind(this);
        }
        this.visualController = visualController ?? null;
        if (this.visualController) {
            this.visualController.bind(this);
        }
    }

    setSprite(sprite: Phaser.GameObjects.Image) {
        if (this.sprite) {
            this.sprite.destroy();
        }
        this.sprite = sprite;
        this.syncRender();
    }

    bindDecisionController(controller: DecisionController) {
        this.decisionController = controller;
        this.decisionController.bind(this);
    }

    bindVisualController(controller: VisualController) {
        this.visualController = controller;
        this.visualController.bind(this);
    }

    setPos(pos: Phaser.Math.Vector2) {
        this.pos = pos.clone();
    }

    setAngle(angle: number) {
        this.angle = angle;
    }

    setSpeed(speed: number) {
        this.speed = speed;
    }

    getDecisionController(): DecisionController | null {
        return this.decisionController;
    }

    getVisualController(): VisualController | null {
        return this.visualController;
    }

    getPos(): Phaser.Math.Vector2 {
        return this.pos.clone();
    }

    getAngle(): number {
        return this.angle;
    }

    getSpeed(): number {
        return this.speed;
    }

    getHp(): number {
        return this.hp;
    }

    isAlive(): boolean {
        return this.alive;
    }

    takeDamage(damage: number) {
        this.hp -= damage;
        if (this.hp <= 0) {
            this.hp = 0;
            this.alive = false;
        }
    }

    syncRender() {
        if (this.sprite) {
            this.sprite.setPosition(this.pos.x, this.pos.y);
            this.sprite.setRotation(this.angle);
        }
    }

    destroy() {
        if (this.sprite) {
            this.sprite.destroy();
            this.sprite = null;
        }
        this.decisionController = null;
    }

    update(dt: number, world: World) {
        const intent = this.decisionController?.update(dt, world) ?? { type: 'Idle' };
        world.applyMoveIntent(this, intent, dt);
        world.applyMovement(this, dt);
        this.visualController?.update(dt, world);
    }

}
