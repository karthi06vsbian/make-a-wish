import React, { useState, useRef, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Globe, ChevronDown, Check } from 'lucide-react';
import { SUPPORTED_LANGUAGES } from '../i18n/i18n';
import { LanguageCode } from '../types';

export const LanguageSelector: React.FC = () => {
  const { i18n } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement | null>(null);

  const currentLangCode = (i18n.language?.split('-')[0] || 'en') as LanguageCode;
  const currentLang = SUPPORTED_LANGUAGES.find((l) => l.code === currentLangCode) || SUPPORTED_LANGUAGES[0];

  const handleSelect = (code: LanguageCode) => {
    i18n.changeLanguage(code);
    localStorage.setItem('wishmaker_language', code);
    setIsOpen(false);
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="relative inline-block text-left" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium bg-midnight-900/60 border border-gold-500/20 text-cream-200 hover:border-gold-500/40 hover:text-gold-200 transition-colors duration-200"
        aria-haspopup="true"
        aria-expanded={isOpen}
      >
        <Globe className="w-3.5 h-3.5 text-gold-400" />
        <span>{currentLang.nativeName}</span>
        <ChevronDown className={`w-3.5 h-3.5 text-gold-400/80 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-48 rounded-xl bg-midnight-900/95 border border-gold-500/30 shadow-glass backdrop-blur-md py-1.5 z-50 animate-in fade-in zoom-in-95 duration-150">
          <div className="px-3 py-1 text-[10px] uppercase tracking-wider text-gold-400/70 border-b border-gold-500/10 font-semibold">
            Choose Language / மொழி
          </div>
          {SUPPORTED_LANGUAGES.map((lang) => {
            const isSelected = currentLang.code === lang.code;
            return (
              <button
                key={lang.code}
                onClick={() => handleSelect(lang.code)}
                className={`w-full flex items-center justify-between px-3 py-2 text-xs text-left transition-colors ${
                  isSelected
                    ? 'bg-gold-500/20 text-gold-200 font-semibold'
                    : 'text-cream-300 hover:bg-gold-500/10 hover:text-gold-100'
                }`}
              >
                <div className="flex flex-col">
                  <span>{lang.nativeName}</span>
                  <span className="text-[10px] text-cream-400/60">{lang.label}</span>
                </div>
                {isSelected && <Check className="w-3.5 h-3.5 text-gold-400" />}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
};
