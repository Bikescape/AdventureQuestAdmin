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
const gameImageUrlInput = document.getElementById('game-image-url'); // NUEVO
const gameAudioUrlInput = document.getElementById('game-audio-url'); // NUEVO
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

    // Lógica específica para inicializar el mapa cuando se muestra el formulario de ubicación
    if (sectionToShow === locationFormSection) {
        initLocationMap();
    } else {
        // Destruir el mapa si no se va a usar para liberar recursos
        if (locationMap) {
            locationMap.remove();
            locationMap = null;
            locationMapMarker = null;
        }
    }
}

function showTrialSpecificFields() {
    // Oculta todos los campos específicos de prueba
    qrFields.classList.add('hidden');
    gpsFields.classList.add('hidden');
    textFields.classList.add('hidden');
    singleNumericAnswerFields.classList.add('hidden');
    multiOrderingAnswerFields.classList.add('hidden');

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
        }
    }
}

function resetForm(form) {
    form.reset();
    const hiddenInputs = form.querySelectorAll('input[type="hidden"]');
    hiddenInputs.forEach(input => input.value = '');
    // Reiniciar valores por defecto
    if (form === gameForm) {
        gameInitialScorePerTrialInput.value = 100;
        gameAdventureTypeInput.value = 'linear';
        gameIsActiveInput.checked = false;
        // Reiniciar campos de imagen y audio del juego
        gameImageUrlInput.value = ''; // NUEVO
        gameAudioUrlInput.value = ''; // NUEVO
    } else if (form === locationForm) {
        locationOrderIndexInput.value = 1;
        locationIsSelectableTrialsInput.checked = false;
        locationToleranceInput.value = 10;
        preArrivalNarrativeInput.value = '';
        // Reiniciar el mapa si existe
        if (locationMapMarker) {
            locationMap.removeLayer(locationMapMarker);
            locationMapMarker = null;
        }
        locationLatitudeInput.value = '';
        locationLongitudeInput.value = '';

    } else if (form === trialForm) {
        trialTypeInput.value = ''; // Resetear el tipo de prueba
        trialHintCountInput.value = 3;
        trialHintCostInput.value = 10;
        trialOrderIndexInput.value = 1;
        hint1Input.value = '';
        hint2Input.value = '';
        hint3Input.value = '';
        textAnswerTypeInput.value = 'single_choice'; // Resetear tipo de respuesta de texto
        showTrialSpecificFields(); // Ocultar todos los campos específicos de prueba al resetear
    }
}


// --- Lógica del Mapa Leaflet para Ubicaciones ---

