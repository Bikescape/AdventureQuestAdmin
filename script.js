// admin-script.js
import { supabase } from './admin-supabase-config.js';

// --- Elementos del DOM ---
const tabButtons = document.querySelectorAll('.tab-button');
const tabContents = document.querySelectorAll('.tab-content');

// Games
const gameList = document.getElementById('game-list');
const newGameBtn = document.getElementById('new-game-btn');
const gameFormContainer = document.getElementById('game-form-container');
const gameForm = document.getElementById('game-form');
const gameFormTitle = document.getElementById('game-form-title');
const gameIdInput = document.getElementById('game-id');
const gameTitleInput = document.getElementById('game-title');
const gameDescriptionInput = document.getElementById('game-description');
const gameMechanicsInput = document.getElementById('game-mechanics');
const gameNarrativeInput = document.getElementById('game-narrative');
const gameOrderSelect = document.getElementById('game-order');
const gameActiveInput = document.getElementById('game-active');
const gameFormCancelBtns = gameFormContainer.querySelectorAll('.cancel-button');

// Locations
const selectGameForLocations = document.getElementById('select-game-for-locations');
const newLocationBtn = document.getElementById('new-location-btn');
const locationList = document.getElementById('location-list');
const locationFormContainer = document.getElementById('location-form-container');
const locationForm = document.getElementById('location-form');
const locationFormTitle = document.getElementById('location-form-title');
const locationIdInput = document.getElementById('location-id');
const locationGameIdInput = document.getElementById('location-game-id');
const locationNarrativeInput = document.getElementById('location-narrative');
const locationImageUrlInput = document.getElementById('location-image-url');
const locationAudioUrlInput = document.getElementById('location-audio-url');
const locationLatitudeInput = document.getElementById('location-latitude');
const locationLongitudeInput = document.getElementById('location-longitude');
const locationRadiusInput = document.getElementById('location-radius');
const locationFormCancelBtns = locationFormContainer.querySelectorAll('.cancel-button');

// Trials
const selectGameForTrials = document.getElementById('select-game-for-trials');
const selectLocationForTrials = document.getElementById('select-location-for-trials');
const newTrialBtn = document.getElementById('new-trial-btn');
const trialList = document.getElementById('trial-list');
const trialFormContainer = document.getElementById('trial-form-container');
const trialForm = document.getElementById('trial-form');
const trialFormTitle = document.getElementById('trial-form-title');
const trialIdInput = document.getElementById('trial-id');
const trialLocationIdInput = document.getElementById('trial-location-id');
const trialTypeSelect = document.getElementById('trial-type');
const trialNarrativeInput = document.getElementById('trial-narrative');
const trialImageUrlInput = document.getElementById('trial-image-url');
const trialAudioUrlInput = document.getElementById('trial-audio-url');
const qrFields = document.getElementById('qr-fields');
const qrContentInput = document.getElementById('qr-content');
const gpsFields = document.getElementById('gps-fields');
const gpsLatitudeInput = document.getElementById('gps-latitude');
const gpsLongitudeInput = document.getElementById('gps-longitude');
const gpsRadiusInput = document.getElementById('gps-radius');
const textFields = document.getElementById('text-fields');
const textQuestionInput = document.getElementById('text-question');
const textAnswerTypeSelect = document.getElementById('text-answer-type');
const textCorrectAnswerInput = document.getElementById('text-correct-answer');
const hintCountInput = document.getElementById('hint-count');
const hintCostInput = document.getElementById('hint-cost');
const trialFormCancelBtns = trialFormContainer.querySelectorAll('.cancel-button');

// Rankings
const selectGameForRankings = document.getElementById('select-game-for-rankings');
const rankingList = document.getElementById('ranking-list');

// Confirmation Overlay
const confirmOverlay = document.getElementById('confirm-overlay');
const confirmDeleteBtn = document.getElementById('confirm-delete-btn');
const cancelDeleteBtn = document.getElementById('cancel-delete-btn');
let itemToDelete = null; // Para almacenar el ID del elemento a eliminar
let deleteEntityType = ''; // 'game', 'location', 'trial'

