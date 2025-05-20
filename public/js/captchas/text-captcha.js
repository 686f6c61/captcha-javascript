// Crear un espacio de nombres para el CAPTCHA de texto
const TextCaptcha = (function() {
    // Tiempo de expiración del CAPTCHA en milisegundos (2 minutos)
    const CAPTCHA_EXPIRATION_TIME = 120000;
    
    // Texto generado para el CAPTCHA
    let generatedText = '';

/**
 * Crea una nueva instancia del CAPTCHA de texto
 * @param {HTMLElement} container - Contenedor donde se renderizará el CAPTCHA
 * @param {Object} callbacks - Objeto con callbacks para eventos del CAPTCHA
 * @returns {Object} Métodos públicos del CAPTCHA
 */
function createCaptcha(container, callbacks) {
    // Generar el texto del CAPTCHA
    generatedText = generateRandomText(6);
    
    // Crear elementos del DOM
    const captchaElement = document.createElement('div');
    captchaElement.className = 'text-captcha-container';
    
    // Crear canvas para el CAPTCHA
    const canvas = document.createElement('canvas');
    canvas.width = 300;
    canvas.height = 80;
    canvas.style.cursor = 'pointer';
    canvas.title = 'Haz clic para generar un nuevo CAPTCHA';
    
    // Dibujar el CAPTCHA en el canvas
    drawCaptcha(canvas, generatedText);
    
    // Campo de entrada para el usuario
    const input = document.createElement('input');
    input.type = 'text';
    input.placeholder = 'Ingrese el texto de la imagen';
    input.className = 'captcha-input';
    input.autocomplete = 'off';
    
    // Botón de verificación
    const button = document.createElement('button');
    button.id = 'verify-captcha';
    button.textContent = 'Verificar';
    button.onclick = () => verifyCaptcha(input.value, callbacks);
    
    // Contenedor para los controles
    const controls = document.createElement('div');
    controls.className = 'captcha-controls';
    controls.appendChild(input);
    controls.appendChild(button);
    
    // Agregar elementos al contenedor principal
    captchaElement.appendChild(canvas);
    captchaElement.appendChild(controls);
    
    // Limpiar el contenedor y agregar el nuevo CAPTCHA
    container.innerHTML = '';
    container.appendChild(captchaElement);
    
    // Agregar evento de clic al canvas para regenerar
    canvas.addEventListener('click', () => {
        generatedText = generateRandomText(6);
        drawCaptcha(canvas, generatedText);
        input.value = '';
        callbacks.onError && callbacks.onError('');
    });
    
    // Permitir verificación con Enter
    input.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            verifyCaptcha(input.value, callbacks);
        }
    });
    
    // Devolver la API pública del CAPTCHA
    return {
        // Método para limpiar recursos cuando se destruye el CAPTCHA
        cleanup: () => {
            canvas.removeEventListener('click', () => {});
            input.removeEventListener('keypress', () => {});
        }
    };
}

/**
 * Verifica si el texto ingresado coincide con el CAPTCHA generado
 * @param {string} userInput - Texto ingresado por el usuario
 * @param {Object} callbacks - Callbacks para manejar el resultado
 */
function verifyCaptcha(userInput, callbacks) {
    if (!userInput) {
        callbacks.onError && callbacks.onError('Por favor, ingresa el texto que ves en la imagen');
        return;
    }
    
    if (userInput.toLowerCase() === generatedText.toLowerCase()) {
        callbacks.onSuccess && callbacks.onSuccess();
    } else {
        callbacks.onError && callbacks.onError('El texto no coincide. Intenta de nuevo.');
    }
}

/**
 * Genera un texto aleatorio para el CAPTCHA
 * @param {number} length - Longitud del texto a generar
 * @returns {string} Texto aleatorio
 */
function generateRandomText(length) {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789';
    let result = '';
    for (let i = 0; i < length; i++) {
        result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
}

/**
 * Dibuja el CAPTCHA en el canvas con efectos de distorsión
 * @param {HTMLCanvasElement} canvas - Elemento canvas donde dibujar
 * @param {string} text - Texto a dibujar
 */
function drawCaptcha(canvas, text) {
    const ctx = canvas.getContext('2d');
    
    // Limpiar el canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Dibujar fondo con gradiente
    const gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
    gradient.addColorStop(0, '#f0f0f0');
    gradient.addColorStop(1, '#e0e0e0');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Añadir ruido de fondo
    addNoise(ctx, canvas.width, canvas.height);
    
    // Configurar el estilo del texto
    ctx.textBaseline = 'middle';
    ctx.textAlign = 'center';
    
    // Dibujar cada carácter con transformaciones aleatorias
    const charWidth = canvas.width / (text.length + 1);
    
    for (let i = 0; i < text.length; i++) {
        const char = text[i];
        const x = charWidth * (i + 0.5);
        const y = canvas.height / 2 + Math.sin(i * 0.5) * 5; // Onda sinusoidal
        
        // Aplicar rotación aleatoria
        const angle = (Math.random() - 0.5) * 0.5; // Hasta ±15 grados
        
        // Color aleatorio con buen contraste
        const hue = Math.floor(Math.random() * 360);
        ctx.fillStyle = `hsl(${hue}, 70%, 40%)`;
        
        // Guardar el estado del contexto
        ctx.save();
        
        // Aplicar transformaciones
        ctx.translate(x, y);
        ctx.rotate(angle);
        
        // Dibujar el carácter
        ctx.font = `${30 + Math.random() * 10}px Arial`;
        ctx.fillText(char, 0, 0);
        
        // Restaurar el estado del contexto
        ctx.restore();
    }
    
    // Añadir líneas de distorsión
    addDistortionLines(ctx, canvas.width, canvas.height);
}

/**
 * Añade ruido al fondo del CAPTCHA
 * @param {CanvasRenderingContext2D} ctx - Contexto del canvas
 * @param {number} width - Ancho del canvas
 * @param {number} height - Alto del canvas
 */
function addNoise(ctx, width, height) {
    for (let i = 0; i < 200; i++) {
        ctx.fillStyle = `rgba(${Math.random() * 100}, ${Math.random() * 100}, ${Math.random() * 100}, 0.1)`;
        ctx.beginPath();
        ctx.arc(
            Math.random() * width,
            Math.random() * height,
            Math.random() * 2,
            0,
            Math.PI * 2
        );
        ctx.fill();
    }
}

/**
 * Añade líneas de distorsión al CAPTCHA
 * @param {CanvasRenderingContext2D} ctx - Contexto del canvas
 * @param {number} width - Ancho del canvas
 * @param {number} height - Alto del canvas
 */
function addDistortionLines(ctx, width, height) {
    for (let i = 0; i < 5; i++) {
        ctx.strokeStyle = `rgba(${Math.random() * 100}, ${Math.random() * 100}, ${Math.random() * 100}, 0.3)`;
        ctx.lineWidth = 0.5 + Math.random();
        
        ctx.beginPath();
        ctx.moveTo(Math.random() * width, Math.random() * height);
        
        // Crear una línea ondulada
        const steps = 5 + Math.floor(Math.random() * 5);
        for (let j = 0; j < steps; j++) {
            ctx.lineTo(
                (j / steps) * width,
                (Math.random() * 0.5 + 0.25) * height + (Math.random() - 0.5) * 20
            );
        }
        
        ctx.stroke();
    }
}

    // Devolver la función de creación del CAPTCHA
    return {
        createCaptcha: createCaptcha
    };
})();

// Hacer el CAPTCHA de texto disponible globalmente
window.TextCaptcha = TextCaptcha;
