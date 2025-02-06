const WebSocket = require('ws');
const logger = require('../config/logger');

class WebSocketService {
  constructor() {
    this.wss = null;
    this.clients = new Set(); 
  }

  init(server) {
    this.wss = new WebSocket.Server({ server });

    this.wss.on('connection', (ws) => {
      logger.debug('New WebSocket client connected');
      this.clients.add(ws);

      ws.on('close', () => {
        logger.debug('WebSocket client disconnected');
        this.clients.delete(ws);
      });

      ws.on('error', (error) => {
        logger.error('WebSocket Server Error:', error);
      });

      ws.send(JSON.stringify({ message: 'Welcome to the WebSocket server!' }));
    });

    return this.wss;
  }

  broadcast(message) {
    this.clients.forEach((client) => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(JSON.stringify(message));
      }
    });
  }

  sendToClient(client, message) {
    if (client.readyState === WebSocket.OPEN) {
      client.send(JSON.stringify(message));
    }
  }
}

module.exports = new WebSocketService();
