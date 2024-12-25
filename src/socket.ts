import { Server, Socket } from 'socket.io';
import { Server as HttpServer } from 'http';
import { decodeToken } from './utils/jwtHelper';
import dotenv from "dotenv";
import { JOIN_ROOM, LEAVE_ROOM, READ_MESSAGE, USER_LAST_SEEN_STATUS_UPDATE } from './config/events';
import { handleLastSeenUpdate, handleReadmessage } from './socket.handlers';

// load envs
dotenv.config();

// Socket.IO instance
let io: Server;

// Middleware to authenticate the socket connection using JWT token
const socketAuthMiddleware = (socket: Socket, next: (err?: Error) => void) => {
    const token = socket.handshake.auth?.token;

    if (!token) {
        return next(new Error('Authentication error: Token missing'));
    }

    try {
        const decoded = decodeToken(token);
        socket.data.user = decoded;
        next();
    } catch (err) {
        next(new Error('Authentication error: Invalid token'));
    }
};

// Allowed origin for CORS
const ALLOWED_ORIGIN = process.env.ALLOWED_ORIGIN as string;
if (!ALLOWED_ORIGIN) {
    console.error('Allowed origin is not defined in .env file');
    process.exit(1);
}

// Configure Socket.IO with the HTTP server instance and attach middleware
export const configureSocket = (httpServer: HttpServer): void => {
    io = new Server(httpServer, {
        cors: {
            origin: ALLOWED_ORIGIN,
        },
    });
    // Attach middleware
    io.use(socketAuthMiddleware);

    io.on('connection', (socket: Socket) => {
        // for testing purpose
        socket.on('test', (data: any) => {
            // console.log('Message received:', data);
            io.emit('test', data);
        });

        // join the user to room   
        socket.on(JOIN_ROOM, (roomId: any) => {
            // check if the user belong to the chat
            const userId = socket.data.user._id;
            if(!roomId) return;
            socket.join(roomId);
            handleLastSeenUpdate(roomId)
            socket.emit('room_joined', roomId);
        });

        // leave the user from room
        socket.on(LEAVE_ROOM, (roomId: any) => {
            socket.leave(roomId);
            socket.emit('room_leaved', roomId);
        });

        socket.on(READ_MESSAGE, async(messageId:string) => {
            const user = socket.data.user
            await handleReadmessage(user,messageId);
        });

        // listen for user last seen update
        socket.on(USER_LAST_SEEN_STATUS_UPDATE,(userId:string)=>{
            handleLastSeenUpdate(userId)
        })
        socket.on('disconnect', () => {
            const user = socket.data.user
        });
    });
};

// Get the socket io instance for emitting events
export const getSocketIO = (): Server => {
    if (!io) {
        throw new Error('Socket.IO instance is not initialized');
    }
    return io;
};

