import Phaser from 'phaser';

export class HPBar {
    private background: Phaser.GameObjects.Rectangle;
    private bar: Phaser.GameObjects.Rectangle
    private width: number;
    private height: number;
    private thickness: number;

    constructor(scene: Phaser.Scene, x?: number, y?: number, width?: number, height?: number, thickness?: number) {
        this.width = width || 40;
        this.height = height || 4;
        this.thickness = thickness || 1;


        this.background = scene.add.rectangle(x || 0, y || 0, this.width + this.thickness * 2, this.height + this.thickness * 2, 0x222222);
        this.background.setOrigin(0.5, 0.5);

        this.bar = scene.add.rectangle(x || 0, y || 0, this.width, this.height, 0x00ff00);
        this.bar.setOrigin(0.5, 0.5);
    }

    setPosition(x: number, y: number) {
        this.background.setPosition(x, y);
        this.bar.setPosition(x, y);
    }

    setRatio(ratio: number) {
        ratio = Phaser.Math.Clamp(ratio, 0, 1);
        this.bar.width = this.width * ratio;

        // 色を変更
        if (ratio > 0.5) {
            this.bar.fillColor = 0x00ff00; // Green
        } else if (ratio > 0.2) {
            this.bar.fillColor = 0xffff00; // Yellow
        } else {
            this.bar.fillColor = 0xff0000; // Red
        }
    }

    destroy() {
        this.background.destroy();
        this.bar.destroy();
    }
}
