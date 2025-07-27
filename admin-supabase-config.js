// admin-supabase-config.js
// Asegúrate de reemplazar con tus propias credenciales de Supabase
const SUPABASE_URL = 'https://keunztapjynaavjjdmlb.supabase.co'; // Ej: https://abcdefghijklm.supabase.co
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtldW56dGFwanluYWF2ampkbWxiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTM0NDQ2MTksImV4cCI6MjA2OTAyMDYxOX0.woiFMVYYtalXgYp6uTrflE4dg-1XCjS8bRfqMOf5eoY'; // Ej: eyJhbGciOiJIUzI1Ni...

const supabase = supabase_js.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// console.log("Supabase client initialized:", supabase); // Para depuración