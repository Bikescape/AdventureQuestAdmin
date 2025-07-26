// admin/admin-script.js

// Estado global del Admin
let currentEditingGame = null;
let currentEditingLocation = null;
let currentEditingTrial = null;
let adminMap = null;
let adminMapMarker = null;

// Ejecutar al cargar el DOM
document.addEventListener('DOMContentLoaded', async () => {
    // Simular carga y luego mostrar la pantalla principal
    setTimeout(() => {
        hideScreen('loading-screen');
        showScreen('admin-screen');
        loadGames(); // Cargar juegos al inicio
        setupAdminEventListeners();
    }, 500);
});

// Función para mostrar una pantalla específica
function showScreen(screenId) {
    document.querySelectorAll('.screen').forEach(screen => {
        screen.classList.add('hidden');
    });
    document.getElementById(screenId).classList.remove('hidden');
}

// Función para ocultar una pantalla específica
function hideScreen(screenId) {
    document.getElementById(screenId).classList.add('hidden');
}

// Configuración de Event Listeners
function setupAdminEventListeners() {
    // Navegación principal
    document.getElementById('nav-games-btn').addEventListener('click', () => {
        showAdminSection('games-section');
        document.getElementById('nav-games-btn').classList.add('active');
        document.getElementById('nav-rankings-btn').classList.remove('active');
    });
    document.getElementById('nav-rankings-btn').addEventListener('click', () => {
        showAdminSection('rankings-section');
        document.getElementById('nav-rankings-btn').classList.add('active');
        document.getElementById('nav-games-btn').classList.remove('active');
        loadRankingGames(); // Cargar juegos para selección de ranking
    });

    // Gestión de Juegos
    document.getElementById('create-game-btn').addEventListener('click', () => {
        currentEditingGame = null; // No estamos editando
        showGameForm();
    });
    document.getElementById('game-form').addEventListener('submit', handleGameFormSubmit);
    document.getElementById('game-cancel-btn').addEventListener('click', hideGameForm);

    // Gestión de Localizaciones
    document.getElementById('back-to-games-btn').addEventListener('click', () => {
        hideSection('locations-section');
        showSection('games-section');
        currentEditingGame = null;
        loadGames(); // Recargar la lista de juegos
    });
    document.getElementById('add-location-btn').addEventListener('click', () => {
        currentEditingLocation = null; // No estamos editando
        showLocationForm();
    });
    document.getElementById('location-form').addEventListener('submit', handleLocationFormSubmit);
    document.getElementById('location-cancel-btn').addEventListener('click', hideLocationForm);

    // Gestión de Pruebas
    document.getElementById('back-to-locations-btn').addEventListener('click', () => {
        hideSection('trials-section');
        showSection('locations-section');
        loadLocations(currentEditingGame.id); // Recargar la lista de localizaciones
        currentEditingLocation = null;
    });
    document.getElementById('add-trial-btn').addEventListener('click', () => {
        currentEditingTrial = null; // No estamos editando
        showTrialForm();
    });
    document.getElementById('trial-form').addEventListener('submit', handleTrialFormSubmit);
    document.getElementById('trial-cancel-btn').addEventListener('click', hideTrialForm);
    document.getElementById('trial-type').addEventListener('change', toggleTrialTypeFields);

    // Campos de Múltiple Opción y Ordenación
    document.getElementById('add-mc-option-btn').addEventListener('click', addMultipleChoiceOptionField);
    document.getElementById('add-ordering-option-btn').addEventListener('click', addOrderingOptionField);

    // GPS Map
    document.getElementById('get-current-location-btn').addEventListener('click', getCurrentLocationForMap);
    // Rankings
    document.getElementById('rankings-game-select').addEventListener('change', (e) => {
        loadRankings(e.target.value);
    });
}

// Función para mostrar una sección administrativa
function showAdminSection(sectionId) {
    document.querySelectorAll('.admin-section').forEach(section => {
        section.classList.add('hidden');
    });
    document.getElementById(sectionId).classList.remove('hidden');
}

function showSection(sectionId) {
    document.getElementById(sectionId).classList.remove('hidden');
}

function hideSection(sectionId) {
    document.getElementById(sectionId).classList.add('hidden');
}

// --- Funciones para Juegos ---

