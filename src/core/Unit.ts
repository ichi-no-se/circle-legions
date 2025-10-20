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

export interface VisualController {
    bind(owner: Unit, scene: Phaser.Scene): void;
    update(dt: number, world: World): void;
    destroy(): void;
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
    readonly id: number;
    readonly spec: UnitSpec;
    private pos: Phaser.Math.Vector2;
    private angle: number;
    private speed: number;
    private hp: number;
    private alive: boolean;
    private attackTimer: number;
    private decisionController: DecisionController | null;
    private visualController: VisualController | null;

    constructor(scene: Phaser.Scene, id: number, spec: UnitSpec, pos?: Phaser.Math.Vector2, angle?: number, decisionController?: DecisionController, visualController?: VisualController) {
        this.id = id;
        this.spec = spec;
        this.pos = pos?.clone() ?? new Phaser.Math.Vector2();
        this.angle = angle ?? 0;
        this.speed = 0;
        this.hp = spec.maxHp;
        this.alive = true;
        this.attackTimer = Phaser.Math.FloatBetween(0, spec.attackInterval);
        this.decisionController = decisionController ?? null;
        if (this.decisionController) {
            this.decisionController.bind(this);
        }
        this.visualController = visualController ?? null;
        if (this.visualController) {
            this.visualController.bind(this, scene);
        }
    }

    bindDecisionController(controller: DecisionController) {
        this.decisionController = controller;
        this.decisionController.bind(this);
    }

    bindVisualController(controller: VisualController, scene: Phaser.Scene) {
        this.visualController = controller;
        this.visualController.bind(this, scene);
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

    setHp(hp: number) {
        this.hp = hp;
    }

    setAttackTimer(timer: number) {
        this.attackTimer = timer;
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

    getAttackTimer(): number {
        return this.attackTimer;
    }

    isAlive(): boolean {
        return this.alive;
    }

    applyDamage(damage: number) {
        this.hp -= damage;
        if (this.hp <= 0) {
            this.hp = 0;
            this.alive = false;
        }
    }

    destroy() {
        this.visualController?.destroy();
        this.decisionController = null;
        this.visualController = null;
    }

    update(dt: number, world: World) {
        if (this.attackTimer > 0) {
            this.attackTimer -= dt;
        }
        const intent = this.decisionController?.update(dt, world) ?? { type: 'Idle' };
        world.applyMoveIntent(this, intent, dt);
        world.applyMovement(this, dt);
        world.handleAttack(this, dt);
        this.visualController?.update(dt, world);
    }

}
