/*
 * Adivinar Número
 * { number: <número> } - número entre 1 y 10
 */
export const handler = async (event) => {
    const { number } = event;

    if (isNaN(number)) {
        return returnResult({ error: 'Entrada inválida', hint: 'Envía un número entre 1 y 10' }, 400);
    }

    const guess = parseInt(number);

    if (!Number.isInteger(guess) || guess < 1 || guess > 10) {
        return returnResult({ error: 'Fuera de rango', hint: 'La suposición debe ser un entero entre 1 y 10' }, 400);
    }

    const randomNumber = Math.floor(Math.random() * 10) + 1;

    let message = '';
    if (guess < randomNumber) {
        message = `Tu suposición es demasiado baja. La respuesta correcta es ${randomNumber}`;
    } else if (guess > randomNumber) {
        message = `Tu suposición es demasiado alta. La respuesta correcta es ${randomNumber}`;
    } else {
        message = `Felicidades adivinaste el número correcto. El número era ${randomNumber}`;
    }

    return returnResult({ message });
};

function returnResult(result, statusCode = 200) {
    const response = {
        statusCode: parseInt(statusCode),
        body: JSON.stringify(result),
    };
    return response;
}
