// admin-script.js

// Inicializa Supabase (asegúrate de que admin-supabase-config.js esté cargado y configure `supabase` globalmente)
// const { createClient } = supabase; // Si no está globalmente
// const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY); // Si no está globalmente

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
const addTrialBtn = document.getElementById('add-trial-btn');
const cancelTrialBtn = document.getElementById('cancel-trial-btn');
const previewGameBtn = document.getElementById('preview-game-btn');

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
const gameAdventureTypeInput = document.getElementById('game-adventure-type');
const gameInitialScorePerTrialInput = document.getElementById('game-initial-score-per-trial');
const gameIsActiveInput = document.getElementById('game-is-active');

// Inputs de los formularios (Location)
const locationIdInput = document.getElementById('location-id');
const currentGameIdLocationInput = document.getElementById('current-game-id-location');
const locationNameInput = document.getElementById('location-name');
const locationOrderIndexInput = document.getElementById('location-order-index');
const locationInitialNarrativeInput = document.getElementById('location-initial-narrative');
const locationImageUrlInput = document.getElementById('location-image-url');
const locationAudioUrlInput = document.getElementById('location-audio-url');
const locationIsSelectableTrialsInput = document.getElementById('location-is-selectable-trials');

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

// Variables de estado
let current_game_id = null;
let current_game_name = null;
let current_game_adventure_type = null;
let current_location_id = null;
let current_location_name = null;
let current_location_is_selectable_trials = null;

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
    } else if (form === locationForm) {
        locationOrderIndexInput.value = 1;
        locationIsSelectableTrialsInput.checked = false;
    } else if (form === trialForm) {
        trialTypeInput.value = ''; // Resetear el tipo de prueba
        trialHintCountInput.value = 3;
        trialHintCostInput.value = 10;
        trialOrderIndexInput.value = 1;
        textAnswerTypeInput.value = 'single_choice'; // Resetear tipo de respuesta de texto
        showTrialSpecificFields(); // Ocultar todos los campos específicos de prueba al resetear
    }
}


// --- Lógica de Supabase y CRUD ---

