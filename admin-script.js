// admin-script.js

// Estado global del Admin
let current_game_id = null;
let current_game_name = null;
let current_game_adventure_type = null;
let current_location_id = null;
let current_location_name = null;
let current_location_is_selectable_trials = null;
let all_locations_for_current_game = []; // Nuevo array para guardar todas las ubicaciones

// Variables para el mapa de ubicaciones
let locationMap = null;
let locationMapMarker = null;

// Elementos del DOM para la navegación y formularios
const gameListSection = document.getElementById('game-list-section');
const gameFormSection = document.getElementById('game-form-section');
const locationListSection = document.getElementById('location-list-section');
const locationFormSection = document.getElementById('location-form-section');
const trialListSection = document.getElementById('trial-list-section');
const trialFormSection = document.getElementById('trial-form-section');
const rankingsSummary = document.getElementById('rankings-summary');

// Botones de navegación
const createGameBtn = document.getElementById('create-game-btn');
const cancelGameBtn = document.getElementById('cancel-game-btn');
const backToGamesBtn = document.getElementById('back-to-games-btn');

const addLocationBtn = document.getElementById('add-location-btn');
const cancelLocationBtn = document.getElementById('cancel-location-btn');
const backToLocationsBtn = document.getElementById('back-to-locations-btn');

const getCurrentLocationBtn = document.getElementById('get-current-location-btn');

const addTrialBtn = document.getElementById('add-trial-btn');
const cancelTrialBtn = document.getElementById('cancel-trial-btn');

// Formularios e inputs
const gameForm = document.getElementById('game-form');
const locationForm = document.getElementById('location-form');
const trialForm = document.getElementById('trial-form');

const trialTypeInput = document.getElementById('trial-type');
const trialSpecificFields = document.querySelectorAll('.trial-specific-fields');
const singleNumericAnswerFields = document.getElementById('single-numeric-answer-fields');
const multiOrderingAnswerFields = document.getElementById('multi-ordering-answer-fields');

const trialOptionsTextarea = document.getElementById('text-options');
const multiPathFields = document.getElementById('multi-path-fields');
const multiPathListDiv = document.getElementById('multi-path-list');
const multiPathHelpText = document.querySelector('#multi-path-fields .help-text');

// Funciones de navegación
function showSection(section) {
    document.querySelectorAll('.admin-section').forEach(s => s.classList.add('hidden'));
    section.classList.remove('hidden');
}

function resetForm(form) {
    form.reset();
    form.querySelector('input[type="hidden"]').value = '';
    // Ocultar campos específicos de prueba al resetear
    trialSpecificFields.forEach(f => f.classList.add('hidden'));
}

// ----------------------------------------------------
// Lógica de Juegos
// ----------------------------------------------------
async function viewGames() {
    showSection(gameListSection);
    const gameListDiv = document.getElementById('game-list');
    gameListDiv.innerHTML = '<p>Cargando juegos...</p>';
    try {
        const { data, error } = await supabase
            .from('games')
            .select('*')
            .order('created_at', { ascending: false });

        if (error) throw error;
        renderGameList(data);
    } catch (err) {
        console.error('Error cargando juegos:', err.message);
        gameListDiv.innerHTML = '<p class="error">Error al cargar los juegos.</p>';
    }
}

function renderGameList(games) {
    const gameListDiv = document.getElementById('game-list');
    gameListDiv.innerHTML = '';
    if (games.length === 0) {
        gameListDiv.innerHTML = '<p>No hay juegos creados aún.</p>';
        return;
    }
    games.forEach(game => {
        const gameItem = document.createElement('div');
        gameItem.className = 'item-card';
        gameItem.innerHTML = `
            <h3>${game.title}</h3>
            <p>${game.adventure_type === 'linear' ? 'Aventura Lineal' : 'Aventura Seleccionable'}</p>
            <div class="item-actions">
                <button class="edit-button" data-id="${game.id}">Editar</button>
                <button class="view-locations-button" data-id="${game.id}" data-name="${game.title}" data-type="${game.adventure_type}">Ver Ubicaciones</button>
                <button class="delete-button" data-id="${game.id}">Eliminar</button>
            </div>
        `;
        gameListDiv.appendChild(gameItem);
    });
}

