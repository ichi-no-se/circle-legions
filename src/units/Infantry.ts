import Phaser from 'phaser';

type state = 'Idle' | 'RandomWalk' | 'GuidedWalk' | 'Combat' | 'Dead';

const UNIT_TEXTURE_KEY = 'unitTexture';

export function ensureUnitTexture(scene: Phaser.Scene) {
	if (scene.textures.exists(UNIT_TEXTURE_KEY)) {
		return UNIT_TEXTURE_KEY;
	}
	const graphics = scene.add.graphics();
	const WIDTH = 20;
	const HEIGHT = 15;
	graphics.fillStyle(0xffffff, 1);
	graphics.beginPath();
	graphics.moveTo(0, 0);
	graphics.lineTo(WIDTH, HEIGHT / 2);
	graphics.lineTo(0, HEIGHT);
	graphics.lineTo(WIDTH / 4, HEIGHT / 2);
	graphics.closePath();
	graphics.fillPath();

	graphics.generateTexture(UNIT_TEXTURE_KEY, WIDTH, HEIGHT);
	graphics.destroy();
	return UNIT_TEXTURE_KEY;
}

export class Infantry {
	state: state;
	pos: Phaser.Math.Vector2;
	angle: number;
	velocity: Phaser.Math.Vector2;
	private defaultSpeed: number;
	private randomWalkRatio: number;
	// private path: Phaser.Math.Vector2[];
	private updateTimer: number;
	private sprite: Phaser.GameObjects.Image;
	static readonly UPDATE_INTERVAL = 100; // ms

	constructor(Scene: Phaser.Scene, pos?: Phaser.Math.Vector2, angle?: number) {
		this.state = 'RandomWalk';
		this.pos = pos || new Phaser.Math.Vector2();
		this.angle = angle || 0;
		this.velocity = new Phaser.Math.Vector2();
		this.defaultSpeed = 100;
		this.randomWalkRatio = 0.2;
		// this.path = [];
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
					this.idleBehavior(delta);
					break;
				case 'RandomWalk':
					this.randomWalkBehavior(delta);
					break;
				case 'GuidedWalk':
					this.guidedWalkBehavior(delta);
					break;
				case 'Combat':
					this.combatBehavior(delta);
					break;
				case 'Dead':
					this.deadBehavior(delta);
					break;
			}
		}
		this.sprite.setX(this.pos.x);
		this.sprite.setY(this.pos.y);
		this.sprite.setRotation(this.angle);
	}

	private idleBehavior(delta: number) {
		// Do nothing
	}

	private randomWalkBehavior(delta: number) {
		const ANGLE_COEFFICIENT = 0.1;
		const randomAngle = Phaser.Math.FloatBetween(-Math.PI, Math.PI);
		this.angle += randomAngle * ANGLE_COEFFICIENT;
		this.angle = Phaser.Math.Angle.Wrap(this.angle);
		const speed = this.defaultSpeed * this.randomWalkRatio;
		this.velocity.setToPolar(this.angle, speed);
	}

	private guidedWalkBehavior(delta: number) {
		// Implement guided walk behavior
	}

	private combatBehavior(delta: number) {
		// TODO: Implement combat behavior
	}

	private deadBehavior(delta: number) {
		// Do nothing
	}
}