import Phaser from 'phaser';

export interface InputIntent {
	pos: Phaser.Math.Vector2;
	isDown: boolean;
	isJustDown: boolean;
	isJustUp: boolean;
}

export class InputService {
	readonly intent: InputIntent;
	private scene: Phaser.Scene;

	constructor(scene: Phaser.Scene) {
		this.scene = scene;
		this.intent = {
			pos: new Phaser.Math.Vector2(),
			isDown: false,
			isJustDown: false,
			isJustUp: false,
		};
		scene.input.mouse?.disableContextMenu();
		scene.input.on('pointerdown', this.onPointerDown, this);
		scene.input.on('pointerup', this.onPointerUp, this);
		scene.input.on('pointermove', this.onPointerMove, this);

		scene.events.once(Phaser.Scenes.Events.SHUTDOWN, () => this.destroy());
	}

	endFrame() {
		this.intent.isJustDown = false;
		this.intent.isJustUp = false;
	}

	destroy() {
		this.scene.input.off('pointerdown', this.onPointerDown, this);
		this.scene.input.off('pointerup', this.onPointerUp, this);
		this.scene.input.off('pointermove', this.onPointerMove, this);
	}
	private onPointerDown(pointer: Phaser.Input.Pointer) {
		this.intent.isDown = true;
		this.intent.isJustDown = true;
		this.intent.pos.set(pointer.x, pointer.y);
	}
	private onPointerUp(pointer: Phaser.Input.Pointer) {
		this.intent.isDown = false;
		this.intent.isJustUp = true;
		this.intent.pos.set(pointer.x, pointer.y);
	}
	private onPointerMove(pointer: Phaser.Input.Pointer) {
		this.intent.pos.set(pointer.x, pointer.y);
	}
}
