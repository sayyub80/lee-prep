// src/components/Footer.tsx
import { Facebook, Twitter, Instagram } from "lucide-react";
import Link from "next/link";

export default function Footer() {
  return (
    <footer className="px-25 border-t pt-10 pb-3 bg-gray-50">
      <div className="container grid md:grid-cols-4 gap-8">
        <div>
          <h3 className="text-xl font-bold text-indigo-600 mb-4">Lee Prep</h3>
          <p className="text-gray-600">
            Master languages with AI-powered conversations.
          </p>
        </div>
        <div>
          <h4 className="font-semibold mb-4">Product</h4>
          <ul className="space-y-2">
            <li><Link href="#" className="text-gray-600 hover:text-indigo-600">Features</Link></li>
            <li><Link href="#pricing" className="text-gray-600 hover:text-indigo-600">Pricing</Link></li>
          </ul>
        </div>
        <div>
          <h4 className="font-semibold mb-4">Company</h4>
          <ul className="space-y-2">
            <li><Link href="#" className="text-gray-600 hover:text-indigo-600">About</Link></li>
            <li><Link href="#" className="text-gray-600 hover:text-indigo-600">Careers</Link></li>
          </ul>
        </div>
        <div>
          <h4 className="font-semibold mb-4">Follow Us</h4>
          <div className="flex gap-4">
            <Link href="#"><Facebook className="text-gray-600 hover:text-indigo-600" /></Link>
            <Link href="#"><Twitter className="text-gray-600 hover:text-indigo-600" /></Link>
            <Link href="#"><Instagram className="text-gray-600 hover:text-indigo-600" /></Link>
          </div>
        </div>
      </div>
      <div className="container mt-12 pt-8 border-t text-center text-gray-500">
        © 2025 Lee Prep. All rights reserved.
      </div>
    </footer>
  );
}