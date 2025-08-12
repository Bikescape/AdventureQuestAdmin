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
const multiPathFields = document.getElementById('multi-path-fields'); // Nuevo contenedor para campos de multi-ruta
const multiPathList = document.getElementById('multi-path-list'); // Nuevo contenedor para las rutas

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

// Manejadores de eventos para los nuevos campos
textAnswerTypeInput.addEventListener('change', () => {
    showTrialSpecificFields();
    populateMultiPathOptions();
});

textOptionsInput.addEventListener('input', () => {
    // Si el tipo de respuesta es de opciones múltiples, regenera la lista de rutas
    if (textAnswerTypeInput.value === 'multiple_options') {
        populateMultiPathOptions();
    }
});


// Listener para el formulario de prueba
trialForm.addEventListener('submit', (e) => {
    e.preventDefault();
    saveTrial();
});


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

function showTrialSpecificFields() {
    qrFields.classList.add('hidden');
    gpsFields.classList.add('hidden');
    textFields.classList.add('hidden');
    singleNumericAnswerFields.classList.add('hidden');
    multiOrderingAnswerFields.classList.add('hidden');
    multiPathFields.classList.add('hidden'); // Ocultar por defecto

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
            if (answerType === 'multiple_options') {
                 multiPathFields.classList.remove('hidden'); // Mostrar si es de opción múltiple
                 populateMultiPathOptions();
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
        textOptionsInput.value = '';
        textCorrectAnswerMultiOrderingInput.value = '';
        // Limpiar los campos de multi-ruta
        multiPathList.innerHTML = '';
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
        navigator.geolocation.getCurrentPosition(position => {
            const {
                latitude,
                longitude
            } = position.coords;
            updateMapMarker(latitude, longitude);
            locationLatitudeInput.value = latitude.toFixed(6);
            locationLongitudeInput.value = longitude.toFixed(6);
        }, () => {
            showAlert('No se pudo obtener tu ubicación.', 'error');
        });
    } else {
        showAlert('Geolocalización no soportada por este navegador.', 'error');
    }
}

// --- Funciones de Lógica de la BD (Supabase) ---
// (No se modifica para esta característica, se asume que las funciones de guardado
// y obtención de datos ya manejan los nuevos campos)

async function fetchGames() {
    showSection(gameListSection);
    gameListDiv.innerHTML = '<p>Cargando juegos...</p>';
    try {
        const {
            data,
            error
        } = await supabase.from('games').select('*').order('created_at', {
            ascending: false
        });
        if (error) throw error;
        renderGamesList(data);
    } catch (error) {
        console.error('Error al obtener juegos:', error);
        showAlert('Error al cargar la lista de juegos.', 'error');
        gameListDiv.innerHTML = '<p class="error-text">No se pudieron cargar los juegos. Inténtalo de nuevo más tarde.</p>';
    }
}

async function fetchLocations(gameId, gameName) {
    showSection(locationListSection);
    backToGamesBtn.dataset.gameId = gameId;
    currentGameNameSpan.textContent = gameName;
    gameNameDisplay.textContent = `| ${gameName}`;
    locationListDiv.innerHTML = '<p>Cargando ubicaciones...</p>';
    try {
        const {
            data,
            error
        } = await supabase.from('locations').select('*').eq('game_id', gameId).order('order_index', {
            ascending: true
        });
        if (error) throw error;
        renderLocationsList(data);
    } catch (error) {
        console.error('Error al obtener ubicaciones:', error);
        showAlert('Error al cargar la lista de ubicaciones.', 'error');
        locationListDiv.innerHTML = '<p class="error-text">No se pudieron cargar las ubicaciones. Inténtalo de nuevo más tarde.</p>';
    }
}

async function fetchTrials(locationId, locationName) {
    showSection(trialListSection);
    currentLocationNameSpan.textContent = locationName;
    const {
        data: gameData
    } = await supabase.from('games').select('adventure_type').eq('id', current_game_id).single();
    const gameAdventureType = gameData ? gameData.adventure_type : 'linear';

    try {
        const {
            data,
            error
        } = await supabase.from('trials').select('*').eq('location_id', locationId).order('order_index', {
            ascending: true
        });
        if (error) throw error;
        renderTrialsList(data, gameAdventureType);
    } catch (error) {
        console.error('Error al obtener pruebas:', error);
        showAlert('Error al cargar la lista de pruebas.', 'error');
        trialListDiv.innerHTML = '<p class="error-text">No se pudieron cargar las pruebas. Inténtalo de nuevo más tarde.</p>';
    }
}

