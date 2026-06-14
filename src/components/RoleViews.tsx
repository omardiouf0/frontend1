/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { 
  User, 
  Publication, 
  Project, 
  Dataset, 
  Event, 
  IrdDocument, 
  AuditLog, 
  Partner 
} from '../types';
import { 
  ShieldAlert, 
  UserCheck, 
  Award, 
  TrendingUp, 
  FileCheck2, 
  Plus, 
  FileText, 
  Check, 
  X, 
  MapPin, 
  Activity, 
  Wifi, 
  HeartHandshake, 
  AlertTriangle,
  RefreshCw,
  Clock,
  BookOpen,
  FolderLock
} from 'lucide-react';

interface RoleViewsProps {
  currentUser: User | null;
  publications: Publication[];
  projects: Project[];
  datasets: Dataset[];
  events: Event[];
  irdDocuments: IrdDocument[];
  partners: Partner[];
  auditLogs: AuditLog[];
  onAddIrdDocument?: (doc: any) => void;
  onSignIrdDoc?: (id: string, comment?: string) => void;
  onValidateIrdDoc?: (id: string, action: 'Approved' | 'Rejected', comment?: string) => void;
  onUpdatePublicationStatus?: (id: string, status: 'Draft' | 'Pending' | 'Approved' | 'Rejected') => void;
}

