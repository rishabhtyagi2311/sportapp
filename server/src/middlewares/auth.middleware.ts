import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

export interface AuthRequest extends Request {
  partner?: { id: string };
}

export interface UserAuthRequest extends Request {
  user?: { id: number };
}

export const authenticatePartner = (req: AuthRequest, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ success: false, message: "Access Denied: No Token Provided" });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET as string) as { id: string; type?: string };

    if (decoded.type !== 'partner') {
      return res.status(403).json({ success: false, message: "Invalid or Expired Token" });
    }

    req.partner = { id: decoded.id };
    next();
  } catch (error) {
    res.status(403).json({ success: false, message: "Invalid or Expired Token" });
  }
};

export const authenticateUser = (req: UserAuthRequest, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ success: false, message: "Access Denied: No Token Provided" });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET as string) as { id: number; type?: string };

    if (decoded.type !== 'user') {
      return res.status(403).json({ success: false, message: "Invalid or Expired Token" });
    }

    req.user = { id: decoded.id };
    next();
  } catch (error) {
    res.status(403).json({ success: false, message: "Invalid or Expired Token" });
  }
};
