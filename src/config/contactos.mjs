import 'dotenv/config'
import { postTable } from 'appsheet-connect'
//TT MODULOS
import { ObtenerContactos } from '../funciones/proveedor.mjs'
import { APPSHEETCONFIG, CONTACTOS, ActualizarContactos } from './bot.mjs'

const propiedades = {
  UserSettings: {
    DETECTAR: false
  }
}

export function SincronizarContactos() {
  const contactos = ObtenerContactos()
  if (contactos && contactos !== 'DESCONECTADO') {
    //console.log(contactos)
    const contactosNuevos = []
    for (let i = 0; i < contactos.length; i++) {
      let nuevoContacto = {
        TELEFONO: contactos[i].id.split('@')[0],
        NOMBRE: contactos[i].name || contactos[i].notify || 'Sin Nombre'
      }

      let encontrado = false
      for (let j = 0; j < CONTACTOS.LISTA_CONTACTOS.length; j++) {
        const id = CONTACTOS.LISTA_CONTACTOS[j].TELEFONO
        // si existe en la lista de contactos
        if (contactos[i].id.includes(id)) {
          nuevoContacto = CONTACTOS.LISTA_CONTACTOS[j]
          encontrado = true
          break
        }
      }
      // Si no se encontró en la lista de contactos, agregar el nuevo contacto
      if (!encontrado) {
        contactosNuevos.push(nuevoContacto)
      }
    }
    console.log(contactosNuevos)
    if (contactosNuevos.length > 0) {
      postTable(APPSHEETCONFIG, process.env.PAG_CONTACTOS, contactosNuevos, propiedades).then(() =>
        ActualizarContactos()
      )
    }
  }
}
