/**
 * Módulo de CAPTCHA matemático
 * Genera operaciones matemáticas con diferentes niveles de dificultad
 */

const MathCaptcha = (function() {
    // Niveles de dificultad
    const DIFFICULTY_LEVELS = {
        EASY: {
            name: 'Fácil',
            operations: ['+', '-'],
            min: 1,
            max: 20,
            decimal: false
        },
        MEDIUM: {
            name: 'Medio',
            operations: ['+', '-', '*'],
            min: 10,
            max: 50,
            decimal: false
        },
        HARD: {
            name: 'Difícil',
            operations: ['+', '-', '*', '/'],
            min: 10,
            max: 100,
            decimal: true
        },
        VERY_HARD: {
            name: 'Muy difícil',
            operations: ['*', '/', '**', '%'],
            min: 10,
            max: 100,
            decimal: true,
            allowNegative: true
        },
        EXPERT: {
            name: 'Experto',
            operations: ['+', '-', '*', '/', '**', '%', '√'],
            min: 1,
            max: 1000,
            decimal: true,
            allowNegative: true,
            allowExponents: true
        }
    };

    // Variables de estado
    let currentQuestion = null;
    let currentDifficulty = 'HARD';
    let difficulty = DIFFICULTY_LEVELS.HARD;
    let attempts = 0;
    const maxAttempts = 3;
    let callbacks = {};
    let container = null;

    /**
     * Genera un número aleatorio entero o decimal según la dificultad
     */
    function randomNumber() {
        const num = Math.random() * (difficulty.max - difficulty.min) + difficulty.min;
        return difficulty.decimal ? parseFloat(num.toFixed(2)) : Math.floor(num);
    }

    /**
     * Selecciona un operador aleatorio según la dificultad
     */
    function randomOperator() {
        const ops = difficulty.operations;
        return ops[Math.floor(Math.random() * ops.length)];
    }

    /**
     * Genera una pregunta matemática según la dificultad
     */
    function generateQuestion() {
        let a, b, operator, question, answer;
        
        do {
            a = randomNumber();
            b = randomNumber();
            operator = randomOperator();
            
            switch(operator) {
                case '+':
                    answer = a + b;
                    question = `${a} + ${b}`;
                    break;
                case '-':
                    if (!difficulty.allowNegative && b > a) [a, b] = [b, a]; // Evitar negativos en niveles bajos
                    answer = a - b;
                    question = `${a} - ${b}`;
                    break;
                case '*':
                    answer = a * b;
                    question = `${a} × ${b}`;
                    break;
                case '/':
                    // Evitar división por cero y decimales muy largos
                    b = b === 0 ? 1 : b;
                    answer = parseFloat((a / b).toFixed(2));
                    question = `${a} ÷ ${b}`;
                    break;
                case '**':
                    // Limitar el exponente para evitar números muy grandes
                    b = Math.min(Math.floor(b % 5) + 1, 4);
                    answer = Math.pow(a, b);
                    question = `${a}^${b}`;
                    break;
                case '%':
                    answer = a % b;
                    question = `${a} % ${b}`;
                    break;
                case '√':
                    // Raíz cuadrada de un cuadrado perfecto
                    const perfectSquare = Math.floor(Math.random() * 20 + 1) ** 2;
                    answer = Math.sqrt(perfectSquare);
                    question = `√${perfectSquare}`;
                    break;
            }
            
            // Redondear respuesta si es necesario
            if (Number.isInteger(answer)) {
                answer = Math.round(answer);
            } else {
                answer = parseFloat(answer.toFixed(2));
            }
            
        } while (isNaN(answer) || !isFinite(answer));
        
        return {
            question: question,
            answer: answer,
            options: generateOptions(answer)
        };
    }
    
    /**
     * Genera opciones de respuesta
     */
    function generateOptions(correctAnswer) {
        const options = [correctAnswer];
        const isDecimal = !Number.isInteger(correctAnswer);
        const range = Math.max(5, Math.abs(correctAnswer) * 0.5);
        
        while (options.length < 4) {
            let option;
            const variation = Math.random() * range * (Math.random() > 0.5 ? 1 : -1);
            
            if (isDecimal) {
                option = parseFloat((correctAnswer + variation).toFixed(2));
            } else {
                option = Math.round(correctAnswer + variation);
            }
            
            // Asegurar que no haya opciones duplicadas
            if (!options.some(opt => Math.abs(opt - option) < 0.01)) {
                options.push(option);
            }
        }
        
        return options.sort(() => Math.random() - 0.5);
    }
    
    /**
     * Renderiza el CAPTCHA en el contenedor especificado
     */
    function render(containerElement) {
        container = containerElement;
        container.innerHTML = '';
        
        currentQuestion = generateQuestion();
        attempts = 0;
        
        const captchaElement = document.createElement('div');
        captchaElement.className = 'math-captcha';
        captchaElement.style.textAlign = 'center';
        captchaElement.style.padding = '20px';
        captchaElement.style.border = '1px solid #ddd';
        captchaElement.style.borderRadius = '8px';
        captchaElement.style.maxWidth = '400px';
        captchaElement.style.margin = '0 auto';
        
        // Selector de dificultad
        const difficultySelect = document.createElement('select');
        difficultySelect.style.marginBottom = '15px';
        difficultySelect.style.padding = '5px';
        difficultySelect.style.borderRadius = '4px';
        difficultySelect.style.border = '1px solid #ccc';
        
        Object.entries(DIFFICULTY_LEVELS).forEach(([key, level]) => {
            const option = document.createElement('option');
            option.value = key;
            option.textContent = level.name;
            if (key === currentDifficulty) option.selected = true;
            difficultySelect.appendChild(option);
        });
        
        difficultySelect.addEventListener('change', (e) => {
            currentDifficulty = e.target.value;
            difficulty = DIFFICULTY_LEVELS[currentDifficulty];
            render(container);
        });
        
        // Pregunta
        const questionElement = document.createElement('div');
        questionElement.textContent = `Resuelve: ${currentQuestion.question} = ?`;
        questionElement.style.fontSize = '1.5em';
        questionElement.style.margin = '15px 0';
        questionElement.style.fontWeight = 'bold';
        
        // Opciones de respuesta
        const optionsContainer = document.createElement('div');
        optionsContainer.style.display = 'grid';
        optionsContainer.style.gridTemplateColumns = '1fr 1fr';
        optionsContainer.style.gap = '15px';
        optionsContainer.style.margin = '20px 0';
        optionsContainer.style.minHeight = '120px';
        optionsContainer.style.width = '100%';
        
        currentQuestion.options.forEach((option, index) => {
            const button = document.createElement('button');
            button.textContent = option.toString();
            button.style.fontSize = '1.2em';
            button.style.padding = '15px 10px';
            button.style.border = '2px solid #4CAF50';
            button.style.borderRadius = '5px';
            button.style.background = 'white';
            button.style.cursor = 'pointer';
            button.style.transition = 'all 0.3s';
            button.style.color = '#333';
            button.style.width = '100%';
            button.style.boxSizing = 'border-box';
            
            button.onmouseover = () => {
                if (!button.disabled) {
                    button.style.background = '#f0f0f0';
                }
            };
            
            button.onmouseout = () => {
                if (!button.disabled) {
                    button.style.background = 'white';
                }
            };
            
            button.onclick = () => checkAnswer(option, button);
            optionsContainer.appendChild(button);
        });
        
        // Mensaje de retroalimentación
        const messageElement = document.createElement('div');
        messageElement.style.minHeight = '24px';
        messageElement.style.margin = '10px 0';
        messageElement.style.fontWeight = 'bold';
        
        // Contador de intentos
        const attemptsElement = document.createElement('div');
        attemptsElement.style.marginTop = '10px';
        attemptsElement.style.fontSize = '0.9em';
        attemptsElement.style.color = '#666';
        updateAttemptsDisplay();
        
        function updateAttemptsDisplay() {
            attemptsElement.textContent = `Intentos restantes: ${maxAttempts - attempts}`;
        }
        
        // Verificar respuesta
        function checkAnswer(selectedOption, button) {
            const buttons = optionsContainer.querySelectorAll('button');
            buttons.forEach(btn => {
                btn.disabled = true;
                btn.style.cursor = 'not-allowed';
                if (parseFloat(btn.textContent) === currentQuestion.answer) {
                    btn.style.border = '2px solid #4CAF50';
                    btn.style.background = '#e8f5e9';
                } else if (btn === button) {
                    btn.style.border = '2px solid #f44336';
                    btn.style.background = '#ffebee';
                }
            });
            
            if (selectedOption == currentQuestion.answer) {
                // Respuesta correcta
                messageElement.textContent = '¡Correcto! Has resuelto el problema.';
                messageElement.style.color = '#4CAF50';
                
                if (callbacks.onSuccess) {
                    setTimeout(() => callbacks.onSuccess(), 1000);
                }
            } else {
                // Respuesta incorrecta
                attempts++;
                messageElement.textContent = `Incorrecto. La respuesta correcta es ${currentQuestion.answer}.`;
                messageElement.style.color = '#f44336';
                
                if (attempts >= maxAttempts) {
                    messageElement.textContent = `Demasiados intentos fallidos. La respuesta era ${currentQuestion.answer}.`;
                    if (callbacks.onError) {
                        callbacks.onError('Demasiados intentos fallidos');
                    }
                } else {
                    // Habilitar botones para otro intento después de un breve retraso
                    setTimeout(() => {
                        render(container);
                    }, 2000);
                }
                updateAttemptsDisplay();
            }
        }
        
        // Añadir elementos al contenedor principal
        captchaElement.appendChild(difficultySelect);
        captchaElement.appendChild(questionElement);
        captchaElement.appendChild(optionsContainer);
        captchaElement.appendChild(messageElement);
        captchaElement.appendChild(attemptsElement);
        container.appendChild(captchaElement);
    }

    /**
     * Crea una nueva instancia del CAPTCHA matemático
     */
    function createCaptcha(containerElement, callbacksObj = {}) {
        callbacks = callbacksObj;
        attempts = 0;
        render(containerElement);
        
        return {
            reset: function() {
                attempts = 0;
                render(container);
            },
            setDifficulty: function(level) {
                if (DIFFICULTY_LEVELS[level]) {
                    difficulty = DIFFICULTY_LEVELS[level];
                    render(container);
                }
            }
        };
    }

    // Devolver la función de creación del CAPTCHA
    return {
        createCaptcha: createCaptcha,
        DIFFICULTY_LEVELS: Object.keys(DIFFICULTY_LEVELS)
    };
})();

// Exportar como variable global
window.MathCaptcha = MathCaptcha;