async function loadGames() {
    const { data, error } = await supabase.from('games').select('*').order('created_at', { ascending: false });
    const gamesListDiv = document.getElementById('games-list');
    gamesListDiv.innerHTML = ''; // Limpiar lista

    if (error) {
        showAlert('Error cargando juegos: ' + error.message, 'error');
        console.error('Error loading games:', error);
        return;
    }

    if (data.length === 0) {
        gamesListDiv.innerHTML = '<p>No hay juegos creados aún. ¡Crea el primero!</p>';
        return;
    }

    data.forEach(game => {
        const gameCard = document.createElement('div');
        gameCard.className = 'card game-card';
        gameCard.innerHTML = `
            <h3>${game.title}</h3>
            <p>${game.description}</p>
            <p>Tipo: ${game.game_type === 'linear' ? 'Lineal' : 'Seleccionable'}</p>
            <span class="card-status status-${game.is_active ? 'active' : 'inactive'}">
                ${game.is_active ? 'Activo' : 'Inactivo'}
            </span>
            <div class="card-actions">
                <button class="btn btn-secondary btn-sm" onclick="editGame('${game.id}')">Editar</button>
                <button class="btn btn-primary btn-sm" onclick="manageLocations('${game.id}', '${game.title}')">Localizaciones</button>
                <button class="btn btn-danger btn-sm" onclick="deleteGame('${game.id}')">Eliminar</button>
            </div>
        `;
        gamesListDiv.appendChild(gameCard);
    });
    hideGameForm(); // Asegurarse de que el formulario esté oculto al cargar la lista
    hideSection('locations-section'); // Ocultar secciones anidadas
    hideSection('trials-section');
}

function showGameForm() {
    document.getElementById('game-form-container').classList.remove('hidden');
    document.getElementById('games-list').classList.add('hidden');
    document.getElementById('create-game-btn').classList.add('hidden');
    document.getElementById('game-form-title').textContent = currentEditingGame ? 'Editar Juego' : 'Crear Nuevo Juego';
    
    // Reset form fields
    document.getElementById('game-title').value = currentEditingGame ? currentEditingGame.title : '';
    document.getElementById('game-description').value = currentEditingGame ? currentEditingGame.description : '';
    document.getElementById('game-mechanics').value = currentEditingGame ? currentEditingGame.mechanics : '';
    document.getElementById('game-narrative-intro').value = currentEditingGame ? currentEditingGame.narrative_intro : '';
    document.getElementById('game-type').value = currentEditingGame ? currentEditingGame.game_type : 'linear';
    document.getElementById('game-active').checked = currentEditingGame ? currentEditingGame.is_active : false;
}

function hideGameForm() {
    document.getElementById('game-form-container').classList.add('hidden');
    document.getElementById('games-list').classList.remove('hidden');
    document.getElementById('create-game-btn').classList.remove('hidden');
}

async function handleGameFormSubmit(event) {
    event.preventDefault();
    const title = document.getElementById('game-title').value;
    const description = document.getElementById('game-description').value;
    const mechanics = document.getElementById('game-mechanics').value;
    const narrativeIntro = document.getElementById('game-narrative-intro').value;
    const gameType = document.getElementById('game-type').value;
    const isActive = document.getElementById('game-active').checked;

    const gameData = {
        title,
        description,
        mechanics,
        narrative_intro: narrativeIntro,
        game_type: gameType,
        is_active: isActive
    };

    let error = null;
    if (currentEditingGame) {
        // Update existing game
        const { error: updateError } = await supabase.from('games').update(gameData).eq('id', currentEditingGame.id);
        error = updateError;
    } else {
        // Create new game
        const { error: insertError } = await supabase.from('games').insert(gameData);
        error = insertError;
    }

    if (error) {
        showAlert('Error guardando juego: ' + error.message, 'error');
        console.error('Error saving game:', error);
    } else {
        showAlert('Juego guardado exitosamente.', 'success');
        loadGames();
    }
}

async function editGame(gameId) {
    const { data, error } = await supabase.from('games').select('*').eq('id', gameId).single();
    if (error) {
        showAlert('Error cargando juego para editar: ' + error.message, 'error');
        console.error('Error loading game for edit:', error);
        return;
    }
    currentEditingGame = data;
    showGameForm();
}

async function deleteGame(gameId) {
    if (!confirm('¿Estás seguro de que quieres eliminar este juego y todas sus localizaciones/pruebas/rankings asociados? Esta acción es irreversible.')) {
        return;
    }
    const { error } = await supabase.from('games').delete().eq('id', gameId);
    if (error) {
        showAlert('Error eliminando juego: ' + error.message, 'error');
        console.error('Error deleting game:', error);
    } else {
        showAlert('Juego eliminado exitosamente.', 'success');
        loadGames();
    }
}

