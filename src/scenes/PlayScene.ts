// src/scenes/PlayScene.ts
import Phaser from "phaser";

export class PlayScene extends Phaser.Scene {
    private player!: Phaser.GameObjects.Arc;
    private cursors!: Phaser.Types.Input.Keyboard.CursorKeys;
    private velocity!: Phaser.Math.Vector2;
    private speed = 10;
    private friction = -0.001;
    private pointerCircle!: Phaser.GameObjects.Arc;

    constructor() {
        super({ key: "PlayScene" });
    }

    preload() {
    }

    // シーンのセットアップ
    create() {
        this.cameras.main.setBackgroundColor(0x101015);

        this.add.text(16, 16, "PlayScene", {
            color: "#fff",
            fontFamily: "monospace",
            fontSize: "16px",
        });

        // T キーで TitleScene へ遷移する例（データを渡す）
        this.input.keyboard?.once("keydown-T", () => {
            this.scene.start("TitleScene", { from: "PlayScene", score: 0 });
        });

        this.player = this.add.circle(400,300,14,0x66bb6a);
        this.cursors = this.input.keyboard!.createCursorKeys();
        this.velocity = new Phaser.Math.Vector2();

        this.pointerCircle = this.add.circle(0, 0, 10, 0x66bb6a);
    }

    // 毎フレームの更新（必要になったら使う）
    update(_time: number, _delta: number) {
        const speed = this.speed * (_delta / 1000);
        if (this.cursors.left.isDown) {
            this.velocity.x -= speed;
        }
        if (this.cursors.right.isDown) {
            this.velocity.x += speed;
        }
        if (this.cursors.up.isDown) {
            this.velocity.y -= speed;
        }
        if (this.cursors.down.isDown) {
            this.velocity.y += speed;
        }

        // 速度に摩擦を適用
        this.velocity.x *= Math.exp(this.friction * _delta);
        this.velocity.y *= Math.exp(this.friction * _delta);

        this.player.x += this.velocity.x;
        this.player.y += this.velocity.y;
    }
}
