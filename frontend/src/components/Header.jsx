import React, { useState } from 'react';
import { NavLink } from 'react-router';
import { FiMenu, FiX } from 'react-icons/fi';

export default function Header({ sessionData }) {
  const [isOpen, setIsOpen] = useState(false);

  const navItems = [
    { name: 'Chat', path: 'chat' },
    { name: 'Summary', path: 'summary' },
    { name: 'Flashcards', path: 'flashcards' },
    { name: 'PPT', path: 'ppt' },
    { name: 'Video', path: 'video' },
  ];

  const linkClass = ({ isActive }) =>
    `block px-3 py-2 rounded transition-colors ${
      isActive
        ? 'bg-[#FFDDD2] font-semibold text-[#006D77]'
        : 'hover:bg-[#E29578]/30'
    }`;

  return (
    <header className="bg-[#006D77] text-white shadow-md sticky top-0 z-50">
      <div className="max-w-7xl mx-auto flex justify-between items-center p-4">
        {/* Logo / Title */}
        <div className="h-10 flex items-center space-x-3">
          <img src="/logo.png" alt="Logo" className="h-full w-auto" />
          <h1 className="text-2xl font-bold">E-vidya</h1>
        </div>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex space-x-2 items-center">
          {navItems.map((item) => (
            <NavLink
              key={item.name}
              to={`/${sessionData}/${item.path}`}
              className={linkClass}
            >
              {item.name}
            </NavLink>
          ))}
        </nav>

        {/* Session Display (Desktop) */}
        <div className="hidden md:block ml-4 px-3 py-1 bg-white/20 rounded text-sm font-medium">
          Session: {sessionData}
        </div>

        {/* Mobile Hamburger */}
        <button
          className="md:hidden p-2 rounded hover:bg-white/20"
          onClick={() => setIsOpen(!isOpen)}
        >
          {isOpen ? <FiX size={24} /> : <FiMenu size={24} />}
        </button>
      </div>

      {/* Mobile Menu */}
      {isOpen && (
        <div className="md:hidden bg-[#006D77]/95 text-white px-4 py-2 space-y-2">
          {navItems.map((item) => (
            <NavLink
              key={item.name}
              to={`/${sessionData}/${item.path}`}
              className={linkClass}
              onClick={() => setIsOpen(false)}
            >
              {item.name}
            </NavLink>
          ))}
          <div className="px-3 py-1 bg-white/20 rounded text-sm font-medium">
            {sessionData}
          </div>
        </div>
      )}
    </header>
  );
}
