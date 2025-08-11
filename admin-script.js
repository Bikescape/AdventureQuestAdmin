// admin-script.js

// Importa el cliente de Supabase y la función de alerta desde el archivo de configuración
import { supabase, showAppAlert } from './admin-supabase-config.js';
console.log('admin-script.js cargado correctamente.');

// ==========================================================================================================
// ESTADO GLOBAL DE LA APLICACIÓN
// ==========================================================================================================
let currentUserId = null;
let currentGameId = null;
let currentAdventureType = null;
let currentLocationId = null;
let locationMap = null;
let locationMapMarker = null;

// Referencias a los elementos del DOM.
const gameListSection = document.getElementById('game-list-section');
const gameFormSection = document.getElementById('game-form-section');
const locationListSection = document.getElementById('location-list-section');
const locationFormSection = document.getElementById('location-form-section');
const trialListSection = document.getElementById('trial-list-section');
const trialFormSection = document.getElementById('trial-form-section');
const rankingsSummary = document.getElementById('rankings-summary');

// Formularios
const gameForm = document.getElementById('game-form');
const locationForm = document.getElementById('location-form');
const trialForm = document.getElementById('trial-form');

// Botones de navegación y acción
const createGameBtn = document.getElementById('create-game-btn');
const cancelGameBtn = document.getElementById('cancel-game-btn');
const backToGamesBtn = document.getElementById('back-to-games-btn');
const previewGameBtn = document.getElementById('preview-game-btn');
const addLocationBtn = document.getElementById('add-location-btn');
const cancelLocationBtn = document.getElementById('cancel-location-btn');
const backToLocationsBtn = document.getElementById('back-to-locations-btn');
const getCurrentLocationBtn = document.getElementById('getCurrentLocationBtn');
const addTrialBtn = document.getElementById('add-trial-btn');
const cancelTrialBtn = document.getElementById('cancel-trial-btn');
const backToTrialsBtn = document.getElementById('back-to-trials-btn');

// Otros elementos de UI
const trialTypeInput = document.getElementById('trial-type-input');
const textOptionsInput = document.getElementById('text-options'); // Obtenemos el campo de opciones
const textAnswerTypeInput = document.getElementById('text-answer-type-input');
const gameListDiv = document.getElementById('game-list');
const locationListDiv = document.getElementById('location-list');
const trialListDiv = document.getElementById('trial-list');
const gameFormTitle = document.getElementById('game-form-title');
const locationFormTitle = document.getElementById('location-form-title');
const trialFormTitle = document.getElementById('trial-form-title');
const gameNameHeader = document.getElementById('game-name-header');
const locationNameHeader = document.getElementById('location-name-header');


// ==========================================================================================================
// AUTENTICACIÓN
// ==========================================================================================================
async function setupAuth() {
    console.log('Iniciando proceso de autenticación...');
    // Verificamos si el cliente de Supabase se inicializó correctamente
    if (!supabase) {
        console.error("Supabase client no está disponible. No se puede iniciar la autenticación.");
        showAppAlert("Error de inicialización. Revisa la consola.", "error");
        return;
    }

    // Intenta obtener la sesión actual
    const { data: { session }, error } = await supabase.auth.getSession();
    if (error) {
        console.error("Error al obtener la sesión:", error);
        showAppAlert("Error de autenticación. Revisa la consola.", "error");
        return;
    }

    if (session) {
        currentUserId = session.user.id;
        console.log("Usuario autenticado con Supabase:", currentUserId);
        loadGames();
    } else {
        // Si no hay sesión, intenta iniciar sesión de forma anónima
        const { data, error } = await supabase.auth.signInAnonymously();
        if (error) {
            console.error("Error al iniciar sesión de forma anónima:", error);
            showAppAlert("No se pudo iniciar sesión. Revisa la consola.", "error");
            return;
        }
        if (data.user) {
            currentUserId = data.user.id;
            console.log("Sesión anónima iniciada con Supabase:", currentUserId);
            loadGames();
        } else {
            console.error("No se pudo obtener un usuario después del inicio de sesión anónimo.");
            showAppAlert("No se pudo iniciar sesión. Vuelve a intentarlo.", "error");
        }
    }
}


