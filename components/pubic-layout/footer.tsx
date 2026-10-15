import Link from 'next/link';
import { Code, Code2, GalleryVerticalEnd } from 'lucide-react';

export default function Footer() {
  return (
    <footer className=" text-white mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Logo and Description */}
          <div className="col-span-1 md:col-span-2">
            <Link href="/" className="flex items-center gap-2 group mb-4">
              <div className="flex h-8 w-8 items-center justify-center rounded bg-primary text-primary-foreground group-hover:scale-110 transition-transform duration-300 animate-pulse-glow">
                <GalleryVerticalEnd className="h-5 w-5 group-hover:rotate-12 transition-transform duration-300" />
              </div>
              <span className="text-black dark:text-white font-bold text-xl">HabitKit</span>
            </Link>
            <p className="text-gray-400 mb-4 max-w-md">
              HabitKit is a modern habit tracking web application that helps users build and maintain positive habits through streak tracking, progress visualization, and a clean productivity-focused interface.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Platform</h3>
            <ul className="space-y-2 text-gray-400">
              <li><Link href="/dashboard" className="hover:text-white transition-colors">Dashboard</Link></li>
              <li><Link href="/calender" className="hover:text-white transition-colors">Calender</Link></li>
              <li><Link href="/community" className="hover:text-white transition-colors">Community</Link></li>
              <li><Link href="/reminder" className="hover:text-white transition-colors">Reminders</Link></li>
            </ul>
          </div>

          {/* Support */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Support</h3>
            <ul className="space-y-2 text-gray-400">
              <li><Link href="/community" className="hover:text-white transition-colors">Community</Link></li>
              <li><Link href="/contact" className="hover:text-white transition-colors">Contact</Link></li>
              <li><Link href="/privacy" className="hover:text-white transition-colors">Privacy Policy</Link></li>
              <li><Link href="/terms" className="hover:text-white transition-colors">Terms of Service</Link></li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-800 pt-8 mt-8">
          <div className="flex flex-col sm:flex-row justify-between items-center">
            <p className="text-gray-400 text-sm">
              © 2026 SajalDBansal. Made for better web understanding.
            </p>
            <div className="flex space-x-6 mt-4 sm:mt-0">
              <a href="https://x.com/SAJALDUTTBANSAL" className="text-gray-400 hover:text-white transition-colors">
                Twitter
              </a>
              <a href="https://github.com/SajalDBansal" className="text-gray-400 hover:text-white transition-colors">
                GitHub
              </a>
              <a href="https://www.linkedin.com/in/sajalduttbansal/" className="text-gray-400 hover:text-white transition-colors">
                LinkedIn
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>


  );
}