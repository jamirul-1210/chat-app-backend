import { getSocketIO } from '../socket';

// This function will emit a new message to all users in the chat room
export const sendEventInBackground = (roomIds: string[], message: any, event:any, delay: number = 0): void => {
    const io = getSocketIO();
    setTimeout(() => {
        for (const roomId of roomIds) {
            io.to(roomId).emit(event, message);
        }
    }, delay);

};