// --- Inicialización ---
document.addEventListener('DOMContentLoaded', () => {
    setupTabs();
    loadGames(); // Carga inicial de juegos
    populateGameSelects(); // Rellena los selects de juegos en otras pestañas
});

// --- Funciones de Tabs ---
function setupTabs() {
    tabButtons.forEach(button => {
        button.addEventListener('click', () => {
            const tabId = button.dataset.tab;
            activateTab(tabId);
        });
    });
}

function activateTab(tabId) {
    tabButtons.forEach(button => button.classList.remove('active'));
    tabContents.forEach(content => content.classList.remove('active'));

    document.querySelector(`.tab-button[data-tab="${tabId}"]`).classList.add('active');
    document.getElementById(tabId).classList.add('active');

    // Cargar datos específicos al activar la pestaña
    if (tabId === 'games-management') {
        loadGames();
    } else if (tabId === 'locations-management') {
        loadGamesForSelect(selectGameForLocations);
        locationList.innerHTML = '<p>Selecciona un juego para ver sus localizaciones.</p>';
        newLocationBtn.style.display = 'none';
        hideForm(locationFormContainer);
    } else if (tabId === 'trials-management') {
        loadGamesForSelect(selectGameForTrials);
        selectLocationForTrials.innerHTML = '<option value="">Selecciona una Localización</option>';
        selectLocationForTrials.disabled = true;
        trialList.innerHTML = '<p>Selecciona un juego y una localización para ver sus pruebas.</p>';
        newTrialBtn.style.display = 'none';
        hideForm(trialFormContainer);
    } else if (tabId === 'rankings-view') {
        loadGamesForSelect(selectGameForRankings);
        rankingList.innerHTML = '<p>Selecciona un juego para ver su ranking.</p>';
    }
}

// --- Funciones Auxiliares de UI ---
function showForm(formContainer, title) {
    formContainer.style.display = 'block';
    formContainer.querySelector('h3 span').textContent = title;
}

function hideForm(formContainer) {
    formContainer.style.display = 'none';
    formContainer.querySelector('form').reset(); // Limpia el formulario
}

function populateGameSelects() {
    loadGamesForSelect(selectGameForLocations);
    loadGamesForSelect(selectGameForTrials);
    loadGamesForSelect(selectGameForRankings);
}

async function loadGamesForSelect(selectElement) {
    selectElement.innerHTML = '<option value="">Selecciona un Juego</option>';
    const { data: games, error } = await supabase.from('games').select('id, title').order('title');
    if (error) {
        console.error('Error cargando juegos para select:', error.message);
        return;
    }
    games.forEach(game => {
        const option = document.createElement('option');
        option.value = game.id;
        option.textContent = game.title;
        selectElement.appendChild(option);
    });
}

// --- Gestión de Games ---
newGameBtn.addEventListener('click', () => {
    gameIdInput.value = ''; // Limpiar para nueva creación
    showForm(gameFormContainer, 'Crear Nuevo Juego');
});

gameFormCancelBtns.forEach(btn => btn.addEventListener('click', () => hideForm(gameFormContainer)));

gameForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const gameData = {
        title: gameTitleInput.value,
        description: gameDescriptionInput.value,
        mechanics: gameMechanicsInput.value,
        narrative: gameNarrativeInput.value,
        order: gameOrderSelect.value,
        isActive: gameActiveInput.checked
    };

    if (gameIdInput.value) {
        // Editar juego existente
        const { error } = await supabase.from('games').update(gameData).eq('id', gameIdInput.value);
        if (error) {
            console.error('Error actualizando juego:', error.message);
            alert('Error al actualizar el juego.');
        } else {
            alert('Juego actualizado con éxito.');
            hideForm(gameFormContainer);
            loadGames();
            populateGameSelects();
        }
    } else {
        // Crear nuevo juego
        const { error } = await supabase.from('games').insert([gameData]);
        if (error) {
            console.error('Error creando juego:', error.message);
            alert('Error al crear el juego.');
        } else {
            alert('Juego creado con éxito.');
            hideForm(gameFormContainer);
            loadGames();
            populateGameSelects();
        }
    }
});

