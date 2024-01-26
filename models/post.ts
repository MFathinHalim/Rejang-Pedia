import { Schema, model, Document } from "mongoose";

interface PostContent {
  babTitle: string;
  babContent: string;
}

interface Post extends Document {
  id: string;
  Title: string;
  Image: string;
  Pembuat: string;
  Diedit: string;
  Link: string;
  Waktu: string;
  Edit: string;
  Content: PostContent[];
}

interface Comment {
  commentId: string;
  commenterName: string;
  commentContent: string;
}

interface SocialPost extends Document {
  noteId: string;
  noteName: string;
  noteContent: string;
  like: number;
  color: string;
  comment: Comment[];
}

const postSchema = new Schema<Post>({
  id: String,
  Title: String,
  Image: String,
  Pembuat: String,
  Diedit: String,
  Link: String,
  Waktu: String,
  Edit: String,
  Content: [
    {
      babTitle: String,
      babContent: String,
    },
  ],
});

const postSchemaSocial = new Schema<SocialPost>({
  noteId: String,
  noteName: String,
  noteContent: String,
  like: {
    type: Number,
    default: 0,
  },
  color: String,
  comment: [
    {
      commentId: String,
      commenterName: String,
      commentContent: String,
    },
  ],
});

export const mainModel = model<Post>("mains", postSchema);
export const goingModel = model<Post>("ongoings", postSchema);
export const socialModel = model<SocialPost>("chat", postSchemaSocial);
