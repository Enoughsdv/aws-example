import { Application, Assets, Container, Text, TextStyle, Graphics } from 'pixi.js';
import type { Texture } from 'pixi.js';
import { Player } from './player';
import { Camera } from './camera';
import { NPC } from './npc';

const LAMBDA_URL = import.meta.env.VITE_LAMBDA_URL;

(async () => {
    const app = new Application();
    await app.init({ background: '#263033ff', resizeTo: window });
    document.getElementById('pixi-container')?.appendChild(app.canvas);
    
    const playerData = { playerName: 'Client' };

    const texture = await Assets.load('/assets/player_waiting.png');
    const npcTexture = await Assets.load('/assets/npc1.png');
    
    const otherPlayers: Map<string, Player> = new Map();
    const player = new Player(texture, playerData.playerName, '');
    const npc = new NPC(npcTexture, 'NPC_1');
    npc.position.set(500, 200);

    const camera = new Camera(player, app);
    camera.addChild(npc);
    app.stage.addChild(camera);
    
    const hudContainer = new Container();
    hudContainer.position.set(10, app.screen.height - 60);
    
    const sessionIdText = new Text({
        text: 'Session ID: Conectando...',
        style: new TextStyle({
            fontSize: 14,
            fill: '#ffffff',
            stroke: { color: '#000000', width: 2 },
        }),
    });
    
    const positionText = new Text({
        text: 'Position: (0, 0)',
        style: new TextStyle({
            fontSize: 14,
            fill: '#ffffff',
            stroke: { color: '#000000', width: 2 },
        }),
    });
    
    positionText.y = 20;
    
    hudContainer.addChild(sessionIdText, positionText);
    app.stage.addChild(hudContainer);
    
    const hudBackground = new Container();
    const hudBg = new Graphics();
    hudBg.fill({ color: 0x000000, alpha: 0.5 });
    hudBg.roundRect(-5, -5, 350, 50, 10);
    hudBg.fill();
    hudBackground.addChild(hudBg);
    hudContainer.addChildAt(hudBackground, 0);
    const socket = new WebSocket('ws://testserver2-env.eba-zs6amxyp.us-east-1.elasticbeanstalk.com/');
    let sessionId = '';

    socket.onopen = () => {
        console.log('Conectado al servidor');
        socket.send(JSON.stringify({
            action: 'join',
            playerName: playerData.playerName
        }));
    };

    socket.onmessage = (event) => {
        const message = JSON.parse(event.data);
        
        switch (message.type) {
            case 'join_success':
                sessionId = message.sessionId;
                player.updateSessionId(sessionId);
                sessionIdText.text = `Session ID: ${sessionId}`;
                break;
                
            case 'player_list':
                updatePlayerList(message.players, otherPlayers, texture, camera, sessionId);
                break;
                
            case 'player_move':
                if (message.sessionId !== sessionId && otherPlayers.has(message.sessionId)) {
                    const otherPlayer = otherPlayers.get(message.sessionId);
                    if (otherPlayer) {
                        otherPlayer.position.set(message.x, message.y);
                    }
                }
                break;
                
            case 'player_disconnect':
                if (otherPlayers.has(message.sessionId)) {
                    const playerToRemove = otherPlayers.get(message.sessionId);
                    if (playerToRemove) {
                        camera.removeChild(playerToRemove);
                        otherPlayers.delete(message.sessionId);
                    }
                }
                break;
                
            case 'npc_message':
                if (message.npcName === 'NPC_1') {
                    npc.setChatMessage(message.message);
                }
                break;
        }
    };

    socket.onclose = () => {
        console.log('Desconectado del servidor');
    };

    socket.onerror = (error) => {
        console.error('Error en la conexión:', error);
    };

    window.addEventListener('resize', () => {
        hudContainer.position.set(10, app.screen.height - 60);
    });
    
    let collisionCooldown = false;
    let lastSentPosition = { x: 0, y: 0 };

    app.ticker.add(async () => {
        player.update();
        camera.update();
        
        positionText.text = `Position: (${Math.round(player.x)}, ${Math.round(player.y)})`;
        hudContainer.position.set(10, app.screen.height - 60);
        
        const isNearNPC = checkProximity(player, npc, 100);
        npc.setInteractable(isNearNPC);
        
        if (player.x !== lastSentPosition.x || player.y !== lastSentPosition.y) {
            lastSentPosition = { x: player.x, y: player.y };
            if (socket.readyState === WebSocket.OPEN && sessionId) {
                socket.send(JSON.stringify({
                    action: 'move',
                    sessionId: sessionId,
                    x: player.x,
                    y: player.y
                }));
            }
        }
        
        if (isNearNPC && player.keys.e && !collisionCooldown) {
            collisionCooldown = true;
            setTimeout(() => {
                collisionCooldown = false;
            }, 500);
            
            if (!LAMBDA_URL) {
                console.error('Error: LAMBDA_URL no está definido en las variables de entorno');
                return;
            }

            const response = await fetch(LAMBDA_URL, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    action: 'talk',
                    playerName: player.name,
                    sessionId: player.sessionId,
                })
            });

            const result = await response.json();
            // {status: 'ok', message: 'Hola test (12344), ¿Cómo estás?'}
            npc.setChatMessage(result.message);
        }

        if (isNearNPC && player.keys.f && !collisionCooldown) {
            collisionCooldown = true;
            setTimeout(() => {
                collisionCooldown = false;
            }, 500);
            
            if (!LAMBDA_URL) {
                console.error('Error: LAMBDA_URL no está definido en las variables de entorno');
                return;
            }

            const response = await fetch(LAMBDA_URL, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    action: 'hit',
                    playerName: player.name,
                    sessionId: player.sessionId,
                })
            });

            const result = await response.json();
            // {status: 'ok', message: 'Hola test (12344), ¿Cómo estás?'}
            npc.setChatMessage(result.message);
        }
    });
    
    function updatePlayerList(
        players: Array<{sessionId: string, playerName: string, x: number, y: number}>, 
        otherPlayers: Map<string, Player>, 
        texture: Texture, 
        camera: Camera, 
        currentSessionId: string
    ) {
        const activeSessions = new Set<string>();
        
        players.forEach(playerInfo => {
            if (playerInfo.sessionId === currentSessionId) return;
            
            activeSessions.add(playerInfo.sessionId);
            
            if (otherPlayers.has(playerInfo.sessionId)) {
                const existingPlayer = otherPlayers.get(playerInfo.sessionId);
                if (existingPlayer) {
                    existingPlayer.position.set(playerInfo.x, playerInfo.y);
                }
            } else {
                const newPlayer = new Player(texture, playerInfo.playerName, playerInfo.sessionId);
                newPlayer.position.set(playerInfo.x, playerInfo.y);
                
                otherPlayers.set(playerInfo.sessionId, newPlayer);
                camera.addChild(newPlayer);
            }
        });
        
        otherPlayers.forEach((player, sessionId) => {
            if (!activeSessions.has(sessionId)) {
                camera.removeChild(player);
                otherPlayers.delete(sessionId);
            }
        });
    }
})();

function checkProximity(a: Container, b: Container, maxDistance: number): boolean {
    const aCenter = { x: a.x, y: a.y };
    const bCenter = { x: b.x, y: b.y };
    
    const dx = aCenter.x - bCenter.x;
    const dy = aCenter.y - bCenter.y;
    const distance = Math.sqrt(dx * dx + dy * dy);
    
    return distance < maxDistance;
}