async function saveGame() {
    const gameId = document.getElementById('game-id').value;
    const title = document.getElementById('game-title').value;
    const description = document.getElementById('game-description').value;
    const mechanics = document.getElementById('game-mechanics').value;
    const initialNarrative = document.getElementById('game-initial-narrative').value;
    const imageUrl = document.getElementById('game-image-url').value;
    const audioUrl = document.getElementById('game-audio-url').value;
    const adventureType = document.getElementById('game-adventure-type').value;
    const initialScorePerTrial = parseInt(document.getElementById('game-initial-score-per-trial').value);
    const isActive = document.getElementById('game-is-active').checked;

    const gameData = {
        title,
        description,
        mechanics,
        initial_narrative: initialNarrative,
        image_url: imageUrl,
        audio_url: audioUrl,
        adventure_type: adventureType,
        initial_score_per_trial: initialScorePerTrial,
        is_active: isActive,
    };

    try {
        let result;
        if (gameId) {
            result = await supabase.from('games').update(gameData).eq('id', gameId);
        } else {
            result = await supabase.from('games').insert([gameData]);
        }

        if (result.error) throw result.error;
        showAlert('Juego guardado con éxito', 'success');
        viewGames();
    } catch (err) {
        console.error('Error al guardar el juego:', err.message);
        showAlert('Error al guardar el juego.', 'error');
    }
}

// ----------------------------------------------------
// Lógica de Ubicaciones
// ----------------------------------------------------
async function viewLocations(gameId, gameName, adventureType) {
    current_game_id = gameId;
    current_game_name = gameName;
    current_game_adventure_type = adventureType;
    document.getElementById('current-game-name').textContent = gameName;
    document.querySelector('#location-form-section .game-name-display').textContent = ` - ${gameName}`;
    document.querySelector('#trial-list-section .game-name-display').textContent = ` - ${gameName}`;
    document.querySelector('#trial-form-section .game-name-display').textContent = ` - ${gameName}`;

    showSection(locationListSection);
    const locationListDiv = document.getElementById('location-list');
    locationListDiv.innerHTML = '<p>Cargando ubicaciones...</p>';
    try {
        const { data, error } = await supabase
            .from('locations')
            .select('*')
            .eq('game_id', gameId)
            .order('order_index', { ascending: true });

        if (error) throw error;
        all_locations_for_current_game = data; // Almacenar todas las ubicaciones
        renderLocationList(data);
    } catch (err) {
        console.error('Error cargando ubicaciones:', err.message);
        locationListDiv.innerHTML = '<p class="error">Error al cargar las ubicaciones.</p>';
    }
}

function renderLocationList(locations) {
    const locationListDiv = document.getElementById('location-list');
    locationListDiv.innerHTML = '';
    if (locations.length === 0) {
        locationListDiv.innerHTML = '<p>No hay ubicaciones creadas para este juego.</p>';
        return;
    }
    locations.forEach(location => {
        const locationItem = document.createElement('div');
        locationItem.className = 'item-card';
        locationItem.innerHTML = `
            <h3>${location.order_index}. ${location.name}</h3>
            <p>Lat: ${location.latitude.toFixed(4)}, Lon: ${location.longitude.toFixed(4)}</p>
            <div class="item-actions">
                <button class="edit-button" data-id="${location.id}">Editar</button>
                <button class="view-trials-button" data-id="${location.id}" data-name="${location.name}" data-is-selectable="${location.is_selectable_trials}">Ver Pruebas</button>
                <button class="delete-button" data-id="${location.id}">Eliminar</button>
            </div>
        `;
        locationListDiv.appendChild(locationItem);
    });
}

