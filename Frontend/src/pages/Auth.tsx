import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { motion, AnimatePresence } from 'framer-motion';
import { Lock, User, Mail, ArrowRight, Heart, Shield, Eye } from 'lucide-react';

const loginSchema = yup.object({
  email: yup.string().email('Invalid email').required('Email is required'),
  password: yup.string().min(6, 'Min 6 characters').required('Password is required'),
});
const signupSchema = yup.object({
  name: yup.string().required('Name is required'),
  email: yup.string().email('Invalid email').required('Email is required'),
  password: yup.string().min(6, 'Min 6 characters').required('Password is required'),
});

const Auth = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login, signup } = useAuth();
  const navigate = useNavigate();

  const { register, handleSubmit, formState: { errors }, reset } = useForm<any>({
    resolver: yupResolver((isLogin ? loginSchema : signupSchema) as any),
  });

  const toggleMode = () => {
    setIsLogin(v => !v);
    setError('');
    reset();
  };

  const onSubmit = async (data: any) => {
    setLoading(true);
    setError('');
    try {
      if (isLogin) await login(data.email, data.password);
      else await signup(data.name, data.email, data.password);
      navigate('/');
    } catch (err: any) {
      setError(err.response?.data?.error || `${isLogin ? 'Login' : 'Signup'} failed`);
    } finally {
      setLoading(false);
    }
  };

  const features = [
    { icon: Shield, text: 'Every creator is Aadhaar-verified' },
    { icon: Eye, text: 'Fully transparent fund tracking' },
    { icon: Heart, text: '0% platform fee — every rupee counts' },
  ];

  return (
    <div className="min-h-[85vh] bg-ivory flex">

      {/* Left — Editorial Panel (Desktop only) */}
      <div className="hidden lg:flex lg:w-[45%] bg-navy relative overflow-hidden items-center justify-center p-12">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-1/3 right-0 w-[300px] h-[300px] bg-coral/10 blob-1 blur-[80px]" />
          <div className="absolute bottom-0 left-0 w-[250px] h-[250px] bg-sage/10 blob-2 blur-[60px]" />
        </div>
        <div className="relative z-10 max-w-sm">
          <div className="flex items-center gap-2.5 mb-8">
            <div className="w-9 h-9 bg-coral rounded-xl flex items-center justify-center">
              <Heart className="w-[18px] h-[18px] text-white" fill="white" strokeWidth={0} />
            </div>
            <span className="text-xl font-serif text-white">CrowdFund</span>
          </div>
          <h2 className="text-[36px] font-serif text-white leading-tight mb-4">
            Join a community that <span className="text-coral">cares</span>
          </h2>
          <p className="text-white/50 text-[15px] leading-relaxed mb-10">
            Thousands of verified campaigns. Real stories. Real impact. Every donation is transparent and every rupee reaches those who need it most.
          </p>
          <div className="space-y-4">
            {features.map(f => (
              <div key={f.text} className="flex items-center gap-3">
                <div className="w-8 h-8 bg-white/8 rounded-lg flex items-center justify-center text-coral">
                  <f.icon className="w-4 h-4" />
                </div>
                <p className="text-white/60 text-[13px]">{f.text}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right — Form */}
      <div className="flex-1 flex items-center justify-center px-5 py-12">
        <div className="max-w-[400px] w-full">
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, ease: 'easeOut' as const }}
          >
            <h2 className="text-[32px] font-serif text-charcoal mb-2">
              {isLogin ? 'Welcome back' : 'Create your account'}
            </h2>
            <p className="text-stone text-[14px] mb-8">
              {isLogin ? 'Sign in to manage your campaigns and donations' : 'Join CrowdFund and start making an impact'}
            </p>

            {/* Toggle */}
            <div className="flex bg-cream rounded-xl p-1 mb-8 border border-sand/50">
              <button
                type="button"
                onClick={() => { setIsLogin(true); reset(); setError(''); }}
                className={`flex-1 py-2.5 rounded-lg text-[13px] font-semibold transition-all ${
                  isLogin ? 'bg-white text-charcoal shadow-warm-sm' : 'text-stone hover:text-charcoal'
                }`}
              >
                Sign In
              </button>
              <button
                type="button"
                onClick={() => { setIsLogin(false); reset(); setError(''); }}
                className={`flex-1 py-2.5 rounded-lg text-[13px] font-semibold transition-all ${
                  !isLogin ? 'bg-white text-charcoal shadow-warm-sm' : 'text-stone hover:text-charcoal'
                }`}
              >
                Sign Up
              </button>
            </div>

            <AnimatePresence mode="wait">
              <motion.form
                key={isLogin ? 'login' : 'signup'}
                initial={{ opacity: 0, x: isLogin ? -10 : 10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: isLogin ? 10 : -10 }}
                transition={{ duration: 0.2 }}
                onSubmit={handleSubmit(onSubmit)}
                className="space-y-5"
              >
                {!isLogin && (
                  <div>
                    <label className="block text-[12px] font-semibold text-charcoal mb-1.5">Full Name</label>
                    <div className="relative">
                      <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-stone/50" />
                      <input {...register('name')} type="text" placeholder="Your full name"
                        className="w-full pl-10 pr-4 py-3 bg-white border border-sand rounded-xl text-[14px] text-charcoal placeholder-stone/40 transition" />
                    </div>
                    {errors.name && <p className="mt-1 text-[12px] text-coral">{String(errors.name.message)}</p>}
                  </div>
                )}

                <div>
                  <label className="block text-[12px] font-semibold text-charcoal mb-1.5">Email</label>
                  <div className="relative">
                    <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-stone/50" />
                    <input {...register('email')} type="email" placeholder="you@example.com"
                      className="w-full pl-10 pr-4 py-3 bg-white border border-sand rounded-xl text-[14px] text-charcoal placeholder-stone/40 transition" />
                  </div>
                  {errors.email && <p className="mt-1 text-[12px] text-coral">{String(errors.email.message)}</p>}
                </div>

                <div>
                  <label className="block text-[12px] font-semibold text-charcoal mb-1.5">Password</label>
                  <div className="relative">
                    <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-stone/50" />
                    <input {...register('password')} type="password" placeholder="Min 6 characters"
                      className="w-full pl-10 pr-4 py-3 bg-white border border-sand rounded-xl text-[14px] text-charcoal placeholder-stone/40 transition" />
                  </div>
                  {errors.password && <p className="mt-1 text-[12px] text-coral">{String(errors.password.message)}</p>}
                </div>

                {error && (
                  <div className="bg-coral/8 border border-coral/20 rounded-xl p-3 text-coral text-[13px] font-medium">{error}</div>
                )}

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3.5 bg-coral text-white text-[14px] font-bold rounded-xl shadow-warm hover:bg-terracotta disabled:opacity-50 transition-all active:scale-[0.98] flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      <span>Please wait...</span>
                    </div>
                  ) : (
                    <>
                      {isLogin ? 'Sign In' : 'Create Account'}
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </motion.form>
            </AnimatePresence>

            <p className="text-center text-[13px] text-stone mt-6">
              {isLogin ? "Don't have an account? " : 'Already have an account? '}
              <button onClick={toggleMode} className="font-semibold text-coral hover:text-terracotta transition">
                {isLogin ? 'Sign up' : 'Sign in'}
              </button>
            </p>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default Auth;