async function fetchGames() {
    gameListDiv.innerHTML = '<p>Cargando juegos...</p>';
    rankingsSummary.classList.add('hidden'); // Ocultar rankings mientras se cargan los juegos

    const { data: games, error } = await supabase
        .from('games')
        .select('*')
        .order('created_at', { ascending: false });

    if (error) {
        console.error('Error fetching games:', error);
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
    const adventure_type = gameAdventureTypeInput.value;
    const initial_score_per_trial = parseInt(gameInitialScorePerTrialInput.value);
    const is_active = gameIsActiveInput.checked;

    const gameData = {
        title,
        description,
        mechanics,
        initial_narrative,
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
        alert('Error al guardar el juego.');
    } else {
        alert('Juego guardado correctamente.');
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
        alert('Error al cargar el juego para editar.');
        return;
    }

    gameIdInput.value = game.id;
    gameTitleInput.value = game.title;
    gameDescriptionInput.value = game.description;
    gameMechanicsInput.value = game.mechanics;
    gameInitialNarrativeInput.value = game.initial_narrative;
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
        alert('Error al eliminar el juego.');
    } else {
        alert('Juego eliminado correctamente.');
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
            locationItem.innerHTML = `
                <div class="item-content">
                    <h3>${location.name}</h3>
                    <p>Orden: ${location.order_index || 'N/A'}</p>
                    <p>Pruebas seleccionables: ${location.is_selectable_trials ? 'Sí' : 'No'}</p>
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
    const initial_narrative = locationInitialNarrativeInput.value;
    const image_url = locationImageUrlInput.value;
    const audio_url = locationAudioUrlInput.value;
    const is_selectable_trials = locationIsSelectableTrialsInput.checked;

    const locationData = {
        game_id,
        name,
        order_index,
        initial_narrative,
        image_url,
        audio_url,
        is_selectable_trials
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
        alert('Error al guardar la ubicación.');
    } else {
        alert('Ubicación guardada correctamente.');
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
        alert('Error al cargar la ubicación para editar.');
        return;
    }

    locationIdInput.value = location.id;
    locationNameInput.value = location.name;
    locationOrderIndexInput.value = location.order_index || '';
    locationInitialNarrativeInput.value = location.initial_narrative;
    locationImageUrlInput.value = location.image_url;
    locationAudioUrlInput.value = location.audio_url;
    locationIsSelectableTrialsInput.checked = location.is_selectable_trials;

    document.getElementById('location-form-title').textContent = 'Editar Ubicación';
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
        alert('Error al eliminar la ubicación.');
    } else {
        alert('Ubicación eliminada correctamente.');
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
                    <h3>${trial.narrative || trial.question || 'Prueba sin título'} (${trial.trial_type.toUpperCase()})</h3>
                    <p>Orden: ${trial.order_index || 'N/A'}</p>
                    <p>Pistas: ${trial.hint_count} (Coste: ${trial.hint_cost} puntos)</p>
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
    const order_index = current_location_is_selectable_trials ? null : parseInt(trialOrderIndexInput.value);
    const narrative = trialNarrativeInput.value;
    const image_url = trialImageUrlInput.value;
    const audio_url = trialAudioUrlInput.value;
    const hint_count = parseInt(trialHintCountInput.value);
    const hint_cost = parseInt(trialHintCostInput.value);

    let trialData = {
        location_id,
        trial_type,
        order_index,
        narrative,
        image_url,
        audio_url,
        hint_count,
        hint_cost,
        qr_content: null,
        latitude: null,
        longitude: null,
        tolerance_meters: null,
        question: null,
        answer_type: null,
        correct_answer: null,
        options: null
    };

    // Agregar campos específicos según el tipo de prueba
    if (trial_type === 'qr') {
        trialData.qr_content = qrContentInput.value;
    } else if (trial_type === 'gps') {
        trialData.latitude = parseFloat(gpsLatitudeInput.value);
        trialData.longitude = parseFloat(gpsLongitudeInput.value);
        trialData.tolerance_meters = parseInt(gpsToleranceInput.value);
    } else if (trial_type === 'text') {
        trialData.question = textQuestionInput.value;
        trialData.answer_type = textAnswerTypeInput.value;

        if (trialData.answer_type === 'single_choice' || trialData.answer_type === 'numeric') {
            trialData.correct_answer = textCorrectAnswerSingleNumericInput.value;
        } else if (trialData.answer_type === 'multiple_options' || trialData.answer_type === 'ordering') {
            trialData.correct_answer = textCorrectAnswerMultiOrderingInput.value;
            // Guardar opciones como un array JSON
            trialData.options = textOptionsInput.value.split(';').map(item => item.trim()).filter(item => item !== '');
        }
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
        alert('Error al guardar la prueba.');
    } else {
        alert('Prueba guardada correctamente.');
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
        alert('Error al cargar la prueba para editar.');
        return;
    }

    trialIdInput.value = trial.id;
    trialTypeInput.value = trial.trial_type;
    trialOrderIndexInput.value = trial.order_index || '';
    trialNarrativeInput.value = trial.narrative;
    trialImageUrlInput.value = trial.image_url;
    trialAudioUrlInput.value = trial.audio_url;
    trialHintCountInput.value = trial.hint_count;
    trialHintCostInput.value = trial.hint_cost;

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
        alert('Error al eliminar la prueba.');
    } else {
        alert('Prueba eliminada correctamente.');
        viewTrials(current_location_id, current_location_name, current_location_is_selectable_trials);
    }
}


// --- Event Listeners ---

// Botones de navegación principal
createGameBtn.addEventListener('click', () => {
    resetForm(gameForm);
    formTitle.textContent = 'Crear Nuevo Juego';
    gameNameDisplay.textContent = '';
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
    fetchGames(); // Refrescar la lista de juegos
});
previewGameBtn.addEventListener('click', () => {
    if (current_game_id) {
        alert(`Funcionalidad de previsualización para el juego: ${current_game_name} (ID: ${current_game_id})\n\nEsta característica está pendiente de implementación. Aquí se renderizaría el juego tal como lo verían los jugadores.`);
    } else {
        alert('Por favor, selecciona o crea un juego para previsualizar.');
    }
});


// Formularios Submit
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

// Botones de navegación de Ubicaciones
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

// Botones de navegación de Pruebas
addTrialBtn.addEventListener('click', () => {
    resetForm(trialForm);
    trialFormTitle.textContent = 'Crear Nueva Prueba';
    showSection(trialFormSection);
    showTrialSpecificFields(); // Asegurarse de que no se muestre nada al inicio
});
cancelTrialBtn.addEventListener('click', () => {
    resetForm(trialForm);
    showSection(trialListSection);
});

// Lógica de visibilidad de campos de prueba
trialTypeInput.addEventListener('change', showTrialSpecificFields);
textAnswerTypeInput.addEventListener('change', showTrialSpecificFields);

// Cargar juegos al iniciar
document.addEventListener('DOMContentLoaded', fetchGames);