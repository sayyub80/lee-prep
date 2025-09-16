// src/components/footer/Footer.tsx
import { Facebook, Twitter, Instagram, Globe, ArrowRight } from "lucide-react";
import Link from "next/link";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export default function Footer() {
  return (
    <footer className="px-10 bg-gray-900 text-gray-300">
      <div className="container py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-12">
          
          {/* Column 1: Branding & Socials */}
          <div className="lg:col-span-2">
            <Link href="/" className="flex items-center space-x-2 mb-4">
              <Globe className="h-7 w-7 text-primary" />
              <span className="font-bold text-2xl text-white">Lee Prep</span>
            </Link>
            <p className="text-gray-400 max-w-xs">
              Master languages with AI-powered conversations and a global community.
            </p>
            <div className="flex gap-4 mt-6">
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

          {/* Column 4: Newsletter */}
          <div className="lg:col-span-1">
             <h4 className="font-semibold text-white mb-4">Stay Updated</h4>
             <p className="text-gray-400 mb-4 text-sm">Join our newsletter for weekly tips and updates.</p>
             <form className="flex gap-2">
                <Input type="email" placeholder="Enter your email" className="bg-gray-800 border-gray-700 text-white focus:ring-primary" />
                <Button type="submit" size="icon" aria-label="Subscribe">
                    <ArrowRight className="h-4 w-4" />
                </Button>
             </form>
          </div>

        </div>
      </div>
      
      <div className="container mt-4 py-6 border-t border-gray-800 flex flex-col sm:flex-row justify-between items-center text-center sm:text-left">
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