async function loadGames() {
    gameList.innerHTML = '<p>Cargando juegos...</p>';
    const { data: games, error } = await supabase.from('games').select('*').order('created_at', { ascending: false });
    if (error) {
        console.error('Error cargando juegos:', error.message);
        gameList.innerHTML = '<p>Error al cargar los juegos.</p>';
        return;
    }

    gameList.innerHTML = '';
    if (games.length === 0) {
        gameList.innerHTML = '<p>No hay juegos creados aún.</p>';
        return;
    }

    games.forEach(game => {
        const div = document.createElement('div');
        div.classList.add('list-item');
        div.innerHTML = `
            <div>
                <h4>${game.title}</h4>
                <p>${game.description || 'Sin descripción'}</p>
                <small>Estado: ${game.isActive ? 'Activo' : 'Inactivo'} | Orden: ${game.order}</small>
            </div>
            <div class="actions">
                <button class="edit-button" data-id="${game.id}">Editar</button>
                <button class="delete-button" data-id="${game.id}">Eliminar</button>
            </div>
        `;
        gameList.appendChild(div);
    });

    // Añadir event listeners a los botones generados
    gameList.querySelectorAll('.edit-button').forEach(button => {
        button.addEventListener('click', (e) => editGame(e.target.dataset.id));
    });
    gameList.querySelectorAll('.delete-button').forEach(button => {
        button.addEventListener('click', (e) => confirmDelete(e.target.dataset.id, 'game'));
    });
}

async function editGame(id) {
    const { data: game, error } = await supabase.from('games').select('*').eq('id', id).single();
    if (error) {
        console.error('Error cargando juego para editar:', error.message);
        alert('Error al cargar el juego para editar.');
        return;
    }

    gameIdInput.value = game.id;
    gameTitleInput.value = game.title;
    gameDescriptionInput.value = game.description;
    gameMechanicsInput.value = game.mechanics;
    gameNarrativeInput.value = game.narrative;
    gameOrderSelect.value = game.order;
    gameActiveInput.checked = game.isActive;

    showForm(gameFormContainer, 'Editar Juego');
}

// --- Gestión de Localizaciones ---
selectGameForLocations.addEventListener('change', () => {
    const gameId = selectGameForLocations.value;
    if (gameId) {
        loadLocations(gameId);
        newLocationBtn.style.display = 'inline-block';
        locationGameIdInput.value = gameId; // Establecer el game_id para nuevas localizaciones
    } else {
        locationList.innerHTML = '<p>Selecciona un juego para ver sus localizaciones.</p>';
        newLocationBtn.style.display = 'none';
    }
    hideForm(locationFormContainer);
});

newLocationBtn.addEventListener('click', () => {
    locationIdInput.value = ''; // Limpiar para nueva creación
    showForm(locationFormContainer, 'Añadir Nueva Localización');
});

locationFormCancelBtns.forEach(btn => btn.addEventListener('click', () => hideForm(locationFormContainer)));

locationForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const locationData = {
        game_id: locationGameIdInput.value,
        narrative: locationNarrativeInput.value,
        image_url: locationImageUrlInput.value,
        audio_url: locationAudioUrlInput.value,
        latitude: parseFloat(locationLatitudeInput.value),
        longitude: parseFloat(locationLongitudeInput.value),
        radius: parseInt(locationRadiusInput.value)
    };

    if (locationIdInput.value) {
        // Editar localización existente
        const { error } = await supabase.from('locations').update(locationData).eq('id', locationIdInput.value);
        if (error) {
            console.error('Error actualizando localización:', error.message);
            alert('Error al actualizar la localización.');
        } else {
            alert('Localización actualizada con éxito.');
            hideForm(locationFormContainer);
            loadLocations(locationGameIdInput.value);
        }
    } else {
        // Crear nueva localización
        const { error } = await supabase.from('locations').insert([locationData]);
        if (error) {
            console.error('Error creando localización:', error.message);
            alert('Error al crear la localización.');
        } else {
            alert('Localización creada con éxito.');
            hideForm(locationFormContainer);
            loadLocations(locationGameIdInput.value);
        }
    }
});

