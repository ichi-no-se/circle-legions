import Phaser from "phaser";
import { Lasso } from "./Lasso";
import { Route } from "./Route";
import { World } from "../core/World";
import type { InputIntent } from "../input/InputService";
import { PlayerDecisionController } from "../controllers/Player/PlayerController";
import { PlayerVisualController } from "../controllers/Player/PlayerController";

export class LassoAndRouteManager {
    private lasso: Lasso;
    private route: Route;
    private graphics: Phaser.GameObjects.Graphics;
    private mode: 'Lasso' | 'Route' | 'None'
    private selectedUnitIds: number[];

    constructor(scene: Phaser.Scene) {
        this.graphics = scene.add.graphics();
        this.lasso = new Lasso(this.graphics);
        this.route = new Route(this.graphics);
        this.mode = 'None';
        this.selectedUnitIds = [];
    }

    update(inputIntent: InputIntent, world: World) {
        if (this.mode === 'None') {
            if (inputIntent.isJustDown) {
                let selectedCount = 0;
                for (const id of this.selectedUnitIds) {
                    const unit = world.getUnitById(id);
                    if (unit && unit.isAlive() && unit.getDecisionController() instanceof PlayerDecisionController) {
                        selectedCount++;
                    }
                }
                if (selectedCount > 0) {
                    this.mode = 'Route';
                }
                else {
                    this.mode = 'Lasso';
                }
            }
        }
        if (this.mode === 'Lasso') {
            this.lasso.update(inputIntent);
            this.selectedUnitIds = [];
            if (this.lasso.isValid()) {
                for (const unit of world.getUnitIterator()) {
                    if (unit.getDecisionController() instanceof PlayerDecisionController) {
                        if (this.lasso.contains(unit.getPos())) {
                            this.selectedUnitIds.push(unit.id);
                        }
                    }
                }
            }
            if (inputIntent.isDown === false) {
                this.mode = 'None';
                this.lasso.clear();
            }
            this.lasso.draw();
        }
        if (this.mode === 'Route') {
            this.route.update(inputIntent);
            if (inputIntent.isDown === false) {
                for (const id of this.selectedUnitIds) {
                    const unit = world.getUnitById(id);
                    const decisionController = unit?.getDecisionController();
                    if (decisionController instanceof PlayerDecisionController) {
                        decisionController.setRoute(this.route.getRandomSampledPoints(20));
                    }
                }
                this.route.clear();
                this.selectedUnitIds = [];
                this.mode = 'None';
            }
            this.route.draw();
        }

        for (const unit of world.getUnitIterator()) {
            const visualController = unit.getVisualController();
            if (visualController instanceof PlayerVisualController) {
                visualController.setSelected(false);
            }
        }
        for (const id of this.selectedUnitIds) {
            const unit = world.getUnitById(id);
            const visualController = unit?.getVisualController();
            if (visualController instanceof PlayerVisualController) {
                visualController.setSelected(true);
            }
        }
    }

}
