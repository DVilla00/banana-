// Funcionalidades JavaScript para la página inmobiliaria

// Funcionalidad para filtros avanzados
function setupAdvancedFilters() {
    const filterForm = document.querySelector('.search-form');
    const propertyCards = document.querySelectorAll('.property-card');
    
    if (!filterForm || !propertyCards.length) return;
    
    filterForm.addEventListener('submit', function(e) {
        e.preventDefault();
        applyFilters();
    });
    
    // También aplicar filtros cuando cambien los valores
    const filterInputs = filterForm.querySelectorAll('select, input');
    filterInputs.forEach(input => {
        input.addEventListener('change', function() {
            applyFilters();
        });
    });
}

function applyFilters() {
    const propertyCards = document.querySelectorAll('.property-card');
    const filters = getCurrentFilters();
    
    let visibleCount = 0;
    
    // Primero mostrar TODAS las propiedades
    propertyCards.forEach(card => {
        card.style.display = 'block';
    });
    
    // Luego aplicar filtros
    propertyCards.forEach(card => {
        const matches = checkPropertyMatchesFilters(card, filters);
        
        if (!matches) {
            card.style.display = 'none';
        } else {
            visibleCount++;
        }
    });
    
    updateResultsCount(visibleCount);
    
    // Re-inicializar paginación después de filtrar
    if (window.location.pathname.includes('propiedades.html')) {
        setTimeout(() => {
            setupPagination();
        }, 100);
    }
}

function getCurrentFilters() {
    return {
        tipo: document.getElementById('tipo-propiedad')?.value || '',
        operacion: document.getElementById('operacion-propiedad')?.value || '',
        dormitorios: document.getElementById('dormitorios')?.value || '',
        barrio: document.getElementById('barrio')?.value || '',
        precioMin: document.getElementById('precio-min')?.value || '',
        precioMax: document.getElementById('precio-max')?.value || ''
    };
}

// FUNCIÓN CORREGIDA - Usa data-attributes correctamente
function extractPropertyData(card) {
    // Usar los data-attributes que ya están en el HTML
    const tipo = card.getAttribute('data-tipo') || '';
    const operacion = card.getAttribute('data-operacion') || '';
    const dormitorios = parseInt(card.getAttribute('data-dormitorios')) || 0;
    const precio = parseFloat(card.getAttribute('data-precio')) || 0;
    
    // Extraer ubicación del texto
    const locationElement = card.querySelector('.property-location');
    const ubicacion = locationElement ? locationElement.textContent.trim() : '';
    
    return {
        tipo,
        operacion,
        precio,
        dormitorios,
        ubicacion
    };
}

// FUNCIÓN CORREGIDA - Filtros mejorados
function checkPropertyMatchesFilters(card, filters) {
    const propertyData = extractPropertyData(card);
    
    // Verificar cada filtro
    if (filters.tipo && propertyData.tipo !== filters.tipo) return false;
    if (filters.operacion && propertyData.operacion !== filters.operacion) return false;
    
    // Filtro de dormitorios
    if (filters.dormitorios) {
        const filterDormitorios = parseInt(filters.dormitorios);
        if (filterDormitorios === 4) {
            // Para "4+ dormitorios", mostrar propiedades con 4 o más
            if (propertyData.dormitorios < 4) return false;
        } else {
            // Para números específicos, mostrar exactamente ese número
            if (propertyData.dormitorios !== filterDormitorios) return false;
        }
    }
    
    // Filtro de barrio (ubicación)
    if (filters.barrio && propertyData.ubicacion) {
        const barrioLower = filters.barrio.toLowerCase();
        const ubicacionLower = propertyData.ubicacion.toLowerCase();
        
        // Mapeo de barrios para búsqueda más flexible
        const barrioMap = {
            'palermo': ['palermo'],
            'recoleta': ['recoleta'],
            'belgrano': ['belgrano'],
            'microcentro': ['microcentro', 'caba'],
            'caballito': ['caballito'],
            'nunez': ['núñez', 'nunez']
        };
        
        let matchFound = false;
        if (barrioMap[barrioLower]) {
            for (const keyword of barrioMap[barrioLower]) {
                if (ubicacionLower.includes(keyword)) {
                    matchFound = true;
                    break;
                }
            }
        }
        
        if (!matchFound) return false;
    }
    
    // Filtros de precio
    if (filters.precioMin && propertyData.precio < parseFloat(filters.precioMin)) return false;
    if (filters.precioMax && propertyData.precio > parseFloat(filters.precioMax)) return false;
    
    return true;
}

