import express from 'express';
import http from 'http';
import chalk from 'chalk';
import { AddressInfo } from 'node:net';
import config from './config';
import io from './io';

const PORT = 5000;

/**
 * Clase servidor del CHAT
 */
class Server {
  private app: express.Express;

  private servicio!: http.Server;

  /**
   * Constructor
   */
  constructor() {
    // Cargamos express como servidor
    this.app = express();
  }

  /**
   * Inicia el Servidor
   * @returns instancia del servidor http Server
   */
  async start() {
    // Le apliacamos la configuracion a nuestro Servidor
    config(this.app);

    // Nos ponemos a escuchar a un puerto definido en la configuracion
    this.servicio = this.app.listen(PORT, () => {
      const address = this.servicio.address() as AddressInfo;
      const host = address.address === '::' ? 'localhost' : address.address; // dependiendo de la dirección asi configuramos
      const { port } = address; // el puerto
      if (process.env.NODE_ENV !== 'test') {
        console.log(chalk.green.bold(`🟢 Servidor CHAT escuchando ✅ -> http://${host}:${port}`));
      }
    });

    // Iniciamo Socket.io
    io(this.servicio);
    return this.servicio; // Devolvemos la instancia del servidor
  }

  /**
   * Cierra el Servidor y con ello también nos desconectamos de los servicios que tengamos como MongoDB
   */
  async close() {
    // Desconectamos el socket server
    this.servicio.close();
    if (process.env.NODE_ENV !== 'test') {
      console.log(chalk.grey.bold('⚪️ Servidor parado ❎'));
    }
  }
}

/**
 * Devuelve la instancia de conexión siempre la misma, singleton
 */
const server = new Server();
// Exportamos el servidor inicializado
export default server;

// La siguiente sección de código sólo se ejecutará si este fichero es el punto de entrada del programa principal
// Lo hacemos porque también lo llamamos en test.
// https://nodejs.org/api/deprecations.html#DEP0144
if (require.main === module) {
  server.start();
}

process.on('unhandledRejection', (err) => {
  console.log(chalk.red('❌ Custom Error: An unhandledRejection occurred'));
  console.log(chalk.red(`❌ Custom Error: Rejection: ${err}`));
});