async function saveLocation() {
    const locationId = document.getElementById('location-id').value;
    const gameId = current_game_id;
    const name = document.getElementById('location-name').value;
    const orderIndex = parseInt(document.getElementById('location-order-index').value);
    const initialNarrative = document.getElementById('location-initial-narrative').value;
    const imageUrl = document.getElementById('location-image-url').value;
    const audioUrl = document.getElementById('location-audio-url').value;
    const preArrivalNarrative = document.getElementById('pre-arrival-narrative').value;
    const isSelectableTrials = document.getElementById('location-is-selectable-trials').checked;
    const latitude = parseFloat(document.getElementById('location-latitude').value);
    const longitude = parseFloat(document.getElementById('location-longitude').value);
    const tolerance = parseInt(document.getElementById('location-tolerance').value);

    const locationData = {
        game_id: gameId,
        name,
        order_index: orderIndex,
        initial_narrative: initialNarrative,
        image_url: imageUrl,
        audio_url: audioUrl,
        pre_arrival_narrative: preArrivalNarrative,
        is_selectable_trials: isSelectableTrials,
        latitude,
        longitude,
        tolerance
    };

    try {
        let result;
        if (locationId) {
            result = await supabase.from('locations').update(locationData).eq('id', locationId);
        } else {
            result = await supabase.from('locations').insert([locationData]);
        }

        if (result.error) throw result.error;
        showAlert('Ubicación guardada con éxito', 'success');
        viewLocations(current_game_id, current_game_name, current_game_adventure_type);
    } catch (err) {
        console.error('Error al guardar la ubicación:', err.message);
        showAlert('Error al guardar la ubicación.', 'error');
    }
}

function initLocationMap(lat = 40.416775, lon = -3.703790) {
    if (locationMap) {
        locationMap.remove();
    }
    locationMap = L.map('location-map').setView([lat, lon], 13);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    }).addTo(locationMap);

    locationMapMarker = L.marker([lat, lon]).addTo(locationMap);

    locationMap.on('click', function(e) {
        const { lat, lng } = e.latlng;
        document.getElementById('location-latitude').value = lat.toFixed(6);
        document.getElementById('location-longitude').value = lng.toFixed(6);
        locationMapMarker.setLatLng([lat, lng]);
    });
}

function getCurrentLocation() {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition((position) => {
            const { latitude, longitude } = position.coords;
            initLocationMap(latitude, longitude);
            document.getElementById('location-latitude').value = latitude.toFixed(6);
            document.getElementById('location-longitude').value = longitude.toFixed(6);
        }, (error) => {
            console.error("Error al obtener la ubicación:", error);
            showAlert("No se pudo obtener la ubicación actual. Por favor, introduce las coordenadas manualmente.", 'warning');
        });
    } else {
        showAlert("La geolocalización no es compatible con este navegador.", 'error');
    }
}

// ----------------------------------------------------
// Lógica de Pruebas
// ----------------------------------------------------
async function viewTrials(locationId, locationName, isSelectableTrials) {
    current_location_id = locationId;
    current_location_name = locationName;
    current_location_is_selectable_trials = isSelectableTrials;
    document.getElementById('current-location-name').textContent = locationName;
    document.querySelector('#trial-form-section h2 #current-location-name').textContent = ` | ${locationName}`;

    showSection(trialListSection);
    const trialListDiv = document.getElementById('trial-list');
    trialListDiv.innerHTML = '<p>Cargando pruebas...</p>';
    try {
        const { data, error } = await supabase
            .from('trials')
            .select('*')
            .eq('location_id', locationId)
            .order('order_index', { ascending: true });

        if (error) throw error;
        renderTrialList(data);
    } catch (err) {
        console.error('Error cargando pruebas:', err.message);
        trialListDiv.innerHTML = '<p class="error">Error al cargar las pruebas.</p>';
    }
}

function renderTrialList(trials) {
    const trialListDiv = document.getElementById('trial-list');
    trialListDiv.innerHTML = '';
    if (trials.length === 0) {
        trialListDiv.innerHTML = '<p>No hay pruebas creadas para esta ubicación.</p>';
        return;
    }
    trials.forEach(trial => {
        const trialItem = document.createElement('div');
        trialItem.className = 'item-card';
        trialItem.innerHTML = `
            <h3>${trial.order_index}. ${trial.name}</h3>
            <p>Tipo: ${trial.type}</p>
            <div class="item-actions">
                <button class="edit-button" data-id="${trial.id}">Editar</button>
                <button class="delete-button" data-id="${trial.id}">Eliminar</button>
            </div>
        `;
        trialListDiv.appendChild(trialItem);
    });
}

