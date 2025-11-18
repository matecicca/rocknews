/**
 * @file authService.js
 * @description Servicio de autenticación con Supabase.
 */

import { supabase } from './supabaseClient'

/**
 * Inicia sesión con email y contraseña.
 * @param {string} email - Correo electrónico del usuario.
 * @param {string} password - Contraseña del usuario.
 * @returns {Promise<object>} Resultado del inicio de sesión.
 */
export async function signIn(email, password) {
  return await supabase.auth.signInWithPassword({ email, password })
}

/**
 * Registra un nuevo usuario.
 * @param {string} email - Correo electrónico del nuevo usuario.
 * @param {string} password - Contraseña del nuevo usuario.
 * @returns {Promise<object>} Resultado del registro.
 */
export async function signUp(email, password) {
  return await supabase.auth.signUp({ email, password })
}

/**
 * Cierra la sesión del usuario actual.
 * @returns {Promise<object>} Resultado del cierre de sesión.
 */
export async function signOut() {
  return await supabase.auth.signOut()
}

/**
 * Obtiene la sesión actual.
 * @returns {Promise<object|null>} Sesión activa o null si no hay sesión.
 */
export async function getSession() {
  const { data } = await supabase.auth.getSession()
  return data?.session || null
}

/**
 * Escucha los cambios en el estado de autenticación.
 * @param {Function} callback - Función a ejecutar cuando cambia el estado.
 * @returns {Function} Función para cancelar la suscripción.
 */
export function onAuthStateChange(callback) {
  const { data } = supabase.auth.onAuthStateChange((event, session) =>
    callback(event, session)
  )
  return () => data.subscription.unsubscribe()
}
