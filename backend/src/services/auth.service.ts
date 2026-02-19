import prisma from "../config/prisma";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

const JWT_SECRET: string = process.env.JWT_SECRET || "your-secret-key";
const JWT_EXPIRES_IN: string = process.env.JWT_EXPIRES_IN || "7d";

interface RegisterData {
  name: string;
  email: string;
  password: string;
  phone?: string;
}

interface UserResponse {
  id: number;
  name: string | null;
  email: string;
  phone: string | null;
  image: string | null;
  createdAt: Date;
}

export const register = async (data: RegisterData): Promise<{ user: UserResponse; token: string }> => {
  const { name, email, password, phone } = data;

  // Check if user already exists
  const existingUser = await prisma.user.findUnique({
    where: { email },
  });

  if (existingUser) {
    throw new Error("User with this email already exists");
  }

  // Hash password
  const hashedPassword = await bcrypt.hash(password, 10);

  // Create user
  const user = await prisma.user.create({
    data: {
      name,
      email,
      password: hashedPassword,
      phone,
    },
    select: {
      id: true,
      name: true,
      email: true,
      phone: true,
      image: true,
      createdAt: true,
    },
  });

  // Generate token
  const token = jwt.sign({ userId: user.id }, JWT_SECRET, {
    expiresIn: JWT_EXPIRES_IN as any,
  });

  return { user, token };
};

export const login = async (email: string, password: string): Promise<{ user: Partial<UserResponse>; token: string }> => {
  // Find user
  const user = await prisma.user.findUnique({
    where: { email },
  });

  if (!user) {
    throw new Error("Invalid email or password");
  }

  // Verify password
  const isValidPassword = await bcrypt.compare(password, user.password);

  if (!isValidPassword) {
    throw new Error("Invalid email or password");
  }

  // Generate token
  const token = jwt.sign({ userId: user.id }, JWT_SECRET, {
    expiresIn: JWT_EXPIRES_IN as any,
  });

  return { 
    user: { 
      id: user.id,
      name: user.name,
      email: user.email,
      image: user.image,
      createdAt: user.createdAt
    }, 
    token 
  };
};

export const googleLogin = async ({ name, email, image }: { name: string; email: string; image: string }): Promise<{ user: Partial<UserResponse>; token: string }> => {
  let user = await prisma.user.findUnique({ where: { email } });

  if (!user) {
    // Register new user with random password
    const randomPassword = Math.random().toString(36).slice(-8) + Math.random().toString(36).slice(-8);
    const hashedPassword = await bcrypt.hash(randomPassword, 4); // Fast hashing for random inaccessible OAuth passwords

    user = await prisma.user.create({
      data: {
        name: name || "User",
        email,
        password: hashedPassword,
        image,
      },
    });
  }

  const token = jwt.sign({ userId: user.id }, JWT_SECRET, {
    expiresIn: "7d",
  });

  return { 
    user: { 
      id: user.id,
      name: user.name,
      email: user.email,
      image: user.image,
      createdAt: user.createdAt
    }, 
    token 
  };
};

export const getUserById = async (userId: number): Promise<UserResponse | null> => {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      name: true,
      email: true,
      phone: true,
      image: true,
      createdAt: true,
    },
  });

  return user as UserResponse | null;
};

export const updateUserProfile = async (userId: number, data: { name?: string; phone?: string; image?: string }): Promise<UserResponse> => {
  const updateData: any = {};

  if (data.name !== undefined) updateData.name = data.name;
  if (data.phone !== undefined) updateData.phone = data.phone;
  if (data.image !== undefined) updateData.image = data.image;

  const user = await prisma.user.update({
    where: { id: userId },
    data: updateData,
    select: {
      id: true,
      name: true,
      email: true,
      phone: true,
      image: true,
      createdAt: true,
    },
  });

  return user as UserResponse;
};