function showTrialSpecificFields() {
    trialSpecificFields.forEach(f => f.classList.add('hidden'));
    const trialType = trialTypeInput.value;
    switch (trialType) {
        case 'text':
            document.getElementById('text-fields').classList.remove('hidden');
            showTextAnswerTypeFields();
            break;
        case 'qr':
            document.getElementById('qr-fields').classList.remove('hidden');
            break;
        case 'gps':
            document.getElementById('gps-fields').classList.remove('hidden');
            break;
    }
}

function showTextAnswerTypeFields() {
    singleNumericAnswerFields.classList.add('hidden');
    multiOrderingAnswerFields.classList.add('hidden');
    multiPathFields.classList.add('hidden');
    const answerType = document.getElementById('text-answer-type').value;

    switch (answerType) {
        case 'single_choice':
        case 'numeric':
            singleNumericAnswerFields.classList.remove('hidden');
            break;
        case 'multiple_options':
        case 'ordering':
            multiOrderingAnswerFields.classList.remove('hidden');
            multiPathFields.classList.remove('hidden');
            renderMultiPathFields();
            break;
    }
}

function renderMultiPathFields() {
    const optionsText = trialOptionsTextarea.value;
    const options = optionsText.split(';').map(o => o.trim()).filter(o => o);
    multiPathListDiv.innerHTML = '';
    if (options.length === 0) {
        multiPathHelpText.textContent = "Introduce las opciones para generar los campos de ruta.";
        return;
    }

    multiPathHelpText.textContent = "Define la ubicación a la que se moverá el jugador dependiendo de la opción elegida.";

    const nextLocationOptions = all_locations_for_current_game
        .filter(loc => loc.id !== current_location_id)
        .map(loc => `<option value="${loc.id}">${loc.order_index}. ${loc.name}</option>`)
        .join('');
    
    // Añadir una opción predeterminada para el destino de la respuesta correcta
    const defaultCorrectAnswerOption = `<option value="">(Ubicación de la siguiente prueba)</option>`;
    const fullNextLocationOptions = defaultCorrectAnswerOption + nextLocationOptions;


    options.forEach((option, index) => {
        const div = document.createElement('div');
        div.className = 'multi-path-item';
        div.innerHTML = `
            <label for="path-option-${index}">Si la respuesta es <strong>"${option}"</strong>, ir a:</label>
            <select id="path-option-${index}" class="path-option-select">
                ${fullNextLocationOptions}
            </select>
        `;
        multiPathListDiv.appendChild(div);
    });
}


async function saveTrial() {
    const trialId = document.getElementById('trial-id').value;
    const locationId = current_location_id;
    const name = document.getElementById('trial-name').value;
    const type = document.getElementById('trial-type').value;
    const orderIndex = parseInt(document.getElementById('trial-order-index').value);
    const narrative = document.getElementById('trial-narrative').value;
    const imageUrl = document.getElementById('trial-image-url').value;
    const audioUrl = document.getElementById('trial-audio-url').value;
    const hintCount = parseInt(document.getElementById('trial-hint-count').value);
    const hint1 = document.getElementById('hint1').value;
    const hint2 = document.getElementById('hint2').value;
    const hint3 = document.getElementById('hint3').value;
    const hintCost = parseInt(document.getElementById('trial-hint-cost').value);

    let trialData = {
        location_id: locationId,
        name,
        type,
        order_index: orderIndex,
        narrative,
        image_url: imageUrl,
        audio_url: audioUrl,
        hint_count: hintCount,
        hints: JSON.stringify([hint1, hint2, hint3]),
        hint_cost: hintCost,
        correct_answer: null,
        options: null,
        alternative_routes: null,
    };

    switch (type) {
        case 'text':
            const textAnswerType = document.getElementById('text-answer-type').value;
            trialData.answer_type = textAnswerType;
            if (['multiple_options', 'ordering'].includes(textAnswerType)) {
                const optionsText = document.getElementById('text-options').value;
                if (!optionsText) {
                     showAlert('Las opciones no pueden estar vacías.', 'error');
                     return;
                }
                const options = optionsText.split(';').map(o => o.trim()).filter(o => o);
                trialData.options = JSON.stringify(options);
                trialData.correct_answer = document.getElementById('text-correct-answer-multi-ordering').value;
                
                // Recopilar las rutas alternativas
                const alternativeRoutes = {};
                options.forEach((option, index) => {
                    const selectElement = document.getElementById(`path-option-${index}`);
                    if (selectElement && selectElement.value) {
                        alternativeRoutes[option] = selectElement.value;
                    }
                });
                // Guardar como JSON string solo si hay rutas alternativas
                if (Object.keys(alternativeRoutes).length > 0) {
                    trialData.alternative_routes = JSON.stringify(alternativeRoutes);
                }

            } else {
                trialData.correct_answer = document.getElementById('text-correct-answer-single-numeric').value;
            }
            break;
        case 'qr':
            trialData.correct_answer = document.getElementById('qr-content').value;
            break;
        case 'gps':
            trialData.latitude = parseFloat(document.getElementById('gps-latitude').value);
            trialData.longitude = parseFloat(document.getElementById('gps-longitude').value);
            trialData.tolerance = parseInt(document.getElementById('gps-tolerance').value);
            break;
    }

    try {
        let result;
        if (trialId) {
            result = await supabase.from('trials').update(trialData).eq('id', trialId);
        } else {
            result = await supabase.from('trials').insert([trialData]);
        }

        if (result.error) throw result.error;
        showAlert('Prueba guardada con éxito', 'success');
        viewTrials(current_location_id, current_location_name, current_location_is_selectable_trials);
    } catch (err) {
        console.error('Error al guardar la prueba:', err.message);
        showAlert('Error al guardar la prueba.', 'error');
    }
}

