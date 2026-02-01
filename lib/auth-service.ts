import connectDB from "./database";

import { User } from "../models/User";


/**
 * Find user by email
 */
export async function findUserByEmail(email: string) {
  try {
    await connectDB();
    return await User.findOne({ email: email.toLowerCase() });
  } catch (error) {
    console.error("Error finding user by email:", error);
    return null;
  }
}

/**
 * Find user by mobile number
 */
export async function findUserByMobile(mobile: string) {
  try {
    await connectDB();
    return await User.findOne({ mobileNumber: mobile });
  } catch (error) {
    console.error("Error finding user by mobile:", error);
    return null;
  }
}

/**
 * Find user ONLY by Google auth email
 */
export async function findUserByGoogleEmail(email: string) {
  try {
    await connectDB();
    return await User.findOne({
      "authProviders.google.email": email.toLowerCase(),
    });
  } catch (error) {
    console.error("Error finding Google user:", error);
    return null;
  }
}

/**
 * Upsert Google OAuth user
 * Saves ONLY:
 * authProviders.google.id
 * authProviders.google.email
 */
export async function upsertGoogleOAuthUser({
  email,
  name,
  providerId,
}: {
  email: string;
  name?: string;
  providerId: string;
}) {
  try {
    await connectDB();
    return await User.findOneAndUpdate(
      { "authProviders.google.email": email.toLowerCase() },
      {
        $set: {
          email: email.toLowerCase(),
          "authProviders.google.id": providerId,
          "authProviders.google.email": email.toLowerCase(),
        },
        $setOnInsert: {
          name: name || email.split('@')[0],
          role: "user",
          isActive: true,
          isEmailVerified: true,
        },
      },
      {
        upsert: true,
        new: true,
      }
    );
  } catch (error) {
    console.error("Error upserting Google OAuth user:", error);
    throw error;
  }
}

/**
 * Upsert GitHub OAuth user
 * Saves ONLY:
 * authProviders.github.id
 * authProviders.github.email
 */
export async function upsertGitHubOAuthUser({
  email,
  name,
  providerId,
}: {
  email: string;
  name?: string;
  providerId: string;
}) {
  try {
    await connectDB();
    return await User.findOneAndUpdate(
      { "authProviders.github.email": email.toLowerCase() },
      {
        $set: {
          email: email.toLowerCase(),
          "authProviders.github.id": providerId,
          "authProviders.github.email": email.toLowerCase(),
        },
        $setOnInsert: {
          name: name || email.split('@')[0],
          role: "user",
          isActive: true,
          isEmailVerified: true,
        },
      },
      {
        upsert: true,
        new: true,
      }
    );
  } catch (error) {
    console.error("Error upserting GitHub OAuth user:", error);
    throw error;
  }
}
