import mongoose from 'mongoose';

const ChatSchema = new mongoose.Schema(
  {
    projectName: {
      type: String,
      required: true,
      trim: true,
      index: true,
    },

    senderEmail: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
    },

    message: {
      type: String,
      required: true,
      trim: true,
      maxlength: 2000,
    },
  },
  {
    timestamps: true,
  }
);

// compound index for fast queries
ChatSchema.index({ projectName: 1, createdAt: -1 });

// Proper TypeScript typing
interface IChat extends mongoose.Document {
  projectName: string;
  senderEmail: string;
  message: string;
  createdAt: Date;
  updatedAt: Date;
}

// delete existing model to avoid overwrite issues
delete mongoose.models.Chat;

export default mongoose.model<IChat>('Chat', ChatSchema);
