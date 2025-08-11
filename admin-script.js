// admin-script.js

// Estado global del Admin
let current_game_id = null;
let current_game_name = null;
let current_game_adventure_type = null;
let current_location_id = null;
let current_location_name = null;
let current_location_is_selectable_trials = null;

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
const previewGameBtn = document.getElementById('preview-game-btn');

const addLocationBtn = document.getElementById('add-location-btn');
const cancelLocationBtn = document.getElementById('cancel-location-btn');
const backToLocationsBtn = document.getElementById('back-to-locations-btn');

const addTrialBtn = document.getElementById('add-trial-btn');
const cancelTrialBtn = document.getElementById('cancel-trial-btn');

// Formularios
const gameForm = document.getElementById('game-form');
const locationForm = document.getElementById('location-form');
const trialForm = document.getElementById('trial-form');

// Inputs de los formularios (Game)
const gameIdInput = document.getElementById('game-id');
const gameTitleInput = document.getElementById('game-title');
const gameDescriptionInput = document.getElementById('game-description');
const gameMechanicsInput = document.getElementById('game-mechanics');
const gameInitialNarrativeInput = document.getElementById('game-initial-narrative');
const gameImageUrlInput = document.getElementById('game-image-url');
const gameAudioUrlInput = document.getElementById('game-audio-url');
const gameAdventureTypeInput = document.getElementById('game-adventure-type');
const gameInitialScorePerTrialInput = document.getElementById('game-initial-score-per-trial');
const gameIsActiveInput = document.getElementById('game-is-active');

// Inputs de los formularios (Location)
const locationIdInput = document.getElementById('location-id');
const currentGameIdLocationInput = document.getElementById('current-game-id-location');
const locationNameInput = document.getElementById('location-name');
const locationOrderIndexInput = document.getElementById('location-order-index');
const preArrivalNarrativeInput = document.getElementById('pre-arrival-narrative');
const locationInitialNarrativeInput = document.getElementById('location-initial-narrative');
const locationImageUrlInput = document.getElementById('location-image-url');
const locationAudioUrlInput = document.getElementById('location-audio-url');
const locationIsSelectableTrialsInput = document.getElementById('location-is-selectable-trials');
const locationLatitudeInput = document.getElementById('location-latitude');
const locationLongitudeInput = document.getElementById('location-longitude');
const locationToleranceInput = document.getElementById('location-tolerance');
const getCurrentLocationBtn = document.getElementById('get-current-location-btn');


// Inputs de los formularios (Trial)
const trialIdInput = document.getElementById('trial-id');
const currentLocationIdTrialInput = document.getElementById('current-location-id-trial');
const trialNameInput = document.getElementById('trial-name');
const trialTypeInput = document.getElementById('trial-type');
const trialOrderIndexInput = document.getElementById('trial-order-index');
const trialNarrativeInput = document.getElementById('trial-narrative');
const trialImageUrlInput = document.getElementById('trial-image-url');
const trialAudioUrlInput = document.getElementById('trial-audio-url');
const trialHintCountInput = document.getElementById('trial-hint-count');
const trialHintCostInput = document.getElementById('trial-hint-cost');

// Campos específicos de prueba
const hint1Input = document.getElementById('hint1');
const hint2Input = document.getElementById('hint2');
const hint3Input = document.getElementById('hint3');
const qrFields = document.getElementById('qr-fields');
const qrContentInput = document.getElementById('qr-content');
const gpsFields = document.getElementById('gps-fields');
const gpsLatitudeInput = document.getElementById('gps-latitude');
const gpsLongitudeInput = document.getElementById('gps-longitude');
const gpsToleranceInput = document.getElementById('gps-tolerance');
const textFields = document.getElementById('text-fields');
const textQuestionInput = document.getElementById('text-question');
const textAnswerTypeInput = document.getElementById('text-answer-type');
const singleNumericAnswerFields = document.getElementById('single-numeric-answer-fields');
const textCorrectAnswerSingleNumericInput = document.getElementById('text-correct-answer-single-numeric');
const multiOrderingAnswerFields = document.getElementById('multi-ordering-answer-fields');
const textOptionsInput = document.getElementById('text-options');
const textCorrectAnswerMultiOrderingInput = document.getElementById('text-correct-answer-multi-ordering');
// NUEVOS ELEMENTOS PARA CAMINOS ALTERNATIVOS
const multipleOptionsPaths = document.getElementById('multiple-options-paths');
const optionPathsContainer = document.getElementById('option-paths-container');


