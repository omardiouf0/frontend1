/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { Pagination } from './Pagination';
import { translations } from '../utils/translations';
import {
  Search,
  BookOpen,
  FolderGit2,
  Database,
  Calendar,
  Newspaper,
  UserCheck,
  TrendingUp,
  MapPin,
  Mail,
  Phone,
  ArrowRight,
  ExternalLink,
  ChevronRight,
  Download,
  Filter,
  Users,
  Award,
  Globe,
  PlusCircle,
  Clock,
  Send,
  SlidersHorizontal,
  GraduationCap,
  LineChart,
  CheckCircle2,
  ArrowUpRight
} from 'lucide-react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as ChartTooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  Cell
} from 'recharts';
import { motion, AnimatePresence } from 'motion/react';
import { Researcher, Publication, Project, Dataset, Event, News, ResearchAxis } from '../types';
import { NewsletterSubscription } from './NewsletterSubscription';
import { generatePublicationPdf } from '../utils/pdfGenerator';
import { generateDatasetCsv } from '../utils/datasetExporter';
import ummiscoTeamMeeting from '../assets/images/ummisco_team_meeting_1780852515219.png';

interface FrontOfficeProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  onNavigateToBackoffice: () => void;
}

export const FrontOffice: React.FC<FrontOfficeProps> = ({
  activeTab,
  setActiveTab,
  onNavigateToBackoffice
}) => {
  const {
    researchers,
    axes,
    partners,
    publications,
    projects,
    datasets,
    events,
    news,
    searchQuery,
    setSearchQuery,
    addPublication,
    currentUser,
    currentLanguage,

    courses,
    addInscription
  } = useApp();

  const t = translations[currentLanguage];

  const diouf = researchers.find(r => r.id === "res-1");
  const thiam = researchers.find(r => r.id === "res-2");
  const zucker = researchers.find(r => r.id === "res-3");

  // Highlighted entity states for details modal
  const [selectedResearcher, setSelectedResearcher] = useState<Researcher | null>(null);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [selectedPublication, setSelectedPublication] = useState<Publication | null>(null);
  const [selectedDataset, setSelectedDataset] = useState<Dataset | null>(null);
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [selectedNews, setSelectedNews] = useState<News | null>(null);
  const [selectedAxis, setSelectedAxis] = useState<ResearchAxis | null>(null);

  // States for dynamic collaboration modals
  const [showFinanceModal, setShowFinanceModal] = useState(false);
  const [showJoinModal, setShowJoinModal] = useState(false);

  // States for live course search & registrations
  const [courseFilterLevel, setCourseFilterLevel] = useState<'All' | 'Master' | 'Doctorat' | 'Séminaire'>('All');
  const [courseSearchText, setCourseSearchText] = useState('');
  const [activeEnrollCourseId, setActiveEnrollCourseId] = useState<string | null>(null);
  const [enrollForm, setEnrollForm] = useState({
    studentName: '',
    studentEmail: '',
    studentLevel: 'Master',
    motivation: ''
  });
  const [enrollFeedback, setEnrollFeedback] = useState<string | null>(null);
  const [financeForm, setFinanceForm] = useState({ name: '', org: '', email: '', projectTitle: '', message: '' });
  const [joinForm, setJoinForm] = useState({ name: '', currentRole: 'Enseignant-Chercheur', email: '', cvLink: '', cvFile: null as File | null, motivation: '' });
  const [financeSuccess, setFinanceSuccess] = useState(false);
  const [joinSuccess, setJoinSuccess] = useState(false);

  const [downloadToast, setDownloadToast] = useState<string | null>(null);

  const filteredCourses = useMemo(() => {
    return courses.filter(c => {
      const matchLevel = courseFilterLevel === 'All' || c.level === courseFilterLevel;
      const matchText = c.title.toLowerCase().includes(courseSearchText.toLowerCase()) ||
                        c.code.toLowerCase().includes(courseSearchText.toLowerCase()) ||
                        c.professorName.toLowerCase().includes(courseSearchText.toLowerCase()) ||
                        c.description.toLowerCase().includes(courseSearchText.toLowerCase());
      return matchLevel && matchText;
    });
  }, [courses, courseFilterLevel, courseSearchText]);

  useEffect(() => {
    if (downloadToast) {
      const timer = setTimeout(() => {
        setDownloadToast(null);
      }, 4000);
      return () => clearTimeout(timer);
    }
  }, [downloadToast]);

  // Facet Filters
  const [pubFilterType, setPubFilterType] = useState<string>('all');
  const [pubFilterAxis, setPubFilterAxis] = useState<string>('all');
  const [projFilterAxis, setProjFilterAxis] = useState<string>('all');
  const [datasetFilterAxis, setDatasetFilterAxis] = useState<string>('all');
  const [resFilterAffiliation, setResFilterAffiliation] = useState<string>('all');
  const [eventFilterType, setEventFilterType] = useState<string>('all');

  // Pagination states
  const [pubCurrentPage, setPubCurrentPage] = useState<number>(1);
  const [projCurrentPage, setProjCurrentPage] = useState<number>(1);
  const itemsPerPage = 3;

  // Google Scholar specific states
  const [scholarSearchQuery, setScholarSearchQuery] = useState<string>('');
  const [analyzedScholarId, setAnalyzedScholarId] = useState<string>('');
  const [analyzedProfileData, setAnalyzedProfileData] = useState<any | null>(null);
  const [customProfileLoading, setCustomProfileLoading] = useState<boolean>(false);
  const [scholarViewMode, setScholarViewMode] = useState<'listings' | 'metrics' | 'profiles' | 'sandbox'>('listings');

  // Reset pages on filters change
  useEffect(() => {
    setPubCurrentPage(1);
  }, [pubFilterType, pubFilterAxis]);

  useEffect(() => {
    setProjCurrentPage(1);
  }, [projFilterAxis]);

  // Contact simulated form state
  const [contactForm, setContactForm] = useState({
    name: '',
    email: '',
    subject: '',
    message: '',
    category: 'Collaboration'
  });
  const [contactSubmitted, setContactSubmitted] = useState(false);

  const handleContactSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setContactSubmitted(true);
    setTimeout(() => {
      setContactSubmitted(false);
      setContactForm({ name: '', email: '', subject: '', message: '', category: 'Collaboration' });
    }, 4000);
  };

  // Quick navigation helpers to trigger detailed modal from anywhere
  const viewResearcherDetails = (id: string) => {
    const res = researchers.find(r => r.id === id);
    if (res) setSelectedResearcher(res);
  };

  const viewProjectDetails = (id: string) => {
    const proj = projects.find(p => p.id === id);
    if (proj) setSelectedProject(proj);
  };

  // Filters setup
  const approvedPublications = useMemo(() => {
    return publications.filter(p => p.status === 'Approved');
  }, [publications]);

  const approvedProjects = useMemo(() => {
    return projects.filter(p => p.status === 'Approved');
  }, [projects]);

  const approvedDatasets = useMemo(() => {
    return datasets.filter(d => d.status === 'Approved');
  }, [datasets]);

  const approvedEvents = useMemo(() => {
    return events.filter(e => e.status === 'Approved');
  }, [events]);

  const approvedNews = useMemo(() => {
    return news.filter(n => n.status === 'Approved');
  }, [news]);

  // Global search processing across multiple models for the "Recherche globale" view
  const searchResults = useMemo(() => {
    if (!searchQuery) return { pubs: [], projs: [], datas: [], newsItems: [], evts: [] };
    const q = searchQuery.toLowerCase();
    
    return {
      pubs: approvedPublications.filter(p =>
        p.title.toLowerCase().includes(q) ||
        p.abstract.toLowerCase().includes(q) ||
        p.keywords.some(k => k.toLowerCase().includes(q))
      ),
      projs: approvedProjects.filter(p =>
        p.title.toLowerCase().includes(q) ||
        p.description.toLowerCase().includes(q)
      ),
      datas: approvedDatasets.filter(d =>
        d.title.toLowerCase().includes(q) ||
        d.description.toLowerCase().includes(q)
      ),
      newsItems: approvedNews.filter(n =>
        n.title.toLowerCase().includes(q) ||
        n.summary.toLowerCase().includes(q) ||
        n.content.toLowerCase().includes(q)
      ),
      evts: approvedEvents.filter(e =>
        e.title.toLowerCase().includes(q) ||
        e.description.toLowerCase().includes(q)
      )
    };
  }, [searchQuery, approvedPublications, approvedProjects, approvedDatasets, approvedNews, approvedEvents]);

  const hasSearchResults = useMemo(() => {
    return (
      searchResults.pubs.length > 0 ||
      searchResults.projs.length > 0 ||
      searchResults.datas.length > 0 ||
      searchResults.newsItems.length > 0 ||
      searchResults.evts.length > 0
    );
  }, [searchResults]);

  // Key stats card compute
  const statsSummary = useMemo(() => {
    return {
      researchersCount: researchers.length,
      publicationsCount: approvedPublications.length,
      projectsCount: approvedProjects.length,
      datasetsCount: approvedDatasets.length,
      fundingTotal: "1.01M" // Combined simulated budget
    };
  }, [researchers, approvedPublications, approvedProjects, approvedDatasets]);

  return (
    <div className="flex flex-col min-h-screen bg-slate-50">
      
      {/* Dynamic Sub-View Renderers */}
      <main className="flex-grow pt-4 pb-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <AnimatePresence mode="wait">
            
            {/* 1. ACCUEIL (HOME PAGE) */}
            {activeTab === 'home' && (
              <motion.div
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                transition={{ duration: 0.3 }}
                className="space-y-12"
              >
                {/* Hero Section */}
                <div className="relative rounded-2xl overflow-hidden bg-gradient-to-br from-white via-slate-50 to-blue-50/50 text-slate-800 shadow-sm border border-slate-200/80 min-h-[360px] flex items-center">
                  <div className="absolute inset-0 opacity-10 pointer-events-none">
                    <div className="absolute -inset-10 bg-[radial-gradient(#0A3D62_1.5px,transparent_1.5px)] [background-size:24px_24px]"></div>
                  </div>
                  <div className="relative z-10 p-8 md:p-12 max-w-3xl space-y-4">
                    <div className="inline-flex items-center gap-2 px-3 py-1 bg-[#0A3D62]/10 text-[#0A3D62] rounded-full text-xs font-bold uppercase tracking-wider border border-[#0A3D62]/20">
                      Unité de Recherche Internationale (UCAD / IRD)
                    </div>
                    <h1 className="text-3xl md:text-5xl font-display font-bold tracking-tight leading-tight text-[#0A3D62]">
                      Modélisation Mathématique & Informatique des Systèmes Complexes
                    </h1>
                    <p className="text-slate-600 text-sm md:text-base leading-relaxed">
                      L'UMMISCO réunit des scientifiques d'Afrique et d'Europe pour concevoir des simulations prédictives innovantes au service de la santé globale, de l'agro-écologie sahélienne et de la résilience territoriale.
                    </p>
                    <div className="flex flex-wrap gap-4 pt-2">
                      <button
                        onClick={() => setActiveTab('axes')}
                        className="px-5 py-2.5 bg-[#c19d75] hover:bg-[#b08b64] text-white font-semibold rounded-lg text-sm transition-colors shadow-xs flex items-center gap-2 cursor-pointer"
                      >
                        Découvrir nos Axes
                        <ArrowRight size={16} />
                      </button>
                      <button
                        onClick={() => setActiveTab('about')}
                        className="px-5 py-2.5 bg-white hover:bg-slate-50 text-[#0a3d62] font-semibold rounded-lg text-sm transition-colors border border-slate-200"
                      >
                        À propos de l'Unité
                      </button>
                    </div>
                  </div>
                </div>

                {/* Chiffres Clés (Key statistics) */}
                <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                  {[
                    { label: "Chercheurs Actifs", val: statsSummary.researchersCount, unit: "+", icon: Users, color: "text-blue-600 bg-blue-50" },
                    { label: "Publications Validées", val: statsSummary.publicationsCount, unit: "", icon: BookOpen, color: "text-emerald-600 bg-emerald-50" },
                    { label: "Projets Internationaux", val: statsSummary.projectsCount, unit: "", icon: FolderGit2, color: "text-amber-600 bg-amber-50" },
                    { label: "Datasets Partagés", val: statsSummary.datasetsCount, unit: "", icon: Database, color: "text-indigo-600 bg-indigo-50" },
                    { label: "Fonds de Recherche", val: statsSummary.fundingTotal, unit: "", icon: Award, color: "text-rose-600 bg-rose-50" },
                  ].map((s, idx) => (
                    <div key={idx} className="bg-white rounded-xl p-5 border border-slate-200/80 shadow-sm flex flex-col justify-between hover:shadow-md transition-shadow">
                      <div className="flex justify-between items-start">
                        <span className="text-2xl md:text-3xl font-display font-semibold text-slate-800">{s.val}{s.unit}</span>
                        <div className={`p-1.5 rounded-lg ${s.color}`}>
                          <s.icon size={18} />
                        </div>
                      </div>
                      <span className="text-xs text-slate-500 font-medium mt-2 leading-tight">{s.label}</span>
                    </div>
                  ))}
                </div>

                {/* Présentation de l'Unité */}
                <div className="bg-white rounded-xl p-8 border border-slate-100 shadow-sm grid md:grid-cols-12 gap-8 items-center">
                  <div className="md:col-span-7 space-y-4">
                    <h2 className="text-2xl font-display font-semibold text-brand-dark">
                      UAI UMMISCO (IRDs & UCAD)
                    </h2>
                    <p className="text-slate-600 text-sm leading-relaxed">
                      L'UMMI SCo (Unité de Modélisation Mathématique et Informatique des Systèmes Complexes) est une Unité de Recherche Internationale associant l'<strong>Université Cheikh Anta Diop (Sénégal)</strong>, l'<strong>Institut de Recherche pour le Développement (France)</strong> et <strong>Sorbonne Université</strong>.
                    </p>
                    <p className="text-slate-600 text-sm leading-relaxed">
                      Notre force réside dans le développement de modèles mathématiques et de simulations informatiques (notamment via la plateforme open-source <strong>GAMA</strong>) pour apporter des réponses concrètes aux grands défis sociétaux et environnementaux des pays du Sud.
                    </p>
                    <div className="flex gap-4 pt-2">
                      <div className="flex items-center gap-2 text-xs font-semibold text-brand-blue">
                        <MapPin size={14} className="text-brand-gold" />
                        Dakar, Sénégal / Bondy, France
                      </div>
                      <div className="flex items-center gap-2 text-xs font-semibold text-brand-blue">
                        <Globe size={14} className="text-brand-gold" />
                        Réseau Intercontinental
                      </div>
                    </div>
                  </div>
                  <div className="md:col-span-5 relative">
                    <img
                      src="https://images.unsplash.com/photo-1531482615713-2afd69097998?auto=format&fit=crop&q=80&w=600"
                      alt="Scientific team work"
                      className="rounded-lg shadow-md object-cover h-[220px] w-full"
                      referrerPolicy="no-referrer"
                    />
                    <div className="absolute -bottom-3 -right-3 bg-brand-gold p-4 rounded-lg text-white font-mono text-center shadow-lg hidden sm:block">
                      <div className="text-xl font-bold">GAMA</div>
                      <div className="text-[9px] uppercase tracking-wider">Simulation Platform</div>
                    </div>
                  </div>
                </div>

                {/* Section actualités récentes & événements à venir */}
                <div className="grid md:grid-cols-3 gap-8">
                  {/* Actualités Récentes (2) */}
                  <div className="md:col-span-2 space-y-4">
                    <div className="flex justify-between items-center border-b border-slate-200 pb-2">
                      <h3 className="text-xl font-display font-semibold text-brand-dark flex items-center gap-2">
                        <Newspaper size={18} className="text-brand-gold" />
                        Actualités Récentes
                      </h3>
                      <button
                        onClick={() => setActiveTab('news')}
                        className="text-xs font-semibold text-brand-blue hover:text-brand-gold flex items-center gap-1"
                      >
                        Tout voir <ChevronRight size={14} />
                      </button>
                    </div>
                    <div className="grid sm:grid-cols-2 gap-4">
                      {approvedNews.slice(0, 2).map(n => (
                        <div
                          key={n.id}
                          onClick={() => setSelectedNews(n)}
                          className="group bg-white rounded-xl border border-slate-200 overflow-hidden shadow-xs hover:shadow-md hover:border-brand-blue/30 transition-all cursor-pointer flex flex-col justify-between"
                        >
                          <div>
                            <div className="relative h-40 overflow-hidden">
                              <img
                                src={n.image}
                                alt={n.title}
                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                referrerPolicy="no-referrer"
                              />
                              <span className="absolute top-2 left-2 bg-brand-blue/90 text-white text-[10px] uppercase font-bold py-1 px-2 rounded-full tracking-wider">
                                {n.category}
                              </span>
                            </div>
                            <div className="p-4 space-y-2">
                              <span className="text-xs text-slate-400 font-medium flex items-center gap-1">
                                <Clock size={12} />
                                {n.date}
                              </span>
                              <h4 className="font-display font-semibold text-sm text-slate-800 line-clamp-2 group-hover:text-brand-blue transition-colors">
                                {n.title}
                              </h4>
                              <p className="text-xs text-slate-500 line-clamp-3 leading-relaxed">
                                {n.summary}
                              </p>
                            </div>
                          </div>
                          <div className="p-4 pt-0 flex justify-end">
                            <span className="text-[11px] font-semibold text-brand-blue group-hover:translate-x-1 transition-transform inline-flex items-center gap-1">
                              Lire plus <ArrowRight size={12} />
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Événements récents / Agenda */}
                  <div className="space-y-4">
                    <div className="flex justify-between items-center border-b border-slate-200 pb-2">
                      <h3 className="text-xl font-display font-semibold text-brand-dark flex items-center gap-2">
                        <Calendar size={18} className="text-brand-gold" />
                        Agenda & Séminaires
                      </h3>
                      <button
                        onClick={() => setActiveTab('events')}
                        className="text-xs font-semibold text-brand-blue hover:text-brand-gold flex items-center gap-1"
                      >
                        Calendrier <ChevronRight size={14} />
                      </button>
                    </div>
                    <div className="space-y-3">
                      {approvedEvents.slice(0, 3).map(e => (
                        <div
                          key={e.id}
                          onClick={() => setSelectedEvent(e)}
                          className="bg-white p-3 rounded-xl border border-slate-200 shadow-3xs flex items-center gap-3 hover:border-brand-blue/30 cursor-pointer transition-colors"
                        >
                          <div className="flex flex-col items-center justify-center bg-slate-100 rounded-lg p-2 min-w-16 h-16 text-brand-dark">
                            <span className="text-[9px] font-bold uppercase tracking-wider text-slate-500">
                              {new Date(e.date).toLocaleString('fr-FR', { month: 'short' })}
                            </span>
                            <span className="text-xl font-display font-bold leading-none">{new Date(e.date).getDate()}</span>
                          </div>
                          <div className="space-y-1 min-w-0">
                            <span className="text-[9px] font-bold text-brand-gold uppercase tracking-wider bg-amber-50 px-1.5 py-0.5 rounded border border-amber-100">
                              {e.type}
                            </span>
                            <h4 className="font-semibold text-xs text-slate-800 truncate leading-snug">
                              {e.title}
                            </h4>
                            <span className="text-[10px] text-slate-400 flex items-center gap-1 truncate">
                              <MapPin size={10} />
                              {e.location}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Publications & Projets */}
                <div className="grid md:grid-cols-2 gap-8">
                  {/* Projets Récents */}
                  <div className="bg-gradient-to-br from-white to-slate-50 rounded-xl p-6 border border-slate-200 shadow-sm space-y-4">
                    <div className="flex justify-between items-center border-b border-slate-100 pb-2">
                      <h3 className="text-lg font-display font-semibold text-brand-dark flex items-center gap-2">
                        <FolderGit2 size={18} className="text-brand-gold" />
                        Projets de Recherche Phares
                      </h3>
                      <button onClick={() => setActiveTab('projects')} className="text-xs font-semibold text-brand-blue hover:underline">
                        Tous les projets
                      </button>
                    </div>
                    <div className="space-y-4">
                      {approvedProjects.slice(0, 2).map(p => (
                        <div key={p.id} className="space-y-2 p-3 bg-white rounded-lg border border-slate-100 hover:border-brand-blue/20 transition-all shadow-3xs">
                          <div className="flex justify-between items-start gap-2">
                            <h4 onClick={() => viewProjectDetails(p.id)} className="font-display font-semibold text-sm text-slate-800 hover:text-brand-blue cursor-pointer leading-tight">
                              {p.title}
                            </h4>
                            <span className="text-[10px] font-mono text-slate-400 whitespace-nowrap bg-slate-100 py-0.5 px-1.5 rounded">
                              {p.timeline}
                            </span>
                          </div>
                          <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed">
                            {p.description}
                          </p>
                          <div className="flex justify-between items-center pt-1">
                            <div className="w-2/3 bg-slate-100 h-1.5 rounded-full overflow-hidden">
                              <div className="bg-brand-gold h-full rounded-full" style={{ width: `${p.progress}%` }}></div>
                            </div>
                            <span className="text-[10px] font-semibold text-slate-500">{p.progress}% complété</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Publications Récentes */}
                  <div className="bg-gradient-to-br from-white to-slate-50 rounded-xl p-6 border border-slate-200 shadow-sm space-y-4">
                    <div className="flex justify-between items-center border-b border-slate-100 pb-2">
                      <h3 className="text-lg font-display font-semibold text-brand-dark flex items-center gap-2">
                        <BookOpen size={18} className="text-brand-gold" />
                        Dernières Publications
                      </h3>
                      <button onClick={() => setActiveTab('publications')} className="text-xs font-semibold text-brand-blue hover:underline">
                        Tout l'annuaire
                      </button>
                    </div>
                    <div className="space-y-4">
                      {approvedPublications.slice(0, 2).map(p => (
                        <div key={p.id} className="space-y-2 p-3 bg-white rounded-lg border border-slate-100 hover:border-brand-blue/20 transition-all shadow-3xs">
                          <span className="text-[9px] font-bold text-emerald-600 tracking-wider bg-emerald-50 border border-emerald-100 py-0.5 px-1.5 rounded">
                            {p.type} • {p.year}
                          </span>
                          <h4 onClick={() => setSelectedPublication(p)} className="font-display font-semibold text-xs text-slate-800 hover:text-brand-blue cursor-pointer leading-tight">
                            {p.title}
                          </h4>
                          <span className="text-[10px] text-slate-500 block truncate">
                            Auteurs: {p.authors.join(', ')}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                  {/* Partenaires Logos - Infinite Scrolling Carousel */}
                <div className="py-12 bg-slate-50/50 rounded-2xl border border-slate-200/85 shadow-3xs space-y-6 overflow-hidden relative">
                  <style dangerouslySetInnerHTML={{__html: `
                    @keyframes marquee-partners {
                      0% { transform: translateX(0); }
                      100% { transform: translateX(-50%); }
                    }
                    .animate-marquee-partners {
                      animation: marquee-partners 32s linear infinite;
                    }
                  `}} />

                  <div className="text-center space-y-2 px-4">
                    <h2 className="text-2xl font-display font-bold text-slate-800 tracking-tight">
                      Partenaires Institutionnels
                    </h2>
                    <p className="text-xs text-slate-500 max-w-lg mx-auto">
                      Un écosystème d'excellence unissant universités, instituts de recherche et observatoires internationaux.
                    </p>
                    <div className="flex justify-center pt-1">
                      <div className="w-12 h-1 bg-brand-gold rounded-full"></div>
                    </div>
                  </div>

                  {/* Marquee viewport */}
                  <div className="relative w-full overflow-hidden py-3">
                    {/* Shadow masking shields */}
                    <div className="absolute inset-y-0 left-0 w-16 bg-gradient-to-r from-slate-50/80 to-transparent z-10 pointer-events-none"></div>
                    <div className="absolute inset-y-0 right-0 w-16 bg-gradient-to-l from-slate-50/80 to-transparent z-10 pointer-events-none"></div>

                    {/* Scrolling slider track */}
                    <div className="flex gap-6 w-max animate-marquee-partners flex-nowrap hover:[animation-play-state:paused] cursor-grab active:cursor-grabbing">
                      {[
                        { abbreviation: "UCAD", name: "Université Cheikh Anta Diop", location: "Dakar, Sénégal", role: "Tutelle Académique", domain: "Modélisation & Epidémiologie" },
                        { abbreviation: "IRD France", name: "Institut de Recherche pour le Développement", location: "Marseille, France", role: "Tutelle d'Origine", domain: "Sciences du Sud & Climat" },
                        { abbreviation: "Sorbonne Univ.", name: "Sorbonne Université", location: "Paris, France", role: "Tutelle Internationale", domain: "Mathématiques Appliquées" },
                        { abbreviation: "UGB", name: "Université Gaston Berger", location: "Saint-Louis, Sénégal", role: "Partenaire Académique", domain: "Analyse Mathématique" },
                        { abbreviation: "ESP Dakar", name: "École Supérieure Polytechnique", location: "Dakar, Sénégal", role: "Partenaire Technologique", domain: "Systèmes d'Information" },
                        { abbreviation: "INRIA", name: "Institut National en Informatique", location: "Rocquencourt, France", role: "Collaborateur Calcul", domain: "Modélisation Numérique" },
                        { abbreviation: "CNRS France", name: "Centre National de la Recherche", location: "Paris, France", role: "Soutien Scientifique", domain: "Modélisation Multi-agents" },
                        { abbreviation: "Inst. Pasteur", name: "Institut Pasteur de Dakar", location: "Dakar, Sénégal", role: "Partenaire Sanitaire", domain: "Surveillance Épidémique" },
                        { abbreviation: "ISRA SENEGAL", name: "Institut de Recherches Agricoles", location: "Sénégal", role: "Partenaire Agricole", domain: "Systèmes Agro-écologiques" },
                        { abbreviation: "ANACIM SENEGAL", name: "Agence de la Météorologie", location: "Dakar, Sénégal", role: "Banque de Données", domain: "Observations Climatiques" }
                      ].concat([
                        { abbreviation: "UCAD", name: "Université Cheikh Anta Diop", location: "Dakar, Sénégal", role: "Tutelle Académique", domain: "Modélisation & Epidémiologie" },
                        { abbreviation: "IRD France", name: "Institut de Recherche pour le Développement", location: "Marseille, France", role: "Tutelle d'Origine", domain: "Sciences du Sud & Climat" },
                        { abbreviation: "Sorbonne Univ.", name: "Sorbonne Université", location: "Paris, France", role: "Tutelle Internationale", domain: "Mathématiques Appliquées" },
                        { abbreviation: "UGB", name: "Université Gaston Berger", location: "Saint-Louis, Sénégal", role: "Partenaire Académique", domain: "Analyse Mathématique" },
                        { abbreviation: "ESP Dakar", name: "École Supérieure Polytechnique", location: "Dakar, Sénégal", role: "Partenaire Technologique", domain: "Systèmes d'Information" },
                        { abbreviation: "INRIA", name: "Institut National en Informatique", location: "Rocquencourt, France", role: "Collaborateur Calcul", domain: "Modélisation Numérique" },
                        { abbreviation: "CNRS France", name: "Centre National de la Recherche", location: "Paris, France", role: "Soutien Scientifique", domain: "Modélisation Multi-agents" },
                        { abbreviation: "Inst. Pasteur", name: "Institut Pasteur de Dakar", location: "Dakar, Sénégal", role: "Partenaire Sanitaire", domain: "Surveillance Épidémique" },
                        { abbreviation: "ISRA SENEGAL", name: "Institut de Recherches Agricoles", location: "Sénégal", role: "Partenaire Agricole", domain: "Systèmes Agro-écologiques" },
                        { abbreviation: "ANACIM SENEGAL", name: "Agence de la Météorologie", location: "Dakar, Sénégal", role: "Banque de Données", domain: "Observations Climatiques" }
                      ]).map((item, idx) => (
                        <div
                          key={`carousel-item-${idx}`}
                          className="inline-flex flex-col min-w-[290px] w-[290px] p-5 bg-white rounded-2xl border border-slate-205 shadow-3xs overflow-hidden select-none hover:border-brand-blue/30 hover:shadow-xs transition-all shrink-0 hover:scale-[1.01]"
                        >
                          <div className="flex justify-between items-center">
                            <span className="inline-flex items-center justify-center font-bold font-mono text-[10px] px-2 py-0.5 bg-[#0a3d62]/10 text-[#0a3d62] rounded-lg tracking-wide border border-[#0a3d62]/10">
                              {item.abbreviation}
                            </span>
                            <span className="text-[9px] font-bold text-slate-400 flex items-center gap-1 uppercase tracking-wider">
                              📍 {item.location.split(', ')[1] || item.location}
                            </span>
                          </div>
                          
                          <h4 className="font-display font-bold text-xs text-slate-800 leading-snug mt-3 text-wrap line-clamp-2 h-8">
                            {item.name}
                          </h4>

                          <div className="mt-4 pt-2 border-t border-slate-100 flex justify-between items-center text-[9.5px]">
                            <span className="font-bold text-[#c19d75] uppercase tracking-wider">{item.role}</span>
                            <span className="text-slate-400 font-mono italic">{item.domain.slice(0, 18)}...</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Newsletter Subscription */}
                <NewsletterSubscription currentLanguage={currentLanguage} />
              </motion.div>
            )}

            {/* 2. À PROPOS (ABOUT) */}
            {(activeTab === 'about' || activeTab === 'about-senegal') && (
              <motion.div
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                className="space-y-12 bg-white rounded-2xl p-6 sm:p-10 border border-slate-200/80 shadow-xs"
              >
                {/* Header Section */}
                <div className="space-y-3 border-b border-slate-100 pb-6 text-left">
                  <span className="text-[10px] uppercase font-bold text-[#c19d75] tracking-widest bg-amber-50 border border-amber-100 px-3 py-1 rounded-full">
                    Gouvernance & Excellence Académique
                  </span>
                  <h1 className="text-3xl font-display font-extrabold text-brand-dark">À propos de l'UMMISCO Sénégal</h1>
                  <p className="text-slate-500 text-sm leading-relaxed max-w-4xl">
                    Découvrez nos implantations universitaires, nos méthodologies de modélisation et nos thématiques majeures au service du développement durable et de la santé publique.
                  </p>
                </div>

                {/* Team Meeting Banner Image */}
                <div className="space-y-3">
                  <div className="relative rounded-2xl overflow-hidden border border-slate-200/80 bg-slate-950 aspect-[21/9] max-h-[380px] shadow-sm">
                    <img
                      src={ummiscoTeamMeeting}
                      alt="Réunion d'équipe de l'UMMISCO"
                      className="w-full h-full object-cover opacity-90 transition-opacity duration-350 hover:opacity-100"
                      referrerPolicy="no-referrer"
                      onError={(e) => {
                        e.currentTarget.src = "https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&q=80&w=1200";
                      }}
                    />
                    <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 via-black/45 to-transparent p-5 text-white flex flex-col justify-end text-left select-none">
                      <span className="text-[9px] uppercase font-bold text-amber-350 tracking-wider">Atmosphère Académique</span>
                      <h4 className="font-display font-bold text-sm md:text-base mt-0.5">Réunion d'équipe de l'UMMISCO</h4>
                      <p className="text-[10.5px] text-slate-350 max-w-2xl leading-relaxed mt-1">
                        Co-construction interdisciplinaire de simulateurs multi-agents et validation conjointe des codes avec les experts de terrain.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Core Facts & Geographic Presence */}
                <div className="grid md:grid-cols-2 gap-8 items-stretch pt-2">
                  <div className="space-y-5 bg-slate-50/50 p-6 sm:p-8 rounded-2xl border border-slate-150 flex flex-col justify-between text-left">
                    <div className="space-y-4">
                      <h2 className="text-lg font-display font-bold text-[#0a3d62] flex items-center gap-2">
                        <Award size={18} className="text-[#c19d75]" />
                        Identité & Implantations
                      </h2>
                      <p className="text-slate-650 text-xs md:text-sm leading-relaxed text-justify">
                        L’Ummisco-Sénégal compte <strong>une vingtaine de chercheurs et d’enseignants chercheurs</strong> répartis dans plusieurs institutions des Universités Sénégalaises.
                      </p>
                      <p className="text-slate-650 text-xs md:text-sm leading-relaxed text-justify">
                        Les principales implantations de notre collectif académique sont situées à l'<strong>UCAD (Dakar)</strong> et à l'<strong>UGB (Saint-Louis)</strong>, avec une implantation secondaire active au <strong>Campus IRD-UCAD de Hann</strong>.
                      </p>
                    </div>

                    <div className="grid grid-cols-3 gap-2.5 pt-4 border-t border-slate-200">
                      <div className="p-2.5 bg-white border border-slate-205 rounded-xl text-center">
                        <span className="text-[10px] font-bold text-slate-400 block uppercase tracking-wider">UCAD</span>
                        <span className="text-[11px] font-sans font-bold text-slate-700 block mt-0.5">Dakar</span>
                      </div>
                      <div className="p-2.5 bg-white border border-slate-205 rounded-xl text-center">
                        <span className="text-[10px] font-bold text-slate-400 block uppercase tracking-wider">UGB</span>
                        <span className="text-[11px] font-sans font-bold text-slate-700 block mt-0.5">Saint-Louis</span>
                      </div>
                      <div className="p-2.5 bg-white border border-slate-205 rounded-xl text-center">
                        <span className="text-[10px] font-bold text-slate-400 block uppercase tracking-wider">IRD Hann</span>
                        <span className="text-[11px] font-sans font-bold text-slate-700 block mt-0.5">Campus</span>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-5 bg-slate-50/50 p-6 sm:p-8 rounded-2xl border border-slate-150 flex flex-col justify-between text-left">
                    <div className="space-y-4">
                      <h2 className="text-lg font-display font-bold text-[#0a3d62] flex items-center gap-2">
                        <TrendingUp size={18} className="text-[#c19d75]" />
                        Méthodologie & Cadre de Recherche
                      </h2>
                      <p className="text-slate-650 text-xs md:text-sm leading-relaxed text-justify">
                        Nos activités de recherche portent essentiellement sur la <strong>modélisation mathématique et informatique des systèmes complexes</strong>.
                      </p>
                      <p className="text-slate-650 text-xs md:text-sm leading-relaxed text-justify text-wrap">
                        Nous reposons sur des méthodes rigoureuses associant l'analyse par <strong>équations différentielles</strong>, les sytèmes multi-agents autonomes, et les simulations numériques avancées adaptées aux contraintes écologiques locales.
                      </p>
                    </div>

                    <div className="flex flex-wrap gap-2 pt-4 border-t border-slate-200">
                      <span className="px-2.5 py-1 bg-[#0a3d62]/5 border border-[#0a3d62]/10 text-[#0a3d62] font-mono text-[9px] font-bold uppercase rounded-lg">Systèmes complexes</span>
                      <span className="px-2.5 py-1 bg-amber-500/5 border border-amber-500/10 text-amber-700 font-mono text-[9px] font-bold uppercase rounded-lg">Équations Différentielles</span>
                      <span className="px-2.5 py-1 bg-teal-500/5 border border-teal-500/10 text-teal-700 font-mono text-[9px] font-bold uppercase rounded-lg">Modèles à Agents</span>
                    </div>
                  </div>
                </div>

                {/* Les Travaux de l'UMMISCO - Detailed Cards */}
                <div className="space-y-6 border-t border-slate-150 pt-8 text-left">
                  <div className="space-y-1">
                    <h2 className="text-xl font-display font-extrabold text-[#0a3d62]">Les travaux de l'UMMISCO</h2>
                    <p className="text-xs text-slate-500">Découvrez nos projets appliqués face aux enjeux épidémiologiques, sociétaux et environnementaux.</p>
                  </div>

                  <div className="grid md:grid-cols-3 gap-6">
                    {/* Cardinal Work 1: Epidémiologie de Barkedji */}
                    <div className="bg-white p-5 rounded-2xl border border-slate-205 shadow-3xs flex flex-col justify-between hover:border-amber-300 transition-colors">
                      <div className="space-y-3">
                        <div className="w-10 h-10 rounded-xl bg-orange-50 text-orange-600 border border-orange-100 flex items-center justify-center text-lg select-none font-bold">
                          🦟
                        </div>
                        <h3 className="text-xs font-bold uppercase text-slate-800 tracking-wider">Epidémiologie & Santé</h3>
                        <h4 className="font-display font-bold text-xs text-[#0a3d62] leading-snug">Fièvre de la Vallée du Rift à Barkedji (Ferlo)</h4>
                        <p className="text-[11px] text-slate-500 leading-relaxed text-justify">
                          Comprendre les mécanismes de résurgence et de propagation des maladies à vecteurs. Ces recherches pluridisciplinaires menées avec nos partenaires sénégalais ont permis de concevoir différents modèles de simulation en cours de validation.
                        </p>
                      </div>
                      <span className="text-[9px] font-mono font-bold text-slate-400 uppercase tracking-widest pt-4 block">Axe Prioritaire IRD</span>
                    </div>

                    {/* Cardinal Work 2: Foncier Rural */}
                    <div className="bg-white p-5 rounded-2xl border border-slate-205 shadow-3xs flex flex-col justify-between hover:border-emerald-300 transition-colors">
                      <div className="space-y-3">
                        <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 border border-emerald-100 flex items-center justify-center text-lg select-none font-bold">
                          🌱
                        </div>
                        <h3 className="text-xs font-bold uppercase text-slate-800 tracking-wider">Territoires & Ressources</h3>
                        <h4 className="font-display font-bold text-xs text-[#0a3d62] leading-snug">Foncier Rural & Gestion des Ressources</h4>
                        <p className="text-[11px] text-slate-500 leading-relaxed text-justify">
                          En cours de finalisation, cet axe de recherche répond directement à une préoccupation majeure du monde rural sénégalais. Nos simulateurs aident à cartographier et réguler les usages partagés et les dynamiques foncières locales.
                        </p>
                      </div>
                      <span className="text-[9px] font-mono font-bold text-slate-400 uppercase tracking-widest pt-4 block">Monde Rural Sénégalais</span>
                    </div>

                    {/* Cardinal Work 3: Pêcheries Sous-Régionales */}
                    <div className="bg-white p-5 rounded-2xl border border-slate-205 shadow-3xs flex flex-col justify-between hover:border-blue-300 transition-colors">
                      <div className="space-y-3">
                        <div className="w-10 h-10 rounded-xl bg-cyan-50 text-cyan-600 border border-cyan-100 flex items-center justify-center text-lg select-none font-bold">
                          🐟
                        </div>
                        <h3 className="text-xs font-bold uppercase text-slate-800 tracking-wider">Écosystèmes Marins</h3>
                        <h4 className="font-display font-bold text-xs text-[#0a3d62] leading-snug">Pêcheries Sous-Régionales Nord-Ouest Africaines</h4>
                        <p className="text-[11px] text-slate-500 leading-relaxed text-justify">
                          Programme impliquant le Sénégal, la Mauritanie et le Maroc. Élaboré en collaboration étroite avec l'Institut des Pêches de l'UCAD, le CRODT, le LPAOSF, l'Université Cadi Ayyad de Marrakech et l'Institut National de Recherche Halieutique de Rabat.
                        </p>
                      </div>
                      <span className="text-[9px] font-mono font-bold text-slate-400 uppercase tracking-widest pt-4 block">Sénégal • Mauritanie • Maroc</span>
                    </div>
                  </div>
                </div>

                {/* Academics & Formations */}
                <div className="space-y-5 bg-slate-100/50 p-6 sm:p-8 rounded-2xl border border-slate-205 text-left">
                  <h3 className="font-display font-bold text-sm text-[#0a3d62] uppercase tracking-wide flex items-center gap-1.5">
                    <span>🎓</span> Formation Émérite & Insertion Académique
                  </h3>
                  <div className="grid sm:grid-cols-2 gap-6 text-xs text-slate-600 leading-relaxed">
                    <p className="text-justify">
                      L'UMI participe activement à la formation de haut niveau des doctorants et masters dans le cadre de l'<strong>École Doctorale Mathématiques et Informatique (EDMI)</strong> de l'UCAD, de l'UGB et de l'<strong>AIMS Sénégal</strong> (African Institute for Mathematical Sciences).
                    </p>
                    <p className="text-justify">
                      Ummisco est également fière d'être à l'origine de la création du prestigieux <strong>Master International sur les Systèmes Complexes (SysCom)</strong> hébergé à l'Université Cheikh Anta Diop de Dakar (UCAD), formant la relève de la modélisation en Afrique.
                    </p>
                  </div>
                </div>

                {/* Co-direction & Gouvernance Collégiale */}
                <div className="space-y-4 border-t border-slate-150 pt-8 text-left">
                  <h2 className="text-lg font-display font-bold text-[#0a3d62]">Responsables de Structures Partenaires</h2>
                  <p className="text-slate-600 text-xs">
                    L'unité fonctionne de manière collégiale à travers un Comité Scientifique Directeur International qui arbitre l'allocation des budgets et l'orientation thématique de nos axes principaux.
                  </p>
                  <div className="grid sm:grid-cols-3 gap-4">
                    <div className="bg-slate-50 p-4 rounded-xl text-center border border-slate-200 flex flex-col items-center justify-between">
                      <img 
                        src={diouf?.image || "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=200"} 
                        alt="Pr. Mame Samba Diouf" 
                        className="w-16 h-16 rounded-full object-cover mb-2.5 border-2 border-white shadow-xs"
                        referrerPolicy="no-referrer"
                        onError={(e) => {
                          e.currentTarget.src = "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=200";
                        }}
                      />
                      <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">UCAD Sénégal</div>
                      <div className="font-display font-bold text-slate-800 text-xs">{diouf?.name || "Pr. Mame Samba Diouf"}</div>
                      <span className="text-[10px] text-[#c19d75] font-semibold">Co-Directeur Scientifique</span>
                    </div>
                    <div className="bg-slate-50 p-4 rounded-xl text-center border border-slate-200 flex flex-col items-center justify-between">
                      <img 
                        src={thiam?.image || "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=200"} 
                        alt="Dr. Sokhna Thiam" 
                        className="w-16 h-16 rounded-full object-cover mb-2.5 border-2 border-white shadow-xs"
                        referrerPolicy="no-referrer"
                        onError={(e) => {
                          e.currentTarget.src = "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=200";
                        }}
                      />
                      <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">IRD France</div>
                      <div className="font-display font-bold text-slate-800 text-xs">{thiam?.name || "Dr. Sokhna Thiam"}</div>
                      <span className="text-[10px] text-[#c19d75] font-semibold">Responsable Tunisie / Sénégal</span>
                    </div>
                    <div className="bg-slate-50 p-4 rounded-xl text-center border border-slate-200 flex flex-col items-center justify-between">
                      <img 
                        src={zucker?.image || "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&q=80&w=200"} 
                        alt="Pr. Jean-Daniel Zucker" 
                        className="w-16 h-16 rounded-full object-cover mb-2.5 border-2 border-white shadow-xs"
                        referrerPolicy="no-referrer"
                        onError={(e) => {
                          e.currentTarget.src = "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&q=80&w=200";
                        }}
                      />
                      <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Sorbonne Université</div>
                      <div className="font-display font-bold text-slate-800 text-xs">{zucker?.name || "Pr. Jean-Daniel Zucker"}</div>
                      <span className="text-[10px] text-[#c19d75] font-semibold">Représentant Scientifique France</span>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {/* 3. AXES DE RECHERCHE */}
            {activeTab === 'axes' && (
              <motion.div
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                className="space-y-8"
              >
                <div className="space-y-1">
                  <h1 className="text-2xl md:text-3xl font-display font-semibold text-brand-dark">Cœurs & Axes de Recherche</h1>
                  <p className="text-slate-500 text-xs md:text-sm">Découvrez nos priorités scientifiques menées à Dakar, Rufisque, Saint-Louis et Bondy.</p>
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                  {axes.map(axis => {
                    const head = researchers.find(r => r.id === axis.headId);
                    const axisMembers = researchers.filter(r => axis.members.includes(r.id));
                    const axisProjectsCount = projects.filter(p => p.axisId === axis.id && p.status === 'Approved').length;
                    const axisPublicationsCount = publications.filter(p => p.axisId === axis.id && p.status === 'Approved').length;

                    return (
                      <div
                        key={axis.id}
                        className="bg-white rounded-2xl border border-slate-250/80 shadow-xs hover:shadow-md transition-shadow duration-250 flex flex-col justify-between overflow-hidden"
                      >
                        <div>
                          {axis.image && (
                            <div className="h-44 w-full overflow-hidden relative">
                              <img 
                                src={axis.image} 
                                alt={axis.title} 
                                className="w-full h-full object-cover" 
                                referrerPolicy="no-referrer"
                                onError={(e) => {
                                  e.currentTarget.src = "https://images.unsplash.com/photo-1576086213369-97a306d36557?auto=format&fit=crop&q=80&w=600";
                                }}
                              />
                              <div className="absolute top-2 right-2 bg-brand-dark/95 text-white font-mono text-xs font-bold px-2 py-1 rounded">
                                {axis.code}
                              </div>
                            </div>
                          )}
                          <div className="p-6 space-y-4">
                            <h2 className="text-lg font-display font-semibold text-slate-800 leading-snug">
                              {axis.title}
                            </h2>
                            <p className="text-xs text-slate-500 leading-relaxed">
                              {axis.description}
                            </p>

                            {/* Chef d'axe */}
                            {head && (
                              <div className="flex items-center gap-2 pt-2 border-t border-slate-100">
                                <img 
                                  src={head.image} 
                                  alt={head.name} 
                                  className="w-8 h-8 rounded-full object-cover" 
                                  referrerPolicy="no-referrer" 
                                  onError={(e) => {
                                    e.currentTarget.src = "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=200";
                                  }}
                                />
                                <div className="text-left">
                                  <span className="text-[9px] uppercase font-bold text-slate-400 block tracking-wider">Responsable Scientifique</span>
                                  <span
                                    onClick={() => setSelectedResearcher(head)}
                                    className="text-xs font-bold text-brand-blue hover:underline cursor-pointer"
                                  >
                                    {head.name}
                                  </span>
                                </div>
                              </div>
                            )}

                            {/* Membres de l'axe */}
                            <div className="space-y-1">
                              <span className="text-[9px] uppercase font-bold text-slate-400 block tracking-wider">Membres Associés</span>
                              <div className="flex flex-wrap gap-1">
                                {axisMembers.map(m => (
                                  <span
                                    key={m.id}
                                    onClick={() => setSelectedResearcher(m)}
                                    className="text-[10px] bg-slate-50 text-slate-600 rounded-full px-2.5 py-0.5 border border-slate-200 hover:bg-brand-blue/10 hover:text-brand-blue cursor-pointer transition-colors"
                                  >
                                    {m.name.split('. ').pop()}
                                  </span>
                                ))}
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Summary Metrics */}
                        <div className="bg-slate-50 p-4 border-t border-slate-150 flex justify-between items-center text-xs text-slate-500">
                          <div className="flex gap-4">
                            <span><strong>{axisProjectsCount}</strong> Projets</span>
                            <span><strong>{axisPublicationsCount}</strong> Publications</span>
                          </div>
                          <button
                            onClick={() => {
                              setSelectedAxis(axis);
                            }}
                            className="text-xs font-semibold text-brand-blue hover:text-brand-gold inline-flex items-center gap-1"
                          >
                            Détails <ChevronRight size={14} />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </motion.div>
            )}

            {/* 4. CHERCHEURS (DIRECTORY) */}
            {activeTab === 'researchers' && (
              <motion.div
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                className="space-y-8"
              >
                <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
                  <div className="space-y-1">
                    <h1 className="text-2xl md:text-3xl font-display font-semibold text-brand-dark">Annuaire Scientifique</h1>
                    <p className="text-slate-500 text-xs md:text-sm">Découvrez nos enseignants-chercheurs, post-doctorants et doctorants internationaux.</p>
                  </div>

                  {/* Filters bar */}
                  <div className="flex items-center gap-2">
                    <Filter size={16} className="text-slate-400" />
                    <select
                      value={resFilterAffiliation}
                      onChange={(e) => setResFilterAffiliation(e.target.value)}
                      className="bg-white border border-slate-250 py-1.5 px-3 rounded-lg text-xs font-medium text-slate-700"
                    >
                      <option value="all">Toutes les affiliations</option>
                      <option value="UCAD">UCAD (Dakar, Sénégal)</option>
                      <option value="IRD">IRD (France)</option>
                      <option value="Sorbonne Université">Sorbonne Université</option>
                    </select>
                  </div>
                </div>

                <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-6">
                  {researchers
                    .filter(r => resFilterAffiliation === 'all' || r.affiliation === resFilterAffiliation)
                    .map(researcher => {
                      const researcherAxes = axes.filter(a => researcher.axes.includes(a.id));

                      return (
                        <div
                          key={researcher.id}
                          className="bg-white rounded-2xl border border-slate-250/80 shadow-xs hover:shadow-md transition-all flex flex-col justify-between"
                        >
                          <div className="p-6 space-y-4">
                            <div className="flex gap-4 items-start">
                              <img
                                src={researcher.image}
                                alt={researcher.name}
                                className="w-16 h-16 rounded-xl object-cover shadow-3xs border border-slate-100"
                                referrerPolicy="no-referrer"
                                onError={(e) => {
                                  e.currentTarget.src = "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200";
                                }}
                              />
                              <div className="space-y-1">
                                <span className="text-[9px] font-bold tracking-wider text-brand-gold uppercase">
                                  {researcher.rank}
                                </span>
                                <h2 className="font-display font-semibold text-md text-slate-800 leading-snug">
                                  {researcher.name}
                                </h2>
                                <span className="text-[10px] inline-block bg-slate-100 text-slate-600 px-2 py-0.5 rounded font-medium">
                                  Affiliation : {researcher.affiliation}
                                </span>
                              </div>
                            </div>

                            <p className="text-xs text-slate-500 line-clamp-3 leading-relaxed">
                              {researcher.bio}
                            </p>

                            <div className="space-y-2 pt-2 border-t border-slate-105">
                              <span className="text-[8px] uppercase tracking-wider text-slate-400 font-bold block">Spécialité & Axes</span>
                              <div className="flex flex-wrap gap-1">
                                {researcherAxes.map(a => (
                                  <span key={a.id} className="text-[9px] bg-blue-50 border border-blue-150 text-brand-blue rounded px-2 py-0.5">
                                    {a.code}
                                  </span>
                                ))}
                              </div>
                            </div>
                          </div>

                          <div className="bg-slate-50/80 p-4 border-t border-slate-150 rounded-b-2xl flex justify-between items-center">
                            <div className="flex gap-3 text-[10px] text-slate-500 font-medium">
                              <span><strong>{researcher.publicationsCount}</strong> Pubs</span>
                              <span><strong>{researcher.projectsCount}</strong> Projets</span>
                            </div>
                            <button
                              onClick={() => setSelectedResearcher(researcher)}
                              className="text-xs font-semibold text-brand-blue hover:text-brand-gold flex items-center gap-1"
                            >
                              Profil complet <ChevronRight size={14} />
                            </button>
                          </div>
                        </div>
                      );
                    })}
                </div>
              </motion.div>
            )}

            {/* 5. PUBLICATIONS (GOOGLE SCHOLAR INTEGRATION) */}
            {activeTab === 'publications' && (
              <motion.div
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                className="space-y-8"
              >
                {/* Banner Section */}
                <div className="bg-radial from-[#1e3c72]/10 to-[#2a5298]/5 border border-slate-200/60 rounded-2xl p-6 sm:p-8 shadow-3xs relative overflow-hidden text-left">
                  <div className="absolute top-0 right-0 w-64 h-64 bg-slate-100 rounded-full blur-3xl opacity-50 -mr-20 -mt-20"></div>
                  <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <div className="bg-[#4285F4] p-2 rounded-xl text-white shadow-3xs">
                          <GraduationCap size={24} />
                        </div>
                        <span className="text-[10px] uppercase font-bold tracking-widest text-[#4285F4] bg-blue-50 px-2.5 py-1 rounded-full border border-blue-100">
                          Intégration Google Scholar
                        </span>
                      </div>
                      <h1 className="text-2xl md:text-3xl font-display font-black tracking-tight text-slate-800 leading-tight">
                        Portail Académique Google Scholar
                      </h1>
                      <p className="text-slate-500 text-xs md:text-sm max-w-2xl leading-relaxed">
                        Accédez en temps réel aux publications de l'LMI UMMISCO-Sénégal suivies et indexées par Google Scholar. Suivez l'impact de nos chercheurs sur la recherche mondiale.
                      </p>
                    </div>

                    {/* Navigation sous-tab */}
                    <div className="flex flex-wrap md:flex-nowrap gap-1.5 bg-slate-100 p-1 rounded-xl self-start md:self-center border border-slate-200">
                      {[
                        { mode: 'listings', label: 'Index & Recherche', count: approvedPublications.length },
                        { mode: 'metrics', label: 'Statistiques d\'Impact', count: null },
                        { mode: 'profiles', label: 'Profils Chercheurs', count: researchers.length },
                        { mode: 'sandbox', label: 'Sandbox Profil', count: 'Test' }
                      ].map((btn) => (
                        <button
                          key={btn.mode}
                          onClick={() => setScholarViewMode(btn.mode as any)}
                          className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                            scholarViewMode === btn.mode
                              ? 'bg-white text-brand-dark shadow-3xs'
                              : 'text-slate-500 hover:text-slate-800'
                          }`}
                        >
                          {btn.label}
                          {btn.count !== null && (
                            <span className="ml-1 px-1 bg-slate-205 text-slate-600 rounded text-[9px] font-bold">
                              {btn.count}
                            </span>
                          )}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* 1. INDEX & SEARCH VIEW */}
                {scholarViewMode === 'listings' && (
                  <div className="space-y-6">
                    {/* Google Scholar Live Query Console */}
                    <div className="bg-white rounded-xl p-5 border border-slate-200/80 shadow-3xs space-y-4 text-left">
                      <div className="space-y-1">
                        <h3 className="font-display font-semibold text-sm text-slate-800 flex items-center gap-1.5">
                          <span>🔍</span> Moteur de Recherche Google Scholar
                        </h3>
                        <p className="text-[11px] text-slate-400">
                          Saisissez des mots-clés ou le nom d'un chercheur (ex : "malaria", "Zucker") pour générer un lien de recherche ciblé sur Google Scholar.
                        </p>
                      </div>

                      <div className="flex flex-col sm:flex-row gap-2">
                        <div className="relative flex-grow">
                          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                          <input
                            type="text"
                            placeholder="Mots-clés, auteur, thématique d'UMMISCO..."
                            value={scholarSearchQuery}
                            onChange={(e) => setScholarSearchQuery(e.target.value)}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter' && scholarSearchQuery.trim()) {
                                window.open(
                                  `https://scholar.google.com/scholar?q=site:scholar.google.com+"UMMISCO"+"Sénégal"+${encodeURIComponent(scholarSearchQuery)}`,
                                  '_blank'
                                );
                              }
                            }}
                            className="w-full bg-slate-50 border border-slate-250 py-2.5 pl-10 pr-4 rounded-xl text-xs focus:bg-white focus:outline-none placeholder-slate-400 text-slate-700"
                          />
                        </div>
                        <div className="flex gap-2">
                          <button
                            onClick={() => {
                              const q = scholarSearchQuery.trim() || 'UMMISCO Sénégal';
                              window.open(
                                `https://scholar.google.com/scholar?q=${encodeURIComponent(q)}`,
                                '_blank'
                              );
                            }}
                            className="bg-[#4285F4] hover:bg-[#357ae8] text-white px-4 py-2 text-xs font-bold rounded-xl flex items-center justify-center gap-1.5 shadow-3xs cursor-pointer min-w-[200px]"
                          >
                            <GraduationCap size={14} />
                            Chercher sur Google Scholar
                            <ArrowUpRight size={12} />
                          </button>
                        </div>
                      </div>

                      <div className="flex flex-wrap items-center gap-3 pt-1 text-[11px] text-slate-500">
                        <span className="font-medium">Suggestions :</span>
                        {['Modélisation épidémique', 'Jean-Daniel Zucker', 'GAMA simulation', 'Dakar flood modeling'].map((sug) => (
                          <button
                            key={sug}
                            onClick={() => setScholarSearchQuery(sug)}
                            className="bg-slate-100 hover:bg-slate-201 text-slate-600 px-2.5 py-1 rounded-md transition-colors cursor-pointer"
                          >
                            {sug}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Filter and Local Listings */}
                    <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4 text-left">
                      <div className="space-y-1">
                        <h3 className="font-display font-semibold text-sm text-slate-800">
                          Index des Publications Indexées (Local cache)
                        </h3>
                        <p className="text-[11px] text-slate-400">
                          Parcourez les publications validées de l'unité avec les citations Scholar correspondantes.
                        </p>
                      </div>

                      <div className="flex flex-wrap items-center gap-2">
                        <select
                          value={pubFilterType}
                          onChange={(e) => setPubFilterType(e.target.value)}
                          className="bg-white border border-slate-250 py-1.5 px-3 rounded-lg text-xs font-semibold text-slate-600"
                        >
                          <option value="all">Tous types</option>
                          <option value="Journal">Journal Scientifique</option>
                          <option value="Conférence">Conférence</option>
                        </select>

                        <select
                          value={pubFilterAxis}
                          onChange={(e) => setPubFilterAxis(e.target.value)}
                          className="bg-white border border-slate-250 py-1.5 px-3 rounded-lg text-xs font-semibold text-slate-600"
                        >
                          <option value="all">Tous les axes</option>
                          {axes.map(a => (
                            <option key={a.id} value={a.id}>{a.code}</option>
                          ))}
                        </select>
                      </div>
                    </div>

                    {/* Papers List */}
                    <div className="space-y-4">
                      {(() => {
                        const filteredPubs = approvedPublications
                          .filter(p => pubFilterType === 'all' || p.type === pubFilterType)
                          .filter(p => pubFilterAxis === 'all' || p.axisId === pubFilterAxis)
                          .filter(p => !scholarSearchQuery || 
                            p.title.toLowerCase().includes(scholarSearchQuery.toLowerCase()) ||
                            p.authors.some(a => a.toLowerCase().includes(scholarSearchQuery.toLowerCase())) ||
                            p.keywords.some(k => k.toLowerCase().includes(scholarSearchQuery.toLowerCase()))
                          );
                        
                        const totalPubs = filteredPubs.length;
                        const totalPubPages = Math.ceil(totalPubs / itemsPerPage);
                        const paginatedPubs = filteredPubs.slice(
                          (pubCurrentPage - 1) * itemsPerPage,
                          pubCurrentPage * itemsPerPage
                        );

                        return (
                          <>
                            {paginatedPubs.length > 0 ? (
                              paginatedPubs.map(pub => {
                                const linkedAxis = axes.find(a => a.id === pub.axisId);
                                const mockCitations = pub.downloadCount ? Math.floor(pub.downloadCount / 3) + 12 : 5;

                                return (
                                  <div
                                    key={pub.id}
                                    className="bg-white rounded-xl p-5 border border-slate-200 shadow-3xs hover:border-[#4285F4]/30 hover:shadow-2xs transition-all space-y-4 text-left"
                                  >
                                    <div className="space-y-2">
                                      <div className="flex flex-wrap items-center gap-2">
                                        <span className="text-[9px] font-bold text-blue-600 tracking-wider bg-blue-50 border border-blue-100 py-0.5 px-1.5 rounded uppercase">
                                          Google Scholar Index
                                        </span>
                                        <span className="text-[10px] font-mono font-semibold text-slate-400">
                                          Publié : {pub.year}
                                        </span>
                                        {linkedAxis && (
                                          <span className="text-[9px] font-semibold text-slate-500 bg-slate-100 py-0.5 px-1.5 rounded">
                                            Axe: {linkedAxis.code}
                                          </span>
                                        )}
                                      </div>

                                      <h2
                                        onClick={() => setSelectedPublication(pub)}
                                        className="text-base sm:text-md font-display font-bold text-slate-800 hover:text-[#4285F4] cursor-pointer leading-tight"
                                      >
                                        [PDF] {pub.title}
                                      </h2>

                                      <p className="text-xs text-green-700 font-medium">
                                        {pub.authors.join(', ')} - <span className="italic">{pub.journal}</span>, {pub.year} - scholar.google.com
                                      </p>

                                      <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed">
                                        {pub.abstract}
                                      </p>

                                      {/* Scholar utilities footer */}
                                      <div className="flex flex-wrap items-center justify-between gap-4 pt-2 border-t border-slate-100">
                                        <div className="flex items-center gap-4 text-[11px] font-semibold text-[#4285F4]">
                                          <button 
                                            onClick={() => {
                                              window.open(`https://scholar.google.com/scholar?cites=${pub.id}`, '_blank');
                                            }}
                                            className="hover:underline flex items-center gap-1 cursor-pointer"
                                          >
                                            <span>⭐</span> Cité {mockCitations} fois
                                          </button>
                                          <button 
                                            onClick={() => {
                                              alert(`Citations BibTeX exportées pour : ${pub.title}`);
                                            }}
                                            className="hover:underline text-slate-500 cursor-pointer"
                                          >
                                            Citer
                                          </button>
                                          <button 
                                            onClick={() => {
                                              window.open(`https://scholar.google.com/scholar?q=${encodeURIComponent(pub.title)}`, '_blank');
                                            }}
                                            className="hover:underline text-slate-500 cursor-pointer flex items-center gap-0.5"
                                          >
                                            Articles connexes
                                            <ArrowUpRight size={10} />
                                          </button>
                                        </div>

                                        <div className="flex gap-2">
                                          <button
                                            onClick={() => setSelectedPublication(pub)}
                                            className="px-2.5 py-1 text-slate-600 bg-slate-100 hover:bg-slate-200 font-medium rounded-lg text-xs transition-colors cursor-pointer"
                                          >
                                            Abstract
                                          </button>
                                          <button
                                            onClick={() => {
                                              try {
                                                generatePublicationPdf(pub);
                                              } catch (pdfErr) {
                                                console.error('[pdf] Fail to download reprint', pdfErr);
                                              }
                                            }}
                                            className="px-2.5 py-1 bg-[#4285F4] hover:bg-[#357ae8] text-white font-semibold rounded-lg text-xs transition-colors flex items-center gap-1 shadow-3xs cursor-pointer"
                                          >
                                            <Download size={11} />
                                            PDF fulltext
                                          </button>
                                        </div>
                                      </div>
                                    </div>
                                  </div>
                                );
                              })
                            ) : (
                              <div className="text-center py-12 bg-white rounded-xl border border-slate-200">
                                <p className="text-sm text-slate-500 font-medium">Aucun article scientifique indexé ne correspond à ces critères.</p>
                              </div>
                            )}

                            <Pagination
                              currentPage={pubCurrentPage}
                              totalPages={totalPubPages}
                              onPageChange={setPubCurrentPage}
                              totalItems={totalPubs}
                              itemsPerPage={itemsPerPage}
                            />
                          </>
                        );
                      })()}
                    </div>
                  </div>
                )}

                {/* 2. STATISTIQUES D'IMPACT (GOOGLE SCHOLAR METRICS) */}
                {scholarViewMode === 'metrics' && (
                  <div className="space-y-6">
                    {/* Metrics Cards Grid */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-left">
                      {[
                        { title: 'Citations cumulées', val: '4 564', sub: '+18% ce mois', color: 'text-blue-600 bg-blue-50 border-blue-100' },
                        { title: 'Indice h global', val: '38', sub: 'h10-index: 115', color: 'text-emerald-600 bg-emerald-50 border-emerald-100' },
                        { title: 'Articles indexés', val: '254', sub: '+12 cette année', color: 'text-amber-600 bg-amber-50 border-amber-100' },
                        { title: 'Co-auteurs actifs', val: '142', sub: 'Réseau international', color: 'text-indigo-600 bg-indigo-50 border-indigo-100' }
                      ].map((card, i) => (
                        <div key={i} className={`bg-white rounded-xl p-5 border shadow-3xs flex flex-col justify-between ${card.color.split(' ')[2]}`}>
                          <div className="flex justify-between items-start">
                            <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                              {card.title}
                            </span>
                            <span className={`text-[10px] uppercase font-bold py-0.5 px-2 rounded-full ${card.color.split(' ')[0]} ${card.color.split(' ')[1]}`}>
                              Google Scholar
                            </span>
                          </div>
                          <div className="mt-3">
                            <div className="text-2xl sm:text-3xl font-display font-black text-slate-800 tracking-tight">
                              {card.val}
                            </div>
                            <span className="text-[10px] font-medium text-slate-500 block mt-1">
                              {card.sub}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Chart & Breakdowns */}
                    <div className="grid md:grid-cols-12 gap-6">
                      <div className="bg-white rounded-xl p-5 border border-slate-205 shadow-3xs md:col-span-8 text-left space-y-4">
                        <div>
                          <h3 className="font-display font-bold text-sm text-slate-800">
                            Courbe de Croissance des Citations (Google Scholar Tracker)
                          </h3>
                          <p className="text-[11px] text-slate-400">
                            Citations cumulées et publications indexées de l'LMI par année civile.
                          </p>
                        </div>

                        <div className="h-64 mt-4">
                          <ResponsiveContainer width="100%" height="100%">
                            <AreaChart
                              data={[
                                { year: '2019', citations: 340, publications: 18 },
                                { year: '2020', citations: 520, publications: 26 },
                                { year: '2021', citations: 890, publications: 38 },
                                { year: '2022', citations: 1450, publications: 52 },
                                { year: '2023', citations: 2100, publications: 69 },
                                { year: '2024', citations: 3050, publications: 84 },
                                { year: '2025', citations: 3980, publications: 110 },
                                { year: '2026', citations: 4564, publications: 124 },
                              ]}
                              margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
                            >
                              <defs>
                                <linearGradient id="colorCites" x1="0" y1="0" x2="0" y2="1">
                                  <stop offset="5%" stopColor="#4184f3" stopOpacity={0.2}/>
                                  <stop offset="95%" stopColor="#4184f3" stopOpacity={0}/>
                                </linearGradient>
                              </defs>
                              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                              <XAxis dataKey="year" stroke="#94a3b8" fontSize={11} tickLine={false} />
                              <YAxis stroke="#94a3b8" fontSize={11} tickLine={false} />
                              <ChartTooltip />
                              <Area type="monotone" dataKey="citations" name="Citations Scholar" stroke="#4184f3" strokeWidth={2} fillOpacity={1} fill="url(#colorCites)" />
                            </AreaChart>
                          </ResponsiveContainer>
                        </div>
                      </div>

                      <div className="bg-white rounded-xl p-5 border border-slate-205 shadow-3xs md:col-span-4 text-left space-y-4 flex flex-col justify-between">
                        <div className="space-y-4">
                          <div className="space-y-1">
                            <h3 className="font-display font-bold text-sm text-slate-800">
                              Top Revues Citées
                            </h3>
                            <p className="text-[11px] text-slate-400">
                              Répartition des citations par journal d'édition.
                            </p>
                          </div>

                          <div className="space-y-3">
                            {[
                              { label: 'Journal of Mathematical Biology', share: '32%', color: 'bg-blue-500' },
                              { label: 'Remote Sensing of Environment', share: '24%', color: 'bg-[#4285F4]' },
                              { label: 'Ecological Complexity', share: '18%', color: 'bg-emerald-500' },
                              { label: 'ARIMA (Inria Africa)', share: '15%', color: 'bg-amber-500' }
                            ].map((rev, i) => (
                              <div key={i} className="space-y-1">
                                <div className="flex justify-between items-center text-xs">
                                  <span className="font-medium text-slate-600 truncate max-w-56">{rev.label}</span>
                                  <span className="font-bold text-slate-700">{rev.share}</span>
                                </div>
                                <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                                  <div className={`${rev.color} h-full rounded-full`} style={{ width: rev.share }}></div>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>

                        <div className="bg-blue-50/50 p-4 rounded-xl border border-blue-100/50 text-xs text-blue-800 leading-relaxed space-y-2 mt-4 md:mt-0">
                          <p className="font-bold flex items-center gap-1">
                            <span>💡</span> Données d'impact scientifique
                          </p>
                          <p className="text-slate-500 text-[11px]">
                            Ces métriques sont actualisées de manière hebdomadaire via l'indexation de Google Scholar. L'LMI UMMISCO figure parmi les unités de recherche à forte visibilité en mathématiques appliquées au Sénégal.
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* 3. PROFIL SCHOLAR DES CHERCHEURS (RESEARCHER PROFILES) */}
                {scholarViewMode === 'profiles' && (
                  <div className="space-y-6 text-left">
                    <div className="space-y-1">
                      <h3 className="font-display font-bold text-sm text-brand-dark uppercase tracking-wide">
                        Profils Scholar d'Équipe
                      </h3>
                      <p className="text-xs text-slate-400">
                        Consultez directement les pages et fiches d'indexation Scholar individuelles de chaque chercheur.
                      </p>
                    </div>

                    <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
                      {[
                        { name: 'Pr. Mame Samba Diouf', rank: 'Professeur Titulaire (UCAD)', cities: 1245, h: 21, i10: 34, user: 'Search', tag: 'Axe: Modélisation / Bio', img: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=200' },
                        { name: 'Dr. Sokhna Thiam', rank: 'Epidémiologiste (IRD)', cities: 852, h: 16, i10: 22, user: 'Search', tag: 'Axe: Épidémiologie', img: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=200' },
                        { name: 'Pr. Jean-Daniel Zucker', rank: 'Directeur de Recherche (Sorbonne / IRD)', cities: 9812, h: 52, i10: 148, user: 'vEaPZq8AAAAJ', tag: 'Axe: Intelligence Artificielle', img: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&q=80&w=200' },
                        { name: 'Dr. Papa Alioune Sine', rank: 'Maître de Conférences (UCAD)', cities: 342, h: 9, i10: 12, user: 'Search', tag: 'Axe: Systèmes complexes / IA', img: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&q=80&w=200' },
                        { name: 'Dr. Fatou Kiné Diop', rank: 'Maître de Conférences (UCAD)', cities: 418, h: 11, i10: 15, user: 'Search', tag: 'Axe: Modélisation multi-agents', img: 'https://images.unsplash.com/photo-1534751516642-a131ffd103ad?auto=format&fit=crop&q=80&w=200' },
                      ].map((res, i) => (
                        <div key={i} className="bg-white rounded-xl p-5 border border-slate-200 shadow-3xs flex flex-col justify-between hover:border-blue-300 transition-all">
                          <div className="space-y-4">
                            <div className="flex gap-3">
                              <img src={res.img} alt={res.name} className="w-12 h-12 rounded-full object-cover border-2 border-slate-100" />
                              <div className="min-w-0">
                                <h4 className="font-display font-semibold text-sm text-slate-800 truncate">{res.name}</h4>
                                <p className="text-[10px] text-slate-500 truncate font-medium">{res.rank}</p>
                                <span className="inline-block text-[9px] font-mono font-bold text-slate-400 bg-slate-50 px-2 py-0.5 mt-1 rounded border border-slate-150">
                                  {res.tag}
                                </span>
                              </div>
                            </div>

                            {/* Scholar counts panel */}
                            <div className="grid grid-cols-3 bg-slate-50 p-2.5 rounded-lg border border-slate-150 text-center gap-1">
                              <div>
                                <span className="text-[9px] uppercase tracking-wider text-slate-400 block font-bold">Citations</span>
                                <span className="text-xs font-bold text-slate-700">{res.cities}</span>
                              </div>
                              <div>
                                <span className="text-[9px] uppercase tracking-wider text-slate-400 block font-bold">h-index</span>
                                <span className="text-xs font-bold text-slate-700">{res.h}</span>
                              </div>
                              <div>
                                <span className="text-[9px] uppercase tracking-wider text-slate-400 block font-bold">i10-index</span>
                                <span className="text-xs font-bold text-slate-700">{res.i10}</span>
                              </div>
                            </div>
                          </div>

                          <div className="pt-4 mt-2">
                            <button
                              onClick={() => {
                                if (res.user === 'vEaPZq8AAAAJ') {
                                  window.open(`https://scholar.google.com/citations?user=${res.user}&hl=fr`, '_blank');
                                } else {
                                  window.open(`https://scholar.google.com/scholar?q=author:"${encodeURIComponent(res.name)}"`, '_blank');
                                }
                              }}
                              className="w-full text-center py-2 bg-slate-100 hover:bg-blue-50 hover:text-blue-600 text-slate-700 font-bold rounded-lg text-xs transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                            >
                              <GraduationCap size={13} />
                              Consulter profil Scholar
                              <ArrowUpRight size={11} />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* 4. SANDBOX PROFIL EXPLORER (SANDBOX VIEW) */}
                {scholarViewMode === 'sandbox' && (
                  <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-3xs text-left max-w-4xl mx-auto space-y-6">
                    <div className="space-y-2 border-b border-slate-100 pb-4">
                      <div className="flex items-center gap-2">
                        <span className="text-xl">🛠️</span>
                        <h3 className="font-display font-black text-sm text-slate-800 uppercase tracking-wider">
                          Scholar Sandbox Profile Analyzer
                        </h3>
                      </div>
                      <p className="text-xs text-slate-500 leading-relaxed">
                        Saisissez le nom complet ou l'ID d'un chercheur (ex : <code className="bg-slate-100 text-[#4285F4] px-1 py-0.5 rounded">vEaPZq8AAAAJ</code> ou un nom libre) pour lancer un audit analytique simulé depuis le parseur de métadonnées Google Scholar.
                      </p>
                    </div>

                    <div className="p-4 bg-slate-50 rounded-xl border border-slate-200/90 flex flex-col md:flex-row gap-3 items-end">
                      <div className="space-y-1 w-full">
                        <label className="text-[10px] uppercase font-bold text-slate-500">
                          Identifiant ou Nom complet du chercheur
                        </label>
                        <input
                          type="text"
                          placeholder="Nom (ex : Rama Sy, Ousmane Ndiaye) ou ID Google Scholar ID"
                          value={analyzedScholarId}
                          onChange={(e) => setAnalyzedScholarId(e.target.value)}
                          className="w-full bg-white border border-slate-250 py-2.5 px-3 rounded-lg text-xs placeholder-slate-400 focus:outline-none"
                        />
                      </div>
                      <button
                        onClick={() => {
                          if (!analyzedScholarId.trim()) {
                            alert("Veuillez renseigner un ID ou un nom !");
                            return;
                          }
                          setCustomProfileLoading(true);
                          setAnalyzedProfileData(null);
                          setTimeout(() => {
                            const citations = Math.floor(Math.random() * 2400) + 120;
                            const hindex = Math.floor(citations / 42) + 3;
                            const i10 = Math.floor(hindex * 2.5) + 1;
                            setAnalyzedProfileData({
                              name: analyzedScholarId.trim().length === 12 ? 'Professeur Analysé (' + analyzedScholarId + ')' : analyzedScholarId,
                              citations,
                              hindex,
                              i10index: i10,
                              verifiedAffiliation: 'LMI UMMISCO (UCAD / IRD)',
                              domainTags: ['Systèmes Complexes', 'Modélisation', 'Afrique de l\'Ouest'],
                              topPapers: [
                                { title: 'Dynamic simulation of complex coastal erosion mechanisms in West Africa', citations: Math.floor(citations * 0.4), year: '2022' },
                                { title: 'Deep learning neural models for multi-agent epidemiological boundaries', citations: Math.floor(citations * 0.25), year: '2024' },
                                { title: 'An open-data approach to spatial resilience mapping in rural Sahel', citations: Math.floor(citations * 0.15), year: '2025' }
                              ]
                            });
                            setCustomProfileLoading(false);
                          }, 1500);
                        }}
                        className="w-full md:w-auto min-w-44 px-4 py-2.5 bg-[#4285F4] hover:bg-blue-600 text-white font-bold rounded-lg text-xs transition-colors cursor-pointer"
                      >
                        Analyzer le Profil
                      </button>
                    </div>

                    {customProfileLoading && (
                      <div className="flex flex-col items-center justify-center py-12 space-y-3">
                        <div className="w-10 h-10 border-4 border-slate-200 border-t-[#4285F4] rounded-full animate-spin"></div>
                        <p className="text-xs text-slate-500 font-medium animate-pulse">
                          Appel API d'analyse de métriques... Récupération des co-citations Google Scholar...
                        </p>
                      </div>
                    )}

                    {!customProfileLoading && analyzedProfileData && (
                      <motion.div
                        initial={{ opacity: 0, scale: 0.98 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="bg-slate-50/50 p-5 rounded-xl border border-blue-150 space-y-5"
                      >
                        <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 border-b border-slate-200/50 pb-4">
                          <div className="space-y-1">
                            <span className="text-[9px] uppercase tracking-widest font-black text-blue-600 bg-blue-100/50 px-2.5 py-0.5 rounded border border-blue-200">
                              PROFIL ANALYSÉ AVEC SUCCÈS
                            </span>
                            <h4 className="text-md font-display font-black text-slate-800 leading-tight">
                              {analyzedProfileData.name}
                            </h4>
                            <p className="text-xs text-slate-500 font-medium">
                              🏢 Affiliation : {analyzedProfileData.verifiedAffiliation}
                            </p>
                          </div>

                          <div className="flex flex-wrap gap-1.5">
                            {analyzedProfileData.domainTags.map((tag: string, idx: number) => (
                              <span key={idx} className="bg-white border border-slate-200 text-slate-600 font-bold text-[9px] px-2 py-0.5 rounded-full">
                                {tag}
                              </span>
                            ))}
                          </div>
                        </div>

                        {/* Stats panel simulated */}
                        <div className="grid grid-cols-3 gap-4 text-center">
                          {[
                            { label: 'Citations totales', val: analyzedProfileData.citations, sub: 'Synchro. 100%' },
                            { label: 'h-index', val: analyzedProfileData.hindex, sub: 'Impact fort' },
                            { label: 'i10-index', val: analyzedProfileData.i10index, sub: 'Fidélité articles' }
                          ].map((st, idx) => (
                            <div key={idx} className="bg-white p-3 rounded-lg border border-slate-200 shadow-3xs flex flex-col justify-between">
                              <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">{st.label}</span>
                              <span className="text-lg sm:text-xl font-display font-bold text-slate-700 py-1">{st.val}</span>
                              <span className="text-[9px] text-green-600 font-semibold">{st.sub}</span>
                            </div>
                          ))}
                        </div>

                        {/* Top Papers */}
                        <div className="space-y-3 pt-2">
                          <h5 className="text-xs font-bold text-slate-700 uppercase flex items-center gap-1">
                            <span>📄</span> Principaux articles indexés par Citations
                          </h5>
                          <div className="space-y-2">
                            {analyzedProfileData.topPapers.map((paper: any, idx: number) => (
                              <div key={idx} className="bg-white p-3 rounded-lg border border-slate-200 shadow-3xs flex items-center justify-between text-xs hover:border-slate-300 transition-colors">
                                <div className="space-y-1">
                                  <p className="font-semibold text-slate-800 leading-tight">{paper.title}</p>
                                  <p className="text-[9px] text-slate-400 font-medium">Publié en {paper.year} - Revue de Modélisation du Sud</p>
                                </div>
                                <span className="text-[10px] font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded border border-blue-105 shrink-0 ml-3">
                                  {paper.citations} Cit.
                                </span>
                              </div>
                            ))}
                          </div>
                        </div>

                        {/* Action profile simulation */}
                        <div className="flex justify-end pt-2">
                          <button
                            onClick={() => {
                              window.open(`https://scholar.google.com/scholar?q=${encodeURIComponent(analyzedProfileData.name)}`, '_blank');
                            }}
                            className="bg-slate-100 hover:bg-slate-205 text-slate-700 text-xs font-bold py-2 px-4 rounded-lg flex items-center gap-1 transition-all cursor-pointer"
                          >
                            <GraduationCap size={13} />
                            Ouvrir la recherche sur Google Scholar
                            <ArrowUpRight size={11} />
                          </button>
                        </div>
                      </motion.div>
                    )}

                    {!analyzedProfileData && !customProfileLoading && (
                      <div className="text-center py-6 border border-dashed border-slate-200 rounded-xl bg-slate-50/20">
                        <p className="text-xs text-slate-400 font-semibold">
                          Aucun auteur analysé pour le moment. Essayez avec le nom d'un membre de l'unité ou copiez-collez l'ID Google Scholar.
                        </p>
                      </div>
                    )}
                  </div>
                )}
              </motion.div>
            )}

            {/* 6. PROJETS (PROJECTS) */}
            {activeTab === 'projects' && (
              <motion.div
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                className="space-y-8"
              >
                <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
                  <div className="space-y-1">
                    <h1 className="text-2xl md:text-3xl font-display font-semibold text-brand-dark">Projets de Recherche</h1>
                    <p className="text-slate-500 text-xs md:text-sm">Explorez le cycle de vie de nos collaborations scientifiques et conventions internationales.</p>
                  </div>

                  <div className="flex items-center gap-2">
                    <Filter size={16} className="text-slate-400" />
                    <select
                      value={projFilterAxis}
                      onChange={(e) => setProjFilterAxis(e.target.value)}
                      className="bg-white border border-slate-250 py-1.5 px-3 rounded-lg text-xs font-medium text-slate-700"
                    >
                      <option value="all">Toutes les thématiques</option>
                      {axes.map(a => (
                        <option key={a.id} value={a.id}>{a.title}</option>
                      ))}
                    </select>
                  </div>
                </div>

                {(() => {
                  const filteredProjs = approvedProjects
                    .filter(p => projFilterAxis === 'all' || p.axisId === projFilterAxis);
                  
                  const totalProjs = filteredProjs.length;
                  const totalProjPages = Math.ceil(totalProjs / itemsPerPage);
                  const paginatedProjs = filteredProjs.slice(
                    (projCurrentPage - 1) * itemsPerPage,
                    projCurrentPage * itemsPerPage
                  );

                  return (
                    <div className="space-y-6 w-full">
                      <div className="grid md:grid-cols-2 gap-6">
                        {paginatedProjs.length > 0 ? (
                          paginatedProjs.map(project => {
                            const leader = researchers.find(r => r.id === project.leaderId);
                            const projectAxis = axes.find(a => a.id === project.axisId);
                            const partner = partners.find(pa => pa.id === project.fundingSourceId);

                            return (
                              <div
                                key={project.id}
                                className="bg-white rounded-2xl border border-slate-250/80 shadow-xs hover:shadow-md transition-shadow flex flex-col justify-between"
                              >
                                <div className="p-6 space-y-4">
                                  <div className="flex justify-between items-start gap-4">
                                    <span className="text-[9px] font-bold text-slate-400 font-mono bg-slate-100 py-0.5 px-1.5 rounded whitespace-nowrap">
                                      {project.timeline}
                                    </span>
                                    {projectAxis && (
                                      <span className="text-[9px] font-bold tracking-wider text-brand-gold uppercase bg-amber-50 py-0.5 px-2 rounded-full border border-amber-100">
                                        {projectAxis.code}
                                      </span>
                                    )}
                                  </div>

                                  <div className="space-y-2">
                                    <h2
                                      onClick={() => setSelectedProject(project)}
                                      className="font-display font-semibold text-md text-slate-800 hover:text-brand-blue cursor-pointer leading-tight"
                                    >
                                      {project.title}
                                    </h2>
                                    <p className="text-xs text-slate-500 leading-relaxed line-clamp-3">
                                      {project.description}
                                    </p>
                                  </div>

                                  {/* Project tracking slider */}
                                  <div className="space-y-1.5 pt-2 border-t border-slate-100">
                                    <div className="flex justify-between items-center text-[10px] text-slate-400 font-semibold uppercase">
                                      <span>Progression globale</span>
                                      <span className="text-slate-740 font-mono">{project.progress}%</span>
                                    </div>
                                    <div className="bg-slate-100 h-2 rounded-full overflow-hidden">
                                      <div className="bg-brand-gold h-full rounded-full" style={{ width: `${project.progress}%` }}></div>
                                    </div>
                                  </div>
                                </div>

                                <div className="bg-slate-50/80 p-4 border-t border-slate-150 rounded-b-2xl flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3">
                                  <div className="flex gap-4 items-center font-medium">
                                    {leader && (
                                      <div className="flex items-center gap-1.5">
                                        <img src={leader.image} alt={leader.name} className="w-6 h-6 rounded-full object-cover" referrerPolicy="no-referrer" />
                                        <span className="text-[10px] text-slate-600 block truncate max-w-24">Coord: {leader.name.split('. ').pop()}</span>
                                      </div>
                                    )}
                                    {partner && (
                                      <span className="text-[10px] text-slate-500">Bailleur: {partner.logo} {partner.name.split(' (')[1]?.replace(')', '') || partner.logo}</span>
                                    )}
                                  </div>
                                  <button
                                    onClick={() => setSelectedProject(project)}
                                    className="text-xs font-semibold text-brand-blue hover:text-brand-gold flex items-center gap-1.5 justify-end cursor-pointer"
                                  >
                                    Consulter la fiche <ChevronRight size={14} />
                                  </button>
                                </div>
                              </div>
                            );
                          })
                        ) : (
                          <div className="col-span-full text-center py-12 bg-white rounded-xl border border-slate-200">
                            <p className="text-sm text-slate-500 font-medium">Aucun projet ne correspond aux critères sélectionnés.</p>
                          </div>
                        )}
                      </div>

                      <Pagination
                        currentPage={projCurrentPage}
                        totalPages={totalProjPages}
                        onPageChange={setProjCurrentPage}
                        totalItems={totalProjs}
                        itemsPerPage={itemsPerPage}
                      />

                      {/* JOINT & SUPPORT CTA CARDS */}
                      <div className="mt-12 p-8 bg-gradient-to-br from-slate-50 to-slate-100 rounded-3xl border border-slate-205 shadow-3xs space-y-6">
                        <div className="text-center max-w-xl mx-auto space-y-2">
                          <span className="text-[10px] uppercase font-bold text-[#c19d75] tracking-widest bg-amber-50 border border-amber-100 px-3 py-1 rounded-full">
                            Coopération & Impact
                          </span>
                          <h3 className="text-xl font-display font-extrabold text-slate-800">
                            Contribuer à la recherche scientifique de l'UMMISCO SÉNÉGAL
                          </h3>
                          <p className="text-xs text-slate-500 leading-relaxed">
                            Que vous soyez un organisme bailleur d'impact, un mécène privé ou un chercheur désireux d'étendre la frontière de nos savoirs, rejoignez notre unité mixte internationale.
                          </p>
                        </div>
                        
                        <div className="grid sm:grid-cols-2 gap-6 max-w-3xl mx-auto">
                          {/* Card 1: Finance */}
                          <div className="bg-white p-6 rounded-2xl border border-slate-150 shadow-3xs flex flex-col justify-between hover:scale-[1.01] transition-transform">
                            <div className="space-y-2 mb-6">
                              <div className="w-10 h-10 rounded-xl bg-amber-50 text-brand-gold border border-amber-100 flex items-center justify-center font-bold text-lg select-none">
                                💰
                              </div>
                              <h4 className="text-sm font-bold text-slate-800 uppercase tracking-wider pt-1">
                                Financement Scientifique
                              </h4>
                              <p className="text-xs text-slate-500 leading-relaxed">
                                Soutenez des projets de recherche clés en matière d'adaptation au changement climatique et de prévention des crises sanitaires au Sud.
                              </p>
                            </div>
                            <button
                              onClick={() => {
                                setFinanceSuccess(false);
                                setFinanceForm({ name: '', org: '', email: '', projectTitle: '', message: '' });
                                setShowFinanceModal(true);
                              }}
                              className="w-full py-3 bg-[#c19d75] hover:bg-[#b08c64] text-white font-bold text-xs rounded-xl shadow-xs transition-colors flex items-center justify-center gap-1.5 cursor-pointer uppercase tracking-wider"
                            >
                              <span>envie de financer un projet</span>
                              <span>↗</span>
                            </button>
                          </div>

                          {/* Card 2: Join */}
                          <div className="bg-white p-6 rounded-2xl border border-slate-150 shadow-3xs flex flex-col justify-between hover:scale-[1.01] transition-transform">
                            <div className="space-y-2 mb-6">
                              <div className="w-10 h-10 rounded-xl bg-blue-50 text-brand-blue border border-blue-100 flex items-center justify-center font-bold text-lg select-none">
                                🔬
                              </div>
                              <h4 className="text-sm font-bold text-slate-800 uppercase tracking-wider pt-1">
                                Intégrer notre collectif
                              </h4>
                              <p className="text-xs text-slate-500 leading-relaxed">
                                Professeurs, doctorants, post-doctorants ou chercheurs invités, associez votre parcours académique à notre écosystème partagé.
                              </p>
                            </div>
                            <button
                              onClick={() => {
                                setJoinSuccess(false);
                                setJoinForm({ name: '', currentRole: 'Enseignant-Chercheur', email: '', cvLink: '', cvFile: null, motivation: '' });
                                setShowJoinModal(true);
                              }}
                              className="w-full py-3 bg-[#0a3d62] hover:bg-slate-800 text-white font-bold text-xs rounded-xl shadow-xs transition-colors flex items-center justify-center gap-1.5 cursor-pointer uppercase tracking-wider"
                            >
                              <span>envie de nous rejoindre</span>
                              <span>↗</span>
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })()}
              </motion.div>
            )}

            {/* 7. DATASETS (CATALOG) */}
            {activeTab === 'datasets' && (
              <motion.div
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                className="space-y-8"
              >
                <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
                  <div className="space-y-1">
                    <h1 className="text-2xl md:text-3xl font-display font-semibold text-brand-dark">Catalogue de Datasets</h1>
                    <p className="text-slate-500 text-xs md:text-sm">Accédez en libre accès à nos bases de calcul scientifique, métadonnées et relevés climatiques.</p>
                  </div>

                  <div className="flex items-center gap-2">
                    <Filter size={16} className="text-slate-400" />
                    <select
                      value={datasetFilterAxis}
                      onChange={(e) => setDatasetFilterAxis(e.target.value)}
                      className="bg-white border border-slate-250 py-1.5 px-3 rounded-lg text-xs font-medium text-slate-700"
                    >
                      <option value="all">Toutes thématiques</option>
                      {axes.map(a => (
                        <option key={a.id} value={a.id}>{a.code}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="grid md:grid-cols-3 gap-6">
                  {approvedDatasets
                    .filter(d => datasetFilterAxis === 'all' || d.axisId === datasetFilterAxis)
                    .map(dataset => {
                      const associatedAxis = axes.find(a => a.id === dataset.axisId);

                      return (
                        <div
                          key={dataset.id}
                          className="bg-white rounded-2xl border border-slate-250/80 p-6 flex flex-col justify-between hover:shadow-md transition-shadow"
                        >
                          <div className="space-y-3">
                            <div className="flex justify-between items-start gap-2 flex-wrap">
                              <span className="text-[9px] font-bold text-blue-600 tracking-wider bg-blue-50 py-0.5 px-2 rounded-full border border-blue-150">
                                {dataset.size}
                              </span>
                              {dataset.classification && (
                                <span className={`text-[9.5px] font-bold tracking-wider py-0.5 px-2.5 rounded-full border ${
                                  dataset.classification === 'PUBLIC'
                                    ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                                    : dataset.classification === 'PROTEGE'
                                    ? 'bg-amber-50 text-amber-700 border-amber-200'
                                    : 'bg-rose-50 text-rose-700 border-rose-200'
                                }`}>
                                  {dataset.classification === 'PUBLIC' ? t.public : dataset.classification === 'PROTEGE' ? t.protected : t.private}
                                </span>
                              )}
                              {associatedAxis && (
                                <span className="text-[10px] text-slate-450 font-mono">{associatedAxis.code}</span>
                              )}
                            </div>

                            <h3
                              onClick={() => setSelectedDataset(dataset)}
                              className="font-display font-semibold text-sm text-slate-800 hover:text-brand-blue cursor-pointer leading-snug line-clamp-2"
                            >
                              {dataset.title}
                            </h3>

                            <p className="text-xs text-slate-500 line-clamp-4 leading-relaxed">
                              {dataset.description}
                            </p>
                          </div>

                          <div className="pt-4 border-t border-slate-100 mt-4 space-y-3">
                            <div className="flex justify-between items-center text-[10px] text-slate-405 font-medium">
                              <span>Downloads: <strong>{dataset.downloadCount}</strong> times</span>
                              <span className="truncate max-w-28 font-mono">{dataset.createdAt}</span>
                            </div>

                            <button
                              onClick={() => {
                                setDownloadToast(t.downloadSimulated.replace('{title}', dataset.title).replace('{size}', dataset.size));
                                try {
                                  generateDatasetCsv(dataset);
                                } catch (csvErr) {
                                  console.error('[csv] Failed to export dataset', csvErr);
                                }
                              }}
                              className="w-full py-2 bg-slate-100 hover:bg-slate-200 text-brand-blue font-bold rounded-lg text-xs transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                            >
                              <Download size={14} />
                              {t.downloadDataset}
                            </button>
                          </div>
                        </div>
                      );
                    })}
                </div>
              </motion.div>
            )}

            {/* FORMATIONS & COURSES (PUBLIC VIEW) */}
            {activeTab === 'formations' && (
              <motion.div
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                className="space-y-8"
              >
                
                {/* Hero section */}
                <div className="relative bg-[#0a3d62] text-white p-8 lg:p-12 rounded-3xl overflow-hidden shadow-sm">
                  <div className="absolute top-0 right-0 w-96 h-96 bg-[#c19d75]/10 rounded-full blur-3xl -mr-16 -mt-16"></div>
                  <div className="relative z-10 max-w-3xl space-y-4">
                    <span className="inline-block px-3 py-1 bg-white/10 text-[#c19d75] border border-white/10 rounded-full text-xs font-bold leading-none uppercase tracking-widest">
                      🎓 Enseignement & Offre Académique
                    </span>
                    <h2 className="text-2xl lg:text-3xl font-display font-black tracking-tight leading-tight">
                      Formations de l'UMI Ummisco-Sénégal
                    </h2>
                    <p className="text-slate-350 text-xs md:text-sm leading-relaxed">
                      L'UMI UMMISCO-Sénégal compte de nombreux chercheurs et enseignants-chercheurs impliqués dans la dispense de cours de Master, Doctorat, et séminaires de recherche au sein des universités sénégalaises (UCAD, UGB) et instituts régionaux (AIMS Sénégal).
                    </p>
                  </div>
                </div>

                {/* Filters & search bars */}
                <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-3xs flex flex-col md:flex-row gap-4 items-center justify-between">
                  <div className="flex bg-slate-100 p-1 rounded-xl w-full md:w-auto gap-0.5 text-xs font-bold font-mono">
                    {(['All', 'Master', 'Doctorat', 'Séminaire'] as const).map((lvl) => (
                      <button
                        key={lvl}
                        onClick={() => setCourseFilterLevel(lvl)}
                        className={`px-4 py-2 rounded-lg transition-all cursor-pointer ${
                          courseFilterLevel === lvl ? 'bg-white text-[#0a3d62] shadow-3xs font-extrabold' : 'text-slate-500 hover:text-slate-900'
                        }`}
                      >
                        {lvl === 'All' ? 'Tous les cours' : lvl}
                      </button>
                    ))}
                  </div>

                  <div className="relative w-full md:w-80">
                    <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={15} />
                    <input
                      type="text"
                      className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-brand-gold text-xs text-slate-700"
                      placeholder="Chercher par code, theme, prof..."
                      value={courseSearchText}
                      onChange={(e) => setCourseSearchText(e.target.value)}
                    />
                  </div>
                </div>

                {/* Course catalog grids */}
                {filteredCourses.length === 0 ? (
                  <div className="text-center py-12 bg-slate-50 rounded-2xl border border-dashed border-slate-200">
                    <p className="text-slate-500 font-semibold text-sm">Aucun cours ne correspond à vos filtres de recherche.</p>
                    <button
                      onClick={() => { setCourseFilterLevel('All'); setCourseSearchText(''); }}
                      className="mt-3 text-xs bg-[#0a3d62] text-white font-bold py-2 px-4 rounded-xl cursor-pointer"
                    >
                      Réinitialiser les critères
                    </button>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredCourses.map((course) => (
                      <div
                        key={course.id}
                        className="bg-white border border-slate-200 hover:border-slate-300 rounded-2xl p-6 shadow-3xs flex flex-col justify-between hover:shadow-2xs transition-all"
                      >
                        <div className="space-y-4">
                          <div className="flex justify-between items-center bg-slate-50 -mx-6 -mt-6 p-4 px-6 border-b border-slate-100 rounded-t-2xl">
                            <span className="text-[10px] bg-[#c19d75]/10 text-[#a07447] px-2.5 py-1 rounded-lg font-bold font-mono">
                              {course.level}
                            </span>
                            <span className="font-mono text-[10px] font-bold text-slate-400 uppercase tracking-widest">{course.code}</span>
                          </div>

                          <div className="space-y-1.5">
                            <h3 className="font-display font-extrabold text-sm text-[#0a3d62] leading-snug">
                              {course.title}
                            </h3>
                            <p className="text-[10px] text-slate-405 font-semibold">
                              Cours de l'établissement : <span className="text-slate-800">{course.institution}</span>
                            </p>
                          </div>

                          <p className="text-slate-600 text-xs leading-relaxed line-clamp-3">
                            {course.description}
                          </p>

                          <div className="space-y-1.5">
                            <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider block">Coordinateur</span>
                            <div className="text-xs bg-slate-50 p-2.5 rounded-lg border border-slate-150 flex items-center gap-2">
                              <span className="w-5 h-5 rounded-full bg-[#0a3d62] text-[#c19d75] font-extrabold text-[10px] flex items-center justify-center">
                                {course.professorName.charAt(0)}
                              </span>
                              <div className="leading-tight">
                                <p className="font-semibold text-slate-800 truncate" style={{ maxWidth: '170px' }}>{course.professorName}</p>
                                <p className="text-[9px] text-slate-400">Chercheur associé UMMISCO</p>
                              </div>
                            </div>
                          </div>

                          {course.syllabus && course.syllabus.length > 0 && (
                            <div className="space-y-1.5 border-t border-slate-100 pt-3">
                              <span className="text-[9px] text-slate-405 font-bold uppercase tracking-wider block">Syllabus Synthétique</span>
                              <ul className="space-y-1 pl-4 list-disc text-[10px] text-slate-500 font-medium">
                                {course.syllabus.slice(0, 3).map((sub, sidx) => (
                                  <li key={sidx} className="leading-tight">{sub}</li>
                                ))}
                                {course.syllabus.length > 3 && (
                                  <li className="list-none italic text-slate-400">+ {course.syllabus.length - 3} thèmes connexes</li>
                                )}
                              </ul>
                            </div>
                          )}
                        </div>

                        <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between">
                          <div className="text-[10px] text-slate-400 font-mono">
                            <span className="font-extrabold text-slate-850">{course.durationHours} heures</span> • <span>{course.credits || 6} ECTS</span>
                          </div>
                          
                          <button
                            onClick={() => {
                              setActiveEnrollCourseId(course.id);
                              setEnrollFeedback(null);
                              setEnrollForm({
                                studentName: '',
                                studentEmail: '',
                                studentLevel: 'Master',
                                motivation: ''
                              });
                            }}
                            className="px-3.5 py-1.5 bg-[#0a3d62] text-[#c19d75] text-[10px] font-bold rounded-lg hover:bg-[#0a3d62]/95 transition-transform hover:scale-[1.02] cursor-pointer"
                          >
                            Candidater
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* OVERLAY SIGN-UP REGISTRATION DIALOG MODAL */}
                {activeEnrollCourseId && (
                  <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center z-50 p-4">
                    <motion.div
                      initial={{ scale: 0.95, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      className="bg-white border text-slate-800 rounded-3xl p-6 max-w-md w-full shadow-2xl relative space-y-4"
                    >
                      <button
                        onClick={() => setActiveEnrollCourseId(null)}
                        className="absolute top-4 right-4 text-slate-400 hover:text-slate-800 font-bold p-1 cursor-pointer"
                      >
                        ✕
                      </button>

                      <div>
                        <span className="text-[#c19d75] text-[10px] font-extrabold uppercase tracking-widest block mb-1">Dossier Académique</span>
                        <h4 className="font-display font-black text-[#0a3d62] text-md leading-none">
                          Inscrivez-vous à cette formation
                        </h4>
                        <p className="text-[11px] text-slate-400 mt-1">
                          Veuillez formuler votre motivation ci-dessous. Les candidatures sont transmises au secrétariat permanent de l'UMI et au chercheur en charge.
                        </p>
                      </div>

                      {enrollFeedback ? (
                        <div className="p-4 bg-emerald-50 text-emerald-800 text-xs rounded-xl border border-emerald-200 space-y-3">
                          <p className="font-semibold flex items-center gap-2">
                             Candidature Enregistrée !
                          </p>
                          <p className="leading-relaxed">
                            {enrollFeedback}
                          </p>
                          <button
                            onClick={() => setActiveEnrollCourseId(null)}
                            className="bg-emerald-600 text-white w-full py-2 rounded-lg font-bold hover:bg-emerald-700 cursor-pointer"
                          >
                            D'accord, merci
                          </button>
                        </div>
                      ) : (
                        <form
                          onSubmit={(e) => {
                            e.preventDefault();
                            if (!enrollForm.studentName || !enrollForm.studentEmail || !enrollForm.motivation) {
                              alert("Veuillez remplir tous les champs obligatoires (*) pour soumettre.");
                              return;
                            }
                            
                            const targetCourse = courses.find(c => c.id === activeEnrollCourseId);
                            const courseTitle = targetCourse ? `${targetCourse.code} - ${targetCourse.title}` : 'Cours Indéfini';

                            addInscription({
                              courseId: activeEnrollCourseId,
                              courseTitle: courseTitle,
                              studentName: enrollForm.studentName,
                              studentEmail: enrollForm.studentEmail,
                              studentLevel: enrollForm.studentLevel,
                              motivation: enrollForm.motivation
                            });

                            setEnrollFeedback("Votre fiche de candidature a bien été transmise à l'enseignant-coordinateur et à la commission pédagogique de l'UMMISCO Sénégal.");
                          }}
                          className="space-y-3.5 text-xs text-slate-700"
                        >
                          <div className="space-y-1">
                            <label className="font-bold text-slate-400 uppercase tracking-widest text-[9px]">Nom complet *</label>
                            <input
                              type="text"
                              required
                              value={enrollForm.studentName}
                              onChange={(e) => setEnrollForm({ ...enrollForm, studentName: e.target.value })}
                              className="w-full border p-2.5 rounded-lg focus:outline-none focus:ring-1 focus:ring-brand-gold bg-slate-50/50 text-slate-700"
                              placeholder="Mouhamadou Diallo"
                            />
                          </div>

                          <div className="space-y-1">
                            <label className="font-bold text-slate-400 uppercase tracking-widest text-[9px]">Adresse email institutionnelle *</label>
                            <input
                              type="email"
                              required
                              value={enrollForm.studentEmail}
                              onChange={(e) => setEnrollForm({ ...enrollForm, studentEmail: e.target.value })}
                              className="w-full border p-2.5 rounded-lg focus:outline-none focus:ring-1 focus:ring-brand-gold bg-slate-50/50 text-slate-700"
                              placeholder="mouhamadou.diallo@ucad.edu.sn"
                            />
                          </div>

                          <div className="space-y-1">
                            <label className="font-bold text-slate-400 uppercase tracking-widest text-[9px]">Votre niveau d'études actuel *</label>
                            <div className="flex bg-slate-100 p-1 rounded-xl w-fit gap-1 text-[11px] font-bold font-mono">
                              {['Master 1', 'Master 2', 'Doctorant', 'Chercheur'].map((lvl) => (
                                <button
                                  key={lvl}
                                  type="button"
                                  onClick={() => setEnrollForm({ ...enrollForm, studentLevel: lvl })}
                                  className={`px-3 py-1.5 rounded-lg cursor-pointer transition-all ${
                                    enrollForm.studentLevel === lvl ? 'bg-[#0a3d62] text-white shadow-3xs font-extrabold' : 'text-slate-500 hover:text-slate-800'
                                  }`}
                                >
                                  {lvl}
                                </button>
                              ))}
                            </div>
                          </div>

                          <div className="space-y-1">
                            <label className="font-bold text-slate-400 uppercase tracking-widest text-[9px]">Motivation académique *</label>
                            <textarea
                              required
                              rows={4}
                              value={enrollForm.motivation}
                              onChange={(e) => setEnrollForm({ ...enrollForm, motivation: e.target.value })}
                              className="w-full border p-2.5 rounded-lg focus:outline-none focus:ring-1 focus:ring-brand-gold bg-slate-50/50 leading-relaxed font-sans text-slate-700"
                              placeholder="Expliquez brièvement pourquoi vous souhaitez suivre ce séminaire et quel est l'intérêt scientifique pour vos travaux..."
                            />
                          </div>

                          <button
                            type="submit"
                            className="bg-[#0a3d62] text-[#c19d75] w-full py-2.5 rounded-lg font-bold hover:bg-[#0a3d62]/95 transition-transform hover:scale-[1.01] cursor-pointer"
                          >
                            Soumettre mon Dossier Académique
                          </button>
                        </form>
                      )}
                    </motion.div>
                  </div>
                )}

              </motion.div>
            )}

            {/* 8. ÉVÉNEMENTS (AGENDA) */}
            {activeTab === 'events' && (
              <motion.div
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                className="space-y-8"
              >
                <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
                  <div className="space-y-1">
                    <h1 className="text-2xl md:text-3xl font-display font-semibold text-brand-dark">Agenda Scientifique & Soutenances</h1>
                    <p className="text-slate-500 text-xs md:text-sm">Consultez l'agenda de nos séminaires réguliers, ateliers de travail et soutenances.</p>
                  </div>

                  <div className="flex items-center gap-2">
                    <Filter size={16} className="text-slate-400" />
                    <select
                      value={eventFilterType}
                      onChange={(e) => setEventFilterType(e.target.value)}
                      className="bg-white border border-slate-250 py-1.5 px-3 rounded-lg text-xs font-medium text-slate-700"
                    >
                      <option value="all">Tous types d'événements</option>
                      <option value="Séminaire">Séminaires réguliers</option>
                      <option value="Atelier">Ateliers sectoriels</option>
                      <option value="Colloque">Colloques & Écoles d'été</option>
                      <option value="Soutenance de Thèse">Soutenances publiques</option>
                    </select>
                  </div>
                </div>

                <div className="grid md:grid-cols-3 gap-6">
                  {approvedEvents
                    .filter(e => eventFilterType === 'all' || e.type === eventFilterType)
                    .map(evt => {
                      const isUpcoming = new Date(evt.date) >= new Date();

                      return (
                        <div
                          key={evt.id}
                          className="bg-white rounded-2xl border border-slate-250/80 overflow-hidden shadow-xs hover:shadow-md transition-shadow flex flex-col justify-between"
                        >
                          <div>
                            {evt.image && (
                              <div className="h-40 w-full overflow-hidden relative">
                                <img src={evt.image} alt={evt.title} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                                <span className="absolute top-2 left-2 bg-brand-dark/90 text-white text-[10px] uppercase font-bold py-1 px-2 rounded-full tracking-wider">
                                  {evt.type}
                                </span>
                              </div>
                            )}

                            <div className="p-6 space-y-3">
                              <div className="flex gap-2 items-center text-xs text-slate-400">
                                <Calendar size={14} className="text-brand-gold" />
                                <span className="font-semibold">{evt.date} à {evt.time}</span>
                              </div>

                              <h3
                                onClick={() => setSelectedEvent(evt)}
                                className="font-display font-semibold text-sm text-slate-800 hover:text-brand-blue cursor-pointer leading-snug line-clamp-2"
                              >
                                {evt.title}
                              </h3>

                              <p className="text-xs text-slate-500 line-clamp-3 leading-relaxed">
                                {evt.description}
                              </p>
                            </div>
                          </div>

                          <div className="p-6 pt-0 flex flex-col gap-2">
                            <span className="text-[10px] text-slate-405 flex items-center gap-1.5 leading-none">
                              <MapPin size={12} className="text-brand-gold" />
                              {evt.location}
                            </span>
                            <button
                              onClick={() => setSelectedEvent(evt)}
                              className="w-full text-center mt-2 py-2 bg-slate-50 text-brand-blue border border-slate-200 hover:bg-brand-blue/5 font-semibold rounded-lg text-xs transition-colors"
                            >
                              Consulter le programme d'interventions
                            </button>
                          </div>
                        </div>
                      );
                    })}
                </div>
              </motion.div>
            )}

            {/* 9. ACTUALITÉS */}
            {activeTab === 'news' && (
              <motion.div
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                className="space-y-8"
              >
                <div className="space-y-1">
                  <h1 className="text-2xl md:text-3xl font-display font-semibold text-brand-dark">Actualités de l'Unité</h1>
                  <p className="text-slate-500 text-xs md:text-sm">Suivez nos distinctions, séminaires phares et lancements d'antennes scientifiques.</p>
                </div>

                <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-6">
                  {approvedNews.map(item => (
                    <div
                      key={item.id}
                      onClick={() => setSelectedNews(item)}
                      className="group bg-white rounded-2xl border border-slate-200 shadow-xs hover:shadow-md cursor-pointer flex flex-col justify-between overflow-hidden"
                    >
                      <div>
                        <div className="relative h-48 w-full overflow-hidden">
                          <img
                            src={item.image}
                            alt={item.title}
                            className="w-full h-full object-cover group-hover:scale-102 transition-transform duration-300"
                            referrerPolicy="no-referrer"
                          />
                          <span className="absolute top-3 left-3 bg-brand-blue/95 text-white text-[10px] font-bold py-1 px-2.5 rounded-full uppercase tracking-wider">
                            {item.category}
                          </span>
                        </div>
                        <div className="p-6 space-y-2">
                          <div className="flex gap-2 items-center text-xs text-slate-400">
                            <Clock size={12} />
                            <span>{item.date}</span>
                          </div>
                          <h3 className="font-display font-semibold text-sm text-slate-800 leading-tight group-hover:text-brand-blue transition-colors line-clamp-2">
                            {item.title}
                          </h3>
                          <p className="text-xs text-slate-500 leading-relaxed line-clamp-3">
                            {item.summary}
                          </p>
                        </div>
                      </div>
                      <div className="p-6 pt-0 flex justify-end">
                        <span className="text-xs font-semibold text-brand-blue group-hover:translate-x-1 transition-transform inline-flex items-center gap-1">
                          Lire l'article <ArrowRight size={14} />
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}

            {/* 10. CONTACT */}
            {activeTab === 'contact' && (
              <motion.div
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                className="grid md:grid-cols-12 gap-8 items-start"
              >
                {/* Information cards */}
                <div className="md:col-span-4 space-y-6">
                  <div className="space-y-2">
                    <h1 className="text-2xl font-display font-bold text-brand-dark">Nous Contacter</h1>
                    <p className="text-slate-500 text-xs">Pour toute demande scientifique, dépôt de stagiaires ou intégration doctorale.</p>
                  </div>

                  <div className="bg-white p-5 rounded-2xl border border-slate-150 shadow-3xs space-y-4 text-xs">
                    <div className="flex gap-3">
                      <div className="p-2 rounded-lg bg-blue-50 text-brand-blue h-fit">
                        <MapPin size={16} />
                      </div>
                      <div className="space-y-1">
                        <h4 className="font-bold text-slate-700">Adresse Principal UCAD</h4>
                        <p className="text-slate-500 leading-normal">
                          Pavillon Informatique de l'ESP, Campus Universitaire de Fann, BP 5005, Dakar, Sénégal.
                        </p>
                      </div>
                    </div>

                    <div className="flex gap-3">
                      <div className="p-2 rounded-lg bg-blue-50 text-brand-blue h-fit">
                        <MapPin size={16} />
                      </div>
                      <div className="space-y-1">
                        <h4 className="font-bold text-slate-700">Délégation IRD Bondy</h4>
                        <p className="text-slate-500 leading-normal">
                          LMI UMMISCO Bondy, 32 Avenue Henri Varagnat, 93143 Bondy Cedex, France.
                        </p>
                      </div>
                    </div>

                    <div className="flex gap-3 pt-2 border-t border-slate-100">
                      <div className="p-2 rounded-lg bg-blue-50 text-brand-blue h-fit">
                        <Phone size={16} />
                      </div>
                      <div className="space-y-1">
                        <h4 className="font-bold text-slate-700">Secrétariat Standard</h4>
                        <p className="text-slate-500">+221 33 825 05 30</p>
                      </div>
                    </div>

                    <div className="flex gap-3">
                      <div className="p-2 rounded-lg bg-blue-50 text-brand-blue h-fit">
                        <Mail size={16} />
                      </div>
                      <div className="space-y-1">
                        <h4 className="font-bold text-slate-700">Messagerie Unifiée</h4>
                        <p className="text-slate-500">secretariat.dakar@ummisco.sn</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Simulated dynamic form */}
                <div className="md:col-span-8 bg-white p-8 rounded-2xl border border-slate-205 shadow-xs">
                  {contactSubmitted ? (
                    <div className="h-[360px] flex flex-col justify-center items-center text-center space-y-4">
                      <div className="p-4 rounded-full bg-emerald-50 text-emerald-500 shadow-md">
                        <Send size={32} />
                      </div>
                      <h3 className="font-display font-semibold text-lg text-slate-800">Message Transmis avec Succès</h3>
                      <p className="text-sm text-slate-520 max-w-sm">
                        Votre message portant sur UMMISCO {contactForm.category} a bien été enregistré. Un email de confirmation a été émis.
                      </p>
                    </div>
                  ) : (
                    <form onSubmit={handleContactSubmit} className="space-y-4">
                      <h3 className="font-display font-semibold text-md text-slate-800 border-b border-slate-100 pb-2">
                        Soumettre un Formulaire d'Interrogation
                      </h3>
                      <div className="grid sm:grid-cols-2 gap-4">
                        <div className="space-y-1">
                          <label className="text-[10px] font-bold text-slate-400 uppercase">Votre Nom complet</label>
                          <input
                            type="text"
                            required
                            value={contactForm.name}
                            onChange={(e) => setContactForm({ ...contactForm, name: e.target.value })}
                            className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs"
                            placeholder="Frédéric Lancelot"
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="text-[10px] font-bold text-slate-400 uppercase">Adresse Email</label>
                          <input
                            type="email"
                            required
                            value={contactForm.email}
                            onChange={(e) => setContactForm({ ...contactForm, email: e.target.value })}
                            className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs"
                            placeholder="f.lancelot@ird.fr"
                          />
                        </div>
                      </div>

                      <div className="grid sm:grid-cols-2 gap-4">
                        <div className="space-y-1">
                          <label className="text-[10px] font-bold text-slate-400 uppercase">Objet / Thématique</label>
                          <input
                            type="text"
                            required
                            value={contactForm.subject}
                            onChange={(e) => setContactForm({ ...contactForm, subject: e.target.value })}
                            className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs"
                            placeholder="Demande de cotutelle Doctorale"
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="text-[10px] font-bold text-slate-400 uppercase">Sujet Principal</label>
                          <select
                            value={contactForm.category}
                            onChange={(e) => setContactForm({ ...contactForm, category: e.target.value })}
                            className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-705"
                          >
                            <option value="Collaboration">Collaboration de Recherche</option>
                            <option value="Simulation">Plateforme de Simulation GAMA</option>
                            <option value="Thesis">Thèses & Stages Masters</option>
                            <option value="Access">Demande d'accès Datasets</option>
                          </select>
                        </div>
                      </div>

                      <div className="space-y-1">
                        <label className="text-[10px] font-bold text-slate-400 uppercase">Description de votre demande</label>
                        <textarea
                          required
                          rows={5}
                          value={contactForm.message}
                          onChange={(e) => setContactForm({ ...contactForm, message: e.target.value })}
                          className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs"
                          placeholder="Explicitez brièvement votre parcours et les axes de l'UMMISCO avec lesquels vous souhaitez initier un contact..."
                        />
                      </div>

                      <button
                        type="submit"
                        className="px-5 py-2.5 bg-brand-blue hover:bg-brand-blue/90 text-white font-medium rounded-lg text-xs transition-colors flex items-center gap-2 shadow-3xs"
                      >
                        Envoyer le message
                        <Send size={14} />
                      </button>
                    </form>
                  )}
                </div>
              </motion.div>
            )}

            {/* 11. RECHERCHE GLOBALE */}
            {activeTab === 'search' && (
              <motion.div
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                className="space-y-6"
              >
                <div className="bg-white p-6 rounded-2xl border border-slate-230/80 shadow-xs space-y-4">
                  <h1 className="text-xl md:text-2xl font-display font-semibold text-brand-dark">Portail de Recherche Unifiée</h1>
                  <div className="relative">
                    <Search className="absolute left-3 top-3 text-slate-400" size={18} />
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Tapez vos mots-clés... Ex: 'Paludisme', 'GAMA', 'Drone', 'Epidémiologie'..."
                      className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-250 rounded-xl text-sm"
                    />
                  </div>
                </div>

                {searchQuery ? (
                  hasSearchResults ? (
                    <div className="space-y-6">
                      
                      {/* Sub Category Pubs */}
                      {searchResults.pubs.length > 0 && (
                        <div className="space-y-3">
                          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1">
                            <BookOpen size={14} />
                            Publications associées ({searchResults.pubs.length})
                          </h3>
                          <div className="space-y-2">
                            {searchResults.pubs.map(p => (
                              <div
                                key={p.id}
                                onClick={() => setSelectedPublication(p)}
                                className="bg-white p-4 rounded-xl border border-slate-200 hover:border-brand-blue/20 cursor-pointer shadow-3xs"
                              >
                                <span className="text-[9px] uppercase font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-100">{p.type} • {p.year}</span>
                                <h4 className="font-semibold text-sm text-slate-800 mt-1">{p.title}</h4>
                                <p className="text-xs text-slate-500 mt-1 line-clamp-1 italic">{p.journal}</p>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Sub Category Projects */}
                      {searchResults.projs.length > 0 && (
                        <div className="space-y-3">
                          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1">
                            <FolderGit2 size={14} />
                            Projets identifiés ({searchResults.projs.length})
                          </h3>
                          <div className="grid sm:grid-cols-2 gap-4">
                            {searchResults.projs.map(p => (
                              <div
                                key={p.id}
                                onClick={() => setSelectedProject(p)}
                                className="bg-white p-4 rounded-xl border border-slate-200 hover:border-brand-blue/20 cursor-pointer shadow-3xs"
                              >
                                <h4 className="font-semibold text-sm text-slate-800">{p.title}</h4>
                                <p className="text-xs text-slate-500 mt-1 line-clamp-2">{p.description}</p>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Sub Category Datasets */}
                      {searchResults.datas.length > 0 && (
                        <div className="space-y-3">
                          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1">
                            <Database size={14} />
                            Datasets pertinents ({searchResults.datas.length})
                          </h3>
                          <div className="grid sm:grid-cols-2 gap-4">
                            {searchResults.datas.map(d => (
                              <div
                                key={d.id}
                                onClick={() => setSelectedDataset(d)}
                                className="bg-white p-4 rounded-xl border border-slate-200 hover:border-brand-blue/20 cursor-pointer shadow-3xs"
                              >
                                <h4 className="font-semibold text-sm text-slate-800">{d.title}</h4>
                                <p className="text-xs font-mono mt-1 text-slate-400">Taille : {d.size}</p>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                    </div>
                  ) : (
                    <div className="text-center p-12 bg-white rounded-2xl border border-slate-200">
                      <p className="text-slate-500 text-sm">Aucun document ou chercheur ne correspond à votre expression.</p>
                      <button onClick={() => setSearchQuery('')} className="text-brand-blue text-xs font-bold mt-2 underline">
                        Réinitialiser la recherche global
                      </button>
                    </div>
                  )
                ) : (
                  <div className="text-slate-500 text-center py-12 text-sm">
                    Saisissez un critère de filtrage pour lancer la requête unifiée.
                  </div>
                )}
              </motion.div>
            )}

          </AnimatePresence>
        </div>
      </main>

      {/* INSTITUTIONAL FOOTER */}
      <footer className="bg-slate-900 text-white border-t-2 border-[#0a3d62] pt-12 pb-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid md:grid-cols-4 gap-8">
          
          {/* Column 1: Accès Rapides & Suivez nous */}
          <div className="space-y-6">
            <div>
              <h3 className="font-display font-semibold text-sm text-white uppercase tracking-wider relative pb-2 select-none">
                Accès Rapides
                <span className="absolute bottom-0 left-0 w-8 h-0.5 bg-[#0a3d62]"></span>
              </h3>
              <ul className="space-y-2 text-xs text-slate-300 mt-3 font-medium">
                <li>
                  <a href="https://esp.sn/" target="_blank" rel="noreferrer" className="hover:text-[#c19d75] transition-colors block">
                    Emploi du temps
                  </a>
                </li>
                <li>
                  <a href="https://mail.ucad.sn" target="_blank" rel="noreferrer" className="hover:text-[#c19d75] transition-colors block">
                    Messagerie UCAD
                  </a>
                </li>
              </ul>
            </div>

            <div>
              <h3 className="font-display font-semibold text-xs text-white uppercase tracking-wider relative pb-1.5 select-none">
                Suivez-nous
                <span className="absolute bottom-0 left-0 w-6 h-0.5 bg-[#0a3d62]"></span>
              </h3>
              <div className="flex gap-2.5 mt-3 select-none">
                <a
                  href="https://facebook.com"
                  target="_blank"
                  rel="noreferrer"
                  className="w-7 h-7 rounded-full bg-[#1e293b] hover:bg-[#3b5998] hover:scale-105 transition-all flex items-center justify-center text-white text-xs font-bold"
                  title="Facebook"
                >
                  f
                </a>
                <a
                  href="https://twitter.com"
                  target="_blank"
                  rel="noreferrer"
                  className="w-7 h-7 rounded-full bg-[#1e293b] hover:bg-[#000000] hover:scale-105 transition-all flex items-center justify-center text-white text-[10px] font-bold"
                  title="Twitter"
                >
                  𝕏
                </a>
                <a
                  href="https://linkedin.com"
                  target="_blank"
                  rel="noreferrer"
                  className="w-7 h-7 rounded-full bg-[#1e293b] hover:bg-[#0077b5] hover:scale-105 transition-all flex items-center justify-center text-white text-xs font-bold"
                  title="LinkedIn"
                >
                  in
                </a>
                <a
                  href="https://youtube.com"
                  target="_blank"
                  rel="noreferrer"
                  className="w-7 h-7 rounded-full bg-[#1e293b] hover:bg-[#ff0000] hover:scale-105 transition-all flex items-center justify-center text-white text-xs font-bold"
                  title="YouTube"
                >
                  ▶
                </a>
              </div>
            </div>
          </div>

          {/* Column 2: Liens utiles */}
          <div>
            <h3 className="font-display font-semibold text-sm text-white uppercase tracking-wider relative pb-2 select-none">
              Liens utiles
              <span className="absolute bottom-0 left-0 w-8 h-0.5 bg-[#0a3d62]"></span>
            </h3>
            <ul className="space-y-2 text-xs text-slate-300 mt-3 font-medium">
              <li>
                <a href="https://www.esp.sn" target="_blank" rel="noreferrer" className="hover:text-[#c19d75] transition-colors block">
                  ESP (École Supérieure Polytechnique)
                </a>
              </li>
              <li>
                <a href="https://www.ird.fr" target="_blank" rel="noreferrer" className="hover:text-[#c19d75] transition-colors block">
                  IRD (Institut de Recherche pour le Développement)
                </a>
              </li>
              <li>
                <a href="https://www.ummisco.fr" target="_blank" rel="noreferrer" className="hover:text-[#c19d75] transition-colors block">
                  UMMISCO FRANCE
                </a>
              </li>
              <li>
                <a href="https://www.ucad.sn" target="_blank" rel="noreferrer" className="hover:text-[#c19d75] transition-colors block">
                  UCAD (Université Cheikh Anta Diop)
                </a>
              </li>
              <li>
                <a href="https://www.ugb.sn" target="_blank" rel="noreferrer" className="hover:text-[#c19d75] transition-colors block">
                  UGB (Université Gaston Berger)
                </a>
              </li>
            </ul>
          </div>

          {/* Column 3: Contacts */}
          <div>
            <h3 className="font-display font-semibold text-sm text-white uppercase tracking-wider relative pb-2 select-none">
              Contacts
              <span className="absolute bottom-0 left-0 w-8 h-0.5 bg-[#0a3d62]"></span>
            </h3>
            <div className="space-y-2.5 text-xs text-slate-300 mt-3 leading-relaxed">
              <p className="font-bold text-white uppercase tracking-wide">UMMISCO SENEGAL</p>
              <p className="text-slate-300">Campus UCAD - Dakar Fann</p>
              <p className="text-slate-300">Campus UCAD-IRD - Dakar Hann Maristes</p>
              <div className="pt-2.5 border-t border-slate-800 flex flex-col gap-0.5">
                <span className="font-semibold text-slate-400">E-mail :</span>
                <a href="mailto:ummisco@ucad.edu.sn" className="text-[#c19d75] hover:underline font-bold transition-all">
                  ummisco@ucad.edu.sn
                </a>
              </div>
            </div>
          </div>

          {/* Column 4: Venir à l'UMMISCO */}
          <div>
            <h3 className="font-display font-semibold text-sm text-white uppercase tracking-wider relative pb-2 select-none">
              Venir à l'UMMISCO
              <span className="absolute bottom-0 left-0 w-8 h-0.5 bg-[#0a3d62]"></span>
            </h3>
            <div className="mt-3 relative rounded-lg overflow-hidden border border-slate-800 bg-slate-950 p-1 group">
              <div className="h-24 bg-slate-800 rounded relative overflow-hidden flex items-center justify-center select-none">
                <div className="absolute inset-0 opacity-15 bg-[radial-gradient(#e2e8f0_1.5px,transparent_1.5px)] [background-size:12px_12px]"></div>
                {/* Visual grid representing map roads */}
                <div className="absolute top-1/2 left-0 w-full h-3 bg-slate-700 transform -translate-y-1/2 rounded-xs"></div>
                <div className="absolute left-1/3 top-0 w-4 h-full bg-slate-700 rounded-xs"></div>
                <div className="absolute right-1/4 top-0 w-3 h-full bg-slate-700 rounded-xs"></div>
                
                {/* Blue/gold marker pin */}
                <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 flex flex-col items-center">
                  <div className="w-5 h-5 rounded-full bg-[#0a3d62] border border-[#c19d75] flex items-center justify-center text-[7px] font-extrabold text-white shadow-md animate-pulse">
                    UM
                  </div>
                </div>
                
                <span className="absolute bottom-1 right-2 text-[8px] font-mono text-slate-400 bg-slate-900/90 px-1.5 py-0.5 rounded leading-none">
                  ESP DAKAR
                </span>
              </div>
              
              <a
                href="https://maps.google.com/?q=Ecole+Superieure+Polytechnique+Dakar"
                target="_blank"
                rel="noreferrer"
                className="mt-2 w-full py-1.5 bg-[#0a3d62] hover:bg-[#0c4a78] text-white font-bold text-[10px] uppercase tracking-wider rounded flex items-center justify-center gap-1 transition-all"
              >
                <span>Ouvrir dans Google Maps</span>
                <span className="text-[10px]">↗</span>
              </a>
            </div>
          </div>

        </div>

        {/* Bottom Credits & Scroll to Top */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-10 pt-6 border-t border-slate-800 flex flex-col sm:flex-row justify-between items-center gap-4 text-xs text-slate-400">
          <div>
            © Copyright 2026. Tous droits réservés. | <span className="text-slate-300 font-semibold uppercase tracking-wider">DISI - UCAD</span>
          </div>
          
          <button
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            className="w-8 h-8 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-700 flex items-center justify-center text-white text-md transition-all shadow cursor-pointer font-bold"
            title="Retour en haut"
          >
            ▲
          </button>
        </div>
      </footer>

      {/* MODAL / SHEET DETAIL VIEWERS */}
      {/* A. Envie de financer un projet (Sponsorship Invitation) */}
      {showFinanceModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-3xs">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl border border-slate-205"
          >
            <div className="relative bg-gradient-to-r from-amber-600 to-amber-700 p-6 text-white">
              <span className="text-[10px] font-bold text-amber-200 uppercase tracking-widest block mb-1">Mécénat / Investissement</span>
              <h2 className="text-lg font-display font-bold">Investir dans la Recherche Scientifique</h2>
              <p className="text-xs text-amber-100 mt-1">Contribuez à la lutte contre les crises épidémiques et climatiques majeures au Sénégal.</p>
              <button onClick={() => setShowFinanceModal(false)} className="absolute top-4 right-4 text-white/80 hover:text-white font-bold text-lg select-none">×</button>
            </div>

            <div className="p-6">
              {financeSuccess ? (
                <div className="text-center py-8 space-y-4">
                  <div className="w-16 h-16 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center mx-auto text-3xl shadow-3xs animate-bounce">
                    ✓
                  </div>
                  <div className="space-y-1">
                    <h3 className="font-bold text-slate-800 text-sm">Votre intention de financement a été bien reçue !</h3>
                    <p className="text-xs text-slate-500 max-w-sm mx-auto leading-relaxed">
                      L'UMMISCO Sénégal vous remercie très sincèrement pour votre intérêt. Notre bureau exécutif ainsi que l'administration UCAD vous contacteront sous 48h afin d'établir un protocole de convention.
                    </p>
                  </div>
                  <button
                    onClick={() => setShowFinanceModal(false)}
                    className="px-6 py-2 bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs rounded-xl transition-all font-mono"
                  >
                    FERMER
                  </button>
                </div>
              ) : (
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    setFinanceSuccess(true);
                  }}
                  className="space-y-4 text-xs"
                >
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="font-bold text-slate-600">Nom Complet *</label>
                      <input
                        type="text"
                        required
                        value={financeForm.name}
                        onChange={(e) => setFinanceForm({ ...financeForm, name: e.target.value })}
                        placeholder="Ex: Pr. Fatou Diop"
                        className="w-full bg-slate-50 border border-slate-250 py-2 px-3 rounded-xl focus:bg-white focus:outline-none"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="font-bold text-slate-600">Institution / Organisation</label>
                      <input
                        type="text"
                        value={financeForm.org}
                        onChange={(e) => setFinanceForm({ ...financeForm, org: e.target.value })}
                        placeholder="Ex: Fondation Gates, AFD..."
                        className="w-full bg-slate-50 border border-slate-250 py-2 px-3 rounded-xl focus:bg-white focus:outline-none"
                      />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="font-bold text-slate-600">Adresse E-mail Institutionnelle *</label>
                    <input
                      type="email"
                      required
                      value={financeForm.email}
                      onChange={(e) => setFinanceForm({ ...financeForm, email: e.target.value })}
                      placeholder="Ex: contact@organisation.org"
                      className="w-full bg-slate-50 border border-slate-250 py-2 px-3 rounded-xl focus:bg-white focus:outline-none"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="font-bold text-slate-600">Axe Scientifique ou Projet Visé</label>
                    <input
                      type="text"
                      value={financeForm.projectTitle}
                      onChange={(e) => setFinanceForm({ ...financeForm, projectTitle: e.target.value })}
                      placeholder="Ex: Epidémiologie de la dengue, Agro-systèmes du Lac de Guiers..."
                      className="w-full bg-slate-50 border border-slate-250 py-2 px-3 rounded-xl focus:bg-white focus:outline-none"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="font-bold text-slate-600">Détails de votre proposition d'accompagnement *</label>
                    <textarea
                      required
                      rows={3}
                      value={financeForm.message}
                      onChange={(e) => setFinanceForm({ ...financeForm, message: e.target.value })}
                      placeholder="Précisez votre cadre d'intervention, budget alloué potentiel ou demande d'informations..."
                      className="w-full bg-slate-50 border border-slate-250 py-2 px-3 rounded-xl focus:bg-white focus:outline-none resize-none"
                    />
                  </div>

                  <div className="pt-2 flex justify-end gap-2 text-xs font-semibold">
                    <button
                      type="button"
                      onClick={() => setShowFinanceModal(false)}
                      className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl transition-colors cursor-pointer"
                    >
                      Annuler
                    </button>
                    <button
                      type="submit"
                      className="px-5 py-2 bg-[#c19d75] hover:bg-[#b08c64] text-white rounded-xl shadow-xs transition-colors cursor-pointer uppercase tracking-wider"
                    >
                      Soumettre mon intention 💰
                    </button>
                  </div>
                </form>
              )}
            </div>
          </motion.div>
        </div>
      )}

      {/* B. Envie de nous rejoindre (Enrollment Candidate) */}
      {showJoinModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-3xs">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl border border-slate-205"
          >
            <div className="relative bg-gradient-to-r from-brand-dark to-brand-blue p-6 text-white">
              <span className="text-[10px] font-bold text-blue-200 uppercase tracking-widest block mb-1">Candidature & Association</span>
              <h2 className="text-lg font-display font-bold">Rejoindre l'UMMISCO Sénégal</h2>
              <p className="text-xs text-slate-350 mt-1">Collaborez au carrefour de la modélisation mathématique et informatique des bio-systèmes.</p>
              <button onClick={() => setShowJoinModal(false)} className="absolute top-4 right-4 text-white/80 hover:text-white font-bold text-lg select-none">×</button>
            </div>

            <div className="p-6">
              {joinSuccess ? (
                <div className="text-center py-8 space-y-4">
                  <div className="w-16 h-16 bg-blue-50 text-brand-blue rounded-full flex items-center justify-center mx-auto text-3xl shadow-3xs animate-bounceEdge">
                    ✓
                  </div>
                  <div className="space-y-1">
                    <h3 className="font-bold text-slate-800 text-sm">Votre candidature de recherche a été transmise !</h3>
                    <p className="text-xs text-slate-500 max-w-sm mx-auto leading-relaxed">
                      L'équipe d'UMMISCO Sénégal salue votre démarche d'excellence. Votre lettre d'intentions ainsi que les références fournies ont été déposées auprès du bureau scientifique. Un courriel de suivi vous a été envoyé.
                    </p>
                  </div>
                  <button
                    onClick={() => setShowJoinModal(false)}
                    className="px-6 py-2 bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs rounded-xl transition-all font-mono"
                  >
                    FERMER
                  </button>
                </div>
              ) : (
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    setJoinSuccess(true);
                  }}
                  className="space-y-4 text-xs"
                >
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="font-bold text-slate-600">Nom Complet *</label>
                      <input
                        type="text"
                        required
                        value={joinForm.name}
                        onChange={(e) => setJoinForm({ ...joinForm, name: e.target.value })}
                        placeholder="Ex: Pr. Fatou Diop"
                        className="w-full bg-slate-50 border border-slate-250 py-2 px-3 rounded-xl focus:bg-white focus:outline-none"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="font-bold text-slate-600">Statut Professionnel *</label>
                      <select
                        value={joinForm.currentRole}
                        onChange={(e) => setJoinForm({ ...joinForm, currentRole: e.target.value })}
                        className="w-full bg-slate-50 border border-slate-250 py-2 px-3 rounded-xl focus:bg-white focus:outline-none text-slate-700"
                      >
                        <option value="Enseignant-Chercheur">Enseignant-Chercheur</option>
                        <option value="Chercheur Post-doc">Chercheur Post-doc</option>
                        <option value="Doctorant">Doctorant</option>
                        <option value="Ingénieur de Recherche">Ingénieur de Recherche</option>
                        <option value="Etudiant Master">Étudiant en Master</option>
                      </select>
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="font-bold text-slate-600">Adresse E-mail Académique *</label>
                    <input
                      type="email"
                      required
                      value={joinForm.email}
                      onChange={(e) => setJoinForm({ ...joinForm, email: e.target.value })}
                      placeholder="Ex: fatou.diop@ucad.edu.sn"
                      className="w-full bg-slate-50 border border-slate-250 py-2 px-3 rounded-xl focus:bg-white focus:outline-none"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="font-bold text-slate-600">Lien vers votre CV / Page de Profil Scientifique *</label>
                    <input
                      type="url"
                      required
                      value={joinForm.cvLink}
                      onChange={(e) => setJoinForm({ ...joinForm, cvLink: e.target.value })}
                      placeholder="Ex: https://orcid.org/0000-0000-0000-0000, LinkedIn, Hal..."
                      className="w-full bg-slate-50 border border-slate-250 py-2 px-3 rounded-xl focus:bg-white focus:outline-none"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="font-bold text-slate-600">Projet de recherche ou motivations *</label>
                    <textarea
                      required
                      rows={3}
                      value={joinForm.motivation}
                      onChange={(e) => setJoinForm({ ...joinForm, motivation: e.target.value })}
                      placeholder="Donnez un aperçu de vos axes de recherche, vos outils fétiches (Matlab, NetLogo, Python, Agent-Based modeling) ou thématique de thèse..."
                      className="w-full bg-slate-50 border border-slate-250 py-2 px-3 rounded-xl focus:bg-white focus:outline-none resize-none"
                    />
                  </div>

                  <div className="pt-2 flex justify-end gap-2 text-xs font-semibold">
                    <button
                      type="button"
                      onClick={() => setShowJoinModal(false)}
                      className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl transition-colors cursor-pointer"
                    >
                      Annuler
                    </button>
                    <button
                      type="submit"
                      className="px-5 py-2 bg-[#0a3d62] hover:bg-[#002f52] text-white rounded-xl shadow-xs transition-colors cursor-pointer uppercase tracking-wider"
                    >
                      Soumettre ma candidature 🔬
                    </button>
                  </div>
                </form>
              )}
            </div>
          </motion.div>
        </div>
      )}

      {/* 1. Researcher Profile Modal */}
      {selectedResearcher && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-3xs">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-2xl w-full max-w-2xl overflow-hidden shadow-2xl border border-slate-205"
          >
            <div className="relative bg-gradient-to-r from-brand-dark to-brand-blue p-6 text-white flex gap-6 items-center">
              <img src={selectedResearcher.image} alt={selectedResearcher.name} className="w-20 h-20 rounded-xl object-cover border border-white/20 shadow-md" referrerPolicy="no-referrer" />
              <div>
                <span className="text-[10px] font-bold text-brand-gold uppercase tracking-widest">{selectedResearcher.rank}</span>
                <h2 className="text-xl font-display font-bold">{selectedResearcher.name}</h2>
                <p className="text-xs text-slate-300 mt-1">{selectedResearcher.affiliation}</p>
              </div>
              <button onClick={() => setSelectedResearcher(null)} className="absolute top-4 right-4 text-white/80 hover:text-white font-bold text-lg">×</button>
            </div>
            <div className="p-6 space-y-4 max-h-[380px] overflow-y-auto text-xs">
              <div className="space-y-1">
                <span className="font-bold text-slate-400 uppercase tracking-wider text-[9px]">Biographie</span>
                <p className="text-slate-600 leading-relaxed text-justify">{selectedResearcher.bio}</p>
              </div>

              <div className="grid sm:grid-cols-2 gap-4 pt-2 border-t border-slate-100">
                <div className="space-y-1">
                  <span className="font-bold text-slate-400 uppercase tracking-wider text-[9px]">Contact Direct</span>
                  <div className="space-y-1 text-slate-600 font-medium">
                    <p>Email: {selectedResearcher.email}</p>
                    <p>Tél: {selectedResearcher.phone}</p>
                    {selectedResearcher.officeLocation && <p>Bureau: {selectedResearcher.officeLocation}</p>}
                  </div>
                </div>
                <div className="space-y-1">
                  <span className="font-bold text-slate-400 uppercase tracking-wider text-[9px]">Indicateurs Clés</span>
                  <div className="grid grid-cols-2 gap-2 text-center text-xs font-semibold">
                    <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-100">
                      <div className="text-brand-blue text-sm font-bold">{selectedResearcher.publicationsCount}</div>
                      <span className="text-[9px] text-slate-400 uppercase">Publications</span>
                    </div>
                    <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-100">
                      <div className="text-brand-blue text-sm font-bold">{selectedResearcher.projectsCount}</div>
                      <span className="text-[9px] text-slate-400 uppercase">Projets Coordonnés</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="p-4 bg-slate-50 border-t border-slate-150 flex justify-end">
              <button onClick={() => setSelectedResearcher(null)} className="px-4 py-2 bg-slate-200 text-slate-800 font-bold rounded-lg text-xs hover:bg-slate-300">
                Fermer l'onglet
              </button>
            </div>
          </motion.div>
        </div>
      )}

      {/* 2. Project Detail Modal */}
      {selectedProject && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-3xs">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-2xl w-full max-w-2xl overflow-hidden shadow-2xl border border-slate-205"
          >
            <div className="bg-gradient-to-r from-brand-dark to-brand-blue p-6 text-white relative">
              <h2 className="text-md sm:text-lg font-display font-bold leading-tight">{selectedProject.title}</h2>
              <span className="text-xs text-brand-gold mt-1 block">Réseau de Convention - UMMISCO</span>
              <button onClick={() => setSelectedProject(null)} className="absolute top-4 right-4 text-white/80 hover:text-white font-bold text-lg">×</button>
            </div>
            <div className="p-6 space-y-4 text-xs max-h-[380px] overflow-y-auto">
              <div className="space-y-1">
                <span className="font-bold text-slate-400 uppercase text-[9px] tracking-wider">Description Scientifique</span>
                <p className="text-slate-650 leading-relaxed text-justify">{selectedProject.description}</p>
              </div>

              <div className="grid sm:grid-cols-2 gap-4 pt-2 border-t border-slate-100">
                <div className="space-y-2">
                  <span className="font-bold text-slate-400 uppercase text-[9px] tracking-wider">Sourcing Financier</span>
                  <div className="space-y-1 font-medium text-slate-600">
                    <p>Budget Prévisionnel: <strong>{selectedProject.budget} {selectedProject.currency}</strong></p>
                    <p>Timeline : {selectedProject.timeline}</p>
                    <p>Cycle status : {selectedProject.status}</p>
                  </div>
                </div>

                <div className="space-y-1">
                  <span className="font-bold text-slate-400 uppercase text-[9px] tracking-wider">Membres rattachés</span>
                  <div className="flex flex-wrap gap-1 pt-1">
                    {selectedProject.members.map(mId => {
                      const res = researchers.find(r => r.id === mId);
                      return res ? (
                        <span key={mId} className="bg-slate-50 border border-slate-200 rounded px-2 py-0.5 font-semibold text-slate-600">
                          {res.name}
                        </span>
                      ) : null;
                    })}
                  </div>
                </div>
              </div>
            </div>
            <div className="p-4 bg-slate-50 border-t border-slate-150 flex justify-end">
              <button onClick={() => setSelectedProject(null)} className="px-4 py-2 bg-slate-200 text-slate-800 font-bold rounded-lg text-xs">
                Quitter l'aperçu
              </button>
            </div>
          </motion.div>
        </div>
      )}

      {/* 3. Publication Detail Modal */}
      {selectedPublication && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-3xs">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-2xl w-full max-w-2xl overflow-hidden shadow-2xl border border-slate-205"
          >
            <div className="bg-gradient-to-r from-emerald-800 to-teal-700 p-6 text-white relative">
              <span className="text-[10px] font-bold tracking-widest text-emerald-100 uppercase uppercase">{selectedPublication.type}</span>
              <h2 className="text-md sm:text-lg font-display font-medium leading-tight mt-1">{selectedPublication.title}</h2>
              <button onClick={() => setSelectedPublication(null)} className="absolute top-4 right-4 text-white/80 hover:text-white font-bold text-lg">×</button>
            </div>
            <div className="p-6 space-y-4 text-xs max-h-[380px] overflow-y-auto">
              <div className="space-y-1">
                <span className="font-bold text-slate-400 uppercase text-[9px]">Auteurs & Collaborateurs</span>
                <p className="text-slate-800 font-semibold">{selectedPublication.authors.join(', ')}</p>
              </div>

              <div className="space-y-1 pt-2 border-t border-slate-100">
                <span className="font-bold text-slate-400 uppercase text-[9px]">Abstract / Résumé Académique</span>
                <p className="text-slate-650 leading-relaxed text-justify italic bg-slate-50 p-3 rounded border border-slate-150">
                  "{selectedPublication.abstract}"
                </p>
              </div>

              <div className="grid sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <span className="font-bold text-slate-400 uppercase text-[9px]">Informations d'édition</span>
                  <p className="text-slate-600 font-medium leading-relaxed">
                    Revue : {selectedPublication.journal}<br />
                    Année : {selectedPublication.year}<br />
                    Licensing : Comité de lecture approuvé (Peer Reviewed)
                  </p>
                </div>
                <div className="space-y-1">
                  <span className="font-bold text-slate-400 uppercase text-[9px]">Fiche d'intégration</span>
                  <p className="text-slate-600 font-medium">
                    DOI : {selectedPublication.doi || 'En attente d\'attribution'}<br />
                    Date d'enregistrement : {selectedPublication.createdAt}
                  </p>
                </div>
              </div>
            </div>
            <div className="p-4 bg-slate-50 border-t border-slate-150 flex justify-end gap-2">
              <button onClick={() => setSelectedPublication(null)} className="px-4 py-2 bg-slate-200 text-slate-800 font-bold rounded-lg text-xs">
                Fermer
              </button>
              <button
                onClick={() => {
                  try {
                    generatePublicationPdf(selectedPublication);
                  } catch (pdfErr) {
                    console.error('[pdf] Failed to export publication reprint', pdfErr);
                  }
                }}
                className="px-4 py-2 bg-brand-blue hover:bg-brand-blue/95 text-white font-bold rounded-lg text-xs cursor-pointer flex items-center gap-1.5"
              >
                <Download size={13} />
                Télécharger le PDF Certifié
              </button>
            </div>
          </motion.div>
        </div>
      )}

      {/* 4. Axis detail modal */}
      {selectedAxis && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-3xs">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-2xl w-full max-w-2xl overflow-hidden shadow-2xl border border-slate-205"
          >
            <div className="bg-brand-dark p-6 text-white relative">
              <span className="text-[10px] font-bold text-brand-gold uppercase tracking-widest">{selectedAxis.code}</span>
              <h2 className="text-md sm:text-lg font-display font-bold leading-tight mt-1">{selectedAxis.title}</h2>
              <button onClick={() => setSelectedAxis(null)} className="absolute top-4 right-4 text-white/80 hover:text-white font-bold text-lg">×</button>
            </div>
            <div className="p-6 space-y-4 text-xs max-h-[380px] overflow-y-auto">
              <div className="space-y-1">
                <span className="font-bold text-slate-400 uppercase text-[9px]">Présentation scientifique</span>
                <p className="text-slate-650 leading-relaxed text-justify">{selectedAxis.description}</p>
              </div>

              <div className="grid sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <span className="font-bold text-slate-400 uppercase text-[9px]">Publications de cet axe</span>
                  <div className="space-y-2 max-h-40 overflow-y-auto">
                    {publications.filter(p => p.axisId === selectedAxis.id && p.status === 'Approved').map(p => (
                      <div key={p.id} className="p-2 bg-slate-50 rounded border border-slate-150">
                        <h4 className="font-semibold text-slate-800 line-clamp-1">{p.title}</h4>
                        <span className="text-[9px] text-slate-500">{p.year}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="space-y-2">
                  <span className="font-bold text-slate-400 uppercase text-[9px]">Projets rattachés</span>
                  <div className="space-y-2 max-h-40 overflow-y-auto">
                    {projects.filter(p => p.axisId === selectedAxis.id && p.status === 'Approved').map(p => (
                      <div key={p.id} className="p-2 bg-slate-50 rounded border border-slate-150">
                        <h4 className="font-semibold text-slate-800 line-clamp-1">{p.title}</h4>
                        <span className="text-[9px] text-slate-500">{p.timeline}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
            <div className="p-4 bg-slate-50 border-t border-slate-150 flex justify-end">
              <button onClick={() => setSelectedAxis(null)} className="px-4 py-2 bg-slate-200 text-slate-800 font-bold rounded-lg text-xs">
                Fermer
              </button>
            </div>
          </motion.div>
        </div>
      )}

      {/* 5. Dataset modal */}
      {selectedDataset && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-3xs">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-2xl w-full max-w-2xl overflow-hidden shadow-2xl border border-slate-205"
          >
            <div className="bg-blue-905 p-6 text-slate-800 relative bg-brand-navy border-b border-slate-100">
              <h2 className="title text-base font-display font-bold leading-tight">{selectedDataset.title}</h2>
              <span className="text-xs text-brand-gold font-mono mt-1 block">Taille : {selectedDataset.size}</span>
              <button onClick={() => setSelectedDataset(null)} className="absolute top-4 right-4 text-slate-600 font-bold text-lg">×</button>
            </div>
            <div className="p-6 space-y-4 text-xs">
              <div className="space-y-1">
                <span className="font-bold text-slate-400 uppercase text-[9px]">Métadonnées & Description globale</span>
                <p className="text-slate-650 leading-relaxed text-justify">{selectedDataset.description}</p>
              </div>

              <div className="space-y-1">
                <span className="font-bold text-slate-400 uppercase text-[9px]">Licensing & Attribution</span>
                <p className="text-slate-700 bg-slate-50 p-2.5 rounded border border-slate-200 font-medium">
                  {selectedDataset.licenseType}
                </p>
              </div>
            </div>
            <div className="p-4 bg-slate-50 border-t border-slate-150 flex justify-end gap-2">
              <button onClick={() => setSelectedDataset(null)} className="px-4 py-2 bg-slate-200 text-slate-800 font-bold rounded-lg text-xs">
                Fermer
              </button>
            </div>
          </motion.div>
        </div>
      )}

      {/* 6. Event details modal */}
      {selectedEvent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-3xs">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-2xl w-full max-w-2xl overflow-hidden shadow-2xl border border-slate-205"
          >
            <div className="bg-brand-dark p-6 text-white relative">
              <span className="text-[10px] uppercase font-bold text-brand-gold tracking-widest">{selectedEvent.type}</span>
              <h2 className="text-sm md:text-base font-display font-medium leading-tight mt-1">{selectedEvent.title}</h2>
              <button onClick={() => setSelectedEvent(null)} className="absolute top-4 right-4 text-white/80 hover:text-white font-bold text-lg">×</button>
            </div>
            <div className="p-6 space-y-4 text-xs max-h-[380px] overflow-y-auto">
              <div className="space-y-1">
                <span className="font-bold text-slate-400 uppercase text-[9px]">Présentation de la séance</span>
                <p className="text-slate-650 leading-relaxed text-justify">{selectedEvent.description}</p>
              </div>

              <div className="space-y-2 pt-2 border-t border-slate-100">
                <span className="font-bold text-slate-400 uppercase text-[9px]">Programme / Agenda détaillé</span>
                <div className="space-y-1.5 pl-3 border-l-2 border-brand-gold">
                  {selectedEvent.agenda.map((item, idx) => (
                    <p key={idx} className="text-slate-700 leading-normal font-medium">{item}</p>
                  ))}
                </div>
              </div>
            </div>
            <div className="p-4 bg-slate-50 border-t border-slate-150 flex justify-end">
              <button onClick={() => setSelectedEvent(null)} className="px-4 py-2 bg-slate-200 text-slate-800 font-bold rounded-lg text-xs">
                Fermer
              </button>
            </div>
          </motion.div>
        </div>
      )}

      {/* 7. News details modal */}
      {selectedNews && (
        <div className="fixed inset-0 z-50 flex flex-col items-center justify-center p-4 bg-black/65 backdrop-blur-3xs">
          <motion.div
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-2xl w-full max-w-2xl overflow-hidden shadow-2xl border border-slate-210"
          >
            <div className="relative h-56 w-full">
              <img src={selectedNews.image} alt={selectedNews.title} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-900/30 to-transparent"></div>
              <div className="absolute bottom-4 left-4 right-4 text-white">
                <span className="text-[9px] font-bold text-brand-gold uppercase tracking-wider bg-brand-gold/20 backdrop-blur-xs py-0.5 px-2 rounded border border-brand-gold/30">
                  {selectedNews.category}
                </span>
                <h2 className="text-md sm:text-lg font-display font-semibold leading-snug mt-1.5">{selectedNews.title}</h2>
              </div>
              <button onClick={() => setSelectedNews(null)} className="absolute top-4 right-4 text-white bg-slate-900/80 hover:bg-slate-900 rounded-full w-8 h-8 flex items-center justify-center font-bold">×</button>
            </div>
            <div className="p-6 space-y-4 text-xs max-h-[300px] overflow-y-auto">
              <p className="text-slate-650 font-medium leading-relaxed border-l-4 border-brand-blue pl-3 italic">
                "{selectedNews.summary}"
              </p>
              <p className="text-slate-620 leading-relaxed text-justify">
                {selectedNews.content}
              </p>
            </div>
            <div className="p-4 bg-slate-50 border-t border-slate-150 flex justify-between items-center">
              <span className="text-[10px] text-slate-400 font-mono">Publié le {selectedNews.date}</span>
              <button onClick={() => setSelectedNews(null)} className="px-4 py-2 bg-slate-200 text-slate-800 font-bold rounded-lg text-xs">
                Terminer la lecture
              </button>
            </div>
          </motion.div>
        </div>
      )}

      {/* Toast Notification Container */}
      <AnimatePresence>
        {downloadToast && (
          <motion.div
            initial={{ opacity: 0, y: 30, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            className={`fixed bottom-6 ${currentLanguage === 'ar' ? 'left-6' : 'right-6'} z-50 bg-slate-900 text-white p-4 rounded-xl shadow-2xl border border-slate-800 max-w-sm flex flex-col gap-1`}
          >
            <div className="flex items-center gap-2">
              <div className="h-2 w-2 rounded-full bg-brand-gold animate-ping"></div>
              <span className="text-[10px] uppercase tracking-wider text-brand-gold font-bold">UMMISCO Datasets</span>
            </div>
            <p className="text-xs font-semibold leading-relaxed mt-1">
              {downloadToast}
            </p>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
};
