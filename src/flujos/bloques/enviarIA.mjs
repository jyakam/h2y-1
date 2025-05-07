import fs from 'fs'
//TT MODULOS
import { BOT } from '../../config/bot.mjs'
import { ENUM_TIPO_ARCHIVO } from './detectarArchivos.mjs'
import { EnviarTextoOpenAI } from '../../APIs/OpenAi/enviarTextoOpenAI.mjs'
import { EnviarImagenOpenAI } from '../../APIs/OpenAi/enviarImagenOpenAI.mjs'
import { convertOggToMp3 } from '../../funciones/convertirMp3.mjs'
import { EnviarAudioOpenAI } from '../../APIs/OpenAi/enviarAudioOpenAI.mjs'

//TT DETECTAR TIPO DE MENSAJE
export async function EnviarIA(msj, guion, funciones, estado = {}) {
  const tipoMensaje = funciones.state.get('tipoMensaje')
  //SS IMAGEN
  if (tipoMensaje === ENUM_TIPO_ARCHIVO.IMAGEN) {
    console.log('📤 🌄 enviando imagen')
    //objeto
    const objeto = { role: 'user', content: [{ type: 'text', text: msj }] }
    //imagenes
    const datos = funciones.state.get('archivos')
    const imagenes = datos.filter((item) => item.tipo === ENUM_TIPO_ARCHIVO.IMAGEN)
    for (const img of imagenes) {
      const imagenBase64 = fs.readFileSync(img.ruta, { encoding: 'base64' })
      const data = {
        type: 'image_url',
        image_url: {
          url: `data:image/jpeg;base64,${imagenBase64}`,
          detail: BOT.CALIDA_IMAGENES
        }
      }
      objeto.content.push(data)
    }
    //limpiar estado
    funciones.state.clear()
    //enviar peticiones
    const res = await EnviarImagenOpenAI(objeto, funciones.ctx.from, guion, estado)
    return res
  }
  //SS NOTA DE VOZ
  else if (tipoMensaje === ENUM_TIPO_ARCHIVO.NOTA_VOZ) {
    console.log('📤 🎵 enviando nota de voz')
    //objeto
    const mensaje = []
    //imagenes
    const datos = funciones.state.get('archivos')
    const audios = datos.filter((item) => item.tipo === ENUM_TIPO_ARCHIVO.NOTA_VOZ)
    for (const aud of audios) {
      const id = generateUniqueFileName('mp3')
      const mp3 = await convertOggToMp3(aud.ruta, id, BOT.VELOCIDAD)
      const txt = await EnviarAudioOpenAI(mp3)
      mensaje.push(txt)
    }
    //limpiar estado
    funciones.state.clear()
    console.log('🎤🎵 Nota de voz:', mensaje.join('\n'))
    //enviar peticiones
    const res = await EnviarTextoOpenAI(mensaje.join('\n'), funciones.ctx.from, guion, estado)
    return res
  }
  //SS DOCUMENTO
  else if (tipoMensaje === ENUM_TIPO_ARCHIVO.DOCUMENTO) {
    console.log('📤 📦 documento  detectado')
    const res = await EnviarTextoOpenAI(msj, funciones.ctx.from, guion, estado)
    return res
  }
  //SS TEXTO
  else if (tipoMensaje === ENUM_TIPO_ARCHIVO.TEXTO) {
    console.log('📤 📄 enviando texto')
    const res = await EnviarTextoOpenAI(msj, funciones.ctx.from, guion, estado)
    return res
  }
}

//SS GENERAR ID
function generateUniqueFileName(extension) {
  const timestamp = Date.now() // Obtiene el timestamp actual
  const randomNumber = Math.floor(Math.random() * 1000) // Genera un número aleatorio
  return `file_${timestamp}_${randomNumber}.${extension}` // Combina el timestamp y el número aleatorio
}