// Contenedores de listas
const gameListDiv = document.getElementById('game-list');
const locationListDiv = document.getElementById('location-list');
const trialListDiv = document.getElementById('trial-list');
const rankingsContainer = document.getElementById('rankings-container');

// Otros elementos de texto
const formTitle = document.getElementById('form-title');
const gameNameDisplay = document.querySelector('.game-name-display');
const currentGameNameSpan = document.getElementById('current-game-name');
const currentLocationNameSpan = document.getElementById('current-location-name');
const trialFormTitle = document.getElementById('trial-form-title');

// --- Funciones de navegación y UI ---

function showSection(sectionToShow) {
    const sections = [gameListSection, gameFormSection, locationListSection, locationFormSection, trialListSection, trialFormSection, rankingsSummary];
    sections.forEach(section => {
        if (section === sectionToShow) {
            section.classList.remove('hidden');
        } else {
            section.classList.add('hidden');
        }
    });

    if (sectionToShow === locationFormSection) {
        initLocationMap();
    } else {
        if (locationMap) {
            locationMap.remove();
            locationMap = null;
            locationMapMarker = null;
        }
    }
}

function showAlert(message, type) {
    const alertBox = document.getElementById('app-alert');
    alertBox.textContent = message;
    alertBox.className = `app-alert show ${type}`;
    setTimeout(() => {
        alertBox.classList.remove('show');
    }, 5000);
}

function showTrialSpecificFields() {
    qrFields.classList.add('hidden');
    gpsFields.classList.add('hidden');
    textFields.classList.add('hidden');
    singleNumericAnswerFields.classList.add('hidden');
    multiOrderingAnswerFields.classList.add('hidden');
    // NUEVO: Ocultar/mostrar campos de caminos alternativos
    multipleOptionsPaths.classList.add('hidden');

    const trialType = trialTypeInput.value;
    const answerType = textAnswerTypeInput.value;

    if (trialType === 'qr') {
        qrFields.classList.remove('hidden');
    } else if (trialType === 'gps') {
        gpsFields.classList.remove('hidden');
    } else if (trialType === 'text') {
        textFields.classList.remove('hidden');
        if (answerType === 'single_choice' || answerType === 'numeric') {
            singleNumericAnswerFields.classList.remove('hidden');
        } else if (answerType === 'multiple_options' || answerType === 'ordering') {
            multiOrderingAnswerFields.classList.remove('hidden');
            // NUEVO: Mostrar campos de caminos alternativos solo para opciones múltiples
            if (answerType === 'multiple_options') {
                multipleOptionsPaths.classList.remove('hidden');
                // Esto generará los campos dinámicamente si hay opciones
                generateOptionPathFields(textOptionsInput.value);
            }
        }
    }
}

function resetForm(form) {
    form.reset();
    const hiddenInputs = form.querySelectorAll('input[type="hidden"]');
    hiddenInputs.forEach(input => input.value = '');
    if (form === gameForm) {
        gameInitialScorePerTrialInput.value = 100;
        gameAdventureTypeInput.value = 'linear';
        gameIsActiveInput.checked = false;
        gameImageUrlInput.value = '';
        gameAudioUrlInput.value = '';
    } else if (form === locationForm) {
        locationOrderIndexInput.value = 1;
        locationIsSelectableTrialsInput.checked = false;
        locationToleranceInput.value = 10;
        preArrivalNarrativeInput.value = '';
        if (locationMapMarker) {
            locationMap.removeLayer(locationMapMarker);
            locationMapMarker = null;
        }
        locationLatitudeInput.value = '';
        locationLongitudeInput.value = '';

    } else if (form === trialForm) {
        trialNameInput.value = '';
        trialTypeInput.value = '';
        trialHintCountInput.value = 3;
        trialHintCostInput.value = 10;
        trialOrderIndexInput.value = 1;
        hint1Input.value = '';
        hint2Input.value = '';
        hint3Input.value = '';
        textAnswerTypeInput.value = 'single_choice';
        // NUEVO: Limpiar los campos de caminos alternativos al resetear
        optionPathsContainer.innerHTML = '';
        showTrialSpecificFields();
    }
}


