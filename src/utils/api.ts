/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { 
  Researcher, ResearchAxis, Publication, Project, Dataset, Event, News, Partner, AuditLog, User 
} from '../types';

// Convert SQL backend models in French into React-state structures (English fields)
export const mapResearcher = (b: any): Researcher => ({
  id: b.id ? String(b.id) : '',
  name: b.nom_complet || '',
  email: b.email || '',
  phone: b.telephone || '',
  rank: b.titre || '',
  affiliation: b.institution || '',
  bio: b.specialite || '',
  image: b.photo || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=200',
  axes: b.axe_id ? [`AXE-${b.axe_id}`] : [],
  publicationsCount: b.publicationsCount || 0,
  projectsCount: b.projectsCount || 0,
  officeLocation: b.officeLocation || ''
});

export const mapAxe = (b: any): ResearchAxis => ({
  id: b.id ? `AXE-${b.id}` : '',
  title: b.nom || '',
  code: b.thematique || '',
  description: b.description || '',
  headId: b.responsables && b.responsables.length > 0 ? String(b.responsables[0]) : '',
  members: []
});

export const mapPublication = (b: any): Publication => ({
  id: b.id ? String(b.id) : '',
  title: b.titre || '',
  authors: Array.isArray(b.auteurs) ? b.auteurs : (b.auteur_noms ? b.auteur_noms : []),
  journal: b.journal || 'Journal UMMISCO / UNESCO',
  year: b.annee || new Date().getFullYear(),
  type: b.type === 'article' ? 'Journal' : b.type === 'conference' ? 'Conférence' : b.type === 'chapitre' ? 'Livre' : b.type === 'these' ? 'Thèse' : 'Preprint',
  doi: b.doi || '',
  abstract: b.resume || '',
  axisId: b.axe_id ? `AXE-${b.axe_id}` : '',
  status: b.statut_validation ? (b.statut_validation.charAt(0).toUpperCase() + b.statut_validation.slice(1)) as any : 'Draft',
  keywords: b.keywords || [],
  fileUrl: b.fichier_url || '',
  createdAt: b.date_publication || new Date().toISOString().split('T')[0]
});

export const mapProject = (b: any): Project => ({
  id: b.id ? String(b.id) : '',
  title: b.titre || '',
  description: b.description || '',
  leaderId: b.responsable_id ? String(b.responsable_id) : '',
  timeline: `${b.date_debut ? String(b.date_debut).substring(0, 4) : ''} - ${b.date_fin ? String(b.date_fin).substring(0, 4) : ''}`,
  budget: b.budget ? parseFloat(String(b.budget)).toLocaleString() + ' F' : '0',
  currency: 'FCFA',
  fundingSourceId: b.partenaire_id ? String(b.partenaire_id) : '',
  members: [],
  status: b.statut_validation ? (b.statut_validation.charAt(0).toUpperCase() + b.statut_validation.slice(1)) as any : 'Draft',
  axisId: b.axe_id ? `AXE-${b.axe_id}` : '',
  progress: b.statut === 'termine' ? 100 : b.statut === 'en_cours' ? 50 : 0,
  createdAt: b.date_debut || new Date().toISOString().split('T')[0]
});

export const mapDataset = (b: any): Dataset => ({
  id: b.id ? String(b.id) : '',
  title: b.nom || '',
  description: b.description || '',
  authors: b.auteur_noms || [],
  size: b.taille || '0 MB',
  licenseType: b.licence || 'CC',
  downloadCount: 0,
  fileUrl: b.url_acces || '',
  axisId: b.axe_id ? `AXE-${b.axe_id}` : '',
  status: b.statut_validation ? (b.statut_validation.charAt(0).toUpperCase() + b.statut_validation.slice(1)) as any : 'Draft',
  createdAt: b.date_publication || new Date().toISOString().split('T')[0],
  classification: b.classification || 'PUBLIC'
});

export const mapEvent = (b: any): Event => ({
  id: b.id ? String(b.id) : '',
  title: b.titre || '',
  description: b.description || '',
  location: b.lieu || 'Laboratoire UMMISCO',
  date: b.date_debut || '',
  time: b.heure_debut || '09:00',
  coordinatorId: b.coordonnateur_id ? String(b.coordonnateur_id) : '',
  status: b.statut_validation ? (b.statut_validation.charAt(0).toUpperCase() + b.statut_validation.slice(1)) as any : 'Draft',
  type: b.type === 'seminaire' ? 'Séminaire' : b.type === 'atelier' ? 'Atelier' : b.type === 'conference' ? 'Colloque' : 'Soutenance de Thèse',
  agenda: b.programme ? String(b.programme).split('\n') : [],
  image: b.image || undefined,
  createdAt: b.date_debut || new Date().toISOString().split('T')[0]
});

export const mapNews = (b: any): News => ({
  id: b.id ? String(b.id) : '',
  title: b.titre || '',
  summary: b.titre_en || b.resume || '',
  content: b.contenu || '',
  category: b.categorie || 'Recherche',
  authorId: b.auteur_id ? String(b.auteur_id) : '',
  image: b.image_url || 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&q=80&w=800',
  date: b.date_publication || '',
  status: b.statut_validation ? (b.statut_validation.charAt(0).toUpperCase() + b.statut_validation.slice(1)) as any : 'Draft',
  featured: b.ala_une || false,
  createdAt: b.date_creation || new Date().toISOString().split('T')[0]
});

export const mapPartner = (b: any): Partner => ({
  id: b.id ? String(b.id) : '',
  name: b.nom || '',
  type: b.type === 'universite' || b.type === 'institut' || b.type === 'ecole' || b.type === 'centre' ? 'Académique' : 'Institutionnel',
  logo: b.logo || 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&q=80&w=200',
  country: b.pays || 'Sénégal',
  website: b.site_web || ''
});

export const mapAuditLog = (b: any): AuditLog => ({
  id: b.id ? String(b.id) : '',
  username: b.utilisateur_email || b.username || 'système',
  action: b.action || '',
  ipAddress: b.adresse_ip || '127.0.0.1',
  module: b.module || 'SYSTEM',
  timestamp: b.date_creation || b.timestamp || new Date().toISOString(),
  status: b.succes !== undefined ? (b.succes ? 'SUCCESS' : 'FAILED') : 'SUCCESS'
});

export const mapUser = (b: any): User => ({
  id: b.id ? String(b.id) : '',
  name: b.nom || b.email.split('@')[0].toUpperCase(),
  email: b.email,
  role: b.role === 'admin' ? 'Admin' : b.role === 'directeur' ? 'Directeur' : b.role === 'responsable_axe' ? "Chef d'Axe" : 'Chercheur',
  active: b.is_active !== undefined ? b.is_active : true,
  createdAt: b.date_creation || new Date().toISOString().split('T')[0]
});

// Helper for extracts paginated or raw item objects safely
export const extractItems = (data: any): any[] => {
  if (!data) return [];
  if (Array.isArray(data)) return data;
  if (data.items && Array.isArray(data.items)) return data.items;
  return [];
};