async function saveTrial() {
    const trialId = trialIdInput.value;
    const trialData = {
        location_id: currentLocationIdTrialInput.value,
        title: trialNameInput.value,
        type: trialTypeInput.value,
        order_index: parseInt(trialOrderIndexInput.value, 10),
        narrative: trialNarrativeInput.value,
        image_url: trialImageUrlInput.value,
        audio_url: trialAudioUrlInput.value,
        hint_count: parseInt(trialHintCountInput.value, 10),
        hint_cost: parseInt(trialHintCostInput.value, 10),
        multi_path_options: null, // Aseguramos que se reinicie
        next_correct_location_id: null // Aseguramos que se reinicie
    };

    // Campos específicos de cada tipo
    if (trialData.type === 'qr') {
        trialData.qr_content = qrContentInput.value;
    } else if (trialData.type === 'gps') {
        trialData.gps_latitude = parseFloat(gpsLatitudeInput.value);
        trialData.gps_longitude = parseFloat(gpsLongitudeInput.value);
        trialData.gps_tolerance = parseFloat(gpsToleranceInput.value);
    } else if (trialData.type === 'text') {
        trialData.question = textQuestionInput.value;
        trialData.answer_type = textAnswerTypeInput.value;
        if (trialData.answer_type === 'single_choice' || trialData.answer_type === 'numeric') {
            trialData.correct_answer = textCorrectAnswerSingleNumericInput.value;
            // Para estos tipos, se usará la ubicación siguiente del tipo de aventura 'linear' si existe.
            // Si el juego es 'linear', el siguiente location_id se toma automáticamente del juego.
        } else if (trialData.answer_type === 'multiple_options' || trialData.answer_type === 'ordering') {
            trialData.options = textOptionsInput.value.split(';').map(s => s.trim());
            trialData.correct_answer = textCorrectAnswerMultiOrderingInput.value;
        }

        // Lógica para guardar las rutas alternativas
        if (trialData.answer_type === 'multiple_options') {
            const multiPathData = {};
            // Corregimos la selección para buscar elementos <select>
            const pathSelectors = multiPathList.querySelectorAll('select[data-option]');
            let nextCorrectLocationId = null;

            pathSelectors.forEach(select => {
                const option = select.dataset.option;
                const nextLocationId = select.value;
                if (nextLocationId) {
                    multiPathData[option] = nextLocationId;
                    // También guardamos el ID de la ubicación correcta por separado para consistencia
                    if (option === trialData.correct_answer) {
                        nextCorrectLocationId = nextLocationId;
                    }
                }
            });

            trialData.multi_path_options = multiPathData;
            trialData.next_correct_location_id = nextCorrectLocationId;
        }
    }

    try {
        if (trialId) {
            const {
                error
            } = await supabase.from('trials').update(trialData).eq('id', trialId);
            if (error) throw error;
            showAlert('Prueba actualizada con éxito.', 'success');
        } else {
            const {
                error
            } = await supabase.from('trials').insert(trialData);
            if (error) throw error;
            showAlert('Prueba creada con éxito.', 'success');
        }
        await fetchTrials(currentLocationIdTrialInput.value, currentLocationNameSpan.textContent);
    } catch (error) {
        console.error('Error al guardar la prueba:', error);
        showAlert('Error al guardar la prueba.', 'error');
    }
}

async function viewTrial(trialId) {
    trialFormTitle.textContent = 'Editar Prueba';
    showSection(trialFormSection);
    try {
        const {
            data,
            error
        } = await supabase.from('trials').select('*').eq('id', trialId).single();
        if (error) throw error;
        fillTrialForm(data);
        showTrialSpecificFields();
    } catch (error) {
        console.error('Error al cargar la prueba:', error);
        showAlert('Error al cargar la prueba.', 'error');
    }
}

function fillTrialForm(trial) {
    resetForm(trialForm); // Asegurarse de limpiar primero

    trialIdInput.value = trial.id;
    currentLocationIdTrialInput.value = trial.location_id;
    trialNameInput.value = trial.title;
    trialTypeInput.value = trial.type;
    trialOrderIndexInput.value = trial.order_index;
    trialNarrativeInput.value = trial.narrative;
    trialImageUrlInput.value = trial.image_url;
    trialAudioUrlInput.value = trial.audio_url;
    trialHintCountInput.value = trial.hint_count;
    trialHintCostInput.value = trial.hint_cost;

    // Llenar campos específicos
    if (trial.type === 'qr') {
        qrContentInput.value = trial.qr_content;
    } else if (trial.type === 'gps') {
        gpsLatitudeInput.value = trial.gps_latitude;
        gpsLongitudeInput.value = trial.gps_longitude;
        gpsToleranceInput.value = trial.gps_tolerance;
    } else if (trial.type === 'text') {
        textQuestionInput.value = trial.question;
        textAnswerTypeInput.value = trial.answer_type;
        if (trial.answer_type === 'single_choice' || trial.answer_type === 'numeric') {
            textCorrectAnswerSingleNumericInput.value = trial.correct_answer;
        } else if (trial.answer_type === 'multiple_options' || trial.answer_type === 'ordering') {
            textOptionsInput.value = trial.options ? trial.options.join(';') : '';
            textCorrectAnswerMultiOrderingInput.value = trial.correct_answer;
        }
        // Llenar campos de multi-ruta
        if (trial.answer_type === 'multiple_options') {
            // Llamamos a la función para generar los selects de nuevo
            populateMultiPathOptions().then(() => {
                if (trial.multi_path_options) {
                    for (const option in trial.multi_path_options) {
                        // Corregimos la selección para buscar elementos <select>
                        const select = multiPathList.querySelector(`select[data-option="${option}"]`);
                        if (select) {
                            select.value = trial.multi_path_options[option];
                        }
                    }
                }
            });
        }
    }
    showTrialSpecificFields();
}

