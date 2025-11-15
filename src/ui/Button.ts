import Phaser from "phaser";

export function createButton(scene: Phaser.Scene, text: string, x: number, y: number): Phaser.GameObjects.Container {
	const padding = { x: 20, y: 10 };
	const buttonColor = 0x333366;
	const buttonHoverColor = 0x555588;
	const textColor = "#ffffff";

	const buttonText = scene.add.text(0, 0, text, {
		fontSize: "32px",
		color: textColor
	}).setOrigin(0.5);

	const buttonBackground = scene.add.rectangle(0, 0, buttonText.width + padding.x * 2, buttonText.height + padding.y * 2, buttonColor)
		.setOrigin(0.5);
	const container = scene.add.container(x, y, [buttonBackground, buttonText]);
	container.setSize(buttonBackground.width, buttonBackground.height);
	container.setInteractive();
	container.on("pointerover", () => {
		buttonBackground.setFillStyle(buttonHoverColor);
	});
	container.on("pointerout", () => {
		buttonBackground.setFillStyle(buttonColor);
	});
	return container;
}