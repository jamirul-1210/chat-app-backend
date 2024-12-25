import mongoose, { Document, Schema } from "mongoose";

export interface IMessage extends Document {
  senderId: mongoose.Types.ObjectId; 
  chatId: mongoose.Types.ObjectId; 
  readBy?:mongoose.Types.ObjectId[];   
  content: string;
  createdAt: Date;
  updatedAt: Date;
}

const MessageSchema: Schema = new Schema(
  {
    senderId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    chatId: { type: mongoose.Schema.Types.ObjectId, ref: "Chat", required: true },
    content: { type: String, required: true },
    readBy:[{type: mongoose.Schema.Types.ObjectId, ref: "User"}]
  },
  { timestamps: true }
);

export const Message = mongoose.model<IMessage>("Message", MessageSchema);
