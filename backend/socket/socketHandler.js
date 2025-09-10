const { socketAuth, handleConnection } = require('../sockets/socketHandlers');

const initializeSocket = (io, redisClient) => {
  // Use authentication middleware
  io.use(socketAuth);
  
  // Handle connections
  io.on('connection', handleConnection(io));
  
  console.log('Socket.IO initialized with authentication and connection handlers');
  
  return io;
};

module.exports = { initializeSocket };
