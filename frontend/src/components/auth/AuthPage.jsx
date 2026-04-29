import { useState } from 'react';
import { useAuthStore } from '../../stores/authStore';
import { Button } from '../ui/Button';
import { Input, Select } from '../ui/FormFields';
import { AlertTriangle, Shield, Users, Zap } from 'lucide-react';

export const AuthPage = () => {
  const [mode, setMode] = useState('login');
  const [form, setForm] = useState({ email: '', password: '', fullName: '', role: 'rescue_team' });
  const [localError, setLocalError] = useState('');
  const { signIn, signUp, loading, error, clearError } = useAuthStore();

  const set = (k) => (e) => {
    setForm((f) => ({ ...f, [k]: e.target.value }));
    setLocalError('');
    clearError();
  };

  const handleSubmit = async () => {
    if (!form.email || !form.password) { setLocalError('Email and password are required'); return; }
    if (mode === 'register') {
      if (!form.fullName) { setLocalError('Full name is required'); return; }
      const { error } = await signUp(form.email, form.password, form.fullName, form.role);
      if (!error) setMode('verify');
    } else {
      await signIn(form.email, form.password);
    }
  };

  if (mode === 'verify') {
    return (
      <div className="min-h-screen bg-[#060910] flex items-center justify-center p-4">
        <div className="max-w-md w-full text-center space-y-4">
          <div className="w-16 h-16 mx-auto rounded-full bg-green-500/10 border border-green-500/30 flex items-center justify-center">
            <Zap size={28} className="text-green-400" />
          </div>
          <h2 className="text-2xl font-bold text-gray-100">Check your email</h2>
          <p className="text-gray-400 text-sm">We sent a verification link to <strong className="text-gray-200">{form.email}</strong>. Click it to activate your account.</p>
          <button onClick={() => setMode('login')} className="text-blue-400 text-sm hover:underline">Back to login</button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#060910] flex">
      {/* Left panel */}
      <div className="hidden lg:flex flex-col justify-between w-1/2 p-12 border-r border-[#21262d] relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-red-950/20 via-transparent to-blue-950/20 pointer-events-none" />
        <div className="relative">
          <div className="flex items-center gap-3 mb-16">
            <div className="w-10 h-10 rounded-lg bg-red-500/20 border border-red-500/30 flex items-center justify-center">
              <AlertTriangle size={20} className="text-red-400" />
            </div>
            <span className="text-xl font-black text-gray-100" style={{ fontFamily: 'Syne, sans-serif' }}>ResQNet</span>
          </div>
          <h1 className="text-5xl font-black text-gray-100 leading-tight mb-6" style={{ fontFamily: 'Syne, sans-serif' }}>
            Coordinate.<br />
            <span className="text-red-400">Respond.</span><br />
            Save Lives.
          </h1>
          <p className="text-gray-400 text-lg leading-relaxed max-w-sm">
            Real-time disaster management platform connecting rescue teams, NGOs, and government agencies.
          </p>
        </div>
        <div className="relative grid grid-cols-3 gap-4">
          {[
            { icon: Shield, label: 'Secure RBAC', desc: 'Role-based access' },
            { icon: Zap, label: 'Real-time', desc: 'Live updates' },
            { icon: Users, label: 'Multi-team', desc: 'Coordinated ops' },
          ].map(({ icon: Icon, label, desc }) => (
            <div key={label} className="p-4 rounded-xl bg-white/[0.03] border border-white/[0.06]">
              <Icon size={20} className="text-blue-400 mb-2" />
              <p className="text-sm font-semibold text-gray-200">{label}</p>
              <p className="text-xs text-gray-500">{desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Right panel */}
      <div className="flex-1 flex items-center justify-center p-6">
        <div className="w-full max-w-sm space-y-6">
          <div className="lg:hidden flex items-center gap-2 mb-4">
            <AlertTriangle size={20} className="text-red-400" />
            <span className="text-lg font-black" style={{ fontFamily: 'Syne, sans-serif' }}>ResQNet</span>
          </div>

          <div>
            <h2 className="text-2xl font-bold text-gray-100 mb-1" style={{ fontFamily: 'Syne, sans-serif' }}>
              {mode === 'login' ? 'Sign in' : 'Create account'}
            </h2>
            <p className="text-gray-500 text-sm">
              {mode === 'login' ? 'Access your coordination dashboard' : 'Join the ResQNet platform'}
            </p>
          </div>

          {(error || localError) && (
            <div className="flex items-center gap-2 p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
              <AlertTriangle size={14} />
              {error || localError}
            </div>
          )}

          <div className="space-y-3">
            {mode === 'register' && (
              <Input label="Full Name" placeholder="Jane Smith" value={form.fullName} onChange={set('fullName')} />
            )}
            <Input label="Email" type="email" placeholder="you@example.com" value={form.email} onChange={set('email')} />
            <Input label="Password" type="password" placeholder="••••••••" value={form.password} onChange={set('password')} />
            {mode === 'register' && (
              <Select label="Role" value={form.role} onChange={set('role')}>
                <option value="rescue_team">Rescue Team</option>
                <option value="ngo">NGO</option>
                <option value="government">Government</option>
                <option value="admin">Admin</option>
              </Select>
            )}
          </div>

          <Button
            variant="primary"
            className="w-full justify-center"
            onClick={handleSubmit}
            loading={loading}
          >
            {mode === 'login' ? 'Sign in' : 'Create account'}
          </Button>

          <p className="text-center text-sm text-gray-500">
            {mode === 'login' ? "Don't have an account? " : "Already have an account? "}
            <button
              onClick={() => { setMode(mode === 'login' ? 'register' : 'login'); clearError(); setLocalError(''); }}
              className="text-blue-400 hover:underline"
            >
              {mode === 'login' ? 'Sign up' : 'Sign in'}
            </button>
          </p>

          <div className="pt-4 border-t border-[#21262d]">
            <p className="text-xs text-gray-600 text-center mb-3">Demo accounts</p>
            <div className="grid grid-cols-2 gap-2">
              {[
                { label: 'Admin', email: 'admin@resqnet.dev', pass: 'demo1234' },
                { label: 'Rescue', email: 'team@resqnet.dev', pass: 'demo1234' },
              ].map(({ label, email, pass }) => (
                <button
                  key={label}
                  onClick={() => { setForm((f) => ({ ...f, email, password: pass })); setMode('login'); }}
                  className="text-xs py-1.5 px-3 rounded border border-[#21262d] text-gray-500 hover:text-gray-300 hover:border-gray-500 transition-colors"
                >
                  {label} Demo
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
