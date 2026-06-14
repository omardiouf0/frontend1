import React, { useState } from 'react';
import { IrdDocument, User } from '../types';
import { 
  FileText, 
  Award, 
  CheckCircle, 
  XCircle, 
  PlusCircle, 
  UserCheck, 
  TrendingUp, 
  Coins, 
  BookOpen, 
  Trash2, 
  AlertCircle,
  Hash,
  Activity,
  FileCheck2,
  Download
} from 'lucide-react';
import { generateIrdDocumentPdf } from '../utils/pdfGenerator';

interface IrdDocumentsSectionProps {
  irdDocuments: IrdDocument[];
  currentUser: User | null;
  onAdd: (doc: Omit<IrdDocument, 'id' | 'createdAt' | 'signedByDirector' | 'status'>) => void;
  onUpdate: (id: string, doc: Partial<IrdDocument>) => void;
  onDelete: (id: string) => void;
  onSign: (id: string, comment?: string) => void;
  onValidate: (id: string, action: 'Approved' | 'Rejected', comment?: string) => void;
  t: any;
}

export const IrdDocumentsSection: React.FC<IrdDocumentsSectionProps> = ({
  irdDocuments,
  currentUser,
  onAdd,
  onUpdate,
  onDelete,
  onSign,
  onValidate,
  t
}) => {
  const [isOpenForm, setIsOpenForm] = useState(false);
  const [title, setTitle] = useState('');
  const [type, setType] = useState<'PurchaseRequest' | 'InternshipAgreement' | 'ServiceReceipt' | 'InternshipProposal'>('PurchaseRequest');
  const [amount, setAmount] = useState<number>(1500);
  const [studentName, setStudentName] = useState('');
  const [university, setUniversity] = useState('Université Cheikh Anta Diop (UCAD)');
  const [envelopeManager, setEnvelopeManager] = useState('');
  const [comments, setComments] = useState('');
  const [directorComment, setDirectorComment] = useState('');
  const [selectedDocForComment, setSelectedDocForComment] = useState<string | null>(null);

  const isDirector = currentUser?.role === 'Directeur' || currentUser?.role === 'Admin';

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    onAdd({
      title,
      type,
      amount: (type === 'InternshipAgreement' || type === 'InternshipProposal') ? undefined : amount,
      studentName: (type === 'InternshipAgreement' || type === 'InternshipProposal') ? studentName : undefined,
      university: (type === 'InternshipAgreement' || type === 'InternshipProposal') ? university : undefined,
      envelopeManagerSignature: type === 'PurchaseRequest' ? envelopeManager : undefined,
      comments
    });

    // Reset states
    setTitle('');
    setType('PurchaseRequest');
    setAmount(1500);
    setStudentName('');
    setUniversity('Université Cheikh Anta Diop (UCAD)');
    setEnvelopeManager('');
    setComments('');
    setIsOpenForm(false);
  };

  const handleSignDocument = (id: string) => {
    onSign(id, directorComment);
    onValidate(id, 'Approved', directorComment);
    setDirectorComment('');
    setSelectedDocForComment(null);
  };

  const handleRejectDocument = (id: string) => {
    onValidate(id, 'Rejected', directorComment);
    setDirectorComment('');
    setSelectedDocForComment(null);
  };

  return (
    <div className="space-y-6">
      
      {/* 2. DIRECTOR ACTIONS BANNER CARD */}
      {isDirector && (
        <div className="bg-gradient-to-r from-[#0A3D62] to-slate-900 border border-brand-gold/40 text-white rounded-2xl p-6 shadow-md relative overflow-hidden">
          <div className="absolute right-0 top-0 opacity-10 font-black text-7xl select-none select-none tracking-widest mt-[-20px] mr-[-10px]">
            IRD
          </div>
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <FileCheck2 className="text-[#E58E26] animate-pulse" size={24} />
                <span className="text-[10px] text-[#E58E26] font-extrabold uppercase tracking-widest">{t.directorPanel}</span>
              </div>
              <h2 className="text-xl font-display font-medium leading-snug">
                {t.directorValidationHeader}
              </h2>
              <p className="text-slate-350 text-xs max-w-2xl">
                En tant que Directeur de l'Unité Mixte de Modélisation du Système Complexe, vous avez les habilitations institutionnelles pour signer les accords, engager l'enveloppe budgétaire et viser les reçus de prestations.
              </p>
            </div>
            
            <div className="bg-white/5 border border-white/10 px-5 py-3 rounded-xl flex gap-6 text-center">
              <div>
                <span className="text-2xl font-bold font-mono text-[#E58E26]">
                  {irdDocuments.filter(d => !d.signedByDirector && d.status === 'Pending').length}
                </span>
                <span className="block text-[9px] text-slate-400 font-medium">À VISER</span>
              </div>
              <div className="w-[1px] bg-white/15"></div>
              <div>
                <span className="text-2xl font-bold font-mono text-emerald-400">
                  {irdDocuments.filter(d => d.signedByDirector).length}
                </span>
                <span className="block text-[9px] text-slate-400 font-medium font-medium">CERTIFIÉS</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 3. LISTING HEADER AND ACTION BUTTON */}
      <div className="flex justify-between items-center bg-white p-4 rounded-xl border border-slate-205 shadow-3xs">
        <div className="space-y-0.5">
          <h3 className="text-sm font-semibold text-slate-800">
            Fiches Administratives Actives
          </h3>
          <p className="text-[10px] text-slate-500 font-medium">
            Suivi en temps réel des transactions, conventions de stages UCAD et bons d'achats IRD.
          </p>
        </div>

        <button
          onClick={() => setIsOpenForm(!isOpenForm)}
          className="px-3.5 py-1.5 bg-brand-blue text-white hover:bg-brand-blue/90 font-bold text-xs rounded-lg flex items-center gap-1.5 transition-all shadow-3xs cursor-pointer"
        >
          <PlusCircle size={14} />
          {isOpenForm ? 'Annuler' : 'Créer une Demande'}
        </button>
      </div>

      {/* 4. CREATION FORM CAROUSEL */}
      {isOpenForm && (
        <form onSubmit={handleSubmit} className="bg-white rounded-2xl border border-blue-150 p-6 shadow-sm space-y-4 animate-fadeIn">
          <div className="border-b border-slate-100 pb-3">
            <h4 className="font-semibold text-brand-blue text-xs uppercase tracking-wide flex items-center gap-1.5">
              <FileText size={16} />
              Enregistrer un nouvel acte administratif (Simulation IRD)
            </h4>
          </div>

          <div className="grid md:grid-cols-2 gap-4 text-xs font-semibold">
            {/* Form selections */}
            <div className="space-y-3">
              <div className="space-y-1">
                <label className="text-slate-600 block">Libellé du document *</label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={e => setTitle(e.target.value)}
                  placeholder="Ex: Demande de Bon d'achat HPC GPU..."
                  className="w-full bg-slate-50 border border-slate-200 py-2 px-3 rounded-lg text-xs"
                />
              </div>

              <div className="space-y-1">
                <label className="text-slate-600 block">Type de processus *</label>
                <select
                  value={type}
                  onChange={e => setType(e.target.value as any)}
                  className="w-full bg-slate-50 border border-slate-200 py-2 px-3 rounded-lg text-xs"
                >
                  <option value="PurchaseRequest">Demande de Bon d'Achat (IRD)</option>
                  <option value="InternshipAgreement">Convention de Stage (IRD / UCAD)</option>
                  <option value="InternshipProposal">Proposition de Stage (IRD / UCAD)</option>
                  <option value="ServiceReceipt">Prestation de Service (Externe)</option>
                </select>
              </div>

              {type !== 'InternshipAgreement' && type !== 'InternshipProposal' && (
                <div className="space-y-1">
                  <label className="text-slate-600 block">Montant Estimé (EUR) *</label>
                  <input
                    type="number"
                    value={amount}
                    onChange={e => setAmount(Number(e.target.value))}
                    className="w-full bg-slate-50 border border-slate-200 py-2 px-3 rounded-lg text-xs"
                  />
                </div>
              )}
            </div>

            {/* Stage/Signature attributes */}
            <div className="space-y-3">
              {(type === 'InternshipAgreement' || type === 'InternshipProposal') ? (
                <>
                  <div className="space-y-1">
                    <label className="text-slate-600 block">Nom complet de l'étudiant / Candidat *</label>
                    <input
                      type="text"
                      required
                      value={studentName}
                      onChange={e => setStudentName(e.target.value)}
                      placeholder="Ex: Fatoumata Diarra Bamba..."
                      className="w-full bg-slate-50 border border-slate-200 py-2 px-3 rounded-lg text-xs"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-slate-600 block">Université d'attachement *</label>
                    <input
                      type="text"
                      required
                      value={university}
                      onChange={e => setUniversity(e.target.value)}
                      placeholder="Ex: Université Cheikh Anta Diop (UCAD)"
                      className="w-full bg-slate-50 border border-slate-200 py-2 px-3 rounded-lg text-xs"
                    />
                  </div>
                </>
              ) : null}

              {type === 'PurchaseRequest' && (
                <div className="space-y-1">
                  <label className="text-slate-600 block">Responsable d'Enveloppe (Signature) *</label>
                  <input
                    type="text"
                    required
                    value={envelopeManager}
                    onChange={e => setEnvelopeManager(e.target.value)}
                    placeholder="Ex: Signé par Dr. Sokhna Thiam (Axe MOD)..."
                    className="w-full bg-slate-50 border border-slate-200 py-2 px-3 rounded-lg text-xs"
                  />
                </div>
              )}

              <div className="space-y-1">
                <label className="text-slate-600 block">Description / Remarques descriptives</label>
                <textarea
                  value={comments}
                  rows={2}
                  onChange={e => setComments(e.target.value)}
                  placeholder="Indiquer les motivations scientifiques, thématiques de calcul..."
                  className="w-full bg-slate-50 border border-slate-200 py-2 px-3 rounded-lg text-xs"
                />
              </div>
            </div>
          </div>

          <div className="pt-3 border-t border-slate-100 flex justify-end gap-2">
            <button
              type="button"
              onClick={() => setIsOpenForm(false)}
              className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-lg text-xs cursor-pointer"
            >
              Annuler
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-brand-blue hover:bg-brand-blue/90 text-white font-bold rounded-lg text-xs cursor-pointer"
            >
              Soumettre la Fiche
            </button>
          </div>
        </form>
      )}

      {/* 5. DOCUMENTS GRID LISTING */}
      <div className="grid gap-4">
        {irdDocuments.map(doc => {
          return (
            <div 
              key={doc.id} 
              className={`bg-white rounded-2xl border p-5 flex flex-col md:flex-row justify-between gap-5 transition-shadow hover:shadow-xs ${
                doc.signedByDirector 
                  ? 'border-emerald-150 bg-emerald-50/5' 
                  : doc.status === 'Rejected'
                  ? 'border-rose-150 bg-rose-50/5'
                  : 'border-slate-210 shadow-3xs'
              }`}
            >
              <div className="space-y-4 flex-1">
                {/* Header title block */}
                <div className="space-y-1.5">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className={`text-[9px] font-bold uppercase tracking-wider py-0.5 px-2 rounded-md ${
                      doc.type === 'PurchaseRequest'
                        ? 'bg-blue-50 text-blue-700 border border-blue-200'
                        : doc.type === 'InternshipAgreement'
                        ? 'bg-amber-50 text-amber-700 border border-amber-200'
                        : doc.type === 'InternshipProposal'
                        ? 'bg-teal-50 text-teal-700 border border-teal-200'
                        : 'bg-indigo-50 text-indigo-700 border border-indigo-200'
                    }`}>
                      {doc.type === 'PurchaseRequest' && t.purchaseRequest}
                      {doc.type === 'InternshipAgreement' && t.stageAgreement}
                      {doc.type === 'InternshipProposal' && t.stageProposal}
                      {doc.type === 'ServiceReceipt' && t.serviceReceipt}
                    </span>

                    <span className={`text-[9px] font-bold uppercase py-0.5 px-2 rounded-md ${
                      doc.status === 'Approved'
                        ? 'bg-emerald-100 text-emerald-800'
                        : doc.status === 'Rejected'
                        ? 'bg-rose-100 text-rose-800'
                        : 'bg-amber-100 text-amber-800'
                    }`}>
                      {doc.status}
                    </span>

                    {doc.amount && (
                      <span className="text-xs font-bold font-mono text-slate-700">
                        Montant : {doc.amount.toLocaleString()} €
                      </span>
                    )}
                  </div>

                  <h4 className="text-sm font-semibold text-slate-800 font-display leading-tight">
                    {doc.title}
                  </h4>
                  <span className="text-[10px] text-slate-400 font-mono block">Enregistré le {doc.createdAt} • ID : {doc.id}</span>
                </div>

                {/* Sub-components depending on types */}
                <div className="grid sm:grid-cols-2 gap-3 text-xs bg-slate-50/80 p-3.5 rounded-xl border border-slate-100">
                  {doc.studentName && (
                    <div className="space-y-0.5">
                      <span className="text-slate-400 text-[10px] block uppercase font-medium">Étranger / Étudiant</span>
                      <strong className="text-slate-800 font-semibold">{doc.studentName}</strong>
                    </div>
                  )}
                  {doc.university && (
                    <div className="space-y-0.5">
                      <span className="text-slate-400 text-[10px] block uppercase font-medium">Établissement académique</span>
                      <strong className="text-slate-800 font-semibold">{doc.university}</strong>
                    </div>
                  )}
                  {doc.envelopeManagerSignature && (
                    <div className="space-y-0.5 sm:col-span-2 border-t border-slate-100 pt-2 mt-1">
                      <span className="text-slate-400 text-[10px] block uppercase font-medium">{t.envelopeManager}</span>
                      <span className="text-brand-blue font-semibold font-mono block mt-0.5 text-[11px]">{doc.envelopeManagerSignature}</span>
                    </div>
                  )}
                  
                  {doc.comments && (
                    <div className="sm:col-span-2 border-t border-slate-100 pt-2 mt-1">
                      <span className="text-slate-400 text-[10px] block uppercase font-medium">Besoins / Thématiques</span>
                      <p className="text-slate-600 mt-0.5 leading-relaxed">{doc.comments}</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Sidebar signature space */}
              <div className="md:w-60 flex flex-col justify-between border-t md:border-t-0 md:border-l border-slate-150 pt-4 md:pt-0 md:pl-5 self-stretch gap-4">
                
                {/* Director Certificate Block */}
                {doc.signedByDirector ? (
                  <div className="flex flex-col gap-2">
                    <div className="bg-emerald-50 border border-emerald-200 p-3.5 rounded-xl text-center space-y-2 animate-bounce-short">
                      <div className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-emerald-100 text-emerald-800">
                        <Award size={18} />
                      </div>
                      <div>
                        <strong className="text-[10px] text-emerald-800 uppercase block tracking-wider font-extrabold">{t.approvedByDirector}</strong>
                        <span className="text-[10px] text-slate-500 block italic leading-none font-medium mt-1">Directeur Scientifique IRD</span>
                      </div>
                    </div>
                    <button
                      onClick={() => generateIrdDocumentPdf(doc)}
                      className="w-full py-1.5 px-3 bg-[#4A8C3F] hover:bg-brand-blue text-white font-extrabold rounded-lg text-[10px] uppercase tracking-wider transition-all shadow-3xs flex items-center justify-center gap-1.5 cursor-pointer"
                    >
                      <Download size={12} />
                      Télécharger PDF
                    </button>
                  </div>
                ) : (
                  <div className="bg-slate-50 border border-dashed border-slate-350 p-3.5 rounded-xl text-center space-y-1.5 flex flex-col justify-center items-center">
                    <AlertCircle size={16} className="text-amber-500 animate-pulse" />
                    <span className="text-[10px] text-slate-500 block leading-tight font-medium">
                      En attente de signature du Directeur
                    </span>
                  </div>
                )}

                {/* Signing tool drawer for the Director */}
                {isDirector && !doc.signedByDirector && doc.status !== 'Rejected' && (
                  <div className="space-y-2 bg-slate-50 p-2.5 rounded-xl border border-slate-200">
                    {selectedDocForComment === doc.id ? (
                      <div className="space-y-2">
                        <textarea
                          placeholder="Commentaire de cachet / Signature..."
                          value={directorComment}
                          onChange={e => setDirectorComment(e.target.value)}
                          className="w-full text-xs p-2 bg-white border border-slate-250 rounded-lg"
                          rows={2}
                        />
                        <div className="flex gap-1">
                          <button
                            onClick={() => handleSignDocument(doc.id)}
                            className="flex-1 py-1 px-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-lg text-[10px] transition-colors cursor-pointer"
                          >
                            Signer
                          </button>
                          <button
                            onClick={() => handleRejectDocument(doc.id)}
                            className="flex-1 py-1 px-2 bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-lg text-[10px] transition-colors cursor-pointer"
                          >
                            Rejeter
                          </button>
                        </div>
                        <button
                          onClick={() => setSelectedDocForComment(null)}
                          className="w-full text-center text-[9px] text-slate-400 block hover:underline"
                        >
                          Annuler
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => setSelectedDocForComment(doc.id)}
                        className="w-full py-2 bg-[#E58E26] hover:bg-[#E58E26]/90 text-slate-900 font-extrabold rounded-lg text-xs tracking-wide transition-all shadow-3xs flex items-center justify-center gap-1.5 cursor-pointer"
                      >
                        <Award size={14} />
                        Habiliter & Signer
                      </button>
                    )}
                  </div>
                )}

                {/* Delete trigger for creators */}
                {!doc.signedByDirector && (currentUser?.role === 'Admin' || currentUser?.role === 'Chef d\'Axe') && (
                  <button
                    onClick={() => onDelete(doc.id)}
                    className="text-right text-[10px] hover:text-rose-600 font-semibold self-end flex items-center gap-1 cursor-pointer transition-colors"
                  >
                    <Trash2 size={11} className="opacity-75" />
                    Supprimer la fiche
                  </button>
                )}
              </div>
            </div>
          );
        })}

        {irdDocuments.length === 0 && (
          <div className="bg-white border border-dashed border-slate-220 rounded-2xl p-12 text-center text-slate-400 space-y-2">
            <p className="text-xs font-semibold">Aucun document administratif enregistré.</p>
            <p className="text-[10px]">Utilisez le bouton en haut à droite pour soumettre vos conventions de stage ou bons de commande.</p>
          </div>
        )}
      </div>

    </div>
  );
};
