'use client'
import { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation'
import Link from 'next/link';
import AuthLayout from '@/components/AuthLayout';

export default function Signup() {
  const router = useRouter();
  const {setUser}=useAuth();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    referralCode: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [acceptTerms, setAcceptTerms] = useState(false);
   const [googleReferral, setGoogleReferral] = useState('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value,isAccecptedTerm:true }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    if (!acceptTerms) {
      setError('You must accept the terms and privacy policy');
      setLoading(false);
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setError("Passwords don't match");
      setLoading(false);
      return;
    }

    try {
      const response = await fetch('/api/auth/sign-up', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      const data = await response.json();

      if (!response.ok) throw new Error(data.error || 'Signup failed');
      setUser(data.user);
      router.push('/')
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  
    const handleGoogleSignIn = () => {
    const url = googleReferral
      ? `/api/auth/google?referralCode=${encodeURIComponent(googleReferral)}`
      : '/api/auth/google';
    window.location.href = url;
  };
  return (
    <AuthLayout
      title="Create your account"
      subtitle="Start your English learning journey today"
      imageSrc="/lang.png"
      imageAlt="Language learning illustration"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="p-3 bg-red-100 text-red-700 rounded-md text-sm">
            {error}
          </div>
        )}

        <div>
          <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
            Full name
          </label>
          <input
            type="text"
            id="name"
            name="name"
            required
            value={formData.name}
            onChange={handleChange}
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
          />
        </div>

        <div>
          <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
            Email
          </label>
          <input
            type="email"
            id="email"
            name="email"
            required
            value={formData.email}
            onChange={handleChange}
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
          />
        </div>

        <div>
          <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
            Password
          </label>
          <input
            type="password"
            id="password"
            name="password"
            required
            minLength={6}
            value={formData.password}
            onChange={handleChange}
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
          />
        </div>

        <div>
          <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-1">
            Confirm password
          </label>
          <input
            type="password"
            id="confirmPassword"
            name="confirmPassword"
            required
            minLength={6}
            value={formData.confirmPassword}
            onChange={handleChange}
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
          />
        </div>

        <div>
          <label htmlFor="referralCode" className="block text-sm font-medium text-gray-700 mb-1">
            Referral code (optional)
          </label>
          <input
            type="text"
            id="referralCode"
            name="referralCode"
            value={formData.referralCode}
            onChange={handleChange}
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
          />
        </div>

        

        <div className="flex items-start">
          <div className="flex items-center h-5">
            <input
              id="terms"
              type="checkbox"
              checked={acceptTerms}
              onChange={(e) => setAcceptTerms(e.target.checked)}
              className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
              required
            />
          </div>
          <div className="ml-3 text-sm">
            <label htmlFor="terms" className="text-gray-700">
              By signing up, you agree to our{' '}
              <Link href="/terms" className="text-indigo-600 hover:text-indigo-500">
                Terms of Use
              </Link>{' '}
              and{' '}
              <Link href="/privacy" className="text-indigo-600 hover:text-indigo-500">
                Privacy Policy
              </Link>.
            </label>
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
        >
          {loading ? 'Creating account...' : 'Continue with email'}
        </button>
      </form>

      <div className="mt-6">
        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-300"></div>
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-2 bg-white text-gray-500">Other sign up options</span>
          </div>
        </div>

         <div className="mt-4 w-full flex flex-col items-center gap-2">
          <input
            type="text"
            placeholder="Referral code (optional)"
            value={googleReferral}
            onChange={e => setGoogleReferral(e.target.value)}
            className="w-full max-w-xs px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 text-center"
          />
          <button
            type="button"
            onClick={handleGoogleSignIn}
            className="w-fit flex items-center justify-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 cursor-pointer"
          >
            <img
              src="https://developers.google.com/identity/images/g-logo.png"
              alt="Google"
              width={20}
              height={20}
            />
            Sign up with Google
          </button>
        </div>
      </div>

      <div className="mt-6 text-center text-sm">
        <p className="text-gray-600">
          Already have an account?{' '}
          <Link href="/login" className="font-medium text-indigo-600 hover:text-indigo-500">
            Log in
          </Link>
        </p>
      </div>
    </AuthLayout>
  );
}