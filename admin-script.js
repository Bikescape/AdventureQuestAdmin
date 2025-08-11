// admin/supabase-config.js
// Configuración de Supabase (Admin)
const SUPABASE_URL = 'https://keunztapjynaavjjdmlb.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtldW56dGFwanluYWF2ampkbWxiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTM0NDQ2MTksImV4cCI6MjA2OTAyMDYxOX0.woiFMVYYtalXgYp6uTrflE4dg-1XCjS8bRfqMOf5eoY';

// Verificamos si window.supabase existe y si createClient está disponible
let supabase;
if (window.supabase && typeof window.supabase.createClient === 'function') {
    supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
    console.log('Supabase client inicializado correctamente.');
} else {
    console.error("Error: La librería de Supabase no se cargó correctamente. Asegúrate de que la etiqueta <script> del CDN esté antes de tus scripts modulares en el HTML.");
}

// Función de utilidad para mostrar alertas
function showAppAlert(message, type = 'info') {
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

// Añadir estilos para la alerta (si no existen)
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
        display: none;
        transition: all 0.3s ease-in-out;
    }
    .app-alert.info { background-color: #3b82f6; }
    .app-alert.success { background-color: #10b981; }
    .app-alert.warning { background-color: #f59e0b; }
    .app-alert.error { background-color: #ef4444; }
`;
document.head.appendChild(alertStyle);

// Exportar el cliente Supabase para su uso en otros módulos
export { supabase, showAppAlert };
