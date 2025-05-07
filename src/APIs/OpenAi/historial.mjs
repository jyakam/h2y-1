//TT MODULOS
import { ConstrurGuion } from './guiones.mjs'

// TT HISTORIAL
let HistorialConv = {}
export function ObtenerHistorial(userId, guion, estado) {
  const _txt = ConstrurGuion(guion, estado)
  if (!HistorialConv[userId]) {
    HistorialConv[userId] = []
    HistorialConv[userId].push({ role: 'system', content: _txt })
  } else {
    HistorialConv[userId][0] = { role: 'system', content: _txt }
  }
  return HistorialConv[userId]
}

//TT BORRAR ULTIMOS MENSAJES
/**
 * Borra los últimos mensajes del historial de un usuario.
 * @param {string} userId - El ID del usuario cuyo historial se va a actualizar (numero telefono con extension).
 */
export function BorrarMensajes(userId) {
  if (HistorialConv[userId] && HistorialConv[userId].length > 1) {
    HistorialConv[userId].splice(-2)
  }
}

//TT LIMPIAR HISTORIAL
/**
 * Limpia el historial de conversaciones para un usuario específico.
 * @param {string} userId - El ID del usuario cuyo historial se va a limpiar (numero telefono con extension).
 */
export function LimpiarHistorial(userId = 'all') {
  if (userId === 'all') {
    HistorialConv = {}
    return
  }
  console.log('se limpia historial para: ' + userId)
  HistorialConv[userId] = null
}