// ==========================================================================================================
// FUNCIONES DE UTILIDAD PARA LA UI
// ==========================================================================================================
function showSection(section) {
    const sections = [gameListSection, gameFormSection, locationListSection, locationFormSection, trialListSection, trialFormSection, rankingsSummary];
    sections.forEach(sec => sec.classList.add('hidden'));
    section.classList.remove('hidden');
}

function resetForm(form) {
    form.reset();
    document.getElementById('trial-form').dataset.trialId = '';
}

// ==========================================================================================================
// LÓGICA DE LOS FORMULARIOS Y EVENT LISTENERS
// ==========================================================================================================
document.addEventListener('DOMContentLoaded', () => {
    console.log('DOM completamente cargado. Inicializando la aplicación.');
    // Iniciar el proceso de autenticación y carga de juegos
    setupAuth();

    showSection(gameListSection);

    createGameBtn.addEventListener('click', () => {
        resetForm(gameForm);
        gameFormTitle.textContent = 'Crear Nuevo Juego';
        currentGameId = null;
        showSection(gameFormSection);
    });

    cancelGameBtn.addEventListener('click', () => {
        resetForm(gameForm);
        showSection(gameListSection);
    });

    backToGamesBtn.addEventListener('click', () => {
        currentGameId = null;
        currentLocationId = null;
        showSection(gameListSection);
    });

    addLocationBtn.addEventListener('click', () => {
        resetForm(locationForm);
        locationFormTitle.textContent = 'Crear Nueva Ubicación';
        currentLocationId = null;
        showSection(locationFormSection);
        initLocationMap();
    });

    cancelLocationBtn.addEventListener('click', () => {
        resetForm(locationForm);
        showSection(locationListSection);
    });

    backToLocationsBtn.addEventListener('click', () => {
        currentLocationId = null;
        showSection(locationListSection);
        loadLocations(currentGameId);
    });
    
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

    backToTrialsBtn.addEventListener('click', () => {
        showSection(trialListSection);
        loadTrials(currentLocationId);
    });

    trialTypeInput.addEventListener('change', showTrialSpecificFields);
    // NUEVO: Escuchar los cambios en el campo de opciones para generar dinámicamente los campos de caminos alternativos
    textOptionsInput.addEventListener('input', () => {
        if (trialTypeInput.value === 'multiple-choice' || trialTypeInput.value === 'ordering') {
            generateOptionPathFields();
        }
    });
    gameForm.addEventListener('submit', saveGame);
    locationForm.addEventListener('submit', saveLocation);
    trialForm.addEventListener('submit', saveTrial);
    getCurrentLocationBtn.addEventListener('click', getCurrentLocation);
});

// ==========================================================================================================
// CARGA DE DATOS (READ)
// ==========================================================================================================

async function loadGames() {
    console.log('Cargando juegos...');
    if (!currentUserId) {
        console.error("Usuario no autenticado. No se pueden cargar los juegos.");
        return;
    }
    const { data: games, error } = await supabase
        .from('games')
        .select('*')
        .eq('user_id', currentUserId);

    if (error) {
        console.error("Error al cargar los juegos:", error);
        showAppAlert('Error al cargar los juegos.', 'error');
        return;
    }

    gameListDiv.innerHTML = '';
    if (games.length === 0) {
        gameListDiv.innerHTML = '<p>No hay juegos creados. ¡Crea uno nuevo para empezar!</p>';
    } else {
        games.forEach(game => {
            const gameItem = document.createElement('div');
            gameItem.className = 'game-item';
            gameItem.innerHTML = `
                <div class="item-content">
                    <h3>${game.name}</h3>
                    <p>${game.adventureType === 'linear' ? 'Aventura Lineal' : 'Caminos Seleccionables'}</p>
                </div>
                <div class="item-actions">
                    <button class="edit-button" data-id="${game.id}">Editar</button>
                    <button class="view-button" data-id="${game.id}" data-name="${game.name}" data-type="${game.adventureType}">Ver Ubicaciones</button>
                    <button class="delete-button" data-id="${game.id}">Eliminar</button>
                </div>
            `;
            gameListDiv.appendChild(gameItem);
        });

        document.querySelectorAll('.game-item .edit-button').forEach(btn => {
            btn.addEventListener('click', (e) => editGame(e.target.dataset.id));
        });
        document.querySelectorAll('.game-item .view-button').forEach(btn => {
            btn.addEventListener('click', (e) => viewLocations(e.target.dataset.id, e.target.dataset.name, e.target.dataset.type));
        });
        document.querySelectorAll('.game-item .delete-button').forEach(btn => {
            btn.addEventListener('click', (e) => deleteGame(e.target.dataset.id));
        });
    }
}

