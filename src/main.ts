import Phaser from "phaser";
import { TitleScene } from "./scenes/TitleScene";
import { PlayScene } from "./scenes/PlayScene";

new Phaser.Game({
    type: Phaser.AUTO,
    backgroundColor: "#101015",
    scale: { mode: Phaser.Scale.RESIZE, autoCenter: Phaser.Scale.CENTER_BOTH, width: "100%", height: "100%" },
    scene: [TitleScene, PlayScene],
});
