import { Request } from "express";

export interface AuthRequest extends Request {
  user?: {
    id: number;
    email: string;
    name: string | null;
    phone: string | null;
    image: string | null;
  };
  file?: any; // For multer
}
