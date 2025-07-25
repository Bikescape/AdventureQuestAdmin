// admin-supabase-config.js
import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm';

// ¡IMPORTANTE! Reemplaza con tus propias credenciales de Supabase
const supabaseUrl = 'https://keunztapjynaavjjdmlb.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtldW56dGFwanluYWF2ampkbWxiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTM0NDQ2MTksImV4cCI6MjA2OTAyMDYxOX0.woiFMVYYtalXgYp6uTrflE4dg-1XCjS8bRfqMOf5eoY';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Puedes añadir una función simple de autenticación si el admin necesita login
// Por ahora, se asume que la Anon Key es suficiente para las operaciones de admin
// o que la autenticación se maneja fuera de esta aplicación.
// Si necesitas autenticación real de admin, házmelo saber.