async function loadLocations(gameId) {
    console.log(`Cargando ubicaciones para el juego ${gameId}...`);
    if (!currentUserId || !gameId) return;

    const { data: game, error: gameError } = await supabase.from('games').select('name').eq('id', gameId).single();
    if (gameError) {
        console.error("Error al obtener el nombre del juego:", gameError);
        return;
    }
    gameNameHeader.textContent = `Ubicaciones de: ${game.name}`;

    const { data: locations, error } = await supabase
        .from('locations')
        .select('*')
        .eq('game_id', gameId)
        .order('order', { ascending: true });

    if (error) {
        console.error("Error al cargar las ubicaciones:", error);
        showAppAlert('Error al cargar las ubicaciones.', 'error');
        return;
    }
    
    locationListDiv.innerHTML = '';
    if (locations.length === 0) {
        locationListDiv.innerHTML = '<p>No hay ubicaciones creadas. ¡Añade una nueva!</p>';
    } else {
        locations.forEach(loc => {
            const locationItem = document.createElement('div');
            locationItem.className = 'location-item';
            locationItem.innerHTML = `
                <div class="item-content">
                    <h3>${loc.name}</h3>
                    <p>Lat: ${loc.lat?.toFixed(4)}, Lng: ${loc.lng?.toFixed(4)}</p>
                </div>
                <div class="item-actions">
                    <button class="edit-button" data-id="${loc.id}">Editar</button>
                    <button class="view-button" data-id="${loc.id}" data-name="${loc.name}">Ver Pruebas</button>
                    <button class="delete-button" data-id="${loc.id}">Eliminar</button>
                </div>
            `;
            locationListDiv.appendChild(locationItem);
        });
        document.querySelectorAll('.location-item .edit-button').forEach(btn => {
            btn.addEventListener('click', (e) => editLocation(e.target.dataset.id));
        });
        document.querySelectorAll('.location-item .view-button').forEach(btn => {
            btn.addEventListener('click', (e) => viewTrials(e.target.dataset.id, e.target.dataset.name));
        });
        document.querySelectorAll('.location-item .delete-button').forEach(btn => {
            btn.addEventListener('click', (e) => deleteLocation(e.target.dataset.id));
        });
    }
}

async function loadTrials(locationId) {
    console.log(`Cargando pruebas para la ubicación ${locationId}...`);
    if (!currentUserId || !currentGameId || !locationId) return;
    const { data: location, error: locError } = await supabase.from('locations').select('name').eq('id', locationId).single();
    if (locError) {
        console.error("Error al obtener el nombre de la ubicación:", locError);
        return;
    }
    locationNameHeader.textContent = `Pruebas de: ${location.name}`;
    
    const { data: trials, error } = await supabase
        .from('trials')
        .select('*')
        .eq('location_id', locationId)
        .order('order', { ascending: true });

    if (error) {
        console.error("Error al cargar las pruebas:", error);
        showAppAlert('Error al cargar las pruebas.', 'error');
        return;
    }

    trialListDiv.innerHTML = '';
    if (trials.length === 0) {
        trialListDiv.innerHTML = '<p>No hay pruebas creadas. ¡Añade una nueva!</p>';
    } else {
        trials.forEach(trial => {
            const trialItem = document.createElement('div');
            trialItem.className = 'trial-item';
            trialItem.innerHTML = `
                <div class="item-content">
                    <h3>${trial.question}</h3>
                    <p>Tipo: ${trial.type}</p>
                </div>
                <div class="item-actions">
                    <button class="edit-button" data-id="${trial.id}">Editar</button>
                    <button class="delete-button" data-id="${trial.id}">Eliminar</button>
                </div>
            `;
            trialListDiv.appendChild(trialItem);
        });
        document.querySelectorAll('.trial-item .edit-button').forEach(btn => {
            btn.addEventListener('click', (e) => editTrial(e.target.dataset.id));
        });
        document.querySelectorAll('.trial-item .delete-button').forEach(btn => {
            btn.addEventListener('click', (e) => deleteTrial(e.target.dataset.id));
        });
    }
}

