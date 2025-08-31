/*
 * Server Action
 * Acciones que hace el jugador
 */
export const handler = async (event) => {
    if (event.requestContext?.http?.method === 'OPTIONS') {
        return {
            statusCode: 200,
            headers: {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'GET,POST,OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type',
            },
            body: '',
        };
    }

    let body = event;
    if (event?.body) {
        body = typeof event.body === 'string' ? JSON.parse(event.body) : event.body;
    }
    
    const { action, playerName, sessionId } = body;

    if (!playerName || !sessionId) {
        return returnResult({ status: 'error', message: 'Faltan playerName o sessionId' }, 400);
    }

    switch (action) {
        case 'talk': {
            const randomMessages = [
                `Hola ${playerName} (${sessionId}), ¿Cómo estás?`,
                `¿Qué te trae por aquí? ${playerName} (${sessionId})`,
                `¡Bienvenido al servidor ${playerName} (${sessionId})!`,
            ];
            const randomMessage = randomMessages[Math.floor(Math.random() * randomMessages.length)];
            return returnResult({ status: 'ok', message: randomMessage });
        }

        case 'hit': {
            return returnResult({ status: 'ok', message: `¿Por qué me golpeas ${playerName} (${sessionId})?` });
        }

        default:
            return returnResult({ status: 'error', message: `Acción desconocida: ${action}` }, 400);
    }
};

function returnResult(result, statusCode = 200) {
    return {
        statusCode,
        headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'GET,POST,OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type',
        },
        body: JSON.stringify(result),
    };
}