function updateResultsCount(count) {
    const resultsText = document.querySelector('.section-title p');
    if (resultsText) {
        if (count === 0) {
            resultsText.innerHTML = `No encontramos propiedades que coincidan con tu búsqueda. <br><a href="contacto.html" style="color: var(--color-secundario);">¿Necesitas ayuda personalizada?</a>`;
        } else {
            resultsText.textContent = `Encontramos ${count} propiedades que coinciden con tu búsqueda`;
        }
    }
    
    // Actualizar también el span si existe
    const resultsCountSpan = document.getElementById('results-count');
    if (resultsCountSpan) {
        resultsCountSpan.textContent = count;
    }
}

// Funcionalidad para limpiar filtros
function setupClearFilters() {
    const clearButton = document.getElementById('clear-filters');
    if (clearButton) {
        clearButton.addEventListener('click', function() {
            // Mostrar todas las propiedades
            const propertyCards = document.querySelectorAll('.property-card');
            propertyCards.forEach(card => {
                card.style.display = 'block';
            });
            
            // Actualizar contador
            updateResultsCount(propertyCards.length);
            
            // Resetear formulario
            const form = this.closest('form');
            form.reset();
            
            // Re-inicializar paginación con todas las propiedades
            if (window.location.pathname.includes('propiedades.html')) {
                setTimeout(() => {
                    const allProperties = Array.from(propertyCards);
                    showFilteredPage(1, allProperties, 9);
                }, 100);
            }
        });
    }
}

// Función para procesar parámetros de URL y aplicar filtros automáticamente
function processURLParameters() {
    const urlParams = new URLSearchParams(window.location.search);
    
    if (urlParams.toString()) {
        // Aplicar filtros desde la URL
        applyFiltersFromURL(urlParams);
    }
}

function applyFiltersFromURL(urlParams) {
    // Obtener valores de la URL
    const tipo = urlParams.get('tipo');
    const operacion = urlParams.get('operacion');
    const ubicacion = urlParams.get('ubicacion');
    const precio = urlParams.get('precio');
    
    console.log('Aplicando filtros desde URL:', { tipo, operacion, ubicacion, precio });
    
    // Llenar los campos del formulario si existen
    if (tipo && document.getElementById('tipo-propiedad')) {
        document.getElementById('tipo-propiedad').value = tipo;
    }
    if (operacion && document.getElementById('operacion-propiedad')) {
        document.getElementById('operacion-propiedad').value = operacion;
    }
    if (ubicacion && document.getElementById('barrio')) {
        document.getElementById('barrio').value = ubicacion;
    }
    if (precio && document.getElementById('precio-max')) {
        document.getElementById('precio-max').value = precio;
    }
    
    // Aplicar los filtros
    setTimeout(() => {
        applyFilters();
    }, 100);
}

// Funcionalidad de paginación
function setupPagination() {
    const propertyCards = document.querySelectorAll('.property-card');
    const itemsPerPage = 9;
    
    if (propertyCards.length === 0) return;
    
    // Obtener solo las propiedades visibles (después de aplicar filtros)
    const visibleProperties = Array.from(propertyCards).filter(card => 
        card.style.display !== 'none'
    );
    
    if (visibleProperties.length === 0) return;
    
    // Ocultar todas las propiedades primero
    propertyCards.forEach(card => {
        card.style.display = 'none';
    });
    
    // Mostrar primera página
    showFilteredPage(1, visibleProperties, itemsPerPage);
    
    // Configurar event listeners para la paginación
    setTimeout(() => {
        const pageLinks = document.querySelectorAll('.page-link');
        pageLinks.forEach(link => {
            link.addEventListener('click', function(e) {
                e.preventDefault();
                handlePageClick(this.textContent, visibleProperties, itemsPerPage);
            });
        });
    }, 100);
}

function showFilteredPage(pageNumber, visibleProperties, itemsPerPage) {
    const totalProperties = visibleProperties.length;
    const totalPages = Math.ceil(totalProperties / itemsPerPage);
    
    // Ocultar todas las propiedades
    visibleProperties.forEach(card => {
        card.style.display = 'none';
    });
    
    // Calcular índices de propiedades a mostrar
    const startIndex = (pageNumber - 1) * itemsPerPage;
    const endIndex = Math.min(startIndex + itemsPerPage, totalProperties);
    
    // Mostrar propiedades de la página actual
    let visibleCount = 0;
    for (let i = startIndex; i < endIndex; i++) {
        if (visibleProperties[i]) {
            visibleProperties[i].style.display = 'block';
            visibleCount++;
        }
    }
    
    // Actualizar paginación
    updatePaginationUI(pageNumber, totalPages);
    
    // Actualizar contador de resultados
    updatePageResultsCount(visibleCount, pageNumber, totalPages, totalProperties);
    
    // Scroll suave hacia arriba
    window.scrollTo({
        top: document.querySelector('.properties-grid').offsetTop - 100,
        behavior: 'smooth'
    });
}