// ==========================================================================================================
// FUNCIONES PARA GUARDAR Y EDITAR DATOS (CREATE & UPDATE)
// ==========================================================================================================

async function saveGame(e) {
    console.log('Intentando guardar juego...');
    e.preventDefault();
    const gameName = document.getElementById('game-name-input').value;
    const adventureType = document.getElementById('adventure-type-input').value;
    if (!gameName || !adventureType) {
        showAppAlert('Por favor, completa todos los campos.', 'error');
        return;
    }
    // Verificamos si el cliente de Supabase se inicializó correctamente
    if (!supabase) {
        showAppAlert("Error de inicialización. No se puede guardar.", "error");
        return;
    }

    const gameData = {
        name: gameName,
        adventureType: adventureType,
        user_id: currentUserId
    };

    try {
        if (currentGameId) {
            const { error } = await supabase.from('games').update(gameData).eq('id', currentGameId);
            if (error) throw error;
            showAppAlert('Juego actualizado exitosamente.', 'success');
        } else {
            const { error } = await supabase.from('games').insert(gameData);
            if (error) throw error;
            showAppAlert('Juego creado exitosamente.', 'success');
        }
        showSection(gameListSection);
        loadGames();
    } catch (error) {
        console.error("Error al guardar el juego:", error.message);
        showAppAlert('Error al guardar el juego.', 'error');
    }
}

async function saveLocation(e) {
    console.log('Intentando guardar ubicación...');
    e.preventDefault();
    const locationName = document.getElementById('location-name-input').value;
    const lat = document.getElementById('location-lat-input').value;
    const lng = document.getElementById('location-lng-input').value;
    const radius = document.getElementById('location-radius-input').value;

    if (!locationName || !lat || !lng || !radius) {
        showAppAlert('Por favor, completa todos los campos.', 'error');
        return;
    }
    // Verificamos si el cliente de Supabase se inicializó correctamente
    if (!supabase) {
        showAppAlert("Error de inicialización. No se puede guardar.", "error");
        return;
    }

    const locationData = {
        name: locationName,
        lat: parseFloat(lat),
        lng: parseFloat(lng),
        radius: parseInt(radius, 10),
        order: parseInt(document.getElementById('location-order-input').value, 10) || 0,
        game_id: currentGameId
    };

    try {
        if (currentLocationId) {
            const { error } = await supabase.from('locations').update(locationData).eq('id', currentLocationId);
            if (error) throw error;
            showAppAlert('Ubicación actualizada exitosamente.', 'success');
        } else {
            const { error } = await supabase.from('locations').insert(locationData);
            if (error) throw error;
            showAppAlert('Ubicación creada exitosamente.', 'success');
        }
        showSection(locationListSection);
        loadLocations(currentGameId);
    } catch (error) {
        console.error("Error al guardar la ubicación:", error.message);
        showAppAlert('Error al guardar la ubicación.', 'error');
    }
}

