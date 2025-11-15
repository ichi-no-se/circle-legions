import Phaser from 'phaser';
import { Unit } from './Unit';
import type { MoveIntent, VisualController, DecisionController, UnitSpec } from './Unit';
import type { Obstacle } from "./Obstacle";

export class World {
    private units: Map<number, Unit>;
    private idCounter: number;
    private scene: Phaser.Scene;
    private obstacles: Obstacle[];
    private startTime: number;

    constructor(scene: Phaser.Scene) {
        this.units = new Map();
        this.idCounter = 0;
        this.scene = scene;
        this.obstacles = [];
        this.startTime = scene.time.now;
    }

    addObstacle(obstacle: Obstacle): void {
        this.obstacles.push(obstacle);
    }

    addObstacles(obstacles: Obstacle[]): void {
        this.obstacles.push(...obstacles);
    }

    addUnit(spec: UnitSpec, pos?: Phaser.Math.Vector2, angle?: number, decisionController?: DecisionController, visualController?: VisualController): Unit {
        const unit = new Unit(this.scene, this.idCounter, spec, pos, angle, decisionController, visualController);
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
            }
            else {
                this.removeUnit(unit.id);
            }
        }
        for (const obstacle of this.obstacles) {
            obstacle.update();
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
                const SPEED_COEFFICIENT = 0.3;
                const RANDOM_ANGLE_COEFFICIENT = 0.03;
                const speed = Math.min(intent.speed ?? unit.spec.maxSpeed * SPEED_COEFFICIENT, unit.spec.maxSpeed);
                unit.setSpeed(speed);
                const randomAngle = Phaser.Math.FloatBetween(-Math.PI, Math.PI) * RANDOM_ANGLE_COEFFICIENT;
                unit.setAngle(unit.getAngle() + randomAngle);
                break;
            }
            case 'SameAsBefore': {
                // 何もしない
                break;
            }
        }
    }

    handleAttack(unit: Unit, _dt: number) {
        if (unit.getAttackTimer() > 0) {
            return;
        }
        const target = this.queryAliveNearestUnit(unit.getPos(), unit.spec.attackRange, unit.spec.faction === 'Player' ? 'Enemy' : 'Player');
        if (target) {
            target.applyDamage(unit.spec.attackDamage);
            unit.setAttackTimer(unit.spec.attackInterval);
        }
    }

    applyMovement(unit: Unit, dt: number) {
        const angle = unit.getAngle();
        const speed = Math.min(unit.getSpeed(), unit.spec.maxSpeed);
        const dx = Math.cos(angle) * speed * dt;
        const dy = Math.sin(angle) * speed * dt;
        const pos = unit.getPos();
        unit.setPos(new Phaser.Math.Vector2(pos.x + dx, pos.y + dy));
        // 衝突判定
        const intersectPoints: Phaser.Math.Vector2[] = [];
        // 障害物
        for (const obstacle of this.obstacles) {
            const points = obstacle.intersectPoints(unit.getPos(), unit.spec.intersectRange);
            intersectPoints.push(...points);
        }
        // 他ユニット
        for (const otherUnit of this.units.values()) {
            if (otherUnit.id === unit.id) continue;
            if (!otherUnit.isAlive()) continue;
            const points = Phaser.Geom.Intersects.GetCircleToCircle(
                new Phaser.Geom.Circle(unit.getPos().x, unit.getPos().y, unit.spec.intersectRange),
                new Phaser.Geom.Circle(otherUnit.getPos().x, otherUnit.getPos().y, otherUnit.spec.intersectRange)
            );
            intersectPoints.push(...points);
        }
        if (intersectPoints.length > 0) {
            let dir = new Phaser.Math.Vector2(0, 0);
            for (const point of intersectPoints) {
                const unitCenter = unit.getPos();
                const toUnit = new Phaser.Math.Vector2(unitCenter.x - point.x, unitCenter.y - point.y);
                const distance = toUnit.length();
                if (distance > 0) {
                    toUnit.normalize();
                    const strength = 1 / distance;
                    dir.add(toUnit.scale(strength));
                }
            }
            dir.normalize();
            const OBSTACLE_PUSH_COEFFICIENT = 0.5;
            unit.setPos(new Phaser.Math.Vector2(
                unit.getPos().x + dir.x * OBSTACLE_PUSH_COEFFICIENT,
                unit.getPos().y + dir.y * OBSTACLE_PUSH_COEFFICIENT
            ));
        }
    }

    queryAliveUnitsInRange(pos: Phaser.Math.Vector2, range: number): Readonly<Unit>[] {
        // QuadTreeとかにしたいね
        return Array.from(this.units.values()).filter(unit => {
            const unitPos = unit.getPos();
            const distance = Phaser.Math.Distance.Between(pos.x, pos.y, unitPos.x, unitPos.y);
            return distance <= range && unit.isAlive();
        });
    }

    queryAliveNearestUnit(pos: Phaser.Math.Vector2, range: number, factionFilter?: UnitSpec["faction"]): Readonly<Unit> | null {
        // QuadTreeとかにしたいね
        const unitsInRange = this.queryAliveUnitsInRange(pos, range).filter(unit => {
            if (factionFilter) {
                return unit.spec.faction === factionFilter;
            }
            return true;
        });
        let nearestUnit: Readonly<Unit> | null = null;
        let nearestDistance = Number.MAX_VALUE;
        for (const unit of unitsInRange) {
            const unitPos = unit.getPos();
            const distance = Phaser.Math.Distance.Between(pos.x, pos.y, unitPos.x, unitPos.y);
            if (distance < nearestDistance) {
                nearestDistance = distance;
                nearestUnit = unit;
            }
        }
        return nearestUnit;
    }

    getUnitIterator(): IterableIterator<Readonly<Unit>> {
        return this.units.values();
    }

    getObstacleIterator(): IterableIterator<Obstacle> {
        return this.obstacles.values();
    }

    getScene(): Phaser.Scene {
        return this.scene;
    }

    enemyUnitsAllDead(): boolean {
        for (const unit of this.units.values()) {
            if (unit.spec.faction === 'Enemy' && unit.isAlive()) {
                return false;
            }
        }
        return true;
    }

    allyUnitsAllDead(): boolean {
        for (const unit of this.units.values()) {
            if (unit.spec.faction === 'Player' && unit.isAlive()) {
                return false;
            }
        }
        return true;
    }

    getElapsedTime(): number {
        return (this.scene.time.now - this.startTime) / 1000;
    }
}
