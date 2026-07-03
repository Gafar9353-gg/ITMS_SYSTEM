import { Request, Response } from 'express';
import { AuthService } from './auth.service';

const authService = new AuthService();

export class AuthController {
  async login(req: Request, res: Response) {
    try {
      const { email, password } = req.body;
      
      console.log('Login attempt:', { email }); // Debug log
      
      const result = await authService.login(email, password);
      
      if (result.success) {
        return res.status(200).json(result);
      }
      return res.status(401).json(result);
    } catch (error) {
      console.error('Login controller error:', error);
      return res.status(500).json({
        success: false,
        message: 'Internal server error'
      });
    }
  }

  async logout(req: Request, res: Response) {
    return res.json({ 
      success: true, 
      message: 'Logged out successfully' 
    });
  }

  async verifyToken(req: Request, res: Response) {
    const token = req.headers.authorization?.split(' ')[1];
    const isValid = await authService.verifyToken(token);
    return res.json({ valid: isValid });
  }
}