'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import ThemeToggle from './ThemeToggle';
import {
  Shield,
  MapPin,
  Users,
  Wrench,
  History,
  EyeOff,
  AlertTriangle,
  User,
} from 'lucide-react';

interface NavbarProps {
  onTriggerSOS?: () => void;
  onOpenProfile?: () => void;
  activeJourney?: boolean;
}

export default function Navbar({ onTriggerSOS, onOpenProfile, activeJourney = false }: NavbarProps) {
  const pathname = usePathname();

  const navLinks = [
    { name: 'Dashboard', href: '/', icon: Shield },
    { name: 'Journey', href: '/journey', icon: MapPin, highlight: activeJourney },
    { name: 'Guardians', href: '/contacts', icon: Users },
    { name: 'Safety Toolkit', href: '/toolkit', icon: Wrench },
    { name: 'Discreet Mask', href: '/stealth', icon: EyeOff },
    { name: 'Activity Log', href: '/history', icon: History },
  ];

  return (
    <header className="sticky top-0 z-50 bg-[#fcfbfa]/95 dark:bg-[#090d16]/95 backdrop-blur-md border-b border-stone-200/80 dark:border-slate-800/80 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Brand Identity */}
          <Link href="/" className="flex items-center gap-3 group">
            <div className="w-9 h-9 rounded-xl bg-stone-900 dark:bg-slate-100 text-white dark:text-stone-900 flex items-center justify-center font-bold shadow-sm transition-transform group-hover:scale-105">
              <Shield className="w-4 h-4 text-rose-500 fill-rose-500/20" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-base font-bold tracking-tight text-stone-900 dark:text-white">
                  SAATHI
                </span>
                <span className="text-[10px] font-semibold tracking-wider px-1.5 py-0.5 rounded bg-stone-200/80 dark:bg-slate-800 text-stone-700 dark:text-slate-300">
                  AI
                </span>
              </div>
              <p className="text-[10px] text-stone-500 dark:text-slate-400 font-medium hidden sm:block">
                Your journey. Your people. Your safety.
              </p>
            </div>
          </Link>

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center gap-1">
            {navLinks.map(link => {
              const Icon = link.icon;
              const isActive = pathname === link.href;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                    isActive
                      ? 'bg-stone-200/70 dark:bg-slate-800 text-stone-900 dark:text-white font-semibold'
                      : 'text-stone-600 dark:text-slate-400 hover:text-stone-900 dark:hover:text-white hover:bg-stone-100 dark:hover:bg-slate-800/50'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span>{link.name}</span>
                  {link.highlight && (
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse ml-0.5" />
                  )}
                </Link>
              );
            })}
          </nav>

          {/* Header Action Controls */}
          <div className="flex items-center gap-2">
            {/* Theme Toggle Button */}
            <ThemeToggle />

            {/* Profile / Safety Credentials Button */}
            {onOpenProfile && (
              <button
                onClick={onOpenProfile}
                type="button"
                className="p-2 rounded-xl text-stone-600 dark:text-slate-300 hover:text-stone-900 dark:hover:text-white bg-stone-100 dark:bg-slate-800/80 hover:bg-stone-200 dark:hover:bg-slate-700/80 border border-stone-200/80 dark:border-slate-700/60 transition-all flex items-center justify-center"
                title="Safety Profile & PIN Settings"
                aria-label="Profile and Settings"
              >
                <User className="w-4 h-4" />
              </button>
            )}

            {/* Deliberate, High-Tactile Emergency SOS Trigger */}
            <button
              onClick={onTriggerSOS}
              type="button"
              className="inline-flex items-center gap-1.5 bg-rose-600 hover:bg-rose-700 active:bg-rose-800 text-white font-bold text-xs px-3.5 py-2 rounded-xl shadow-sm transition-all active:scale-95"
              title="Immediate Crisis Dispatch Protocol"
            >
              <AlertTriangle className="w-3.5 h-3.5 fill-white" />
              <span>SOS</span>
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Ergonomic Bottom Tab Navigation */}
      <div className="md:hidden flex justify-around border-t border-stone-200 dark:border-slate-800 bg-[#fcfbfa]/95 dark:bg-[#090d16]/95 py-1.5 px-2">
        {navLinks.map(link => {
          const Icon = link.icon;
          const isActive = pathname === link.href;
          return (
            <Link
              key={link.href}
              href={link.href}
              className={`flex flex-col items-center py-1 px-2 text-[10px] font-medium rounded-lg ${
                isActive
                  ? 'text-rose-600 dark:text-rose-400 font-semibold'
                  : 'text-stone-500 dark:text-slate-400'
              }`}
            >
              <Icon className="w-4 h-4 mb-0.5" />
              <span>{link.name}</span>
            </Link>
          );
        })}
      </div>
    </header>
  );
}