async function saveTrial(e) {
    console.log('Intentando guardar prueba...');
    e.preventDefault();
    const trialType = trialTypeInput.value;
    const question = document.getElementById('trial-question-input').value;
    // La respuesta correcta para los campos de texto/numéricos se toma de aquí
    let correctAnswer = document.getElementById('correct-answer-input').value;
    const imageHint = document.getElementById('image-hint-input').value;

    if (!question || !trialType) {
        showAppAlert('Por favor, completa la pregunta y el tipo de prueba.', 'error');
        return;
    }
    // Verificamos si el cliente de Supabase se inicializó correctamente
    if (!supabase) {
        showAppAlert("Error de inicialización. No se puede guardar.", "error");
        return;
    }

    let trialData = {
        type: trialType,
        question: question,
        imageHint: imageHint,
        order: parseInt(document.getElementById('trial-order-input').value, 10) || 0,
        nextLocationId: null, // Se establece a null por defecto, y solo se usa para pruebas de respuesta única
        location_id: currentLocationId
    };
    
    // Asignar los campos específicos según el tipo de prueba
    if (trialType === 'text' || trialType === 'numeric') {
        trialData.correctAnswer = correctAnswer;
        trialData.nextLocationId = document.getElementById('next-location-id-input').value || null;
    } else if (trialType === 'multiple-choice' || trialType === 'ordering') {
        const options = document.getElementById('text-options').value.split(';').map(opt => opt.trim());
        const correctOptions = document.getElementById('text-correct-answer-multi-ordering').value;
        const nextLocationPaths = {};
        options.forEach((option, index) => {
            if (option) {
                const pathInput = document.getElementById(`next-path-${index}-input`);
                if (pathInput && pathInput.value) {
                    nextLocationPaths[option] = pathInput.value;
                }
            }
        });
        
        trialData = {
            ...trialData,
            options: options,
            correctOptions: correctOptions,
            nextLocationPaths: nextLocationPaths
        };
    } else if (trialType === 'proximity') {
        trialData.proximityTargetId = document.getElementById('proximity-target-input').value;
    }

    try {
        const trialId = document.getElementById('trial-form').dataset.trialId;
        if (trialId) {
            const { error } = await supabase.from('trials').update(trialData).eq('id', trialId);
            if (error) throw error;
            showAppAlert('Prueba actualizada exitosamente.', 'success');
        } else {
            const { error } = await supabase.from('trials').insert(trialData);
            if (error) throw error;
            showAppAlert('Prueba creada exitosamente.', 'success');
        }
        showSection(trialListSection);
        loadTrials(currentLocationId);
    } catch (error) {
        console.error("Error al guardar la prueba:", error.message);
        showAppAlert('Error al guardar la prueba.', 'error');
    }
}

// ==========================================================================================================
// FUNCIONES PARA EDITAR (READ & FILL FORM)
// ==========================================================================================================

async function editGame(gameId) {
    console.log(`Editando juego ${gameId}...`);
    // Verificamos si el cliente de Supabase se inicializó correctamente
    if (!supabase) {
        showAppAlert("Error de inicialización. No se puede editar.", "error");
        return;
    }
    const { data: game, error } = await supabase.from('games').select('*').eq('id', gameId).single();
    if (error) {
        console.error("Error al obtener el juego:", error.message);
        return;
    }
    gameFormTitle.textContent = `Editar Juego: ${game.name}`;
    document.getElementById('game-name-input').value = game.name;
    document.getElementById('adventure-type-input').value = game.adventureType;
    currentGameId = gameId;
    showSection(gameFormSection);
}

async function editLocation(locationId) {
    console.log(`Editando ubicación ${locationId}...`);
    // Verificamos si el cliente de Supabase se inicializó correctamente
    if (!supabase) {
        showAppAlert("Error de inicialización. No se puede editar.", "error");
        return;
    }
    const { data: loc, error } = await supabase.from('locations').select('*').eq('id', locationId).single();
    if (error) {
        console.error("Error al obtener la ubicación:", error.message);
        return;
    }
    locationFormTitle.textContent = `Editar Ubicación: ${loc.name}`;
    document.getElementById('location-name-input').value = loc.name;
    document.getElementById('location-lat-input').value = loc.lat;
    document.getElementById('location-lng-input').value = loc.lng;
    document.getElementById('location-radius-input').value = loc.radius;
    document.getElementById('location-order-input').value = loc.order;
    currentLocationId = locationId;
    showSection(locationFormSection);
    initLocationMap(loc.lat, loc.lng);
}

