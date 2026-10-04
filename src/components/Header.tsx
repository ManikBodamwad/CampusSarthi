'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Compass, MessageSquare, ShieldCheck, Sparkles } from 'lucide-react';

export default function Header() {
  const pathname = usePathname();
  const [currentRole, setCurrentRole] = useState<string>('fresher');

  useEffect(() => {
    const saved = localStorage.getItem('campussaarthi_role');
    if (saved) {
      setCurrentRole(saved);
    }
  }, []);

  const handleRoleChange = (newRole: string) => {
    setCurrentRole(newRole);
    localStorage.setItem('campussaarthi_role', newRole);
  };

  // If on the home page, the landing hero renders its own top floating nav
  if (pathname === '/') {
    return null;
  }

  const navLinks = [
    { href: '/chat', label: 'Chat', icon: MessageSquare },
    { href: '/navigator', label: 'Map', icon: Compass },
    { href: '/admin', label: 'Admin', icon: ShieldCheck },
  ];

  return (
    <header className="sticky top-0 z-50 pt-3 pb-2 px-4 sm:px-6 bg-[#0B0E14]/85 backdrop-blur-md border-b border-[rgba(255,255,255,0.06)]">
      <div className="max-w-[1200px] mx-auto flex items-center justify-between">
        {/* Brand Logo & IIM Lucknow Wordmark */}
        <Link href="/" className="flex items-center space-x-2.5 group">
          <div className="w-8 h-8 rounded-full border border-[rgba(255,255,255,0.15)] bg-[#121822] flex items-center justify-center group-hover:border-[#E5A869]/60 transition-colors">
            <span className="w-2 h-2 rounded-full bg-[#E5A869] shadow-[0_0_8px_rgba(229,168,105,0.9)]" />
          </div>
          <div className="flex items-baseline space-x-2">
            <span className="font-display text-lg font-normal text-[#F5F7FA] tracking-tight">
              CampusSaarthi
            </span>
            <span className="text-xs text-[#8E9BAE] hidden sm:inline-block font-light">
              IIM Lucknow
            </span>
          </div>
        </Link>

        {/* Central Frosted Pill Nav */}
        <nav className="flex items-center space-x-1 sm:space-x-1.5 p-1 bg-[#121822]/90 border border-[rgba(255,255,255,0.1)] rounded-full backdrop-blur-md">
          {navLinks.map((item) => {
            const isActive = pathname === item.href || (item.href !== '/' && pathname.startsWith(item.href));
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`text-xs sm:text-sm px-3.5 py-1.5 rounded-full font-normal transition-all flex items-center space-x-1.5 ${
                  isActive
                    ? 'text-[#0B0E14] bg-[#E5A869] font-medium shadow-[0_0_12px_rgba(229,168,105,0.35)]'
                    : 'text-[#8E9BAE] hover:text-[#F5F7FA] hover:bg-[rgba(255,255,255,0.05)]'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* Role Switcher Pill */}
        <div className="flex items-center space-x-2">
          <div className="relative">
            <select
              id="role-switcher"
              aria-label="Select user role"
              value={currentRole}
              onChange={(e) => handleRoleChange(e.target.value)}
              className="text-xs text-[#8E9BAE] bg-[#121822] border border-[rgba(255,255,255,0.1)] rounded-full px-3 py-1.5 pr-7 appearance-none focus:outline-none focus:border-[#E5A869]/60 cursor-pointer"
            >
              <option value="fresher" className="bg-[#121822] text-[#F5F7FA]">Fresher</option>
              <option value="senior" className="bg-[#121822] text-[#F5F7FA]">Senior</option>
              <option value="alumni" className="bg-[#121822] text-[#F5F7FA]">Alum</option>
              <option value="faculty" className="bg-[#121822] text-[#F5F7FA]">Faculty</option>
              <option value="admin" className="bg-[#121822] text-[#F5F7FA]">Admin</option>
            </select>
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-[#8E9BAE]">
              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
              </svg>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
