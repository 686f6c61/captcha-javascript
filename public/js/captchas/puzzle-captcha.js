// Crear un espacio de nombres para el CAPTCHA de rompecabezas
const PuzzleCaptcha = (function() {
    // Configuración del rompecabezas
    const PUZZLE_CONFIG = {
        // Usar una URL absoluta para asegurar que la imagen se cargue correctamente
        imageSrc: 'https://picsum.photos/600/400?random=' + Math.floor(Math.random() * 1000),
        pieceSize: 100, // Tamaño de la pieza en píxeles (aumentado para mejor visibilidad)
        snapThreshold: 25, // Distancia de ajuste en píxeles (aumentado para mejor usabilidad)
        maxAttempts: 3, // Número máximo de intentos
        expirationTime: 120000 // 2 minutos en milisegundos
    };
    
    console.log('Configuración del puzzle:', PUZZLE_CONFIG);

    // Variables de estado
    let targetPosition = { x: 0, y: 0 };
    let dragStartPos = { x: 0, y: 0 };
    let isDragging = false;
    let attempts = 0;
    let pieceElement = null;
    let dropZone = null;
    let callbacks = {}; // Añadido para manejar los callbacks
    let expirationTimer = null; // Para el temporizador de expiración
    let container = null; // Referencia al contenedor principal

/**
 * Crea una nueva instancia del CAPTCHA de rompecabezas
 * @param {HTMLElement} container - Contenedor donde se renderizará el CAPTCHA
 * @param {Object} cb - Objeto con callbacks para eventos del CAPTCHA
 * @returns {Object} Métodos públicos del CAPTCHA
 */
function createCaptcha(containerElement, cb) {
    // Guardar referencia al contenedor
    container = containerElement;
    
    // Inicializar callbacks
    callbacks = cb || {};
    
    // Limpiar el contenedor
    container.innerHTML = '';
    
    // Crear el contenedor principal
    const captchaElement = document.createElement('div');
    captchaElement.className = 'puzzle-captcha';
    captchaElement.style.position = 'relative';
    captchaElement.style.display = 'inline-block';
    
    // Crear el contenedor del rompecabezas
    const puzzleContainer = document.createElement('div');
    puzzleContainer.className = 'puzzle-container';
    puzzleContainer.style.position = 'relative';
    puzzleContainer.style.overflow = 'visible';
    puzzleContainer.style.border = '2px solid #ddd';
    puzzleContainer.style.margin = '20px auto';
    puzzleContainer.style.backgroundColor = '#f8f9fa';
    puzzleContainer.style.borderRadius = '8px';
    puzzleContainer.style.boxShadow = '0 2px 10px rgba(0,0,0,0.1)';
    puzzleContainer.style.minHeight = '300px'; // Asegurar una altura mínima
    puzzleContainer.style.minWidth = '400px'; // Asegurar un ancho mínimo
    
    // Crear la imagen de fondo
    const bgImage = new Image();
    bgImage.alt = 'Imagen del rompecabezas';
    bgImage.className = 'puzzle-bg';
    bgImage.style.width = '100%';
    bgImage.style.height = 'auto';
    bgImage.style.display = 'block';
    
    // Manejar errores de carga de imagen
    bgImage.onerror = function(e) {
        console.error('Error al cargar la imagen del rompecabezas:', {
            src: bgImage.src,
            error: e,
            complete: bgImage.complete,
            naturalWidth: bgImage.naturalWidth,
            naturalHeight: bgImage.naturalHeight
        });
        callbacks.onError && callbacks.onError('No se pudo cargar la imagen del rompecabezas. Por favor, recarga la página.');
    };
    
    console.log('Intentando cargar imagen desde:', PUZZLE_CONFIG.imageSrc);
    
    // Cargar la imagen
    bgImage.src = PUZZLE_CONFIG.imageSrc;
    
    // Crear la zona de destino (donde debe ir la pieza)
    dropZone = document.createElement('div');
    dropZone.className = 'puzzle-drop-zone';
    
    // Crear la pieza arrastrable
    pieceElement = document.createElement('div');
    pieceElement.className = 'puzzle-piece';
    pieceElement.draggable = true;
    pieceElement.style.position = 'absolute';
    pieceElement.style.cursor = 'grab';
    pieceElement.style.zIndex = '1000';
    pieceElement.style.touchAction = 'none';
    pieceElement.style.border = '3px solid #4CAF50';
    pieceElement.style.boxShadow = '0 4px 15px rgba(0,0,0,0.8)';
    pieceElement.style.backgroundColor = 'rgba(255,255,255,0.95)';
    pieceElement.style.borderRadius = '8px';
    pieceElement.style.overflow = 'hidden';
    pieceElement.style.transition = 'all 0.2s ease';
    pieceElement.style.userSelect = 'none';
    pieceElement.style.display = 'block';
    pieceElement.style.opacity = '1';
    pieceElement.style.visibility = 'visible';
    pieceElement.style.transform = 'translateZ(0)'; // Forzar aceleración por hardware
    
    // Añadir indicador de que es arrastrable
    pieceElement.setAttribute('title', 'Arrástrame a la posición correcta');
    pieceElement.setAttribute('role', 'button');
    pieceElement.setAttribute('aria-label', 'Pieza de puzzle arrastrable');
    
    // Configurar la pieza con una parte de la imagen
    const pieceSize = PUZZLE_CONFIG.pieceSize;
    pieceElement.style.width = `${pieceSize}px`;
    pieceElement.style.height = `${pieceSize}px`;
    
    // Cargar la imagen y configurar el rompecabezas cuando esté lista
    bgImage.onload = function() {
        console.log('Imagen cargada correctamente:', bgImage.src);
        console.log('Dimensiones de la imagen:', bgImage.naturalWidth, 'x', bgImage.naturalHeight);
        
        if (bgImage.naturalWidth === 0 || bgImage.naturalHeight === 0) {
            console.error('La imagen se cargó pero tiene dimensiones 0x0');
            callbacks.onError && callbacks.onError('Error al cargar la imagen del puzzle. Por favor, recarga la página.');
            return;
        }
        
        // Limpiar el contenedor principal
        container.innerHTML = '';
        
        // Dimensiones del contenedor
        const containerWidth = Math.min(400, bgImage.naturalWidth);
        const scale = containerWidth / bgImage.naturalWidth;
        const containerHeight = bgImage.naturalHeight * scale;
        
        // Configurar el contenedor del puzzle
        puzzleContainer.style.width = `${containerWidth}px`;
        puzzleContainer.style.height = `${containerHeight}px`;
        
        // Tamaño de la pieza escalado
        const scaledPieceSize = Math.min(PUZZLE_CONFIG.pieceSize, containerWidth * 0.3);
        
        // Posición aleatoria para la pieza (evitando los bordes)
        const maxX = containerWidth - scaledPieceSize - 10;
        const maxY = containerHeight - scaledPieceSize - 10;
        
        targetPosition = {
            x: Math.max(10, Math.random() * maxX),
            y: Math.max(10, Math.random() * maxY)
        };
        
        // Configurar la pieza con la imagen
        pieceElement.style.backgroundImage = `url('${PUZZLE_CONFIG.imageSrc}')`;
        pieceElement.style.backgroundSize = `${containerWidth}px ${containerHeight}px`;
        pieceElement.style.backgroundPosition = `-${targetPosition.x}px -${targetPosition.y}px`;
        pieceElement.style.backgroundRepeat = 'no-repeat';
        
        // Posición inicial de la pieza (fuera del contenedor a la derecha)
        const startX = containerWidth + 20;
        const startY = (containerHeight - scaledPieceSize) / 2;
        
        pieceElement.style.left = `${startX}px`;
        pieceElement.style.top = `${startY}px`;
        pieceElement.style.width = `${scaledPieceSize}px`;
        pieceElement.style.height = `${scaledPieceSize}px`;
        
        // Asegurar que la pieza sea claramente visible
        pieceElement.style.outline = '2px solid rgba(0,0,0,0.3)';
        pieceElement.style.outlineOffset = '2px';
        pieceElement.style.border = '3px solid #4CAF50';
        pieceElement.style.boxShadow = '0 4px 15px rgba(0,0,0,0.8)';
        pieceElement.style.cursor = 'grab';
        pieceElement.style.zIndex = '1000';
        pieceElement.style.display = 'block';
        pieceElement.style.opacity = '1';
        pieceElement.style.visibility = 'visible';
        
        // Forzar renderizado
        void pieceElement.offsetHeight;
        
        // Añadir indicador visual de que es arrastrable
        const dragHandle = document.createElement('div');
        dragHandle.style.position = 'absolute';
        dragHandle.style.top = '5px';
        dragHandle.style.right = '5px';
        dragHandle.style.width = '20px';
        dragHandle.style.height = '20px';
        dragHandle.style.background = 'rgba(255,255,255,0.8)';
        dragHandle.style.borderRadius = '50%';
        dragHandle.style.display = 'flex';
        dragHandle.style.alignItems = 'center';
        dragHandle.style.justifyContent = 'center';
        dragHandle.style.cursor = 'move';
        dragHandle.innerHTML = '↔';
        pieceElement.appendChild(dragHandle);
        
        // Configurar la zona de destino para que sea más visible
        dropZone.style.width = `${scaledPieceSize}px`;
        dropZone.style.height = `${scaledPieceSize}px`;
        dropZone.style.left = `${targetPosition.x}px`;
        dropZone.style.top = `${targetPosition.y}px`;
        dropZone.style.border = '3px dashed #4CAF50';
        dropZone.style.backgroundColor = 'rgba(76, 175, 80, 0.15)';
        dropZone.style.borderRadius = '8px';
        dropZone.style.boxShadow = '0 0 15px rgba(76, 175, 80, 0.6)';
        dropZone.style.transition = 'all 0.3s ease';
        dropZone.style.zIndex = '900'; // Por debajo de la pieza pero por encima del fondo
        
        // Añadir indicador de zona de destino
        const targetHint = document.createElement('div');
        targetHint.textContent = 'Soltar aquí';
        targetHint.style.position = 'absolute';
        targetHint.style.top = '50%';
        targetHint.style.left = '50%';
        targetHint.style.transform = 'translate(-50%, -50%)';
        targetHint.style.color = '#4CAF50';
        targetHint.style.fontWeight = 'bold';
        targetHint.style.textAlign = 'center';
        targetHint.style.fontSize = '12px';
        dropZone.appendChild(targetHint);
        
        // Añadir elementos al contenedor del puzzle
        puzzleContainer.appendChild(bgImage);
        puzzleContainer.appendChild(dropZone);
        puzzleContainer.appendChild(pieceElement);
        
        // Añadir el puzzle al contenedor principal
        container.appendChild(puzzleContainer);
        
        // Añadir instrucciones
        const instructions = document.createElement('div');
        instructions.className = 'puzzle-instructions';
        instructions.innerHTML = `
            <div style="background: #f8f9fa; padding: 15px; border-radius: 5px; margin: 10px 0; text-align: center;">
                <h3 style="margin-top: 0; color: #333;">Completa el Puzzle</h3>
                <p style="margin-bottom: 10px;">Arrastra la pieza al lugar correcto en la imagen.</p>
                <div style="display: flex; justify-content: center; align-items: center; gap: 20px; margin: 15px 0;">
                    <div style="display: flex; flex-direction: column; align-items: center;">
                        <div style="width: 30px; height: 30px; border: 2px solid #666; margin-bottom: 5px; display: flex; align-items: center; justify-content: center;">
                            <span>↔</span>
                        </div>
                        <span style="font-size: 12px;">Arrastrar</span>
                    </div>
                    <div style="display: flex; flex-direction: column; align-items: center;">
                        <div style="width: 30px; height: 30px; border: 2px dashed #4CAF50; margin-bottom: 5px; display: flex; align-items: center; justify-content: center;">
                            <span style="color: #4CAF50;">✓</span>
                        </div>
                        <span style="font-size: 12px;">Soltar aquí</span>
                    </div>
                </div>
            </div>
        `;
        container.appendChild(instructions);
        
        // Añadir contador de intentos
        const attemptsCounter = document.createElement('div');
        attemptsCounter.className = 'puzzle-attempts';
        attemptsCounter.textContent = `Intentos restantes: ${PUZZLE_CONFIG.maxAttempts - attempts}`;
        attemptsCounter.style.textAlign = 'center';
        attemptsCounter.style.marginBottom = '10px';
        container.appendChild(attemptsCounter);
        
        // Mostrar información de depuración
        console.log('Puzzle configurado correctamente');
        console.log('Posición objetivo:', targetPosition);
        console.log('Tamaño de la pieza:', scaledPieceSize);
        console.log('Dimensiones del contenedor:', { width: containerWidth, height: containerHeight });
        
        // Configurar arrastrar y soltar después de un pequeño retraso
        setTimeout(() => {
            console.log('Configurando arrastrar y soltar...');
            setupDragAndDrop();
        }, 100);
        
        // Limpiar el temporizador de expiración si existe
        if (expirationTimer) {
            clearTimeout(expirationTimer);
        }
        
        // Configurar el temporizador de expiración
        expirationTimer = setTimeout(() => {
            console.log('Tiempo de CAPTCHA agotado');
            callbacks.onError && callbacks.onError('Se ha agotado el tiempo para completar el CAPTCHA. Por favor, inténtalo de nuevo.');
        }, PUZZLE_CONFIG.expirationTime);
        
        // Limpiar el temporizador cuando se destruya el CAPTCHA
        return () => clearTimeout(expirationTimer);
    };
    
    // Manejar errores de carga de imagen
    bgImage.onerror = () => {
        callbacks.onError && callbacks.onError('Error al cargar la imagen del rompecabezas');
    };
    
    // Añadir el contenedor al DOM
    container.appendChild(captchaElement);
    
    // Devolver la API pública del CAPTCHA
    return {
        cleanup: () => {
            // Limpiar event listeners
            if (pieceElement) {
                pieceElement.removeEventListener('mousedown', startDrag);
                document.removeEventListener('mousemove', drag);
                document.removeEventListener('mouseup', endDrag);
                pieceElement.removeEventListener('touchstart', startDrag);
                document.removeEventListener('touchmove', drag);
                document.removeEventListener('touchend', endDrag);
            }
        }
    };
}

/**
 * Configura los eventos de arrastrar y soltar para la pieza del rompecabezas
 */
function setupDragAndDrop() {
    if (!pieceElement) {
        console.error('No se encontró el elemento de la pieza');
        return;
    }
    
    console.log('Configurando arrastrar y soltar...');
    
    // Eliminar eventos anteriores para evitar duplicados
    pieceElement.removeEventListener('mousedown', startDrag);
    document.removeEventListener('mousemove', drag);
    document.removeEventListener('mouseup', endDrag);
    pieceElement.removeEventListener('touchstart', startDrag);
    document.removeEventListener('touchmove', drag);
    document.removeEventListener('touchend', endDrag);
    
    // Eventos de ratón
    pieceElement.addEventListener('mousedown', startDrag);
    document.addEventListener('mousemove', drag);
    document.addEventListener('mouseup', endDrag);
    
    // Eventos táctiles
    pieceElement.addEventListener('touchstart', startDrag, { passive: false });
    document.addEventListener('touchmove', drag, { passive: false });
    document.addEventListener('touchend', endDrag);
    
    console.log('Eventos de arrastrar y soltar configurados');
}

/**
 * Maneja el inicio del arrastre
 * @param {Event} e - Evento de inicio de arrastre
 */
function startDrag(e) {
    e.preventDefault();
    e.stopPropagation();
    
    console.log('Iniciando arrastre...');
    
    // Si ya se está arrastrando, salir
    if (isDragging) return;
    
    isDragging = true;
    
    try {
        // Obtener la posición inicial del ratón o toque
        const clientX = e.clientX || (e.touches && e.touches[0].clientX);
        const clientY = e.clientY || (e.touches && e.touches[0].clientY);
        
        if (clientX === undefined || clientY === undefined) {
            console.error('No se pudo obtener la posición inicial');
            isDragging = false;
            return;
        }
        
        console.log('Posición inicial del ratón:', { clientX, clientY });
        
        // Guardar la posición inicial del ratón
        dragStartPos = { x: clientX, y: clientY };
        
        // Calcular el desplazamiento del ratón respecto al elemento
        const rect = pieceElement.getBoundingClientRect();
        const offsetX = clientX - rect.left;
        const offsetY = clientY - rect.top;
        
        console.log('Desplazamiento del ratón:', { offsetX, offsetY });
        
        // Guardar el desplazamiento en el dataset
        pieceElement.dataset.offsetX = offsetX;
        pieceElement.dataset.offsetY = offsetY;
        
        // Añadir clase de arrastre
        pieceElement.classList.add('dragging');
        
        // Asegurarse de que la pieza esté por encima de otros elementos
        pieceElement.style.zIndex = '100';
        
        console.log('Arrastre iniciado correctamente');
    } catch (error) {
        console.error('Error en startDrag:', error);
        isDragging = false;
    }
}

/**
 * Maneja el arrastre de la pieza
 * @param {Event} e - Evento de arrastre
 */
function drag(e) {
    if (!isDragging) return;
    
    try {
        e.preventDefault();
        e.stopPropagation();
        
        // Obtener la posición actual del ratón o toque
        const clientX = e.clientX || (e.touches && e.touches[0].clientX);
        const clientY = e.clientY || (e.touches && e.touches[0].clientY);
        
        if (clientX === undefined || clientY === undefined) {
            console.error('No se pudo obtener la posición actual');
            return;
        }
        
        // Obtener el desplazamiento guardado
        const offsetX = parseFloat(pieceElement.dataset.offsetX) || 0;
        const offsetY = parseFloat(pieceElement.dataset.offsetY) || 0;
        
        console.log('Posición actual:', { clientX, clientY, offsetX, offsetY });
        
        // Obtener la posición del contenedor
        const container = pieceElement.parentElement;
        if (!container) {
            console.error('No se encontró el contenedor padre');
            return;
        }
        
        const containerRect = container.getBoundingClientRect();
        
        // Calcular la nueva posición
        let newLeft = clientX - containerRect.left - offsetX;
        let newTop = clientY - containerRect.top - offsetY;
        
        // Limitar la posición a los bordes del contenedor
        const pieceRect = pieceElement.getBoundingClientRect();
        const maxLeft = containerRect.width - pieceRect.width;
        const maxTop = containerRect.height - pieceRect.height;
        
        newLeft = Math.max(0, Math.min(maxLeft, newLeft));
        newTop = Math.max(0, Math.min(maxTop, newTop));
        
        console.log('Nueva posición:', { newLeft, newTop });
        
        // Aplicar la nueva posición con transición suave
        pieceElement.style.transition = 'left 0.05s, top 0.05s';
        pieceElement.style.left = `${newLeft}px`;
        pieceElement.style.top = `${newTop}px`;
        
    } catch (error) {
        console.error('Error en drag:', error);
        isDragging = false;
    }
}

/**
 * Maneja el final del arrastre
 * @param {Event} e - Evento de fin de arrastre
 */
function endDrag(e) {
    if (!isDragging) return;
    
    try {
        e && e.preventDefault();
        e && e.stopPropagation();
        
        console.log('Finalizando arrastre...');
        
        // Actualizar el estado
        isDragging = false;
        
        // Quitar clase de arrastre
        pieceElement.classList.remove('dragging');
        
        // Verificar si la pieza está en la posición correcta
        const pieceRect = pieceElement.getBoundingClientRect();
        const dropZoneRect = dropZone.getBoundingClientRect();
        
        console.log('Posición de la pieza:', { 
            left: pieceRect.left, 
            top: pieceRect.top, 
            width: pieceRect.width, 
            height: pieceRect.height 
        });
        
        console.log('Posición de la zona de destino:', { 
            left: dropZoneRect.left, 
            top: dropZoneRect.top, 
            width: dropZoneRect.width, 
            height: dropZoneRect.height 
        });
        
        // Calcular la distancia entre la pieza y la zona de destino
        const dx = Math.abs(pieceRect.left - dropZoneRect.left);
        const dy = Math.abs(pieceRect.top - dropZoneRect.top);
        
        console.log('Distancia a la zona de destino:', { dx, dy, threshold: PUZZLE_CONFIG.snapThreshold });
        
        // Verificar si la pieza está lo suficientemente cerca
        if (dx < PUZZLE_CONFIG.snapThreshold && dy < PUZZLE_CONFIG.snapThreshold) {
            console.log('¡Pieza colocada correctamente!');
            
            // Obtener la posición relativa al contenedor
            const containerRect = pieceElement.parentElement.getBoundingClientRect();
            const targetLeft = dropZoneRect.left - containerRect.left;
            const targetTop = dropZoneRect.top - containerRect.top;
            
            // Ajustar la pieza a la posición exacta con animación
            pieceElement.style.transition = 'left 0.3s ease-out, top 0.3s ease-out';
            pieceElement.style.left = `${targetLeft}px`;
            pieceElement.style.top = `${targetTop}px`;
            
            // Deshabilitar la pieza después de la animación
            setTimeout(() => {
                pieceElement.style.pointerEvents = 'none';
                
                // Notificar éxito
                callbacks.onSuccess && callbacks.onSuccess();
                console.log('CAPTCHA completado con éxito');
            }, 300);
            
        } else {
            console.log('Posición incorrecta');
            
            // Incrementar el contador de intentos
            attempts++;
            
            // Actualizar el contador de intentos
            const attemptsCounter = document.querySelector('.puzzle-attempts');
            if (attemptsCounter) {
                const remaining = Math.max(0, PUZZLE_CONFIG.maxAttempts - attempts);
                attemptsCounter.textContent = `Intentos restantes: ${remaining}`;
                console.log(`Intentos restantes: ${remaining}`);
            }
            
            // Verificar si se agotaron los intentos
            if (attempts >= PUZZLE_CONFIG.maxAttempts) {
                const errorMsg = 'Has agotado todos los intentos. Intenta de nuevo.';
                console.error(errorMsg);
                callbacks.onError && callbacks.onError(errorMsg);
            } else {
                const errorMsg = 'Posición incorrecta. Intenta de nuevo.';
                console.warn(errorMsg);
                callbacks.onError && callbacks.onError(errorMsg);
            }
        }
        
    } catch (error) {
        console.error('Error en endDrag:', error);
        isDragging = false;
        
        // Notificar error
        callbacks.onError && callbacks.onError('Ocurrió un error. Por favor, inténtalo de nuevo.');
    }
}

    // Devolver la función de creación del CAPTCHA
    return {
        createCaptcha: createCaptcha
    };
})();

// Hacer el CAPTCHA de rompecabezas disponible globalmente
window.PuzzleCaptcha = PuzzleCaptcha;
