import Phaser from "phaser";
import { TitleScene } from "./scenes/TitleScene";
import { PlayScene } from "./scenes/PlayScene";

new Phaser.Game({
    type: Phaser.AUTO,
    backgroundColor: "#101015",
    width: 800,
    height: 600,
    scene: [TitleScene, PlayScene],
});
