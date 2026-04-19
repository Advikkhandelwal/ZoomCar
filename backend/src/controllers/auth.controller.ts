import { Response } from "express";
import * as authService from "../services/auth.service";
import { OAuth2Client } from 'google-auth-library';
import { AuthRequest } from "../types";

const client = new OAuth2Client(
  process.env.GOOGLE_CLIENT_ID?.replace(/"/g, ''),
  process.env.GOOGLE_CLIENT_SECRET?.replace(/"/g, '')
);

export const register = async (req: AuthRequest, res: Response) => {
  try {
    const { name, email, password, phone } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({
        error: "Missing required fields: name, email, password",
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        error: "Password must be at least 6 characters long",
      });
    }

    const result = await authService.register({ name, email, password, phone });
    res.status(201).json(result);
  } catch (error: any) {
    console.error("Error registering user:", error);
    if (error.message === "User with this email already exists") {
      return res.status(409).json({ error: error.message });
    }
    res.status(500).json({ error: "Failed to register user", message: error.message });
  }
};

export const googleAuth = async (req: AuthRequest, res: Response) => {
  try {
    const { token } = req.body;

    if (!token) {
      return res.status(400).json({ error: "Token is required" });
    }

    const ticket = await client.verifyIdToken({
      idToken: token,
      audience: process.env.GOOGLE_CLIENT_ID?.replace(/"/g, ''),
    });
    const payload = ticket.getPayload();
    if (!payload || !payload.email || !payload.name) {
      return res.status(400).json({ error: "Invalid Google token payload" });
    }

    const result = await authService.googleLogin({ 
      name: payload.name, 
      email: payload.email, 
      image: payload.picture || "" 
    });
    res.json(result);
  } catch (error: any) {
    console.error("Error verifying Google token:", error);
    res.status(401).json({ error: "Invalid Google token", message: error.message });
  }
};

export const login = async (req: AuthRequest, res: Response) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        error: "Missing required fields: email, password",
      });
    }

    const result = await authService.login(email, password);
    res.json(result);
  } catch (error: any) {
    console.error("Error logging in:", error);
    if (error.message === "Invalid email or password") {
      return res.status(401).json({ error: error.message });
    }
    res.status(500).json({ error: "Failed to login", message: error.message });
  }
};

export const getMe = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: "Not authenticated" });
    }
    const user = await authService.getUserById(req.user.id);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }
    res.json(user);
  } catch (error: any) {
    console.error("Error getting user:", error);
    res.status(500).json({ error: "Failed to fetch user", message: error.message });
  }
};

export const logout = async (req: AuthRequest, res: Response) => {
  // Since we're using JWT, logout is handled client-side by removing the token
  // But we can add token blacklisting here if needed in the future
  res.json({ message: "Logged out successfully" });
};

export const updateMe = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: "Not authenticated" });
    }
    const { name, phone } = req.body;
    console.log(`📞 UPDATE PROFILE REQUEST - User ID: ${req.user.id}, Name: ${name}, Phone: ${phone}`);
    let image = req.body.image;

    if (req.file) {
      image = (req.file as any).supabaseUrl;
    }

    const user = await authService.updateUserProfile(req.user.id, {
      name,
      phone,
      image,
    });

    console.log(`📞 PROFILE UPDATED - User ${user.id} now has phone: ${user.phone}`);
    res.json(user);
  } catch (error: any) {
    console.error("Error updating user profile:", error);
    res
      .status(500)
      .json({ error: "Failed to update profile", message: error.message });
  }
};

export const getUserById = async (req: AuthRequest, res: Response) => {
  try {
    const user = await authService.getUserById(Number(req.params.id));
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }
    // Don't expose sensitive info like phone unless authorized (handled in service or here)
    // For now, returning the user object as service returns it (usually safe subset)
    res.json(user);
  } catch (error: any) {
    console.error("Error getting user by ID:", error);
    res.status(500).json({ error: "Failed to fetch user", message: error.message });
  }
};