// --- Funciones para Localizaciones ---

async function manageLocations(gameId, gameTitle) {
    currentEditingGame = { id: gameId, title: gameTitle };
    document.getElementById('current-game-title').textContent = `Localizaciones para: ${gameTitle}`;
    showSection('locations-section');
    hideSection('games-section');
    await loadLocations(gameId);
}

async function loadLocations(gameId) {
    const { data, error } = await supabase
        .from('locations')
        .select('*')
        .eq('game_id', gameId)
        .order('order_in_game', { ascending: true }); // Asegurar el orden

    const locationsListDiv = document.getElementById('locations-list');
    locationsListDiv.innerHTML = ''; // Limpiar lista

    if (error) {
        showAlert('Error cargando localizaciones: ' + error.message, 'error');
        console.error('Error loading locations:', error);
        return;
    }

    if (data.length === 0) {
        locationsListDiv.innerHTML = '<p>No hay localizaciones para este juego aún. ¡Añade la primera!</p>';
        return;
    }

    data.forEach(location => {
        const locationCard = document.createElement('div');
        locationCard.className = 'card location-card';
        locationCard.innerHTML = `
            <h3>${location.name}</h3>
            <p>${location.narrative}</p>
            ${location.image_url ? `<img src="${location.image_url}" alt="Imagen de localización" style="max-width: 100px; height: auto; margin-top: 10px;">` : ''}
            ${location.audio_url ? `<audio controls src="${location.audio_url}" style="width: 100%; margin-top: 10px;"></audio>` : ''}
            <div class="card-actions">
                <button class="btn btn-secondary btn-sm" onclick="editLocation('${location.id}')">Editar</button>
                <button class="btn btn-primary btn-sm" onclick="manageTrials('${location.id}', '${location.name}')">Pruebas</button>
                <button class="btn btn-danger btn-sm" onclick="deleteLocation('${location.id}')">Eliminar</button>
            </div>
        `;
        locationsListDiv.appendChild(locationCard);
    });
    hideLocationForm();
    hideSection('trials-section');
}

function showLocationForm() {
    document.getElementById('location-form-container').classList.remove('hidden');
    document.getElementById('locations-list').classList.add('hidden');
    document.getElementById('add-location-btn').classList.add('hidden');
    document.getElementById('location-form-title').textContent = currentEditingLocation ? 'Editar Localización' : 'Crear Nueva Localización';

    // Reset form fields
    document.getElementById('location-name').value = currentEditingLocation ? currentEditingLocation.name : '';
    document.getElementById('location-narrative').value = currentEditingLocation ? currentEditingLocation.narrative : '';
    document.getElementById('location-image-url').value = currentEditingLocation ? currentEditingLocation.image_url : '';
    document.getElementById('location-audio-url').value = currentEditingLocation ? currentEditingLocation.audio_url : '';
}

function hideLocationForm() {
    document.getElementById('location-form-container').classList.add('hidden');
    document.getElementById('locations-list').classList.remove('hidden');
    document.getElementById('add-location-btn').classList.remove('hidden');
}

async function handleLocationFormSubmit(event) {
    event.preventDefault();
    if (!currentEditingGame) {
        showAlert('Primero selecciona un juego.', 'error');
        return;
    }

    const name = document.getElementById('location-name').value;
    const narrative = document.getElementById('location-narrative').value;
    const imageUrl = document.getElementById('location-image-url').value;
    const audioUrl = document.getElementById('location-audio-url').value;

    const locationData = {
        game_id: currentEditingGame.id,
        name,
        narrative,
        image_url: imageUrl || null,
        audio_url: audioUrl || null,
        order_in_game: 0 // Will be updated by DB trigger or manually
    };

    let error = null;
    if (currentEditingLocation) {
        const { error: updateError } = await supabase.from('locations').update(locationData).eq('id', currentEditingLocation.id);
        error = updateError;
    } else {
        const { error: insertError } = await supabase.from('locations').insert(locationData);
        error = insertError;
    }

    if (error) {
        showAlert('Error guardando localización: ' + error.message, 'error');
        console.error('Error saving location:', error);
    } else {
        showAlert('Localización guardada exitosamente.', 'success');
        loadLocations(currentEditingGame.id);
    }
}

