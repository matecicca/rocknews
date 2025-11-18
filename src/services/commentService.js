/**
 * @file commentService.js
 * @description Servicio para la gestión de comentarios en publicaciones.
 */

import { supabase } from './supabaseClient'

/**
 * Obtiene los comentarios de un post específico.
 * @param {string} postId - ID del post.
 * @returns {Promise<object[]>} Lista de comentarios con información del autor.
 */
export async function listComments(postId) {
  const { data, error } = await supabase
    .from('comments')
    .select(`
      id,
      content,
      created_at,
      post_id,
      author_id,
      profiles:author_id (
        id,
        username,
        full_name,
        avatar_path
      )
    `)
    .eq('post_id', postId)
    .order('created_at', { ascending: true })

  if (error) {
    console.error('Error listComments:', error)
    return []
  }

  return data
}

/**
 * Crea un nuevo comentario en un post.
 * @param {object} commentData - Datos del comentario.
 * @param {string} commentData.post_id - ID del post.
 * @param {string} commentData.content - Contenido del comentario.
 * @returns {Promise<object>} Comentario creado con perfil del autor.
 * @throws {Error} Si no hay sesión activa o si ocurre un error.
 */
export async function createComment({ post_id, content }) {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('No hay sesión activa')

  const { data, error } = await supabase
    .from('comments')
    .insert({ post_id, content, author_id: user.id })
    .select('id, content, created_at, post_id, author_id')
    .single()

  if (error) throw error

  // Enriquecer con perfil del autor
  const { data: profile } = await supabase
    .from('profiles')
    .select('id, username, full_name, avatar_path')
    .eq('id', data.author_id)
    .single()

  return { ...data, profiles: profile || null }
}

/**
 * Actualiza un comentario existente.
 * @param {string} commentId - ID del comentario.
 * @param {object} updates - Datos a actualizar.
 * @param {string} updates.content - Nuevo contenido.
 * @returns {Promise<object>} Comentario actualizado.
 * @throws {Error} Si ocurre un error.
 */
export async function updateComment(commentId, updates) {
  const { data, error } = await supabase
    .from('comments')
    .update(updates)
    .eq('id', commentId)
    .select('id, content, created_at, post_id, author_id')
    .single()

  if (error) throw error

  // Enriquecer con perfil del autor
  const { data: profile } = await supabase
    .from('profiles')
    .select('id, username, full_name, avatar_path')
    .eq('id', data.author_id)
    .single()

  return { ...data, profiles: profile || null }
}

/**
 * Elimina un comentario.
 * @param {string} commentId - ID del comentario a eliminar.
 * @returns {Promise<void>}
 * @throws {Error} Si ocurre un error.
 */
export async function deleteComment(commentId) {
  const { error } = await supabase
    .from('comments')
    .delete()
    .eq('id', commentId)

  if (error) throw error
}

/**
 * Escucha cambios en tiempo real en los comentarios de un post.
 * @param {string} postId - ID del post.
 * @param {Function} onChange - Callback ejecutado ante cambios.
 * @returns {Function} Función para cancelar la suscripción.
 */
export function subscribeToComments(postId, onChange) {
  const channel = supabase
    .channel(`comments-${postId}`)
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'comments',
        filter: `post_id=eq.${postId}`
      },
      async (payload) => {
        if (payload.eventType === 'DELETE') {
          onChange(payload.old, payload.eventType)
        } else {
          // Enriquecer con perfil del autor
          const { data: profile } = await supabase
            .from('profiles')
            .select('id, username, full_name, avatar_path')
            .eq('id', payload.new.author_id)
            .single()

          onChange({ ...payload.new, profiles: profile || null }, payload.eventType)
        }
      }
    )
    .subscribe()

  return () => supabase.removeChannel(channel)
}
