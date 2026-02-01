import mongoose, { Schema, Document } from 'mongoose'

/* =======================
   PROJECT INTERFACE
======================= */
export interface IProject extends Document {
  name: string
  description?: string
  status: 'active' | 'completed' | 'pending'
  priority: 'low' | 'medium' | 'high'
  deadline?: Date

  teamEmails: string[]
  descriptionDriveLink?: string

  tasks: {
    total: number
    completed: number
  }

  progress: number

  dailyUpdates: {
    date: Date
    update: string
  }[]

  createdAt: Date
  updatedAt: Date
}

/* =======================
   PROJECT SCHEMA
======================= */
const ProjectSchema = new Schema<IProject>(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      maxlength: 150
    },

    description: {
      type: String,
      trim: true
    },

    status: {
      type: String,
      enum: ['active', 'completed', 'pending'],
      default: 'pending'
    },
    descriptionDriveLink: {
      type: String,
      trim: true
    },
    priority: {
      type: String,
      enum: ['low', 'medium', 'high'],
      default: 'medium'
    },

    deadline: {
      type: Date
    },

    teamEmails: {
      type: [String],
      required: true
    },

    /* ===== TASK COUNTS ===== */
    tasks: {
      total: {
        type: Number,
        required: true
      },
      completed: {
        type: Number,
        default: 0
      }
    },

    /* ===== PROGRESS (0–100) ===== */
    progress: {
      type: Number,
      default: 0,
      min: 0,
      max: 100
    },

    /* ===== DAILY WORK UPDATES ===== */
    dailyUpdates: [
      {
        date: {
          type: Date,
          required: true,
          default: () => new Date()
        },
        update: {
          type: String,
          required: true,
          trim: true
        }
      }
    ]
  },
  {
    timestamps: true // createdAt & updatedAt auto
  }
)
delete mongoose.models.Project;

/* =======================
   EXPORT MODEL
======================= */
export const Project =
  mongoose.models.Project ||
  mongoose.model<IProject>('Project', ProjectSchema)