function updatePaginationUI(currentPage, totalPages) {
    const paginationContainer = document.querySelector('.pagination');
    if (!paginationContainer) return;
    
    // Limpiar paginación existente
    paginationContainer.innerHTML = '';
    
    // Botón "Anterior"
    if (currentPage > 1) {
        const prevButton = document.createElement('a');
        prevButton.href = '#';
        prevButton.className = 'page-link nav-button';
        prevButton.textContent = '← Anterior';
        prevButton.style.order = '1';
        paginationContainer.appendChild(prevButton);
    }
    
    // Números de página
    const maxVisiblePages = 3;
    let startPage = Math.max(1, currentPage - 1);
    let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);
    
    // Ajustar si estamos cerca del final
    if (endPage - startPage + 1 < maxVisiblePages) {
        startPage = Math.max(1, endPage - maxVisiblePages + 1);
    }
    
    for (let i = startPage; i <= endPage; i++) {
        const pageLink = document.createElement('a');
        pageLink.href = '#';
        pageLink.className = `page-link ${i === currentPage ? 'active' : ''}`;
        pageLink.textContent = i;
        pageLink.style.order = i + 1;
        paginationContainer.appendChild(pageLink);
    }
    
    // Botón "Siguiente"
    if (currentPage < totalPages) {
        const nextButton = document.createElement('a');
        nextButton.href = '#';
        nextButton.className = 'page-link nav-button';
        nextButton.textContent = 'Siguiente →';
        nextButton.style.order = '100';
        paginationContainer.appendChild(nextButton);
    }
    
    // Re-asignar event listeners a los nuevos botones
    setTimeout(() => {
        const newPageLinks = paginationContainer.querySelectorAll('.page-link');
        newPageLinks.forEach(link => {
            link.addEventListener('click', function(e) {
                e.preventDefault();
                handlePageClick(this.textContent, document.querySelectorAll('.property-card'), 9);
            });
        });
    }, 50);
}

function handlePageClick(buttonText, visibleProperties, itemsPerPage) {
    const currentPage = getCurrentPage();
    const totalPages = Math.ceil(visibleProperties.length / itemsPerPage);
    
    if (buttonText === 'Siguiente →' && currentPage < totalPages) {
        showFilteredPage(currentPage + 1, visibleProperties, itemsPerPage);
    } else if (buttonText === '← Anterior' && currentPage > 1) {
        showFilteredPage(currentPage - 1, visibleProperties, itemsPerPage);
    } else {
        const pageNumber = parseInt(buttonText);
        if (!isNaN(pageNumber)) {
            showFilteredPage(pageNumber, visibleProperties, itemsPerPage);
        }
    }
}

function getCurrentPage() {
    const activeLink = document.querySelector('.page-link.active');
    return activeLink ? parseInt(activeLink.textContent) : 1;
}

function updatePageResultsCount(visibleCount, currentPage, totalPages, totalProperties) {
    const resultsText = document.querySelector('.section-title p');
    const startItem = ((currentPage - 1) * 9) + 1;
    const endItem = Math.min(startItem + visibleCount - 1, totalProperties);
    
    if (resultsText) {
        resultsText.innerHTML = `Mostrando <strong>${startItem}-${endItem}</strong> de <strong>${totalProperties}</strong> propiedades`;
    }
    
    // Actualizar también el span del contador principal
    const resultsCountSpan = document.getElementById('results-count');
    if (resultsCountSpan) {
        resultsCountSpan.textContent = totalProperties;
    }
}

// Funciones globales para el modal
function openContactModal() {
    const modal = document.getElementById('contactModal');
    if (modal) {
        modal.style.display = 'block';
        document.body.style.overflow = 'hidden';
    }
}

function closeContactModal() {
    const modal = document.getElementById('contactModal');
    if (modal) {
        modal.style.display = 'none';
        document.body.style.overflow = 'auto';
    }
}

function scheduleVisit() {
    alert('Para agendar una visita, por favor contactarnos al +54 11 1234-5678 o completar el formulario de contacto.');
}

// FUNCIÓN CORREGIDA - Favoritos mejorados
function toggleFavorite(button) {
    const propertyId = button.getAttribute('data-property-id');
    let favorites = JSON.parse(localStorage.getItem('propertyFavorites')) || [];
    
    if (button.classList.contains('favorited')) {
        // Quitar de favoritos
        favorites = favorites.filter(id => id !== propertyId);
        button.textContent = '🤍';
        button.classList.remove('favorited');
        showFavoriteFeedback(false);
    } else {
        // Agregar a favoritos
        if (!favorites.includes(propertyId)) {
            favorites.push(propertyId);
            button.textContent = '❤️';
            button.classList.add('favorited');
            showFavoriteFeedback(true);
        }
    }
    
    // Guardar en localStorage
    localStorage.setItem('propertyFavorites', JSON.stringify(favorites));
}

