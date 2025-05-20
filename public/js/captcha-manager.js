/**
 * Módulo principal para la gestión de diferentes tipos de CAPTCHA.
 * Este módulo se encarga de gestionar el ciclo de vida de los diferentes CAPTCHAs.
 */

// Crear un objeto global para el gestor de CAPTCHAs
window.captchaManager = (function() {
    /**
     * Estado global de la aplicación
     * @type {Object}
     * @private
     */
    const state = {
        /**
         * Instancia del CAPTCHA actualmente activo
         * @type {Object}
         * @private
         */
        currentCaptcha: null,
        /**
         * Tiempo de expiración del CAPTCHA en milisegundos
         * @type {number}
         * @private
         */
        captchaExpirationTime: 120000, // 2 minutos en milisegundos
        /**
         * Intervalo de temporización para el CAPTCHA
         * @type {number}
         * @private
         */
        timerInterval: null,
        /**
         * Timeout para la expiración del CAPTCHA
         * @type {number}
         * @private
         */
        captchaTimeout: null,
    };

    /**
     * Referencias a elementos del DOM
     * @type {Object}
     * @private
     */
    let elements = {};

    /**
     * Inicializa un nuevo CAPTCHA del tipo especificado
     * @param {string} captchaType - Tipo de CAPTCHA a inicializar ('text', 'puzzle', 'emoji', 'math')
     * @param {string} [containerId='captcha-container'] - ID del contenedor donde se renderizará el CAPTCHA
     * @param {Object} [callbacks={}] - Objeto con callbacks para eventos del CAPTCHA
     * @param {Function} [callbacks.onSuccess] - Se ejecuta cuando el CAPTCHA se resuelve correctamente
     * @param {Function} [callbacks.onError] - Se ejecuta cuando hay un error en la validación
     * @param {Function} [callbacks.onExpire] - Se ejecuta cuando el CAPTCHA expira
     * @returns {boolean} true si la inicialización fue exitosa, false en caso contrario
     */
    async function initCaptcha(captchaType, containerId = 'captcha-container', callbacks = {}) {
        // Inicializar referencias a elementos del DOM
        initElements();
        
        try {
            // Limpiar el estado anterior
            cleanupCurrentCaptcha();
            
            // Mostrar mensaje de carga
            showMessage('Cargando CAPTCHA...', 'info');
            
            // Obtener el módulo del CAPTCHA seleccionado
            let captchaModule;
            switch(captchaType) {
                case 'text':
                    captchaModule = window.TextCaptcha;
                    break;
                case 'puzzle':
                    captchaModule = window.PuzzleCaptcha;
                    break;
                case 'emoji':
                    captchaModule = window.EmojiCaptcha;
                    break;
                case 'math':
                    captchaModule = window.MathCaptcha;
                    break;
                default:
                    throw new Error(`Tipo de CAPTCHA no soportado: ${captchaType}`);
            }
            
            if (!captchaModule) {
                throw new Error(`No se pudo cargar el módulo para: ${captchaType}`);
            }
            
            // Inicializar el nuevo CAPTCHA
            state.currentCaptcha = captchaModule.createCaptcha(elements.captchaContainer, {
                onSuccess: handleCaptchaSuccess,
                onError: handleCaptchaError,
                onExpire: handleCaptchaExpire,
            });
            
            // Iniciar el temporizador de expiración
            startTimer();
            
            // Limpiar mensajes
            showMessage('', 'info');
            
        } catch (error) {
            console.error('Error al cargar el CAPTCHA:', error);
            showMessage('Error al cargar el CAPTCHA. Por favor, inténtalo de nuevo.', 'error');
        }
    }

    /**
     * Inicializa las referencias a los elementos del DOM
     * @private
     */
    function initElements() {
        elements = {
            /**
             * Contenedor del CAPTCHA
             * @type {HTMLElement}
             * @private
             */
            captchaContainer: document.getElementById('captcha-container'),
            /**
             * Elemento para mostrar el estado del CAPTCHA
             * @type {HTMLElement}
             * @private
             */
            captchaStatus: document.getElementById('captcha-status'),
            /**
             * Elemento para mostrar mensajes al usuario
             * @type {HTMLElement}
             * @private
             */
            captchaMessage: document.getElementById('captcha-message'),
            /**
             * Elemento para mostrar el temporizador
             * @type {HTMLElement}
             * @private
             */
            timer: document.getElementById('timer'),
        };
    }

    /**
     * Limpia el CAPTCHA actual y libera recursos
     * @private
     */
    function cleanupCurrentCaptcha() {
        // Limpiar temporizadores
        clearTimeout(state.captchaTimeout);
        clearInterval(state.timerInterval);
        
        // Limpiar el contenedor
        if (elements.captchaContainer) {
            elements.captchaContainer.innerHTML = '';
        }
        
        // Limpiar estado
        if (state.currentCaptcha && typeof state.currentCaptcha.cleanup === 'function') {
            state.currentCaptcha.cleanup();
        }
        
        state.currentCaptcha = null;
        
        if (elements.captchaStatus) {
            elements.captchaStatus.textContent = '';
        }
        
        if (elements.timer) {
            elements.timer.textContent = '';
        }
    }

    /**
     * Inicia el temporizador de expiración del CAPTCHA
     */
    function startTimer() {
        if (!elements.timer) return;
        
        let timeLeft = state.captchaExpirationTime / 1000; // Convertir a segundos
        updateTimerDisplay(timeLeft);
        
        // Actualizar el temporizador cada segundo
        state.timerInterval = setInterval(() => {
            timeLeft--;
            
            if (timeLeft > 0) {
                updateTimerDisplay(timeLeft);
            } else {
                clearInterval(state.timerInterval);
                handleCaptchaExpire();
            }
        }, 1000);
        
        // Configurar el timeout para la expiración total
        state.captchaTimeout = setTimeout(() => {
            handleCaptchaExpire();
        }, state.captchaExpirationTime);
    }

    /**
     * Actualiza la visualización del temporizador
     * @param {number} seconds - Segundos restantes
     */
    function updateTimerDisplay(seconds) {
        if (!elements.timer) return;
        
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        elements.timer.textContent = `Tiempo restante: ${mins}:${secs < 10 ? '0' : ''}${secs}`;
        
        // Cambiar el color según el tiempo restante
        if (seconds < 10) {
            elements.timer.style.color = '#dc3545'; // Rojo
        } else if (seconds < 30) {
            elements.timer.style.color = '#ffc107'; // Amarillo
        } else {
            elements.timer.style.color = ''; // Color por defecto
        }
    }

    /**
     * Muestra un mensaje al usuario
     * @param {string} message - Mensaje a mostrar
     * @param {string} type - Tipo de mensaje (success, error, info, warning)
     */
    function showMessage(message, type = 'info') {
        if (!elements.captchaMessage) return;
        
        if (!message) {
            elements.captchaMessage.textContent = '';
            elements.captchaMessage.className = 'message';
            return;
        }
        
        elements.captchaMessage.textContent = message;
        elements.captchaMessage.className = `message ${type}`;
    }

    /**
     * Manejador para cuando el CAPTCHA se resuelve correctamente
     */
    function handleCaptchaSuccess() {
        clearInterval(state.timerInterval);
        clearTimeout(state.captchaTimeout);
        
        if (elements.captchaStatus) {
            elements.captchaStatus.textContent = '¡CAPTCHA verificado correctamente!';
            elements.captchaStatus.style.color = 'var(--success-color)';
        }
        
        showMessage('Puedes continuar.', 'success');
        
        // Deshabilitar el botón de verificación si existe
        const verifyBtn = document.getElementById('verify-captcha');
        if (verifyBtn) {
            verifyBtn.disabled = true;
        }
        
        // Recargar automáticamente después de 3 segundos
        setTimeout(() => {
            const captchaType = document.getElementById('captcha-type')?.value || 'puzzle';
            initCaptcha(captchaType);
        }, 3000);
    }

    /**
     * Manejador para errores en el CAPTCHA
     * @param {string} message - Mensaje de error
     */
    function handleCaptchaError(message) {
        if (elements.captchaStatus) {
            elements.captchaStatus.textContent = message || 'Error en el CAPTCHA';
            elements.captchaStatus.style.color = 'var(--error-color)';
        }
        showMessage('Por favor, inténtalo de nuevo.', 'error');
    }

    /**
     * Manejador para cuando el CAPTCHA expira
     */
    function handleCaptchaExpire() {
        clearInterval(state.timerInterval);
        
        if (elements.captchaStatus) {
            elements.captchaStatus.textContent = 'El CAPTCHA ha expirado';
            elements.captchaStatus.style.color = 'var(--error-color)';
        }
        
        showMessage('Se generará un nuevo CAPTCHA automáticamente...', 'warning');
        
        // Recargar después de 2 segundos
        setTimeout(() => {
            const captchaType = document.getElementById('captcha-type')?.value || 'puzzle';
            initCaptcha(captchaType);
        }, 2000);
    }

    // Hacer que las funciones estén disponibles externamente
    // API pública del módulo
    return {
        /**
         * Inicializa un nuevo CAPTCHA
         * @see initCaptcha
         */
        initCaptcha,
        showMessage
    };
})();
