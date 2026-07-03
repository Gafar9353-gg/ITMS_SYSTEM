import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import mitkLogo from '../assets/mitk_logo.png';

const Login = () => {
  const navigate = useNavigate();
  const { login, isLoading, error, clearError } = useAuthStore();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    clearError();
    
    if (!email || !password) return;
    
    const success = await login(email, password);
    if (success) {
      if (rememberMe) {
        localStorage.setItem('rememberedEmail', email);
      } else {
        localStorage.removeItem('rememberedEmail');
      }
      navigate('/dashboard');
    }
  };

  useEffect(() => {
    const remembered = localStorage.getItem('rememberedEmail');
    if (remembered) {
      setEmail(remembered);
      setRememberMe(true);
    }
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center p-6 relative overflow-hidden bg-slate-950">
      {/* Background Campus Image with smooth animation */}
      <div className="absolute inset-0 z-0 overflow-hidden">
        <img 
          src="/college-bg.jpg" 
          alt="MITK Campus" 
          className="w-full h-full object-cover animate-zoom-fade"
        />
        {/* Fallback color if image fails */}
        <div className="absolute inset-0 bg-[#0a1628] -z-10"></div>
        
        {/* Multi-layered Gradient Overlays for depth */}
        <div className="absolute inset-0 bg-gradient-to-br from-[#0a1628]/80 via-[#102040]/70 to-[#1a2a5a]/85 backdrop-blur-[1px]"></div>
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent mix-blend-multiply"></div>
      </div>

      {/* 2. ANIMATED FLOATING PARTICLES */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
        {[...Array(20)].map((_, i) => (
          <div
            key={i}
            className="absolute border border-cyan-400/30 bg-cyan-500/10 rounded-sm shadow-[0_0_10px_rgba(0,200,255,0.1)]"
            style={{
              width: Math.random() * 15 + 5 + 'px',
              height: Math.random() * 15 + 5 + 'px',
              top: Math.random() * 100 + '%',
              left: Math.random() * 100 + '%',
              animation: `floatSquare ${Math.random() * 20 + 15}s linear infinite`,
              animationDelay: Math.random() * 10 + 's',
            }}
          />
        ))}
      </div>

      {/* 3. MAIN LAYOUT */}
      <div className="relative w-full max-w-5xl flex flex-col lg:flex-row items-center gap-10 lg:gap-16 z-10">
        
        {/* LEFT SIDE: MITK ITMS Branding with Logo */}
        <div className="flex-1 text-center lg:text-left animate-fade-in-left relative">
          
          <div className="mb-4 inline-block lg:mx-0 mx-auto">
            {/* Custom Logo Image */}
            <div className="inline-flex items-center justify-center w-24 h-24 rounded-2xl bg-white shadow-xl mb-6 p-1.5 border border-white/10 hover:scale-105 transition-transform duration-300">
              <img src={mitkLogo} alt="MITK Logo" className="w-full h-full object-contain" />
            </div>

            {/* Custom Text Logo with Gradient and Glow */}
            <div className="relative">
              <h1 className="text-6xl lg:text-[5.5rem] font-black tracking-tighter text-transparent bg-clip-text bg-gradient-to-r from-[#0056b3] via-[#0088cc] to-[#00aaff] drop-shadow-[0_0_30px_rgba(0,136,204,0.4)]">
                MITK
              </h1>
              <div className="absolute -inset-1 bg-gradient-to-r from-blue-600 to-cyan-400 rounded-full blur-3xl opacity-20 -z-10"></div>
            </div>
            
            <h2 className="text-2xl lg:text-3xl font-bold text-white/90 tracking-[0.2em] mt-1 uppercase">
              ITMS
            </h2>
          </div>
          
          <div className="h-1.5 w-24 bg-gradient-to-r from-cyan-400 to-blue-600 rounded-full lg:mx-0 mx-auto mt-2 shadow-[0_0_15px_rgba(0,200,255,0.5)]"></div>
          <p className="text-blue-200/80 text-base lg:text-lg mt-4 font-light tracking-widest uppercase">
            Information Technology <br className="hidden lg:block"/> Management System
          </p>
        </div>

        {/* RIGHT SIDE: Glassmorphism Login Card */}
        <div className="flex-1 w-full max-w-md animate-fade-in-right">
          <div className="relative backdrop-blur-xl bg-white/5 border border-white/20 rounded-3xl p-8 shadow-2xl overflow-hidden hover:border-white/30 transition-all duration-500">
            
            {/* Slow rotating gradient behind the card */}
            <div className="absolute -top-1/2 -left-1/2 w-full h-full bg-gradient-to-r from-cyan-500/10 to-blue-600/10 rounded-full blur-3xl animate-spin-slow pointer-events-none"></div>

            <div className="relative z-10">
              <div className="text-center mb-8">
                <h2 className="text-3xl font-bold text-white mb-1">Welcome Back</h2>
                <p className="text-blue-200/60 text-sm">Sign in to your dashboard</p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                {error && (
                  <div className="bg-red-500/20 border border-red-400/30 rounded-xl p-3 animate-shake">
                    <p className="text-red-300 text-sm text-center font-medium">{error}</p>
                  </div>
                )}

                <div className="space-y-1">
                  <label className="block text-white/80 text-sm font-semibold tracking-wide">Email Address</label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-4 py-3.5 bg-black/40 border border-white/10 rounded-xl text-white placeholder-blue-300/40 focus:outline-none focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400/30 transition-all"
                    placeholder="systemadmin@mitkundapura.com"
                    required
                  />
                </div>

                <div className="space-y-1">
                  <label className="block text-white/80 text-sm font-semibold tracking-wide">Password</label>
                  <div className="relative">
                    <input
                      type={showPassword ? "text" : "password"}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full px-4 py-3.5 bg-black/40 border border-white/10 rounded-xl text-white placeholder-blue-300/40 focus:outline-none focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400/30 transition-all pr-12"
                      placeholder="Enter your password"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-white/40 hover:text-cyan-300 transition-colors"
                    >
                      {showPassword ? (
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88" />
                        </svg>
                      ) : (
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
                          <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                      )}
                    </button>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <label className="flex items-center gap-2 cursor-pointer group/check">
                    <input
                      type="checkbox"
                      checked={rememberMe}
                      onChange={(e) => setRememberMe(e.target.checked)}
                      className="w-4 h-4 rounded border-white/30 bg-black/30 text-cyan-400 focus:ring-cyan-400/50 cursor-pointer"
                    />
                    <span className="text-sm text-white/70 group-hover/check:text-white transition-colors">Remember me</span>
                  </label>
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full py-3.5 bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-bold rounded-xl shadow-lg shadow-cyan-500/20 hover:shadow-cyan-500/40 hover:scale-[1.02] active:scale-[0.98] transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed relative overflow-hidden group/btn"
                >
                  {/* Shimmer Effect */}
                  <span className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-white/30 to-transparent -translate-x-full group-hover/btn:translate-x-full transition-transform duration-700 skew-x-12"></span>
                  
                  {isLoading ? (
                    <div className="flex items-center justify-center gap-2">
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      <span>Authenticating...</span>
                    </div>
                  ) : (
                    'Sign In'
                  )}
                </button>
              </form>

              <div className="mt-8 pt-6 border-t border-white/10">
                <div className="text-center mb-3">
                  <span className="text-xs font-bold text-white/30 uppercase tracking-widest">Demo Credentials</span>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-black/30 rounded-lg p-3 text-center border border-white/5 hover:border-cyan-500/30 transition-colors duration-300">
                    <p className="text-white/40 text-[10px] uppercase tracking-wider">Email</p>
                    <p className="text-cyan-300 text-sm font-mono mt-1 truncate">systemadmin@mitkundapura.com</p>
                  </div>
                  <div className="bg-black/30 rounded-lg p-3 text-center border border-white/5 hover:border-cyan-500/30 transition-colors duration-300">
                    <p className="text-white/40 text-[10px] uppercase tracking-wider">Password</p>
                    <p className="text-cyan-300 text-sm font-mono mt-1">Admin@123</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes ken-burns {
          0% { transform: scale(1) translate(0%, 0%); }
          100% { transform: scale(1.15) translate(-2%, -2%); }
        }
        @keyframes floatSquare {
          0% { transform: translateY(100vh) rotate(0deg) scale(0); opacity: 0; }
          10% { opacity: 0.6; }
          90% { opacity: 0.6; }
          100% { transform: translateY(-100vh) rotate(720deg) scale(1); opacity: 0; }
        }
        @keyframes fadeInLeft {
          from { opacity: 0; transform: translateX(-40px); }
          to { opacity: 1; transform: translateX(0); }
        }
        @keyframes fadeInRight {
          from { opacity: 0; transform: translateX(40px); }
          to { opacity: 1; transform: translateX(0); }
        }
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          25% { transform: translateX(-6px); }
          75% { transform: translateX(6px); }
        }
        @keyframes spin-slow {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        .animate-ken-burns { animation: ken-burns 20s ease-in-out infinite alternate; }
        .animate-fade-in-left { animation: fadeInLeft 0.8s ease-out forwards; }
        .animate-fade-in-right { animation: fadeInRight 0.8s ease-out forwards; }
        .animate-shake { animation: shake 0.4s ease-in-out; }
        .animate-spin-slow { animation: spin-slow 30s linear infinite; }
      `}</style>
    </div>
  );
};

export default Login;