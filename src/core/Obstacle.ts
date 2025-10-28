import Phaser from 'phaser';

export type Obstacle = {
	intersectPoints(center: Phaser.Math.Vector2, radius: number): Phaser.Math.Vector2[];
	update(): void;
	destroy(): void;
}

export class LineObstacle implements Obstacle {
	private line: Phaser.Geom.Line;
	private color: number;
	private alpha: number;
	private thickness: number;
	private graphics: Phaser.GameObjects.Graphics;


	constructor(x1: number, y1: number, x2: number, y2: number, color: number, alpha: number, thickness: number, scene: Phaser.Scene) {
		this.line = new Phaser.Geom.Line(x1, y1, x2, y2);
		this.color = color;
		this.alpha = alpha;
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
		this.graphics.lineStyle(this.thickness, this.color, this.alpha);
		this.graphics.strokeLineShape(this.line);
	}
	destroy(): void {
		this.graphics.destroy();
	}
}

export class CircleObstacle implements Obstacle {
	private center: Phaser.Math.Vector2;
	private radius: number;
	private color: number;
	private alpha: number;
	private graphics: Phaser.GameObjects.Graphics;

	constructor(x: number, y: number, radius: number, color: number, alpha: number, scene: Phaser.Scene) {
		this.center = new Phaser.Math.Vector2(x, y);
		this.radius = radius;
		this.color = color;
		this.alpha = alpha;
		this.graphics = new Phaser.GameObjects.Graphics(scene);
		scene.add.existing(this.graphics);
		this.draw();
	}

	intersectPoints(center: Phaser.Math.Vector2, radius: number): Phaser.Math.Vector2[] {
		const circleOther = new Phaser.Geom.Circle(center.x, center.y, radius);
		const circleThis = new Phaser.Geom.Circle(this.center.x, this.center.y, this.radius);
		const points = Phaser.Geom.Intersects.GetCircleToCircle(circleOther, circleThis);
		return points;
	}

	update(): void {
	}

	draw(): void {
		this.graphics.clear();
		this.graphics.fillStyle(this.color, this.alpha);
		this.graphics.fillCircle(this.center.x, this.center.y, this.radius);
	}

	destroy(): void {
		this.graphics.destroy();
	}
}

export class RectangleObstacle implements Obstacle {
	private rect: Phaser.Geom.Rectangle;
	private color: number;
	private alpha: number;
	private graphics: Phaser.GameObjects.Graphics;

	constructor(x: number, y: number, width: number, height: number, color: number, alpha: number, scene: Phaser.Scene) {
		this.rect = new Phaser.Geom.Rectangle(x, y, width, height);
		this.color = color;
		this.alpha = alpha;
		this.graphics = new Phaser.GameObjects.Graphics(scene);
		scene.add.existing(this.graphics);
		this.draw();
	}

	intersectPoints(center: Phaser.Math.Vector2, radius: number): Phaser.Math.Vector2[] {
		const circle = new Phaser.Geom.Circle(center.x, center.y, radius);
		const points = Phaser.Geom.Intersects.GetCircleToRectangle(circle, this.rect);
		return points;
	}

	update(): void {
	}

	draw(): void {
		this.graphics.clear();
		this.graphics.fillStyle(this.color, this.alpha);
		this.graphics.fillRectShape(this.rect);
	}

	destroy(): void {
		this.graphics.destroy();
	}
}