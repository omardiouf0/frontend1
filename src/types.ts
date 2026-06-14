/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface User {
  id: string;
  name: string;
  email: string;
  role: string; // 'Admin' | 'Chef d\'Axe' | 'Chercheur' | 'Validateur' | 'Gestionnaire'
  active: boolean;
  createdAt: string;
  permissions?: string[];
}

export interface Role {
  id: string;
  name: string;
  code: string;
  permissions: string[];
}

export interface ResearchAxis {
  id: string;
  title: string;
  code: string;
  description: string;
  headId: string; // Researcher ID
  members: string[]; // Researcher IDs
  image?: string;
}

export interface Researcher {
  id: string;
  name: string;
  email: string;
  phone: string;
  bio: string;
  rank: string; // 'Professeur' | 'Maître de Conférences' | 'Chargé de Recherche' | 'Doctorant' | 'Chercheur Associé'
  affiliation: string; // 'UCAD' | 'IRD' | 'Sorbonne Université' | 'CNRS'
  image: string;
  axes: string[]; // Axis codes or IDs
  publicationsCount: number;
  projectsCount: number;
  officeLocation?: string;
  interests?: string[];
}

export interface Publication {
  id: string;
  title: string;
  authors: string[]; // Names or Researcher IDs
  journal: string;
  year: number;
  type: string; // 'Journal' | 'Conférence' | 'Livre' | 'Thèse' | 'Preprint'
  doi?: string;
  abstract: string;
  axisId: string;
  status: 'Draft' | 'Pending' | 'Approved' | 'Rejected';
  keywords: string[];
  fileUrl?: string;
  downloadCount?: number;
  createdAt: string;
}

export interface Project {
  id: string;
  title: string;
  description: string;
  leaderId: string; // Researcher ID
  timeline: string; // e.g., "2024 - 2027"
  budget: string;
  currency: string;
  fundingSourceId: string; // Partner/Bailleur ID
  members: string[]; // Researcher IDs
  status: 'Draft' | 'Pending' | 'Approved' | 'Rejected';
  axisId: string;
  progress: number;
  createdAt: string;
}

export interface Dataset {
  id: string;
  title: string;
  description: string;
  authors: string[];
  size: string; // e.g. "4.2 GB", "120 MB"
  licenseType: string; // e.g., "Creative Commons Attributions", "ODbL"
  downloadCount: number;
  fileUrl: string;
  axisId: string;
  status: 'Draft' | 'Pending' | 'Approved' | 'Rejected';
  createdAt: string;
  classification?: 'PUBLIC' | 'PROTEGE' | 'PRIVE';
}

export interface Event {
  id: string;
  title: string;
  description: string;
  location: string;
  date: string; // YYYY-MM-DD
  time: string; // HH:MM
  coordinatorId: string; // Researcher ID
  status: 'Draft' | 'Pending' | 'Approved' | 'Rejected';
  type: string; // 'Séminaire' | 'Colloque' | 'Atelier' | 'Soutenance de Thèse'
  agenda: string[];
  image?: string;
  axisId?: string;
  createdAt: string;
}

export interface News {
  id: string;
  title: string;
  summary: string;
  content: string;
  category: string; // 'Recherche' | 'Distinction' | 'Partenariat' | 'Vie de l\'Unité'
  authorId: string;
  image: string;
  date: string; // YYYY-MM-DD
  status: 'Draft' | 'Pending' | 'Approved' | 'Rejected';
  featured: boolean;
  createdAt: string;
}

export interface Partner {
  id: string;
  name: string;
  type: string; // 'Académique' | 'Institutionnel' | 'Bailleur / Financier'
  logo: string;
  country: string;
  website: string;
}

export interface Funding {
  id: string;
  sourceId: string; // Partner ID (Bailleur)
  amount: number;
  currency: string;
  projectId: string; // Associated Project ID
  type: string; // 'Subvention' | 'Donation' | 'Contrat de Recherche'
  dateAwarded: string; // YYYY-MM-DD
}

export interface ValidationLog {
  id: string;
  entityType: 'Publication' | 'Project' | 'Dataset' | 'Event' | 'News';
  entityId: string;
  entityTitle: string;
  stage: 'Draft' | 'Pending' | 'Approved' | 'Rejected';
  user: string;
  actionDate: string;
  comment?: string;
}

export interface AuditLog {
  id: string;
  username: string;
  action: string;
  ipAddress: string;
  module: string;
  timestamp: string;
  status: 'SUCCESS' | 'FAILED';
}

export interface IrdDocument {
  id: string;
  title: string;
  type: 'PurchaseRequest' | 'InternshipAgreement' | 'ServiceReceipt' | 'InternshipProposal'; // Demande de bon d'achat, Convention de Stage, Reçu de Prestation de Service, Proposition de Stage
  studentName?: string;
  university?: string;
  amount?: number;
  envelopeManagerSignature?: string; // Signature du Responsable d'Enveloppe
  status: 'Draft' | 'Pending' | 'Approved' | 'Rejected' | 'Archived';
  createdBy: string; // Researcher ID
  createdAt: string;
  signedByDirector: boolean;
  comments?: string;
}

export interface Course {
  id: string;
  title: string;
  code: string;
  description: string;
  professorId: string; // Member Chercheur ID
  professorName: string;
  institution: string; // UCAD, UGB, AIMS Sénégal, etc.
  credits?: number;
  durationHours: number;
  syllabus: string[];
  level: 'Master' | 'Doctorat' | 'Séminaire';
  status: 'Draft' | 'Pending' | 'Approved' | 'Rejected';
  createdAt: string;
}

export interface Inscription {
  id: string;
  courseId: string;
  courseTitle: string;
  studentName: string;
  studentEmail: string;
  studentLevel: string; // 'Master' | 'Doctorant' | 'Autre'
  motivation: string;
  status: 'Pending' | 'Approved' | 'Rejected';
  createdAt: string;
}

