/**
 * Módulo de CAPTCHA de emojis
 * Presenta preguntas simples con opciones de emojis donde el usuario debe seleccionar
 * los emojis que coincidan con la categoría solicitada.
 * 
 * Este CAPTCHA ayuda a verificar que eres humano al identificar correctamente
 * los emojis que pertenecen a una categoría específica.
 */

const EmojiCaptcha = (function() {
    // Configuración del CAPTCHA
    const CATEGORIES = {
        animals: {
            name: 'animales',
            emojis: ['🦁', '🐘', '🦒', '🐶', '🐱', '🐭', '🐹', '🐰', '🦊', '🐻', '🐼', '🐨', '🐯', '🦁', '🐮', '🐷', '🐸', '🐵', '🐔', '🐧', '🐦', '🐤', '🦆', '🦅', '🦉', '🦇', '🐺', '🐗', '🐴', '🦄', '🐝', '🐛', '🦋', '🐌', '🐞', '🐜', '🦗', '🕷', '🦂', '🦀', '🦑', '🐙', '🦐', '🐠', '🐟', '🐡', '🐬', '🦈', '🐳', '🐋', '🐊', '🐆', '🐅', '🐃', '🐂', '🐄', '🦌', '🐪', '🐫', '🐘', '🦏', '🦍', '🐎', '🐖', '🐐', '🐏', '🐑', '🐕', '🐩', '🐈', '🐓', '🦃', '🕊', '🐇', '🐁', '🐀', '🐿', '🦔', '🐉', '🐲']
        },
        food: {
            name: 'alimentos',
            emojis: [
                // Frutas
                '🍎', '🍐', '🍊', '🍋', '🍌', '🍉', '🍇', '🍓', '🍈', '🍒', '🍑', '🍍', '🥝', '🥑', '🍅', '🥥',
                // Verduras y hortalizas
                '🥔', '🥕', '🌽', '🌶', '🥒', '🥬', '🥦', '🍄', '🧅', '🧄', '🥜', '🌰',
                // Pan y lácteos
                '🍞', '🥐', '🥖', '🥨', '🧀', '🥚', '🥛', '🍼', '🧈', '🥞',
                // Carnes y pescados
                '🥩', '🍗', '🍖', '🥓', '🥩', '🥓', '🍳', '🧆', '🥘', '🥙',
                // Comida rápida
                '🌭', '🍔', '🍟', '🍕', '🌮', '🌯', '🥪', '🥗', '🍝', '🍜',
                // Comida internacional
                '🍲', '🍛', '🍣', '🍱', '🥟', '🍤', '🍙', '🍚', '🍘', '🍥',
                // Postres y dulces
                '🍡', '🍧', '🍨', '🍦', '🥧', '🍰', '🎂', '🧁', '🥮', '🍮', '🍭', '🍬', '🍫', '🍿', '🍩', '🍪',
                // Bebidas
                '☕', '🍵', '🍶', '🍺', '🍻', '🥂', '🍷', '🥃', '🍸', '🍹', '🍾', '🧃', '🥤', '🧋',
                // Utensilios
                '🥄', '🍴', '🍽', '🥢', '🧂', '🥡', '🧊'
            ]
        },
        vehicles: {
            name: 'vehículos',
            emojis: ['🚗', '🚕', '🚙', '🚌', '🚎', '🏎', '🚓', '🚑', '🚒', '🚐', '🚚', '🚛', '🚜', '🛴', '🚲', '🛵', '🏍', '🚨', '🚔', '🚍', '🚘', '🚖', '🚡', '🚠', '🚟', '🚃', '🚋', '🚞', '🚝', '🚄', '🚅', '🚈', '🚂', '🚆', '🚇', '🚊', '🚉', '✈️', '🛫', '🛬', '🛩', '💺', '🛰', '🚀', '🛸', '🚁', '🛶', '⛵', '🚤', '🛥', '🛳', '⛴', '🚢', '⚓', '⛽', '🚧', '🚦', '🚥', '🚏', '🗺', '🗿', '🗽', '🗼', '🏰', '🏯', '🏟', '🎡', '🎢', '🎠', '⛲', '🏖', '🏝', '⛱', '🏜', '🌋', '⛰', '🏔', '🗻', '🏕', '⛺', '🏠', '🏡', '🏘', '🏚', '🏗', '🏭', '🏢', '🏬', '🏣', '🏤', '🏥', '🏦', '🏨', '🏪', '🏫', '🏩', '💒', '🏛', '⛪', '🕌', '🕍', '🕋', '⛩', '🛤', '🛣', '🗾', '🎑', '🏞', '🌅', '🌄', '🌠', '🎇', '🎆', '🌇', '🌆', '🏙', '🌃', '🌌', '🌉', '🌁']
        },
        sports: {
            name: 'deportes',
            emojis: ['⚽', '🏀', '🏈', '⚾', '🎾', '🏐', '🏉', '🎱', '🏓', '🏸', '🥅', '🏒', '🏑', '🏏', '⛳', '🏹', '🎣', '🥊', '🥋', '⛸', '🎿', '⛷', '🏂', '🏋️', '🤺', '🤼', '🤸', '⛹️', '🤾', '🏌️', '🏇', '🧘', '🏄', '🏊', '🤽', '🚣', '🧗', '🚵', '🚴', '🏆', '🥇', '🥈', '🥉', '🏅', '🎖', '🏵', '🎗', '🎫', '🎟', '🎪', '🤹', '🎭', '🎨', '🎬', '🎤', '🎧', '🎼', '🎹', '🥁', '🎷', '🎺', '🎸', '🎻', '🎲', '🎯', '🎳', '🎮', '🎰']
        },
        objects: {
            name: 'objetos',
            emojis: ['📱', '📲', '💻', '⌚', '⌛', '⏰', '⏱', '⏲', '⏳', '📞', '☎️', '📟', '📠', '📺', '📻', '🎙', '🎚', '🎛', '📽', '🎞', '📹', '🎬', '📷', '📸', '📼', '📹', '💽', '💾', '💿', '📀', '📼', '📷', '📸', '📹', '📽', '🎥', '📞', '☎️', '📟', '📠', '📺', '📻', '🎙', '🎚', '🎛', '📽', '🎞', '📹', '🎬', '📷', '📸', '📹', '📽', '🎥', '📞', '☎️', '📟', '📠', '📺', '📻', '🎙', '🎚', '🎛', '📽', '🎞', '📹', '🎬', '📷', '📸', '📹', '📽', '🎥']
        }
    };

    const EXPLANATIONS = [
        "Selecciona todos los emojis que pertenezcan a la categoría mostrada. Esto ayuda a verificar que eres humano.",
        "Elije solo los emojis que coincidan con la categoría solicitada. Puede haber más de una respuesta correcta.",
        "Demuestra que eres humano seleccionando los emojis que correspondan a la categoría indicada.",
        "Para continuar, selecciona todos los emojis que pertenezcan a la categoría mostrada.",
        "Ayúdanos a mantener el sitio seguro seleccionando los emojis correctos según la categoría."
    ];

    // Generar preguntas dinámicamente
    function generateQuestions() {
        const questions = [];
        const categories = Object.keys(CATEGORIES);
        
        // Crear 3 preguntas por categoría
        categories.forEach(category => {
            const categoryData = CATEGORIES[category];
            const allEmojis = [...new Set(categoryData.emojis)]; // Eliminar duplicados
            
            // Crear 3 variaciones de cada categoría
            for (let i = 0; i < 3; i++) {
                // Mezclar emojis
                const shuffled = [...allEmojis].sort(() => 0.5 - Math.random());
                
                // Seleccionar entre 3 y 5 respuestas correctas
                const correctCount = Math.min(3 + Math.floor(Math.random() * 3), shuffled.length);
                const correct = shuffled.slice(0, correctCount);
                
                // Seleccionar opciones incorrectas (asegurando que no estén en las correctas)
                const incorrect = Object.values(CATEGORIES)
                    .filter(cat => cat.name !== categoryData.name)
                    .flatMap(cat => cat.emojis)
                    .filter(emoji => !correct.includes(emoji));
                
                // Mezclar opciones incorrectas y tomar las necesarias
                const incorrectOptions = [...new Set(incorrect)]
                    .sort(() => 0.5 - Math.random())
                    .slice(0, 9 - correctCount); // Total de 9 opciones (6-8 correctas + 1-3 incorrectas)
                
                // Crear pregunta
                questions.push({
                    question: `Selecciona los ${categoryData.name}`,
                    correct: correct,
                    options: [...correct, ...incorrectOptions].sort(() => 0.5 - Math.random()),
                    explanation: EXPLANATIONS[Math.floor(Math.random() * EXPLANATIONS.length)]
                });
            }
        });
        
        return questions.sort(() => 0.5 - Math.random()); // Mezclar todas las preguntas
    }
    
    const QUESTIONS = generateQuestions();

    // Variables de estado
    let currentQuestion = null;
    let attempts = 0;
    const maxAttempts = 3;
    let callbacks = {};
    let container = null;
    let selectedEmojis = []; // Almacena los emojis seleccionados por el usuario

    /**
     * Obtiene una pregunta aleatoria
     */
    function getRandomQuestion() {
        return QUESTIONS[Math.floor(Math.random() * QUESTIONS.length)];
    }

    /**
     * Crea el HTML del CAPTCHA
     */
    function render(containerElement) {
        container = containerElement;
        container.innerHTML = '';
        
        // Obtener pregunta aleatoria
        currentQuestion = getRandomQuestion();
        
        // Crear elementos del DOM
        const captchaElement = document.createElement('div');
        captchaElement.className = 'emoji-captcha';
        captchaElement.style.textAlign = 'center';
        captchaElement.style.padding = '20px';
        captchaElement.style.borderRadius = '8px';
        captchaElement.style.backgroundColor = '#f8f9fa';
        captchaElement.style.boxShadow = '0 2px 10px rgba(0,0,0,0.1)';
        captchaElement.style.maxWidth = '400px';
        captchaElement.style.margin = '0 auto';

        // Añadir explicación
        const explanationElement = document.createElement('div');
        explanationElement.textContent = currentQuestion.explanation || EXPLANATIONS[0];
        explanationElement.style.fontSize = '0.9em';
        explanationElement.style.color = '#666';
        explanationElement.style.marginBottom = '15px';
        explanationElement.style.fontStyle = 'italic';
        captchaElement.appendChild(explanationElement);

        // Añadir pregunta
        const questionElement = document.createElement('div');
        questionElement.textContent = currentQuestion.question;
        questionElement.style.fontSize = '1.2em';
        questionElement.style.margin = '0 0 15px 0';
        questionElement.style.fontWeight = 'bold';
        captchaElement.appendChild(questionElement);

        // Crear contenedor de opciones
        const optionsContainer = document.createElement('div');
        optionsContainer.style.display = 'grid';
        optionsContainer.style.gridTemplateColumns = 'repeat(2, 1fr)';
        optionsContainer.style.gap = '10px';
        optionsContainer.style.margin = '20px 0';

        // Mezclar opciones
        const options = [...currentQuestion.options].sort(() => Math.random() - 0.5);
        selectedEmojis = []; // Reiniciar selección

        // Añadir botones de opciones
        options.forEach(emoji => {
            const button = document.createElement('button');
            button.textContent = emoji;
            button.dataset.emoji = emoji;
            button.style.fontSize = '2em';
            button.style.padding = '15px';
            button.style.border = '2px solid #ddd';
            button.style.borderRadius = '8px';
            button.style.background = 'white';
            button.style.cursor = 'pointer';
            button.style.transition = 'all 0.2s';
            button.style.opacity = '0.8';
            
            button.onclick = () => toggleEmojiSelection(button, emoji);
            optionsContainer.appendChild(button);
        });

        // Botón de verificación
        const verifyButton = document.createElement('button');
        verifyButton.textContent = 'Verificar';
        verifyButton.style.marginTop = '20px';
        verifyButton.style.padding = '10px 20px';
        verifyButton.style.fontSize = '1em';
        verifyButton.style.backgroundColor = '#4CAF50';
        verifyButton.style.color = 'white';
        verifyButton.style.border = 'none';
        verifyButton.style.borderRadius = '4px';
        verifyButton.style.cursor = 'pointer';
        verifyButton.onclick = verifySelection;
        optionsContainer.appendChild(verifyButton);

        // Contenedor de mensajes
        const messageElement = document.createElement('div');
        messageElement.style.marginTop = '15px';
        messageElement.style.minHeight = '24px';
        messageElement.style.fontWeight = 'bold';

        // Contador de intentos
        const attemptsElement = document.createElement('div');
        attemptsElement.style.marginTop = '10px';
        attemptsElement.style.fontSize = '0.9em';
        attemptsElement.style.color = '#666';
        
        // Función para actualizar el contador de intentos
        function updateAttemptsDisplay() {
            attemptsElement.textContent = `Intentos restantes: ${maxAttempts - attempts}`;
        }
        
        updateAttemptsDisplay();

        // Función para alternar la selección de un emoji
        function toggleEmojiSelection(button, emoji) {
            const index = selectedEmojis.indexOf(emoji);
            if (index === -1) {
                // Añadir a la selección
                selectedEmojis.push(emoji);
                button.style.border = '2px solid #4CAF50';
                button.style.background = '#e8f5e9';
                button.style.opacity = '1';
            } else {
                // Quitar de la selección
                selectedEmojis.splice(index, 1);
                button.style.border = '2px solid #ddd';
                button.style.background = 'white';
                button.style.opacity = '0.8';
            }
        }

        // Función para verificar la selección
        function verifySelection() {
            if (selectedEmojis.length === 0) {
                messageElement.textContent = 'Por favor, selecciona al menos un emoji.';
                messageElement.style.color = '#f39c12';
                return;
            }

            // Deshabilitar botones
            const buttons = optionsContainer.querySelectorAll('button');
            buttons.forEach(btn => {
                btn.disabled = true;
                btn.style.cursor = 'not-allowed';
            });

            // Verificar respuestas
            const correctAnswers = [...currentQuestion.correct];
            const isCorrect = selectedEmojis.length === correctAnswers.length &&
                           selectedEmojis.every(emoji => correctAnswers.includes(emoji));

            // Resaltar respuestas correctas e incorrectas
            buttons.forEach(btn => {
                if (btn.textContent === 'Verificar') return;
                
                const emoji = btn.dataset.emoji;
                if (correctAnswers.includes(emoji)) {
                    btn.style.border = '2px solid #4CAF50';
                    btn.style.background = selectedEmojis.includes(emoji) ? '#e8f5e9' : '#ffebee';
                } else if (selectedEmojis.includes(emoji)) {
                    btn.style.border = '2px solid #f44336';
                    btn.style.background = '#ffebee';
                }
                btn.style.opacity = '1';
            });

            if (isCorrect) {
                // Respuesta correcta
                messageElement.textContent = '¡Correcto! Has seleccionado las respuestas correctas.';
                messageElement.style.color = '#4CAF50';
                
                if (callbacks.onSuccess) {
                    setTimeout(() => callbacks.onSuccess(), 1000);
                }
            } else {
                // Respuesta incorrecta
                attempts++;
                messageElement.textContent = 'Incorrecto. Intenta de nuevo.';
                messageElement.style.color = '#f44336';
                
                if (attempts >= maxAttempts) {
                    messageElement.textContent = 'Demasiados intentos fallidos. Intenta de nuevo.';
                    if (callbacks.onError) {
                        callbacks.onError('Demasiados intentos fallidos');
                    }
                } else {
                    // Habilitar botones para otro intento después de un breve retraso
                    setTimeout(() => {
                        buttons.forEach(btn => {
                            if (btn.textContent !== 'Verificar') {
                                btn.disabled = false;
                                btn.style.cursor = 'pointer';
                                btn.style.opacity = '0.8';
                                if (!correctAnswers.includes(btn.dataset.emoji)) {
                                    btn.style.border = '2px solid #ddd';
                                    btn.style.background = 'white';
                                }
                            }
                        });
                        messageElement.textContent = '';
                        selectedEmojis = [];
                    }, 1500);
                }
                updateAttemptsDisplay();
            }
        }


        // Añadir elementos al contenedor principal
        captchaElement.appendChild(optionsContainer);
        captchaElement.appendChild(messageElement);
        captchaElement.appendChild(attemptsElement);
        container.appendChild(captchaElement);
    }

    /**
     * Crea una nueva instancia del CAPTCHA de emojis
     */
    function createCaptcha(containerElement, callbacksObj = {}) {
        callbacks = callbacksObj;
        attempts = 0;
        render(containerElement);
        
        return {
            reset: function() {
                attempts = 0;
                render(container);
            }
        };
    }

    // Devolver la función de creación del CAPTCHA
    return {
        createCaptcha: createCaptcha
    };
})();

// Exportar como variable global
window.EmojiCaptcha = EmojiCaptcha;