async function loadLocations(gameId) {
    locationList.innerHTML = '<p>Cargando localizaciones...</p>';
    const { data: locations, error } = await supabase.from('locations').select('*').eq('game_id', gameId).order('created_at');
    if (error) {
        console.error('Error cargando localizaciones:', error.message);
        locationList.innerHTML = '<p>Error al cargar las localizaciones.</p>';
        return;
    }

    locationList.innerHTML = '';
    if (locations.length === 0) {
        locationList.innerHTML = '<p>No hay localizaciones para este juego aún.</p>';
        return;
    }

    locations.forEach(location => {
        const div = document.createElement('div');
        div.classList.add('list-item');
        div.innerHTML = `
            <div>
                <h4>Localización: ${location.narrative.substring(0, 50)}...</h4>
                <p>GPS: Lat ${location.latitude}, Lon ${location.longitude} (Radio: ${location.radius}m)</p>
                ${location.image_url ? `<small>Img: ${location.image_url.substring(0, 30)}...</small><br>` : ''}
                ${location.audio_url ? `<small>Aud: ${location.audio_url.substring(0, 30)}...</small>` : ''}
            </div>
            <div class="actions">
                <button class="edit-button" data-id="${location.id}">Editar</button>
                <button class="delete-button" data-id="${location.id}">Eliminar</button>
            </div>
        `;
        locationList.appendChild(div);
    });

    locationList.querySelectorAll('.edit-button').forEach(button => {
        button.addEventListener('click', (e) => editLocation(e.target.dataset.id));
    });
    locationList.querySelectorAll('.delete-button').forEach(button => {
        button.addEventListener('click', (e) => confirmDelete(e.target.dataset.id, 'location'));
    });
}

async function editLocation(id) {
    const { data: location, error } = await supabase.from('locations').select('*').eq('id', id).single();
    if (error) {
        console.error('Error cargando localización para editar:', error.message);
        alert('Error al cargar la localización para editar.');
        return;
    }

    locationIdInput.value = location.id;
    locationGameIdInput.value = location.game_id; // Asegurar que el game_id se mantenga
    locationNarrativeInput.value = location.narrative;
    locationImageUrlInput.value = location.image_url || '';
    locationAudioUrlInput.value = location.audio_url || '';
    locationLatitudeInput.value = location.latitude;
    locationLongitudeInput.value = location.longitude;
    locationRadiusInput.value = location.radius;

    showForm(locationFormContainer, 'Editar Localización');
}

// --- Gestión de Pruebas ---
selectGameForTrials.addEventListener('change', () => {
    const gameId = selectGameForTrials.value;
    selectLocationForTrials.innerHTML = '<option value="">Selecciona una Localización</option>';
    trialList.innerHTML = '<p>Selecciona una localización para ver sus pruebas.</p>';
    newTrialBtn.style.display = 'none';
    hideForm(trialFormContainer);

    if (gameId) {
        loadLocationsForTrialSelect(gameId);
        selectLocationForTrials.disabled = false;
    } else {
        selectLocationForTrials.disabled = true;
    }
});

selectLocationForTrials.addEventListener('change', () => {
    const locationId = selectLocationForTrials.value;
    if (locationId) {
        loadTrials(locationId);
        newTrialBtn.style.display = 'inline-block';
        trialLocationIdInput.value = locationId; // Establecer el location_id para nuevas pruebas
    } else {
        trialList.innerHTML = '<p>Selecciona una localización para ver sus pruebas.</p>';
        newTrialBtn.style.display = 'none';
    }
    hideForm(trialFormContainer);
});

async function loadLocationsForTrialSelect(gameId) {
    const { data: locations, error } = await supabase.from('locations').select('id, narrative').eq('game_id', gameId).order('narrative');
    if (error) {
        console.error('Error cargando localizaciones para select:', error.message);
        return;
    }
    locations.forEach(loc => {
        const option = document.createElement('option');
        option.value = loc.id;
        option.textContent = loc.narrative.substring(0, 50) + '...';
        selectLocationForTrials.appendChild(option);
    });
}

newTrialBtn.addEventListener('click', () => {
    trialIdInput.value = ''; // Limpiar para nueva creación
    showForm(trialFormContainer, 'Añadir Nueva Prueba');
    toggleTrialTypeFields(); // Ocultar todos los campos al inicio
});

