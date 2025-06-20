'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import Link from 'next/link';
import AuthLayout from '@/components/AuthLayout';

export default function LoginPage() {
  const router = useRouter();
  const { user, loading, login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  // Redirect if already logged in
  if (user) {
    router.push('/dashboard');
    return null;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    try {
      await login(email, password);
      router.push('/');
    } catch (err: any) {
      setError(err.message || 'Login failed. Please try again.');
    }
  };
 const handleGoogleSignIn = () => {
    window.location.href = '/api/auth/google';
  };
  return (
    <AuthLayout
      title="Welcome back"
      subtitle="Continue your English learning journey"
      imageSrc="/loginP.png"
      imageAlt="Language learning illustration"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="p-3 bg-red-100 text-red-700 rounded-md text-sm">
            {error}
          </div>
        )}

        <div>
          <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
            Email
          </label>
          <input
            type="email"
            id="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>

        <div>
          <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
            Password
          </label>
          <input
            type="password"
            id="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-indigo-600 text-white py-2 px-4 rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-50"
        >
          {loading ? 'Logging in...' : 'Login'}
        </button>
      </form>

      <div className="mt-4 text-center text-sm">
        <Link href="/forgot-password" className="text-indigo-600 hover:text-indigo-500">
          Forgot password?
        </Link>
      </div>

      <div className="mt-6 text-center text-sm">
        <p className="text-gray-600">
          Don't have an account?{' '}
          <Link href="/sign-up" className="font-medium text-indigo-600 hover:text-indigo-500">
            Sign up
          </Link>
        </p>
         <div style={{ marginTop: '2rem' }}>
        <button
          type="button"
          onClick={handleGoogleSignIn}
          className="w-full bg-white border border-gray-300 text-gray-700 py-2 px-4 rounded-md flex items-center justify-center gap-2 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transition-colors"
        >
          <img
            src="https://developers.google.com/identity/images/g-logo.png"
            alt="Google"
            width={20}
            height={20}
          />
          Sign in with Google
        </button>
      </div>
      </div>
    </AuthLayout>
  );
}