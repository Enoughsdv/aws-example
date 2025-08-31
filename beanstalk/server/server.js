const WebSocket = require('ws');
const { v4: uuidv4 } = require('uuid');
const http = require('http');

const server = http.createServer();
const wss = new WebSocket.Server({ server });

const players = new Map();

wss.on('connection', (ws) => {
    console.log('Cliente conectado');

    let playerId = null;
    let playerInfo = null;

    ws.on('message', (message) => {
        try {
            const data = JSON.parse(message);

            switch (data.action) {
                case 'join':
                    playerId = uuidv4();
                    playerInfo = {
                        sessionId: playerId,
                        playerName: data.playerName || 'Player',
                        x: 0,
                        y: 0
                    };

                    players.set(playerId, {
                        ws,
                        info: playerInfo
                    });

                    ws.send(JSON.stringify({
                        type: 'join_success',
                        sessionId: playerId
                    }));

                    broadcastPlayerList();
                    break;

                case 'move':
                    if (players.has(data.sessionId)) {
                        const player = players.get(data.sessionId);
                        player.info.x = data.x;
                        player.info.y = data.y;

                        broadcastPlayerMove(data.sessionId, data.x, data.y);
                    }
                    break;
            }
        } catch (error) {
            console.error('Error procesando mensaje:', error);
        }
    });

    ws.on('close', () => {
        console.log('Cliente desconectado');

        if (playerId && players.has(playerId)) {
            players.delete(playerId);

            wss.clients.forEach((client) => {
                if (client.readyState === WebSocket.OPEN) {
                    client.send(JSON.stringify({
                        type: 'player_disconnect',
                        sessionId: playerId
                    }));
                }
            });
        }
    });
});

function broadcastPlayerList() {
    const playerList = Array.from(players.values()).map(p => p.info);

    wss.clients.forEach((client) => {
        if (client.readyState === WebSocket.OPEN) {
            client.send(JSON.stringify({
                type: 'player_list',
                players: playerList
            }));
        }
    });
}

function broadcastPlayerMove(sessionId, x, y) {
    wss.clients.forEach((client) => {
        if (client.readyState === WebSocket.OPEN) {
            client.send(JSON.stringify({
                type: 'player_move',
                sessionId,
                x,
                y
            }));
        }
    });
}

server.listen(3000, () => {
    console.log('Servidor iniciado en puerto 3000');
});
