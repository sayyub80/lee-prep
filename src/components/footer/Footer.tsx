// src/components/footer/Footer.tsx
import { Facebook, Twitter, Instagram, Globe, ArrowRight } from "lucide-react";
import Link from "next/link";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export default function Footer() {
  return (
    <footer className="px-25 bg-gray-900 text-gray-300">
      <div className="container pt-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-12">
          
          {/* Column 1: Branding & Socials */}
          <div className="lg:col-span-3">
            <Link href="/" className="flex items-center space-x-2 mb-4">
              
              <span className="font-bold text-2xl text-white">Lee Prep</span>
            </Link>
            <p className="text-gray-400 max-w-xs">
              Master languages with AI-powered conversations and a global community.
            </p>
            <div className="flex gap-6 mt-6">
              <Link href="#" aria-label="Facebook"><Facebook className="text-gray-400 hover:text-white transition-colors" /></Link>
              <Link href="#" aria-label="Twitter"><Twitter className="text-gray-400 hover:text-white transition-colors" /></Link>
              <Link href="#" aria-label="Instagram"><Instagram className="text-gray-400 hover:text-white transition-colors" /></Link>
            </div>
          </div>

          {/* Column 2: Product Links */}
          <div>
            <h4 className="font-semibold text-white mb-4">Product</h4>
            <ul className="space-y-3">
              <li><Link href="#" className="text-gray-400 hover:text-white transition-colors">Features</Link></li>
              <li><Link href="/subscription" className="text-gray-400 hover:text-white transition-colors">Pricing</Link></li>
              <li><Link href="/practice" className="text-gray-400 hover:text-white transition-colors">Practice</Link></li>
            </ul>
          </div>

          {/* Column 3: Company Links */}
          <div>
            <h4 className="font-semibold text-white mb-4">Company</h4>
            <ul className="space-y-3">
              <li><Link href="#" className="text-gray-400 hover:text-white transition-colors">About Us</Link></li>
              <li><Link href="#" className="text-gray-400 hover:text-white transition-colors">Careers</Link></li>
              <li><Link href="#" className="text-gray-400 hover:text-white transition-colors">Contact</Link></li>
            </ul>
          </div>

        

        </div>
      </div>
      
      <div className="pr-20 mt-4 py-6 border-t border-gray-800 flex flex-col sm:flex-row gap-2 justify-center items-center text-center sm:text-left">
        <p className="text-sm text-gray-500">
          © {new Date().getFullYear()} Lee Prep. All rights reserved.
        </p>
        <div className="flex gap-4 text-sm text-gray-500 mt-4 sm:mt-0">
            <Link href="#" className="hover:text-white transition-colors">Privacy Policy</Link>
            <Link href="#" className="hover:text-white transition-colors">Terms of Service</Link>
        </div>
      </div>
    </footer>
  );
}