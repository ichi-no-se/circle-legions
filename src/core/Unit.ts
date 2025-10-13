import Phaser from 'phaser';
import { World } from './World';


export type Intent = { type: 'MoveTo'; point: Phaser.Math.Vector2; speed?: number; }
    | { type: 'MoveVel'; vel: Phaser.Math.Vector2; }
    | { type: 'Idle' }
    | { type: 'SameAsBefore' };

export interface Controller {
    bind(owner: Unit): void;
    update(dt: number, world: World): Intent;
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
    private controller: Controller | null;

    constructor(id: number, spec: UnitSpec, pos?: Phaser.Math.Vector2, angle?: number, sprite?: Phaser.GameObjects.Image, controller?: Controller) {
        this.id = id;
        this.spec = spec;
        this.pos = pos?.clone() ?? new Phaser.Math.Vector2();
        this.angle = angle ?? 0;
        this.speed = 0;
        this.hp = spec.maxHp;
        this.alive = true;
        this.sprite = sprite ?? null;
        this.controller = controller ?? null;
        if (this.controller) {
            this.controller.bind(this);
        }
    }

    setSprite(sprite: Phaser.GameObjects.Image) {
        this.sprite = sprite;
    }

    bindController(controller: Controller) {
        this.controller = controller;
        this.controller.bind(this);
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

    getController(): Controller | null {
        return this.controller;
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
        this.controller = null;
    }

    update(dt: number, world: World) {
        const intent = this.controller?.update(dt, world) ?? { type: 'Idle' };
        world.applyIntent(this, intent, dt);
        world.applyMovement(this, dt);
    }

    /*
    update(delta: number, world: World) {
        if (this.currentSpeed > this.spec.maxSpeed) {
            this.currentSpeed = this.spec.maxSpeed;
        }

        // TODO 攻撃とか
        // 攻撃対象が近くにいるとか
        // 死んでいるならとか

        // TODO 世界との相互作用
        // 沼地だと速度が落ちるとか？どうしようね
        const velocity = new Phaser.Math.Vector2().setAngle(this.angle).scale(this.currentSpeed);
        this.pos.add(velocity.clone().scale(delta / 1000));
        // TODO: 世界との相互作用（障害物判定など）

        if (this.sprite) {
            this.sprite.setPosition(this.pos.x, this.pos.y);
            this.sprite.setRotation(this.angle);
        }
    }*/

}
