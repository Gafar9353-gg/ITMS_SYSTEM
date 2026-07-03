// Make sure AuthService is exported as a class
export class AuthService {
  async login(email: string, password: string) {
    // Mock user for testing
    const users = [
      {
        id: 1,
        email: 'systemadmin@mitkundapura.com',
        password: 'Admin@123',
        name: 'System Admin',
        role: 'admin'
      }
    ];

    const user = users.find(u => u.email === email);
    
    if (!user) {
      return {
        success: false,
        message: 'User not found'
      };
    }
    
    if (user.password !== password) {
      return {
        success: false,
        message: 'Invalid password'
      };
    }
    
    // Generate simple token
    const token = Buffer.from(`${user.id}:${Date.now()}`).toString('base64');
    
    return {
      success: true,
      message: 'Login successful',
      token: token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role
      }
    };
  }

  async verifyToken(token?: string) {
    if (!token) return false;
    // Simple token verification
    try {
      const decoded = Buffer.from(token, 'base64').toString();
      return decoded.includes(':');
    } catch {
      return false;
    }
  }
}