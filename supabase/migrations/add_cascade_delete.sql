-- ============================================
-- Script para agregar CASCADE DELETE a las tablas de RockNews
-- Ejecutar en la consola SQL de Supabase
-- ============================================

-- IMPORTANTE: Este script elimina las restricciones FK existentes y las recrea con ON DELETE CASCADE
-- Esto asegura que al eliminar un usuario, sus posts, comentarios y mensajes se eliminen automáticamente

-- ============================================
-- 1. Posts - Eliminar posts cuando se elimina el autor
-- ============================================

-- Primero, verificar si la restricción existe y eliminarla
ALTER TABLE IF EXISTS public.posts
DROP CONSTRAINT IF EXISTS posts_author_id_fkey;

-- Recrear con CASCADE
ALTER TABLE public.posts
ADD CONSTRAINT posts_author_id_fkey
FOREIGN KEY (author_id) REFERENCES public.profiles(id) ON DELETE CASCADE;

-- ============================================
-- 2. Comments - Eliminar comentarios cuando se elimina el autor o el post
-- ============================================

-- Eliminar restricciones existentes
ALTER TABLE IF EXISTS public.comments
DROP CONSTRAINT IF EXISTS comments_author_id_fkey;

ALTER TABLE IF EXISTS public.comments
DROP CONSTRAINT IF EXISTS comments_post_id_fkey;

-- Recrear con CASCADE para author_id
ALTER TABLE public.comments
ADD CONSTRAINT comments_author_id_fkey
FOREIGN KEY (author_id) REFERENCES public.profiles(id) ON DELETE CASCADE;

-- Recrear con CASCADE para post_id (eliminar comentarios cuando se elimina el post)
ALTER TABLE public.comments
ADD CONSTRAINT comments_post_id_fkey
FOREIGN KEY (post_id) REFERENCES public.posts(id) ON DELETE CASCADE;

-- ============================================
-- 3. Private Conversations - Eliminar conversaciones cuando se elimina un usuario
-- ============================================

-- Eliminar restricciones existentes
ALTER TABLE IF EXISTS public.private_conversations
DROP CONSTRAINT IF EXISTS private_conversations_user_one_id_fkey;

ALTER TABLE IF EXISTS public.private_conversations
DROP CONSTRAINT IF EXISTS private_conversations_user_two_id_fkey;

-- Recrear con CASCADE
ALTER TABLE public.private_conversations
ADD CONSTRAINT private_conversations_user_one_id_fkey
FOREIGN KEY (user_one_id) REFERENCES public.profiles(id) ON DELETE CASCADE;

ALTER TABLE public.private_conversations
ADD CONSTRAINT private_conversations_user_two_id_fkey
FOREIGN KEY (user_two_id) REFERENCES public.profiles(id) ON DELETE CASCADE;

-- ============================================
-- 4. Private Messages - Eliminar mensajes cuando se elimina la conversación o el sender
-- ============================================

-- Eliminar restricciones existentes
ALTER TABLE IF EXISTS public.private_messages
DROP CONSTRAINT IF EXISTS private_messages_conversation_id_fkey;

ALTER TABLE IF EXISTS public.private_messages
DROP CONSTRAINT IF EXISTS private_messages_sender_id_fkey;

-- Recrear con CASCADE para conversation_id
ALTER TABLE public.private_messages
ADD CONSTRAINT private_messages_conversation_id_fkey
FOREIGN KEY (conversation_id) REFERENCES public.private_conversations(id) ON DELETE CASCADE;

-- Recrear con CASCADE para sender_id
ALTER TABLE public.private_messages
ADD CONSTRAINT private_messages_sender_id_fkey
FOREIGN KEY (sender_id) REFERENCES public.profiles(id) ON DELETE CASCADE;

-- ============================================
-- 5. Profiles - Enlazar con auth.users para limpieza automática (opcional)
-- ============================================

-- Nota: Supabase por defecto ya conecta profiles con auth.users
-- Si necesitas recrear esta conexión:

-- ALTER TABLE IF EXISTS public.profiles
-- DROP CONSTRAINT IF EXISTS profiles_id_fkey;

-- ALTER TABLE public.profiles
-- ADD CONSTRAINT profiles_id_fkey
-- FOREIGN KEY (id) REFERENCES auth.users(id) ON DELETE CASCADE;

-- ============================================
-- Verificar las restricciones creadas
-- ============================================

-- Ejecuta esta consulta para verificar que las restricciones se crearon correctamente:
-- SELECT
--     tc.table_name,
--     tc.constraint_name,
--     rc.delete_rule
-- FROM information_schema.table_constraints tc
-- JOIN information_schema.referential_constraints rc
--     ON tc.constraint_name = rc.constraint_name
-- WHERE tc.constraint_type = 'FOREIGN KEY'
--     AND tc.table_schema = 'public';

-- ============================================
-- IMPORTANTE: Después de ejecutar este script
-- ============================================
-- 1. Verifica que las restricciones se crearon correctamente
-- 2. Realiza pruebas en un entorno de desarrollo primero
-- 3. Haz un backup de la base de datos antes de ejecutar en producción
