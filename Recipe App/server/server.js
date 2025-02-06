const app = require('./app');
const logger = require('./config/logger');
const WebSocketService = require('./services/websocketService');

const http = require('http');
const server = http.createServer(app); 

const PORT = process.env.PORT || 3000;

const wss = WebSocketService.init(server);

server.listen(PORT, () => {
  logger.info(`Server running on http://localhost:${PORT}`);
});