async function editTrial(trialId) {
    console.log(`Editando prueba ${trialId}...`);
    // Verificamos si el cliente de Supabase se inicializó correctamente
    if (!supabase) {
        showAppAlert("Error de inicialización. No se puede editar.", "error");
        return;
    }
    const { data: trial, error } = await supabase.from('trials').select('*').eq('id', trialId).single();
    if (error) {
        console.error("Error al obtener la prueba:", error.message);
        return;
    }

    trialFormTitle.textContent = `Editar Prueba: ${trial.question}`;
    document.getElementById('trial-form').dataset.trialId = trial.id;
    document.getElementById('trial-type-input').value = trial.type;
    document.getElementById('trial-question-input').value = trial.question;
    document.getElementById('image-hint-input').value = trial.imageHint;
    document.getElementById('correct-answer-input').value = trial.correctAnswer || '';
    document.getElementById('trial-order-input').value = trial.order;
    document.getElementById('next-location-id-input').value = trial.nextLocationId || '';

    // Llenar campos específicos de la prueba para las opciones y sus caminos
    if (trial.type === 'multiple-choice' || trial.type === 'ordering') {
        document.getElementById('text-options').value = trial.options?.join(';') || '';
        document.getElementById('text-correct-answer-multi-ordering').value = trial.correctOptions || '';
        // Esta llamada generará y rellenará los campos de caminos alternativos
        showTrialSpecificFields(); 
        if (trial.nextLocationPaths) {
            Object.keys(trial.nextLocationPaths).forEach((option) => {
                const pathInput = document.querySelector(`.option-path-field input[placeholder="ID de la próxima ubicación para '${option}'"]`);
                if (pathInput) {
                    pathInput.value = trial.nextLocationPaths[option];
                }
            });
        }
    } else if (trial.type === 'proximity') {
        document.getElementById('proximity-target-input').value = trial.proximityTargetId || '';
    }

    showSection(trialFormSection);
}

// ==========================================================================================================
// FUNCIONES DE VISTA (NAVIGATION)
// ==========================================================================================================
function viewLocations(gameId, gameName, adventureType) {
    console.log(`Viendo ubicaciones para el juego: ${gameId}`);
    currentGameId = gameId;
    currentAdventureType = adventureType;
    gameNameHeader.textContent = `Ubicaciones de: ${gameName}`;
    showSection(locationListSection);
    loadLocations(gameId);
}

function viewTrials(locationId, locationName) {
    console.log(`Viendo pruebas para la ubicación: ${locationId}`);
    currentLocationId = locationId;
    locationNameHeader.textContent = `Pruebas de: ${locationName}`;
    showSection(trialListSection);
    loadTrials(locationId);
}

// ==========================================================================================================
// FUNCIONES PARA ELIMINAR (DELETE)
// ==========================================================================================================

async function deleteGame(gameId) {
    if (confirm('¿Estás seguro de que quieres eliminar este juego y todas sus ubicaciones y pruebas?')) {
        try {
            // Verificamos si el cliente de Supabase se inicializó correctamente
            if (!supabase) {
                showAppAlert("Error de inicialización. No se puede eliminar.", "error");
                return;
            }
            const { error } = await supabase.from('games').delete().eq('id', gameId);
            if (error) throw error;
            showAppAlert('Juego eliminado.', 'success');
            loadGames();
        } catch (error) {
            console.error("Error al eliminar el juego:", error.message);
            showAppAlert('Error al eliminar el juego.', 'error');
        }
    }
}

async function deleteLocation(locationId) {
    if (confirm('¿Estás seguro de que quieres eliminar esta ubicación y todas sus pruebas?')) {
        try {
            // Verificamos si el cliente de Supabase se inicializó correctamente
            if (!supabase) {
                showAppAlert("Error de inicialización. No se puede eliminar.", "error");
                return;
            }
            const { error } = await supabase.from('locations').delete().eq('id', locationId);
            if (error) throw error;
            showAppAlert('Ubicación eliminada.', 'success');
            loadLocations(currentGameId);
        } catch (error) {
            console.error("Error al eliminar la ubicación:", error.message);
            showAppAlert('Error al eliminar la ubicación.', 'error');
        }
    }
}