function showFavoriteFeedback(isFavorited) {
    const message = document.createElement('div');
    message.textContent = isFavorited ? '✓ Agregado a favoritos' : '✓ Eliminado de favoritos';
    message.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: var(--color-primario);
        color: white;
        padding: 10px 20px;
        border-radius: 5px;
        z-index: 1000;
        animation: fadeInOut 2s ease-in-out;
    `;
    
    document.body.appendChild(message);
    
    setTimeout(() => {
        message.remove();
    }, 2000);
}

// Inicializar favoritos al cargar la página
function initializeFavorites() {
    const favoriteButtons = document.querySelectorAll('.favorite-btn');
    const favorites = JSON.parse(localStorage.getItem('propertyFavorites')) || [];
    
    favoriteButtons.forEach(button => {
        const propertyId = button.getAttribute('data-property-id');
        if (favorites.includes(propertyId)) {
            button.classList.add('favorited');
            button.innerHTML = '❤️';
        }
    });
}

// Inicialización principal
document.addEventListener('DOMContentLoaded', function() {
    // Manejo del formulario de búsqueda principal (index.html)
    const searchForm = document.querySelector('.search-form');
    if (searchForm && document.getElementById('tipo')) {
        searchForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            // Obtener valores del formulario
            const tipo = document.getElementById('tipo').value;
            const operacion = document.getElementById('operacion').value;
            const ubicacion = document.getElementById('ubicacion').value;
            const precio = document.getElementById('precio').value;
            
            console.log('Búsqueda realizada desde inicio:', { tipo, operacion, ubicacion, precio });
            
            // Crear parámetros para la URL
            const params = new URLSearchParams();
            if (tipo) params.append('tipo', tipo);
            if (operacion) params.append('operacion', operacion);
            if (ubicacion) params.append('ubicacion', ubicacion);
            if (precio) params.append('precio', precio);
            
            // Redirigir a la página de propiedades con los filtros aplicados
            window.location.href = `propiedades.html?${params.toString()}`;
        });
    }
    
    // Procesar parámetros de URL si estamos en propiedad.html
    if (window.location.pathname.includes('propiedades.html')) {
        processURLParameters();
    }
    
    // Configurar filtros avanzados (si estamos en propiedad.html)
    setupAdvancedFilters();
    setupClearFilters();
    
    // Configurar paginación (si estamos en propiedades.html)
    if (window.location.pathname.includes('propiedades.html')) {
        // Mostrar todas las propiedades primero
        const propertyCards = document.querySelectorAll('.property-card');
        propertyCards.forEach(card => {
            card.style.display = 'block';
        });
        
        // Luego inicializar paginación
        setTimeout(() => {
            setupPagination();
        }, 500);
    }
    
    // Smooth scroll para enlaces internos
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({
                    behavior: 'smooth'
                });
            }
        });
    });
    
    // Manejo de formularios de contacto
    const contactForms = document.querySelectorAll('.contact-form');
    contactForms.forEach(form => {
        form.addEventListener('submit', function(e) {
            e.preventDefault();
            
            // Simular envío del formulario
            const formData = new FormData(this);
            const data = Object.fromEntries(formData);
            console.log('Formulario enviado:', data);
            
            alert('¡Gracias por tu interés! Nos contactaremos contigo a la brevedad.');
            
            // Cerrar modal si existe
            if (document.getElementById('contactModal')) {
                closeContactModal();
            }
            
            // Resetear formulario
            this.reset();
        });
    });
    
    // Inicializar favoritos
    initializeFavorites();
    
    // Cerrar modal al hacer click fuera
    window.onclick = function(event) {
        const modal = document.getElementById('contactModal');
        if (modal && event.target == modal) {
            closeContactModal();
        }
    }
    
    // Cerrar modal con tecla ESC
    document.addEventListener('keydown', function(event) {
        if (event.key === 'Escape') {
            closeContactModal();
        }
    });
});

// Agregar estilos para la animación del feedback
const style = document.createElement('style');
style.textContent = `
    @keyframes fadeInOut {
        0% { opacity: 0; transform: translateY(-20px); }
        20% { opacity: 1; transform: translateY(0); }
        80% { opacity: 1; transform: translateY(0); }
        100% { opacity: 0; transform: translateY(-20px); }
    }
    
    .favorite-btn {
        transition: all 0.3s ease;
    }
    
    .favorite-btn:hover {
        transform: scale(1.1);
    }
    
    .no-results {
        grid-column: 1 / -1;
        text-align: center;
        padding: 40px;
        background: #f8f9fa;
        border-radius: 10px;
        margin: 20px 0;
    }
`;
document.head.appendChild(style);