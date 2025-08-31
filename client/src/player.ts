import { Container, Sprite, Text, TextStyle, type Texture } from 'pixi.js';

export class Player extends Container {
    sprite: Sprite;
    playerLabel: Text;
    speed: number = 3;
    keys: Record<string, boolean> = {};
    name: string;
    sessionId: string;

    constructor(texture: Texture, playerName: string, sessionId: string) {
        super();

        this.name = playerName;
        this.sessionId = sessionId;
        this.sprite = new Sprite(texture);
        this.sprite.anchor.set(0.5);

        this.playerLabel = new Text({
            text: playerName,
            style: new TextStyle({
                fontSize: 14,
                fill: '#ffffff',
                stroke: { color: '#000000', width: 1 },
            }),
        });
        this.playerLabel.anchor.set(0.5, 0);
        this.playerLabel.y = this.sprite.height / 2 + 5;

        this.addChild(this.sprite, this.playerLabel);

        window.addEventListener('keydown', (e) => {
            this.keys[e.key] = true;
        });
        window.addEventListener('keyup', (e) => {
            this.keys[e.key] = false;
        });

        this.position.set(0, 0);
    }

    update() {
        if (this.keys.ArrowUp || this.keys.w) this.y -= this.speed;
        if (this.keys.ArrowDown || this.keys.s) this.y += this.speed;
        if (this.keys.ArrowLeft || this.keys.a) this.x -= this.speed;
        if (this.keys.ArrowRight || this.keys.d) this.x += this.speed;
    }
    
    updateSessionId(newSessionId: string) {
        this.sessionId = newSessionId;
    }
}
