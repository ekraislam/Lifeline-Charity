const { Server } = require('socket.io');

let io;

const initSocket = (server) => {
    io = new Server(server, {
        cors: {
            origin: [
                process.env.CORS_ORIGIN_1,
                process.env.CORS_ORIGIN_2,
                process.env.CORS_ORIGIN_3
            ].filter(Boolean),
            credentials: true
        }
    });

    io.on('connection', (socket) => {
        console.log('User connected:', socket.id);
        
        socket.on('join', (userId) => {
            socket.join(`user_${userId}`);
            console.log(`User ${userId} joined room user_${userId}`);
        });

        socket.on('disconnect', () => {
            console.log('User disconnected:', socket.id);
        });
    });
};

const getIo = () => {
    if (!io) {
        throw new Error('Socket.io not initialized');
    }
    return io;
};

module.exports = { initSocket, getIo };
