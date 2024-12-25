import mongoose, { Document, Schema } from "mongoose";

export interface IUser extends Document {
  name: string;
  username: string; 
  email: string; 
  password: string; 
  agreeToTerms:boolean; 
  ispublic:string; // default true
  lastSeen?:Date; 
  gender:"male"|"female"|"other"; 
  avatar?: string; 
  createdAt: Date;
  updatedAt: Date;
}

// Define the Mongoose schema
const UserSchema = new Schema<IUser>(
  {
    name: { type: String, required: true },
    username: { type: String, required: true, unique: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    agreeToTerms: { type: Boolean, required: true },
    ispublic: { type: String, default: "true" },
    lastSeen: { type: Date },
    gender: { type: String, enum: ["male", "female", "other"], required: true },
    avatar: { type: String },
  },
  {
    timestamps: true,
  }
);


export const User = mongoose.model<IUser>("User", UserSchema);
