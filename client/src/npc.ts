import { Container, Sprite, Text, TextStyle, Graphics, type Texture } from 'pixi.js';

export class NPC extends Container {
    sprite: Sprite;
    nameLabel: Text;
    chatLabel: Text;
    interactionIndicator: Graphics;
    interactionText: Text;
    isInteractable: boolean = false;

    constructor(texture: Texture, name: string) {
        super();

        this.sprite = new Sprite(texture);
        this.sprite.scale.set(0.2);
        this.sprite.anchor.set(0.5);

        this.nameLabel = new Text({
            text: name,
            style: new TextStyle({
                fontSize: 14,
                fill: '#00ff00',
                stroke: { color: '#000000', width: 1 },
            }),
        });
        this.nameLabel.anchor.set(0.5, 0);
        this.nameLabel.y = this.sprite.height / 2 + 5;

        this.chatLabel = new Text({
            text: '',
            style: new TextStyle({
                fontSize: 12,
                fill: '#ffffff',
                stroke: { color: '#000000', width: 1 },
            }),
        });
        this.chatLabel.anchor.set(0.5, 0);
        this.chatLabel.y = this.sprite.height / 2 + 25;

        this.interactionIndicator = new Graphics();
        
        this.interactionText = new Text({
            text: 'Presiona E para hablar o F para golpear',
            style: new TextStyle({
                fontSize: 12,
                fill: '#ffffff',
            }),
        });
        this.interactionText.anchor.set(0.5, 0);
        this.interactionText.y = this.sprite.height / 2 + 47;
        this.interactionText.visible = false;
        
        this.drawInteractionIndicator(false);
        
        this.addChild(this.sprite, this.nameLabel, this.chatLabel, this.interactionIndicator, this.interactionText);
    }

    setChatMessage(message: string) {
        this.chatLabel.text = message;
    }
    
    setInteractable(value: boolean) {
        if (this.isInteractable !== value) {
            this.isInteractable = value;
            this.drawInteractionIndicator(value);
            this.interactionText.visible = value;
        }
    }
    
    private drawInteractionIndicator(active: boolean) {
        this.interactionIndicator.clear();
        
        if (active) {
            this.interactionIndicator.setStrokeStyle({ width: 2, color: 0xffff00, alpha: 0.8 });

            const radius = Math.max(this.sprite.width, this.sprite.height) / 2 + 10;
            this.interactionIndicator.circle(0, 0, radius);
            
            this.interactionIndicator.setStrokeStyle({ width: 0 });
            this.interactionIndicator.fill({ color: 0x000000, alpha: 0.5 });
            this.interactionIndicator.roundRect(-120, this.sprite.height / 2 + 45, 240, 20, 5);
            this.interactionIndicator.fill();
        }
    }
}
