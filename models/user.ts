import { Schema, model, Document } from "mongoose";

interface User extends Document {
  id: string;
  username: string;
  password: string;
  desc: string;
  atmin: boolean;
}

const postSchema = new Schema<User>({
  id: String,
  username: String,
  password: String,
  desc: String,
  atmin: Boolean,
});

export const userModel = model<User>("user", postSchema);