trialFormCancelBtns.forEach(btn => btn.addEventListener('click', () => hideForm(trialFormContainer)));

trialTypeSelect.addEventListener('change', toggleTrialTypeFields);

function toggleTrialTypeFields() {
    const selectedType = trialTypeSelect.value;
    qrFields.style.display = 'none';
    gpsFields.style.display = 'none';
    textFields.style.display = 'none';

    // Limpiar valores de campos ocultos para evitar enviar datos incorrectos
    qrContentInput.value = '';
    gpsLatitudeInput.value = '';
    gpsLongitudeInput.value = '';
    gpsRadiusInput.value = 5;
    textQuestionInput.value = '';
    textAnswerTypeSelect.value = 'single';
    textCorrectAnswerInput.value = '';

    if (selectedType === 'qr') {
        qrFields.style.display = 'block';
    } else if (selectedType === 'gps') {
        gpsFields.style.display = 'block';
    } else if (selectedType === 'text') {
        textFields.style.display = 'block';
    }
}

trialForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const trialType = trialTypeSelect.value;
    let trialData = {
        location_id: trialLocationIdInput.value,
        type: trialType,
        narrative: trialNarrativeInput.value,
        image_url: trialImageUrlInput.value,
        audio_url: trialAudioUrlInput.value,
        hint_count: parseInt(hintCountInput.value),
        hint_cost: parseInt(hintCostInput.value)
    };

    if (trialType === 'qr') {
        trialData.qr_content = qrContentInput.value;
    } else if (trialType === 'gps') {
        trialData.gps_latitude = parseFloat(gpsLatitudeInput.value);
        trialData.gps_longitude = parseFloat(gpsLongitudeInput.value);
        trialData.gps_radius = parseInt(gpsRadiusInput.value);
    } else if (trialType === 'text') {
        trialData.text_question = textQuestionInput.value;
        trialData.text_answer_type = textAnswerTypeSelect.value;
        trialData.text_correct_answer = textCorrectAnswerInput.value;
    }

    if (trialIdInput.value) {
        // Editar prueba existente
        const { error } = await supabase.from('trials').update(trialData).eq('id', trialIdInput.value);
        if (error) {
            console.error('Error actualizando prueba:', error.message);
            alert('Error al actualizar la prueba.');
        } else {
            alert('Prueba actualizada con éxito.');
            hideForm(trialFormContainer);
            loadTrials(trialLocationIdInput.value);
        }
    } else {
        // Crear nueva prueba
        const { error } = await supabase.from('trials').insert([trialData]);
        if (error) {
            console.error('Error creando prueba:', error.message);
            alert('Error al crear la prueba.');
        } else {
            alert('Prueba creada con éxito.');
            hideForm(trialFormContainer);
            loadTrials(trialLocationIdInput.value);
        }
    }
});

async function loadTrials(locationId) {
    trialList.innerHTML = '<p>Cargando pruebas...</p>';
    const { data: trials, error } = await supabase.from('trials').select('*').eq('location_id', locationId).order('created_at');
    if (error) {
        console.error('Error cargando pruebas:', error.message);
        trialList.innerHTML = '<p>Error al cargar las pruebas.</p>';
        return;
    }

    trialList.innerHTML = '';
    if (trials.length === 0) {
        trialList.innerHTML = '<p>No hay pruebas para esta localización aún.</p>';
        return;
    }

    trials.forEach(trial => {
        const div = document.createElement('div');
        div.classList.add('list-item');
        let detail = '';
        if (trial.type === 'qr') detail = `QR: ${trial.qr_content}`;
        else if (trial.type === 'gps') detail = `GPS: Lat ${trial.gps_latitude}, Lon ${trial.gps_longitude} (Radio: ${trial.gps_radius}m)`;
        else if (trial.type === 'text') detail = `Pregunta: ${trial.text_question.substring(0, 50)}...`;

        div.innerHTML = `
            <div>
                <h4>Prueba (${trial.type.toUpperCase()}): ${trial.narrative.substring(0, 50)}...</h4>
                <p>${detail}</p>
                <small>Pistas: ${trial.hint_count} (Coste: ${trial.hint_cost} ptos)</small>
            </div>
            <div class="actions">
                <button class="edit-button" data-id="${trial.id}">Editar</button>
                <button class="delete-button" data-id="${trial.id}">Eliminar</button>
            </div>
        `;
        trialList.appendChild(div);
    });

    trialList.querySelectorAll('.edit-button').forEach(button => {
        button.addEventListener('click', (e) => editTrial(e.target.dataset.id));
    });
    trialList.querySelectorAll('.delete-button').forEach(button => {
        button.addEventListener('click', (e) => confirmDelete(e.target.dataset.id, 'trial'));
    });
}