async function editLocation(locationId) {
    const { data, error } = await supabase.from('locations').select('*').eq('id', locationId).single();
    if (error) {
        showAlert('Error cargando localización para editar: ' + error.message, 'error');
        console.error('Error loading location for edit:', error);
        return;
    }
    currentEditingLocation = data;
    showLocationForm();
}

async function deleteLocation(locationId) {
    if (!confirm('¿Estás seguro de que quieres eliminar esta localización y todas sus pruebas asociadas? Esta acción es irreversible.')) {
        return;
    }
    const { error } = await supabase.from('locations').delete().eq('id', locationId);
    if (error) {
        showAlert('Error eliminando localización: ' + error.message, 'error');
        console.error('Error deleting location:', error);
    } else {
        showAlert('Localización eliminada exitosamente.', 'success');
        loadLocations(currentEditingGame.id);
    }
}

// --- Funciones para Pruebas (Trials) ---

async function manageTrials(locationId, locationName) {
    currentEditingLocation = { id: locationId, name: locationName };
    document.getElementById('current-location-title').textContent = `Pruebas para: ${locationName}`;
    showSection('trials-section');
    hideSection('locations-section');
    await loadTrials(locationId);
}

async function loadTrials(locationId) {
    const { data, error } = await supabase
        .from('trials')
        .select('*')
        .eq('location_id', locationId)
        .order('order_in_location', { ascending: true }); // Asegurar el orden

    const trialsListDiv = document.getElementById('trials-list');
    trialsListDiv.innerHTML = ''; // Limpiar lista

    if (error) {
        showAlert('Error cargando pruebas: ' + error.message, 'error');
        console.error('Error loading trials:', error);
        return;
    }

    if (data.length === 0) {
        trialsListDiv.innerHTML = '<p>No hay pruebas para esta localización aún. ¡Añade la primera!</p>';
        return;
    }

    data.forEach(trial => {
        const trialItem = document.createElement('div');
        trialItem.className = 'list-item trial-item';
        trialItem.innerHTML = `
            <div class="trial-item-info">
                <h4>${trial.name} (${trial.type.toUpperCase()})</h4>
                <p>${trial.narrative}</p>
                <p>Pistas: ${trial.hint_count} (Coste: ${trial.hint_cost} pts)</p>
            </div>
            <div class="trial-item-actions">
                <button class="btn btn-secondary btn-sm" onclick="editTrial('${trial.id}')">Editar</button>
                <button class="btn btn-danger btn-sm" onclick="deleteTrial('${trial.id}')">Eliminar</button>
            </div>
        `;
        trialsListDiv.appendChild(trialItem);
    });
    hideTrialForm();
}

