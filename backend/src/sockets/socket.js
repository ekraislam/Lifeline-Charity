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
        
        socket.on('join', (data) => {
            if (typeof data === 'object' && data !== null) {
                if (data.userId) {
                    socket.join(`user_${data.userId}`);
                    console.log(`User ${data.userId} joined room user_${data.userId}`);
                }
                if (data.role === 'admin') {
                    socket.join('admin');
                    console.log(`Admin socket ${socket.id} joined admin room`);
                }
            } else if (data) {
                socket.join(`user_${data}`);
                console.log(`User ${data} joined room user_${data}`);
            }
        });

        socket.on('joinAdmin', () => {
            socket.join('admin');
            console.log(`Admin joined admin room via joinAdmin`);
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
