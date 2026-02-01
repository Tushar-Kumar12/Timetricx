import mongoose, { Schema, Document } from 'mongoose';

export interface IInternDocument extends Document {
  internEmail: string;

  resume?: string;
  aadhar?: string;
  collegeId?: string;
  offerLetter?: string;
  noc?: string;

  createdAt: Date;
  updatedAt: Date;
}

const InternDocumentSchema = new Schema<IInternDocument>(
  {
    internEmail: {
      type: String,
      required: true,
      lowercase: true,
      index: true,
    },

    resume: String,
    aadhar: String,
    collegeId: String,
    offerLetter: String,
    noc: String,
  },
  { timestamps: true }
);

export default mongoose.models.InternDocument ||
  mongoose.model<IInternDocument>('InternDocument', InternDocumentSchema);
