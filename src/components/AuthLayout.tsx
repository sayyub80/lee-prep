import React from 'react';
import Image from 'next/image';
import Head from 'next/head';

interface AuthLayoutProps {
  children: React.ReactNode;
  title: string;
  subtitle: string;
  imageSrc: string;
  imageAlt: string;
}

const AuthLayout: React.FC<AuthLayoutProps> = ({ 
  children, 
  title, 
  subtitle, 
  imageSrc, 
  imageAlt 
}) => {
  return (
    <>
      <Head>
        <title>{title} | English Learning App</title>
      </Head>
      <div className="min-h-screen flex flex-col md:flex-row bg-white">
        {/* Image Section */}
        <div className="md:w-1/2 bg-indigo-50 flex items-center justify-center p-12">
          <div className="max-w-md">
            <Image
              src={imageSrc}
              alt={imageAlt}
              width={600}
              height={600}
              className="object-contain"
              priority
            />
          </div>
        </div>

        {/* Form Section */}
        <div className="md:w-1/2  flex   items-center justify-center p-8">
          <div className="w-full max-w-md space-y-5">
            <div className="text-center">
              <h1 className="text-3xl font-bold text-gray-900">{title}</h1>
              <p className="mt-2 text-gray-600">{subtitle}</p>
            </div>
            {children}
          </div>
        </div>
      </div>
    </>
  );
};

export default AuthLayout;