import { MESSAGE_READ_RECEIVED, USER_LAST_SEEN_UPDATE_RECEIVED } from "./config/events";
import { sendEventInBackground } from "./jobs/sendmessage";
import { getChatById, getUserChats } from "./services/chat.service";
import { markMessageAsRead } from "./services/message.service";
import { updateLastSeen } from "./services/user.service";
import { getSocketIO } from './socket';

// handler for a message read event fire from client 
export async function handleReadmessage(user: any, messageId: string) {
    if (!user && !messageId) return;
    try {
        const markedMessage = await markMessageAsRead(messageId, user.id);
        // get the chat
        const chat = await getChatById(markedMessage.chatId.toString());
        if (!chat) return;
        const members = chat.members.map(member => member._id.toString());
        // emit event to all the members in a chat with marked read message
        sendEventInBackground(members, markedMessage, MESSAGE_READ_RECEIVED);
    } catch (error: any) {
        console.error(error.message)
    }
}

export function handleLastSeenUpdate(userId:string) {
    
    const io = getSocketIO();
    setTimeout(async() => {
        const updatedUser = await updateLastSeen(userId);
        const allChats = await getUserChats(userId);
        for (const chat of allChats) {
            for(const member of chat.members){
                io.to(member._id.toString()).emit(USER_LAST_SEEN_UPDATE_RECEIVED,updatedUser)
            }
        }
    }, 0);
}