function initLocationMap(lat = 43.535, lon = -5.661, zoom = 13) { // Coordenadas por defecto (Gijón)
    if (locationMap) {
        locationMap.remove(); // Asegura que no se inicialice dos veces
    }
    locationMap = L.map('location-map').setView([lat, lon], zoom);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    }).addTo(locationMap);

    // Permitir clic para establecer el marcador
    locationMap.on('click', function(e) {
        updateMapMarker(e.latlng.lat, e.latlng.lng);
        locationLatitudeInput.value = e.latlng.lat.toFixed(6);
        locationLongitudeInput.value = e.latlng.lng.toFixed(6);
    });

    // Si ya hay coordenadas, poner el marcador
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
    console.log("Intentando cargar juegos...");
    gameListDiv.innerHTML = '<p>Cargando juegos...</p>';
    rankingsSummary.classList.add('hidden'); // Ocultar rankings mientras se cargan los juegos

    // **IMPORTANTE:** Verificar que 'supabase' esté definido aquí
    if (typeof supabase === 'undefined') {
        console.error("ERROR: El cliente de Supabase no está definido. Asegúrate de que 'supabase-config.js' lo exporta correctamente o lo define globalmente.");
        showAlert('Error: Supabase no está configurado. Revisa supabase-config.js', 'error');
        gameListDiv.innerHTML = '<p>Error de configuración de Supabase. Los juegos no se pueden cargar.</p>';
        return;
    }

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
                    <p>Tipo de Aventura: ${game.adventure_type === 'linear' ? 'Lineal' : 'Seleccionable'}</p>
                    <p>Puntuación Inicial por Prueba: ${game.initial_score_per_trial}</p>
                    ${game.image_url ? `<p>Imagen: <a href="${game.image_url}" target="_blank">Ver</a></p>` : ''}
                    ${game.audio_url ? `<p>Audio: <a href="${game.audio_url}" target="_blank">Escuchar</a></p>` : ''}
                </div>
                <div class="item-actions">
                    <button class="edit-button" data-id="${game.id}">Editar</button>
                    <button class="view-button" data-id="${game.id}" data-name="${game.title}" data-adventure-type="${game.adventure_type}">Ver Ubicaciones</button>
                    <button class="delete-button" data-id="${game.id}">Eliminar</button>
                </div>
            `;
            gameListDiv.appendChild(gameItem);
        });

        // Adjuntar eventos a los botones
        gameListDiv.querySelectorAll('.edit-button').forEach(button => {
            button.addEventListener('click', (e) => editGame(e.target.dataset.id));
        });
        gameListDiv.querySelectorAll('.view-button').forEach(button => {
            button.addEventListener('click', (e) => viewLocations(e.target.dataset.id, e.target.dataset.name, e.target.dataset.adventureType));
        });
        gameListDiv.querySelectorAll('.delete-button').forEach(button => {
            button.addEventListener('click', (e) => deleteGame(e.target.dataset.id));
        });
    }
    fetchRankings(); // Cargar rankings después de los juegos
}

async function fetchRankings() {
    rankingsContainer.innerHTML = '<p>Cargando rankings...</p>';
    rankingsSummary.classList.remove('hidden');

    // Solo equipos completados
    const { data: teams, error } = await supabase
        .from('teams')
        .select(`
            *,
            games(title)
        `)
        .eq('is_completed', true)
        .order('total_score', { ascending: false })
        .order('total_time_seconds', { ascending: true }); // Segundo criterio de ordenación

    if (error) {
        console.error('Error fetching rankings:', error);
        showAlert('Error al cargar rankings: ' + error.message, 'error');
        rankingsContainer.innerHTML = '<p>Error al cargar los rankings.</p>';
        return;
    }

    if (teams.length === 0) {
        rankingsContainer.innerHTML = '<p>Ningún equipo ha completado un juego aún.</p>';
    } else {
        rankingsContainer.innerHTML = '';
        teams.forEach((team, index) => {
            const rankingItem = document.createElement('div');
            rankingItem.classList.add('ranking-item');
            const totalMinutes = Math.floor(team.total_time_seconds / 60);
            const remainingSeconds = team.total_time_seconds % 60;
            rankingItem.innerHTML = `
                <div class="team-info">#${index + 1} ${team.name} (${team.games.title})</div>
                <div class="score-time">Puntuación: ${team.total_score} | Tiempo: ${totalMinutes}m ${remainingSeconds}s</div>
            `;
            rankingsContainer.appendChild(rankingItem);
        });
    }
}

async function saveGame() {
    const id = gameIdInput.value || null;
    const title = gameTitleInput.value;
    const description = gameDescriptionInput.value;
    const mechanics = gameMechanicsInput.value;
    const initial_narrative = gameInitialNarrativeInput.value;
    // Obtener valores de los nuevos inputs
    const image_url = gameImageUrlInput.value;
    const audio_url = gameAudioUrlInput.value;
    // Fin de obtener valores
    const adventure_type = gameAdventureTypeInput.value;
    const initial_score_per_trial = parseInt(gameInitialScorePerTrialInput.value);
    const is_active = gameIsActiveInput.checked;

    const gameData = {
        title,
        description,
        mechanics,
        initial_narrative,
        image_url, // Añadir al objeto de datos
        audio_url, // Añadir al objeto de datos
        adventure_type,
        initial_score_per_trial,
        is_active
    };

    let error = null;

    if (id) {
        const { error: updateError } = await supabase
            .from('games')
            .update(gameData)
            .eq('id', id);
        error = updateError;
    } else {
        const { error: insertError } = await supabase
            .from('games')
            .insert([gameData]);
        error = insertError;
    }

    if (error) {
        console.error('Error saving game:', error);
        showAlert('Error al guardar el juego: ' + error.message, 'error');
    } else {
        showAlert('Juego guardado correctamente.', 'success');
        resetForm(gameForm);
        showSection(gameListSection);
        fetchGames();
    }
}

async function editGame(gameId) {
    const { data: game, error } = await supabase
        .from('games')
        .select('*')
        .eq('id', gameId)
        .single();

    if (error) {
        console.error('Error fetching game for edit:', error);
        showAlert('Error al cargar el juego para editar: ' + error.message, 'error');
        return;
    }

    gameIdInput.value = game.id;
    gameTitleInput.value = game.title;
    gameDescriptionInput.value = game.description;
    gameMechanicsInput.value = game.mechanics;
    gameInitialNarrativeInput.value = game.initial_narrative;
    // Asignar valores a los nuevos inputs
    gameImageUrlInput.value = game.image_url || '';
    gameAudioUrlInput.value = game.audio_url || '';
    // Fin de asignar valores
    gameAdventureTypeInput.value = game.adventure_type;
    gameInitialScorePerTrialInput.value = game.initial_score_per_trial;
    gameIsActiveInput.checked = game.is_active;

    formTitle.textContent = 'Editar Juego';
    gameNameDisplay.textContent = `: ${game.title}`;
    showSection(gameFormSection);
}

async function deleteGame(gameId) {
    if (!confirm('¿Estás seguro de que quieres eliminar este juego? Se eliminarán también todas sus ubicaciones y pruebas.')) {
        return;
    }

    const { error } = await supabase
        .from('games')
        .delete()
        .eq('id', gameId);

    if (error) {
        console.error('Error deleting game:', error);
        showAlert('Error al eliminar el juego: ' + error.message, 'error');
    } else {
        showAlert('Juego eliminado correctamente.', 'success');
        fetchGames();
    }
}

async function viewLocations(gameId, gameName, adventureType) {
    current_game_id = gameId;
    current_game_name = gameName;
    current_game_adventure_type = adventureType;
    currentGameIdLocationInput.value = gameId;
    currentGameNameSpan.textContent = gameName;
    locationListDiv.innerHTML = '<p>Cargando ubicaciones...</p>';
    showSection(locationListSection);

    const { data: locations, error } = await supabase
        .from('locations')
        .select('*')
        .eq('game_id', gameId)
        .order('order_index', { ascending: true })
        .order('created_at', { ascending: true }); // Fallback order

    if (error) {
        console.error('Error fetching locations:', error);
        showAlert('Error al cargar las ubicaciones: ' + error.message, 'error');
        locationListDiv.innerHTML = '<p>Error al cargar las ubicaciones.</p>';
        return;
    }

    if (locations.length === 0) {
        locationListDiv.innerHTML = '<p>No hay ubicaciones creadas para este juego.</p>';
    } else {
        locationListDiv.innerHTML = '';
        locations.forEach(location => {
            const locationItem = document.createElement('div');
            locationItem.classList.add('location-item');
            const coordsText = location.latitude && location.longitude ? `Lat: ${location.latitude.toFixed(4)}, Lon: ${location.longitude.toFixed(4)}` : 'Sin coordenadas';
            locationItem.innerHTML = `
                <div class="item-content">
                    <h3>${location.name}</h3>
                    <p>Orden: ${location.order_index || 'N/A'}</p>
                    <p>Pruebas seleccionables: ${location.is_selectable_trials ? 'Sí' : 'No'}</p>
                    <p>Coordenadas: ${coordsText}</p>
                    <p>Tolerancia: ${location.tolerance_meters || 'N/A'}m</p>
                </div>
                <div class="item-actions">
                    <button class="edit-button" data-id="${location.id}">Editar</button>
                    <button class="view-button" data-id="${location.id}" data-name="${location.name}" data-is-selectable-trials="${location.is_selectable_trials}">Ver Pruebas</button>
                    <button class="delete-button" data-id="${location.id}">Eliminar</button>
                </div>
            `;
            locationListDiv.appendChild(locationItem);
        });

        locationListDiv.querySelectorAll('.edit-button').forEach(button => {
            button.addEventListener('click', (e) => editLocation(e.target.dataset.id));
        });
        locationListDiv.querySelectorAll('.view-button').forEach(button => {
            button.addEventListener('click', (e) => viewTrials(e.target.dataset.id, e.target.dataset.name, e.target.dataset.isSelectableTrials === 'true'));
        });
        locationListDiv.querySelectorAll('.delete-button').forEach(button => {
            button.addEventListener('click', (e) => deleteLocation(e.target.dataset.id));
        });
    }
}

async function saveLocation() {
    const id = locationIdInput.value || null;
    const game_id = current_game_id;
    const name = locationNameInput.value;
    const order_index = current_game_adventure_type === 'linear' ? parseInt(locationOrderIndexInput.value) : null;
    const pre_arrival_narrative = preArrivalNarrativeInput.value;
    const initial_narrative = locationInitialNarrativeInput.value;
    const image_url = locationImageUrlInput.value;
    const audio_url = locationAudioUrlInput.value;
    const is_selectable_trials = locationIsSelectableTrialsInput.checked;
    const latitude = parseFloat(locationLatitudeInput.value);
    const longitude = parseFloat(locationLongitudeInput.value);
    const tolerance_meters = parseInt(locationToleranceInput.value);

    // Validación básica de coordenadas
    if (isNaN(latitude) || isNaN(longitude)) {
        showAlert('Latitud y Longitud son obligatorias y deben ser números.', 'error');
        return;
    }
    if (isNaN(tolerance_meters) || tolerance_meters < 0) {
        showAlert('La tolerancia debe ser un número positivo.', 'error');
        return;
    }

    const locationData = {
        game_id,
        name,
        order_index,
        pre_arrival_narrative,
        initial_narrative,
        image_url,
        audio_url,
        is_selectable_trials,
        latitude,
        longitude,
        tolerance_meters
    };

    let error = null;

    if (id) {
        const { error: updateError } = await supabase
            .from('locations')
            .update(locationData)
            .eq('id', id);
        error = updateError;
    } else {
        const { error: insertError } = await supabase
            .from('locations')
            .insert([locationData]);
        error = insertError;
    }

    if (error) {
        console.error('Error saving location:', error);
        showAlert('Error al guardar la ubicación: ' + error.message, 'error');
    } else {
        showAlert('Ubicación guardada correctamente.', 'success');
        resetForm(locationForm);
        showSection(locationListSection);
        viewLocations(current_game_id, current_game_name, current_game_adventure_type);
    }
}

async function editLocation(locationId) {
    const { data: location, error } = await supabase
        .from('locations')
        .select('*')
        .eq('id', locationId)
        .single();

    if (error) {
        console.error('Error fetching location for edit:', error);
        showAlert('Error al cargar la ubicación para editar: ' + error.message, 'error');
        return;
    }

    locationIdInput.value = location.id;
    locationNameInput.value = location.name;
    locationOrderIndexInput.value = location.order_index;
    preArrivalNarrativeInput.value = location.pre_arrival_narrative;
    locationInitialNarrativeInput.value = location.initial_narrative;
    locationImageUrlInput.value = location.image_url || '';
    locationAudioUrlInput.value = location.audio_url || '';
    locationIsSelectableTrialsInput.checked = location.is_selectable_trials;
    locationLatitudeInput.value = location.latitude;
    locationLongitudeInput.value = location.longitude;
    locationToleranceInput.value = location.tolerance_meters;

    document.getElementById('location-form-title').textContent = 'Editar Ubicación';
    initLocationMap(location.latitude, location.longitude); // Inicializar mapa con las coordenadas de la ubicación
    showSection(locationFormSection);
}

async function deleteLocation(locationId) {
    if (!confirm('¿Estás seguro de que quieres eliminar esta ubicación? Se eliminarán también todas sus pruebas.')) {
        return;
    }

    const { error } = await supabase
        .from('locations')
        .delete()
        .eq('id', locationId);

    if (error) {
        console.error('Error deleting location:', error);
        showAlert('Error al eliminar la ubicación: ' + error.message, 'error');
    } else {
        showAlert('Ubicación eliminada correctamente.', 'success');
        viewLocations(current_game_id, current_game_name, current_game_adventure_type);
    }
}

async function viewTrials(locationId, locationName, isSelectableTrials) {
    current_location_id = locationId;
    current_location_name = locationName;
    current_location_is_selectable_trials = isSelectableTrials;
    currentLocationIdTrialInput.value = locationId;
    currentLocationNameSpan.textContent = locationName;
    trialListDiv.innerHTML = '<p>Cargando pruebas...</p>';
    showSection(trialListSection);

    const { data: trials, error } = await supabase
        .from('trials')
        .select('*')
        .eq('location_id', locationId)
        .order('order_index', { ascending: true })
        .order('created_at', { ascending: true }); // Fallback order

    if (error) {
        console.error('Error fetching trials:', error);
        showAlert('Error al cargar las pruebas: ' + error.message, 'error');
        trialListDiv.innerHTML = '<p>Error al cargar las pruebas.</p>';
        return;
    }

    if (trials.length === 0) {
        trialListDiv.innerHTML = '<p>No hay pruebas creadas para esta ubicación.</p>';
    } else {
        trialListDiv.innerHTML = '';
        trials.forEach(trial => {
            const trialItem = document.createElement('div');
            trialItem.classList.add('trial-item');
            trialItem.innerHTML = `
                <div class="item-content">
                    <h3>${trial.narrative.substring(0, 50)}... (${trial.trial_type.toUpperCase()})</h3>
                    <p>Orden: ${trial.order_index || 'N/A'}</p>
                    <p>Pistas: ${trial.hint_count || 0} (Coste: ${trial.hint_cost || 0})</p>
                </div>
                <div class="item-actions">
                    <button class="edit-button" data-id="${trial.id}">Editar</button>
                    <button class="delete-button" data-id="${trial.id}">Eliminar</button>
                </div>
            `;
            trialListDiv.appendChild(trialItem);
        });

        trialListDiv.querySelectorAll('.edit-button').forEach(button => {
            button.addEventListener('click', (e) => editTrial(e.target.dataset.id));
        });
        trialListDiv.querySelectorAll('.delete-button').forEach(button => {
            button.addEventListener('click', (e) => deleteTrial(e.target.dataset.id));
        });
    }
}

async function saveTrial() {
    const id = trialIdInput.value || null;
    const location_id = current_location_id;
    const trial_type = trialTypeInput.value;
    const order_index = current_location_is_selectable_trials ? null : parseInt(trialOrderIndexInput.value); // Solo guarda orden si no es seleccionable
    const narrative = trialNarrativeInput.value;
    const image_url = trialImageUrlInput.value;
    const audio_url = trialAudioUrlInput.value;
    const hint_count = parseInt(trialHintCountInput.value);
    const hint_cost = parseInt(trialHintCostInput.value);
    const hint1 = hint1Input.value;
    const hint2 = hint2Input.value;
    const hint3 = hint3Input.value;

    let trialData = {
        location_id,
        trial_type,
        order_index,
        narrative,
        image_url,
        audio_url,
        hint_count,
        hint_cost,
        hint1,
        hint2,
        hint3
        qr_content: null,
        latitude: null,
        longitude: null,
        tolerance_meters: null,
        question: null,
        answer_type: null,
        correct_answer: null,
        options: null
    };

    // Campos específicos por tipo de prueba
    if (trial_type === 'qr') {
        trialData.qr_content = qrContentInput.value;
        if (!trialData.qr_content) {
            showAlert('El contenido del QR es obligatorio para pruebas QR.', 'error');
            return;
        }
    } else if (trial_type === 'gps') {
        trialData.latitude = parseFloat(gpsLatitudeInput.value);
        trialData.longitude = parseFloat(gpsLongitudeInput.value);
        trialData.tolerance_meters = parseInt(gpsToleranceInput.value);
        // Validaciones GPS
        if (isNaN(trialData.latitude) || isNaN(trialData.longitude) || isNaN(trialData.tolerance_meters)) {
            showAlert('Latitud, Longitud y Tolerancia son obligatorias y deben ser números para pruebas GPS.', 'error');
            return;
        }
    } else if (trial_type === 'text') {
        trialData.question = textQuestionInput.value;
        trialData.answer_type = textAnswerTypeInput.value;
        if (!trialData.question) {
            showAlert('La pregunta es obligatoria para pruebas de Texto.', 'error');
            return;
        }

        if (trialData.answer_type === 'single_choice' || trialData.answer_type === 'numeric') {
            trialData.correct_answer = textCorrectAnswerSingleNumericInput.value;
            if (!trialData.correct_answer) {
                showAlert('La respuesta correcta es obligatoria para este tipo de prueba de Texto.', 'error');
                return;
            }
        } else if (trialData.answer_type === 'multiple_options' || trialData.answer_type === 'ordering') {
            trialData.correct_answer = textCorrectAnswerMultiOrderingInput.value;
            // Guardar opciones como un array JSON
            trialData.options = textOptionsInput.value.split(';').map(item => item.trim()).filter(item => item !== '');
            if (!trialData.correct_answer || trialData.options.length === 0) {
                showAlert('Opciones y respuesta correcta son obligatorias para este tipo de prueba de Texto.', 'error');
                return;
            }
        }
    } else {
        showAlert('Por favor, selecciona un tipo de prueba.', 'error');
        return;
    }

    let error = null;

    if (id) {
        const { error: updateError } = await supabase
            .from('trials')
            .update(trialData)
            .eq('id', id);
        error = updateError;
    } else {
        const { error: insertError } = await supabase
            .from('trials')
            .insert([trialData]);
        error = insertError;
    }

    if (error) {
        console.error('Error saving trial:', error);
        showAlert('Error al guardar la prueba: ' + error.message, 'error');
    } else {
        showAlert('Prueba guardada correctamente.', 'success');
        resetForm(trialForm);
        showSection(trialListSection);
        viewTrials(current_location_id, current_location_name, current_location_is_selectable_trials);
    }
}

async function editTrial(trialId) {
    const { data: trial, error } = await supabase
        .from('trials')
        .select('*')
        .eq('id', trialId)
        .single();

    if (error) {
        console.error('Error fetching trial for edit:', error);
        showAlert('Error al cargar la prueba para editar: ' + error.message, 'error');
        return;
    }

    trialIdInput.value = trial.id;
    trialTypeInput.value = trial.trial_type;
    trialOrderIndexInput.value = trial.order_index;
    trialNarrativeInput.value = trial.narrative;
    trialImageUrlInput.value = trial.image_url || '';
    trialAudioUrlInput.value = trial.audio_url || '';
    trialHintCountInput.value = trial.hint_count;
    trialHintCostInput.value = trial.hint_cost;
    hint1Input.value = trial.hint1 || '';
    hint2Input.value = trial.hint2 || '';
    hint3Input.value = trial.hint3 || '';

    // Rellenar campos específicos
    if (trial.trial_type === 'qr') {
        qrContentInput.value = trial.qr_content || '';
    } else if (trial.trial_type === 'gps') {
        gpsLatitudeInput.value = trial.latitude || '';
        gpsLongitudeInput.value = trial.longitude || '';
        gpsToleranceInput.value = trial.tolerance_meters || 10;
    } else if (trial.trial_type === 'text') {
        textQuestionInput.value = trial.question || '';
        textAnswerTypeInput.value = trial.answer_type || 'single_choice';

        if (trial.answer_type === 'single_choice' || trial.answer_type === 'numeric') {
            textCorrectAnswerSingleNumericInput.value = trial.correct_answer || '';
        } else if (trial.answer_type === 'multiple_options' || trial.answer_type === 'ordering') {
            textCorrectAnswerMultiOrderingInput.value = trial.correct_answer || '';
            // Convertir array JSON a string separado por ;
            textOptionsInput.value = (trial.options && Array.isArray(trial.options)) ? trial.options.join(';') : '';
        }
    }

    trialFormTitle.textContent = 'Editar Prueba';
    showSection(trialFormSection);
    showTrialSpecificFields(); // Asegurar que los campos correctos se muestren después de cargar los datos
}

async function deleteTrial(trialId) {
    if (!confirm('¿Estás seguro de que quieres eliminar esta prueba?')) {
        return;
    }

    const { error } = await supabase
        .from('trials')
        .delete()
        .eq('id', trialId);

    if (error) {
        console.error('Error deleting trial:', error);
        showAlert('Error al eliminar la prueba: ' + error.message, 'error');
    } else {
        showAlert('Prueba eliminada correctamente.', 'success');
        viewTrials(current_location_id, current_location_name, current_location_is_selectable_trials);
    }
}

// --- Inicialización ---
document.addEventListener('DOMContentLoaded', () => {
    // Es CRÍTICO que 'supabase' esté accesible aquí.
    // Asegúrate de que tu 'supabase-config.js' se carga ANTES de 'admin-script.js'
    // y que define la variable 'supabase' en el ámbito global.
    // (Por ejemplo, <script src="supabase-config.js"></script> antes de <script src="admin-script.js"></script>
    // en tu index.html, y que supabase-config.js contenga algo como:
    // const SUPABASE_URL = 'TU_URL';
    // const SUPABASE_ANON_KEY = 'TU_KEY';
    // const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY); )

    console.log("DOM Cargado. Intentando inicializar la aplicación.");
    if (typeof supabase === 'undefined') {
        console.error("Supabase client is NOT defined. Check your supabase-config.js file and script loading order in index.html.");
        showAlert("Error crítico: El cliente de Supabase no está disponible. No se puede conectar a la base de datos.", 'error');
        gameListDiv.innerHTML = '<p>Error de configuración. Verifique la consola del navegador.</p>';
    } else {
        console.log("Supabase client IS defined. Proceeding to fetch games.");
        fetchGames(); // Cargar la lista de juegos al iniciar
    }

    // Event Listeners de navegación
    createGameBtn.addEventListener('click', () => {
        resetForm(gameForm);
        formTitle.textContent = 'Crear Nuevo Juego';
        gameNameDisplay.textContent = '';
        showSection(gameFormSection);
    });
    cancelGameBtn.addEventListener('click', () => showSection(gameListSection));
    gameForm.addEventListener('submit', (e) => {
        e.preventDefault();
        saveGame();
    });

    addLocationBtn.addEventListener('click', () => {
        resetForm(locationForm);
        document.getElementById('location-form-title').textContent = 'Crear Nueva Ubicación';
        // Asignar el game_id actual al input oculto en el formulario de ubicación
        currentGameIdLocationInput.value = current_game_id;
        // Si el juego es lineal, se muestra el campo de orden. Si es seleccionable, se oculta.
        const orderInputContainer = locationOrderIndexInput.closest('div'); // O un padre que lo contenga
        if (orderInputContainer) {
            orderInputContainer.style.display = current_game_adventure_type === 'linear' ? 'block' : 'none';
        }
        showSection(locationFormSection);
    });
    cancelLocationBtn.addEventListener('click', () => viewLocations(current_game_id, current_game_name, current_game_adventure_type));
    locationForm.addEventListener('submit', (e) => {
        e.preventDefault();
        saveLocation();
    });
    backToGamesBtn.addEventListener('click', () => {
        current_game_id = null;
        current_game_name = null;
        current_game_adventure_type = null;
        showSection(gameListSection);
        fetchGames();
    });
    previewGameBtn.addEventListener('click', () => {
        if (current_game_id) {
            // Abre una nueva pestaña o ventana con la URL de la app de jugador
            // Asegúrate de que tu app de jugador pueda manejar este parámetro
            const playerAppUrl = `player/index.html?gameId=${current_game_id}`;
            window.open(playerAppUrl, '_blank');
        } else {
            showAlert('Debes seleccionar un juego para previsualizarlo.', 'info');
        }
    });


    // Event Listeners de Trial
    addTrialBtn.addEventListener('click', () => {
        resetForm(trialForm);
        trialFormTitle.textContent = 'Crear Nueva Prueba';
        currentLocationIdTrialInput.value = current_location_id;
        // Mostrar u ocultar el campo de orden según si las pruebas de la ubicación son seleccionables
        const trialOrderInputContainer = trialOrderIndexInput.closest('div'); // Ajusta según tu HTML
        if (trialOrderInputContainer) {
            trialOrderInputContainer.style.display = current_location_is_selectable_trials ? 'none' : 'block';
        }
        showSection(trialFormSection);
    });
    cancelTrialBtn.addEventListener('click', () => viewTrials(current_location_id, current_location_name, current_location_is_selectable_trials));
    trialForm.addEventListener('submit', (e) => {
        e.preventDefault();
        saveTrial();
    });
    backToLocationsBtn.addEventListener('click', () => viewLocations(current_game_id, current_game_name, current_game_adventure_type));

    // Event listener para mostrar/ocultar campos de prueba específicos
    trialTypeInput.addEventListener('change', showTrialSpecificFields);
    textAnswerTypeInput.addEventListener('change', showTrialSpecificFields);

    // Event listener para el botón de obtener ubicación actual
    getCurrentLocationBtn.addEventListener('click', getCurrentLocation);
});

// Función de utilidad para mostrar alertas
function showAlert(message, type = 'info') {
    const alertBox = document.createElement('div');
    alertBox.className = `alert ${type}`;
    alertBox.textContent = message;
    document.body.appendChild(alertBox);

    setTimeout(() => {
        alertBox.remove();
    }, 3000);
}