async function editTrial(id) {
    const { data: trial, error } = await supabase.from('trials').select('*').eq('id', id).single();
    if (error) {
        console.error('Error cargando prueba para editar:', error.message);
        alert('Error al cargar la prueba para editar.');
        return;
    }

    trialIdInput.value = trial.id;
    trialLocationIdInput.value = trial.location_id;
    trialTypeSelect.value = trial.type;
    trialNarrativeInput.value = trial.narrative;
    trialImageUrlInput.value = trial.image_url || '';
    trialAudioUrlInput.value = trial.audio_url || '';
    hintCountInput.value = trial.hint_count;
    hintCostInput.value = trial.hint_cost;

    // Rellenar campos específicos del tipo de prueba
    toggleTrialTypeFields(); // Asegura que solo el campo correcto sea visible
    if (trial.type === 'qr') {
        qrContentInput.value = trial.qr_content || '';
    } else if (trial.type === 'gps') {
        gpsLatitudeInput.value = trial.gps_latitude || '';
        gpsLongitudeInput.value = trial.gps_longitude || '';
        gpsRadiusInput.value = trial.gps_radius || 5;
    } else if (trial.type === 'text') {
        textQuestionInput.value = trial.text_question || '';
        textAnswerTypeSelect.value = trial.text_answer_type || 'single';
        textCorrectAnswerInput.value = trial.text_correct_answer || '';
    }

    showForm(trialFormContainer, 'Editar Prueba');
}

// --- Gestión de Rankings ---
selectGameForRankings.addEventListener('change', () => {
    const gameId = selectGameForRankings.value;
    if (gameId) {
        loadRankings(gameId);
    } else {
        rankingList.innerHTML = '<p>Selecciona un juego para ver su ranking.</p>';
    }
});

async function loadRankings(gameId) {
    rankingList.innerHTML = '<p>Cargando rankings...</p>';
    // Aquí cargarías los datos de equipos/completiones del juego desde Supabase
    // Esto es un placeholder ya que la tabla 'teams' o 'game_completions' no está definida aquí
    // Se asume que 'teams' tendrá 'game_id', 'total_score', 'total_time', 'team_name'
    const { data: rankings, error } = await supabase
        .from('teams') // Asumiendo que los equipos guardan su puntuación final y tiempo
        .select('team_name, total_score, total_time')
        .eq('game_id', gameId)
        .order('total_score', { ascending: false }) // Primero por puntuación (desc)
        .order('total_time', { ascending: true }) // Luego por tiempo (asc)
        .limit(10); // Top 10

    if (error) {
        console.error('Error cargando rankings:', error.message);
        rankingList.innerHTML = '<p>Error al cargar los rankings.</p>';
        return;
    }

    rankingList.innerHTML = '';
    if (rankings.length === 0) {
        rankingList.innerHTML = '<p>No hay datos de ranking para este juego aún.</p>';
        return;
    }

    const ul = document.createElement('ul');
    rankings.forEach((rank, index) => {
        const li = document.createElement('li');
        const minutes = String(Math.floor(rank.total_time / 60)).padStart(2, '0');
        const seconds = String(rank.total_time % 60).padStart(2, '0');
        li.innerHTML = `<strong>${index + 1}. ${rank.team_name}</strong> - Puntos: ${rank.total_score} - Tiempo: ${minutes}:${seconds}`;
        ul.appendChild(li);
    });
    rankingList.appendChild(ul);
}


// --- Lógica de Confirmación de Eliminación ---
function confirmDelete(id, entityType) {
    itemToDelete = id;
    deleteEntityType = entityType;
    confirmOverlay.style.display = 'flex';
}

