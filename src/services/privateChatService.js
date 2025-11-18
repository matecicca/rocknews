/**
 * @file privateChatService.js
 * @description Servicio para gestionar conversaciones y mensajes privados entre dos usuarios.
 */
import { supabase } from './supabaseClient'

/**
 * Crear o recuperar una conversación entre dos usuarios.
 * Si ya existe, la devuelve; si no, la crea.
 */
export async function getOrCreateConversation(userOneId, userTwoId) {
  // Normalizar orden para evitar duplicados (A-B = B-A)
  const [a, b] = [userOneId, userTwoId].sort()

  // Buscar si ya existe
  const { data: existing, error: findError } = await supabase
    .from('private_conversations')
    .select('*')
    .or(`and(user_one_id.eq.${a},user_two_id.eq.${b}),and(user_one_id.eq.${b},user_two_id.eq.${a})`)
    .maybeSingle()

  if (findError) throw findError
  if (existing) return existing

  // Crear si no existe
  const { data, error } = await supabase
    .from('private_conversations')
    .insert({ user_one_id: a, user_two_id: b })
    .select()
    .single()

  if (error) throw error
  return data
}

/**
 * Obtener todas las conversaciones del usuario autenticado.
 */
export async function listUserConversations(userId) {
  const { data, error } = await supabase
    .from('private_conversations')
    .select(`
      *,
      user_one: user_one_id ( id, username, full_name ),
      user_two: user_two_id ( id, username, full_name )
    `)
    .or(`user_one_id.eq.${userId},user_two_id.eq.${userId}`)
    .order('last_message_at', { ascending: false })

  if (error) throw error
  return data
}

/**
 * Enviar un mensaje en una conversación existente.
 */
export async function sendPrivateMessage(conversationId, senderId, content) {
  const { data, error } = await supabase
    .from('private_messages')
    .insert({ conversation_id: conversationId, sender_id: senderId, content })
    .select(`
      id,
      content,
      sender_id,
      created_at
    `)
    .single()

  if (error) throw error
  return data
}

/**
 * Obtener mensajes de una conversación.
 */
export async function listPrivateMessages(conversationId, limit = 50) {
  const { data, error } = await supabase
    .from('private_messages')
    .select(`
      id,
      content,
      sender_id,
      created_at,
      profiles:sender_id (
        id,
        username,
        full_name
      )
    `)
    .eq('conversation_id', conversationId)
    .order('created_at', { ascending: true })
    .limit(limit)

  if (error) throw error
  return data
}

/**
 * Suscribirse en tiempo real a nuevos mensajes.
 */
export function subscribeToPrivateMessages(conversationId, onChange) {
  const channel = supabase
    .channel(`realtime-private-messages-${conversationId}`)
    .on(
      'postgres_changes',
      {
        event: 'INSERT',
        schema: 'public',
        table: 'private_messages',
        filter: `conversation_id=eq.${conversationId}`
      },
      payload => onChange(payload.new)
    )
    .subscribe()

  return () => supabase.removeChannel(channel)
}
