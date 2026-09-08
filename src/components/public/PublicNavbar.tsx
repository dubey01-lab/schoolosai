import React, { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { GraduationCap, Menu, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export function PublicNavbar() {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();

  const navLinks = [
    { name: "Home", path: "/" },
    { name: "Features", path: "/features" },
    { name: "Solutions", path: "/solutions" },
    { name: "How It Works", path: "/how-it-works" },
    { name: "About", path: "/about" },
    { name: "Pricing", path: "/pricing" },
    { name: "Contact", path: "/contact" },
  ];

  const isActive = (path: string) => location.pathname === path;

  return (
    <nav className="fixed top-0 left-0 right-0 h-16 bg-white/80 backdrop-blur-md border-b border-slate-200 z-50 flex items-center justify-between px-6 lg:px-12">
      <Link to="/" className="flex items-center gap-2">
        <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center">
          <GraduationCap className="w-5 h-5 text-white" />
        </div>
        <span className="font-bold text-xl tracking-tight text-slate-900">SchoolOS<span className="text-indigo-600">AI</span></span>
      </Link>
      
      {/* Desktop Nav */}
      <div className="hidden lg:flex items-center gap-6 text-sm font-medium text-slate-600">
        {navLinks.map((link) => (
          <Link 
            key={link.name} 
            to={link.path} 
            className={`transition-colors ${isActive(link.path) ? "text-indigo-600" : "hover:text-indigo-600"}`}
          >
            {link.name}
          </Link>
        ))}
      </div>
      
      <div className="hidden lg:flex items-center gap-4">
        <Link to="/login" className="text-sm font-medium text-slate-600 hover:text-indigo-600 transition-colors">Login</Link>
        <Link to="/book-demo" className="bg-indigo-600 text-white text-sm font-medium px-4 py-2 rounded-full hover:bg-indigo-700 transition-colors hover:shadow-md active:scale-95">
          Book a Demo
        </Link>
      </div>

      {/* Mobile Menu Toggle */}
      <button className="lg:hidden p-2 text-slate-600" onClick={() => setIsOpen(!isOpen)}>
        {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
      </button>

      {/* Mobile Nav */}
      <AnimatePresence>
        {isOpen && (
          <motion.div 
            initial={{ opacity: 0, y: -10 }} 
            animate={{ opacity: 1, y: 0 }} 
            exit={{ opacity: 0, y: -10 }}
            className="absolute top-16 left-0 right-0 bg-white border-b border-slate-200 shadow-lg lg:hidden flex flex-col p-4"
          >
            {navLinks.map((link) => (
              <Link 
                key={link.name} 
                to={link.path} 
                onClick={() => setIsOpen(false)}
                className={`p-3 text-sm font-medium rounded-lg ${isActive(link.path) ? "bg-indigo-50 text-indigo-600" : "text-slate-600 hover:bg-slate-50"}`}
              >
                {link.name}
              </Link>
            ))}
            <div className="border-t border-slate-100 my-2 pt-2 flex flex-col gap-2">
              <Link to="/login" onClick={() => setIsOpen(false)} className="p-3 text-sm font-medium text-slate-600 hover:bg-slate-50 rounded-lg text-center border border-slate-200">
                Login
              </Link>
              <Link to="/book-demo" onClick={() => setIsOpen(false)} className="p-3 text-sm font-medium text-white bg-indigo-600 rounded-lg text-center">
                Book a Demo
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}