confirmDeleteBtn.addEventListener('click', async () => {
    confirmOverlay.style.display = 'none';
    if (!itemToDelete || !deleteEntityType) return;

    let error = null;
    if (deleteEntityType === 'game') {
        // Eliminar juego y sus localizaciones y pruebas asociadas
        // Esto requerirá CASCADE DELETE en Supabase o manejo manual
        const { error: locError } = await supabase.from('locations').delete().eq('game_id', itemToDelete);
        const { error: trialError } = await supabase.from('trials').delete().in('location_id', supabase.from('locations').select('id').eq('game_id', itemToDelete));
        const { error: gameError } = await supabase.from('games').delete().eq('id', itemToDelete);
        error = gameError || locError || trialError;

    } else if (deleteEntityType === 'location') {
        // Eliminar localización y sus pruebas asociadas
        const { error: trialError } = await supabase.from('trials').delete().eq('location_id', itemToDelete);
        const { error: locError } = await supabase.from('locations').delete().eq('id', itemToDelete);
        error = locError || trialError;

    } else if (deleteEntityType === 'trial') {
        const { error: trialError } = await supabase.from('trials').delete().eq('id', itemToDelete);
        error = trialError;
    }

    if (error) {
        console.error(`Error eliminando ${deleteEntityType}:`, error.message);
        alert(`Error al eliminar ${deleteEntityType}.`);
    } else {
        alert(`${deleteEntityType.charAt(0).toUpperCase() + deleteEntityType.slice(1)} eliminado con éxito.`);
        // Recargar la lista apropiada
        if (deleteEntityType === 'game') {
            loadGames();
            populateGameSelects();
            activateTab('games-management'); // Volver a la pestaña de juegos
        } else if (deleteEntityType === 'location') {
            const currentGameId = selectGameForLocations.value;
            if (currentGameId) loadLocations(currentGameId);
            activateTab('locations-management');
        } else if (deleteEntityType === 'trial') {
            const currentLocationId = selectLocationForTrials.value;
            if (currentLocationId) loadTrials(currentLocationId);
            activateTab('trials-management');
        }
    }
    itemToDelete = null;
    deleteEntityType = '';
});

cancelDeleteBtn.addEventListener('click', () => {
    confirmOverlay.style.display = 'none';
    itemToDelete = null;
    deleteEntityType = '';
});

