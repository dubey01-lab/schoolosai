import React from 'react';
import { Link as RouterLink } from 'react-router-dom';
import { PublicNavbar } from '../../components/public/PublicNavbar';
import { PublicFooter } from '../../components/public/PublicFooter';
import { SEO } from '../../components/SEO';
import { AlertCircle } from 'lucide-react';

export default function NotFoundPage() {
  return (
    <div className="min-h-screen bg-white flex flex-col">
      <SEO 
        title="Page Not Found | SchoolOS AI"
        description="The page you are looking for could not be found."
        noindex={true}
      />
      <PublicNavbar />
      
      <main className="flex-grow flex items-center justify-center pt-24 pb-16 px-4">
        <div className="max-w-xl w-full text-center">
          <div className="w-20 h-20 bg-rose-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <AlertCircle className="w-10 h-10 text-rose-600" />
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-slate-900 mb-4">Page Not Found</h1>
          <p className="text-lg text-slate-600 mb-8">
            The page you are looking for doesn't exist or has been moved.
          </p>
          
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-left max-w-lg mx-auto mb-10">
            <RouterLink to="/" className="p-4 rounded-xl border border-slate-200 hover:border-indigo-600 hover:shadow-md transition-all text-slate-700 hover:text-indigo-600 font-medium text-center">
              Home
            </RouterLink>
            <RouterLink to="/features" className="p-4 rounded-xl border border-slate-200 hover:border-indigo-600 hover:shadow-md transition-all text-slate-700 hover:text-indigo-600 font-medium text-center">
              Features
            </RouterLink>
            <RouterLink to="/solutions" className="p-4 rounded-xl border border-slate-200 hover:border-indigo-600 hover:shadow-md transition-all text-slate-700 hover:text-indigo-600 font-medium text-center">
              Solutions
            </RouterLink>
            <RouterLink to="/pricing" className="p-4 rounded-xl border border-slate-200 hover:border-indigo-600 hover:shadow-md transition-all text-slate-700 hover:text-indigo-600 font-medium text-center">
              Pricing
            </RouterLink>
            <RouterLink to="/contact" className="p-4 rounded-xl border border-slate-200 hover:border-indigo-600 hover:shadow-md transition-all text-slate-700 hover:text-indigo-600 font-medium text-center">
              Contact
            </RouterLink>
            <RouterLink to="/book-demo" className="p-4 rounded-xl bg-indigo-50 border border-indigo-100 hover:bg-indigo-600 hover:text-white transition-all text-indigo-700 font-medium text-center">
              Book a Demo
            </RouterLink>
          </div>
        </div>
      </main>

      <PublicFooter />
    </div>
  );
}
