import Phaser from 'phaser';

type state = 'Idle' | 'RandomWalk' | 'GuidedWalk' | 'Combat' | 'Dead';

export class Infantry {
	private state: state;
	private pos: Phaser.Math.Vector2;
	private angle: number;
	private velocity: Phaser.Math.Vector2;
	private selected: boolean;
	private defaultSpeed: number;
	private randomWalkSpeedRatio: number;
	// private path: Phaser.Math.Vector2[];
	private updateTimer: number;
	private sprite: Phaser.GameObjects.Image;
	private guideVectors: Phaser.Math.Vector2[];
	private guideCursor: { index: number, progress: number };
	static readonly UPDATE_INTERVAL = 100; // ms

	constructor(Scene: Phaser.Scene, pos?: Phaser.Math.Vector2, angle?: number) {
		this.state = 'RandomWalk';
		this.pos = pos || new Phaser.Math.Vector2();
		this.angle = angle || 0;
		this.velocity = new Phaser.Math.Vector2();
		this.selected = false;
		this.defaultSpeed = 30;
		this.randomWalkSpeedRatio = 0.3;
		this.guideVectors = [];
		this.guideCursor = { index: 0, progress: 0 };
		this.updateTimer = Phaser.Math.FloatBetween(0, Infantry.UPDATE_INTERVAL); // Randomize initial timer
		const key = ensureUnitTexture(Scene);
		this.sprite = Scene.add.image(this.pos.x, this.pos.y, key).setOrigin(0.5);
		this.sprite.setX(this.pos.x);
		this.sprite.setY(this.pos.y);
		this.sprite.setRotation(this.angle);
	}

	update(delta: number) {
		this.pos.add(this.velocity.clone().scale(delta / 1000));
		this.updateTimer += delta;
		while (this.updateTimer >= Infantry.UPDATE_INTERVAL) {
			this.updateTimer -= Infantry.UPDATE_INTERVAL;
			switch (this.state) {
				case 'Idle':
					this.idleBehavior();
					break;
				case 'RandomWalk':
					this.randomWalkBehavior();
					break;
				case 'GuidedWalk':
					this.guidedWalkBehavior();
					break;
				case 'Combat':
					this.combatBehavior();
					break;
				case 'Dead':
					this.deadBehavior();
					break;
			}
		}
		// 画面端で止まる（仮）
		this.pos.x = Phaser.Math.Clamp(this.pos.x, 20, this.sprite.scene.scale.width - 20);
		this.pos.y = Phaser.Math.Clamp(this.pos.y, 20, this.sprite.scene.scale.height - 20);

		this.sprite.setX(this.pos.x);
		this.sprite.setY(this.pos.y);
		this.sprite.setRotation(this.angle);

		// 色付け（仮）
		this.sprite.setTint(0xffffff);
		if (this.state === 'GuidedWalk') {
			this.sprite.setTint(0x00ffff);
		}
		if(this.selected) {
			this.sprite.setTint(0x00ff00);
		}
	}

	private idleBehavior() {
		// Do nothing
	}

	private randomWalkBehavior() {
		const ANGLE_COEFFICIENT = 0.1;
		const randomAngle = Phaser.Math.FloatBetween(-Math.PI, Math.PI);
		this.angle += randomAngle * ANGLE_COEFFICIENT;
		this.angle = Phaser.Math.Angle.Wrap(this.angle);
		const speed = this.defaultSpeed * this.randomWalkSpeedRatio;
		this.velocity.setToPolar(this.angle, speed);
	}

	private guidedWalkBehavior() {
		if (this.guideCursor.index >= this.guideVectors.length) {
			this.state = 'RandomWalk';
			this.velocity.set(0, 0);
			return;
		}
		const targetVec = this.guideVectors[this.guideCursor.index];
		const targetLength = targetVec.length();
		const speed = this.defaultSpeed;
		const moveDist = speed * (Infantry.UPDATE_INTERVAL / 1000);
		this.velocity = targetVec.clone().normalize().scale(speed);
		this.angle = this.velocity.angle();
		// 進捗更新
		this.guideCursor.progress += moveDist;
		if (this.guideCursor.progress >= targetLength) {
			this.guideCursor.index += 1;
			this.guideCursor.progress = 0;
		}
	}

	private combatBehavior() {
		// TODO: Implement combat behavior
	}

	private deadBehavior() {
		// Do nothing
	}

	setSelected(selected: boolean) {
		this.selected = selected;
	}

	isSelected(): boolean {
		return this.selected;
	}

	getPosition(): Phaser.Math.Vector2 {
		return this.pos.clone();
	}

	setPosition(pos: Phaser.Math.Vector2) {
		this.pos = pos.clone();
	}

	getAngle(): number {
		return this.angle;
	}

	setAngle(angle: number) {
		this.angle = Phaser.Math.Angle.Wrap(angle);
	}

	setRoute(points: Phaser.Math.Vector2[]) {
		if (points.length <= 1) {
			return;
		} else {
			this.guideVectors = [];
			for (let i = 1; i < points.length; i++) {
				const vec = points[i].clone().subtract(points[i - 1]);
				this.guideVectors.push(vec);
			}
			this.state = 'GuidedWalk';
			this.guideCursor = { index: 0, progress: 0 };
		}
	}

	destroy() {
		this.sprite.destroy();
	}
}
