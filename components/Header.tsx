import React from 'react';
import { ArrowLeft, GraduationCap, Search, X } from 'lucide-react';

interface HeaderProps {
  title: string;
  subtitle?: string;
  canGoBack: boolean;
  onBack: () => void;
  onSearchClick: () => void;
  isSearchActive: boolean;
}

export const Header: React.FC<HeaderProps> = ({ 
  title, 
  subtitle, 
  canGoBack, 
  onBack, 
  onSearchClick,
  isSearchActive 
}) => {
  return (
    <header className="bg-white text-slate-800 shadow-sm border-b border-slate-200 sticky top-0 z-50">
      <div className="max-w-3xl mx-auto px-4 h-16 flex items-center justify-between">
        <div className="flex items-center flex-1">
          {canGoBack ? (
            <button 
              onClick={onBack}
              className="mr-3 p-2 rounded-full hover:bg-slate-100 text-slate-600 transition-colors"
              aria-label="Geri Git"
            >
              <ArrowLeft size={24} />
            </button>
          ) : (
            <div className="mr-3 p-2 text-blue-700">
               <GraduationCap size={32} />
            </div>
          )}
          
          <div className="flex flex-col">
              <h1 className="text-lg font-bold leading-tight text-slate-900">{title}</h1>
              {subtitle && <p className="text-slate-500 text-xs font-medium">{subtitle}</p>}
          </div>
        </div>

        <button
          onClick={onSearchClick}
          className={`p-2.5 rounded-full transition-colors ${isSearchActive ? 'bg-slate-200 text-slate-900' : 'hover:bg-slate-100 text-slate-600'}`}
          aria-label={isSearchActive ? "Aramayı Kapat" : "Ara"}
        >
          {isSearchActive ? <X size={24} /> : <Search size={24} />}
        </button>
      </div>
    </header>
  );
};