import 'dotenv/config'
import { addKeyword, EVENTS } from '@builderbot/bot'
// TT MODULOS
import { ENUM_IA_RESPUESTAS } from '../../APIs/OpenAi/IAEnumRespuestas.mjs'
import { AgruparMensaje } from '../../funciones/agruparMensajes.mjs'
import { BOT } from '../../config/bot.mjs'
import { Escribiendo } from '../../funciones/proveedor.mjs'
import { Esperar } from '../../funciones/tiempo.mjs'
import { ENUNGUIONES } from '../../APIs/OpenAi/guiones.mjs'
import { ComprobrarListaNegra } from '../../config/listaNegra.mjs'
//TT FLUJOS
import { reset, idleFlow } from '../idle.mjs'
//TT BLOQUES
import { DetectarArchivos } from '../bloques/detectarArchivos.mjs'
import { EnviarImagenes } from '../bloques/enviarMedia.mjs'
import { EnviarIA } from '../bloques/enviarIA.mjs'

// TT FLUJO INFO
export const flowIAinfo = addKeyword(EVENTS.ACTION)
  //TT FLUJO TRANSICION
  .addAction(async (ctx, { flowDynamic, endFlow, gotoFlow, fallBack, provider, state }) => {
    const detectar = await DetectarArchivos(ctx, state)
    AgruparMensaje(detectar, async (txt) => {
      //SS respuesta
      console.log(
        `👤 FLUJO TRANSICION INFO Escribe: ${ctx.name} con numero: ${ctx.from} y escribe->\n ${txt}`
      )
      Escribiendo(ctx)
      const res = await EnviarIA(txt, ENUNGUIONES.INFO, {
        ctx,
        flowDynamic,
        endFlow,
        gotoFlow,
        fallBack,
        state
      })
      console.log(`🤖 FLUJO DE TRANSICION INFO IA responde a: ${ctx.from} ->\n ${res.respuesta}`)
      await Responder(res, ctx, flowDynamic, endFlow, gotoFlow, fallBack, state)
    })
  })
  //TT FLUJO DE CONVERSACION
  .addAction(
    { capture: true },
    async (ctx, { flowDynamic, endFlow, gotoFlow, fallBack, provider, state }) => {
      const detectar = await DetectarArchivos(ctx, state)
      AgruparMensaje(detectar, async (txt) => {
        // ff COMPROBAR LISTA NEGRA
        if (ComprobrarListaNegra(ctx) || !BOT.ESTADO) return gotoFlow(idleFlow)
        // ff RESET IDLE
        reset(ctx, gotoFlow, BOT.IDLE_TIME * 60)

        console.log(
          `👤 FLUJO DE CONVERSACION INFO Escribe: ${ctx.name} con numero: ${ctx.from} y escribe->\n ${txt}`
        )

        Escribiendo(ctx)
        const res = await EnviarIA(txt, ENUNGUIONES.INFO, {
          ctx,
          flowDynamic,
          endFlow,
          gotoFlow,
          fallBack,
          state
        })
        console.log(`🤖 FLUJO DE CONVERSACION INFO IA responde a: ${ctx.from} ->\n ${res.respuesta}`)
        await Responder(res, ctx, flowDynamic, endFlow, gotoFlow, fallBack, state)
      })
      return fallBack()
    }
  )

async function Responder(res, ctx, flowDynamic, endFlow, gotoFlow, fallBack, state) {
  if (res.tipo === ENUM_IA_RESPUESTAS.TEXTO) {
    await Esperar(BOT.DELAY)
    //ss enviar imagenes
    const msj = await EnviarImagenes(res.respuesta, flowDynamic, ctx)
    //ss enviar mensaje
    return await flowDynamic(msj)
  }
}