// --- Configuración inicial de Supabase (tablas y RLS) ---
// Estas instrucciones NO van en el código JS, son para que las apliques en tu consola de Supabase.
/*
¡IMPORTANTE! Antes de usar la aplicación, debes configurar tu base de datos Supabase:

1.  **Crea un nuevo proyecto en Supabase.**
2.  **Copia tus credenciales de Supabase (URL y Anon Key)** en `admin-supabase-config.js`.
3.  **Ejecuta las siguientes sentencias SQL en el "SQL Editor" de tu proyecto Supabase** para crear las tablas y configurar el Row Level Security (RLS). Esto es CRÍTICO para que la aplicación funcione y sea segura.

    ```sql
    -- Tabla de Juegos
    CREATE TABLE public.games (
        id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
        title text NOT NULL,
        description text,
        mechanics text,
        narrative text,
        "order" text DEFAULT 'linear'::text NOT NULL, -- 'linear' o 'selectable'
        "isActive" boolean DEFAULT false NOT NULL,
        created_at timestamp with time zone DEFAULT now() NOT NULL
    );

    ALTER TABLE public.games ENABLE ROW LEVEL SECURITY;

    CREATE POLICY "Allow authenticated read access to games" ON public.games FOR SELECT USING (true);
    CREATE POLICY "Allow authenticated insert access to games" ON public.games FOR INSERT WITH CHECK (true);
    CREATE POLICY "Allow authenticated update access to games" ON public.games FOR UPDATE USING (true);
    CREATE POLICY "Allow authenticated delete access to games" ON public.games FOR DELETE USING (true);


    -- Tabla de Localizaciones
    CREATE TABLE public.locations (
        id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
        game_id uuid REFERENCES public.games(id) ON DELETE CASCADE NOT NULL,
        narrative text NOT NULL,
        image_url text,
        audio_url text,
        latitude double precision NOT NULL,
        longitude double precision NOT NULL,
        radius integer DEFAULT 10 NOT NULL,
        created_at timestamp with time zone DEFAULT now() NOT NULL
    );

    ALTER TABLE public.locations ENABLE ROW LEVEL SECURITY;

    CREATE POLICY "Allow authenticated read access to locations" ON public.locations FOR SELECT USING (true);
    CREATE POLICY "Allow authenticated insert access to locations" ON public.locations FOR INSERT WITH CHECK (true);
    CREATE POLICY "Allow authenticated update access to locations" ON public.locations FOR UPDATE USING (true);
    CREATE POLICY "Allow authenticated delete access to locations" ON public.locations FOR DELETE USING (true);


    -- Tabla de Pruebas
    CREATE TABLE public.trials (
        id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
        location_id uuid REFERENCES public.locations(id) ON DELETE CASCADE NOT NULL,
        type text NOT NULL, -- 'qr', 'gps', 'text'
        narrative text NOT NULL,
        image_url text,
        audio_url text,
        hint_count integer DEFAULT 0 NOT NULL,
        hint_cost integer DEFAULT 10 NOT NULL,
        -- Campos específicos para QR
        qr_content text,
        -- Campos específicos para GPS
        gps_latitude double precision,
        gps_longitude double precision,
        gps_radius integer DEFAULT 5,
        -- Campos específicos para Texto
        text_question text,
        text_answer_type text, -- 'single', 'numeric', 'multiple', 'ordering'
        text_correct_answer text,
        created_at timestamp with time zone DEFAULT now() NOT NULL
    );

    ALTER TABLE public.trials ENABLE ROW LEVEL SECURITY;

    CREATE POLICY "Allow authenticated read access to trials" ON public.trials FOR SELECT USING (true);
    CREATE POLICY "Allow authenticated insert access to trials" ON public.trials FOR INSERT WITH CHECK (true);
    CREATE POLICY "Allow authenticated update access to trials" ON public.trials FOR UPDATE USING (true);
    CREATE POLICY "Allow authenticated delete access to trials" ON public.trials FOR DELETE USING (true);


    -- Tabla de Equipos (para el componente de Jugador y Rankings)
    CREATE TABLE public.teams (
        id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
        game_id uuid REFERENCES public.games(id) ON DELETE CASCADE NOT NULL,
        team_name text NOT NULL,
        current_location_id uuid REFERENCES public.locations(id),
        current_trial_id uuid REFERENCES public.trials(id),
        start_time timestamp with time zone,
        last_trial_start_time timestamp with time zone,
        pistas_used_global integer DEFAULT 0,
        pistas_used_per_trial jsonb DEFAULT '[]'::jsonb, -- [{trialId: 'uuid', count: 2}]
        total_time integer DEFAULT 0, -- en segundos
        total_score integer DEFAULT 0,
        progress_log jsonb DEFAULT '[]'::jsonb, -- [{locationId: 'uuid', trialId: 'uuid', timeTaken: 60, score: 90, hintsUsed: 1, timestamp: 'iso-string'}]
        last_activity timestamp with time zone DEFAULT now(),
        created_at timestamp with time zone DEFAULT now() NOT NULL
    );

    ALTER TABLE public.teams ENABLE ROW LEVEL SECURITY;

    -- Las políticas para 'teams' en el lado del admin pueden ser 'true' para todas las operaciones si el admin las gestiona.
    -- Para el jugador, las políticas serán más restrictivas (ej. un jugador solo puede leer/actualizar su propio equipo).
    -- Aquí se asume que el admin tiene control total:
    CREATE POLICY "Allow authenticated read access to teams" ON public.teams FOR SELECT USING (true);
    CREATE POLICY "Allow authenticated insert access to teams" ON public.teams FOR INSERT WITH CHECK (true);
    CREATE POLICY "Allow authenticated update access to teams" ON public.teams FOR UPDATE USING (true);
    CREATE POLICY "Allow authenticated delete access to teams" ON public.teams FOR DELETE USING (true);

    -- Habilitar extension para uuid_generate_v4
    CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
    ```
*/