async function deleteTrial(trialId) {
    if (confirm('¿Estás seguro de que quieres eliminar esta prueba?')) {
        try {
            // Verificamos si el cliente de Supabase se inicializó correctamente
            if (!supabase) {
                showAppAlert("Error de inicialización. No se puede eliminar.", "error");
                return;
            }
            const { error } = await supabase.from('trials').delete().eq('id', trialId);
            if (error) throw error;
            showAppAlert('Prueba eliminada.', 'success');
            loadTrials(currentLocationId);
        } catch (error) {
            console.error("Error al eliminar la prueba:", error.message);
            showAppAlert('Error al eliminar la prueba.', 'error');
        }
    }
}

// ==========================================================================================================
// LÓGICA DEL MAPA Y GEOLOCALIZACIÓN
// ==========================================================================================================

function initLocationMap(lat = 43.5357, lng = -5.6611) {
    if (locationMap) {
        locationMap.off();
        locationMap.remove();
    }
    const mapElement = document.getElementById('location-map');
    if (mapElement) {
        locationMap = L.map('location-map').setView([lat, lng], 13);
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        }).addTo(locationMap);

        locationMapMarker = L.marker([lat, lng]).addTo(locationMap);

        locationMap.on('click', (e) => {
            locationMapMarker.setLatLng(e.latlng);
            document.getElementById('location-lat-input').value = e.latlng.lat;
            document.getElementById('location-lng-input').value = e.latlng.lng;
        });
    }
}

function getCurrentLocation() {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(position => {
            const lat = position.coords.latitude;
            const lng = position.coords.longitude;
            document.getElementById('location-lat-input').value = lat;
            document.getElementById('location-lng-input').value = lng;
            if (locationMap) {
                locationMap.setView([lat, lng], 16);
                locationMapMarker.setLatLng([lat, lng]);
            }
        }, error => {
            console.error("Error obteniendo la ubicación:", error);
            showAppAlert('Error al obtener la ubicación actual.', 'error');
        });
    } else {
        showAppAlert('Tu navegador no soporta la geolocalización.', 'error');
    }
}

// ==========================================================================================================
// LÓGICA DE CAMPOS CONDICIONALES PARA PRUEBAS
// ==========================================================================================================
// Función que muestra los campos específicos según el tipo de prueba
function showTrialSpecificFields() {
    const trialType = trialTypeInput.value;
    const singleAnswerFields = document.getElementById('single-answer-fields');
    const multipleOptionsFields = document.getElementById('multiple-options-fields');
    const proximityFields = document.getElementById('proximity-fields');
    
    // Ocultar todos los campos específicos primero
    singleAnswerFields.classList.add('hidden');
    multipleOptionsFields.classList.add('hidden');
    proximityFields.classList.add('hidden');

    // Mostrar los campos relevantes según el tipo de prueba seleccionado
    switch (trialType) {
        case 'text':
        case 'numeric':
            singleAnswerFields.classList.remove('hidden');
            break;
        case 'multiple-choice':
        case 'ordering':
            multipleOptionsFields.classList.remove('hidden');
            generateOptionPathFields(); // Genera los campos para los caminos
            break;
        case 'proximity':
            proximityFields.classList.remove('hidden');
            break;
        default:
            break;
    }
}

// Genera dinámicamente los campos de camino para las pruebas de opciones múltiples
function generateOptionPathFields() {
    const optionsText = document.getElementById('text-options').value;
    const optionsArray = optionsText.split(';').map(opt => opt.trim()).filter(opt => opt.length > 0);
    const optionsPathsDiv = document.getElementById('multiple-options-paths');
    optionsPathsDiv.innerHTML = '';

    if (optionsArray.length > 0) {
        optionsArray.forEach((option, index) => {
            const field = document.createElement('div');
            field.className = 'option-path-field';
            field.innerHTML = `
                <label for="next-path-${index}-input">Próxima Ubicación para la opción "${option}":</label>
                <input type="text" id="next-path-${index}-input" placeholder="ID de la próxima ubicación para '${option}'">
            `;
            optionsPathsDiv.appendChild(field);
        });
    } else {
        optionsPathsDiv.innerHTML = '<p class="help-text">Introduce opciones en el campo de texto de arriba para configurar los caminos.</p>';
    }
}
