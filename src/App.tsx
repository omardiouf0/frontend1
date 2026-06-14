/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { FrontOffice } from './components/FrontOffice';
import { BackOffice } from './components/BackOffice';
import { translations } from './utils/translations';
import {
  Menu,
  X,
  Search,
  BookOpen,
  FolderGit2,
  Database,
  Calendar,
  Newspaper,
  Phone,
  UserCheck,
  Building,
  Home,
  Info,
  Layers,
  Users,
  Globe,
  Settings,
  Cpu,
  ChevronDown,
  ChevronRight,
  GraduationCap
} from 'lucide-react';

function NavigationAndRouting() {
  const { 
    currentUser, 
    searchQuery, 
    setSearchQuery, 
    currentLanguage, 
    setCurrentLanguage 
  } = useApp();

  const t = translations[currentLanguage];

  // Root view mode: 'front' (Public portal) or 'back' (Admin panel dashboard)
  const [viewMode, setViewMode] = useState<'front' | 'back'>('front');

  // Active FrontOffice subpage
  // 'home' | 'about' | 'axes' | 'researchers' | 'publications' | 'projects' | 'datasets' | 'events' | 'news' | 'contact' | 'search'
  const [activeFrontTab, setActiveFrontTab] = useState<string>('home');

  // Responsive mobile menu toggle
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Sync with window URL Hash for a robust, bookmarkable, and fully back-button capable Client-Side Routing!
  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash.replace('#/', '');
      if (hash.startsWith('back')) {
        setViewMode('back');
      } else {
        setViewMode('front');
        if (hash) {
          const matchedTab = [
            'home', 'about', 'about-senegal', 'axes', 'researchers', 'publications',
            'projects', 'datasets', 'events', 'news', 'contact', 'search'
          ].find(t => t === hash);
          if (matchedTab) setActiveFrontTab(matchedTab);
        }
      }
    };

    window.addEventListener('hashchange', handleHashChange);
    // Initial load sync
    handleHashChange();

    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  const navigateToTab = (tabId: string) => {
    setActiveFrontTab(tabId);
    setViewMode('front');
    window.location.hash = `#/${tabId}`;
    setMobileMenuOpen(false);
  };

  const navigateToBackoffice = () => {
    setViewMode('back');
    window.location.hash = '#/back';
    setMobileMenuOpen(false);
  };

  const handleGlobalSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigateToTab('search');
    }
  };

  return (
    <div className="min-h-screen flex flex-col font-sans select-text">
      
      {/* INSTITUTIONAL BRAND RAIL HEADER (UCAD / IRD France / UMMISCO) */}
      {viewMode === 'front' && (
        <header className="bg-white sticky top-0 z-45 shadow-sm">
          
          {/* Main UMMISCO.fr Banner at top */}
          <div className="bg-white border-b border-slate-100 hidden md:block">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2 flex items-center justify-between">
              <div className="space-y-1">
                <h1 className="text-3xl font-extrabold tracking-tight text-black font-sans leading-none">UMMISCO</h1>
                <p className="text-[10px] text-slate-500 font-medium tracking-wide">
                  Unité de Modélisation Mathématique et Informatique des Systèmes Complexes
                </p>
              </div>
              
              {/* UCAD Emblem (Université Cheikh Anta Diop) */}
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2 border border-slate-150 p-1 rounded-xl bg-slate-50 select-none">
                  <img 
                    src="https://images.weserv.nl/?url=https%3A%2F%2Fwww.divecosys.org%2Fvar%2Fdivecosys%2Fstorage%2Fimages%2Fdivecosys%2Fpresentation%2Fpartenaires%2Fucad%2F32191-7-fre-FR%2Fucad.jpg" 
                    alt="Logo Université Cheikh Anta Diop" 
                    className="h-10 w-auto shrink-0 select-none object-contain rounded-lg"
                    referrerPolicy="no-referrer"
                    onError={(e) => {
                      const img = e.currentTarget;
                      if (img.src.includes("images.weserv.nl")) {
                        img.src = "https://www.divecosys.org/var/divecosys/storage/images/divecosys/presentation/partenaires/ucad/32191-7-fre-FR/ucad.jpg";
                      } else if (!img.src.includes("Logo_UCAD.png")) {
                        img.src = "https://upload.wikimedia.org/wikipedia/fr/5/50/Logo_UCAD.png";
                      }
                    }}
                  />
                  <div className="leading-tight text-left">
                    <span className="text-[10px] font-bold text-slate-800 block">Université Cheikh Anta Diop</span>
                    <span className="text-[8px] uppercase tracking-wider text-slate-400 font-extrabold block">Dakar, Sénégal (ucad.sn)</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          {/* Separator Line: 70% black, 30% sky-blue */}
          <div className="w-full h-1 flex select-none">
            <div className="bg-[#111111] h-full" style={{ width: '70%' }}></div>
            <div className="bg-brand-light-blue h-full" style={{ width: '30%' }}></div>
          </div>

          {/* Main Navigation and brand actions */}
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5 flex justify-between items-center">
            
            {/* UMMISCO Logo orb */}
            <div className="flex items-center gap-3">
              <img 
                src="https://ummisco.fr/wp-content/uploads/2026/05/UMMISCO.webp" 
                alt="UMMISCO Logo" 
                className="h-10 w-auto shrink-0 select-none hover:scale-105 transition-transform"
                referrerPolicy="no-referrer"
                onError={(e) => {
                  const img = e.currentTarget;
                  if (img.src.includes("2026/05/UMMISCO.webp")) {
                    img.src = "https://www.ummisco.fr/wp-content/uploads/2020/03/Logo-Ummisco-Horizontal-205_60.png";
                  }
                }}
              />
              <div className="leading-tight text-left select-none1">
                <span className="text-sm font-extrabold text-[#0A3D62] tracking-tight block">UMMISCO</span>
                <span className="text-[10px] font-semibold text-slate-500 block">Unité Mixte Internationale (UMI 209)</span>
              </div>
            </div>

            {/* Right actions: Search, Language switcher & Espace membre button */}
            <div className="hidden lg:flex items-center gap-5">
              
              {/* Language Selection: Active is round dark blue badge */}
              <div className="flex items-center gap-3 mr-1 select-none">
                {[
                  { code: 'fr', label: 'FR' },
                  { code: 'en', label: 'EN' }
                ].map(lang => (
                  <button
                    key={lang.code}
                    onClick={() => setCurrentLanguage(lang.code as 'fr' | 'en' | 'ar')}
                    className={`text-xs font-bold transition-all px-2.5 py-1 rounded-sm cursor-pointer ${
                      currentLanguage === lang.code
                        ? 'bg-[#0a3d62] text-white font-medium'
                        : 'text-[#0a3d62] hover:underline'
                    }`}
                  >
                    {lang.label}
                  </button>
                ))}
              </div>

              {/* Search panel */}
              <form onSubmit={handleGlobalSearchSubmit} className="relative">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder={t.searchPlaceholder}
                  className="bg-slate-50 border border-slate-200 py-1.5 pl-3 pr-8 rounded-lg text-xs font-medium w-44 focus:w-56 focus:bg-white transition-all outline-hidden text-slate-800"
                />
                <button type="submit" className="absolute right-2.5 top-2.5 text-slate-400 hover:text-[#0a3d62]">
                  <Search size={13} />
                </button>
              </form>

              {/* Espace Membre button in beautiful signature beige `#c19d75` */}
              {currentUser ? (
                <button
                  onClick={navigateToBackoffice}
                  className="px-4 py-1.5 bg-[#c19d75] hover:bg-[#b08b64] text-white font-bold text-xs rounded-lg flex items-center gap-1.5 transition-all shadow-xs cursor-pointer"
                >
                  <Settings size={13} />
                  <span>{t.adminConsole}</span>
                </button>
              ) : (
                <button
                  onClick={navigateToBackoffice}
                  className="px-4 py-1.5 bg-white hover:bg-slate-50 text-[#0a3d62] font-semibold text-xs rounded-lg border border-[#0a3d62] transition-all cursor-pointer"
                >
                  {t.auth}
                </button>
              )}
            </div>

            {/* Mobile toggles */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 rounded-lg text-slate-600 hover:bg-slate-100 focus:outline-hidden"
            >
              {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>

          {/* MAIN PUBLIC NAVIGATION LINKS ROW */}
          <nav className="bg-slate-50 border-t border-slate-150 shadow-3xs/50 hidden lg:block select-none">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex justify-center">
              <div className="flex gap-4 py-1 items-center">
                
                {/* ACCUEIL */}
                <button
                  onClick={() => navigateToTab('home')}
                  className={`px-3 py-2.5 text-xs font-bold rounded-md flex items-center gap-1.5 transition-colors cursor-pointer uppercase tracking-wider ${
                    activeFrontTab === 'home'
                      ? 'text-[#0a3d62] border-b-2 border-[#0a3d62]'
                      : 'text-slate-600 hover:text-[#0a3d62]'
                  }`}
                >
                  <Home size={13} />
                  <span>{t.home}</span>
                </button>

                {/* Dropdown UNITÉ */}
                <div className="relative group py-2">
                  <button
                    className={`px-3 py-1.5 text-xs font-bold rounded-md flex items-center gap-1 transition-all cursor-pointer uppercase tracking-wider ${
                      ['about', 'about-senegal', 'researchers', 'axes'].includes(activeFrontTab)
                        ? 'text-[#0a3d62] border-b-2 border-[#0a3d62]'
                        : 'text-slate-600 hover:text-[#0a3d62]'
                    }`}
                  >
                    <span>UNITÉ</span>
                    <ChevronDown size={11} className="opacity-70 group-hover:rotate-180 transition-transform duration-200" />
                  </button>
                  
                  {/* Flyout Menu */}
                  <div className="absolute top-full left-0 w-52 bg-white border border-slate-200 rounded-lg shadow-xl py-1.5 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-150 z-50">
                    {/* Nested Presentation Submenu */}
                    <div className="relative group/sub">
                      <div className="w-full px-4 py-2 hover:bg-slate-50 text-left text-xs font-semibold text-slate-700 flex items-center justify-between cursor-pointer">
                        <span>Présentation</span>
                        <ChevronRight size={10} className="text-slate-400" />
                      </div>
                      
                      {/* Nested Slideout */}
                      <div className="absolute top-0 left-full w-48 bg-white border border-slate-200 rounded-lg shadow-xl py-1.5 opacity-0 invisible group-hover/sub:opacity-100 group-hover/sub:visible transition-all duration-150">
                        <button
                          onClick={() => {
                            navigateToTab('about');
                            // Scroll to Tutelles
                            setTimeout(() => {
                              const el = document.getElementById('tutelles-section');
                              if (el) el.scrollIntoView({ behavior: 'smooth' });
                            }, 250);
                          }}
                          className="w-full px-4 py-2 hover:bg-[#0a3d62]/5 hover:text-[#0a3d62] text-left text-xs font-medium text-slate-600 block cursor-pointer"
                        >
                          Tutelles Académiques
                        </button>
                        <button
                          onClick={() => navigateToTab('about')}
                          className="w-full px-4 py-2 hover:bg-[#0a3d62]/5 hover:text-[#0a3d62] text-left text-xs font-medium text-slate-600 block cursor-pointer"
                        >
                          UMMISCO
                        </button>
                        <button
                          onClick={() => navigateToTab('about-senegal')}
                          className="w-full px-4 py-2 hover:bg-[#c19d75]/10 hover:text-[#c19d75] text-left text-xs font-bold text-[#c19d75] block cursor-pointer border-t border-slate-100"
                        >
                          UMMISCO SENEGAL
                        </button>
                      </div>
                    </div>

                    <div className="h-px bg-slate-100 my-1"></div>

                    <button
                      onClick={() => navigateToTab('researchers')}
                      className="w-full px-4 py-2 hover:bg-slate-50 text-left text-xs font-semibold text-slate-700 block cursor-pointer"
                    >
                      Membres
                    </button>
                    <button
                      onClick={() => navigateToTab('axes')}
                      className="w-full px-4 py-2 hover:bg-slate-50 text-left text-xs font-semibold text-slate-700 block cursor-pointer"
                    >
                      Priorités scientifiques
                    </button>
                    <button
                      onClick={() => navigateToTab('formations')}
                      className="w-full px-4 py-2 hover:bg-slate-50 text-left text-xs font-semibold text-slate-700 block cursor-pointer"
                    >
                      Formations & Cours Académiques
                    </button>
                  </div>
                </div>

                {/* Dropdown RECHERCHES */}
                <div className="relative group py-2">
                  <button
                    className={`px-3 py-1.5 text-xs font-bold rounded-md flex items-center gap-1 transition-all cursor-pointer uppercase tracking-wider ${
                      ['publications', 'projects', 'datasets'].includes(activeFrontTab)
                        ? 'text-[#0a3d62] border-b-2 border-[#0a3d62]'
                        : 'text-slate-600 hover:text-[#0a3d62]'
                    }`}
                  >
                    <span>RECHERCHES</span>
                    <ChevronDown size={11} className="opacity-70 group-hover:rotate-180 transition-transform duration-200" />
                  </button>
                  
                  <div className="absolute top-full left-0 w-52 bg-white border border-slate-200 rounded-lg shadow-xl py-1.5 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-150 z-50">
                    <button
                      onClick={() => navigateToTab('publications')}
                      className="w-full px-4 py-2 hover:bg-slate-50 text-left text-xs font-semibold text-slate-700 block cursor-pointer"
                    >
                      Publications
                    </button>
                    <button
                      onClick={() => navigateToTab('projects')}
                      className="w-full px-4 py-2 hover:bg-slate-50 text-left text-xs font-semibold text-slate-700 block cursor-pointer"
                    >
                      Projets
                    </button>
                    <button
                      onClick={() => navigateToTab('datasets')}
                      className="w-full px-4 py-2 hover:bg-slate-50 text-left text-xs font-semibold text-slate-700 block cursor-pointer"
                    >
                      Jeux de données (Datasets)
                    </button>
                  </div>
                </div>

                {/* Dropdown COMMUNICATION */}
                <div className="relative group py-2">
                  <button
                    className={`px-3 py-1.5 text-xs font-bold rounded-md flex items-center gap-1 transition-all cursor-pointer uppercase tracking-wider ${
                      ['news', 'events'].includes(activeFrontTab)
                        ? 'text-[#0a3d62] border-b-2 border-[#0a3d62]'
                        : 'text-slate-600 hover:text-[#0a3d62]'
                    }`}
                  >
                    <span>ACTUALITÉS & ÉVÉNEMENTS</span>
                    <ChevronDown size={11} className="opacity-70 group-hover:rotate-180 transition-transform duration-200" />
                  </button>
                  
                  <div className="absolute top-full left-0 w-52 bg-white border border-slate-200 rounded-lg shadow-xl py-1.5 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-150 z-50">
                    <button
                      onClick={() => navigateToTab('news')}
                      className="w-full px-4 py-2 hover:bg-slate-50 text-left text-xs font-semibold text-slate-700 block cursor-pointer"
                    >
                      Actualités
                    </button>
                    <button
                      onClick={() => navigateToTab('events')}
                      className="w-full px-4 py-2 hover:bg-slate-50 text-left text-xs font-semibold text-slate-700 block cursor-pointer"
                    >
                      Événements
                    </button>
                  </div>
                </div>

                {/* CONTACT */}
                <button
                  onClick={() => navigateToTab('contact')}
                  className={`px-3 py-2.5 text-xs font-bold rounded-md flex items-center gap-1.5 transition-colors cursor-pointer uppercase tracking-wider ${
                    activeFrontTab === 'contact'
                      ? 'text-[#0a3d62] border-b-2 border-[#0a3d62]'
                      : 'text-slate-600 hover:text-[#0a3d62]'
                  }`}
                >
                  <Phone size={13} />
                  <span>{t.contact}</span>
                </button>

              </div>
            </div>
          </nav>

          {/* MOBILE RESPONSIVE DRAWER OVERLAY */}
          {mobileMenuOpen && (
            <div className="lg:hidden bg-white border-t border-slate-200">
              <div className="p-4 space-y-3">
                <form onSubmit={handleGlobalSearchSubmit} className="relative">
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder={t.searchPlaceholderMobile}
                    className="w-full bg-slate-50 border border-slate-205 py-2 pl-3 pr-8 rounded-lg text-xs"
                  />
                  <button type="submit" className="absolute right-2 top-2.5 text-slate-400">
                    <Search size={14} />
                  </button>
                </form>

                {/* Mobile Language Selector */}
                <div className="flex bg-slate-100 rounded-lg p-0.5 border border-slate-205 justify-around items-center select-none" dir="ltr">
                  {[
                    { code: 'fr', label: 'Français' },
                    { code: 'en', label: 'English' },
                    { code: 'ar', label: 'العربية' }
                  ].map(lang => (
                    <button
                      key={lang.code}
                      onClick={() => {
                        setCurrentLanguage(lang.code as 'fr' | 'en' | 'ar');
                      }}
                      className={`flex-1 py-1.5 text-center text-xs font-bold rounded-md transition-all cursor-pointer ${
                        currentLanguage === lang.code
                          ? 'bg-brand-blue text-white shadow-xs'
                          : 'text-slate-500 hover:text-slate-800'
                      }`}
                    >
                      {lang.label}
                    </button>
                  ))}
                </div>

                <div className="flex flex-col gap-1 text-xs font-semibold">
                  {[
                    { id: 'home', label: t.home, icon: Home },
                    { id: 'about', label: t.about, icon: Info },
                    { id: 'axes', label: t.axes, icon: Layers },
                    { id: 'researchers', label: t.researchers, icon: Users },
                    { id: 'publications', label: t.publications, icon: BookOpen },
                    { id: 'projects', label: t.projects, icon: FolderGit2 },
                    { id: 'datasets', label: t.datasets, icon: Database },
                    { id: 'formations', label: 'Formations & Cours', icon: GraduationCap },
                    { id: 'events', label: t.events, icon: Calendar },
                    { id: 'news', label: t.news, icon: Newspaper },
                    { id: 'contact', label: t.contact, icon: Phone }
                  ].map(navItem => (
                    <button
                      key={navItem.id}
                      onClick={() => navigateToTab(navItem.id)}
                      className={`w-full text-left p-2.5 rounded-lg flex items-center gap-2.5 ${
                        activeFrontTab === navItem.id ? 'bg-slate-50 text-brand-blue font-bold border-l-4 border-brand-blue' : 'text-slate-700 hover:bg-slate-50'
                      }`}
                    >
                      <navItem.icon size={14} />
                      <span>{navItem.label}</span>
                    </button>
                  ))}

                  <div className="pt-2 border-t border-slate-100">
                    <button
                      onClick={navigateToBackoffice}
                      className="w-full text-center py-2.5 bg-brand-blue hover:bg-brand-blue/90 text-white rounded-lg flex items-center justify-center gap-2"
                    >
                      <Settings size={14} />
                      {t.adminConsole}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

        </header>
      )}

      {/* RENDER CURRENT PANEL VIEW */}
      {viewMode === 'front' ? (
        <FrontOffice
          activeTab={activeFrontTab}
          setActiveTab={navigateToTab}
          onNavigateToBackoffice={navigateToBackoffice}
        />
      ) : (
        <BackOffice
          onNavigateToFrontoffice={() => {
            setViewMode('front');
            window.location.hash = '#/home';
          }}
        />
      )}

    </div>
  );
}

export default function App() {
  return (
    <AppProvider>
      <NavigationAndRouting />
    </AppProvider>
  );
}
