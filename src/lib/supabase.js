import { createClient } from '@supabase/supabase-js'

const supabaseUrl  = import.meta.env.VITE_SUPABASE_URL
const supabaseKey  = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseKey) {
  console.error(
    '⚠️  Faltan las variables de entorno de Supabase.\n' +
    '   Copia .env.example como .env y completa tus credenciales.'
  )
}

export const supabase = createClient(supabaseUrl, supabaseKey)

/** Sube una foto al bucket 'fotos-reportes' y retorna la URL pública */
export async function subirFoto(archivo, userId) {
  const ext       = archivo.name.split('.').pop()
  const ruta      = `${userId}/${Date.now()}.${ext}`
  const { error } = await supabase.storage
    .from('fotos-reportes')
    .upload(ruta, archivo)

  if (error) throw error

  const { data } = supabase.storage
    .from('fotos-reportes')
    .getPublicUrl(ruta)

  return data.publicUrl
}
