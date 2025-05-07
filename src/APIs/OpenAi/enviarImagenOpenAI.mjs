import 'dotenv/config'
import { OpenAI } from 'openai'
//TT MODULOS
import { ENUM_IA_RESPUESTAS } from './IAEnumRespuestas.mjs'
import { DetectarFuncion, FuncionesIA } from './funcionesIA.mjs'
import { ObtenerHistorial } from './historial.mjs'
import { Notificar, ENUM_NOTI } from '../../config/notificaciones.mjs'
import { BOT, MENSAJES } from '../../config/bot.mjs'

//TT AGREGAR CLAVE
function OpenIA() {
  if (BOT.KEY_IA) {
    return new OpenAI({
      apiKey: BOT.KEY_IA
    })
  } else {
    return new OpenAI({
      apiKey: process.env.OPENAI_API_KEY
    })
  }
}

//TT LLAMAR IA
/**
 * Envía un mensaje de texto a la API de OpenAI y obtiene una respuesta.
 * @param {string} paquete - El mensaje a enviar a la IA.
 * @param {string} userId - El ID del usuario que envía el mensaje.
 * @param {string} guion - Enum del guion a usar o agente.
 * @param {Object} estado - El estado actual del usuario, junto a los informacion necesaria para actualizar el prompt.
 * @returns {Promise<string>} La respuesta de la IA.
 */
export async function EnviarImagenOpenAI(paquete, userId, guion, estado, llamada = null) {
  try {
    //cargar historial
    const _historial = ObtenerHistorial(userId, guion, estado)
    _historial.push(paquete)

    const openai = OpenIA()
    const completion = await openai.chat.completions.create({
      model: BOT.MODELO_IA_IMAGENES,
      messages: _historial,
      functions: FuncionesIA(guion),
      function_call: 'auto',
      max_tokens: BOT.TOKENS_IMAGENES,
      temperature: BOT.TEMPERATURA
    })
    const message = completion.choices[0].message

    //SS DETECTAR LLAMADA A FUNCIONES
    const respuesta = await DetectarFuncion(message, userId, guion, estado)

    //SS GUARDAR RESPUESTA
    _historial.push({ role: 'assistant', content: respuesta })

    //SS RESPONDER
    return { respuesta, tipo: ENUM_IA_RESPUESTAS.TEXTO }
  } catch (error) {
    console.error('TXT - Error al llamar a la API de OpenAI:', error)
    const msj = 'No es posible conectar con *OpenAI(TXT)*, revisa la calve de la Api, o el saldo de tu cuenta'
    Notificar(ENUM_NOTI.ERROR, { msj })
    return { respuesta: MENSAJES.ERROR, tipo: ENUM_IA_RESPUESTAS.TEXTO }
  }
}
