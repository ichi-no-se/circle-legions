import Phaser from "phaser";
import { TitleScene } from "./scenes/TitleScene";
import { PlayScene } from "./scenes/PlayScene";
import { HowToPlayScene } from "./scenes/HowToPlayScene";
import { StageSelectScene } from "./scenes/StageSelectScene";
import { ResultScene } from "./scenes/ResultScene";

new Phaser.Game({
    type: Phaser.AUTO,
    backgroundColor: "#101015",
    width: 800,
    height: 600,
    scene: [TitleScene, HowToPlayScene, StageSelectScene, PlayScene, ResultScene],
});
