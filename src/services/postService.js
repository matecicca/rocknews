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
      image_path,
      created_at,
      author_id,
      profiles:author_id (
        id,
        username,
        full_name,
        bio,
        avatar_path
      )
    `)
    .order('created_at', { ascending: false })
    .limit(limit)

  if (error) {
    console.error('Error listFeed:', error)
    throw new Error(`Error al cargar el feed: ${error.message}`)
  }

  return data || []
}

/**
 * Crea una nueva publicación asociada al usuario autenticado.
 * @param {object} postData - Datos del nuevo post.
 * @param {string} postData.content - Contenido del post.
 * @param {string} [postData.image_path] - Ruta de la imagen adjunta.
 * @returns {Promise<object>} Publicación creada, con perfil del autor.
 * @throws {Error} Si no hay sesión activa o si ocurre un error en la inserción.
 */
export async function createPost({ content, image_path = null }) {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('No hay sesión activa')

  const { data, error } = await supabase
    .from('posts')
    .insert({ content, image_path, author_id: user.id })
    .select('id, content, image_path, created_at, author_id')
    .single()

  if (error) throw error

  // Enriquecer con perfil del autor
  const { data: profile } = await supabase
    .from('profiles')
    .select('id, username, full_name, bio, avatar_path')
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
      image_path,
      created_at,
      author_id,
      profiles:author_id (
        id,
        username,
        full_name,
        bio,
        avatar_path
      )
    `)
    .eq('author_id', userId)
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Error listUserPosts:', error)
    throw new Error(`Error al cargar publicaciones del usuario: ${error.message}`)
  }

  return data || []
}

/**
 * Actualiza una publicación existente.
 * @param {string} postId - ID del post a actualizar.
 * @param {object} updates - Datos a actualizar.
 * @param {string} [updates.content] - Nuevo contenido.
 * @param {string} [updates.image_path] - Nueva ruta de imagen.
 * @returns {Promise<object>} Post actualizado.
 * @throws {Error} Si ocurre un error en la actualización.
 */
export async function updatePost(postId, updates) {
  const { data, error } = await supabase
    .from('posts')
    .update(updates)
    .eq('id', postId)
    .select('id, content, image_path, created_at, author_id')
    .single()

  if (error) throw error

  // Enriquecer con perfil del autor
  const { data: profile } = await supabase
    .from('profiles')
    .select('id, username, full_name, bio, avatar_path')
    .eq('id', data.author_id)
    .single()

  return { ...data, profiles: profile || null }
}

/**
 * Elimina una publicación.
 * @param {string} postId - ID del post a eliminar.
 * @returns {Promise<void>}
 * @throws {Error} Si ocurre un error en la eliminación.
 */
export async function deletePost(postId) {
  const { error } = await supabase
    .from('posts')
    .delete()
    .eq('id', postId)

  if (error) throw error
}

/**
 * Sube una imagen al bucket de post-images.
 * @param {File} file - Archivo de imagen a subir.
 * @param {string} userId - ID del usuario que sube la imagen.
 * @returns {Promise<string>} Ruta de la imagen subida.
 * @throws {Error} Si ocurre un error en la subida.
 */
export async function uploadPostImage(file, userId) {
  const fileExt = file.name.split('.').pop()
  const fileName = `${userId}/${Date.now()}.${fileExt}`

  const { error } = await supabase.storage
    .from('post-images')
    .upload(fileName, file)

  if (error) throw error

  return fileName
}

/**
 * Obtiene la URL pública de una imagen de post.
 * @param {string} path - Ruta de la imagen.
 * @returns {string} URL pública de la imagen.
 */
export function getPostImageUrl(path) {
  if (!path) return null
  const { data } = supabase.storage
    .from('post-images')
    .getPublicUrl(path)
  return data.publicUrl
}

/**
 * Elimina una imagen del storage de post-images.
 * @param {string} path - Ruta de la imagen a eliminar.
 * @returns {Promise<void>}
 */
export async function deletePostImage(path) {
  if (!path) return
  const { error } = await supabase.storage
    .from('post-images')
    .remove([path])
  if (error) console.error('Error eliminando imagen:', error)
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

// =============================================
// FUNCIONES DE ADMINISTRACIÓN
// =============================================

/**
 * Actualiza una publicación como administrador (puede actualizar cualquier post).
 * Las RLS en Supabase validan que el usuario sea admin.
 * @param {string} postId - ID del post a actualizar.
 * @param {object} updates - Datos a actualizar.
 * @returns {Promise<object>} Post actualizado con perfil del autor.
 * @throws {Error} Si ocurre un error en la actualización.
 */
export async function adminUpdatePost(postId, updates) {
  const { data, error } = await supabase
    .from('posts')
    .update(updates)
    .eq('id', postId)
    .select('id, content, image_path, created_at, author_id')
    .single()

  if (error) throw error

  // Enriquecer con perfil del autor
  const { data: profile } = await supabase
    .from('profiles')
    .select('id, username, full_name, bio, avatar_path')
    .eq('id', data.author_id)
    .single()

  return { ...data, profiles: profile || null }
}

/**
 * Elimina una publicación como administrador (puede eliminar cualquier post).
 * Las RLS en Supabase validan que el usuario sea admin.
 * @param {string} postId - ID del post a eliminar.
 * @returns {Promise<void>}
 * @throws {Error} Si ocurre un error en la eliminación.
 */
export async function adminDeletePost(postId) {
  const { error } = await supabase
    .from('posts')
    .delete()
    .eq('id', postId)

  if (error) throw error
}
