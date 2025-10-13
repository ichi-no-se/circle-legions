import Phaser from 'phaser';
import { Unit } from './Unit';
import type { MoveIntent, VisualController, DecisionController, UnitSpec } from './Unit';

export class World {
    private units: Map<number, Unit>;
    private idCounter: number;
    private scene: Phaser.Scene;

    constructor(scene: Phaser.Scene) {
        this.units = new Map();
        this.idCounter = 0;
        this.scene = scene;
    }

    addUnit(spec: UnitSpec, sprite?: Phaser.GameObjects.Image, pos?: Phaser.Math.Vector2, angle?: number, decisionController?: DecisionController, visualController?: VisualController): Unit {
        const unit = new Unit(this.idCounter, spec, pos, angle, sprite, decisionController, visualController);
        this.units.set(this.idCounter, unit);
        this.idCounter++;
        return unit;
    }

    removeUnit(id: number): boolean {
        const unit = this.units.get(id);
        if (unit) {
            unit.destroy();
        }
        return this.units.delete(id);
    }

    getUnitById(id: number): Readonly<Unit> | undefined {
        return this.units.get(id);
    }

    update(deltaMillis: number) {
        const dt = deltaMillis / 1000;
        for (const unit of this.units.values()) {
            if (unit.isAlive()) {
                unit.update(dt, this);
                unit.syncRender();
            }
        }
    }

    applyMoveIntent(unit: Unit, intent: MoveIntent, _dt: number) {
        switch (intent.type) {
            case 'MoveTo': {
                const speed = Math.min(intent.speed ?? unit.spec.maxSpeed, unit.spec.maxSpeed);
                const to = intent.point;
                const from = unit.getPos();
                unit.setSpeed(speed);
                unit.setAngle(Phaser.Math.Angle.Between(from.x, from.y, to.x, to.y));
                break;
            }
            case 'MoveVel': {
                const vel = intent.vel;
                const speed = Math.min(vel.length(), unit.spec.maxSpeed);
                unit.setSpeed(speed);
                unit.setAngle(Math.atan2(vel.y, vel.x));
                break;
            }
            case 'Idle': {
                unit.setSpeed(0);
                break;
            }
            case 'RandomWalk': {
                const ANGLE_COEFFICIENT = 0.03;
                const SPEED_COEFFICIENT = 0.3;
                const speed = Math.min(intent.speed ?? unit.spec.maxSpeed * SPEED_COEFFICIENT, unit.spec.maxSpeed);
                unit.setSpeed(speed);
                const randomAngle = Phaser.Math.FloatBetween(-Math.PI, Math.PI) * ANGLE_COEFFICIENT;
                unit.setAngle(unit.getAngle() + randomAngle);
                break;
            }
            case 'SameAsBefore': {
                // 何もしない
                break;
            }
        }
    }

    applyMovement(unit: Unit, dt: number) {
        const angle = unit.getAngle();
        const speed = Math.min(unit.getSpeed(), unit.spec.maxSpeed);
        const dx = Math.cos(angle) * speed * dt;
        const dy = Math.sin(angle) * speed * dt;
        const pos = unit.getPos();
        unit.setPos(new Phaser.Math.Vector2(pos.x + dx, pos.y + dy));
    }

    queryUnitsInRange(pos: Phaser.Math.Vector2, range: number): Readonly<Unit>[] {
        // QuadTreeとかにしたいね そのうち使うかも
        return Array.from(this.units.values()).filter(unit => {
            const unitPos = unit.getPos();
            const distance = Phaser.Math.Distance.Between(pos.x, pos.y, unitPos.x, unitPos.y);
            return distance <= range;
        });
    }

    getUnitIterator(): IterableIterator<Readonly<Unit>> {
        return this.units.values();
    }

    getScene(): Phaser.Scene {
        return this.scene;
    }

}
