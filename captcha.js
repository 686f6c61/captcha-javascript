// captcha.js

// Variable global para almacenar el texto del CAPTCHA generado
let generatedCaptcha = '';

// Tiempo de expiración del CAPTCHA en milisegundos (1 minuto)
const captchaExpirationTime = 60000;

// Identificadores para los temporizadores
let captchaTimeout;
let timerInterval;

/**
 * Función que se ejecuta cuando el DOM está completamente cargado.
 * Inicializa la generación del CAPTCHA y configura los eventos necesarios.
 */
document.addEventListener('DOMContentLoaded', function() {
    // Obtener el contenedor del CAPTCHA desde el DOM
    const captchaContainer = document.getElementById('captcha-container');
    
    // Generar el primer CAPTCHA al cargar la página
    generateCaptcha();

    /**
     * Función para generar un nuevo CAPTCHA.
     * Crea un canvas, dibuja el CAPTCHA con ruido y distorsiones, y actualiza el DOM.
     */
    function generateCaptcha() {
        // Crear un elemento canvas y obtener su contexto 2D
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        canvas.width = 200;  // Ancho del canvas
        canvas.height = 80;  // Alto del canvas

        // Generar el texto del CAPTCHA con números y letras (8 caracteres)
        generatedCaptcha = Math.random().toString(36).substring(2, 10).toUpperCase();

        // Dibujar el fondo del CAPTCHA
        ctx.fillStyle = '#f0f0f0'; // Color de fondo
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // Añadir curvas y arcos aleatorios al fondo para aumentar la complejidad
        for (let i = 0; i < 5; i++) {
            ctx.strokeStyle = `rgba(${randomInt(0,255)}, ${randomInt(0,255)}, ${randomInt(0,255)}, 0.3)`; // Color aleatorio con transparencia
            ctx.beginPath();
            const startX = randomInt(0, canvas.width);
            const startY = randomInt(0, canvas.height);
            const cp1X = randomInt(0, canvas.width);
            const cp1Y = randomInt(0, canvas.height);
            const cp2X = randomInt(0, canvas.width);
            const cp2Y = randomInt(0, canvas.height);
            const endX = randomInt(0, canvas.width);
            const endY = randomInt(0, canvas.height);
            ctx.bezierCurveTo(cp1X, cp1Y, cp2X, cp2Y, endX, endY);
            ctx.stroke();
        }

        // Añadir líneas de ruido al fondo
        for (let i = 0; i < 15; i++) {
            ctx.strokeStyle = `rgba(${randomInt(0,255)}, ${randomInt(0,255)}, ${randomInt(0,255)}, 0.5)`; // Color aleatorio con transparencia
            ctx.beginPath();
            ctx.moveTo(randomInt(0, canvas.width), randomInt(0, canvas.height)); // Punto de inicio
            ctx.lineTo(randomInt(0, canvas.width), randomInt(0, canvas.height)); // Punto de fin
            ctx.stroke(); // Dibujar la línea
        }

        // Configurar la fuente y estilos para el texto del CAPTCHA
        const fonts = ['Arial', 'Verdana', 'Times New Roman', 'Courier New', 'Georgia'];
        const fontSize = 30;
        ctx.textBaseline = 'middle';

        // Dibujar cada carácter individualmente con rotación y color aleatorio
        for (let i = 0; i < generatedCaptcha.length; i++) {
            const char = generatedCaptcha[i];
            ctx.font = `${randomInt(24, 36)}px ${fonts[randomInt(0, fonts.length - 1)]}`; // Fuente y tamaño aleatorio
            ctx.fillStyle = `rgba(${randomInt(0,255)}, ${randomInt(0,255)}, ${randomInt(0,255)}, 1)`; // Color aleatorio
            ctx.save();
            const x = 30 + i * 20 + randomInt(-5,5); // Posición X con ligera variación
            const y = canvas.height / 2 + randomInt(-10,10); // Posición Y con ligera variación
            const angle = (Math.PI / 180) * randomInt(-30, 30); // Rotación aleatoria entre -30 y 30 grados
            ctx.translate(x, y);
            ctx.rotate(angle);
            ctx.fillText(char, 0, 0); // Dibujar el carácter
            ctx.restore();
        }

        // Añadir sombras al texto para mayor efecto de distorsión
        ctx.shadowColor = 'rgba(0,0,0,0.3)';
        ctx.shadowBlur = 3;
        ctx.shadowOffsetX = 2;
        ctx.shadowOffsetY = 2;

        // Añadir puntos de ruido adicionales
        for (let i = 0; i < 200; i++) {
            ctx.fillStyle = `rgba(${randomInt(0,255)}, ${randomInt(0,255)}, ${randomInt(0,255)}, 0.3)`; // Color aleatorio con mayor transparencia
            ctx.beginPath();
            ctx.arc(randomInt(0, canvas.width), randomInt(0, canvas.height), 1, 0, Math.PI * 2); // Dibujar un círculo pequeño
            ctx.fill(); // Rellenar el círculo
        }

        // Limpiar el contenedor del CAPTCHA y agregar el nuevo canvas
        captchaContainer.innerHTML = '';
        captchaContainer.appendChild(canvas);

        // Limpiar cualquier mensaje de expiración anterior
        document.getElementById('expired-message').textContent = '';

        // Reiniciar los temporizadores existentes
        clearTimeout(captchaTimeout);
        clearInterval(timerInterval);
        
        // Iniciar el temporizador para la expiración del CAPTCHA
        startTimer();

        /**
         * Añadir un evento de clic al canvas para permitir al usuario regenerar el CAPTCHA manualmente.
         * Esto mejora la accesibilidad y usabilidad.
         */
        canvas.addEventListener('click', generateCaptcha);
    }

    /**
     * Función para iniciar el temporizador que cuenta el tiempo restante antes de que expire el CAPTCHA.
     * Actualiza el DOM cada segundo para mostrar el tiempo restante.
     */
    function startTimer() {
        let timeLeft = captchaExpirationTime / 1000; // Convertir el tiempo a segundos
        const timerElement = document.getElementById('timer');
        timerElement.textContent = `Tiempo restante: ${timeLeft}s`; // Mostrar el tiempo inicial

        // Iniciar el intervalo que actualiza el tiempo cada segundo
        timerInterval = setInterval(() => {
            timeLeft--; // Decrementar el tiempo restante
            if (timeLeft > 0) {
                timerElement.textContent = `Tiempo restante: ${timeLeft}s`; // Actualizar el texto del temporizador
            } else {
                clearInterval(timerInterval); // Detener el intervalo
                captchaExpired(); // Ejecutar la función de expiración del CAPTCHA
            }
        }, 1000); // Intervalo de 1 segundo
    }

    /**
     * Función que se ejecuta cuando el CAPTCHA ha expirado.
     * Muestra un mensaje al usuario y genera un nuevo CAPTCHA automáticamente.
     */
    function captchaExpired() {
        // Mostrar mensaje de expiración en el DOM
        const expiredMessage = document.getElementById('expired-message');
        expiredMessage.textContent = 'El CAPTCHA ha expirado. Se ha generado uno nuevo.';
        expiredMessage.style.display = 'block'; // Asegurar que el mensaje sea visible

        // Generar un nuevo CAPTCHA
        generateCaptcha();
    }

    /**
     * Función auxiliar para generar un número entero aleatorio entre min y max (inclusive).
     * @param {number} min - Valor mínimo.
     * @param {number} max - Valor máximo.
     * @returns {number} - Número entero aleatorio.
     */
    function randomInt(min, max) {
        return Math.floor(Math.random() * (max - min + 1)) + min;
    }

    // Exponer la función generateCaptcha al ámbito global para poder ser llamada desde el HTML
    window.generateCaptcha = generateCaptcha;
});

/**
 * Función para verificar si la entrada del usuario coincide con el CAPTCHA generado.
 * Actualiza el DOM para mostrar el resultado de la verificación.
 */
function checkCaptcha() {
    // Obtener el valor ingresado por el usuario en el campo de CAPTCHA
    const userCaptchaInput = document.querySelector('input[name="captcha"]').value.trim().toUpperCase();
    
    // Obtener el elemento donde se mostrará el estado de la verificación
    const captchaStatus = document.getElementById('captcha-status');

    // Comparar la entrada del usuario con el CAPTCHA generado
    if (userCaptchaInput === generatedCaptcha) {
        // Si coinciden, mostrar un mensaje de éxito
        captchaStatus.textContent = '¡CAPTCHA verificado correctamente!';
        captchaStatus.style.color = 'green';
    } else {
        // Si no coinciden, mostrar un mensaje de error y regenerar el CAPTCHA
        captchaStatus.textContent = 'CAPTCHA incorrecto. Intenta nuevamente.';
        captchaStatus.style.color = 'red';
        generateCaptcha(); // Regenerar un nuevo CAPTCHA
    }
}
