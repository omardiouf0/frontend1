import React, { useState, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import { 
  FileText, 
  CheckCircle, 
  XCircle, 
  Award, 
  ShieldCheck, 
  Search, 
  FileSignature, 
  History, 
  Layers, 
  TrendingUp, 
  CheckCircle2, 
  HelpCircle,
  Clock,
  ThumbsUp,
  RotateCcw
} from 'lucide-react';

export const WorkflowControlHub: React.FC = () => {
  const {
    publications,
    projects,
    datasets,
    events,
    news,
    currentUser,
    currentLanguage,
    updatePublication,
    updateProject,
    updateDataset,
    updateEvent,
    updateNews,
  } = useApp();

  const isDirector = currentUser?.role === 'Directeur' || currentUser?.role === 'Admin';
  
  // Transition State Tracker
  const [selectedType, setSelectedType] = useState<string>('All');
  const [selectedStatus, setSelectedStatus] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Active inline transitions state
  const [targetStatuses, setTargetStatuses] = useState<Record<string, 'Draft' | 'Pending' | 'Approved' | 'Rejected'>>({});
  const [rejectionComments, setRejectionComments] = useState<Record<string, string>>({});
  const [showCommentBox, setShowCommentBox] = useState<Record<string, boolean>>({});
  const [vLogHistory, setVLogHistory] = useState<Array<{ id: string; title: string; type: string; from: string; to: string; comment?: string; date: string }>>([
    {
      id: "log-init-1",
      title: "Modélisation multi-agents du trafic à Dakar",
      type: "Publication",
      from: "Pending",
      to: "Approved",
      comment: "Excellent travail de simulation validé par le Conseil de Laboratoire.",
      date: "2026-06-02"
    }
  ]);

  // Combined list of all items across ALL statuses
  const allItems = useMemo(() => {
    const list: any[] = [];
    publications.forEach(p => list.push({ ...p, labelType: 'Publication', labelTypeColor: 'bg-blue-50 text-blue-700 border-blue-200' }));
    projects.forEach(p => list.push({ ...p, labelType: 'Project', labelTypeColor: 'bg-indigo-50 text-indigo-700 border-indigo-200' }));
    datasets.forEach(d => list.push({ ...d, labelType: 'Dataset', labelTypeColor: 'bg-emerald-50 text-emerald-700 border-emerald-200' }));
    events.forEach(e => list.push({ ...e, labelType: 'Event', labelTypeColor: 'bg-purple-50 text-purple-700 border-purple-200' }));
    news.forEach(n => list.push({ ...n, labelType: 'News', labelTypeColor: 'bg-cyan-50 text-cyan-700 border-cyan-200' }));

    return list;
  }, [publications, projects, datasets, events, news]);

  // Filter items dynamically
  const filteredItems = useMemo(() => {
    return allItems.filter(item => {
      const matchesType = selectedType === 'All' || item.labelType === selectedType;
      const matchesStatus = selectedStatus === 'All' || item.status === selectedStatus;
      const matchesSearch = item.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                            (item.abstract && item.abstract.toLowerCase().includes(searchQuery.toLowerCase())) ||
                            (item.description && item.description.toLowerCase().includes(searchQuery.toLowerCase()));
      return matchesType && matchesStatus && matchesSearch;
    });
  }, [allItems, selectedType, selectedStatus, searchQuery]);

  // Executive Director Instant Seal template
  const [directorSealText, setDirectorSealText] = useState(
    `VISA NUMÉRIQUE / UMMISCO-IRD - Signé par ${currentUser?.name || "Directeur Scientifique"}`
  );
  const [isSealStamped, setIsSealStamped] = useState(false);

  const triggerTransition = (item: any, finalStatus: 'Draft' | 'Pending' | 'Approved' | 'Rejected') => {
    const comment = rejectionComments[item.id] || '';
    
    // Apply update based on the entity type
    if (item.labelType === 'Publication') updatePublication(item.id, { status: finalStatus });
    else if (item.labelType === 'Project') updateProject(item.id, { status: finalStatus });
    else if (item.labelType === 'Dataset') updateDataset(item.id, { status: finalStatus });
    else if (item.labelType === 'Event') updateEvent(item.id, { status: finalStatus });
    else if (item.labelType === 'News') updateNews(item.id, { status: finalStatus });

    // Append history
    const newLog = {
      id: `log-${Date.now()}`,
      title: item.title,
      type: item.labelType,
      from: item.status,
      to: finalStatus,
      comment: comment || undefined,
      date: new Date().toISOString().split('T')[0]
    };
    setVLogHistory(prev => [newLog, ...prev]);

    // Clear local inputs
    setRejectionComments(prev => ({ ...prev, [item.id]: '' }));
    setShowCommentBox(prev => ({ ...prev, [item.id]: false }));
    setTargetStatuses(prev => {
      const copy = { ...prev };
      delete copy[item.id];
      return copy;
    });
  };

  return (
    <div className="space-y-6">
      
      {/* 1. DIGNITARY DIRECTOR'S LOUNGE AREA */}
      {isDirector && (
        <div className="bg-gradient-to-br from-brand-dark to-slate-900 border-2 border-brand-gold/40 text-white rounded-2xl p-6 shadow-xl relative overflow-hidden">
          <div className="absolute right-0 top-0 opacity-5 pointer-events-none font-black text-8xl tracking-widest mt-[-20px] select-none">
            VISA
          </div>

          <div className="grid md:grid-cols-3 gap-6 items-center">
            <div className="md:col-span-2 space-y-3">
              <div className="flex items-center gap-2">
                <div className="h-2.5 w-2.5 bg-brand-gold rounded-full animate-ping"></div>
                <span className="text-[10px] text-brand-gold font-extrabold uppercase tracking-widest flex items-center gap-1.5">
                  <Award size={14} />
                  Espace Directeur & Scientifique Certifié IRD/UCAD
                </span>
              </div>
              <h2 className="text-xl font-display font-bold leading-snug">
                Foyer de Certification des Activités Scientifiques
              </h2>
              <p className="text-slate-350 text-xs leading-relaxed">
                En tant que Directeur d'Unité et Scientifique Référent, vous possédez l'autorité absolue pour ajuster les status des publications, libérer les datasets publics ou rejeter les rapports de mission en consignant des observations de conformité académique.
              </p>

              {/* Digital Stamp Sign Generator */}
              <div className="pt-2 flex flex-col sm:flex-row items-stretch gap-2 max-w-lg">
                <input
                  type="text"
                  value={directorSealText}
                  onChange={e => setDirectorSealText(e.target.value)}
                  className="bg-white/10 border border-white/20 px-3 py-1.5 rounded-lg text-xs font-mono text-brand-gold placeholder-slate-400 focus:outline-hidden focus:ring-1 focus:ring-brand-gold"
                  placeholder="Inscrire le visa électronique officiel..."
                />
                <button
                  onClick={() => setIsSealStamped(true)}
                  className="px-4 py-1.5 bg-brand-gold text-slate-950 font-bold text-xs rounded-lg hover:bg-brand-gold/90 transition-all cursor-pointer flex items-center justify-center gap-1.5"
                >
                  <FileSignature size={14} />
                  Appliquer le Sceau Officiel
                </button>
              </div>

              {isSealStamped && (
                <div className="p-3 bg-brand-gold/10 border border-brand-gold/30 rounded-xl max-w-md animate-fadeIn flex items-center gap-3">
                  <ShieldCheck className="text-brand-gold" size={24} />
                  <div>
                    <span className="text-[9px] font-bold text-brand-gold block uppercase tracking-wider">SCEAU NUMÉRIQUE ACTIF</span>
                    <p className="text-[11px] text-slate-300 font-mono italic">{directorSealText}</p>
                  </div>
                  <button 
                    onClick={() => setIsSealStamped(false)} 
                    className="text-[10px] text-slate-400 hover:text-white underline ml-auto cursor-pointer"
                  >
                    Effacer
                  </button>
                </div>
              )}
            </div>

            {/* Quick KPIs Grid */}
            <div className="bg-white/5 border border-white/10 rounded-2xl p-4 space-y-4 grid grid-cols-2 gap-2 md:block">
              <div>
                <span className="block text-[10px] text-slate-400 uppercase tracking-wider">Ajustements en attente</span>
                <div className="flex items-baseline gap-2 mt-1">
                  <span className="text-3xl font-bold font-mono text-brand-gold">
                    {allItems.filter(i => i.status === 'Pending').length}
                  </span>
                  <span className="text-[10px] text-amber-400 font-semibold uppercase font-mono">Pending</span>
                </div>
              </div>
              <div className="h-[1px] bg-white/10 my-1 hidden md:block"></div>
              <div>
                <span className="block text-[10px] text-slate-400 uppercase tracking-wider">Validés (En Ligne)</span>
                <div className="flex items-baseline gap-2 mt-1">
                  <span className="text-3xl font-bold font-mono text-emerald-400">
                    {allItems.filter(i => i.status === 'Approved').length}
                  </span>
                  <span className="text-[10px] text-emerald-400 font-semibold uppercase font-mono">Approved</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 2. MAIN HUB INTERACTION CONTROL BOARD */}
      <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-xs p-6 space-y-6">
        
        {/* Header summary of filters */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100 pb-4">
          <div className="space-y-1">
            <h3 className="font-display font-bold text-sm text-slate-800">
              Console de Transition d'État & Workflow
            </h3>
            <p className="text-xs text-slate-500">
              Transborde les fiches scientifiques à travers toute la pépinière de publication : Brouillon (Draft), Soumis (Pending), Approuvé (Approved), Rejeté (Rejected).
            </p>
          </div>

          {/* Quick search input */}
          <div className="relative max-w-sm">
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Filtrer l'unité scientifique..."
              className="w-full bg-slate-50 border border-slate-205 py-2 pl-3 pr-8 rounded-lg text-xs font-semibold focus:bg-white focus:outline-brand-blue"
            />
            <Search className="absolute right-2.5 top-2.5 text-slate-400" size={14} />
          </div>
        </div>

        {/* 2.1 CATEGORIES SELECTOR SLIDER */}
        <div className="flex flex-wrap gap-2 items-center text-xs select-none">
          <span className="font-bold text-slate-400 uppercase tracking-widest text-[9.5px] mr-2">Entité :</span>
          {['All', 'Publication', 'Project', 'Dataset', 'Event', 'News'].map(type => (
            <button
              key={type}
              onClick={() => setSelectedType(type)}
              className={`px-3 py-1.5 rounded-lg border text-xs font-bold transition-all cursor-pointer ${
                selectedType === type
                  ? 'bg-brand-blue text-white border-brand-blue shadow-xs'
                  : 'bg-slate-50 text-slate-500 border-slate-200 hover:text-slate-800 hover:bg-slate-100'
              }`}
            >
              {type === 'All' ? 'Tous' : type}
            </button>
          ))}
        </div>

        {/* 2.2 STATUS SELECTOR PIPES */}
        <div className="flex flex-wrap gap-2 items-center text-xs select-none">
          <span className="font-bold text-slate-400 uppercase tracking-widest text-[9.5px] mr-2">Status :</span>
          {['All', 'Draft', 'Pending', 'Approved', 'Rejected'].map(status => (
            <button
              key={status}
              onClick={() => setSelectedStatus(status)}
              className={`px-3 py-1.5 rounded-lg border text-xs font-bold transition-all cursor-pointer ${
                selectedStatus === status
                  ? 'bg-slate-900 text-white border-slate-900 shadow-xs'
                  : 'bg-slate-50 text-slate-500 border-slate-200 hover:text-slate-800'
              }`}
            >
              {status === 'All' ? 'Tous les Statuts' : status}
            </button>
          ))}
        </div>

        {/* 3. CORE RECORDS WORKFLOW STEPPERS */}
        <div className="space-y-4">
          {filteredItems.map((item) => {
            const currentTarget = targetStatuses[item.id] || item.status;
            const updatedComment = rejectionComments[item.id] || '';
            const isCommentBoxVisible = showCommentBox[item.id] || false;
            
            return (
              <div
                key={item.id}
                className={`border p-5 rounded-2xl bg-slate-50/50 flex flex-col lg:flex-row justify-between gap-5 transition-all shadow-3xs ${
                  item.status === 'Approved'
                    ? 'border-emerald-100 bg-emerald-50/5'
                    : item.status === 'Rejected'
                    ? 'border-rose-100 bg-rose-50/5'
                    : 'border-slate-200 hover:border-slate-300'
                }`}
              >
                {/* Meta details */}
                <div className="space-y-3 flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className={`text-[9.5px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full border ${item.labelTypeColor}`}>
                      {item.labelType}
                    </span>
                    <span className={`text-[10px] font-bold py-0.5 px-2 rounded-full ${
                      item.status === 'Approved'
                        ? 'bg-emerald-100 text-emerald-800'
                        : item.status === 'Rejected'
                        ? 'bg-rose-100 text-rose-800'
                        : item.status === 'Pending'
                        ? 'bg-amber-100 text-amber-800 animate-pulse'
                        : 'bg-slate-200 text-slate-700'
                    }`}>
                      {item.status}
                    </span>
                    <span className="text-[10px] text-slate-400 font-mono tracking-tight leading-none">
                      Création: {item.createdAt} • ID: {item.id}
                    </span>
                  </div>

                  <div className="space-y-1">
                    <h4 className="text-sm font-semibold text-slate-800 leading-snug font-display">
                      {item.title}
                    </h4>
                    <p className="text-[11.5px] text-slate-500 leading-relaxed max-w-3xl line-clamp-2">
                      {item.description || item.abstract || item.summary || 'Aucune description disponible.'}
                    </p>
                  </div>

                  {/* Authors / Journals info */}
                  <div className="flex items-center gap-4 text-[10px] text-slate-450 border-t border-slate-100 pt-2 font-semibold">
                    {item.authors && (
                      <div>
                        <span className="text-slate-400 font-normal">Auteurs:</span> {item.authors.join(', ')}
                      </div>
                    )}
                    {item.axisId && (
                      <div>
                        <span className="text-slate-400 font-normal">Axe Thématique:</span> {item.axisId}
                      </div>
                    )}
                  </div>
                </div>

                {/* VISUAL STEPPER CONTROLLER */}
                <div className="lg:w-[420px] bg-white border border-slate-205 rounded-xl p-4 flex flex-col justify-between shadow-3xs gap-4">
                  <div className="space-y-2">
                    <span className="text-[9.5px] font-bold text-slate-400 uppercase tracking-widest block">PIPELINE DE SÉCURITÉ SCIENTIFIQUE</span>
                    
                    {/* Stepper bubbles tracks */}
                    <div className="flex justify-between items-center relative py-2 select-none">
                      <div className="absolute top-1/2 left-0 right-0 h-[2px] bg-slate-200 transform -translate-y-1/2 -z-0"></div>
                      
                      {(['Draft', 'Pending', 'Approved', 'Rejected'] as const).map((step, sIdx) => {
                        const isActive = item.status === step;
                        const isTarget = currentTarget === step;
                        
                        return (
                          <button
                            key={step}
                            onClick={() => {
                              // Setting target state
                              setTargetStatuses(prev => ({ ...prev, [item.id]: step }));
                              if (step === 'Rejected') {
                                setShowCommentBox(prev => ({ ...prev, [item.id]: true }));
                              } else {
                                setShowCommentBox(prev => ({ ...prev, [item.id]: false }));
                              }
                            }}
                            className="relative z-10 flex flex-col items-center group cursor-pointer"
                          >
                            <div className={`h-7 w-7 rounded-full border-2 flex items-center justify-center transition-all ${
                              isActive 
                                ? 'bg-brand-blue text-white border-brand-blue scale-110 shadow-3xs'
                                : isTarget
                                ? 'bg-amber-500 text-white border-amber-500 scale-110 animate-pulse'
                                : 'bg-slate-100 hover:bg-slate-200 text-slate-500 border-slate-300'
                            }`}>
                              {step === 'Approved' && <CheckCircle2 size={13} />}
                              {step === 'Rejected' && <XCircle size={13} />}
                              {step === 'Pending' && <Clock size={13} />}
                              {step === 'Draft' && <HelpCircle size={13} />}
                            </div>
                            <span className={`text-[8.5px] font-bold mt-1 tracking-tight ${
                              isActive 
                                ? 'text-brand-blue font-extrabold'
                                : isTarget
                                ? 'text-amber-600 font-extrabold'
                                : 'text-slate-400'
                            }`}>
                              {step}
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Comment box toggled for rejected, or explicitly chosen */}
                  {(isCommentBoxVisible || currentTarget === 'Rejected') && (
                    <div className="space-y-1.5 animate-fadeIn">
                      <label className="text-[10px] font-bold text-rose-600 block">Motif du rejet / Note administrative :</label>
                      <textarea
                        value={updatedComment}
                        onChange={e => setRejectionComments(prev => ({ ...prev, [item.id]: e.target.value }))}
                        placeholder="Ex: Erreur d'affiliation ou d'Axe de recherche..."
                        className="w-full text-[11px] p-2 bg-rose-50/30 border border-rose-200 rounded-lg text-slate-700"
                        rows={2}
                      />
                    </div>
                  )}

                  {/* Action submit button */}
                  {currentTarget !== item.status && (
                    <div className="flex gap-1.5 animate-fadeIn">
                      <button
                        onClick={() => {
                          triggerTransition(item, currentTarget);
                        }}
                        className="flex-1 py-1.5 bg-brand-gold text-slate-900 font-bold text-xs rounded-lg transition-colors cursor-pointer text-center"
                      >
                        Appliquer transition ({currentTarget})
                      </button>
                      <button
                        onClick={() => {
                          // Clear transition override
                          setTargetStatuses(prev => {
                            const copy = { ...prev };
                            delete copy[item.id];
                            return copy;
                          });
                          setShowCommentBox(prev => ({ ...prev, [item.id]: false }));
                        }}
                        className="p-1 px-2.5 bg-slate-100 text-slate-500 rounded-lg text-xs hover:bg-slate-200 cursor-pointer"
                        title="Annuler"
                      >
                        <RotateCcw size={14} />
                      </button>
                    </div>
                  )}
                </div>

              </div>
            );
          })}

          {filteredItems.length === 0 && (
            <div className="bg-slate-50 border border-dashed border-slate-210 rounded-2xl p-12 text-center text-slate-400 space-y-2">
              <Clock size={32} className="mx-auto text-slate-350" />
              <p className="text-xs font-semibold">Aucune fiche ne correspond à vos filtres.</p>
              <p className="text-[10px]">Modifiez les boutons d'entités ou de statuts pour élargir votre recherche scientifique.</p>
            </div>
          )}
        </div>

        {/* 4. WORKFLOW TRANSACTION LOG HISTORIES */}
        <div className="border-t border-slate-100 pt-6 space-y-3">
          <div className="flex items-center gap-2">
            <History size={16} className="text-slate-500" />
            <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider">
              Historique des Mutations et Validations
            </h4>
          </div>

          <div className="space-y-2 max-h-40 overflow-y-auto pr-2">
            {vLogHistory.map((log) => (
              <div key={log.id} className="bg-slate-50 border border-slate-205 py-2 px-3 rounded-xl text-[10.5px] font-semibold flex justify-between items-center gap-4 text-slate-650">
                <div className="space-y-0.5">
                  <span className="text-[9px] text-[#3B6FA0] uppercase font-bold pr-1">[{log.type}]</span>
                  <span className="text-slate-800">{log.title}</span>
                  {log.comment && (
                    <p className="text-[9.5px] italic text-rose-600 mt-0.5">Commentaire: {log.comment}</p>
                  )}
                </div>

                <div className="flex items-center gap-2 font-mono shrink-0">
                  <span className="bg-slate-200 font-bold px-1.5 py-0.5 rounded text-[9.5px]">{log.from}</span>
                  <span>→</span>
                  <span className={`px-1.5 py-0.5 rounded text-[9.5px] font-bold ${
                    log.to === 'Approved'
                      ? 'bg-emerald-100 text-emerald-800'
                      : log.to === 'Rejected'
                      ? 'bg-rose-100 text-rose-800'
                      : 'bg-amber-100 text-amber-800'
                  }`}>{log.to}</span>
                  <span className="text-slate-400 text-[9px] text-[8.5px] pl-1">{log.date}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>

    </div>
  );
};
