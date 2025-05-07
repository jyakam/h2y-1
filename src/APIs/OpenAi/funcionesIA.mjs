//TT MODULOS
import { BOT } from '../../config/bot.mjs'
import { EnviarTextoOpenAI } from './enviarTextoOpenAI.mjs'
import { ENUNGUIONES } from './guiones.mjs'

//TT FUNCIONES
import { IASolicitarAyuda, SolicitarAyuda } from './funciones/solicitarAyuda.mjs'
import { IAGenerarImagen, GenerarImagen } from './funciones/generarImagen.mjs'

//TT RETORNAR FUNCIONES
export function FuncionesIA(guion) {
  if (guion === ENUNGUIONES.INFO) {
    if (BOT.GENERAR_IMAGENES) {
      return [IASolicitarAyuda, IAGenerarImagen]
    } else {
      return [IASolicitarAyuda]
    }
  }
}

//TT COMPROBAR LLAMADA A FUNCION
export async function DetectarFuncion(message, userId, guion, estado) {
  if (message.function_call) {
    //Cargar argumentos
    const nombreFuncion = message.function_call.name
    const functionArgs = JSON.parse(message.function_call.arguments)
    console.log(`🧩 Se llamo a una funcion desde IA: ${nombreFuncion}`, functionArgs)

    let resp = ''
    //SS SOLICITAR AYUDA
    if (nombreFuncion === 'SolicitarAyuda') {
      resp = await SolicitarAyuda(userId, functionArgs.consulta)
    }
    //SS GENERAR IMAGEN
    else if (nombreFuncion === 'GenerarImagen') {
      resp = await GenerarImagen(userId, functionArgs.prompt)
    }

    //SS NINGUNA FUNCION VALIDAD
    const llamada = [message, { role: 'function', name: nombreFuncion, content: resp }]
    const res = await EnviarTextoOpenAI(resp, userId, guion, estado, llamada)
    return res.respuesta
  }
  return message.content
}
