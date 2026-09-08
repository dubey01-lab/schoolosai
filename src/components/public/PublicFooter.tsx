import React from "react";
import { Link } from "react-router-dom";
import { GraduationCap } from "lucide-react";

export function PublicFooter() {
  return (
    <footer className="bg-slate-900 py-16 px-6 lg:px-12 border-t border-slate-800 text-slate-400">
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-12">
        <div className="col-span-1 md:col-span-1">
          <Link to="/" className="flex items-center gap-2 mb-4">
            <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center">
              <GraduationCap className="w-5 h-5 text-white" />
            </div>
            <span className="font-bold text-xl tracking-tight text-white">SchoolOS<span className="text-indigo-500">AI</span></span>
          </Link>
          <p className="text-sm leading-relaxed mb-6">
            The intelligent operating system for modern schools. Unifying administration, teaching, and parent engagement in one beautiful platform.
          </p>
        </div>
        
        <div>
          <h4 className="text-white font-semibold mb-4">Product</h4>
          <ul className="space-y-3 text-sm">
            <li><Link to="/features" className="hover:text-white transition-colors">Features</Link></li>
            <li><Link to="/solutions" className="hover:text-white transition-colors">Solutions</Link></li>
            <li><Link to="/pricing" className="hover:text-white transition-colors">Pricing</Link></li>
            <li><Link to="/how-it-works" className="hover:text-white transition-colors">How it Works</Link></li>
          </ul>
        </div>
        
        <div>
          <h4 className="text-white font-semibold mb-4">Company</h4>
          <ul className="space-y-3 text-sm">
            <li><Link to="/about" className="hover:text-white transition-colors">About Us</Link></li>
            <li><Link to="/contact" className="hover:text-white transition-colors">Contact</Link></li>
            <li><Link to="/book-demo" className="hover:text-white transition-colors">Book a Demo</Link></li>
          </ul>
        </div>

        <div>
          <h4 className="text-white font-semibold mb-4">Legal</h4>
          <ul className="space-y-3 text-sm">
            <li><a href="#" className="hover:text-white transition-colors">Privacy Policy</a></li>
            <li><a href="#" className="hover:text-white transition-colors">Terms of Service</a></li>
            <li><Link to="/superadmin/login" className="hover:text-white transition-colors">System Admin</Link></li>
          </ul>
        </div>
      </div>
      <div className="max-w-7xl mx-auto mt-16 pt-8 border-t border-slate-800 text-sm text-center">
        © {new Date().getFullYear()} SchoolOS AI. All rights reserved.
      </div>
    </footer>
  );
}
