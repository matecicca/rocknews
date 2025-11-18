/**
 * @file postService.js
 * @description Servicio para la gestión de publicaciones en la tabla `posts`.
 */

import { supabase } from './supabaseClient'

/**
 * Obtiene los posts más recientes con información del autor.
 * @param {object} [options] - Parámetros opcionales.
 * @param {number} [options.limit=20] - Número máximo de publicaciones a devolver.
 * @returns {Promise<object[]>} Lista de publicaciones.
 */
export async function listFeed({ limit = 20 } = {}) {
  const { data, error } = await supabase
    .from('posts')
    .select(`
      id,
      content,
      created_at,
      author_id,
      profiles:author_id (
        id,
        username,
        full_name,
        bio
      )
    `)
    .order('created_at', { ascending: false })
    .limit(limit)

  if (error) {
    console.error('Error listFeed:', error)
    return []
  }

  return data
}

/**
 * Crea una nueva publicación asociada al usuario autenticado.
 * @param {object} postData - Datos del nuevo post.
 * @param {string} postData.content - Contenido del post.
 * @returns {Promise<object>} Publicación creada, con perfil del autor.
 * @throws {Error} Si no hay sesión activa o si ocurre un error en la inserción.
 */
export async function createPost({ content }) {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('No hay sesión activa')

  const { data, error } = await supabase
    .from('posts')
    .insert({ content, author_id: user.id })
    .select('id, content, created_at, author_id')
    .single()

  if (error) throw error

  // Enriquecer con perfil del autor
  const { data: profile } = await supabase
    .from('profiles')
    .select('id, username, full_name, bio')
    .eq('id', data.author_id)
    .single()

  return { ...data, profiles: profile || null }
}

/**
 * Obtiene las publicaciones de un usuario específico.
 * @param {string} userId - ID del usuario.
 * @returns {Promise<object[]>} Lista de publicaciones del usuario.
 */
export async function listUserPosts(userId) {
  const { data, error } = await supabase
    .from('posts')
    .select(`
      id,
      content,
      created_at,
      author_id,
      profiles:author_id (
        id,
        username,
        full_name,
        bio
      )
    `)
    .eq('author_id', userId)
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Error listUserPosts:', error)
    return []
  }

  return data
}

/**
 * Escucha cambios en tiempo real en la tabla `posts`.
 * @param {Function} onChange - Callback ejecutado ante inserciones, actualizaciones o eliminaciones.
 * @returns {Function} Función para cancelar la suscripción.
 */
export function subscribeToPosts(onChange) {
  const channel = supabase
    .channel('realtime-posts')
    .on(
      'postgres_changes',
      { event: '*', schema: 'public', table: 'posts' },
      (payload) => {
        onChange(payload.new ?? payload.old, payload.eventType)
      }
    )
    .subscribe()

  return () => supabase.removeChannel(channel)
}