function showTrialForm() {
    document.getElementById('trial-form-container').classList.remove('hidden');
    document.getElementById('trials-list').classList.add('hidden');
    document.getElementById('add-trial-btn').classList.add('hidden');
    document.getElementById('trial-form-title').textContent = currentEditingTrial ? 'Editar Prueba' : 'Crear Nueva Prueba';

    // Reset form fields
    document.getElementById('trial-name').value = currentEditingTrial ? currentEditingTrial.name : '';
    document.getElementById('trial-narrative').value = currentEditingTrial ? currentEditingTrial.narrative : '';
    document.getElementById('trial-image-url').value = currentEditingTrial ? currentEditingTrial.image_url : '';
    document.getElementById('trial-audio-url').value = currentEditingTrial ? currentEditingTrial.audio_url : '';
    document.getElementById('trial-hint-count').value = currentEditingTrial ? currentEditingTrial.hint_count : 0;
    document.getElementById('trial-hint-cost').value = currentEditingTrial ? currentEditingTrial.hint_cost : 10;
    document.getElementById('trial-type').value = currentEditingTrial ? currentEditingTrial.type : '';

    // Clear and hide all type-specific fields
    document.querySelectorAll('.type-field').forEach(field => field.classList.add('hidden'));
    document.getElementById('text-question').value = '';
    document.getElementById('text-answer-type').value = 'exact';
    document.getElementById('text-correct-answer').value = '';
    document.getElementById('qr-content').value = '';
    document.getElementById('gps-latitude').value = '';
    document.getElementById('gps-longitude').value = '';
    document.getElementById('gps-tolerance').value = 10;
    document.getElementById('mc-question').value = '';
    document.getElementById('mc-options-container').innerHTML = '';
    document.getElementById('mc-correct-answer-index').value = 0;
    document.getElementById('ordering-options-container').innerHTML = '';

    // If editing, populate type-specific fields and show them
    if (currentEditingTrial) {
        toggleTrialTypeFields(); // Show relevant fields based on type
        const config = currentEditingTrial.config;
        if (config) {
            switch (currentEditingTrial.type) {
                case 'text':
                    document.getElementById('text-question').value = config.question || '';
                    document.getElementById('text-answer-type').value = config.answer_type || 'exact';
                    document.getElementById('text-correct-answer').value = config.correct_answer || '';
                    break;
                case 'qr':
                    document.getElementById('qr-content').value = config.qr_content || '';
                    break;
                case 'gps':
                    document.getElementById('gps-latitude').value = config.gps_latitude || '';
                    document.getElementById('gps-longitude').value = config.gps_longitude || '';
                    document.getElementById('gps-tolerance').value = config.gps_tolerance || 10;
                    initAdminMap(config.gps_latitude, config.gps_longitude);
                    break;
                case 'multiple_choice':
                    document.getElementById('mc-question').value = config.question || '';
                    if (config.options && Array.isArray(config.options)) {
                        config.options.forEach(option => addMultipleChoiceOptionField(option));
                    }
                    document.getElementById('mc-correct-answer-index').value = config.correct_answer_index !== undefined ? config.correct_answer_index : 0;
                    break;
                case 'ordering':
                    if (config.correct_order && Array.isArray(config.correct_order)) {
                        config.correct_order.forEach(item => addOrderingOptionField(item));
                    }
                    break;
            }
        }
    } else {
        // Initialize map for new GPS trial
        if (document.getElementById('trial-type').value === 'gps') {
            initAdminMap();
        }
    }
}

function hideTrialForm() {
    document.getElementById('trial-form-container').classList.add('hidden');
    document.getElementById('trials-list').classList.remove('hidden');
    document.getElementById('add-trial-btn').classList.remove('hidden');
    if (adminMap) {
        adminMap.remove();
        adminMap = null;
        adminMapMarker = null;
    }
}

function toggleTrialTypeFields() {
    const selectedType = document.getElementById('trial-type').value;
    document.querySelectorAll('.type-field').forEach(field => field.classList.add('hidden'));

    if (adminMap) {
        adminMap.remove();
        adminMap = null;
        adminMapMarker = null;
    }

    switch (selectedType) {
        case 'text':
            document.getElementById('text-fields').classList.remove('hidden');
            break;
        case 'qr':
            document.getElementById('qr-fields').classList.remove('hidden');
            break;
        case 'gps':
            document.getElementById('gps-fields').classList.remove('hidden');
            initAdminMap(); // Initialize map when GPS is selected
            break;
        case 'multiple_choice':
            document.getElementById('multiple-choice-fields').classList.remove('hidden');
            if (document.getElementById('mc-options-container').children.length === 0) {
                addMultipleChoiceOptionField(); // Add first option if none exists
            }
            break;
        case 'ordering':
            document.getElementById('ordering-fields').classList.remove('hidden');
            if (document.getElementById('ordering-options-container').children.length === 0) {
                addOrderingOptionField(); // Add first option if none exists
            }
            break;
    }
}

function addMultipleChoiceOptionField(value = '') {
    const container = document.getElementById('mc-options-container');
    const index = container.children.length;
    const div = document.createElement('div');
    div.className = 'form-group mc-option-group';
    div.innerHTML = `
        <label for="mc-option-${index}">Opción ${index + 1}</label>
        <input type="text" id="mc-option-${index}" class="mc-option-input" value="${value}" placeholder="Opción ${index + 1}" required>
        <button type="button" class="btn btn-danger btn-sm" onclick="removeOptionField(this)">Eliminar</button>
    `;
    container.appendChild(div);
}

function addOrderingOptionField(value = '') {
    const container = document.getElementById('ordering-options-container');
    const index = container.children.length;
    const div = document.createElement('div');
    div.className = 'form-group ordering-option-group';
    div.innerHTML = `
        <label for="ordering-option-${index}">Elemento ${index + 1}</label>
        <input type="text" id="ordering-option-${index}" class="ordering-option-input" value="${value}" placeholder="Elemento ${index + 1}" required>
        <button type="button" class="btn btn-danger btn-sm" onclick="removeOptionField(this)">Eliminar</button>
    `;
    container.appendChild(div);
}

