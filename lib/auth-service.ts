import connectDB from "./database";
import { User } from "../models/User";

/**
 * Find user by ROOT email (OTP verified user)
 */
export async function findUserByEmail(email: string) {
  try {
    await connectDB();
    return await User.findOne({ email: email.toLowerCase() });
  } catch (error) {
    console.error("Error finding user:", error);
    return null;
  }
}

/**
 * Connect Google to EXISTING user
 * ❌ DOES NOT CREATE USER
 */
export async function connectGoogleToUser({
  email,
  providerId,
  googleEmail,
}: {
  email: string;          // OTP verified email (root)
  providerId: string;     // Google sub
  googleEmail: string;    // Google account email
}) {
  try {
    await connectDB();

    // 🔒 Check: same Google already linked to another user
    const alreadyLinked = await User.findOne({
      "authProviders.google.id": providerId,
    });

    if (alreadyLinked && alreadyLinked.email !== email.toLowerCase()) {
      throw new Error("Google account already linked to another user");
    }

    const user = await User.findOne({ email: email.toLowerCase() });

    if (!user) {
      throw new Error("User does not exist");
    }

    // 🛡️ Ensure authProviders object
    if (!user.authProviders) {
      user.authProviders = {};
    }

    // 🔗 Attach Google
    user.authProviders.google = {
      id: providerId,
      email: googleEmail.toLowerCase(),
    };

    await user.save();

    return user;
  } catch (error) {
    console.error("Error connecting Google:", error);
    throw error;
  }
}
