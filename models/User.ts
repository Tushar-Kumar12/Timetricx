import mongoose, { Document, Schema } from 'mongoose';

export interface IUser extends Document {
  name: string;
  email: string;
  password?: string;
  mobileNumber?: string;
  profilePicture?: string;
  designation?: string; // 👈 added
  shift?: string; // 👈 added
  workingType?: string; // 👈 added
  role: 'user' | 'admin' | 'moderator';
  isActive: boolean;
  isEmailVerified: boolean;
  skills?: string[]; // 👈 added
  emailVerificationToken?: string;
  passwordResetToken?: string;
  passwordResetExpires?: Date;
  lastLogin?: Date;
  authProviders: {
    google?: {
      id: string;
      email: string;
    };
    github?: {
      id: string;
      username: string;
      email: string;
    };
  };
  preferences: {
    theme: 'light' | 'dark' | 'system';
    notifications: {
      email: boolean;
      push: boolean;
      sms: boolean;
    };
    language: string;
  };
  profile: {
    bio?: string;
    website?: string;
    location?: string;
    dateOfBirth?: Date;
    gender?: 'male' | 'female' | 'other' | 'prefer_not_to_say';
  };
  socialLinks?: {
    linkedin?: string;
    twitter?: string;
    instagram?: string;
    facebook?: string;
  };
}

const UserSchema: Schema = new Schema(
  {
    name: {
      type: String,
      trim: true,
      maxlength: 100
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      index: true
    },
    password: {
      type: String,
      minlength: 6,
      select: false
    },
    mobileNumber: {
      type: String,
      sparse: true
    },
    shift: {
      type: String,
      enum: ['day', 'night'],
      default: 'day'
    },
    workingType: {
      type: String,
      enum: ['intern', 'employee', 'freelancer'],
      required: false,
      default: undefined
    },
    profilePicture: {
      type: String,
      default: ''
    },
    designation: {          // 👈 added
      type: String,
      trim: true,
      maxlength: 100
    },
    skills: {               // 👈 added
      type: [String],
      default: []
    },
    role: {
      type: String,
      enum: ['user', 'admin',],
      default: 'user'
    },
    isActive: {
      type: Boolean,
      default: true
    },
    isEmailVerified: {
      type: Boolean,
      default: false
    },
    emailVerificationToken: String,
    passwordResetToken: String,
    passwordResetExpires: Date,
    lastLogin: Date,
    authProviders: {
      google: {
        id: String,
        email: String
      },
      github: {
        id: String,
        username: String,
        email: String
      }
    },
    preferences: {
      theme: {
        type: String,
        enum: ['light', 'dark', 'system'],
        default: 'system'
      },
      notifications: {
        email: {
          type: Boolean,
          default: true
        },
        push: {
          type: Boolean,
          default: true
        },
        sms: {
          type: Boolean,
          default: false
        }
      },
      language: {
        type: String,
        default: 'en'
      }
    },
    profile: {
      bio: {
        type: String,
        maxlength: 500
      },
      website: String,
      location: String,
      dateOfBirth: Date,
      gender: {
        type: String,
        enum: ['male', 'female', 'other', 'prefer_not_to_say']
      }
    },
    socialLinks: {
      linkedin: String,
      twitter: String,
      instagram: String,
      facebook: String
    }
  },
  {
    timestamps: true
  }
);

export const User =
  mongoose.models.User ||
  mongoose.model<IUser>('User', UserSchema);
