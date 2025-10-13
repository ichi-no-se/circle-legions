import Phaser from 'phaser';

export type ArrowTextureOptions = {
    width?: number;
    height?: number;
    fillColor?: number;
    strokeColor?: number;
    strokeWidth?: number;
    key? : string;
};

export function createArrowTexture(scene: Phaser.Scene, options: ArrowTextureOptions = {}): string {
    const{
        width = 10,
        height = 8,
        fillColor = 0xffffff,
        strokeColor = 0xffff00,
        strokeWidth = 1,
        key,
    } = options;

    const textureKey = key || `arrowTexture_${width}x${height}_${fillColor.toString(16)}_${strokeColor.toString(16)}_${strokeWidth}`;

    if (scene.textures.exists(textureKey)) {
        return textureKey;
    }

    const graphics = scene.add.graphics();
    graphics.fillStyle(fillColor, 1);
    graphics.lineStyle(strokeWidth, strokeColor, 1);
    graphics.beginPath();
    graphics.moveTo(0, 0);
    graphics.lineTo(width, height / 2);
    graphics.lineTo(0, height);
    graphics.lineTo(width / 4, height / 2);
    graphics.closePath();
    graphics.fillPath();
    graphics.strokePath();

    graphics.generateTexture(textureKey, width, height);
    graphics.destroy();
    return textureKey;
}
