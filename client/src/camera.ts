import { type Application, Container } from 'pixi.js';
import type { Player } from './player';

export class Camera extends Container {
    cameraLerp: number = 0.1;
    player: Player;
    app: Application;

    constructor(player: Player, app: Application) {
        super();
        this.player = player;
        this.app = app;
        
        this.addChild(this.player);
    }

    update() {
        this.pivot.set(
            this.lerp(this.pivot.x, this.player.x, this.cameraLerp),
            this.lerp(this.pivot.y, this.player.y, this.cameraLerp)
        );
        this.position.set(this.app.screen.width / 2, this.app.screen.height / 2);
    }

    lerp(start: number, end: number, t: number): number {
        return start + (end - start) * t;
    }
}
