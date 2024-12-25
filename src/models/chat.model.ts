import mongoose, { Document, Schema } from "mongoose";

export interface IChat extends Document {
  members: mongoose.Types.ObjectId[]; 
  messages?: mongoose.Types.ObjectId[]; 
  createdAt: Date;
  updatedAt: Date;
}

const ChatSchema: Schema = new Schema(
  {
    members: [{ type: mongoose.Schema.Types.ObjectId, ref: "User", required: true }],
    messages: [{ type: mongoose.Schema.Types.ObjectId, ref: "Message" }],
  },
  { timestamps: true }
);

export const Chat = mongoose.model<IChat>("Chat", ChatSchema);
