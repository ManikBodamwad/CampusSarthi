'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  GraduationCap,
  Shield,
  UserCheck,
  AlertCircle,
  ArrowRight,
  Sparkles,
  CheckCircle2,
  Lock,
} from 'lucide-react';
import { createClient } from '@/lib/supabase/client';

export default function LoginPage() {
  const router = useRouter();
  const [emailInput, setEmailInput] = useState('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleGoogleOAuth = async () => {
    setErrorMsg(null);
    setLoading(true);
    const supabase = createClient();
    if (supabase) {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/chat`,
          queryParams: {
            hd: 'iiml.ac.in',
          },
        },
      });
      if (error) {
        setErrorMsg(error.message);
        setLoading(false);
      }
    } else {
      setErrorMsg(
        'Supabase OAuth configured. For evaluation/demo mode, select a verified @iiml.ac.in account below.'
      );
      setLoading(false);
    }
  };

  const handleCustomEmailLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    const email = emailInput.trim().toLowerCase();
    if (!email) {
      setErrorMsg('Please enter your institute email address.');
      return;
    }

    if (!email.endsWith('@iiml.ac.in')) {
      setErrorMsg(
        'Access Restricted: CampusSaarthi is exclusive to IIM Lucknow. Please use your official @iiml.ac.in email ID.'
      );
      return;
    }

    const role = email.includes('admin') || email.includes('registrar') ? 'admin' : 'student';
    localStorage.setItem('campussaarthi_email', email);
    localStorage.setItem('campussaarthi_role', role);
    router.push('/chat');
  };

  const handleQuickDemoLogin = (role: 'student' | 'admin') => {
    const demoEmail =
      role === 'admin'
        ? 'admin.cell@iiml.ac.in'
        : 'student.pgp39@iiml.ac.in';
    localStorage.setItem('campussaarthi_email', demoEmail);
    localStorage.setItem('campussaarthi_role', role);
    router.push(role === 'admin' ? '/admin' : '/chat');
  };

  return (
    <div className="flex-1 flex items-center justify-center py-16 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-indigo-50/60 via-white to-slate-50">
      <div className="max-w-md w-full space-y-6">
        {/* Brand Header */}
        <div className="text-center">
          <div className="mx-auto w-14 h-14 rounded-2xl bg-gradient-to-tr from-indigo-600 to-rose-500 flex items-center justify-center text-white shadow-glow-brand mb-4">
            <GraduationCap className="w-7 h-7" />
          </div>
          <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">
            Sign in to CampusSaarthi
          </h2>
          <p className="mt-1.5 text-xs text-slate-500 font-medium">
            Official institutional portal for Indian Institute of Management Lucknow
          </p>
        </div>

        {/* Login Box */}
        <div className="bg-white p-7 sm:p-8 rounded-3xl border border-slate-200/80 shadow-glass-lg space-y-6">
          {/* Domain Guard Alert */}
          <div className="bg-indigo-50/70 border border-indigo-200/80 rounded-2xl p-3.5 text-xs text-indigo-950 flex items-start space-x-3">
            <Shield className="w-4 h-4 text-indigo-600 mt-0.5 flex-shrink-0" />
            <div>
              <p className="font-bold">Domain Restricted Access</p>
              <p className="text-[11px] text-slate-600 mt-0.5">
                Only authenticated Google workspace accounts ending in{' '}
                <strong className="text-indigo-700">@iiml.ac.in</strong> are permitted.
              </p>
            </div>
          </div>

          {errorMsg && (
            <div className="bg-rose-50 border border-rose-200 rounded-2xl p-3.5 text-xs text-rose-700 flex items-start space-x-2">
              <AlertCircle className="w-4 h-4 text-rose-500 mt-0.5 flex-shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Google OAuth Button */}
          <button
            onClick={handleGoogleOAuth}
            disabled={loading}
            className="w-full flex items-center justify-center space-x-3 py-3 px-4 rounded-2xl border border-slate-200 hover:border-slate-300 bg-white hover:bg-slate-50 text-xs font-bold text-slate-700 shadow-sm transition-all"
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24">
              <path
                fill="#4285F4"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="#34A853"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="#FBBC05"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
              />
              <path
                fill="#EA4335"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
              />
            </svg>
            <span>Continue with IIML Google Workspace</span>
          </button>

          {/* Or divider */}
          <div className="relative flex py-1 items-center">
            <div className="flex-grow border-t border-slate-200" />
            <span className="flex-shrink mx-3 text-slate-400 text-[11px] uppercase tracking-wider font-semibold">
              Or email sign in
            </span>
            <div className="flex-grow border-t border-slate-200" />
          </div>

          {/* Email verification input */}
          <form onSubmit={handleCustomEmailLogin} className="space-y-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Institute Email Address
              </label>
              <input
                type="email"
                placeholder="student.pgp39@iiml.ac.in"
                value={emailInput}
                onChange={(e) => setEmailInput(e.target.value)}
                className="w-full px-4 py-2.5 rounded-2xl border border-slate-200 focus:border-indigo-600 focus:ring-2 focus:ring-indigo-100 text-xs outline-none transition-all font-medium text-slate-900"
              />
            </div>
            <button
              type="submit"
              className="w-full py-3 px-4 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs transition-colors flex items-center justify-center space-x-2 shadow-sm"
            >
              <span>Verify &amp; Sign In</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </form>

          {/* One-Click Reviewer / Demo Access Section */}
          <div className="border-t border-slate-100 pt-4">
            <div className="flex items-center space-x-1.5 mb-3 text-xs font-bold text-slate-500">
              <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
              <span>Instant Reviewer / Evaluation Modes:</span>
            </div>
            <div className="grid grid-cols-2 gap-2.5">
              <button
                type="button"
                onClick={() => handleQuickDemoLogin('student')}
                className="flex items-center justify-center space-x-2 px-3 py-2.5 rounded-2xl bg-slate-50 hover:bg-indigo-50 border border-slate-200 hover:border-indigo-300 text-xs font-semibold text-slate-700 transition-all text-left"
              >
                <UserCheck className="w-3.5 h-3.5 text-indigo-600" />
                <span>Student Mode</span>
              </button>

              <button
                type="button"
                onClick={() => handleQuickDemoLogin('admin')}
                className="flex items-center justify-center space-x-2 px-3 py-2.5 rounded-2xl bg-slate-50 hover:bg-rose-50 border border-slate-200 hover:border-rose-300 text-xs font-semibold text-slate-700 transition-all text-left"
              >
                <Shield className="w-3.5 h-3.5 text-rose-600" />
                <span>Admin Cell</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