// ----------------------------------------------------
// Lógica de Supabase
// ----------------------------------------------------
document.addEventListener('DOMContentLoaded', () => {
    // Escuchadores de eventos para la navegación
    gameForm.addEventListener('submit', (e) => {
        e.preventDefault();
        saveGame();
    });
    locationForm.addEventListener('submit', (e) => {
        e.preventDefault();
        saveLocation();
    });
    trialForm.addEventListener('submit', (e) => {
        e.preventDefault();
        saveTrial();
    });

    createGameBtn.addEventListener('click', () => {
        resetForm(gameForm);
        document.getElementById('form-title').textContent = 'Crear Nuevo Juego';
        showSection(gameFormSection);
    });
    cancelGameBtn.addEventListener('click', () => {
        resetForm(gameForm);
        showSection(gameListSection);
    });
    backToGamesBtn.addEventListener('click', () => {
        current_game_id = null;
        current_game_name = null;
        current_game_adventure_type = null;
        showSection(gameListSection);
        viewGames();
    });

    addLocationBtn.addEventListener('click', () => {
        resetForm(locationForm);
        document.getElementById('location-form-title').textContent = 'Crear Nueva Ubicación';
        showSection(locationFormSection);
        initLocationMap();
    });
    cancelLocationBtn.addEventListener('click', () => {
        resetForm(locationForm);
        showSection(locationListSection);
    });
    backToLocationsBtn.addEventListener('click', () => {
        current_location_id = null;
        current_location_name = null;
        current_location_is_selectable_trials = null;
        showSection(locationListSection);
        viewLocations(current_game_id, current_game_name, current_game_adventure_type);
    });

    getCurrentLocationBtn.addEventListener('click', getCurrentLocation);

    addTrialBtn.addEventListener('click', () => {
        resetForm(trialForm);
        document.getElementById('trial-form-title').textContent = 'Crear Nueva Prueba';
        showSection(trialFormSection);
        showTrialSpecificFields();
    });
    cancelTrialBtn.addEventListener('click', () => {
        resetForm(trialForm);
        showSection(trialListSection);
    });

    // Delegación de eventos para botones dinámicos
    gameListSection.addEventListener('click', (e) => {
        if (e.target.classList.contains('view-locations-button')) {
            const { id, name, type } = e.target.dataset;
            viewLocations(id, name, type);
        } else if (e.target.classList.contains('edit-button')) {
            const gameId = e.target.dataset.id;
            editGame(gameId);
        } else if (e.target.classList.contains('delete-button')) {
            const gameId = e.target.dataset.id;
            deleteGame(gameId);
        }
    });

    locationListSection.addEventListener('click', (e) => {
        if (e.target.classList.contains('view-trials-button')) {
            const { id, name, isSelectable } = e.target.dataset;
            viewTrials(id, name, isSelectable === 'true');
        } else if (e.target.classList.contains('edit-button')) {
            const locationId = e.target.dataset.id;
            editLocation(locationId);
        } else if (e.target.classList.contains('delete-button')) {
            const locationId = e.target.dataset.id;
            deleteLocation(locationId);
        }
    });

    trialListSection.addEventListener('click', (e) => {
        if (e.target.classList.contains('edit-button')) {
            const trialId = e.target.dataset.id;
            editTrial(trialId);
        } else if (e.target.classList.contains('delete-button')) {
            const trialId = e.target.dataset.id;
            deleteTrial(trialId);
        }
    });

    // Escuchadores de eventos para campos de formulario de prueba
    trialTypeInput.addEventListener('change', showTrialSpecificFields);
    document.getElementById('text-answer-type').addEventListener('change', showTextAnswerTypeFields);
    trialOptionsTextarea.addEventListener('input', renderMultiPathFields);

    // Funciones de edición
    async function editGame(gameId) {
        try {
            const { data, error } = await supabase
                .from('games')
                .select('*')
                .eq('id', gameId)
                .single();
            if (error) throw error;
            document.getElementById('form-title').textContent = 'Editar Juego';
            document.getElementById('game-id').value = data.id;
            document.getElementById('game-title').value = data.title;
            document.getElementById('game-description').value = data.description;
            document.getElementById('game-mechanics').value = data.mechanics;
            document.getElementById('game-initial-narrative').value = data.initial_narrative;
            document.getElementById('game-image-url').value = data.image_url;
            document.getElementById('game-audio-url').value = data.audio_url;
            document.getElementById('game-adventure-type').value = data.adventure_type;
            document.getElementById('game-initial-score-per-trial').value = data.initial_score_per_trial;
            document.getElementById('game-is-active').checked = data.is_active;
            showSection(gameFormSection);
        } catch (err) {
            console.error('Error al cargar juego para editar:', err.message);
            showAlert('Error al cargar el juego.', 'error');
        }
    }

    async function editLocation(locationId) {
        try {
            const { data, error } = await supabase
                .from('locations')
                .select('*')
                .eq('id', locationId)
                .single();
            if (error) throw error;
            document.getElementById('location-form-title').textContent = 'Editar Ubicación';
            document.getElementById('location-id').value = data.id;
            document.getElementById('current-game-id-location').value = data.game_id;
            document.getElementById('location-name').value = data.name;
            document.getElementById('location-order-index').value = data.order_index;
            document.getElementById('location-initial-narrative').value = data.initial_narrative;
            document.getElementById('location-image-url').value = data.image_url;
            document.getElementById('location-audio-url').value = data.audio_url;
            document.getElementById('pre-arrival-narrative').value = data.pre_arrival_narrative;
            document.getElementById('location-is-selectable-trials').checked = data.is_selectable_trials;
            document.getElementById('location-latitude').value = data.latitude;
            document.getElementById('location-longitude').value = data.longitude;
            document.getElementById('location-tolerance').value = data.tolerance;
            showSection(locationFormSection);
            initLocationMap(data.latitude, data.longitude);
        } catch (err) {
            console.error('Error al cargar ubicación para editar:', err.message);
            showAlert('Error al cargar la ubicación.', 'error');
        }
    }

    async function editTrial(trialId) {
        try {
            const { data, error } = await supabase
                .from('trials')
                .select('*')
                .eq('id', trialId)
                .single();
            if (error) throw error;
            document.getElementById('trial-form-title').textContent = 'Editar Prueba';
            document.getElementById('trial-id').value = data.id;
            document.getElementById('current-location-id-trial').value = data.location_id;
            document.getElementById('trial-name').value = data.name;
            document.getElementById('trial-type').value = data.type;
            document.getElementById('trial-order-index').value = data.order_index;
            document.getElementById('trial-narrative').value = data.narrative;
            document.getElementById('trial-image-url').value = data.image_url;
            document.getElementById('trial-audio-url').value = data.audio_url;
            document.getElementById('trial-hint-count').value = data.hint_count;
            const hints = JSON.parse(data.hints);
            if (hints) {
                document.getElementById('hint1').value = hints[0] || '';
                document.getElementById('hint2').value = hints[1] || '';
                document.getElementById('hint3').value = hints[2] || '';
            }
            document.getElementById('trial-hint-cost').value = data.hint_cost;
            
            showTrialSpecificFields();

            // Rellenar campos específicos del tipo de prueba
            switch (data.type) {
                case 'text':
                    document.getElementById('text-answer-type').value = data.answer_type;
                    showTextAnswerTypeFields();
                    if (['multiple_options', 'ordering'].includes(data.answer_type)) {
                        document.getElementById('text-options').value = data.options.join(';');
                        document.getElementById('text-correct-answer-multi-ordering').value = data.correct_answer;
                        renderMultiPathFields();
                        // Rellenar las rutas alternativas
                        if (data.alternative_routes) {
                            const alternativeRoutes = JSON.parse(data.alternative_routes);
                            const options = JSON.parse(data.options);
                            options.forEach((option, index) => {
                                const selectElement = document.getElementById(`path-option-${index}`);
                                if (selectElement) {
                                    selectElement.value = alternativeRoutes[option] || '';
                                }
                            });
                        }
                    } else {
                        document.getElementById('text-correct-answer-single-numeric').value = data.correct_answer;
                    }
                    break;
                case 'qr':
                    document.getElementById('qr-content').value = data.correct_answer;
                    break;
                case 'gps':
                    document.getElementById('gps-latitude').value = data.latitude;
                    document.getElementById('gps-longitude').value = data.longitude;
                    document.getElementById('gps-tolerance').value = data.tolerance;
                    break;
            }

            showSection(trialFormSection);
        } catch (err) {
            console.error('Error al cargar prueba para editar:', err.message);
            showAlert('Error al cargar la prueba.', 'error');
        }
    }


    // Funciones de eliminación
    async function deleteGame(gameId) {
        if (confirm('¿Estás seguro de que quieres eliminar este juego y todas sus ubicaciones y pruebas?')) {
            try {
                const { error } = await supabase.from('games').delete().eq('id', gameId);
                if (error) throw error;
                showAlert('Juego eliminado con éxito.', 'success');
                viewGames();
            } catch (err) {
                console.error('Error al eliminar juego:', err.message);
                showAlert('Error al eliminar el juego.', 'error');
            }
        }
    }

    async function deleteLocation(locationId) {
        if (confirm('¿Estás seguro de que quieres eliminar esta ubicación y todas sus pruebas?')) {
            try {
                const { error } = await supabase.from('locations').delete().eq('id', locationId);
                if (error) throw error;
                showAlert('Ubicación eliminada con éxito.', 'success');
                viewLocations(current_game_id, current_game_name, current_game_adventure_type);
            } catch (err) {
                console.error('Error al eliminar ubicación:', err.message);
                showAlert('Error al eliminar la ubicación.', 'error');
            }
        }
    }

    async function deleteTrial(trialId) {
        if (confirm('¿Estás seguro de que quieres eliminar esta prueba?')) {
            try {
                const { error } = await supabase.from('trials').delete().eq('id', trialId);
                if (error) throw error;
                showAlert('Prueba eliminada con éxito.', 'success');
                viewTrials(current_location_id, current_location_name, current_location_is_selectable_trials);
            } catch (err) {
                console.error('Error al eliminar prueba:', err.message);
                showAlert('Error al eliminar la prueba.', 'error');
            }
        }
    }

    // Inicialización
    viewGames();
});

// Función de utilidad para mostrar alertas (copia de shared/utils.js para evitar complejidad de módulos)
function showAlert(message, type = 'info') {
    let alertDiv = document.getElementById('app-alert');
    if (!alertDiv) {
        alertDiv = document.createElement('div');
        alertDiv.id = 'app-alert';
        document.body.appendChild(alertDiv);
    }

    alertDiv.textContent = message;
    alertDiv.className = `app-alert ${type}`;
    alertDiv.style.display = 'block';

    setTimeout(() => {
        alertDiv.style.display = 'none';
    }, 3000);
}
