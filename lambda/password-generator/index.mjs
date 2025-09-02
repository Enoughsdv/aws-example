/*
 * Generador de contraseñas
 * { length: <número> } - máximo 64 caracteres y mínimo 8 caracteres
 */
// length = 10
export const handler = async (event) => {
    const { length } = event;

    if (isNaN(length)) {
        return returnResult({ error: 'Entrada inválida', hint: 'Introduce un número del 8 al 64' }, 400);
    }

    const validLength = Math.floor(parseInt(length));

    if (validLength < 8 || validLength > 64) {
        return returnResult({ error: 'Longitud no válida', hint: 'La longitud debe estar entre 8 y 64 caracteres' }, 400);
    }

    const lowerCase = 'abcdefghijklmnopqrstuvwxyz';
    const upperCase = lowerCase.toUpperCase();
    const numbers = '1234567890';

    const symbols = '!#$%&/()=?¿¡.;-_{}[]*`';

    const allCharacters = lowerCase + upperCase + numbers + symbols; // 84

    let password = '';
    for (let i = 0; i < validLength; i++) {
        const randomIndex = Math.floor(Math.random() * allCharacters.length);
        password += allCharacters[randomIndex];
    }

    return returnResult({ password });
};

function returnResult(result, statusCode = 200) {
    const response = {
        statusCode: parseInt(statusCode),
        body: JSON.stringify(result),
    };
    return response;
}