// Función para generar los campos de multi-ruta dinámicamente
async function populateMultiPathOptions() {
    multiPathList.innerHTML = ''; // Limpiar el contenedor
    const optionsText = textOptionsInput.value;
    const options = optionsText ? optionsText.split(';').map(s => s.trim()) : [];

    // Ocultar los campos de ruta si no hay opciones
    if (options.length === 0) {
        multiPathFields.classList.add('hidden');
        return;
    }

    try {
        const { data: locations, error } = await supabase.from('locations').select('id, name').eq('game_id', current_game_id);
        if (error) throw error;

        options.forEach(option => {
            const div = document.createElement('div');
            div.classList.add('form-field');

            const label = document.createElement('label');
            label.textContent = `Si la respuesta es '${option}', ir a la ubicación:`;

            const select = document.createElement('select');
            select.setAttribute('data-option', option);

            // Opción por defecto
            const defaultOption = document.createElement('option');
            defaultOption.value = '';
            defaultOption.textContent = 'Selecciona una ubicación';
            select.appendChild(defaultOption);

            locations.forEach(location => {
                const optionElement = document.createElement('option');
                optionElement.value = location.id;
                optionElement.textContent = location.name;
                select.appendChild(optionElement);
            });

            div.appendChild(label);
            div.appendChild(select);
            multiPathList.appendChild(div);
        });
    } catch (error) {
        console.error('Error al cargar las ubicaciones para la multi-ruta:', error);
        showAlert('Error al cargar las ubicaciones para la multi-ruta.', 'error');
    }
}


// --- Funciones de renderizado (no se modifican para esta característica) ---
function renderGamesList(games) {
    gameListDiv.innerHTML = '';
    if (games.length === 0) {
        gameListDiv.innerHTML = '<p>No hay juegos creados. ¡Crea el primero!</p>';
        return;
    }
    games.forEach(game => {
        const item = document.createElement('div');
        item.classList.add('list-item');
        item.innerHTML = `
            <span>${game.title} (${game.adventure_type})</span>
            <div class="list-actions">
                <button class="edit-button" onclick="viewGame('${game.id}')">Editar</button>
                <button class="view-button" onclick="viewLocations('${game.id}', '${game.title}', '${game.adventure_type}')">Ubicaciones</button>
            </div>
        `;
        gameListDiv.appendChild(item);
    });
}

function renderLocationsList(locations) {
    locationListDiv.innerHTML = '';
    if (locations.length === 0) {
        locationListDiv.innerHTML = '<p>No hay ubicaciones creadas para este juego.</p>';
        return;
    }
    locations.forEach(location => {
        const item = document.createElement('div');
        item.classList.add('list-item');
        item.innerHTML = `
            <span>${location.order_index}. ${location.name}</span>
            <div class="list-actions">
                <button class="edit-button" onclick="viewLocation('${location.id}')">Editar</button>
                <button class="view-button" onclick="viewTrials('${location.id}', '${location.name}')">Pruebas</button>
                <button class="delete-button" onclick="deleteLocation('${location.id}')">Eliminar</button>
            </div>
        `;
        locationListDiv.appendChild(item);
    });
}

function renderTrialsList(trials, gameAdventureType) {
    trialListDiv.innerHTML = '';
    if (trials.length === 0) {
        trialListDiv.innerHTML = '<p>No hay pruebas creadas para esta ubicación.</p>';
        return;
    }
    trials.forEach(trial => {
        const item = document.createElement('div');
        item.classList.add('list-item');
        item.innerHTML = `
            <span>${trial.order_index}. ${trial.title} (${trial.type})</span>
            <div class="list-actions">
                <button class="edit-button" onclick="viewTrial('${trial.id}')">Editar</button>
                <button class="delete-button" onclick="deleteTrial('${trial.id}')">Eliminar</button>
            </div>
        `;
        trialListDiv.appendChild(item);
    });
}
