/**
 * @file profileService.js
 * @description Servicio para la gestión de perfiles de usuario en la tabla `profiles`.
 */

import { supabase } from './supabaseClient'

/**
 * Obtiene un perfil por su ID.
 * @param {string} id - ID del usuario (UUID).
 * @returns {Promise<object|null>} Perfil del usuario o null si ocurre un error.
 */
export async function getProfile(id) {
  const { data, error } = await supabase
    .from('profiles')
    .select('id, username, full_name, bio, avatar_path, created_at')
    .eq('id', id)
    .single()

  if (error) {
    console.error('Error getProfile:', error)
    return null
  }

  return data
}

/**
 * Lista los perfiles registrados.
 * @param {object} [options] - Parámetros opcionales.
 * @param {number} [options.limit=50] - Cantidad máxima de perfiles a devolver.
 * @returns {Promise<object[]>} Lista de perfiles.
 */
export async function listProfiles({ limit = 50 } = {}) {
  const { data, error } = await supabase
    .from('profiles')
    .select('id, username, full_name, bio, avatar_path')
    .order('username', { ascending: true })
    .limit(limit)

  if (error) {
    console.error('Error listProfiles:', error)
    return []
  }

  return data
}

/**
 * Crea o actualiza un perfil de usuario.
 * @param {object} profile - Objeto con los datos del perfil.
 * @returns {Promise<object>} Perfil actualizado o creado.
 * @throws {Error} Si ocurre un error al guardar el perfil.
 */
export async function upsertProfile(profile) {
  const { data, error } = await supabase
    .from('profiles')
    .upsert(profile)
    .select()
    .single()

  if (error) {
    console.error('Error upsertProfile:', error)
    throw error
  }

  return data
}

/**
 * Sube un avatar al bucket de avatars.
 * @param {File} file - Archivo de imagen a subir.
 * @param {string} userId - ID del usuario.
 * @returns {Promise<string>} Ruta del avatar subido.
 * @throws {Error} Si ocurre un error en la subida.
 */
export async function uploadAvatar(file, userId) {
  const fileExt = file.name.split('.').pop()
  const fileName = `${userId}/avatar.${fileExt}`

  // Eliminar avatar anterior si existe
  await supabase.storage.from('avatars').remove([fileName])

  const { error } = await supabase.storage
    .from('avatars')
    .upload(fileName, file, { upsert: true })

  if (error) throw error

  return fileName
}

/**
 * Obtiene la URL pública de un avatar.
 * @param {string} path - Ruta del avatar.
 * @returns {string|null} URL pública del avatar.
 */
export function getAvatarUrl(path) {
  if (!path) return null
  const { data } = supabase.storage
    .from('avatars')
    .getPublicUrl(path)
  return data.publicUrl
}

/**
 * Elimina un avatar del storage.
 * @param {string} path - Ruta del avatar a eliminar.
 * @returns {Promise<void>}
 */
export async function deleteAvatar(path) {
  if (!path) return
  const { error } = await supabase.storage
    .from('avatars')
    .remove([path])
  if (error) console.error('Error eliminando avatar:', error)
}
