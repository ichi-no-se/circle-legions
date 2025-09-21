import Phaser from "phaser";
import type { Intent } from "../input/InputService";


export interface RouteConfig {
	thresholdMouseMove: number;
	strokeWidth: number;
	strokeColor: number;
	strokeAlpha: number;
}

export class Route {
	private points: Phaser.Math.Vector2[];
	private config: RouteConfig;
	private graphics: Phaser.GameObjects.Graphics;

	constructor(graphics: Phaser.GameObjects.Graphics, config?: RouteConfig) {
		this.graphics = graphics;
		this.points = [];
		this.config = config || {
			thresholdMouseMove: 4,
			strokeWidth: 2,
			strokeColor: 0xffff00,
			strokeAlpha: 0.8,
		};
	}
	private addPoint(point: Phaser.Math.Vector2) {
		if (this.points.length > 0) {
			const last = this.points[this.points.length - 1];
			if (Phaser.Math.Distance.BetweenPoints(last, point) < 4) {
				return;
			}
		}
		this.points.push(point);
	}

	update(intent: Intent) {
		this.addPoint(intent.pos.clone());
		this.draw();
	}

	clear() {
		this.points = [];
		this.graphics.clear();
	}

	draw() {
		this.graphics.clear();
		if (this.points.length === 0) return;
		this.graphics.lineStyle(this.config.strokeWidth, this.config.strokeColor, this.config.strokeAlpha);
		this.graphics.beginPath();
		this.graphics.moveTo(this.points[0].x, this.points[0].y);
		for (let i = 1; i < this.points.length; i++) {
			this.graphics.lineTo(this.points[i].x, this.points[i].y);
		}
		this.graphics.strokePath();
	}

	getPoints(): Phaser.Math.Vector2[] {
		return this.points;
	}

	getRandomSampledPoints(len: number): Phaser.Math.Vector2[] {
		if (this.points.length <= len) {
			return this.points.map(p => p.clone());
		}
		// 始点終点以外をランダムに間引く
		const resampled: Phaser.Math.Vector2[] = [];
		resampled.push(this.points[0].clone());
		const indices = [];
		for (let i = 1; i < this.points.length - 1; i++) {
			indices.push(i);
		}
		Phaser.Utils.Array.Shuffle(indices);
		indices.splice(len - 2);
		indices.sort((a, b) => a - b);
		for (const idx of indices) {
			resampled.push(this.points[idx].clone());
		}
		resampled.push(this.points[this.points.length - 1].clone());
		return resampled;
	}
}