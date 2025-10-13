import type { Request, Response } from "express";
import { register, login } from "./auth.service";
import { findUserById, updateUser, findUserByEmail, findUserByGoogleId, findUserByFacebookId, createOAuthUser } from "./auth.model";
import { signJwt } from "../../utils/jwt";

export const registerController = async (req: Request, res: Response) => {
  try {
    const { name, email, password } = req.body as { name: string; email: string; password: string };
    if (!name || !email || !password) {
      return res.status(400).json({ message: "Missing fields" });
    }
    const result = await register(name, email, password);
    return res.status(201).json(result);
  } catch (err: any) {
    console.error("Register error:", err);
    if (err?.message === "EMAIL_EXISTS") {
      return res.status(409).json({ message: "Email already registered" });
    }

    if (err?.code === "ER_DUP_ENTRY") {
      return res.status(409).json({ message: "Email already registered" });
    }
    return res.status(500).json({ message: "Internal server error" });
  }
};

export const loginController = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body as { email: string; password: string };
    if (!email || !password) {
      return res.status(400).json({ message: "Missing fields" });
    }
    const result = await login(email, password);
    return res.status(200).json(result);
  } catch (err: any) {
    if (err?.message === "INVALID_CREDENTIALS") {
      return res.status(401).json({ message: "Invalid email or password" });
    }
    return res.status(500).json({ message: "Internal server error" });
  }
};

export const getProfileController = async (req: Request, res: Response) => {
  try {
    // Token payload has user_id (with underscore)
    const userId = (req as any).user?.user_id;
    
    console.log("User from token:", (req as any).user);
    console.log("User ID:", userId);
    
    if (!userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const user = await findUserById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    return res.status(200).json(user);
  } catch (err: any) {
    console.error("Get profile error:", err);
    return res.status(500).json({ message: "Internal server error" });
  }
};

export const updateProfileController = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.user_id;
    
    if (!userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const { name, email, phone, address } = req.body as { 
      name: string; 
      email: string; 
      phone?: string; 
      address?: string 
    };
    
    if (!name || !email) {
      return res.status(400).json({ message: "Name and email are required" });
    }

    // Check if email is already used by another user
    const existingUser = await findUserByEmail(email);
    if (existingUser && existingUser.user_id !== userId) {
      return res.status(409).json({ message: "Email already in use" });
    }

    const updated = await updateUser(userId, name, email, phone, address);
    
    if (!updated) {
      return res.status(404).json({ message: "User not found" });
    }

    // Get updated user data
    const updatedUser = await findUserById(userId);
    
    return res.status(200).json({
      message: "Profile updated successfully",
      user: updatedUser
    });
  } catch (err: any) {
    console.error("Update profile error:", err);
    return res.status(500).json({ message: "Internal server error" });
  }
};

// OAuth Callback Handler
export const oauthCallbackController = async (req: Request, res: Response) => {
  try {
    const oauthData = (req as any).user;
    
    if (!oauthData) {
      return res.redirect(`${process.env.FRONTEND_URL || 'http://localhost:5173'}/login?error=auth_failed`);
    }

    const { provider, providerId, email, name, profilePicture } = oauthData;

    let user;

    // Tìm user theo provider ID
    if (provider === 'google') {
      user = await findUserByGoogleId(providerId);
    } else if (provider === 'facebook') {
      user = await findUserByFacebookId(providerId);
    }

    // Nếu chưa có user, tìm theo email hoặc tạo mới
    if (!user && email) {
      user = await findUserByEmail(email);
      
      if (!user) {
        // Tạo user mới
        const newUserId = await createOAuthUser(name, email, provider, providerId, profilePicture);
        user = await findUserById(newUserId);
      }
    }

    if (!user) {
      return res.redirect(`${process.env.FRONTEND_URL || 'http://localhost:5173'}/login?error=user_not_found`);
    }

    // Tạo JWT token
    const token = signJwt({ 
      user_id: user.user_id, 
      email: user.email, 
      role: user.role 
    });

    // Redirect về frontend với token
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
    return res.redirect(`${frontendUrl}/auth/callback?token=${token}&name=${encodeURIComponent(user.name)}`);
    
  } catch (err: any) {
    console.error("OAuth callback error:", err);
    return res.redirect(`${process.env.FRONTEND_URL || 'http://localhost:5173'}/login?error=server_error`);
  }
};
