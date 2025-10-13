import Phaser from 'phaser';
import type { InputIntent } from '../input/InputService';

export interface LassoConfig {
	thresholdMouseMove: number;
	thresholdNearLine: number;
	strokeWidth: number;
	strokeColor: number;
	strokeAlpha: number;
	previewOkColor: number;
	previewNgColor: number;
	fillColor: number;
	fillAlphaComplete: number;
}

export class Lasso {
	private mousePos: Phaser.Math.Vector2;
	private points: Phaser.Math.Vector2[];
	private config: LassoConfig;
	private graphics: Phaser.GameObjects.Graphics;

	constructor(graphics: Phaser.GameObjects.Graphics, config?: LassoConfig) {
		this.graphics = graphics;
		this.config = config || {
			thresholdMouseMove: 4,
			thresholdNearLine: 2,
			strokeWidth: 2,
			strokeColor: 0xffffff,
			strokeAlpha: 0.8,
			previewOkColor: 0x22cc66,
			previewNgColor: 0xff5555,
			fillColor: 0x0096ff,
			fillAlphaComplete: 0.2,
		};
		this.points = [];
		this.mousePos = new Phaser.Math.Vector2();
	}
	private evalNextPoint(point: Phaser.Math.Vector2): boolean {
		if (this.points.length === 0) {
			return true;
		}
		const last = this.points[this.points.length - 1];
		if (Phaser.Math.Distance.BetweenPoints(last, point) < this.config.thresholdMouseMove) {
			return false;
		}
		const line = new Phaser.Geom.Line(last.x, last.y, point.x, point.y);
		// 交差チェック
		for (let i = 0; i < this.points.length - 2; i++) {
			const p1 = this.points[i];
			const p2 = this.points[i + 1];
			if (Phaser.Geom.Intersects.LineToLine(
				line,
				new Phaser.Geom.Line(p1.x, p1.y, p2.x, p2.y)
			)) {
				return false;
			}
		}
		// 点がこれまでの線の近くにあるかチェック
		for (let i = 0; i < this.points.length - 2; i++) {
			const p1 = this.points[i];
			const p2 = this.points[i + 1];
			if (Phaser.Geom.Intersects.PointToLine(point, new Phaser.Geom.Line(p1.x, p1.y, p2.x, p2.y), this.config.thresholdNearLine)) {
				return false;
			}
		}
		// これまでの点が新しい線の近くにあるかチェック
		for (let i = 0; i < this.points.length - 1; i++) {
			const p = this.points[i];
			if (Phaser.Geom.Intersects.PointToLine(p, line, this.config.thresholdNearLine)) {
				return false;
			}
		}
		return true;
	}

	private evalLastPoint(): boolean {
		if (this.points.length < 3) return false;
		const first = this.points[0];
		const last = this.points[this.points.length - 1];
		const line = new Phaser.Geom.Line(last.x, last.y, first.x, first.y);
		// 交差チェック
		for (let i = 1; i < this.points.length - 2; i++) {
			const p1 = this.points[i];
			const p2 = this.points[i + 1];
			if (Phaser.Geom.Intersects.LineToLine(
				line,
				new Phaser.Geom.Line(p1.x, p1.y, p2.x, p2.y)
			)) {
				return false;
			}
		}
		return true;
	}

	update(intent: InputIntent) {
		this.mousePos.set(intent.pos.x, intent.pos.y);
		if (this.evalNextPoint(this.mousePos)) {
			this.points.push(this.mousePos.clone());
		}
	}
	clear() {
		this.points = [];
		this.graphics.clear();
	}

	isValid(): boolean {
		return this.evalLastPoint();
	}

	contains(point: Phaser.Math.Vector2): boolean {
		if (!this.evalLastPoint()) return false;
		const poly = new Phaser.Geom.Polygon(this.points);
		return Phaser.Geom.Polygon.ContainsPoint(poly, new Phaser.Geom.Point(point.x, point.y));
	}

	draw() {
		this.graphics.clear();
		if (this.points.length < 2) return;

		this.graphics.lineStyle(this.config.strokeWidth, this.config.strokeColor, this.config.strokeAlpha);
		this.graphics.beginPath();
		this.graphics.moveTo(this.points[0].x, this.points[0].y);
		for (let i = 1; i < this.points.length; i++) {
			this.graphics.lineTo(this.points[i].x, this.points[i].y);
		}
		this.graphics.strokePath();

		if (this.mousePos.distance(this.points[this.points.length - 1]) < this.config.thresholdMouseMove) {
			if (this.evalLastPoint()) {
				this.graphics.lineStyle(this.config.strokeWidth, this.config.previewOkColor, this.config.strokeAlpha);
			}
			else {
				this.graphics.lineStyle(this.config.strokeWidth, this.config.previewNgColor, this.config.strokeAlpha);
			}
			this.graphics.beginPath();
			this.graphics.moveTo(this.points[this.points.length - 1].x, this.points[this.points.length - 1].y);
			this.graphics.lineTo(this.points[0].x, this.points[0].y);

			this.graphics.strokePath();

			if (this.evalLastPoint()) {
				this.graphics.fillStyle(this.config.fillColor, this.config.fillAlphaComplete);
				const poly = new Phaser.Geom.Polygon(this.points);
				this.graphics.fillPoints(poly.points, true);
			}
		}
		else {
			this.graphics.lineStyle(this.config.strokeWidth, this.config.previewNgColor, this.config.strokeAlpha);
			this.graphics.beginPath();
			this.graphics.moveTo(this.points[this.points.length - 1].x, this.points[this.points.length - 1].y);
			this.graphics.lineTo(this.mousePos.x, this.mousePos.y);
			this.graphics.strokePath();
		}
	}
}
