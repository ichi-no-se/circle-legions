import Phaser from "phaser";

class MainScene extends Phaser.Scene {
  constructor() { super("main"); }

  preload() {
    // 例: public 内のアセットを読む場合
    // this.load.image("logo", "/logo.png");
  }

  create() {
    this.add.text(20, 20, "Hello, Phaser + Vite + TS!", {
      fontFamily: "monospace",
      fontSize: "20px",
      color: "#ffffff",
    });
    // 例: this.add.image(200, 200, "logo");
  }
}

const config: Phaser.Types.Core.GameConfig = {
  type: Phaser.AUTO,
  parent: "app",
  backgroundColor: "#20262e",
  scale: { mode: Phaser.Scale.FIT, autoCenter: Phaser.Scale.CENTER_BOTH, width: 800, height: 450 },
  scene: [MainScene],
};

new Phaser.Game(config);
