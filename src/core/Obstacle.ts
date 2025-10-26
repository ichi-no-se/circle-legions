import Phaser from 'phaser';

export type Obstacle = {
	intersectPoints(center: Phaser.Math.Vector2, radius: number): Phaser.Math.Vector2[];
	update(): void;
	destroy(): void;
}

export class LineObstacle implements Obstacle {
	private line: Phaser.Geom.Line;
	private color: number;
	private thickness: number;
	private graphics: Phaser.GameObjects.Graphics;


	constructor(x1: number, y1: number, x2: number, y2: number, color: number, thickness: number, scene: Phaser.Scene) {
		this.line = new Phaser.Geom.Line(x1, y1, x2, y2);
		this.color = color;
		this.thickness = thickness;
		this.graphics = new Phaser.GameObjects.Graphics(scene);
		scene.add.existing(this.graphics);
		this.draw();
	}

	intersectPoints(center: Phaser.Math.Vector2, radius: number): Phaser.Math.Vector2[] {
		const circle = new Phaser.Geom.Circle(center.x, center.y, radius);
		const points = Phaser.Geom.Intersects.GetLineToCircle(this.line, circle);
		return points;
	}

	update(): void {

	}

	draw(): void {
		this.graphics.clear();
		this.graphics.lineStyle(this.thickness, this.color);
		this.graphics.strokeLineShape(this.line);
	}
	destroy(): void {
		this.graphics.destroy();
	}
}