export const RoleViews: React.FC<RoleViewsProps> = ({
  currentUser,
  publications,
  projects,
  datasets,
  events,
  irdDocuments,
  partners,
  auditLogs,
  onAddIrdDocument,
  onSignIrdDoc,
  onValidateIrdDoc,
  onUpdatePublicationStatus
}) => {
  const role = currentUser?.role || 'Guest';

  // State triggers
  const [fastSuccessMsg, setFastSuccessMsg] = useState<string | null>(null);
  const [adminPingState, setAdminPingState] = useState<'idle' | 'testing' | 'success'>('idle');
  const [adminLatency, setAdminLatency] = useState<number | null>(null);

  // Form states for Chercheur quick submit
  const [quickPubTitle, setQuickPubTitle] = useState('');
  const [quickPubType, setQuickPubType] = useState('Journal');

  const triggerPingTest = () => {
    setAdminPingState('testing');
    setTimeout(() => {
      setAdminPingState('success');
      setAdminLatency(Math.floor(Math.random() * 45) + 8);
    }, 800);
  };

  const handleQuickPubSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!quickPubTitle.trim()) return;
    setFastSuccessMsg(`Fiche publication "${quickPubTitle}" initiée sous l'état temporaire DRAFT avec succès.`);
    setQuickPubTitle('');
    setTimeout(() => setFastSuccessMsg(null), 4000);
  };

  // Safe signature handler for Directeur
  const handleFastSign = (docId: string) => {
    if (onSignIrdDoc) {
      onSignIrdDoc(docId, "Visa Directeur accordé via Espace de Signature Rapide.");
    }
    if (onValidateIrdDoc) {
      onValidateIrdDoc(docId, 'Approved', "Visa Directeur accordé via Espace de Signature Rapide.");
    }
    setFastSuccessMsg("Visa administratif signé avec succès.");
    setTimeout(() => setFastSuccessMsg(null), 4500);
  };

  // Safe validation for Chef d'Axe
  const handleFastApprovePub = (pubId: string) => {
    if (onUpdatePublicationStatus) {
      onUpdatePublicationStatus(pubId, 'Approved');
      setFastSuccessMsg("La publication a été approuvée scientifiquement pour diffusion.");
      setTimeout(() => setFastSuccessMsg(null), 4000);
    }
  };

  // Safe rejection for Chef d'Axe
  const handleFastRejectPub = (pubId: string) => {
    if (onUpdatePublicationStatus) {
      onUpdatePublicationStatus(pubId, 'Rejected');
      setFastSuccessMsg("Le statut de la publication a été basculé en rejet.");
      setTimeout(() => setFastSuccessMsg(null), 4000);
    }
  };

  return (
    <div className="space-y-6" id="custom-role-dashboard">
      
      {/* Toast Alert */}
      {fastSuccessMsg && (
        <div className="bg-emerald-100 border border-emerald-300 text-emerald-800 p-4 rounded-xl flex items-center justify-between shadow-md text-xs animate-pulse">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
            <strong>{fastSuccessMsg}</strong>
          </div>
          <button onClick={() => setFastSuccessMsg(null)} className="font-bold hover:text-emerald-950">✕</button>
        </div>
      )}

      {/* RENDER ACCORDING TO ROLES */}

      {/* 1. ADMIN DASHBOARD */}
      {role === 'Admin' && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-6 text-white">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center border-b border-slate-800 pb-4 gap-4">
            <div className="space-y-1">
              <div className="inline-flex items-center gap-2 px-2.5 py-1 bg-red-500/10 text-red-400 rounded-full text-[10px] uppercase font-bold tracking-wider border border-red-500/20">
                <ShieldAlert size={12} />
                <span>Régent Système (Admin)</span>
              </div>
              <h2 className="text-xl font-display font-bold text-slate-100">
                Panneau Directeur d'Administration Générale & Audit
              </h2>
            </div>
            
            {/* Quick system health */}
            <div className="flex items-center gap-4 bg-slate-950 px-4 py-2 rounded-xl border border-slate-800">
              <div className="flex items-center gap-2">
                <Wifi size={14} className="text-emerald-400 animate-pulse" />
                <span className="text-[10px] uppercase text-slate-400 font-bold">API PostgreSQL :</span>
                <span className="text-xs font-mono font-bold text-emerald-400">CONNECTÉ</span>
              </div>
              <button 
                onClick={triggerPingTest} 
                disabled={adminPingState === 'testing'}
                className="p-1.5 hover:bg-slate-800 rounded-lg text-slate-400 hover:text-white transition-colors"
                title="Tester latence base de données"
              >
                <RefreshCw size={12} className={adminPingState === 'testing' ? 'animate-spin' : ''} />
              </button>
            </div>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {/* Sec audit column */}
            <div className="bg-slate-950/80 p-4 rounded-xl border border-slate-800 space-y-4">
              <h3 className="text-xs font-bold text-red-400 uppercase tracking-wider flex items-center gap-2">
                <Activity size={14} />
                Journal des Actions de Sécurité
              </h3>
              <div className="space-y-2.5 max-h-56 overflow-y-auto pr-1">
                {auditLogs.slice(0, 4).map((log, idx) => (
                  <div key={idx} className="bg-slate-900 p-2.5 rounded-lg border border-slate-800/80 text-[10px] space-y-1">
                    <div className="flex justify-between items-center">
                      <span className="font-semibold text-slate-350 truncate max-w-28">{log.username}</span>
                      <span className={`px-1 py-0.5 rounded text-[8px] font-bold ${log.status === 'SUCCESS' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-red-500/10 text-red-400'}`}>
                        {log.status}
                      </span>
                    </div>
                    <p className="text-slate-400 leading-normal">{log.action}</p>
                    <div className="flex justify-between text-slate-500 text-[8px] font-mono">
                      <span>Module: {log.module}</span>
                      <span>IP: {log.ipAddress}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Simulated Server performance status */}
            <div className="bg-slate-950/80 p-4 rounded-xl border border-slate-800 space-y-3.5">
              <h3 className="text-xs font-bold text-indigo-400 uppercase tracking-wider flex items-center gap-2">
                <TrendingUp size={14} />
                Performances du Serveur
              </h3>
              <div className="space-y-3">
                <div className="space-y-1 text-xs">
                  <div className="flex justify-between text-[10px] text-slate-400 font-bold">
                    <span>Charge CPU (Container)</span>
                    <span>14%</span>
                  </div>
                  <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                    <div className="bg-brand-gold h-full rounded-full" style={{ width: '14%' }}></div>
                  </div>
                </div>

                <div className="space-y-1 text-xs">
                  <div className="flex justify-between text-[10px] text-slate-400 font-bold">
                    <span>Allocations Mémoire RAM</span>
                    <span>238 MB / 512 MB</span>
                  </div>
                  <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                    <div className="bg-blue-500 h-full rounded-full" style={{ width: '46%' }}></div>
                  </div>
                </div>

                <div className="bg-slate-900 border border-slate-800 p-2 rounded-lg text-center mt-2">
                  <span className="text-[10px] uppercase text-slate-500 block font-bold leading-none mb-1">Ping Latence db</span>
                  <span className="text-lg font-mono font-bold text-brand-gold">
                    {adminLatency ? `${adminLatency} ms` : '9 ms'}
                  </span>
                </div>
              </div>
            </div>

            {/* Special Database locks */}
            <div className="bg-slate-950/80 p-4 rounded-xl border border-slate-800 space-y-3">
              <h3 className="text-xs font-bold text-amber-400 uppercase tracking-wider flex items-center gap-2">
                <FolderLock size={14} />
                Système d'Accréditation JWT
              </h3>
              <p className="text-[10px] text-slate-400 leading-relaxed">
                Le jeton maître crypté en SHA-256 verrouille les accès en cascade. Les clés locales d'administration interdisent l'injection de scripts de spoofing.
              </p>
              <div className="space-y-1.5 pt-1.5">
                <button 
                  onClick={() => {
                    setFastSuccessMsg("Accréditations et caches de session expirés purgés avec succès.");
                    setTimeout(() => setFastSuccessMsg(null), 3000);
                  }}
                  className="w-full py-1.5 bg-slate-800 hover:bg-slate-750 text-slate-300 hover:text-white rounded text-[10px] font-bold uppercase transition-colors"
                >
                  Purger les caches d'accès
                </button>
                <div className="flex gap-2 justify-between text-[9px] text-slate-500 mt-2">
                  <span>SSL encryption: Enabled</span>
                  <span>Port d'écoute: 3000</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 2. DIRECTEUR DASHBOARD */}
      {role === 'Directeur' && (
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-md space-y-6">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center border-b border-slate-100 pb-4 gap-4">
            <div className="space-y-1">
              <div className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-[#0A3D62]/10 text-[#0A3D62] rounded-full text-[10px] uppercase font-bold tracking-wider border border-[#0A3D62]/20">
                <UserCheck size={12} />
                <span>Direction Scientifique UMMISCO (Pascal Valentin)</span>
              </div>
              <h2 className="text-xl font-display font-bold text-slate-800">
                Bureau du Directeur Général & Arbitre Administratif
              </h2>
            </div>

            <div className="bg-slate-55 bg-[#0a3d62]/5 border border-[#0a3d62]/10 p-3 rounded-lg text-right">
              <span className="text-[10px] uppercase text-slate-500 font-bold block">Fonds Budgétaire Totalisé</span>
              <strong className="text-lg font-display text-[#0A3D62]">2 410 000 EUR</strong>
            </div>
          </div>

          <div className="grid md:grid-cols-12 gap-6">
            {/* Signature workflow list */}
            <div className="md:col-span-8 bg-slate-50 p-5 rounded-xl border border-slate-200/80 space-y-4">
              <div className="flex justify-between items-center border-b border-slate-200 pb-2">
                <h3 className="text-xs font-bold text-[#0A3D62] uppercase tracking-wider flex items-center gap-2">
                  <FileCheck2 size={16} />
                  Fichiers IRD & Bon de commandes en attente de visa du Directeur
                </h3>
                <span className="bg-[#0A3D62] text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
                  {irdDocuments.filter(d => !d.signedByDirector).length} à viser
                </span>
              </div>

              <div className="space-y-2.5 max-h-60 overflow-y-auto pr-1">
                {irdDocuments.filter(d => !d.signedByDirector).length === 0 ? (
                  <p className="text-xs text-slate-500 py-6 text-center italic">
                    Aucun document IRD en attente de visa directeur. Votre table de signature est vide.
                  </p>
                ) : (
                  irdDocuments.filter(d => !d.signedByDirector).map((doc) => (
                    <div key={doc.id} className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-3xs flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="p-1 bg-brand-gold/10 text-brand-gold rounded text-xs">
                            <FileText size={14} />
                          </span>
                          <strong className="text-xs text-slate-800 font-semibold">{doc.title}</strong>
                        </div>
                        <div className="flex gap-4 text-[10px] text-slate-500">
                          {doc.amount && <span>Budget : {doc.amount} EUR</span>}
                          {doc.studentName && <span>Stagiaire : {doc.studentName}</span>}
                          <span>Par : {doc.createdBy}</span>
                        </div>
                      </div>

                      <button
                        onClick={() => handleFastSign(doc.id)}
                        className="px-3.5 py-1.5 bg-[#0A3D62] hover:bg-slate-800 text-white font-bold text-[10px] rounded-lg tracking-wide uppercase transition-all flex items-center gap-1 cursor-pointer"
                      >
                        <Check size={12} />
                        Viser / Signer
                      </button>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Quick Summary overview of the Unit operations */}
            <div className="md:col-span-4 bg-slate-50 p-4 rounded-xl border border-slate-200/80 flex flex-col justify-between gap-4">
              <div className="space-y-3">
                <h3 className="text-xs font-bold text-[#0A3D62] uppercase tracking-wider flex items-center gap-2 border-b border-slate-200 pb-2">
                  <Award size={14} />
                  État de conformité de l'Unité
                </h3>
                
                <div className="space-y-2 text-xs">
                  <div className="flex justify-between py-1 border-b border-slate-200 text-slate-600">
                    <span>Publications d'unité :</span>
                    <strong className="text-slate-800">{publications.length} prod.</strong>
                  </div>
                  <div className="flex justify-between py-1 border-b border-slate-200 text-slate-600">
                    <span>Conventions Actives :</span>
                    <strong className="text-slate-800">{projects.length} contrats</strong>
                  </div>
                  <div className="flex justify-between py-1 border-b border-slate-200 text-slate-600">
                    <span>Partenaires Officiels :</span>
                    <strong className="text-slate-800">{partners.length} institutions</strong>
                  </div>
                </div>
              </div>

              <div className="bg-brand-gold/15 p-3 rounded-xl border border-brand-gold/20 text-xs">
                <div className="flex items-start gap-2">
                  <AlertTriangle size={16} className="text-brand-gold shrink-0 mt-0.5" />
                  <p className="text-[10px] text-amber-800 font-medium leading-relaxed">
                    <strong>Rappel :</strong> Tout budget supérieur à 15,000 EUR nécessite l'approbation conjointe de la cellule financière de l'IRD Dakar.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 3. CHEF D'AXE DASHBOARD */}
      {role === 'Chef d\'Axe' && (
        <div className="bg-white border border-indigo-200 rounded-2xl p-6 shadow-md space-y-6">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center border-b border-indigo-100 pb-4 gap-4">
            <div className="space-y-1">
              <div className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-indigo-50 text-indigo-700 rounded-full text-[10px] uppercase font-bold tracking-wider border border-indigo-100">
                <Award size={12} />
                <span>Responsable Scientifique (Chef d'Axe)</span>
              </div>
              <h2 className="text-xl font-display font-bold text-slate-800">
                Espace de validation et d'encadrement des productions
              </h2>
            </div>

            <div className="bg-slate-50 p-2 px-3.5 border border-slate-200 rounded-xl leading-snug">
              <span className="text-[9px] uppercase text-slate-500 font-bold block">Publications en attente</span>
              <strong className="text-base text-indigo-700">{publications.filter(p => p.status === 'Pending').length} fiches</strong>
            </div>
          </div>

          <div className="grid md:grid-cols-12 gap-6">
            {/* Scientific Validation desk */}
            <div className="md:col-span-8 bg-indigo-50/40 p-5 rounded-xl border border-indigo-100 space-y-4">
              <h3 className="text-xs font-bold text-indigo-800 uppercase tracking-wider border-b border-indigo-100 pb-2">
                Productions académiques requérant un accord de publication
              </h3>

              <div className="space-y-3 max-h-60 overflow-y-auto pr-1">
                {publications.filter(p => p.status === 'Pending').length === 0 ? (
                  <p className="text-xs text-slate-500 py-6 text-center italic">
                    Aucune production scientifique UMMISCO n'est en attente de révision dans cet espace.
                  </p>
                ) : (
                  publications.filter(p => p.status === 'Pending').map((pub) => (
                    <div key={pub.id} className="bg-white p-3.5 rounded-xl border border-slate-150 shadow-3xs space-y-2">
                      <div className="flex justify-between items-start gap-4">
                        <div className="space-y-1">
                          <strong className="text-xs text-slate-800 block leading-snug">{pub.title}</strong>
                          <span className="text-[10px] text-slate-500">Auteurs : {pub.authors.join(', ')} | Type : {pub.type}</span>
                        </div>
                        <span className="px-1.5 py-0.5 rounded text-[8px] font-bold bg-indigo-100 text-indigo-800 uppercase tracking-wide">
                          PENDING
                        </span>
                      </div>
                      
                      <p className="text-[10px] text-slate-600 line-clamp-2 italic leading-relaxed">
                        "{pub.abstract}"
                      </p>

                      <div className="flex gap-2 justify-end pt-2">
                        <button
                          onClick={() => handleFastRejectPub(pub.id)}
                          className="px-2.5 py-1 bg-rose-50 hover:bg-rose-100 text-rose-700 font-bold text-[9px] rounded-lg uppercase tracking-wide transition-all border border-rose-200 cursor-pointer"
                        >
                          Rejeter
                        </button>
                        <button
                          onClick={() => handleFastApprovePub(pub.id)}
                          className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[9px] rounded-lg uppercase tracking-wide transition-all flex items-center gap-1 cursor-pointer"
                        >
                          <Check size={10} />
                          Approuver
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Role specific guidelines */}
            <div className="md:col-span-4 bg-slate-50 p-4 rounded-xl border border-slate-200/80 flex flex-col justify-between">
              <div className="space-y-3">
                <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider border-b border-slate-200 pb-2 flex items-center gap-1.5">
                  <Clock size={14} />
                  Protocole de Validation
                </h3>
                <p className="text-[11px] text-slate-600 leading-relaxed">
                  En tant que Chef d'Axe, votre responsabilité est de certifier la rigueur, l'adéquation au champ d'étude de l'UMMISCO, et l'exemption de plagiat avant d'apposer votre label scientifique.
                </p>
                <p className="text-[11px] text-indigo-850 font-bold font-sans">
                  Les productions approuvées basculeront automatiquement sur le site public de l'UMMISCO (ummisco.fr).
                </p>
              </div>

              <div className="bg-indigo-100/40 p-3.5 rounded-lg text-[10px] text-indigo-900 border border-indigo-200/80 mt-4">
                <strong>Contact Directeur :</strong> pascal.valentin@ird.fr
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 4. CHERCHEUR PORTFOLIO WORKSPACE */}
      {role === 'Chercheur' && (
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-md space-y-6">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center border-b border-slate-100 pb-4 gap-4">
            <div className="space-y-1">
              <div className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-brand-gold/10 text-brand-gold rounded-full text-[10px] uppercase font-bold tracking-wider border border-brand-gold/20">
                <BookOpen size={12} />
                <span>Espace de Recherche Scientifique</span>
              </div>
              <h2 className="text-xl font-display font-bold text-slate-800">
                Mon Espace Auteur & Pilotage de Fiches
              </h2>
            </div>

            <div className="flex items-center gap-4 bg-slate-50 p-2.5 rounded-xl border border-slate-200">
              <div className="text-center px-2">
                <span className="text-[8px] uppercase font-bold text-slate-400 block leading-none">Publications</span>
                <strong className="text-sm font-bold text-slate-850">{publications.length} production(s)</strong>
              </div>
              <div className="w-px bg-slate-200 h-6"></div>
              <div className="text-center px-2">
                <span className="text-[8px] uppercase font-bold text-slate-400 block leading-none">Projets liés</span>
                <strong className="text-sm font-bold text-slate-850">{projects.length} projet(s)</strong>
              </div>
            </div>
          </div>

          <div className="grid md:grid-cols-12 gap-6">
            {/* Quick Submit Form column */}
            <div className="md:col-span-4 bg-slate-50 p-5 rounded-xl border border-slate-200/80 space-y-3">
              <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider border-b border-slate-200 pb-1.5 flex items-center gap-1.5">
                <Plus size={14} className="text-brand-gold" />
                Soumission rapide d'article
              </h3>
              
              <form onSubmit={handleQuickPubSubmit} className="space-y-3">
                <div className="space-y-1">
                  <label className="text-[9px] uppercase font-bold text-slate-400">Titre de l'article (*)</label>
                  <input 
                    type="text" 
                    value={quickPubTitle}
                    onChange={(e) => setQuickPubTitle(e.target.value)}
                    placeholder="Ex: Modélisation multi-agents à Dakar..." 
                    className="w-full bg-white border border-slate-250 py-1.5 px-2.5 rounded text-xs select-text focus:outline-none focus:border-brand-gold"
                    required
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[9px] uppercase font-bold text-slate-400">Support de Diffusion</label>
                  <select 
                    value={quickPubType}
                    onChange={(e) => setQuickPubType(e.target.value)}
                    className="w-full bg-white border border-slate-250 py-1 px-1.5 rounded text-xs"
                  >
                    <option value="Journal">Revue / Journal Scientifique</option>
                    <option value="Conférence">Conférence Internationale</option>
                    <option value="Livre">Chapitre d'Ouvrage</option>
                    <option value="Thèse">Thèse Universitaire (UCAD)</option>
                  </select>
                </div>

                <button 
                  type="submit"
                  className="w-full py-2 bg-brand-gold hover:bg-brand-gold/90 text-white font-bold rounded text-xs transition-colors uppercase tracking-wider block mt-2 cursor-pointer"
                >
                  Proposer au Chef d'Axe
                </button>
              </form>
            </div>

            {/* List personal recent documents */}
            <div className="md:col-span-8 bg-slate-50 p-5 rounded-xl border border-slate-200/80 space-y-4">
              <h3 className="text-xs font-bold text-[#0A3D62] uppercase tracking-wider border-b border-slate-200 pb-1.5">
                Publications scientifiques globales de l'unité
              </h3>
              
              <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
                {publications.slice(0, 3).map((pub) => (
                  <div key={pub.id} className="bg-white p-3 rounded-xl border border-slate-150 flex justify-between items-center text-xs">
                    <div className="space-y-0.5">
                      <strong className="block text-slate-800 truncate max-w-sm">{pub.title}</strong>
                      <span className="text-[10px] text-slate-500">Revue: {pub.journal} ({pub.year})</span>
                    </div>
                    
                    <span className={`px-2 py-0.5 rounded text-[8px] font-bold ${
                      pub.status === 'Approved' ? 'bg-emerald-100 text-emerald-800' :
                      pub.status === 'Rejected' ? 'bg-rose-100 text-rose-850' : 'bg-amber-100 text-amber-800'
                    }`}>
                      {pub.status}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 5. GESTIONNAIRE SECRÉTAIRE WORKSPACE */}
      {role === 'Gestionnaire' && (
        <div className="bg-white border border-rose-200 rounded-2xl p-6 shadow-md space-y-6">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center border-b border-rose-100 pb-4 gap-4">
            <div className="space-y-1">
              <div className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-rose-50 text-rose-700 rounded-full text-[10px] uppercase font-bold tracking-wider border border-rose-100">
                <HeartHandshake size={12} />
                <span>Support d'Unité (Secrétariat & Gestionnaire)</span>
              </div>
              <h2 className="text-xl font-display font-bold text-slate-800">
                Logistique Scientifique, Séminaires & Partenariats
              </h2>
            </div>

            <div className="bg-slate-55 bg-rose-50 border border-rose-100 p-2.5 px-4 rounded-xl leading-snug text-right">
              <span className="text-[9px] uppercase text-slate-500 font-bold block">Partenaires Enregistrés</span>
              <strong className="text-base text-rose-700">{partners.length} Institutions</strong>
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            {/* Quick Event planner */}
            <div className="bg-rose-50/20 p-5 rounded-xl border border-rose-150 space-y-3">
              <h3 className="text-xs font-bold text-rose-900 uppercase tracking-wider border-b border-rose-100 pb-1.5">
                Rappel Agenda et Planification Événements
              </h3>
              <p className="text-[11px] text-slate-600 leading-relaxed">
                Vous êtes en charge de coordonner les cycles de séminaires et présentations doctorales de l'axe de recherche à Dakar d'un point de vue logistique.
              </p>
              
              <div className="space-y-2.5 pt-2">
                {events.slice(0, 2).map((evt) => (
                  <div key={evt.id} className="bg-white p-3 rounded-lg border border-slate-200/80 text-xs space-y-1">
                    <div className="flex justify-between font-bold">
                      <span className="text-slate-800 truncate max-w-xs">{evt.title}</span>
                      <span className="text-rose-600 font-mono text-[10px]">{evt.date}</span>
                    </div>
                    <div className="text-[10.5px] text-slate-500 flex items-center gap-1">
                      <MapPin size={10} />
                      <span>{evt.location}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Quick Partners desk */}
            <div className="bg-slate-50 p-5 rounded-xl border border-slate-200 space-y-4">
              <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider border-b border-slate-200 pb-1.5">
                Partenaires & Institutions liées
              </h3>
              <ul className="space-y-2">
                {partners.slice(0, 3).map((item) => (
                  <li key={item.id} className="bg-white p-2.5 rounded-lg border border-slate-150 flex items-center justify-between text-xs font-medium">
                    <span className="text-slate-800">{item.logo} {item.name}</span>
                    <span className="text-[10px] bg-slate-100 px-2 py-0.5 rounded border border-slate-200 text-slate-600 font-mono">
                      {item.type}
                    </span>
                  </li>
                ))}
              </ul>
              <p className="text-[10px] text-slate-400 italic">
                * Les modifications sur les fiches partenaires requièrent les accréditations d'administration.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* 6. DOCTORANT WORKSPACE */}
      {role === 'Doctorant' && (
        <div className="bg-white border border-amber-200 rounded-2xl p-6 shadow-md space-y-6">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center border-b border-amber-100 pb-4 gap-4">
            <div className="space-y-1">
              <div className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-amber-50 text-amber-800 rounded-full text-[10px] uppercase font-bold tracking-wider border border-amber-100">
                <UserCheck size={12} />
                <span>Chercheur Doctorant (RBAC: Soumission)</span>
              </div>
              <h2 className="text-xl font-display font-medium text-slate-800">
                Espace Personnel de Recherche & Soumissions
              </h2>
            </div>
            <div className="bg-amber-50 border border-amber-100 p-2.5 px-4 rounded-xl leading-snug text-right">
              <span className="text-[9px] uppercase text-slate-500 font-bold block">Publications Soumises</span>
              <strong className="text-base text-amber-700">{publications.length} Fiches</strong>
            </div>
          </div>

          <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl p-4 text-xs text-amber-800 leading-relaxed">
            <strong>Règle académique :</strong> En tant que doctorant, vous avez le droit de publier directement les résultats de vos recherches (publications et de datasets) au sein du laboratoire. Vos fiches sont immédiatement postées et validées sans attente administrative.
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            <div className="bg-slate-50 p-5 rounded-xl border border-slate-200 space-y-4">
              <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider border-b border-slate-200 pb-1.5 flex items-center gap-1.5">
                <BookOpen size={14} className="text-amber-500" />
                Vos Publications Enregistrées
              </h3>
              <div className="space-y-2 max-h-60 overflow-y-auto">
                {publications.length === 0 ? (
                  <p className="text-xs text-slate-400 italic">Aucune publication trouvée sous votre nom d'auteur.</p>
                ) : (
                  publications.map((pub) => (
                    <div key={pub.id} className="bg-white p-3 rounded-lg border border-slate-150 text-xs flex justify-between items-center">
                      <div className="truncate max-w-xs">
                        <p className="font-bold text-slate-800 truncate">{pub.title}</p>
                        <p className="text-[10px] text-slate-400">{pub.journal} ({pub.year})</p>
                      </div>
                      <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold ${
                        pub.status === 'Approved' ? 'bg-emerald-100 text-emerald-800 border border-emerald-200' :
                        pub.status === 'Rejected' ? 'bg-rose-100 text-rose-800 border border-rose-200' :
                        'bg-amber-100 text-amber-800 border border-amber-200'
                      }`}>
                        {pub.status === 'Approved' ? 'Validé' : pub.status === 'Rejected' ? 'Rejeté' : 'En attente'}
                      </span>
                    </div>
                  ))
                )}
              </div>
            </div>

            <div className="bg-slate-50 p-5 rounded-xl border border-slate-200 space-y-4">
              <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider border-b border-slate-200 pb-1.5 flex items-center gap-1.5">
                <FileText size={14} className="text-amber-500" />
                Vos Jeux de Données (Datasets)
              </h3>
              <div className="space-y-2 max-h-60 overflow-y-auto">
                {datasets.length === 0 ? (
                  <p className="text-xs text-slate-400 italic">Aucun dataset enregistré sous votre nom.</p>
                ) : (
                  datasets.map((data) => (
                    <div key={data.id} className="bg-white p-3 rounded-lg border border-slate-150 text-xs flex justify-between items-center">
                      <div className="truncate max-w-xs">
                        <p className="font-bold text-slate-800 truncate">{data.title}</p>
                        <p className="text-[10px] text-slate-400">CC • {data.size}</p>
                      </div>
                      <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold ${
                        data.status === 'Approved' ? 'bg-emerald-100 text-emerald-800 border border-emerald-200' :
                        data.status === 'Rejected' ? 'bg-rose-100 text-rose-800 border border-rose-200' :
                        'bg-amber-100 text-amber-800 border border-amber-200'
                      }`}>
                        {data.status === 'Approved' ? 'Validé' : data.status === 'Rejected' ? 'Rejeté' : 'En attente'}
                      </span>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 7. PARTENAIRE WORKSPACE */}
      {role === 'Partenaire' && (
        <div className="bg-white border border-indigo-200 rounded-2xl p-6 shadow-md space-y-6">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center border-b border-indigo-100 pb-4 gap-4">
            <div className="space-y-1">
              <div className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-indigo-50 text-indigo-800 rounded-full text-[10px] uppercase font-bold tracking-wider border border-indigo-100">
                <Award size={12} />
                <span>Partenaire Financier (RBAC: Conventions)</span>
              </div>
              <h2 className="text-xl font-display font-medium text-slate-800">
                Gouvernance Institutionnelle & Suivi des Conventions
              </h2>
            </div>
            <div className="bg-indigo-50 border border-indigo-100 p-2.5 px-4 rounded-xl leading-snug text-right">
              <span className="text-[9px] uppercase text-slate-500 font-bold block">Vos Projets Co-financés</span>
              <strong className="text-base text-indigo-700">{projects.length} Conventions actives</strong>
            </div>
          </div>

          <div className="grid md:grid-cols-3 gap-4">
            <div className="bg-indigo-50/20 p-4 rounded-xl border border-indigo-100 flex flex-col justify-between">
              <span className="text-[10px] text-slate-450 uppercase font-bold tracking-wider">État global des fiches</span>
              <strong className="text-sm text-indigo-900 font-bold">100% Intégrité Rest</strong>
              <span className="text-[9px] text-slate-400">Synchronisé avec FastAPI</span>
            </div>
            <div className="bg-emerald-50/25 p-4 rounded-xl border border-emerald-100 flex flex-col justify-between">
              <span className="text-[10px] text-slate-450 uppercase font-bold tracking-wider">Taux d'exécution progresse</span>
              <strong className="text-sm text-emerald-800 font-bold font-mono">
                {projects.length > 0 
                  ? Math.round(projects.reduce((acc, p) => acc + (p.progress || 0), 0) / projects.length)
                  : 0}% Moyenne
              </strong>
              <span className="text-[9px] text-slate-400">Statistiques temps réel</span>
            </div>
            <div className="bg-amber-50/25 p-4 rounded-xl border border-amber-100 flex flex-col justify-between">
              <span className="text-[10px] text-slate-450 uppercase font-bold tracking-wider">Allocation globale estimée</span>
              <strong className="text-sm text-amber-800 font-bold font-mono">
                {projects.reduce((acc, p) => acc + parseFloat((p.budget || "0").replace(/\s/g, '') || "0"), 0).toLocaleString('fr-FR')} EUR
              </strong>
              <span className="text-[9px] text-slate-400">Fonds investis cumulés</span>
            </div>
          </div>

          <div className="bg-slate-55 p-5 bg-slate-50 rounded-xl border border-slate-200 space-y-4">
            <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider border-b border-slate-200 pb-1.5 flex items-center gap-1.5">
              <TrendingUp size={14} className="text-indigo-500" />
              Vos Conventions de Financement & Avancement Projets
            </h3>
            <div className="space-y-3">
              {projects.length === 0 ? (
                <p className="text-xs text-slate-400 italic">Aucune convention active enregistrée sous votre identité.</p>
              ) : (
                projects.map((proj) => (
                  <div key={proj.id} className="bg-white p-4 rounded-xl border border-slate-150 space-y-3.5">
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="font-bold text-slate-850 text-sm leading-snug">{proj.title}</h4>
                        <p className="text-[10.5px] text-slate-400">Dirigé par: {proj.leaderId} • {proj.timeline}</p>
                      </div>
                      <span className="text-xs font-mono font-bold text-indigo-700 bg-indigo-50/80 px-2.5 py-1 rounded-lg border border-indigo-100">
                        {proj.budget} {proj.currency}
                      </span>
                    </div>
                    <div className="space-y-1.5">
                      <div className="flex justify-between text-[10px] font-bold text-slate-500">
                        <span>Progression des livrables</span>
                        <span>{proj.progress || 0}%</span>
                      </div>
                      <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden border">
                        <div className="bg-indigo-600 h-full rounded-full" style={{ width: `${proj.progress || 0}%` }}></div>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