function removeOptionField(button) {
    button.closest('.form-group').remove();
}


async function handleTrialFormSubmit(event) {
    event.preventDefault();
    if (!currentEditingLocation) {
        showAlert('Primero selecciona una localización.', 'error');
        return;
    }

    const name = document.getElementById('trial-name').value;
    const narrative = document.getElementById('trial-narrative').value;
    const imageUrl = document.getElementById('trial-image-url').value;
    const audioUrl = document.getElementById('trial-audio-url').value;
    const hintCount = parseInt(document.getElementById('trial-hint-count').value);
    const hintCost = parseInt(document.getElementById('trial-hint-cost').value);
    const type = document.getElementById('trial-type').value;

    let config = {};
    switch (type) {
        case 'text':
            config = {
                question: document.getElementById('text-question').value,
                answer_type: document.getElementById('text-answer-type').value,
                correct_answer: document.getElementById('text-correct-answer').value
            };
            break;
        case 'qr':
            config = {
                qr_content: document.getElementById('qr-content').value
            };
            break;
        case 'gps':
            config = {
                gps_latitude: parseFloat(document.getElementById('gps-latitude').value),
                gps_longitude: parseFloat(document.getElementById('gps-longitude').value),
                gps_tolerance: parseInt(document.getElementById('gps-tolerance').value)
            };
            // Basic validation for GPS coordinates
            if (isNaN(config.gps_latitude) || isNaN(config.gps_longitude)) {
                showAlert('Las coordenadas GPS no son válidas.', 'error');
                return;
            }
            break;
        case 'multiple_choice':
            const mcOptions = Array.from(document.querySelectorAll('.mc-option-input')).map(input => input.value);
            config = {
                question: document.getElementById('mc-question').value,
                options: mcOptions,
                correct_answer_index: parseInt(document.getElementById('mc-correct-answer-index').value)
            };
            if (mcOptions.length === 0 || config.correct_answer_index >= mcOptions.length || config.correct_answer_index < 0) {
                showAlert('Configuración de opción múltiple inválida. Asegúrate de tener opciones y un índice correcto.', 'error');
                return;
            }
            break;
        case 'ordering':
            const orderingItems = Array.from(document.querySelectorAll('.ordering-option-input')).map(input => input.value);
            config = {
                correct_order: orderingItems
            };
            if (orderingItems.length < 2) {
                showAlert('Las pruebas de ordenación requieren al menos 2 elementos.', 'error');
                return;
            }
            break;
        default:
            showAlert('Tipo de prueba no válido.', 'error');
            return;
    }

    const trialData = {
        location_id: currentEditingLocation.id,
        name,
        narrative,
        image_url: imageUrl || null,
        audio_url: audioUrl || null,
        hint_count: hintCount,
        hint_cost: hintCost,
        type,
        config: config,
        order_in_location: 0 // Will be updated by DB trigger or manually
    };

    let error = null;
    if (currentEditingTrial) {
        const { error: updateError } = await supabase.from('trials').update(trialData).eq('id', currentEditingTrial.id);
        error = updateError;
    } else {
        const { error: insertError } = await supabase.from('trials').insert(trialData);
        error = insertError;
    }

    if (error) {
        showAlert('Error guardando prueba: ' + error.message, 'error');
        console.error('Error saving trial:', error);
    } else {
        showAlert('Prueba guardada exitosamente.', 'success');
        loadTrials(currentEditingLocation.id);
    }
}

async function editTrial(trialId) {
    const { data, error } = await supabase.from('trials').select('*').eq('id', trialId).single();
    if (error) {
        showAlert('Error cargando prueba para editar: ' + error.message, 'error');
        console.error('Error loading trial for edit:', error);
        return;
    }
    currentEditingTrial = data;
    showTrialForm();
}

async function deleteTrial(trialId) {
    if (!confirm('¿Estás seguro de que quieres eliminar esta prueba? Esta acción es irreversible.')) {
        return;
    }
    const { error } = await supabase.from('trials').delete().eq('id', trialId);
    if (error) {
        showAlert('Error eliminando prueba: ' + error.message, 'error');
        console.error('Error deleting trial:', error);
    } else {
        showAlert('Prueba eliminada exitosamente.', 'success');
        loadTrials(currentEditingLocation.id);
    }
}

// --- Funciones para Mapas (Leaflet) ---