// --- Lógica del Mapa Leaflet para Ubicaciones ---

function initLocationMap(lat = 43.535, lon = -5.661, zoom = 13) {
    if (locationMap) {
        locationMap.remove();
    }
    locationMap = L.map('location-map').setView([lat, lon], zoom);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    }).addTo(locationMap);

    locationMap.on('click', function(e) {
        updateMapMarker(e.latlng.lat, e.latlng.lng);
        locationLatitudeInput.value = e.latlng.lat.toFixed(6);
        locationLongitudeInput.value = e.latlng.lng.toFixed(6);
    });

    if (locationLatitudeInput.value && locationLongitudeInput.value) {
        updateMapMarker(parseFloat(locationLatitudeInput.value), parseFloat(locationLongitudeInput.value));
    }
}

function updateMapMarker(lat, lon) {
    if (locationMapMarker) {
        locationMapMarker.setLatLng([lat, lon]);
    } else {
        locationMapMarker = L.marker([lat, lon]).addTo(locationMap);
    }
    locationMap.setView([lat, lon], locationMap.getZoom());
}

function getCurrentLocation() {
    if (navigator.geolocation) {
        showAlert('Obteniendo tu ubicación actual...', 'info');
        navigator.geolocation.getCurrentPosition(
            (position) => {
                const lat = position.coords.latitude;
                const lon = position.coords.longitude;
                locationLatitudeInput.value = lat.toFixed(6);
                locationLongitudeInput.value = lon.toFixed(6);
                updateMapMarker(lat, lon);
                showAlert('Ubicación obtenida.', 'success');
            },
            (error) => {
                console.error("Error al obtener la ubicación:", error);
                showAlert('Error al obtener la ubicación: ' + error.message, 'error');
            },
            { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
        );
    } else {
        showAlert('Geolocalización no soportada por este navegador.', 'warning');
    }
}

// --- Lógica de Supabase y CRUD ---

async function fetchGames() {
    gameListDiv.innerHTML = '<p>Cargando juegos...</p>';
    rankingsSummary.classList.add('hidden');
    const { data: games, error } = await supabase
        .from('games')
        .select('*')
        .order('created_at', { ascending: false });

    if (error) {
        console.error('Error fetching games:', error);
        showAlert('Error al cargar los juegos: ' + error.message, 'error');
        gameListDiv.innerHTML = '<p>Error al cargar los juegos.</p>';
        return;
    }

    if (games.length === 0) {
        gameListDiv.innerHTML = '<p>No hay juegos creados aún. ¡Crea el primero!</p>';
    } else {
        gameListDiv.innerHTML = '';
        games.forEach(game => {
            const gameItem = document.createElement('div');
            gameItem.classList.add('game-item');
            gameItem.innerHTML = `
                <div class="item-content">
                    <h3>${game.title}</h3>
                    <p>Estado: ${game.is_active ? 'Activo ✅' : 'Inactivo ❌'}</p>
                    <p>Tipo: ${game.adventure_type === 'linear' ? 'Lineal' : 'Seleccionable'}</p>
                </div>
                <div class="item-actions">
                    <button class="view-button" data-id="${game.id}" data-name="${game.title}" data-type="${game.adventure_type}">Ver Ubicaciones</button>
                    <button class="edit-button" data-id="${game.id}">Editar</button>
                    <button class="delete-button" data-id="${game.id}">Eliminar</button>
                </div>
            `;
            gameListDiv.appendChild(gameItem);
        });
    }
}

async function saveGame() {
    const gameId = gameIdInput.value;
    const gameData = {
        title: gameTitleInput.value,
        description: gameDescriptionInput.value,
        mechanics: gameMechanicsInput.value,
        initial_narrative: gameInitialNarrativeInput.value,
        image_url: gameImageUrlInput.value,
        audio_url: gameAudioUrlInput.value,
        adventure_type: gameAdventureTypeInput.value,
        initial_score_per_trial: gameInitialScorePerTrialInput.value,
        is_active: gameIsActiveInput.checked
    };

    if (gameId) {
        const { error } = await supabase.from('games').update(gameData).eq('id', gameId);
        if (error) {
            console.error('Error updating game:', error);
            showAlert('Error al actualizar el juego: ' + error.message, 'error');
        } else {
            showAlert('Juego actualizado con éxito.', 'success');
            showSection(gameListSection);
            fetchGames();
        }
    } else {
        const { error } = await supabase.from('games').insert(gameData);
        if (error) {
            console.error('Error creating game:', error);
            showAlert('Error al crear el juego: ' + error.message, 'error');
        } else {
            showAlert('Juego creado con éxito.', 'success');
            showSection(gameListSection);
            fetchGames();
        }
    }
}

async function editGame(id) {
    const { data, error } = await supabase.from('games').select('*').eq('id', id).single();
    if (error) {
        console.error('Error fetching game for edit:', error);
        showAlert('Error al cargar el juego: ' + error.message, 'error');
        return;
    }
    gameIdInput.value = data.id;
    gameTitleInput.value = data.title;
    gameDescriptionInput.value = data.description;
    gameMechanicsInput.value = data.mechanics;
    gameInitialNarrativeInput.value = data.initial_narrative;
    gameImageUrlInput.value = data.image_url;
    gameAudioUrlInput.value = data.audio_url;
    gameAdventureTypeInput.value = data.adventure_type;
    gameInitialScorePerTrialInput.value = data.initial_score_per_trial;
    gameIsActiveInput.checked = data.is_active;
    document.getElementById('form-title').textContent = 'Editar Juego';
    showSection(gameFormSection);
}

async function deleteGame(id) {
    if (confirm('¿Estás seguro de que quieres eliminar este juego? También se eliminarán todas sus ubicaciones y pruebas.')) {
        const { error } = await supabase.from('games').delete().eq('id', id);
        if (error) {
            console.error('Error deleting game:', error);
            showAlert('Error al eliminar el juego: ' + error.message, 'error');
        } else {
            showAlert('Juego eliminado con éxito.', 'success');
            fetchGames();
        }
    }
}

async function viewLocations(gameId, gameName, adventureType) {
    current_game_id = gameId;
    current_game_name = gameName;
    current_game_adventure_type = adventureType;
    currentGameIdLocationInput.value = gameId;
    currentGameNameSpan.textContent = gameName;
    gameNameDisplay.textContent = ' - ' + gameName;
    document.getElementById('current-game-name-location').textContent = ' - ' + gameName;
    showSection(locationListSection);

    locationListDiv.innerHTML = '<p>Cargando ubicaciones...</p>';
    const { data: locations, error } = await supabase
        .from('locations')
        .select('*')
        .eq('game_id', gameId)
        .order('order_index', { ascending: true });

    if (error) {
        console.error('Error fetching locations:', error);
        showAlert('Error al cargar las ubicaciones: ' + error.message, 'error');
        locationListDiv.innerHTML = '<p>Error al cargar las ubicaciones.</p>';
        return;
    }

    if (locations.length === 0) {
        locationListDiv.innerHTML = '<p>No hay ubicaciones creadas aún. ¡Añade la primera!</p>';
    } else {
        locationListDiv.innerHTML = '';
        locations.forEach(location => {
            const locationItem = document.createElement('div');
            locationItem.classList.add('location-item');
            locationItem.innerHTML = `
                <div class="item-content">
                    <h3>${location.name} (${location.order_index})</h3>
                    <p>Lat: ${location.latitude}, Lon: ${location.longitude}</p>
                </div>
                <div class="item-actions">
                    <button class="view-button" data-id="${location.id}" data-name="${location.name}" data-is-selectable="${location.is_selectable_trials}">Ver Pruebas</button>
                    <button class="edit-button" data-id="${location.id}">Editar</button>
                    <button class="delete-button" data-id="${location.id}">Eliminar</button>
                </div>
            `;
            locationListDiv.appendChild(locationItem);
        });
    }
}

async function saveLocation() {
    const locationId = locationIdInput.value;
    const locationData = {
        game_id: currentGameIdLocationInput.value,
        name: locationNameInput.value,
        order_index: locationOrderIndexInput.value,
        pre_arrival_narrative: preArrivalNarrativeInput.value,
        initial_narrative: locationInitialNarrativeInput.value,
        image_url: locationImageUrlInput.value,
        audio_url: locationAudioUrlInput.value,
        is_selectable_trials: locationIsSelectableTrialsInput.checked,
        latitude: locationLatitudeInput.value,
        longitude: locationLongitudeInput.value,
        tolerance: locationToleranceInput.value
    };

    if (locationId) {
        const { error } = await supabase.from('locations').update(locationData).eq('id', locationId);
        if (error) {
            console.error('Error updating location:', error);
            showAlert('Error al actualizar la ubicación: ' + error.message, 'error');
        } else {
            showAlert('Ubicación actualizada con éxito.', 'success');
            viewLocations(current_game_id, current_game_name, current_game_adventure_type);
        }
    } else {
        const { error } = await supabase.from('locations').insert(locationData);
        if (error) {
            console.error('Error creating location:', error);
            showAlert('Error al crear la ubicación: ' + error.message, 'error');
        } else {
            showAlert('Ubicación creada con éxito.', 'success');
            viewLocations(current_game_id, current_game_name, current_game_adventure_type);
        }
    }
}

async function editLocation(id) {
    const { data, error } = await supabase.from('locations').select('*').eq('id', id).single();
    if (error) {
        console.error('Error fetching location for edit:', error);
        showAlert('Error al cargar la ubicación: ' + error.message, 'error');
        return;
    }
    locationIdInput.value = data.id;
    locationNameInput.value = data.name;
    locationOrderIndexInput.value = data.order_index;
    preArrivalNarrativeInput.value = data.pre_arrival_narrative;
    locationInitialNarrativeInput.value = data.initial_narrative;
    locationImageUrlInput.value = data.image_url;
    locationAudioUrlInput.value = data.audio_url;
    locationIsSelectableTrialsInput.checked = data.is_selectable_trials;
    locationLatitudeInput.value = data.latitude;
    locationLongitudeInput.value = data.longitude;
    locationToleranceInput.value = data.tolerance;

    document.getElementById('location-form-title').textContent = 'Editar Ubicación';
    showSection(locationFormSection);
    initLocationMap(data.latitude, data.longitude);
}

async function deleteLocation(id) {
    if (confirm('¿Estás seguro de que quieres eliminar esta ubicación? También se eliminarán todas sus pruebas.')) {
        const { error } = await supabase.from('locations').delete().eq('id', id);
        if (error) {
            console.error('Error deleting location:', error);
            showAlert('Error al eliminar la ubicación: ' + error.message, 'error');
        } else {
            showAlert('Ubicación eliminada con éxito.', 'success');
            viewLocations(current_game_id, current_game_name, current_game_adventure_type);
        }
    }
}

async function viewTrials(locationId, locationName, isSelectable) {
    current_location_id = locationId;
    current_location_name = locationName;
    current_location_is_selectable_trials = isSelectable;
    currentLocationIdTrialInput.value = locationId;
    currentLocationNameSpan.textContent = locationName;
    showSection(trialListSection);

    trialListDiv.innerHTML = '<p>Cargando pruebas...</p>';
    const { data: trials, error } = await supabase
        .from('trials')
        .select('*')
        .eq('location_id', locationId)
        .order('order_index', { ascending: true });

    if (error) {
        console.error('Error fetching trials:', error);
        showAlert('Error al cargar las pruebas: ' + error.message, 'error');
        trialListDiv.innerHTML = '<p>Error al cargar las pruebas.</p>';
        return;
    }

    if (trials.length === 0) {
        trialListDiv.innerHTML = '<p>No hay pruebas creadas aún. ¡Añade la primera!</p>';
    } else {
        trialListDiv.innerHTML = '';
        trials.forEach(trial => {
            const trialItem = document.createElement('div');
            trialItem.classList.add('trial-item');
            trialItem.innerHTML = `
                <div class="item-content">
                    <h3>${trial.name} (${trial.order_index})</h3>
                    <p>Tipo: ${trial.type}</p>
                </div>
                <div class="item-actions">
                    <button class="edit-button" data-id="${trial.id}">Editar</button>
                    <button class="delete-button" data-id="${trial.id}">Eliminar</button>
                </div>
            `;
            trialListDiv.appendChild(trialItem);
        });
    }
}

async function fetchTrialsForSelect() {
    const { data: trials, error } = await supabase
        .from('trials')
        .select('id, name, order_index, location_id')
        .eq('location_id', current_location_id)
        .order('order_index', { ascending: true });

    if (error) {
        console.error('Error fetching trials for select:', error);
        return [];
    }
    return trials;
}

async function generateOptionPathFields(optionsText, savedPaths = {}) {
    optionPathsContainer.innerHTML = '';
    if (!optionsText) return;
    
    const options = optionsText.split(';').map(o => o.trim()).filter(o => o);
    const trialsInLocation = await fetchTrialsForSelect();

    options.forEach((option, index) => {
        const div = document.createElement('div');
        div.classList.add('option-path-field');

        const label = document.createElement('label');
        label.textContent = `Siguiente prueba para la opción "${option}":`;
        
        const select = document.createElement('select');
        select.id = `option-path-${index}`;
        select.name = `option-path-${index}`;
        select.classList.add('path-select');

        // Opción por defecto
        const defaultOption = document.createElement('option');
        defaultOption.value = '';
        defaultOption.textContent = 'Ninguna (la respuesta es incorrecta)';
        select.appendChild(defaultOption);

        trialsInLocation.forEach(trial => {
            // No permitir que una prueba apunte a sí misma
            if (trial.id !== trialIdInput.value) {
                const optionElement = document.createElement('option');
                optionElement.value = trial.id;
                optionElement.textContent = `[${trial.order_index}] ${trial.name}`;
                if (savedPaths && savedPaths[option] === trial.id) {
                    optionElement.selected = true;
                }
                select.appendChild(optionElement);
            }
        });
        
        div.appendChild(label);
        div.appendChild(select);
        optionPathsContainer.appendChild(div);
    });
}

async function saveTrial() {
    const trialId = trialIdInput.value;
    const trialType = trialTypeInput.value;
    const textAnswerType = textAnswerTypeInput.value;

    let specificData = {};
    if (trialType === 'qr') {
        specificData = {
            qr_content: qrContentInput.value
        };
    } else if (trialType === 'gps') {
        specificData = {
            gps_latitude: gpsLatitudeInput.value,
            gps_longitude: gpsLongitudeInput.value,
            gps_tolerance: gpsToleranceInput.value
        };
    } else if (trialType === 'text') {
        specificData = {
            text_question: textQuestionInput.value,
            text_answer_type: textAnswerType
        };
        if (textAnswerType === 'single_choice' || textAnswerType === 'numeric') {
            specificData.text_correct_answer = textCorrectAnswerSingleNumericInput.value;
        } else if (textAnswerType === 'multiple_options') {
            specificData.text_options = textOptionsInput.value;
            // NUEVO: Recoger los caminos alternativos
            const options = textOptionsInput.value.split(';').map(o => o.trim()).filter(o => o);
            const nextTrialPaths = {};
            options.forEach((option, index) => {
                const selectElement = document.getElementById(`option-path-${index}`);
                if (selectElement && selectElement.value) {
                    nextTrialPaths[option] = selectElement.value;
                }
            });
            specificData.next_trial_paths = JSON.stringify(nextTrialPaths);
        } else if (textAnswerType === 'ordering') {
            specificData.text_options = textOptionsInput.value;
            specificData.text_correct_answer = textCorrectAnswerMultiOrderingInput.value;
        }
    }

    const trialData = {
        location_id: currentLocationIdTrialInput.value,
        name: trialNameInput.value,
        type: trialType,
        order_index: trialOrderIndexInput.value,
        narrative: trialNarrativeInput.value,
        image_url: trialImageUrlInput.value,
        audio_url: trialAudioUrlInput.value,
        hint_count: trialHintCountInput.value,
        hint_cost: trialHintCostInput.value,
        hint1: hint1Input.value,
        hint2: hint2Input.value,
        hint3: hint3Input.value,
        ...specificData
    };

    if (trialId) {
        const { error } = await supabase.from('trials').update(trialData).eq('id', trialId);
        if (error) {
            console.error('Error updating trial:', error);
            showAlert('Error al actualizar la prueba: ' + error.message, 'error');
        } else {
            showAlert('Prueba actualizada con éxito.', 'success');
            viewTrials(current_location_id, current_location_name, current_location_is_selectable_trials);
        }
    } else {
        const { error } = await supabase.from('trials').insert(trialData);
        if (error) {
            console.error('Error creating trial:', error);
            showAlert('Error al crear la prueba: ' + error.message, 'error');
        } else {
            showAlert('Prueba creada con éxito.', 'success');
            viewTrials(current_location_id, current_location_name, current_location_is_selectable_trials);
        }
    }
}

async function editTrial(id) {
    const { data, error } = await supabase.from('trials').select('*').eq('id', id).single();
    if (error) {
        console.error('Error fetching trial for edit:', error);
        showAlert('Error al cargar la prueba: ' + error.message, 'error');
        return;
    }
    trialIdInput.value = data.id;
    trialNameInput.value = data.name;
    trialTypeInput.value = data.type;
    trialOrderIndexInput.value = data.order_index;
    trialNarrativeInput.value = data.narrative;
    trialImageUrlInput.value = data.image_url;
    trialAudioUrlInput.value = data.audio_url;
    trialHintCountInput.value = data.hint_count;
    trialHintCostInput.value = data.hint_cost;
    hint1Input.value = data.hint1;
    hint2Input.value = data.hint2;
    hint3Input.value = data.hint3;

    if (data.type === 'qr') {
        qrContentInput.value = data.qr_content;
    } else if (data.type === 'gps') {
        gpsLatitudeInput.value = data.gps_latitude;
        gpsLongitudeInput.value = data.gps_longitude;
        gpsToleranceInput.value = data.gps_tolerance;
    } else if (data.type === 'text') {
        textQuestionInput.value = data.text_question;
        textAnswerTypeInput.value = data.text_answer_type;
        if (data.text_answer_type === 'single_choice' || data.text_answer_type === 'numeric') {
            textCorrectAnswerSingleNumericInput.value = data.text_correct_answer;
        } else if (data.text_answer_type === 'multiple_options' || data.text_answer_type === 'ordering') {
            textOptionsInput.value = data.text_options;
            textCorrectAnswerMultiOrderingInput.value = data.text_correct_answer;
            // NUEVO: Cargar los caminos alternativos si existen
            if (data.text_answer_type === 'multiple_options' && data.next_trial_paths) {
                const savedPaths = JSON.parse(data.next_trial_paths);
                generateOptionPathFields(data.text_options, savedPaths);
            }
        }
    }

    trialFormTitle.textContent = 'Editar Prueba';
    showTrialSpecificFields();
    showSection(trialFormSection);
}

async function deleteTrial(id) {
    if (confirm('¿Estás seguro de que quieres eliminar esta prueba?')) {
        const { error } = await supabase.from('trials').delete().eq('id', id);
        if (error) {
            console.error('Error deleting trial:', error);
            showAlert('Error al eliminar la prueba: ' + error.message, 'error');
        } else {
            showAlert('Prueba eliminada con éxito.', 'success');
            viewTrials(current_location_id, current_location_name, current_location_is_selectable_trials);
        }
    }
}

async function fetchRankings(gameId) {
    rankingsSummary.classList.remove('hidden');
    rankingsContainer.innerHTML = '<p>Cargando rankings...</p>';
    const { data: rankings, error } = await supabase
        .from('player_stats')
        .select('*')
        .eq('game_id', gameId)
        .order('final_score', { ascending: false })
        .order('time_completed', { ascending: true });
    
    if (error) {
        console.error('Error fetching rankings:', error);
        rankingsContainer.innerHTML = '<p>Error al cargar los rankings.</p>';
        return;
    }

    if (rankings.length === 0) {
        rankingsContainer.innerHTML = '<p>No hay rankings disponibles para este juego aún.</p>';
        return;
    }

    rankingsContainer.innerHTML = '';
    rankings.forEach((ranking, index) => {
        const item = document.createElement('div');
        item.classList.add('ranking-item');
        const formattedTime = ranking.time_completed ? new Date(ranking.time_completed).toLocaleString() : 'N/A';
        item.innerHTML = `
            <div class="team-info">#${index + 1} - ${ranking.team_name || 'Anónimo'}</div>
            <div class="score-time">Puntuación: ${ranking.final_score} | Tiempo: ${formattedTime}</div>
        `;
        rankingsContainer.appendChild(item);
    });
}

// --- Event Listeners ---

document.addEventListener('DOMContentLoaded', () => {
    fetchGames();
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

    // Delegación de eventos para la lista de juegos
    gameListDiv.addEventListener('click', (e) => {
        if (e.target.classList.contains('view-button')) {
            const id = e.target.dataset.id;
            const name = e.target.dataset.name;
            const type = e.target.dataset.type;
            viewLocations(id, name, type);
        } else if (e.target.classList.contains('edit-button')) {
            const id = e.target.dataset.id;
            editGame(id);
        } else if (e.target.classList.contains('delete-button')) {
            const id = e.target.dataset.id;
            deleteGame(id);
        }
    });

    // Delegación de eventos para la lista de ubicaciones
    locationListDiv.addEventListener('click', (e) => {
        if (e.target.classList.contains('view-button')) {
            const id = e.target.dataset.id;
            const name = e.target.dataset.name;
            const isSelectable = e.target.dataset.isSelectable === 'true';
            viewTrials(id, name, isSelectable);
        } else if (e.target.classList.contains('edit-button')) {
            const id = e.target.dataset.id;
            editLocation(id);
        } else if (e.target.classList.contains('delete-button')) {
            const id = e.target.dataset.id;
            deleteLocation(id);
        }
    });
    
    // Delegación de eventos para la lista de pruebas
    trialListDiv.addEventListener('click', (e) => {
        if (e.target.classList.contains('edit-button')) {
            const id = e.target.dataset.id;
            editTrial(id);
        } else if (e.target.classList.contains('delete-button')) {
            const id = e.target.dataset.id;
            deleteTrial(id);
        }
    });

    // Botones de navegación
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
        fetchGames();
    });
    previewGameBtn.addEventListener('click', () => {
        fetchRankings(current_game_id);
    });

    addLocationBtn.addEventListener('click', () => {
        resetForm(locationForm);
        document.getElementById('location-form-title').textContent = 'Crear Nueva Ubicación';
        showSection(locationFormSection);
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
        trialFormTitle.textContent = 'Crear Nueva Prueba';
        showSection(trialFormSection);
        showTrialSpecificFields();
    });
    cancelTrialBtn.addEventListener('click', () => {
        resetForm(trialForm);
        showSection(trialListSection);
    });

    trialTypeInput.addEventListener('change', showTrialSpecificFields);
    textAnswerTypeInput.addEventListener('change', showTrialSpecificFields);
    // NUEVO: Escuchar los cambios en el campo de opciones para generar dinámicamente los campos de caminos alternativos
    textOptionsInput.addEventListener('input', (e) => {
        if (textAnswerTypeInput.value === 'multiple_options') {
            generateOptionPathFields(e.target.value);
        }
    });

    // Navegación con la tecla de escape para cerrar formularios
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            if (!gameListSection.classList.contains('hidden')) {
                // Estamos en la lista de juegos, no hacer nada
            } else if (!gameFormSection.classList.contains('hidden')) {
                cancelGameBtn.click();
            } else if (!locationListSection.classList.contains('hidden')) {
                backToGamesBtn.click();
            } else if (!locationFormSection.classList.contains('hidden')) {
                cancelLocationBtn.click();
            } else if (!trialListSection.classList.contains('hidden')) {
                backToLocationsBtn.click();
            } else if (!trialFormSection.classList.contains('hidden')) {
                cancelTrialBtn.click();
            }
        }
    });
});
