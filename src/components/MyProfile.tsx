import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Researcher } from '../types';
import {
  User,
  Mail,
  Phone,
  MapPin,
  Building,
  Award,
  BookOpen,
  Plus,
  Trash2,
  Save,
  Check,
  Tag,
  AlertCircle,
  Sparkles,
  RefreshCw,
  Globe
} from 'lucide-react';

interface MyProfileProps {
  currentUser: {
    email: string;
    name: string;
    role: string;
  };
  researchers: Researcher[];
  addResearcher: (res: Omit<Researcher, 'id'>) => Promise<void> | void;
  updateResearcher: (id: string, res: Partial<Researcher>) => void;
}

export const MyProfile: React.FC<MyProfileProps> = ({
  currentUser,
  researchers,
  addResearcher,
  updateResearcher
}) => {
  // Resolve researcher profile associated with currentUser email
  const profile = researchers.find(
    (r) => r.email.toLowerCase() === currentUser.email.toLowerCase()
  );

  // States for Editing
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [bio, setBio] = useState('');
  const [affiliation, setAffiliation] = useState('');
  const [customAffiliation, setCustomAffiliation] = useState('');
  const [officeLocation, setOfficeLocation] = useState('');
  const [rank, setRank] = useState('');
  const [image, setImage] = useState('');
  const [interests, setInterests] = useState<string[]>([]);
  const [newInterestInput, setNewInterestInput] = useState('');
  
  // UI states
  const [isSaved, setIsSaved] = useState(false);
  const [isInitializing, setIsInitializing] = useState(false);
  const [showNotification, setShowNotification] = useState(false);
  const [notificationMsg, setNotificationMsg] = useState('');

  // Suffix/Preset options for affiliations
  const affiliationPresets = ['UCAD', 'IRD', 'Sorbonne Université', 'CNRS', 'Autre'];

  // Sync state with profile once is available
  useEffect(() => {
    if (profile) {
      setName(profile.name || currentUser.name || '');
      setPhone(profile.phone || '');
      setBio(profile.bio || '');
      
      const isPreset = affiliationPresets.includes(profile.affiliation);
      if (isPreset) {
        setAffiliation(profile.affiliation);
        setCustomAffiliation('');
      } else {
        setAffiliation('Autre');
        setCustomAffiliation(profile.affiliation || '');
      }
      
      setOfficeLocation(profile.officeLocation || '');
      setRank(profile.rank || '');
      setImage(profile.image || '');
      setInterests(profile.interests || []);
    }
  }, [profile, currentUser]);

  const triggerNotification = (msg: string) => {
    setNotificationMsg(msg);
    setShowNotification(true);
    setTimeout(() => {
      setShowNotification(false);
    }, 4000);
  };

  const handleCreateProfile = async () => {
    setIsInitializing(true);
    try {
      const defaultImage = "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200";
      
      const newProfile: Omit<Researcher, 'id'> = {
        name: currentUser.name || "Nouveau Chercheur",
        email: currentUser.email,
        phone: "+221 77 000 00 00",
        bio: "Doctorant ou Chercheur affilié à l'UMMISCO. Travaux de recherche en modélisation et simulation complexes.",
        rank: currentUser.role === 'Doctorant' ? 'Doctorant' : 'Chargé de Recherche',
        affiliation: 'UCAD',
        image: defaultImage,
        axes: ['AXE-MOD'],
        publicationsCount: 0,
        projectsCount: 0,
        officeLocation: "Labo UMMISCO, Dakar-Fann",
        interests: ['Modélisation multi-agents', 'Épidémiologie']
      };

      await addResearcher(newProfile);
      triggerNotification("Votre profil académique de chercheur a été configuré avec succès !");
    } catch (e: any) {
      console.error(e);
      triggerNotification("Une erreur s'est produite lors de l'initialisation.");
    } finally {
      setIsInitializing(false);
    }
  };

  const handleAddInterest = (e: React.FormEvent) => {
    e.preventDefault();
    const clean = newInterestInput.trim();
    if (!clean) return;
    
    if (interests.some(item => item.toLowerCase() === clean.toLowerCase())) {
      setNewInterestInput('');
      return;
    }

    setInterests(prev => [...prev, clean]);
    setNewInterestInput('');
  };

  const handleRemoveInterest = (indexToRemove: number) => {
    setInterests(prev => prev.filter((_, idx) => idx !== indexToRemove));
  };

  const handleSave = () => {
    if (!profile) return;

    const finalAffiliation = affiliation === 'Autre' ? customAffiliation : affiliation;

    updateResearcher(profile.id, {
      name,
      phone,
      bio,
      affiliation: finalAffiliation,
      officeLocation,
      rank,
      image: image || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200",
      interests
    });

    setIsSaved(true);
    triggerNotification("Vos modifications ont été enregistrées avec succès !");
    
    setTimeout(() => {
      setIsSaved(false);
    }, 2500);
  };

  // Popular interests for Quick Addition
  const popularInterestsPresets = [
    "Systèmes complexes",
    "Modélisation GAMA",
    "Épidémiologie mathématique",
    "Apprentissage profond",
    "Intelligence Artificielle",
    "Dynamique des populations",
    "Changement Climatique",
    "Simulation multi-agents",
    "Calcul scientifique"
  ];

  const handleAddQuickInterest = (preset: string) => {
    if (!interests.some(item => item.toLowerCase() === preset.toLowerCase())) {
      setInterests(prev => [...prev, preset]);
    }
  };

  if (!profile) {
    return (
      <div className="bg-white border border-slate-200 rounded-2xl p-8 max-w-2xl mx-auto shadow-sm my-6 text-center space-y-6">
        <div className="mx-auto w-16 h-16 bg-amber-50 rounded-full flex items-center justify-center text-amber-500">
          <User size={32} />
        </div>
        <div className="space-y-2">
          <h2 className="text-xl font-display font-medium text-slate-800">
            Aucun profil chercheur trouvé
          </h2>
          <p className="text-sm text-slate-500 leading-relaxed max-w-md mx-auto">
            Votre compte de connexion <strong className="text-slate-700">{currentUser.email}</strong> n'est actuellement rattaché à aucune fiche de chercheur au niveau scientifique.
          </p>
        </div>

        <div className="bg-slate-50 p-4 rounded-xl border text-xs text-slate-500 max-w-md mx-auto text-left leading-relaxed">
          <span className="font-bold text-slate-700 block mb-1">Pourquoi créer une fiche ?</span>
          Pour pouvoir ajouter et lister des publications à votre nom, renseigner vos thèmes de recherche, et apparaître au sein des membres de vos axes scientifiques privilégiés.
        </div>

        <button
          onClick={handleCreateProfile}
          disabled={isInitializing}
          className="bg-brand-dark cursor-pointer text-brand-gold px-6 py-2.5 rounded-xl text-sm font-semibold hover:bg-slate-850 inline-flex items-center gap-2 transition-all shadow-sm border border-brand-gold/25"
        >
          {isInitializing ? (
            <>
              <RefreshCw className="animate-spin" size={16} />
              <span>Génération du profil en cours...</span>
            </>
          ) : (
            <>
              <Sparkles size={16} />
              <span>Créer mon profil de Chercheur / Doctorant</span>
            </>
          )}
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      
      {/* Toast Notification */}
      {showNotification && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          className="fixed top-6 right-6 z-50 bg-slate-900 text-white px-5 py-3.5 rounded-xl shadow-2xl flex items-center gap-2.5 text-xs border border-white/10"
        >
          <div className="bg-emerald-500 rounded-full p-1 text-slate-950">
            <Check size={12} strokeWidth={3} />
          </div>
          <span>{notificationMsg}</span>
        </motion.div>
      )}

      {/* Header Banner info */}
      <div className="bg-gradient-to-r from-brand-dark to-slate-900 border border-slate-850 rounded-2xl p-6 md:p-8 text-white shadow-xl flex flex-col md:flex-row items-center gap-6">
        <div className="relative group">
          <img
            src={image || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200"}
            alt={name}
            className="w-24 h-24 md:w-28 md:h-28 rounded-2xl object-cover border-2 border-brand-gold shadow-md"
            referrerPolicy="no-referrer"
          />
          <div className="absolute inset-0 bg-black/60 rounded-2xl opacity-0 group-hover:opacity-100 flex flex-col items-center justify-center transition-all duration-200">
            <span className="text-[10px] text-brand-gold font-bold uppercase tracking-wider block">Photo</span>
          </div>
        </div>
        
        <div className="text-center md:text-left space-y-2 flex-1">
          <div className="inline-flex items-center gap-1 bg-amber-500/10 text-brand-gold border border-brand-gold/25 px-2.5 py-0.5 rounded-full text-[10px] uppercase font-bold tracking-wider">
            <Award size={12} />
            <span>{rank || currentUser.role}</span>
          </div>
          
          <h2 className="text-2xl font-display font-medium text-slate-100 leading-tight">
            Explorer & Éditer votre fiche
          </h2>
          
          <p className="text-xs text-slate-400">
            Renseignez vos travaux et informations d'identification pour l'U.R. UMMISCO.
          </p>

          <div className="flex flex-wrap justify-center md:justify-start items-center gap-x-4 gap-y-1.5 text-slate-400 text-[11px] font-mono pt-1">
            <span className="flex items-center gap-1.5">
              <Mail size={12} className="text-brand-gold" /> {currentUser.email}
            </span>
            <span className="hidden md:inline-block text-slate-700">•</span>
            <span className="flex items-center gap-1.5">
              <Building size={12} className="text-brand-gold" /> {profile.affiliation}
            </span>
          </div>
        </div>

        <button
          onClick={handleSave}
          disabled={isSaved}
          className="bg-brand-gold hover:bg-yellow-500 text-slate-900 px-5 py-3 rounded-xl text-xs font-bold transition-all shadow-md flex items-center gap-2 shrink-0 border border-brand-gold/10 hover:scale-[1.02]"
        >
          {isSaved ? (
            <>
              <Check size={14} strokeWidth={3} />
              <span>Profil Enregistré</span>
            </>
          ) : (
            <>
              <Save size={14} />
              <span>Sauvegarder mon profil</span>
            </>
          )}
        </button>
      </div>

      {/* Main editable form and metadata */}
      <div className="grid md:grid-cols-3 gap-6">
        
        {/* Left Column: Core metadata edit fields */}
        <div className="md:col-span-2 space-y-6">
          
          {/* Box 1: Biography & Affiliation */}
          <div className="bg-white border rounded-2xl p-6 shadow-sm space-y-5">
            <div className="border-b pb-3 flex items-center justify-between">
              <h3 className="text-sm font-display font-semibold text-slate-800 flex items-center gap-2">
                <Building size={16} className="text-slate-500" />
                Affiliation institutionnelle & Biographie
              </h3>
              <span className="text-[10px] text-slate-400 font-mono uppercase">Obligatoire</span>
            </div>

            <div className="grid sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-[11px] uppercase tracking-wider text-slate-500 font-bold">Nom Complet Académique</label>
                <div className="relative">
                  <User size={13} className="absolute left-3 top-3.5 text-slate-400" />
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Pr. Nom Complet"
                    className="w-full text-xs pl-8.5 pr-3 py-2.5 border rounded-xl bg-slate-50 focus:bg-white focus:ring-1 focus:ring-brand-gold outline-none"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-[11px] uppercase tracking-wider text-slate-500 font-bold">Grade / Titre Scientifique</label>
                <select
                  value={rank}
                  onChange={(e) => setRank(e.target.value)}
                  className="w-full text-xs px-3 py-2.5 border rounded-xl bg-slate-50 focus:bg-white focus:ring-1 focus:ring-brand-gold outline-none"
                >
                  <option value="Professeur Titulaire">Professeur Titulaire</option>
                  <option value="Maître de Conférences">Maître de Conférences</option>
                  <option value="Chargé de Recherche">Chargé de Recherche / CR</option>
                  <option value="Directeur de Recherche">Directeur de Recherche</option>
                  <option value="Chercheur Associé">Chercheur Associé</option>
                  <option value="Doctorant">Doctorant</option>
                  <option value="Post-doctorant">Post-doctorant</option>
                </select>
              </div>
            </div>

            <div className="grid sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-[11px] uppercase tracking-wider text-slate-500 font-bold">Affiliation de Tutelle</label>
                <select
                  value={affiliation}
                  onChange={(e) => setAffiliation(e.target.value)}
                  className="w-full text-xs px-3 py-2.5 border rounded-xl bg-slate-50 focus:bg-white focus:ring-1 focus:ring-brand-gold outline-none"
                >
                  {affiliationPresets.map((item) => (
                    <option key={item} value={item}>{item}</option>
                  ))}
                </select>
              </div>

              {affiliation === 'Autre' && (
                <div className="space-y-1.5">
                  <label className="text-[11px] uppercase tracking-wider text-slate-500 font-bold">Renseigner Autre Affiliation</label>
                  <div className="relative">
                    <Globe size={13} className="absolute left-3 top-3.5 text-slate-400" />
                    <input
                      type="text"
                      value={customAffiliation}
                      onChange={(e) => setCustomAffiliation(e.target.value)}
                      placeholder="Ex: Université de Thiès"
                      className="w-full text-xs pl-8.5 pr-3 py-2.5 border rounded-xl bg-slate-50 focus:bg-white focus:ring-1 focus:ring-brand-gold outline-none"
                    />
                  </div>
                </div>
              )}
            </div>

            <div className="space-y-1.5">
              <div className="flex justify-between items-center">
                <label className="text-[11px] uppercase tracking-wider text-slate-500 font-bold">Biographie scientifique</label>
                <span className="text-[10px] text-slate-400 font-mono">{bio.length} chars</span>
              </div>
              <textarea
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                rows={5}
                placeholder="Décrivez votre parcours d'enseignant-chercheur, vos domaines d'expertise, vos thèses de direction, vos thématiques clés..."
                className="w-full text-xs p-3.5 border rounded-xl bg-slate-50 focus:bg-white focus:ring-1 focus:ring-brand-gold outline-none leading-relaxed"
              />
            </div>
            
          </div>

          {/* Box 2: Research Interests Tags Manager */}
          <div className="bg-white border rounded-2xl p-6 shadow-sm space-y-5">
            <div className="border-b pb-3 flex items-center justify-between">
              <h3 className="text-sm font-display font-semibold text-slate-800 flex items-center gap-2">
                <Tag size={16} className="text-slate-500" />
                Vos Thèmes & Intérêts de Recherche
              </h3>
              <span className="text-[10px] text-slate-400 font-mono uppercase">{interests.length} Thèmes</span>
            </div>

            <div className="space-y-3">
              <p className="text-xs text-slate-500 leading-relaxed">
                Les thèmes d'intérêt permettent d'indexer vos publications, de vous associer à des projets innovants du laboratoire, et facilitent votre mise en relation avec d'autres équipes.
              </p>

              {/* Tag flow list */}
              <div className="flex flex-wrap gap-2.5 min-h-[46px] p-3.5 bg-slate-50 border border-slate-150 rounded-xl">
                {interests.length === 0 ? (
                  <span className="text-xs text-slate-400 italic">Aucun thème ajouté pour le moment. Renseignez-en ci-dessous.</span>
                ) : (
                  interests.map((interest, idx) => (
                    <span
                      key={idx}
                      className="inline-flex items-center gap-1.5 px-3 py-1 bg-amber-50 text-amber-900 border border-amber-250/50 rounded-full text-xs font-medium"
                    >
                      <span>{interest}</span>
                      <button
                        type="button"
                        onClick={() => handleRemoveInterest(idx)}
                        className="text-amber-500 hover:text-amber-800 duration-150 rounded-full hover:bg-amber-100 p-0.5 cursor-pointer"
                      >
                        <Trash2 size={11} />
                      </button>
                    </span>
                  ))
                )}
              </div>
            </div>

            {/* Input custom interest */}
            <form onSubmit={handleAddInterest} className="flex gap-2">
              <input
                type="text"
                value={newInterestInput}
                onChange={(e) => setNewInterestInput(e.target.value)}
                placeholder="Saisissez un nouveau thème (ex: Équations Différentielles, Machine Learning)"
                className="w-full text-xs px-3.5 py-2.5 border rounded-xl focus:ring-1 focus:ring-brand-gold outline-none"
              />
              <button
                type="submit"
                className="bg-brand-dark cursor-pointer text-brand-gold border border-brand-gold/30 hover:bg-slate-850 px-4.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1 shrink-0"
              >
                <Plus size={14} />
                Ajouter
              </button>
            </form>

            {/* Quick Presets Selection */}
            <div className="space-y-2 pt-2">
              <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wide">Suggestions populaires</span>
              <div className="flex flex-wrap gap-1.5">
                {popularInterestsPresets.map((preset) => (
                  <button
                    key={preset}
                    type="button"
                    onClick={() => handleAddQuickInterest(preset)}
                    className="text-[10px] px-2.5 py-1 bg-slate-100 hover:bg-amber-50 hover:text-amber-900 rounded-lg text-slate-600 transition-colors cursor-pointer"
                  >
                    + {preset}
                  </button>
                ))}
              </div>
            </div>

          </div>

        </div>

        {/* Right Column: Secondary metadata */}
        <div className="space-y-6">
          
          {/* Details & Contacts */}
          <div className="bg-white border rounded-2xl p-6 shadow-sm space-y-4">
            <h3 className="text-sm font-display font-semibold text-slate-800 border-b pb-2.5">
              Contacts & Bureau
            </h3>

            <div className="space-y-3.5">
              <div className="space-y-1">
                <label className="text-[10px] uppercase font-bold tracking-wider text-slate-400">Téléphone professionnel</label>
                <div className="relative">
                  <Phone size={13} className="absolute left-3 top-3.5 text-slate-400" />
                  <input
                    type="text"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+221 77..."
                    className="w-full text-xs pl-8.5 pr-3 py-2.5 border rounded-xl bg-slate-50 focus:bg-white focus:ring-1 focus:ring-brand-gold outline-none"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] uppercase font-bold tracking-wider text-slate-400">Localisation Administrative</label>
                <div className="relative">
                  <MapPin size={13} className="absolute left-3 top-3.5 text-slate-400" />
                  <input
                    type="text"
                    value={officeLocation}
                    onChange={(e) => setOfficeLocation(e.target.value)}
                    placeholder="Pavillon Info, UCAD, Dakar"
                    className="w-full text-xs pl-8.5 pr-3 py-2.5 border rounded-xl bg-slate-50 focus:bg-white focus:ring-1 focus:ring-brand-gold outline-none"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] uppercase font-bold tracking-wider text-slate-400">URL Adresse de Photo de Profil</label>
                <input
                  type="text"
                  value={image}
                  onChange={(e) => setImage(e.target.value)}
                  placeholder="https://images.unsplash.com/..."
                  className="w-full text-xs px-3.5 py-2.5 border rounded-xl bg-slate-50 focus:bg-white focus:ring-1 focus:ring-brand-gold outline-none"
                />
              </div>
            </div>
          </div>

          {/* Academic Stats summary display */}
          <div className="bg-amber-500/5 border border-amber-500/10 rounded-2xl p-6 space-y-4">
            <h3 className="text-xs font-bold text-amber-900 uppercase tracking-wider flex items-center gap-1.5">
              <BookOpen size={14} className="text-amber-500" />
              Vos statistiques UMMISCO
            </h3>
            
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-white p-3 rounded-xl border border-amber-500/10 text-center">
                <span className="text-[10px] text-slate-450 uppercase font-bold block mb-0.5">Publications</span>
                <strong className="text-base text-amber-700 font-mono">{profile.publicationsCount || 0}</strong>
              </div>
              <div className="bg-white p-3 rounded-xl border border-amber-500/10 text-center">
                <span className="text-[10px] text-slate-450 uppercase font-bold block mb-0.5">Projets</span>
                <strong className="text-base text-amber-700 font-mono">{profile.projectsCount || 0}</strong>
              </div>
            </div>

            <div className="text-[10.5px] text-slate-500 leading-relaxed bg-white border border-slate-100 p-3 rounded-xl flex gap-2">
              <AlertCircle size={15} className="text-amber-600 shrink-0 mt-0.5" />
              <span>
                Ces statistiques proviennent de l'inventaire approuvé par la direction. Elles sont mises à jour automatiquement à chaque validation de dossier.
              </span>
            </div>
          </div>

        </div>

      </div>

    </div>
  );
};