function initAdminMap(lat = 40.416775, lon = -3.703790) { // Default to Madrid
    if (adminMap) {
        adminMap.remove(); // Remove existing map instance
    }
    adminMap = L.map('admin-map').setView([lat, lon], 13);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    }).addTo(adminMap);

    adminMap.on('click', function(e) {
        if (adminMapMarker) {
            adminMap.removeLayer(adminMapMarker);
        }
        adminMapMarker = L.marker(e.latlng).addTo(adminMap)
            .bindPopup("Ubicación de la prueba").openPopup();
        document.getElementById('gps-latitude').value = e.latlng.lat.toFixed(6);
        document.getElementById('gps-longitude').value = e.latlng.lng.toFixed(6);
    });

    if (lat && lon) {
        adminMapMarker = L.marker([lat, lon]).addTo(adminMap)
            .bindPopup("Ubicación de la prueba").openPopup();
    }
}

function getCurrentLocationForMap() {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition((position) => {
            const lat = position.coords.latitude;
            const lon = position.coords.longitude;
            document.getElementById('gps-latitude').value = lat.toFixed(6);
            document.getElementById('gps-longitude').value = lon.toFixed(6);
            if (adminMapMarker) {
                adminMap.removeLayer(adminMapMarker);
            }
            adminMapMarker = L.marker([lat, lon]).addTo(adminMap)
                .bindPopup("Tu ubicación actual").openPopup();
            adminMap.setView([lat, lon], 16);
            showAlert('Ubicación actual obtenida.', 'success');
        }, (error) => {
            console.error('Error getting current location:', error);
            showAlert('No se pudo obtener la ubicación actual. Asegúrate de dar permisos de GPS.', 'error');
        }, { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 });
    } else {
        showAlert('Tu navegador no soporta geolocalización.', 'error');
    }
}

// --- Funciones para Rankings ---
async function loadRankingGames() {
    const { data, error } = await supabase
        .from('games')
        .select('id, title')
        .order('title', { ascending: true });

    const selectElement = document.getElementById('rankings-game-select');
    selectElement.innerHTML = '<option value="">Selecciona un juego</option>';

    if (error) {
        showAlert('Error cargando juegos para rankings: ' + error.message, 'error');
        console.error('Error loading ranking games:', error);
        return;
    }

    data.forEach(game => {
        const option = document.createElement('option');
        option.value = game.id;
        option.textContent = game.title;
        selectElement.appendChild(option);
    });

    // Automatically load rankings for the first game if any
    if (data.length > 0) {
        selectElement.value = data[0].id;
        loadRankings(data[0].id);
    } else {
        document.getElementById('rankings-display').innerHTML = '<p>No hay juegos para mostrar rankings.</p>';
    }
}

async function loadRankings(gameId) {
    const rankingsDisplayDiv = document.getElementById('rankings-display');
    rankingsDisplayDiv.innerHTML = ''; // Clear previous rankings

    if (!gameId) {
        rankingsDisplayDiv.innerHTML = '<p>Por favor, selecciona un juego para ver los rankings.</p>';
        return;
    }

    const { data, error } = await supabase
        .from('rankings')
        .select(`
            *,
            teams (team_name)
        `)
        .eq('game_id', gameId)
        .order('final_score', { ascending: false }) // Higher score first
        .order('completion_time', { ascending: true }); // Then faster time

    if (error) {
        showAlert('Error cargando rankings: ' + error.message, 'error');
        console.error('Error loading rankings:', error);
        return;
    }

    if (data.length === 0) {
        rankingsDisplayDiv.innerHTML = '<p>No hay rankings para este juego aún.</p>';
        return;
    }

    data.forEach((rank, index) => {
        const rankCard = document.createElement('div');
        rankCard.className = 'card ranking-card';
        rankCard.innerHTML = `
            <h3>#${index + 1} - ${rank.teams ? rank.teams.team_name : 'Equipo Desconocido'}</h3>
            <p>Puntuación Final: <span>${rank.final_score}</span></p>
            <p>Tiempo de Completado: <span>${formatTime(rank.completion_time)}</span></p>
            <p>Fecha: <span>${new Date(rank.completion_date).toLocaleDateString()}</span></p>
        `;
        rankingsDisplayDiv.appendChild(rankCard);
    });
}

// Utility function (can be moved to utils.js)
function formatTime(seconds) {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    const pad = (num) => num < 10 ? '0' + num : num;
    return `${pad(minutes)}:${pad(remainingSeconds)}`;
}