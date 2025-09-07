// src/scenes/PlayScene.ts
import Phaser from "phaser";

class Lasso {
    private isDrawing = false;
    private points: Phaser.Math.Vector2[] = [];
    private thresholdMouseMove = 4;
    private thresholdNearLine = 2;
    private strokeWidth = 2;
    private strokeColor = 0xffffff;
    private strokeAlpha = 0.8;
    private previewOkColor = 0x22cc66;
    private previewNgColor = 0xff5555;
    private fillColor = 0x0096ff;
    private fillAlphaPreview = 0.2;
    private fillAlphaComplete = 0.4;

    constructor(thresholdMouseMove = 4, thresholdNearLine = 2) {
        this.thresholdMouseMove = thresholdMouseMove;
        this.thresholdNearLine = thresholdNearLine;
        this.isDrawing = false;
        this.points = [];
    }
    init() {
        this.isDrawing = false;
        this.points = [];
    }

    evalNextPoint(point: Phaser.Math.Vector2): boolean {
        if (this.points.length === 0) {
            return true;
        }
        const last = this.points[this.points.length - 1];
        if (Phaser.Math.Distance.BetweenPoints(last, point) < this.thresholdMouseMove) {
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
            if (Phaser.Geom.Intersects.PointToLine(point, new Phaser.Geom.Line(p1.x, p1.y, p2.x, p2.y), this.thresholdNearLine)) {
                return false;
            }
        }
        // これまでの点が新しい線の近くにあるかチェック
        for (let i = 0; i < this.points.length - 1; i++) {
            const p = this.points[i];
            if (Phaser.Geom.Intersects.PointToLine(p, line, this.thresholdNearLine)) {
                return false;
            }
        }
        return true;
    }
    evalLastLine(): boolean {
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

    addPoint(point: Phaser.Math.Vector2) {
        if (!this.evalNextPoint(point)) return;
        this.points.push(point);
    }
    setDrawing(drawing: boolean) {
        this.isDrawing = drawing;
    }
    getDrawing() {
        return this.isDrawing;
    }
    getPoints() {
        return this.points;
    }
    draw(graphics: Phaser.GameObjects.Graphics, clear = true) {
        if (clear) graphics.clear();
        if (this.points.length < 2) return;

        graphics.lineStyle(this.strokeWidth, this.strokeColor, this.strokeAlpha);
        graphics.beginPath();
        graphics.moveTo(this.points[0].x, this.points[0].y);
        for (let i = 1; i < this.points.length; i++) {
            graphics.lineTo(this.points[i].x, this.points[i].y);
        }
        graphics.strokePath();
        if (this.isDrawing) {
            if (this.points.length < 3) {
                return;
            }
            if (this.evalLastLine()) {
                graphics.beginPath();
                graphics.lineStyle(this.strokeWidth, this.previewOkColor, this.strokeAlpha);
                graphics.moveTo(this.points[this.points.length - 1].x, this.points[this.points.length - 1].y);
                graphics.lineTo(this.points[0].x, this.points[0].y);
                graphics.strokePath();
                graphics.fillStyle(this.fillColor, this.fillAlphaPreview);
                graphics.beginPath();
                graphics.moveTo(this.points[0].x, this.points[0].y);
                for (let i = 1; i < this.points.length; i++) {
                    graphics.lineTo(this.points[i].x, this.points[i].y);
                }
                graphics.closePath();
                graphics.fillPath();
            }
            else {
                graphics.beginPath();
                graphics.lineStyle(this.strokeWidth, this.previewNgColor, this.strokeAlpha);
                graphics.moveTo(this.points[this.points.length - 1].x, this.points[this.points.length - 1].y);
                graphics.lineTo(this.points[0].x, this.points[0].y);
                graphics.strokePath();
            }
        }
        else {
            if (this.evalLastLine()) {
                graphics.lineTo(this.points[0].x, this.points[0].y);
                graphics.strokePath();
                graphics.beginPath();
                graphics.fillStyle(this.fillColor, this.fillAlphaComplete);
                graphics.moveTo(this.points[0].x, this.points[0].y);
                for (let i = 1; i < this.points.length; i++) {
                    graphics.lineTo(this.points[i].x, this.points[i].y);
                }
                graphics.closePath();
                graphics.fillPath();
            }
            else {
                graphics.beginPath();
                graphics.lineStyle(this.strokeWidth, this.previewNgColor, this.strokeAlpha);
                graphics.lineTo(this.points[0].x, this.points[0].y);
                graphics.strokePath();
            }
        }
    }
}

export class PlayScene extends Phaser.Scene {
    private graphics!: Phaser.GameObjects.Graphics;
    private lasso = new Lasso();

    constructor() {
        super({ key: "PlayScene" });
    }

    preload() {
    }

    // シーンのセットアップ
    create() {
        this.cameras.main.setBackgroundColor(0x101015);

        this.graphics = this.add.graphics();

        // T キーで TitleScene へ遷移する例（データを渡す）
        this.input.keyboard?.once("keydown-T", () => {
            this.scene.start("TitleScene", { from: "PlayScene", score: 0 });
        });

        this.input.on('pointerdown', (pointer: Phaser.Input.Pointer) => {
            this.lasso.init();
            this.lasso.setDrawing(true);
            this.lasso.addPoint(new Phaser.Math.Vector2(pointer.x, pointer.y));
            this.lasso.draw(this.graphics, true);
        });

        this.input.on('pointermove', (pointer: Phaser.Input.Pointer) => {
            const drawing = this.lasso.getDrawing();
            if (!drawing) return;
            this.lasso.addPoint(new Phaser.Math.Vector2(pointer.x, pointer.y));
            this.lasso.draw(this.graphics, true);
        });

        this.input.on('pointerup', () => {
            if (!this.lasso.getDrawing()) return;
            this.lasso.setDrawing(false);
            this.lasso.draw(this.graphics, false);
        });

        this.input.keyboard?.once("keydown-C", () => {
            this.lasso.init();
            this.lasso.draw(this.graphics, false);
        });

    }

    // 毎フレームの更新（必要になったら使う）
    update(_time: number, _delta: number) {
    }
}
