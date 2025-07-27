// admin/supabase-config.js
// Configuración de Supabase (Admin)
// Asegúrate de reemplazar con tus propias credenciales de Supabase
const SUPABASE_URL = 'https://keunztapjynaavjjdmlb.supabase.co'; // Reemplaza con tu URL de Supabase
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtldW56dGFwanluYWF2ampkbWxiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTM0NDQ2MTksImV4cCI6MjA2OTAyMDYxOX0.woiFMVYYtalXgYp6uTrflE4dg-1XCjS8bRfqMOf5eoY'; // Reemplaza con tu clave anon de Supabase

// Se asume que el script de Supabase JS ya ha sido cargado en el HTML
// y ha expuesto la función createClient globalmente o en window.supabase
const { createClient } = window.supabase; // Acceso explícito a createClient desde window.supabase
const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// Función de utilidad para mostrar alertas (copia de shared/utils.js para evitar complejidad de módulos)
function showAlert(message, type = 'info') {
    let alertDiv = document.getElementById('app-alert');
    if (!alertDiv) {
        alertDiv = document.createElement('div');
        alertDiv.id = 'app-alert';
        document.body.appendChild(alertDiv);
    }

    alertDiv.textContent = message;
    alertDiv.className = `app-alert ${type}`; // Clase base y tipo (info, success, warning, error)
    alertDiv.style.display = 'block';

    setTimeout(() => {
        alertDiv.style.display = 'none';
    }, 3000); // Ocultar después de 3 segundos
}

// Añadir estilos para la alerta (puedes moverlo a styles.css si prefieres)
const alertStyle = document.createElement('style');
alertStyle.innerHTML = `
    .app-alert {
        position: fixed;
        bottom: 20px;
        left: 50%;
        transform: translateX(-50%);
        padding: 15px 25px;
        border-radius: 8px;
        color: white;
        font-weight: bold;
        z-index: 10000;
        box-shadow: 0 4px 12px rgba(0,0,0,0.2);
        display: none; /* Hidden by default */
        text-align: center;
    }
    .app-alert.info { background-color: #2196F3; }
    .app-alert.success { background-color: #4CAF50; }
    .app-alert.warning { background-color: #ff9800; }
    .app-alert.error { background-color: #f44336; }
`;
document.head.appendChild(alertStyle);