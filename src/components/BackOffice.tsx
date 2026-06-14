/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { useAuth } from '../hooks/useAuth';
import { Pagination } from './Pagination';
import { translations } from '../utils/translations';
import { IrdDocumentsSection } from './IrdDocumentsSection';
import { WorkflowControlHub } from './WorkflowControlHub';
import { RoleViews } from './RoleViews';
import { MyProfile } from './MyProfile';
import { GoogleScholarImporter } from './GoogleScholarImporter';
import {
  INITIAL_RESEARCHERS,
  INITIAL_AXES,
  INITIAL_PARTNERS
} from '../data/mockData';
import {
  LayoutDashboard,
  Users,
  User as UserIcon,
  ShieldAlert,
  FolderTree,
  UserCheck,
  BookOpen,
  FolderGit2,
  Database,
  Calendar,
  Newspaper,
  HeartHandshake,
  DollarSign,
  Activity,
  LogOut,
  Plus,
  Trash2,
  Edit,
  ClipboardCheck,
  AlertCircle,
  Eye,
  CheckCircle,
  XCircle,
  ArrowUpDown,
  History,
  Lock,
  Loader2,
  GraduationCap,
  Download
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line
} from 'recharts';
import {
  User,
  ResearchAxis,
  Researcher,
  Publication,
  Project,
  Dataset,
  Event,
  News,
  Partner,
  Funding
} from '../types';

interface BackOfficeProps {
  onNavigateToFrontoffice: () => void;
}

export const BackOffice: React.FC<BackOfficeProps> = ({ onNavigateToFrontoffice }) => {
  const { login, logout, sessionTimeRemaining, refreshToken } = useAuth();
  const {
    currentUser,
    switchRole,
    researchers: rawResearchers,
    axes: rawAxes,
    partners: rawPartners,
    publications: rawPublications,
    projects: rawProjects,
    datasets: rawDatasets,
    events: rawEvents,
    news: rawNews,
    users: rawUsers,
    auditLogs: rawAuditLogs,
    fundings: rawFundings,

    addUser,
    updateUser,
    deleteUser,
    addAxis,
    updateAxis,
    deleteAxis,
    addResearcher,
    updateResearcher,
    deleteResearcher,
    addPublication: rawAddPublication,
    updatePublication: rawUpdatePublication,
    deletePublication,
    addProject: rawAddProject,
    updateProject: rawUpdateProject,
    deleteProject,
    addDataset: rawAddDataset,
    updateDataset: rawUpdateDataset,
    deleteDataset,
    addEvent: rawAddEvent,
    updateEvent: rawUpdateEvent,
    deleteEvent,
    addNews: rawAddNews,
    updateNews: rawUpdateNews,
    deleteNews,
    addPartner: rawAddPartner,
    updatePartner,
    deletePartner,
    addFunding,
    updateFunding,
    deleteFunding,

    validateEntity,
    submitForValidation,

    irdDocuments,
    addIrdDocument,
    updateIrdDocument,
    deleteIrdDocument,
    signIrdDocument,
    validateIrdDocument,
    currentLanguage,
    backendUrl,
    setBackendUrl,
    isUsingMock,
    setIsUsingMock,

    courses: rawCourses,
    inscriptions,
    addCourse: rawAddCourse,
    updateCourse: rawUpdateCourse,
    deleteCourse,
    updateInscriptionStatus
  } = useApp();

  const t = translations[currentLanguage];

  // --- UI STATES & SIMULATION CONTROLS ---
  const [loginEmail, setLoginEmail] = useState('');
  const [loginRole, setLoginRole] = useState('Admin');
  const [authError, setAuthError] = useState('');
  const [authLoading, setAuthLoading] = useState(false);

  // Formations / Courses Form States
  const [courseForm, setCourseForm] = useState({
    title: '',
    code: '',
    description: '',
    professorId: '',
    institution: '',
    credits: 5,
    durationHours: 35,
    level: 'Master' as 'Master' | 'Doctorat' | 'Séminaire',
    syllabusText: ''
  });
  const [isEditingCourse, setIsEditingCourse] = useState(false);
  const [editingCourseId, setEditingCourseId] = useState<string | null>(null);
  const [subTab, setSubTab] = useState<'courses' | 'applications'>('courses');

  // SIDEBAR SELECTION
  // 'dashboard' | 'users' | 'roles' | 'axes' | 'researchers' | 'publications' | 'projects' | 'datasets' | 'events' | 'news' | 'partners' | 'funding' | 'workflow' | 'audit'
  const [activeAdminTab, setActiveAdminTab] = useState('dashboard');

  // Backoffice Pagination States
  const [boCurrentPage, setBoCurrentPage] = useState<number>(1);
  const boItemsPerPage = 5;

  const [auditCurrentPage, setAuditCurrentPage] = useState<number>(1);
  const auditItemsPerPage = 5;

  // Reset page when tab selection shifts
  useEffect(() => {
    setBoCurrentPage(1);
  }, [activeAdminTab]);

  // --- RBAC & ROLE-BASED DYNAMIC FILTERING ENGINE ---

  // Resolve current researcher context
  const currentResearcher = useMemo(() => {
    if (!currentUser) return null;
    return rawResearchers.find(r => r.email.toLowerCase() === currentUser.email.toLowerCase());
  }, [rawResearchers, currentUser]);

  const currentResearcherId = currentResearcher?.id;

  // Resolve current partner context
  const currentPartner = useMemo(() => {
    if (!currentUser || currentUser.role !== 'Partenaire') return null;
    const match = rawPartners.find(p => 
      p.name.toLowerCase().includes(currentUser.name.toLowerCase()) || 
      currentUser.email.toLowerCase().includes(p.name.split(' ')[0].toLowerCase()) ||
      currentUser.email.toLowerCase().includes('partner') ||
      currentUser.email.toLowerCase().includes('bailleur')
    );
    return match || rawPartners.find(p => p.id === 'part-4') || rawPartners[0];
  }, [rawPartners, currentUser]);

  // Managed axes for Chef d'Axe
  const managedAxes = useMemo(() => {
    if (!currentUser || currentUser.role !== 'Chef d\'Axe' || !currentResearcherId) return [];
    return rawAxes.filter(a => a.headId === currentResearcherId);
  }, [rawAxes, currentUser?.role, currentResearcherId]);

  const managedAxisIds = useMemo(() => managedAxes.map(a => a.id), [managedAxes]);

  // 1. Axes scientifically filtered
  const axes = useMemo(() => {
    if (!currentUser) return [];
    if (currentUser.role === 'Admin' || currentUser.role === 'Directeur' || currentUser.role === 'Chercheur' || currentUser.role === 'Doctorant') {
      return rawAxes;
    }
    if (currentUser.role === 'Chef d\'Axe') {
      return rawAxes.filter(a => a.headId === currentResearcherId);
    }
    return [];
  }, [rawAxes, currentUser?.role, currentResearcherId]);

  // 2. Members/Researchers filtered
  const researchers = useMemo(() => {
    if (!currentUser) return [];
    if (currentUser.role === 'Admin' || currentUser.role === 'Directeur') {
      return rawResearchers;
    }
    if (currentUser.role === 'Chef d\'Axe') {
      return rawResearchers.filter(r => 
        r.id === currentResearcherId || 
        rawAxes.filter(a => a.headId === currentResearcherId).some(a => a.members.includes(r.id))
      );
    }
    if (currentUser.role === 'Chercheur' || currentUser.role === 'Doctorant') {
      return rawResearchers.filter(r => r.id === currentResearcherId);
    }
    return [];
  }, [rawResearchers, currentUser?.role, currentResearcherId, rawAxes]);

  // 3. Publications filtered
  const publications = useMemo(() => {
    if (!currentUser) return [];
    if (currentUser.role === 'Admin' || currentUser.role === 'Directeur') {
      return rawPublications;
    }
    if (currentUser.role === 'Chef d\'Axe') {
      return rawPublications.filter(p => managedAxisIds.includes(p.axisId));
    }
    if (currentUser.role === 'Chercheur' || currentUser.role === 'Doctorant') {
      return rawPublications.filter(p => 
        currentResearcher && p.authors.some(auth => auth.toLowerCase().includes(currentResearcher.name.toLowerCase()))
      );
    }
    return [];
  }, [rawPublications, currentUser?.role, currentResearcher, managedAxisIds]);

  // 4. Projects/Conventions filtered
  const projects = useMemo(() => {
    if (!currentUser) return [];
    if (currentUser.role === 'Admin' || currentUser.role === 'Directeur' || currentUser.role === 'Doctorant') {
      return rawProjects;
    }
    if (currentUser.role === 'Chef d\'Axe') {
      return rawProjects.filter(p => managedAxisIds.includes(p.axisId));
    }
    if (currentUser.role === 'Chercheur') {
      return rawProjects.filter(p => 
        p.leaderId === currentResearcherId || p.members.includes(currentResearcherId || '')
      );
    }
    if (currentUser.role === 'Partenaire') {
      return rawProjects.filter(p => p.fundingSourceId === currentPartner?.id);
    }
    return [];
  }, [rawProjects, currentUser?.role, currentResearcherId, currentPartner, managedAxisIds]);

  // 5. Datasets filtered
  const datasets = useMemo(() => {
    if (!currentUser) return [];
    if (currentUser.role === 'Admin' || currentUser.role === 'Directeur') {
      return rawDatasets;
    }
    if (currentUser.role === 'Chef d\'Axe') {
      return rawDatasets.filter(d => managedAxisIds.includes(d.axisId));
    }
    if (currentUser.role === 'Chercheur' || currentUser.role === 'Doctorant') {
      return rawDatasets.filter(d => 
        currentResearcher && d.authors.some(auth => auth.toLowerCase().includes(currentResearcher.name.toLowerCase()))
      );
    }
    return [];
  }, [rawDatasets, currentUser?.role, currentResearcher, managedAxisIds]);

  // 6. Events filtered
  const events = useMemo(() => {
    if (!currentUser) return [];
    if (currentUser.role === 'Admin' || currentUser.role === 'Directeur' || currentUser.role === 'Chercheur' || currentUser.role === 'Doctorant' || currentUser.role === 'Partenaire') {
      if (currentUser.role === 'Chef d\'Axe') {
        const axisMembers = rawAxes.filter(a => a.headId === currentResearcherId).flatMap(a => a.members);
        return rawEvents.filter(e => e.coordinatorId === currentResearcherId || axisMembers.includes(e.coordinatorId));
      }
      return rawEvents;
    }
    return [];
  }, [rawEvents, currentUser?.role, currentResearcherId, rawAxes]);

  // 7. Formations/Courses filtered
  const courses = useMemo(() => {
    if (!currentUser) return [];
    if (currentUser.role === 'Admin' || currentUser.role === 'Directeur' || currentUser.role === 'Chercheur' || currentUser.role === 'Doctorant' || currentUser.role === 'Partenaire') {
      if (currentUser.role === 'Chef d\'Axe') {
        const axisMembers = rawAxes.filter(a => a.headId === currentResearcherId).flatMap(a => a.members);
        return rawCourses.filter(c => c.professorId === currentResearcherId || axisMembers.includes(c.professorId));
      }
      return rawCourses;
    }
    return [];
  }, [rawCourses, currentUser?.role, currentResearcherId, rawAxes]);

  const partners = rawPartners;
  const news = rawNews;
  const users = rawUsers;
  const auditLogs = rawAuditLogs;
  const fundings = rawFundings;

  // 8. IRD Administrative Documents filtered precisely
  const filteredIrdDocuments = useMemo(() => {
    if (!currentUser) return [];
    
    // Admin and Directeur see ALL documents
    if (currentUser.role === 'Admin' || currentUser.role === 'Directeur') {
      return irdDocuments;
    }

    // Solve researcher info
    const currentResId = currentResearcherId;
    const currentResEmail = currentUser.email.toLowerCase();

    return irdDocuments.filter(doc => {
      // General Creator Check (Researcher who created the document)
      const isCreator = doc.createdBy === currentResId || 
                        doc.createdBy === currentUser.id || 
                        doc.createdBy.toLowerCase() === currentResEmail;

      // 1. Demande de Bon d'Achat (PurchaseRequest)
      if (doc.type === 'PurchaseRequest') {
        if (isCreator) return true;
        if (currentUser.role === "Chef d'Axe") {
          const creatorRes = rawResearchers.find(r => r.id === doc.createdBy || r.email.toLowerCase() === doc.createdBy.toLowerCase());
          if (creatorRes) {
            const headedAxisIds = rawAxes.filter(a => a.headId === currentResId).map(a => a.id);
            return creatorRes.axes?.some(ax => headedAxisIds.includes(ax));
          }
          return false;
        }
        return false;
      }

      // 2. Convention de Stage (InternshipAgreement / InternshipProposal)
      if (doc.type === 'InternshipAgreement' || doc.type === 'InternshipProposal') {
        if (isCreator) return true;
        if (currentUser.role === "Chef d'Axe") {
          const creatorRes = rawResearchers.find(r => r.id === doc.createdBy || r.email.toLowerCase() === doc.createdBy.toLowerCase());
          if (creatorRes) {
            const headedAxisIds = rawAxes.filter(a => a.headId === currentResId).map(a => a.id);
            return creatorRes.axes?.some(ax => headedAxisIds.includes(ax));
          }
          return false;
        }
        if (currentUser.role === 'Doctorant') {
          const nameMatches = doc.studentName && currentUser.name && (
            doc.studentName.toLowerCase().includes(currentUser.name.toLowerCase()) ||
            currentUser.name.toLowerCase().includes(doc.studentName.toLowerCase())
          );
          return isCreator || nameMatches;
        }
        return false;
      }

      // 3. Reçu de Prestation de Service (ServiceReceipt)
      if (doc.type === 'ServiceReceipt') {
        if (isCreator) return true;
        if (currentUser.role === "Chef d'Axe") {
          const creatorRes = rawResearchers.find(r => r.id === doc.createdBy || r.email.toLowerCase() === doc.createdBy.toLowerCase());
          if (creatorRes) {
            const headedAxisIds = rawAxes.filter(a => a.headId === currentResId).map(a => a.id);
            return creatorRes.axes?.some(ax => headedAxisIds.includes(ax));
          }
          return false;
        }
        if (currentUser.role === 'Partenaire') {
          const matchesPartnerName = (doc.comments && currentUser.name && doc.comments.toLowerCase().includes(currentUser.name.toLowerCase())) ||
                                     (doc.title && currentUser.name && doc.title.toLowerCase().includes(currentUser.name.toLowerCase()));
          return isCreator || matchesPartnerName || true; 
        }
        return false;
      }

      return false;
    });
  }, [irdDocuments, currentUser, currentResearcherId, rawResearchers, rawAxes]);

  const addPublication = (pubData: any) => {
    const forced = currentUser?.role === 'Doctorant' ? { ...pubData, status: 'Approved' } : pubData;
    rawAddPublication(forced);
  };

  const updatePublication = (id: string, pubData: any) => {
    const forced = currentUser?.role === 'Doctorant' ? { ...pubData, status: 'Approved' } : pubData;
    rawUpdatePublication(id, forced);
  };

  const addProject = (projData: any) => {
    const forced = currentUser?.role === 'Doctorant' ? { ...projData, status: 'Pending' } : projData;
    rawAddProject(forced);
  };

  const updateProject = (id: string, projData: any) => {
    const forced = currentUser?.role === 'Doctorant' ? { ...projData, status: 'Pending' } : projData;
    rawUpdateProject(id, forced);
  };

  const addDataset = (datasetData: any) => {
    const forced = currentUser?.role === 'Doctorant' ? { ...datasetData, status: 'Approved' } : datasetData;
    rawAddDataset(forced);
  };

  const updateDataset = (id: string, datasetData: any) => {
    const forced = currentUser?.role === 'Doctorant' ? { ...datasetData, status: 'Approved' } : datasetData;
    rawUpdateDataset(id, forced);
  };

  const addEvent = (evtData: any) => {
    const forced = currentUser?.role === 'Doctorant' ? { ...evtData, status: 'Pending' } : evtData;
    rawAddEvent(forced);
  };

  const updateEvent = (id: string, evtData: any) => {
    const forced = currentUser?.role === 'Doctorant' ? { ...evtData, status: 'Pending' } : evtData;
    rawUpdateEvent(id, forced);
  };

  const addCourse = (courseData: any) => {
    const forced = currentUser?.role === 'Doctorant' ? { ...courseData, status: 'Pending' } : courseData;
    rawAddCourse(forced);
  };

  const updateCourse = (id: string, courseData: any) => {
    const forced = currentUser?.role === 'Doctorant' ? { ...courseData, status: 'Pending' } : courseData;
    rawUpdateCourse(id, forced);
  };

  // --- INTEGRATED DATA BACKUP & ZIP DOWNLOAD LOGIC ---
  const downloadDatabaseBackup = () => {
    const databaseDump = {
      exportedAt: new Date().toISOString(),
      system: "LMI UMMISCO Portal - Central Registry Database Dump",
      users: rawUsers,
      axes: rawAxes,
      researchers: rawResearchers,
      publications: rawPublications,
      projects: rawProjects,
      datasets: rawDatasets,
      events: rawEvents,
      news: rawNews,
      partners: rawPartners,
      courses: rawCourses,
      auditLogs: rawAuditLogs
    };

    try {
      const jsonString = `data:text/json;charset=utf-8,${encodeURIComponent(JSON.stringify(databaseDump, null, 2))}`;
      const downloadAnchor = document.createElement('a');
      downloadAnchor.setAttribute('href', jsonString);
      downloadAnchor.setAttribute('download', 'ummisco_central_database_backup.json');
      document.body.appendChild(downloadAnchor);
      downloadAnchor.click();
      downloadAnchor.remove();
    } catch (err) {
      console.error('Failed to trigger database backup download', err);
    }
  };

  const [codeDownloadModalOpen, setCodeDownloadModalOpen] = useState(false);

  const canCreateOrEdit = useMemo(() => {
    if (!currentUser) return false;
    if (currentUser.role === 'Admin') return true;

    if (activeAdminTab === 'axes') {
      if (currentUser.role === 'Directeur') return false;
      if (currentUser.role === 'Chef d\'Axe') return true;
      return false;
    }

    if (activeAdminTab === 'researchers') {
      if (currentUser.role === 'Directeur') return true;
      if (currentUser.role === 'Chef d\'Axe') return true;
      if (currentUser.role === 'Chercheur' || currentUser.role === 'Doctorant') {
        return true;
      }
      return false;
    }

    if (activeAdminTab === 'publications' || activeAdminTab === 'datasets') {
      if (currentUser.role === 'Directeur') return false;
      if (currentUser.role === 'Chef d\'Axe') return false;
      if (currentUser.role === 'Chercheur' || currentUser.role === 'Doctorant') return true;
      return false;
    }

    if (activeAdminTab === 'projects') {
      if (currentUser.role === 'Directeur') return false;
      if (currentUser.role === 'Partenaire') return false;
      return true;
    }

    if (activeAdminTab === 'events') {
      if (currentUser.role === 'Directeur') return false;
      if (currentUser.role === 'Chef d\'Axe') return true;
      return false;
    }

    if (activeAdminTab === 'formations') {
      if (currentUser.role === 'Directeur') return true;
      if (currentUser.role === 'Chef d\'Axe') return true;
      return false;
    }

    return true;
  }, [currentUser?.role, activeAdminTab]);

  const canEditEntity = (item: any) => {
    if (!currentUser) return false;
    if (currentUser.role === 'Admin') return true;

    if (activeAdminTab === 'axes') {
      return currentUser.role === 'Chef d\'Axe' && item.headId === currentResearcherId;
    }

    if (activeAdminTab === 'researchers') {
      if (currentUser.role === 'Directeur') return true;
      if (currentUser.role === 'Chef d\'Axe') {
        const managedAxisIds = rawAxes.filter(a => a.headId === currentResearcherId).map(a => a.id);
        return item.id === currentResearcherId || rawAxes.filter(a => managedAxisIds.includes(a.id)).some(a => a.members.includes(item.id));
      }
      if (currentUser.role === 'Chercheur' || currentUser.role === 'Doctorant') {
        return item.id === currentResearcherId;
      }
      return false;
    }

    if (activeAdminTab === 'publications' || activeAdminTab === 'datasets') {
      if (currentUser.role === 'Chercheur' || currentUser.role === 'Doctorant') {
        return currentResearcher && item.authors.some((auth: string) => auth.toLowerCase().includes(currentResearcher.name.toLowerCase()));
      }
      return false;
    }

    if (activeAdminTab === 'projects') {
      if (currentUser.role === 'Chef d\'Axe') {
        return managedAxisIds.includes(item.axisId);
      }
      if (currentUser.role === 'Chercheur') {
        return item.leaderId === currentResearcherId || item.members.includes(currentResearcherId || '');
      }
      return false;
    }

    if (activeAdminTab === 'events') {
      if (currentUser.role === 'Chef d\'Axe') {
        return item.coordinatorId === currentResearcherId || rawAxes.filter(a => a.headId === currentResearcherId).flatMap(a => a.members).includes(item.coordinatorId);
      }
      return false;
    }

    if (activeAdminTab === 'formations') {
      if (currentUser.role === 'Directeur') return true;
      if (currentUser.role === 'Chef d\'Axe') {
        return item.professorId === currentResearcherId || rawAxes.filter(a => a.headId === currentResearcherId).flatMap(a => a.members).includes(item.professorId);
      }
      return false;
    }

    return false;
  };

  const canDeleteEntity = (item: any) => {
    if (!currentUser) return false;
    if (currentUser.role === 'Admin') return true;
    if (currentUser.role === 'Directeur') {
      return activeAdminTab === 'researchers' || activeAdminTab === 'formations';
    }
    if (currentUser.role === 'Chef d\'Axe') {
      if (activeAdminTab === 'axes') return false;
      if (activeAdminTab === 'researchers') return false;
      if (activeAdminTab === 'projects') return managedAxisIds.includes(item.axisId);
      if (activeAdminTab === 'events') return item.coordinatorId === currentResearcherId;
      if (activeAdminTab === 'formations') return item.professorId === currentResearcherId;
    }
    if (currentUser.role === 'Chercheur' || currentUser.role === 'Doctorant') {
      if ((activeAdminTab === 'publications' || activeAdminTab === 'datasets') && item.status === 'Draft') {
        return currentResearcher && item.authors.some((auth: string) => auth.toLowerCase().includes(currentResearcher.name.toLowerCase()));
      }
    }
    return false;
  };

  // Define missing action wrappers for lists/roles helper
  const addNews = rawAddNews;
  const updateNews = rawUpdateNews;
  const addPartner = rawAddPartner;

  // Guard tab switching based on active role permissions
  useEffect(() => {
    if (!currentUser) return;
    const allowedRoles: Record<string, string[]> = {
      dashboard: ['Admin', 'Directeur', 'Chef d\'Axe', 'Chercheur', 'Doctorant', 'Partenaire', 'Gestionnaire'],
      profile: ['Admin', 'Chef d\'Axe', 'Chercheur', 'Doctorant'],
      workflow: ['Admin', 'Directeur', 'Chef d\'Axe'],
      ird_docs: ['Admin', 'Directeur', 'Chercheur'],
      users: ['Admin'],
      axes: ['Admin', 'Directeur', 'Chef d\'Axe', 'Chercheur', 'Doctorant'],
      researchers: ['Admin', 'Directeur', 'Chef d\'Axe', 'Chercheur', 'Doctorant'],
      publications: ['Admin', 'Directeur', 'Chef d\'Axe', 'Chercheur', 'Doctorant'],
      projects: ['Admin', 'Directeur', 'Chef d\'Axe', 'Chercheur', 'Partenaire'],
      datasets: ['Admin', 'Directeur', 'Chef d\'Axe', 'Chercheur', 'Doctorant'],
      events: ['Admin', 'Directeur', 'Chef d\'Axe', 'Chercheur', 'Doctorant', 'Partenaire', 'Gestionnaire'],
      news: ['Admin', 'Directeur', 'Gestionnaire'],
      partners: ['Admin', 'Directeur', 'Gestionnaire'],
      formations: ['Admin', 'Directeur', 'Chef d\'Axe', 'Chercheur', 'Doctorant', 'Partenaire', 'Gestionnaire'],
      audit: ['Admin']
    };

    const rolesAllowed = allowedRoles[activeAdminTab];
    if (rolesAllowed && !rolesAllowed.includes(currentUser.role)) {
      setActiveAdminTab('dashboard');
    }
  }, [currentUser?.role, activeAdminTab]);

  // Dynamically resolve target table list
  const currentTabList = useMemo(() => {
    if (activeAdminTab === 'users') return users;
    if (activeAdminTab === 'axes') return axes;
    if (activeAdminTab === 'researchers') return researchers;
    if (activeAdminTab === 'publications') return publications;
    if (activeAdminTab === 'projects') return projects;
    if (activeAdminTab === 'datasets') return datasets;
    if (activeAdminTab === 'events') return events;
    if (activeAdminTab === 'news') return news;
    if (activeAdminTab === 'partners') return partners;
    if (activeAdminTab === 'formations') return courses;
    return [];
  }, [activeAdminTab, users, axes, researchers, publications, projects, datasets, events, news, partners, courses]);

  const paginatedTabList = useMemo(() => {
    const start = (boCurrentPage - 1) * boItemsPerPage;
    return currentTabList.slice(start, start + boItemsPerPage);
  }, [currentTabList, boCurrentPage, boItemsPerPage]);

  const paginatedAuditLogs = useMemo(() => {
    const start = (auditCurrentPage - 1) * auditItemsPerPage;
    return auditLogs.slice(start, start + auditItemsPerPage);
  }, [auditLogs, auditCurrentPage, auditItemsPerPage]);

  // FORM EDIT/CREATE STATES
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isSubmitModalOpen, setIsSubmitModalOpen] = useState(false);
  const [entityTypeToCreate, setEntityTypeToCreate] = useState<string>('');

  // 1. Generic modal triggers
  const [modalOpen, setModalOpen] = useState(false);

  // States to store typed payload for CRUD forms
  const [userForm, setUserForm] = useState({ name: '', email: '', role: 'Chercheur', active: true });
  const [axisForm, setAxisForm] = useState({ title: '', code: '', description: '', headId: '', members: [] as string[] });
  const [researcherForm, setResearcherForm] = useState({ name: '', email: '', phone: '', rank: 'Chargé de Recherche', affiliation: 'UCAD', bio: '', axes: [] as string[], image: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200', publicationsCount: 0, projectsCount: 0 });
  const [publicationForm, setPublicationForm] = useState({ title: '', authors: [] as string[], journal: '', year: 2026, type: 'Journal', abstract: '', axisId: '', keywords: '', doi: '' });
  const [projectForm, setProjectForm] = useState({ title: '', description: '', leaderId: '', timeline: '2026 - 2029', budget: '150 000', currency: 'EUR', fundingSourceId: '', members: [] as string[], axisId: '', progress: 0 });
  const [datasetForm, setDatasetForm] = useState({ title: '', description: '', authors: '', size: '150 MB', licenseType: 'Creative Commons Attribution 4.0 International', axisId: '' });
  const [eventForm, setEventForm] = useState({ title: '', description: '', location: 'UCAD Dakar', date: '2026-10-12', time: '09:00', coordinatorId: '', type: 'Séminaire', agenda: '' });
  const [newsForm, setNewsForm] = useState({ title: '', summary: '', content: '', category: 'Recherche', image: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&q=80&w=600', featured: false });
  const [partnerForm, setPartnerForm] = useState({ name: '', type: 'Académique', logo: '🌐', country: 'Sénégal', website: 'https://ummisco.sn' });
  const [fundingForm, setFundingForm] = useState({ sourceId: '', amount: 150000, currency: 'EUR', projectId: '', type: 'Subvention', dateAwarded: '2026-06-06' });

  // RECHARTS STATISTICS DATA PROCESSING
  const yearChartData = useMemo(() => {
    const counts: Record<number, number> = {};
    publications.forEach(p => {
      counts[p.year] = (counts[p.year] || 0) + 1;
    });
    return Object.keys(counts).sort().map(year => ({
      name: year,
      Publications: counts[Number(year)]
    }));
  }, [publications]);

  const axisProjectsData = useMemo(() => {
    return axes.map(a => {
      const projCount = projects.filter(p => p.axisId === a.id).length;
      return {
        name: a.code,
        Projets: projCount
      };
    });
  }, [axes, projects]);

  const auditActivitiesData = useMemo(() => {
    const recentLogs = auditLogs.slice(0, 7).reverse();
    return recentLogs.map(l => ({
      name: new Date(l.timestamp).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }),
      Activités: l.status === 'SUCCESS' ? 10 : 2
    }));
  }, [auditLogs]);

  // LOGIN FLOW SIMULATOR
  const handleSimulatedSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!loginEmail) {
      setAuthError("L'adresse de messagerie est requise.");
      return;
    }
    setAuthLoading(true);
    setAuthError('');
    
    setTimeout(async () => {
      const resp = await login(loginEmail, loginRole);
      setAuthLoading(false);
      if (!resp.success) {
        setAuthError(resp.error || 'Erreur inconnue.');
      }
    }, 1200);
  };

  const loadPreLogin = (email: string, role: string) => {
    setLoginEmail(email);
    setLoginRole(role);
  };

  // Workflow queue list
  const pendingEntities = useMemo(() => {
    const pPubs = publications.filter(p => p.status === 'Pending').map(x => ({ ...x, labelType: 'Publication' }));
    const pProjs = projects.filter(p => p.status === 'Pending').map(x => ({ ...x, labelType: 'Projet' }));
    const pDatas = datasets.filter(d => d.status === 'Pending').map(x => ({ ...x, labelType: 'Dataset' }));
    const pEvts = events.filter(e => e.status === 'Pending').map(x => ({ ...x, labelType: 'Événement' }));
    const pNews = news.filter(n => n.status === 'Pending').map(x => ({ ...x, labelType: 'Actualité' }));

    return [...pPubs, ...pProjs, ...pDatas, ...pEvts, ...pNews];
  }, [publications, projects, datasets, events, news]);

  // Handle Workflow Decision
  const handleWorkflowAction = (entity: any, decision: 'Approved' | 'Rejected') => {
    const comment = prompt(`Saisissez un motif pour la décision [${decision}] sur : ${entity.title}`) || 'Rien à signaler.';
    validateEntity(entity.labelType as any, entity.id, decision, comment);
  };

  // Form CRUD submit wrappers
  const saveCrudForm = () => {
    if (editingId) {
      // PERFORM RECORD UPDATE
      if (activeAdminTab === 'users') updateUser(editingId, userForm);
      else if (activeAdminTab === 'axes') updateAxis(editingId, axisForm);
      else if (activeAdminTab === 'researchers') updateResearcher(editingId, researcherForm);
      else if (activeAdminTab === 'publications') updatePublication(editingId, { ...publicationForm, authors: [publicationForm.authors as any] });
      else if (activeAdminTab === 'projects') updateProject(editingId, projectForm);
      else if (activeAdminTab === 'datasets') updateDataset(editingId, { ...datasetForm, authors: [datasetForm.authors as any] });
      else if (activeAdminTab === 'events') updateEvent(editingId, { ...eventForm, agenda: [eventForm.agenda] });
      else if (activeAdminTab === 'news') updateNews(editingId, newsForm);
      else if (activeAdminTab === 'partners') updatePartner(editingId, partnerForm);
      else if (activeAdminTab === 'funding') updateFunding(editingId, fundingForm);
    } else {
      // PREPARE RECORD INSERT
      if (activeAdminTab === 'users') addUser(userForm);
      else if (activeAdminTab === 'axes') addAxis(axisForm);
      else if (activeAdminTab === 'researchers') addResearcher(researcherForm);
      else if (activeAdminTab === 'publications') addPublication({ ...publicationForm, authors: [publicationForm.authors as any] });
      else if (activeAdminTab === 'projects') addProject(projectForm);
      else if (activeAdminTab === 'datasets') addDataset({ ...datasetForm, authors: [datasetForm.authors as any], downloadCount: 0 });
      else if (activeAdminTab === 'events') addEvent({ ...eventForm, agenda: [eventForm.agenda] });
      else if (activeAdminTab === 'news') addNews({ ...newsForm, authorId: 'res-1' });
      else if (activeAdminTab === 'partners') addPartner(partnerForm);
      else if (activeAdminTab === 'funding') addFunding(fundingForm);
    }
    setModalOpen(false);
    setEditingId(null);
  };

  // Bind existing values to forms for editing
  const initiateEdit = (entity: any) => {
    setEditingId(entity.id);
    if (activeAdminTab === 'users') {
      setUserForm({ name: entity.name, email: entity.email, role: entity.role, active: entity.active });
    } else if (activeAdminTab === 'axes') {
      setAxisForm({ title: entity.title, code: entity.code, description: entity.description, headId: entity.headId, members: entity.members });
    } else if (activeAdminTab === 'researchers') {
      setResearcherForm({ name: entity.name, email: entity.email, phone: entity.phone, rank: entity.rank, affiliation: entity.affiliation, bio: entity.bio, axes: entity.axes, image: entity.image, publicationsCount: entity.publicationsCount, projectsCount: entity.projectsCount });
    } else if (activeAdminTab === 'publications') {
      setPublicationForm({ title: entity.title, authors: entity.authors.join(', ') as any, journal: entity.journal, year: entity.year, type: entity.type, abstract: entity.abstract, axisId: entity.axisId, keywords: entity.keywords.join(', '), doi: entity.doi || '' });
    } else if (activeAdminTab === 'projects') {
      setProjectForm({ title: entity.title, description: entity.description, leaderId: entity.leaderId, timeline: entity.timeline, budget: entity.budget, currency: entity.currency, fundingSourceId: entity.fundingSourceId, members: entity.members, axisId: entity.axisId, progress: entity.progress });
    } else if (activeAdminTab === 'datasets') {
      setDatasetForm({ title: entity.title, description: entity.description, authors: entity.authors.join(', ') as any, size: entity.size, licenseType: entity.licenseType, axisId: entity.axisId });
    } else if (activeAdminTab === 'events') {
      setEventForm({ title: entity.title, description: entity.description, location: entity.location, date: entity.date, time: entity.time, coordinatorId: entity.coordinatorId, type: entity.type, agenda: entity.agenda.join(' \n ') });
    } else if (activeAdminTab === 'news') {
      setNewsForm({ title: item => entity.title, summary: entity.summary, content: entity.content, category: entity.category, image: entity.image, featured: entity.featured } as any);
    } else if (activeAdminTab === 'partners') {
      setPartnerForm({ name: entity.name, type: entity.type, logo: entity.logo, country: entity.country, website: entity.website });
    } else if (activeAdminTab === 'funding') {
      setFundingForm({ sourceId: entity.sourceId, amount: entity.amount, currency: entity.currency, projectId: entity.projectId, type: entity.type, dateAwarded: entity.dateAwarded });
    }
    setModalOpen(true);
  };

  const initiateCreate = () => {
    setEditingId(null);
    // Reset forms
    setUserForm({ name: '', email: '', role: 'Chercheur', active: true });
    setPublicationForm({ title: '', authors: '' as any, journal: '', year: 2026, type: 'Journal', abstract: '', axisId: axes[0]?.id || '', keywords: '', doi: '' });
    setProjectForm({ title: '', description: '', leaderId: researchers[0]?.id || '', timeline: '2026 - 2029', budget: '150 000', currency: 'EUR', fundingSourceId: partners[0]?.id || '', members: [], axisId: axes[0]?.id || '', progress: 0 });
    setDatasetForm({ title: '', description: '', authors: '' as any, size: '20 MB', licenseType: 'Creative Commons Attribution 4.0 International', axisId: axes[0]?.id || '' });
    setEventForm({ title: '', description: '', location: 'UCAD Dakar', date: '2126-06-06', time: '09:00', coordinatorId: researchers[0]?.id || '', type: 'Séminaire', agenda: '' });
    setModalOpen(true);
  };

  // CHECK PERMISSIONS (RBAC)
  const isAuthorized = (action: string) => {
    if (!currentUser) return false;
    if (currentUser.role === 'Admin' || currentUser.role === 'Directeur') return true;
    if (action === 'workflow.validate') {
      return currentUser.role === 'Chef d\'Axe' || currentUser.role === 'Validateur';
    }
    if (action === 'users.manage' || action === 'roles.manage') {
      return false; // Strictly Admin
    }
    return true; // Simple actions permitted for researchers/gestionnaires
  };

  if (!currentUser) {
    return (
      <div className="min-h-screen bg-slate-900 text-white flex flex-col justify-center items-center p-4">
        <div className="w-full max-w-md bg-slate-850 p-8 rounded-2xl border border-slate-750 shadow-2xl space-y-6">
          <div className="text-center space-y-2">
            <h1 className="text-2xl font-display font-medium text-brand-gold tracking-tight uppercase">UMMISCO - Espace de Validation</h1>
            <p className="text-xs text-slate-400 leading-snug">
              Authentifiez-vous via le simulateur JWT pour accéder à la gouvernance.
            </p>
          </div>

          <form onSubmit={handleSimulatedSubmit} className="space-y-4">
            {authError && (
              <div className="bg-rose-500/10 text-rose-400 p-3 rounded-lg text-xs flex items-center gap-2 border border-rose-500/20">
                <AlertCircle size={16} />
                <span>{authError}</span>
              </div>
            )}

            <div className="space-y-1">
              <label className="text-[10px] uppercase text-slate-500 font-bold">Identifiant (Messagerie)</label>
              <input
                type="email"
                required
                value={loginEmail}
                onChange={(e) => setLoginEmail(e.target.value)}
                placeholder="Ex : admin@ummisco.sn"
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3.5 py-2 text-xs focus:ring-1 focus:ring-brand-gold text-slate-205"
              />
            </div>

            <div className="space-y-1">
              <label className="text-[10px] uppercase text-slate-500 font-bold">Rôle assigné (Simulé)</label>
              <select
                value={loginRole}
                onChange={(e) => setLoginRole(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-205"
              >
                <option value="Directeur">Directeur (RBAC: Directeur / IRD)</option>
                <option value="Admin">Administrateur Unique (RBAC: All)</option>
                <option value="Chef d'Axe">Chef d'Axe / Validateur (RBAC: Scientifique)</option>
                <option value="Chercheur">Membre Chercheur (RBAC: Lecture/Fiches)</option>
                <option value="Gestionnaire">Secrétaire (RBAC: Vie de l'Unité)</option>
              </select>
            </div>

            <button
              type="submit"
              disabled={authLoading}
              className="w-full bg-brand-gold hover:bg-brand-gold/90 text-slate-900 font-bold rounded-lg py-2.5 text-xs transition-colors flex items-center justify-center gap-2 cursor-pointer"
            >
              {authLoading ? (
                <>
                  <Loader2 size={16} className="animate-spin" />
                  Génération des clés JWT en cours...
                </>
              ) : (
                'Générer un JWT Client et se connecter'
              )}
            </button>
          </form>

          {/* Quick Shortcuts */}
          <div className="pt-4 border-t border-slate-700/60 !mt-6 space-y-2">
            <span className="text-[9px] uppercase tracking-wider text-slate-400 font-bold block text-center">Identifiants et Rôles Prédéfinis</span>
            <div className="grid grid-cols-2 gap-2 text-center text-[10px] font-mono font-medium">
              <button
                onClick={() => loadPreLogin("pascal.valentin@ird.fr", "Directeur")}
                className="p-1 px-2 border border-slate-700 hover:border-brand-gold bg-slate-800 text-amber-300 rounded hover:scale-101 col-span-2 text-center font-bold"
              >
                ✍️ Pr. Pascal Valentin (Directeur)
              </button>
              <button
                onClick={() => loadPreLogin("admin@ummisco.sn", "Admin")}
                className="p-1 px-2 border border-slate-700 hover:border-brand-gold bg-slate-800 text-slate-300 rounded hover:scale-101"
              >
                🚀 Admin
              </button>
              <button
                onClick={() => loadPreLogin("msamba.diouf@ucad.edu.sn", "Chef d'Axe")}
                className="p-1 px-2 border border-slate-700 hover:border-brand-gold bg-slate-800 text-slate-300 rounded hover:scale-101"
              >
                🎓 Chef d'Axe
              </button>
            </div>
            <button
              onClick={onNavigateToFrontoffice}
              className="text-center w-full text-[10px] text-brand-gold hover:underline block pt-2"
            >
              Retourner au Portail Public
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col md:flex-row text-slate-800">
      
      {/* 1. SIDEBAR NAVIGATION */}
      <aside className="w-full md:w-64 bg-brand-dark text-slate-100 flex flex-col justify-between border-r border-slate-850">
        <div>
          {/* Brand layout */}
          <div className="p-6 border-b border-slate-800 space-y-1">
            <h2 className="text-sm font-display font-bold text-brand-gold uppercase tracking-wider">Espace Décideurs</h2>
            <div className="flex items-center gap-1">
              <span className="inline-block w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              <span className="text-[10px] text-slate-400 truncate max-w-44 font-medium">{currentUser.email}</span>
            </div>
          </div>

          {/* Nav links */}
          <nav className="p-3 space-y-1 text-xs">
            {[
              { id: 'dashboard', label: ['Admin', 'Directeur', 'Chef d\'Axe'].includes(currentUser.role) ? 'Indicateurs Globaux' : 'Mon Espace Personnel', icon: LayoutDashboard, roles: ['Admin', 'Directeur', 'Chef d\'Axe', 'Chercheur', 'Doctorant', 'Partenaire', 'Gestionnaire'] },
              { id: 'profile', label: 'Mon Profil Académique', icon: UserIcon, roles: ['Admin', 'Chef d\'Axe', 'Chercheur', 'Doctorant'] },
              { id: 'workflow', label: 'File de validation', icon: ClipboardCheck, count: pendingEntities.length, roles: ['Admin', 'Directeur', 'Chef d\'Axe'] },
              { id: 'ird_docs', label: t.irdDocs, icon: ClipboardCheck, roles: ['Admin', 'Directeur', 'Chef d\'Axe', 'Chercheur', 'Doctorant', 'Partenaire', 'Gestionnaire'] },
              { id: 'stats', label: 'Statistiques d\'Unité (/dashboard/stats)', icon: Activity, roles: ['Admin'] },
              { id: 'users', label: 'Utilisateurs (RBAC)', icon: Users, roles: ['Admin'] },
              { id: 'axes', label: 'Axes scientifiques', icon: FolderTree, roles: ['Admin', 'Directeur', 'Chef d\'Axe', 'Chercheur', 'Doctorant'] },
              { id: 'researchers', label: 'Membres Chercheurs', icon: UserCheck, roles: ['Admin', 'Directeur', 'Chef d\'Axe', 'Chercheur', 'Doctorant'] },
              { id: 'publications', label: 'Publications', icon: BookOpen, roles: ['Admin', 'Directeur', 'Chef d\'Axe', 'Chercheur', 'Doctorant'] },
              { id: 'projects', label: 'Conventions Projets', icon: FolderGit2, roles: ['Admin', 'Directeur', 'Chef d\'Axe', 'Chercheur', 'Partenaire'] },
              { id: 'datasets', label: 'Datasets', icon: Database, roles: ['Admin', 'Directeur', 'Chef d\'Axe', 'Chercheur', 'Doctorant'] },
              { id: 'events', label: 'Événements', icon: Calendar, roles: ['Admin', 'Directeur', 'Chef d\'Axe', 'Chercheur', 'Doctorant', 'Partenaire', 'Gestionnaire'] },
              { id: 'news', label: 'Dépêches News', icon: Newspaper, roles: ['Admin', 'Directeur', 'Gestionnaire'] },
              { id: 'partners', label: 'Partenaires', icon: HeartHandshake, roles: ['Admin', 'Directeur', 'Gestionnaire'] },
              { id: 'formations', label: 'Formations / Cours', icon: GraduationCap, roles: ['Admin', 'Directeur', 'Chef d\'Axe', 'Chercheur', 'Doctorant', 'Partenaire', 'Gestionnaire'] },
              { id: 'audit', label: 'Logs d\'Audit', icon: History, roles: ['Admin'] }
            ].map(item => {
              if (item.roles && !item.roles.includes(currentUser.role)) return null;

              return (
                <button
                  key={item.id}
                  onClick={() => setActiveAdminTab(item.id)}
                  className={`w-full text-left px-3.5 py-2.5 rounded-lg flex items-center justify-between transition-colors ${
                    activeAdminTab === item.id ? 'bg-brand-gold text-slate-900 font-bold' : 'hover:bg-white/5 text-slate-300'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <item.icon size={16} />
                    <span>{item.label}</span>
                  </div>
                  {item.count !== undefined && item.count > 0 && (
                    <span className="bg-rose-500 text-white text-[9px] font-bold px-1.5 py-0.5 rounded-full">
                      {item.count}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Footer Sidebar actions */}
        <div className="p-4 border-t border-slate-800 space-y-2 text-xs">
          <div className="space-y-1 bg-slate-900/60 p-2.5 rounded-lg border border-slate-800">
            <span className="text-[9px] uppercase tracking-wider text-slate-400 block font-bold leading-none">Simulation Profil Actif</span>
            <div className="flex items-center justify-between gap-1.5">
              <span className="font-semibold text-brand-gold leading-none pb-0.5">{currentUser?.role}</span>
              <button
                onClick={() => {
                  if (!currentUser) return;
                  let targetRole = 'Admin';
                  if (currentUser.role === 'Admin') targetRole = 'Directeur';
                  else if (currentUser.role === 'Directeur') targetRole = 'Chef d\'Axe';
                  else if (currentUser.role === 'Chef d\'Axe') targetRole = 'Chercheur';
                  else if (currentUser.role === 'Chercheur') targetRole = 'Doctorant';
                  else if (currentUser.role === 'Doctorant') targetRole = 'Partenaire';
                  else if (currentUser.role === 'Partenaire') targetRole = 'Gestionnaire';
                  switchRole(targetRole);
                }}
                className="text-[9px] underline text-slate-400 hover:text-white"
              >
                Togler
              </button>
            </div>
          </div>
          {currentUser && (
            <div className="space-y-1 bg-slate-900/65 p-2.5 rounded-lg border border-slate-800 text-[10px]">
              <div className="flex items-center justify-between">
                <span className="text-[9px] uppercase tracking-wider text-slate-400 font-bold block">VALIDITÉ JWT ACCESS</span>
                <span className={`inline-block w-1.5 h-1.5 rounded-full ${sessionTimeRemaining > 60 ? 'bg-emerald-500 animate-pulse' : 'bg-rose-500 animate-ping'}`}></span>
              </div>
              <div className="flex items-center justify-between text-slate-200 mt-1">
                <span className="font-mono text-xs font-bold font-mono">
                  {Math.floor(sessionTimeRemaining / 60)}m {sessionTimeRemaining % 60}s
                </span>
                <button
                  onClick={() => refreshToken()}
                  className="text-[9px] text-brand-gold hover:text-white uppercase tracking-wider font-bold"
                >
                  Renew (7d)
                </button>
              </div>
            </div>
          )}
          
          {/* SAUVEGARDE ET TÉLÉCHARGEMENTS SCIENTIFIQUES PANEL */}
          <div className="space-y-1.5 bg-slate-900 p-2.5 rounded-lg border border-slate-800 text-[10px]">
            <span className="text-[9px] uppercase tracking-wider text-slate-400 font-bold block">💾 SAUVEGARDES & EXPORTS</span>
            <div className="grid grid-cols-2 gap-1 mt-1">
              <button
                onClick={downloadDatabaseBackup}
                className="py-1.5 px-2 bg-emerald-700 hover:bg-emerald-600 font-bold text-white rounded text-[9px] flex items-center justify-center gap-1 transition-all cursor-pointer"
                title="Exporter toutes les données du portail en JSON"
              >
                <Database size={10} />
                Exporter JSON
              </button>
              <button
                onClick={() => setCodeDownloadModalOpen(true)}
                className="py-1.5 px-2 bg-brand-gold hover:bg-brand-gold/90 font-bold text-slate-950 rounded text-[9px] flex items-center justify-center gap-1 transition-all cursor-pointer"
                title="Comment télécharger le projet complet (Zip / Git)"
              >
                <Download size={10} />
                Code Source
              </button>
            </div>
          </div>

          <button
            onClick={logout}
            className="w-full py-2 bg-slate-800 hover:bg-slate-750 rounded-lg text-slate-300 hover:text-white font-semibold flex items-center justify-center gap-2"
          >
            <LogOut size={14} />
            Se déconnecter (JWT)
          </button>
          <button
            onClick={onNavigateToFrontoffice}
            className="w-full text-center text-[10px] text-brand-gold underline block"
          >
            Retourner au Portail Public
          </button>
        </div>
      </aside>

      {/* 2. BODY CONTENT PANEL */}
      <main className="flex-grow p-6 md:p-8 max-h-screen overflow-y-auto">
        <div className="max-w-6xl mx-auto space-y-6">
          
          {/* Breadcrumb row */}
          <div className="flex justify-between items-center bg-white p-4 rounded-xl border border-slate-200/80 shadow-3xs">
            <div className="space-y-1">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Console d'administration</span>
              <h1 className="text-xl font-display font-bold text-slate-800 leading-none">
                {activeAdminTab === 'dashboard' && "Indicateurs et Tableaux de bord"}
                {activeAdminTab === 'profile' && "Mon Profil Universitaire & Scientifique"}
                {activeAdminTab === 'workflow' && "Workflow de Validation Scientifique"}
                {activeAdminTab === 'ird_docs' && t.irdDocs}
                {activeAdminTab === 'stats' && "Indicateurs de Performance Globaux (/dashboard/stats)"}
                {activeAdminTab === 'users' && "Gestion des Profils & RBAC"}
                {activeAdminTab === 'axes' && "Axes thématiques scientifiques"}
                {activeAdminTab === 'researchers' && "Registre des Enseignants-Chercheurs"}
                {activeAdminTab === 'publications' && "Répertoire de Documentation"}
                {activeAdminTab === 'projects' && "Conventions de financement Projets"}
                {activeAdminTab === 'datasets' && "Ensembles de Métadonnées (Datasets)"}
                {activeAdminTab === 'events' && "Cycles de Conférences & Agenda"}
                {activeAdminTab === 'news' && "Actualités & Revue de Presse"}
                {activeAdminTab === 'partners' && "Identités Partenaires"}
                {activeAdminTab === 'formations' && "Formations, Programmes Académiques & Candidatures"}
                {activeAdminTab === 'audit' && "Logs d'Audit de Sécurité"}
              </h1>
            </div>

            {/* Simulated status */}
            <div className="flex gap-2">
              <span className="text-[10px] font-mono text-slate-400 bg-slate-100 py-1 px-2.5 rounded border border-slate-200">
                JWT State : Valid
              </span>
            </div>
          </div>

          {/* ----------------- SUB-VIEWS IMPLEMENTATIONS ----------------- */}

          {/* TAB 0.5: MY PERSONAL PROFILE */}
          {activeAdminTab === 'profile' && (
            <MyProfile
              currentUser={currentUser}
              researchers={rawResearchers}
              addResearcher={addResearcher}
              updateResearcher={updateResearcher}
            />
          )}

          {/* TAB 1: DASHBOARD */}
          {activeAdminTab === 'dashboard' && (
            <div className="space-y-6">
              
              {/* Espace Personnel Role-Based Dashboard View */}
              <RoleViews 
                currentUser={currentUser}
                publications={publications}
                projects={projects}
                datasets={datasets}
                events={events}
                irdDocuments={filteredIrdDocuments}
                partners={partners}
                auditLogs={auditLogs}
                onAddIrdDocument={addIrdDocument}
                onSignIrdDoc={signIrdDocument}
                onValidateIrdDoc={validateIrdDocument}
                onUpdatePublicationStatus={(id, status) => updatePublication(id, { status })}
              />
              
              {/* Only show global indicators stats, FastAPI and charts for Admin */}
              {currentUser && currentUser.role === 'Admin' && (
                <>
                  {/* High level stats cards */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[
                  { title: "Registres Utilisateurs", count: users.length, icon: Users, color: "text-blue-600 border-blue-105 bg-blue-50/40" },
                  { title: "Chercheurs affiliés", count: researchers.length, icon: UserCheck, color: "text-emerald-600 border-emerald-105 bg-emerald-50/40" },
                  { title: "Publications Enregistrées", count: publications.length, icon: BookOpen, color: "text-amber-600 border-amber-105 bg-amber-50/40" },
                  { title: "Fonds de conventions", count: `${projects.length} Projets`, icon: FolderGit2, color: "text-rose-600 border-rose-105 bg-rose-50/40" }
                ].map((sc, idx) => (
                  <div key={idx} className={`bg-white border rounded-xl p-5 shadow-3xs flex justify-between items-center ${sc.color}`}>
                    <div className="space-y-1">
                      <span className="text-xs text-slate-400 uppercase font-bold tracking-wider">{sc.title}</span>
                      <div className="text-2xl font-display font-bold text-slate-800">{sc.count}</div>
                    </div>
                    <sc.icon size={28} className="opacity-80" />
                  </div>
                ))}
              </div>

              {/* FastAPI Backend integration config card */}
              <div className="bg-white rounded-2xl border border-blue-150 p-6 shadow-3xs space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className={`w-2.5 h-2.5 rounded-full animate-ping ${isUsingMock ? 'bg-amber-500' : 'bg-emerald-500'}`}></span>
                      <h3 className="font-display font-bold text-sm text-slate-800">
                        Passerelle de Communication API (FastAPI + PostgreSQL)
                      </h3>
                    </div>
                    <p className="text-slate-500 text-xs">
                      Spécifiez l'adresse URI du serveur universitaire pour connecter les tables PostgreSQL de l'UMMISCO de manière synchrone.
                    </p>
                  </div>

                  <div className="px-3 py-1.5 bg-slate-100 rounded-lg text-[10px] text-slate-600 font-mono flex items-center gap-1.5">
                    <span className="font-bold">Dépôt cible :</span>
                    <a 
                      href="https://github.com/rama0576/backend" 
                      target="_blank" 
                      rel="noopener noreferrer" 
                      className="text-brand-blue hover:underline font-bold"
                    >
                      rama0576/backend
                    </a>
                  </div>
                </div>

                <div className="grid sm:grid-cols-12 gap-4 items-center pt-2">
                  <div className="sm:col-span-5 space-y-1">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wide block">URL d'Intégration du Backend (FastAPI)</label>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={backendUrl}
                        onChange={(e) => setBackendUrl(e.target.value)}
                        placeholder="http://localhost:8000"
                        className="w-full bg-slate-50 border border-slate-210 text-xs font-mono py-2 px-3 rounded-lg text-slate-700 focus:bg-white focus:outline-brand-blue"
                      />
                      <button
                        onClick={() => {
                          alert(`Adresse de passerelle mise à jour : ${backendUrl}. Les appels d'API s'orienteront désormais vers ce serveur.`);
                        }}
                        className="px-4 py-2 bg-slate-900 border border-transparent text-white hover:bg-slate-800 font-bold text-xs rounded-lg transition-colors cursor-pointer"
                      >
                        Enregistrer
                      </button>
                    </div>
                  </div>

                  <div className="sm:col-span-3 space-y-1">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wide block">Sélecteur de Mode de Données</label>
                    <div className="bg-slate-100 p-1 rounded-xl flex items-center">
                      <button
                        onClick={() => setIsUsingMock(true)}
                        className={`flex-1 text-[11px] font-bold py-1.5 px-2 rounded-lg transition-all ${
                          isUsingMock 
                            ? 'bg-white text-amber-700 shadow-3xs' 
                            : 'text-slate-500 hover:text-slate-800'
                        }`}
                      >
                        Local Simulé
                      </button>
                      <button
                        onClick={() => setIsUsingMock(false)}
                        className={`flex-1 text-[11px] font-bold py-1.5 px-2 rounded-lg transition-all ${
                          !isUsingMock 
                            ? 'bg-brand-blue text-white shadow-3xs' 
                            : 'text-slate-500 hover:text-slate-800'
                        }`}
                      >
                        API Réel
                      </button>
                    </div>
                  </div>

                  <div className="sm:col-span-4 bg-slate-50/80 border border-slate-150 rounded-xl p-4 flex items-center justify-between gap-3 text-xs">
                    <div className="space-y-0.5">
                      <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block">État du couplage RPC</span>
                      {isUsingMock ? (
                        <strong className="text-amber-700 font-bold block">Données Locales (Simulé)</strong>
                      ) : (
                        <strong className="text-emerald-700 font-bold block">Synchrone & Actif (FastAPI)</strong>
                      )}
                    </div>
                    <span className={`h-6 px-2 border text-font-black text-[9px] font-sans flex items-center justify-center rounded-md ${
                      isUsingMock 
                        ? 'bg-amber-100 border-amber-200 text-amber-800' 
                        : 'bg-emerald-100 border-emerald-200 text-emerald-800'
                    }`}>
                      {isUsingMock ? 'LOCAL MOCK' : 'LIVE REST'}
                    </span>
                  </div>
                </div>
              </div>

              {/* RECHARTS CHANNELS */}
              <div className="grid md:grid-cols-2 gap-6">
                
                {/* Chart 1: Publications counts */}
                <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-3xs space-y-4">
                  <h3 className="text-sm font-display font-semibold text-slate-700">Evolution des Publications Scientifiques</h3>
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={yearChartData}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} />
                        <XAxis dataKey="name" stroke="#94a3b8" fontSize={11} />
                        <YAxis stroke="#94a3b8" fontSize={11} allowDecimals={false} />
                        <Tooltip />
                        <Bar dataKey="Publications" fill="#0A3D62" radius={[4, 4, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                {/* Chart 2: Projects by axis */}
                <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-3xs space-y-4">
                  <h3 className="text-sm font-display font-semibold text-slate-700">Conventions de Projets par Axes Thématiques</h3>
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={axisProjectsData}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} />
                        <XAxis dataKey="name" stroke="#94a3b8" fontSize={11} />
                        <YAxis stroke="#94a3b8" fontSize={11} allowDecimals={false} />
                        <Tooltip />
                        <Line type="monotone" dataKey="Projets" stroke="#E58E26" strokeWidth={3} activeDot={{ r: 8 }} />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </div>

              </div>

              {/* Chart 3: Activities list */}
              <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-3xs space-y-4">
                <h3 className="text-sm font-display font-semibold text-slate-700 flex items-center gap-2">
                  <Activity size={18} className="text-brand-gold" />
                  Activités Utilisateurs Récentes
                </h3>
                <div className="h-60">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={auditActivitiesData}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} />
                      <XAxis dataKey="name" stroke="#94a3b8" fontSize={11} />
                      <YAxis stroke="#94a3b8" fontSize={11} />
                      <Tooltip />
                      <Bar dataKey="Activités" fill="#3C6382" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

                </>
              )}

            </div>
          )}

          {/* TAB 2: WORKFLOW QUEUE */}
          {activeAdminTab === 'workflow' && (
            <WorkflowControlHub />
          )}

          {/* TAB: FORMATIONS & COURSES */}
          {activeAdminTab === 'formations' && (
            <div className="space-y-6">
              
              {/* Top Sub-navigation Selector */}
              <div className="flex bg-slate-200/60 p-1.5 rounded-xl border border-slate-200/80 w-fit gap-1 text-xs font-bold">
                <button
                  onClick={() => setSubTab('courses')}
                  className={`px-4 py-2.5 rounded-lg transition-all cursor-pointer ${
                    subTab === 'courses' ? 'bg-white text-slate-900 shadow-3xs' : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  🏫 Catalogue Académique ({courses.length})
                </button>
                <button
                  onClick={() => setSubTab('applications')}
                  className={`px-4 py-2.5 rounded-lg transition-all cursor-pointer ${
                    subTab === 'applications' ? 'bg-white text-slate-900 shadow-3xs' : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  📥 Candidatures & Inscriptions ({inscriptions.length})
                </button>
              </div>

              {/* VIEW 1 : CATALOGUE ACADEMIQUE & ADD/EDIT SYSTEM */}
              {subTab === 'courses' && (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  
                  {/* LEFT: FORM COMPONENT TO SUBMIT/UPDATE COURES */}
                  <div className="bg-white border border-slate-200 p-6 rounded-2xl shadow-3xs space-y-4 h-fit">
                    <div className="border-b pb-3 border-slate-100">
                      <h3 className="font-display font-bold text-sm text-slate-800 flex items-center gap-2">
                        <GraduationCap size={18} className="text-brand-gold" />
                        {isEditingCourse ? "Modifier le cours / séminaire" : "Créer un nouveau cours"}
                      </h3>
                      <p className="text-[11px] text-slate-400 mt-1">
                        Ces formations s'afficheront sous l'onglet public "Formations".
                      </p>
                    </div>

                    <form
                      onSubmit={(e) => {
                        e.preventDefault();
                        if (!courseForm.title || !courseForm.code || !courseForm.professorId) {
                          alert("Veuillez renseigner le titre du cours, le code, et l'enseignant.");
                          return;
                        }
                        const syllabusArray = courseForm.syllabusText
                          ? courseForm.syllabusText.split('\n').map(l => l.trim()).filter(l => l.length > 0)
                          : [];
                        
                        const targetProf = researchers.find(r => r.id === courseForm.professorId);
                        const profName = targetProf ? targetProf.name : 'Chercheur Indéfini';

                        if (isEditingCourse && editingCourseId) {
                          updateCourse(editingCourseId, {
                            title: courseForm.title,
                            code: courseForm.code,
                            description: courseForm.description,
                            professorId: courseForm.professorId,
                            professorName: profName,
                            institution: courseForm.institution,
                            credits: Number(courseForm.credits),
                            durationHours: Number(courseForm.durationHours),
                            level: courseForm.level,
                            syllabus: syllabusArray
                          });
                          setIsEditingCourse(false);
                          setEditingCourseId(null);
                        } else {
                          addCourse({
                            title: courseForm.title,
                            code: courseForm.code,
                            description: courseForm.description,
                            professorId: courseForm.professorId,
                            professorName: profName,
                            institution: courseForm.institution || "UMMISCO Sénégal",
                            credits: Number(courseForm.credits),
                            durationHours: Number(courseForm.durationHours),
                            level: courseForm.level,
                            syllabus: syllabusArray
                          });
                        }

                        // Reset form
                        setCourseForm({
                          title: '',
                          code: '',
                          description: '',
                          professorId: '',
                          institution: '',
                          credits: 5,
                          durationHours: 35,
                          level: 'Master',
                          syllabusText: ''
                        });
                      }}
                      className="space-y-3.5 text-xs text-slate-700"
                    >
                      <div className="space-y-1">
                        <label className="font-bold text-slate-400 uppercase tracking-widest text-[9px]">Intitulé du cours *</label>
                        <input
                          type="text"
                          required
                          value={courseForm.title}
                          onChange={(e) => setCourseForm({ ...courseForm, title: e.target.value })}
                          className="w-full border p-2.5 rounded-lg focus:outline-none focus:ring-1 focus:ring-brand-gold bg-slate-50/50 text-slate-700"
                          placeholder="Modélisation des populations..."
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-1">
                          <label className="font-bold text-slate-400 uppercase tracking-widest text-[9px]">Code de l'UE *</label>
                          <input
                            type="text"
                            required
                            value={courseForm.code}
                            onChange={(e) => setCourseForm({ ...courseForm, code: e.target.value })}
                            className="w-full border p-2.5 rounded-lg focus:outline-none focus:ring-1 focus:ring-brand-gold bg-slate-50/50 uppercase text-slate-700"
                            placeholder="Ex: SYS-502"
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="font-bold text-slate-400 uppercase tracking-widest text-[9px]">Niveau *</label>
                          <select
                            value={courseForm.level}
                            onChange={(e) => setCourseForm({ ...courseForm, level: e.target.value as any })}
                            className="w-full border p-2.5 rounded-lg focus:outline-none focus:ring-1 focus:ring-brand-gold bg-slate-50/50 text-slate-700"
                          >
                            <option value="Master">Master</option>
                            <option value="Doctorat">Doctorat</option>
                            <option value="Séminaire">Séminaire</option>
                          </select>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-1">
                          <label className="font-bold text-slate-400 uppercase tracking-widest text-[9px]">Volume Horaire</label>
                          <input
                            type="number"
                            value={courseForm.durationHours}
                            onChange={(e) => setCourseForm({ ...courseForm, durationHours: Number(e.target.value) })}
                            className="w-full border p-2.5 rounded-lg focus:outline-none focus:ring-1 focus:ring-brand-gold bg-slate-50/50 text-slate-700"
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="font-bold text-slate-400 uppercase tracking-widest text-[9px]">Crédits ECTS</label>
                          <input
                            type="number"
                            value={courseForm.credits}
                            onChange={(e) => setCourseForm({ ...courseForm, credits: Number(e.target.value) })}
                            className="w-full border p-2.5 rounded-lg focus:outline-none focus:ring-1 focus:ring-brand-gold bg-slate-50/50 text-slate-700"
                          />
                        </div>
                      </div>

                      <div className="space-y-1">
                        <label className="font-bold text-slate-400 uppercase tracking-widest text-[9px]">Coordinateur *</label>
                        <select
                          required
                          value={courseForm.professorId}
                          onChange={(e) => setCourseForm({ ...courseForm, professorId: e.target.value })}
                          className="w-full border p-2.5 rounded-lg focus:outline-none focus:ring-1 focus:ring-brand-gold text-slate-700 bg-slate-50/50 text-slate-700"
                        >
                          <option value="">-- Sélectionner --</option>
                          {researchers.map(res => (
                            <option key={res.id} value={res.id}>{res.name} ({res.affiliation})</option>
                          ))}
                        </select>
                      </div>

                      <div className="space-y-1">
                        <label className="font-bold text-slate-400 uppercase tracking-widest text-[9px]">Université de rattachement</label>
                        <input
                          type="text"
                          value={courseForm.institution}
                          onChange={(e) => setCourseForm({ ...courseForm, institution: e.target.value })}
                          className="w-full border p-2.5 rounded-lg focus:outline-none focus:ring-1 focus:ring-brand-gold bg-slate-50/50 text-slate-700"
                          placeholder="Ex: UCAD / UGB"
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="font-bold text-slate-400 uppercase tracking-widest text-[9px]">Description</label>
                        <textarea
                          rows={3}
                          value={courseForm.description}
                          onChange={(e) => setCourseForm({ ...courseForm, description: e.target.value })}
                          className="w-full border p-2.5 rounded-lg focus:outline-none focus:ring-1 focus:ring-brand-gold bg-slate-50/50 font-sans text-slate-700"
                          placeholder="Objectif de l'Unité d'Enseignement..."
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="font-bold text-slate-400 uppercase tracking-widest text-[9px]">Syllabus (Un chapitre par ligne)</label>
                        <textarea
                          rows={4}
                          value={courseForm.syllabusText}
                          onChange={(e) => setCourseForm({ ...courseForm, syllabusText: e.target.value })}
                          className="w-full border p-2.5 rounded-lg focus:outline-none focus:ring-1 focus:ring-brand-gold bg-slate-50/50 font-mono text-[10px] text-slate-700"
                          placeholder="Chapitre 1 : Modèles Multi-agents&#10;Chapitre 2 : Plateforme GAMA"
                        />
                      </div>

                      <div className="flex gap-2 pt-2">
                        {isEditingCourse && (
                          <button
                            type="button"
                            onClick={() => {
                              setIsEditingCourse(false);
                              setEditingCourseId(null);
                              setCourseForm({
                                title: '',
                                code: '',
                                description: '',
                                professorId: '',
                                institution: '',
                                credits: 5,
                                durationHours: 35,
                                level: 'Master',
                                syllabusText: ''
                              });
                            }}
                            className="flex-1 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-750 font-bold rounded-lg transition-colors text-center cursor-pointer"
                          >
                            Annuler
                          </button>
                        )}
                        <button
                          type="submit"
                          className="flex-1 py-2.5 bg-brand-gold hover:bg-brand-gold/95 text-slate-900 font-bold rounded-lg transition-transform cursor-pointer"
                        >
                          Enregistrer
                        </button>
                      </div>
                    </form>
                  </div>

                  {/* RIGHT LIST: DYNAMIC GRID CATALOGUE */}
                  <div className="lg:col-span-2 space-y-4">
                    <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-3xs flex justify-between items-center">
                      <div>
                        <h4 className="text-slate-700 font-display font-semibold text-sm">Formations et Séminaires Actifs</h4>
                        <p className="text-slate-400 text-[10px]">Catalogue permanent de l'UMI Ummisco-Sénégal</p>
                      </div>
                      <span className="text-xs bg-slate-100 border text-slate-800 px-3 py-1.5 rounded-lg font-bold">
                        {courses.length} Cours Enregistrés
                      </span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {courses.map(course => (
                        <div
                          key={course.id}
                          className="bg-white border border-slate-200 rounded-2xl p-5 hover:shadow-2xs transition-all relative group flex flex-col justify-between"
                        >
                          <div className="space-y-3">
                            <div className="flex justify-between items-center gap-1">
                              <span className="text-[10px] bg-slate-100 py-0.5 px-2.5 rounded font-bold text-slate-500 uppercase tracking-wider">
                                {course.level}
                              </span>
                              <span className="text-[10px] text-slate-400 font-mono font-bold font-mono">
                                {course.code}
                              </span>
                            </div>

                            <div className="space-y-1">
                              <h5 className="font-display font-bold text-slate-800 text-sm leading-snug group-hover:text-brand-blue transition-colors">
                                {course.title}
                              </h5>
                              <p className="text-slate-400 text-[10px] font-medium leading-none">
                                Dispensé par : {course.professorName} ({course.institution})
                              </p>
                            </div>

                            <p className="text-slate-500 text-xs leading-relaxed line-clamp-3">
                              {course.description}
                            </p>

                            {course.syllabus && course.syllabus.length > 0 && (
                              <div className="pt-2.5 border-t border-slate-100 space-y-1">
                                <span className="text-[9px] text-slate-400 font-bold uppercase tracking-wider block">Extraits du Syllabus :</span>
                                <ul className="text-[10px] text-slate-500 space-y-0.5 list-disc pl-4 leading-snug">
                                  {course.syllabus.slice(0, 3).map((item, idx) => (
                                    <li key={idx}>{item}</li>
                                  ))}
                                  {course.syllabus.length > 3 && <li className="list-none text-slate-450 italic pl-1 font-mono">... et {course.syllabus.length - 3} thèmes additionnels</li>}
                                </ul>
                              </div>
                            )}
                          </div>

                          <div className="mt-5 pt-3 border-t border-slate-100 flex justify-between items-center text-xs">
                            <div className="text-[10px] text-slate-400 font-mono font-bold">
                              <span>{course.durationHours}h</span> • <span>{course.credits || 6} ECTS</span>
                            </div>
                            <div className="flex gap-1.5">
                              <button
                                onClick={() => {
                                  setCourseForm({
                                    title: course.title,
                                    code: course.code,
                                    description: course.description,
                                    professorId: course.professorId,
                                    institution: course.institution,
                                    credits: course.credits || 5,
                                    durationHours: course.durationHours,
                                    level: course.level,
                                    syllabusText: course.syllabus ? course.syllabus.join('\n') : ''
                                  });
                                  setIsEditingCourse(true);
                                  setEditingCourseId(course.id);
                                }}
                                className="p-1 px-2.5 text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-lg text-[10px] font-bold cursor-pointer"
                              >
                                Modifier
                              </button>
                              <button
                                onClick={() => {
                                  if (confirm("Voulez-vous supprimer ce cours du catalogue ?")) {
                                    deleteCourse(course.id);
                                  }
                                }}
                                className="p-1 px-2.5 text-rose-600 bg-rose-50 hover:bg-rose-100 rounded-lg text-[10px] font-bold cursor-pointer"
                              >
                                Supprimer
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* VIEW 2 : STUDENT CANDIDATURES AND ENROLLMENT DOSSIERS */}
              {subTab === 'applications' && (
                <div className="bg-white border border-slate-200 rounded-2xl shadow-3xs overflow-hidden">
                  <div className="p-6 border-b border-slate-100 bg-slate-50/50">
                    <h4 className="font-display font-bold text-sm text-slate-850">Darrages d'Inscriptions & Admissions</h4>
                    <p className="text-slate-400 text-xs mt-1">Examinez et validez les fiches de candidatures reçues en provenance des étudiants des universités sénégalaises partenaires.</p>
                  </div>

                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs border-collapse">
                      <thead>
                        <tr className="border-b border-slate-205 text-slate-400 font-bold select-none bg-slate-50/30">
                          <th className="py-3.5 px-4 bg-slate-50">Candidat / Profil académique</th>
                          <th className="py-3.5 px-4 bg-slate-50 font-semibold text-slate-800">Cours ciblé</th>
                          <th className="py-3.5 px-4 bg-slate-50">Motivation jointe</th>
                          <th className="py-3.5 px-4 bg-slate-50">Score statut</th>
                          <th className="py-3.5 px-4 text-right bg-slate-50">Décisions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {inscriptions.length === 0 ? (
                          <tr>
                            <td colSpan={5} className="py-8 text-center text-slate-400 font-medium">Aucune candidature active enregistrée de l'année.</td>
                          </tr>
                        ) : (
                          inscriptions.map(insc => (
                            <tr key={insc.id} className="border-b border-slate-100 hover:bg-slate-50/20">
                              <td className="py-4 px-4 space-y-1">
                                <div className="font-bold text-slate-800 text-sm leading-none">{insc.studentName}</div>
                                <div className="text-slate-400 text-[10px] font-mono">{insc.studentEmail} • Niveau {insc.studentLevel}</div>
                              </td>
                              <td className="py-4 px-4 font-semibold text-slate-700">
                                {insc.courseTitle}
                              </td>
                              <td className="py-4 px-4 text-slate-500 max-w-sm">
                                <p className="italic line-clamp-2">"{insc.motivation}"</p>
                              </td>
                              <td className="py-4 px-4">
                                <span className={`inline-block px-2.5 py-1 rounded-lg text-[10px] font-bold ${
                                  insc.status === 'Approved' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' :
                                  insc.status === 'Rejected' ? 'bg-rose-50 text-rose-700 border border-rose-200' :
                                  'bg-amber-50 text-amber-700 border border-amber-200'
                                }`}>
                                  {insc.status === 'Approved' && "Admise ✓"}
                                  {insc.status === 'Rejected' && "Refusée ✗"}
                                  {insc.status === 'Pending' && "À l'étude"}
                                </span>
                              </td>
                              <td className="py-4 px-4 text-right flex gap-1.5 justify-end pt-5.5">
                                <button
                                  onClick={() => updateInscriptionStatus(insc.id, 'Approved')}
                                  disabled={insc.status === 'Approved'}
                                  className={`px-3 py-1.5 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 disabled:opacity-40 rounded-lg text-[10px] font-bold transition-all cursor-pointer`}
                                >
                                  Accepter
                                </button>
                                <button
                                  onClick={() => updateInscriptionStatus(insc.id, 'Rejected')}
                                  disabled={insc.status === 'Rejected'}
                                  className={`px-3 py-1.5 bg-rose-50 text-rose-700 hover:bg-rose-100 disabled:opacity-40 rounded-lg text-[10px] font-bold transition-all cursor-pointer`}
                                >
                                  Refuser
                                </button>
                              </td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

            </div>
          )}

          {/* CRUD VIEWS FOR DOMAINS (Uses conditional grids and tables based on active tab) */}
          {['users', 'axes', 'researchers', 'publications', 'projects', 'datasets', 'events', 'news', 'partners'].includes(activeAdminTab) && (
            <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-xs p-6 space-y-4">
              <div className="flex justify-between items-center bg-slate-50 border-b border-slate-100 p-4">
                <h3 className="font-display font-semibold text-xs uppercase tracking-wider text-slate-500">
                  Registre interactif : {activeAdminTab.toUpperCase()}
                </h3>
                <button
                  onClick={initiateCreate}
                  className="px-3.5 py-2 bg-brand-gold hover:bg-brand-gold/90 text-slate-900 font-bold rounded-lg text-xs flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <Plus size={14} />
                  {activeAdminTab === 'publications' ? "Rechercher et Importer via Google Scholar" : "Enregistrer un nouvel item"}
                </button>
              </div>

              {/* DYNAMIC LISTS */}
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="border-b border-slate-205 text-slate-400 font-bold select-none bg-slate-50">
                      <th className="py-2.5 px-3">ID / Titre</th>
                      <th className="py-2.5 px-3">Propriétés Principales</th>
                      <th className="py-2.5 px-3">Statut / Rattach</th>
                      <th className="py-2.5 px-3 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                                   {/* 1. USERS LIST */}
                    {activeAdminTab === 'users' && (paginatedTabList as User[]).map(u => (
                      <tr key={u.id} className="border-b border-slate-100 hover:bg-slate-50/50">
                        <td className="py-2.5 px-3 font-semibold text-slate-800">{u.name}</td>
                        <td className="py-2.5 px-3 text-slate-500">{u.email}</td>
                        <td className="py-2.5 px-3 text-slate-500 font-semibold">{u.role}</td>
                        <td className="py-2.5 px-3 text-right flex gap-1 justify-end">
                          <button onClick={() => initiateEdit(u)} className="p-1 text-blue-600 hover:bg-blue-50 rounded cursor-pointer"><Edit size={14} /></button>
                          <button onClick={() => deleteUser(u.id)} className="p-1 text-rose-600 hover:bg-rose-50 rounded cursor-pointer"><Trash2 size={14} /></button>
                        </td>
                      </tr>
                    ))}

                    {/* 2. AXES LIST */}
                    {activeAdminTab === 'axes' && (paginatedTabList as ResearchAxis[]).map(a => (
                      <tr key={a.id} className="border-b border-slate-100 hover:bg-slate-50/50">
                        <td className="py-2.5 px-3 font-semibold text-slate-800">[{a.code}] {a.title}</td>
                        <td className="py-2.5 px-3 text-slate-500 truncate max-w-xs">{a.description}</td>
                        <td className="py-2.5 px-3 text-slate-500">{a.headId}</td>
                        <td className="py-2.5 px-3 text-right flex gap-1 justify-end">
                          <button onClick={() => initiateEdit(a)} className="p-1 text-blue-600 hover:bg-blue-50 rounded cursor-pointer"><Edit size={14} /></button>
                          <button onClick={() => deleteAxis(a.id)} className="p-1 text-rose-600 hover:bg-rose-50 rounded cursor-pointer"><Trash2 size={14} /></button>
                        </td>
                      </tr>
                    ))}

                    {/* 3. RESEARCHERS LIST */}
                    {activeAdminTab === 'researchers' && (paginatedTabList as Researcher[]).map(r => (
                      <tr key={r.id} className="border-b border-slate-100 hover:bg-slate-50/50">
                        <td className="py-2.5 px-3 font-semibold text-slate-800">{r.name}</td>
                        <td className="py-2.5 px-3 text-slate-500">{r.rank} • {r.affiliation}</td>
                        <td className="py-2.5 px-3 text-slate-550">{r.email}</td>
                        <td className="py-2.5 px-3 text-right flex gap-1 justify-end">
                          <button onClick={() => initiateEdit(r)} className="p-1 text-blue-600 hover:bg-blue-50 rounded cursor-pointer"><Edit size={14} /></button>
                          <button onClick={() => deleteResearcher(r.id)} className="p-1 text-rose-600 hover:bg-rose-50 rounded cursor-pointer"><Trash2 size={14} /></button>
                        </td>
                      </tr>
                    ))}

                    {/* 4. PUBLICATIONS LIST */}
                    {activeAdminTab === 'publications' && (paginatedTabList as Publication[]).map(p => (
                      <tr key={p.id} className="border-b border-slate-100 hover:bg-slate-50/50">
                        <td className="py-2.5 px-3 font-semibold text-slate-800">{p.title}</td>
                        <td className="py-2.5 px-3 text-slate-500">{p.journal} ({p.year})</td>
                        <td className="py-2.5 px-3 font-semibold">{p.status}</td>
                        <td className="py-2.5 px-3 text-right flex gap-1 justify-end">
                          <button onClick={() => initiateEdit(p)} className="p-1 text-blue-600 hover:bg-blue-50 rounded cursor-pointer"><Edit size={14} /></button>
                          <button onClick={() => deletePublication(p.id)} className="p-1 text-rose-600 hover:bg-rose-50 rounded cursor-pointer"><Trash2 size={14} /></button>
                        </td>
                      </tr>
                    ))}

                    {/* 5. PROJECTS LIST */}
                    {activeAdminTab === 'projects' && (paginatedTabList as Project[]).map(p => (
                      <tr key={p.id} className="border-b border-slate-100 hover:bg-slate-50/50">
                        <td className="py-2.5 px-3 font-semibold text-slate-800">{p.title}</td>
                        <td className="py-2.5 px-3 text-slate-500">{p.budget} {p.currency} ({p.timeline})</td>
                        <td className="py-2.5 px-3 text-slate-500">Axe: {p.axisId}</td>
                        <td className="py-2.5 px-3 text-right flex gap-1 justify-end">
                          <button onClick={() => initiateEdit(p)} className="p-1 text-blue-600 hover:bg-blue-50 rounded cursor-pointer"><Edit size={14} /></button>
                          <button onClick={() => deleteProject(p.id)} className="p-1 text-rose-600 hover:bg-rose-50 rounded cursor-pointer"><Trash2 size={14} /></button>
                        </td>
                      </tr>
                    ))}

                    {/* 6. DATASETS LIST */}
                    {activeAdminTab === 'datasets' && (paginatedTabList as Dataset[]).map(d => (
                      <tr key={d.id} className="border-b border-slate-100 hover:bg-slate-50/50">
                        <td className="py-2.5 px-3 font-semibold text-slate-800">{d.title}</td>
                        <td className="py-2.5 px-3 text-slate-500">{d.size} • CC</td>
                        <td className="py-2.5 px-3 font-semibold">{d.status}</td>
                        <td className="py-2.5 px-3 text-right flex gap-1 justify-end">
                          <button onClick={() => initiateEdit(d)} className="p-1 text-blue-600 hover:bg-blue-50 rounded cursor-pointer"><Edit size={14} /></button>
                          <button onClick={() => deleteDataset(d.id)} className="p-1 text-rose-600 hover:bg-rose-50 rounded cursor-pointer"><Trash2 size={14} /></button>
                        </td>
                      </tr>
                    ))}

                    {/* 7. EVENTS LIST */}
                    {activeAdminTab === 'events' && (paginatedTabList as Event[]).map(e => (
                      <tr key={e.id} className="border-b border-slate-100 hover:bg-slate-50/50">
                        <td className="py-2.5 px-3 font-semibold text-slate-800">{e.title}</td>
                        <td className="py-2.5 px-3 text-slate-500">{e.location}</td>
                        <td className="py-2.5 px-3 font-semibold">{e.date}</td>
                        <td className="py-2.5 px-3 text-right flex gap-1 justify-end">
                          <button onClick={() => initiateEdit(e)} className="p-1 text-blue-600 hover:bg-blue-50 rounded cursor-pointer"><Edit size={14} /></button>
                          <button onClick={() => deleteEvent(e.id)} className="p-1 text-rose-600 hover:bg-rose-50 rounded cursor-pointer"><Trash2 size={14} /></button>
                        </td>
                      </tr>
                    ))}

                    {/* 8. NEWS LIST */}
                    {activeAdminTab === 'news' && (paginatedTabList as News[]).map(n => (
                      <tr key={n.id} className="border-b border-slate-100 hover:bg-slate-50/50">
                        <td className="py-2.5 px-3 font-semibold text-slate-800">{n.title}</td>
                        <td className="py-2.5 px-3 text-slate-555">{n.category} ({n.date})</td>
                        <td className="py-2.5 px-3 text-slate-500">{n.status}</td>
                        <td className="py-2.5 px-3 text-right flex gap-1 justify-end">
                          <button onClick={() => initiateEdit(n)} className="p-1 text-blue-600 hover:bg-blue-50 rounded cursor-pointer"><Edit size={14} /></button>
                          <button onClick={() => deleteNews(n.id)} className="p-1 text-rose-600 hover:bg-rose-50 rounded cursor-pointer"><Trash2 size={14} /></button>
                        </td>
                      </tr>
                    ))}

                    {/* 9. PARTNERS LIST */}
                    {activeAdminTab === 'partners' && (paginatedTabList as Partner[]).map(p => (
                      <tr key={p.id} className="border-b border-slate-100 hover:bg-slate-50/50">
                        <td className="py-2.5 px-3 font-semibold text-slate-800">{p.logo} {p.name}</td>
                        <td className="py-2.5 px-3 text-slate-555">{p.type}</td>
                        <td className="py-2.5 px-3 text-slate-500">{p.country}</td>
                        <td className="py-2.5 px-3 text-right flex gap-1 justify-end">
                          <button onClick={() => initiateEdit(p)} className="p-1 text-blue-600 hover:bg-blue-50 rounded cursor-pointer"><Edit size={14} /></button>
                          <button onClick={() => deletePartner(p.id)} className="p-1 text-rose-600 hover:bg-rose-50 rounded cursor-pointer"><Trash2 size={14} /></button>
                        </td>
                      </tr>
                    ))}

                  </tbody>
                </table>
              </div>

              <Pagination
                currentPage={boCurrentPage}
                totalPages={Math.ceil(currentTabList.length / boItemsPerPage)}
                onPageChange={setBoCurrentPage}
                totalItems={currentTabList.length}
                itemsPerPage={boItemsPerPage}
              />
            </div>
          )}

          {/* TAB 7.5: IRD ADMINISTRATIVE DOCUMENTS PANEL */}
          {activeAdminTab === 'ird_docs' && (
            <IrdDocumentsSection
              irdDocuments={filteredIrdDocuments}
              currentUser={currentUser}
              onAdd={addIrdDocument}
              onUpdate={updateIrdDocument}
              onDelete={deleteIrdDocument}
              onSign={signIrdDocument}
              onValidate={validateIrdDocument}
              t={t}
            />
          )}

          {/* TAB 8: AUDIT LOGS */}
          {activeAdminTab === 'audit' && (
            <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-xs p-6 space-y-4">
              <div className="border-b border-slate-100 pb-2">
                <h3 className="font-display font-semibold text-md text-slate-800 flex items-center gap-1.5">
                  <Activity size={18} className="text-brand-gold" />
                  Piste d'Audit Systèmes (Chronological logs)
                </h3>
                <p className="text-xs text-slate-400">
                  Enregistrement transparent des changements de statuts, requêtes et signatures d'utilisateurs.
                </p>
              </div>

              <div className="space-y-2 max-h-[500px] overflow-y-auto">
                {paginatedAuditLogs.map((log) => (
                  <div key={log.id} className="p-3 bg-slate-50 rounded-lg border border-slate-205 flex justify-between items-center text-xs text-slate-600 hover:bg-slate-100/50">
                    <div className="space-y-1">
                      <div className="flex gap-2 items-center">
                        <span className="font-mono text-[10px] bg-slate-200 rounded px-1.5 py-0.5 font-bold">{log.module}</span>
                        <span className={`text-[10px] font-bold px-1.5 rounded ${log.status === 'SUCCESS' ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'}`}>
                          {log.status}
                        </span>
                      </div>
                      <p className="font-medium text-slate-830">{log.action}</p>
                      <span className="text-[10px] text-slate-405 block">Par : {log.username} • IP : {log.ipAddress}</span>
                    </div>
                    <span className="text-[10px] font-mono text-slate-450">{log.timestamp.replace('T', ' ').substring(0, 19)}</span>
                  </div>
                ))}
              </div>

              <Pagination
                currentPage={auditCurrentPage}
                totalPages={Math.ceil(auditLogs.length / auditItemsPerPage)}
                onPageChange={setAuditCurrentPage}
                totalItems={auditLogs.length}
                itemsPerPage={auditItemsPerPage}
              />
            </div>
          )}

          {/* TAB 7.8: DEDICATED ADMIN STATISTICS SECTION (/dashboard/stats) */}
          {activeAdminTab === 'stats' && (
            currentUser.role === 'Admin' ? (
              <div className="space-y-6">
                {/* Admin Welcome Header Banner */}
                <div className="bg-gradient-to-r from-[#3B6FA0] to-[#2C5278] text-white p-6 rounded-2xl border border-blue-200/20 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="space-y-1">
                    <h3 className="font-display font-medium text-lg flex items-center gap-2">
                      <span className="p-1.5 bg-white/10 rounded-lg"><Activity size={18} className="text-brand-gold" /></span>
                      Centre Analytique UCAD / IRD - /dashboard/stats
                    </h3>
                    <p className="text-xs text-slate-200/90 max-w-2xl">
                      Indicateurs décisionnels, activité scientifique pluriannuelle et logs de sécurité consolidés en temps réel pour l'administration de l'Unité de Modélisation des Systèmes Complexes.
                    </p>
                  </div>
                  <div className="py-1 px-3 bg-white/10 rounded-lg text-xs font-bold shrink-0 self-start md:self-center">
                    Rôle autorisatif : Administrateur Unique
                  </div>
                </div>

                {/* Quantitative statistics widgets */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="bg-white p-5 rounded-2xl border border-slate-205 flex items-center gap-4 animate-fadeIn">
                    <div className="p-3 rounded-xl bg-blue-50 text-blue-700">
                      <Users size={20} />
                    </div>
                    <div>
                      <span className="text-2xl font-bold font-mono tracking-tight text-slate-800">{rawUsers.length}</span>
                      <span className="block text-[10px] text-slate-400 font-bold uppercase">Comptes RBAC</span>
                    </div>
                  </div>
                  <div className="bg-white p-5 rounded-2xl border border-slate-205 flex items-center gap-4 animate-fadeIn">
                    <div className="p-3 rounded-xl bg-emerald-50 text-emerald-700">
                      <UserCheck size={20} />
                    </div>
                    <div>
                      <span className="text-2xl font-bold font-mono tracking-tight text-slate-800">{rawResearchers.length}</span>
                      <span className="block text-[10px] text-slate-400 font-bold uppercase">Chercheurs</span>
                    </div>
                  </div>
                  <div className="bg-white p-5 rounded-2xl border border-slate-205 flex items-center gap-4 animate-fadeIn">
                    <div className="p-3 rounded-xl bg-amber-50 text-amber-600">
                      <ClipboardCheck size={20} />
                    </div>
                    <div>
                      <span className="text-2xl font-bold font-mono tracking-tight text-slate-800 font-mono text-slate-800">{irdDocuments.length}</span>
                      <span className="block text-[10px] text-slate-400 font-bold uppercase">Actes IRD</span>
                    </div>
                  </div>
                  <div className="bg-white p-5 rounded-2xl border border-slate-205 flex items-center gap-4 animate-fadeIn">
                    <div className="p-3 rounded-xl bg-indigo-50 text-indigo-700">
                      <Activity size={20} />
                    </div>
                    <div>
                      <span className="text-2xl font-bold font-mono tracking-tight text-slate-800">{auditLogs.length}</span>
                      <span className="block text-[10px] text-slate-400 font-bold uppercase">Logs d'audit</span>
                    </div>
                  </div>
                </div>

                {/* Graphs rows */}
                <div className="grid md:grid-cols-2 gap-6">
                  {/* Publications Evolution */}
                  <div className="bg-white p-5 rounded-2xl border border-slate-205 space-y-4">
                    <div className="border-b border-slate-105 pb-2">
                      <h4 className="font-semibold text-slate-800 text-xs uppercase tracking-wider">Évolution des Publications Scientifiques</h4>
                      <p className="text-[10px] text-slate-400">Nombre cumulé et parutions annuelles validées au sein de l'UMMISCO</p>
                    </div>
                    <div className="h-64">
                      {yearChartData && yearChartData.length > 0 ? (
                        <ResponsiveContainer width="100%" height="100%">
                          <BarChart data={yearChartData}>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                            <XAxis dataKey="name" fontSize={11} stroke="#94A3B8" />
                            <YAxis fontSize={11} stroke="#94A3B8" />
                            <Tooltip contentStyle={{ fontSize: 11, borderRadius: 8 }} />
                            <Legend wrapperStyle={{ fontSize: 11 }} />
                            <Bar dataKey="Publications" fill="#3B6FA0" name="Publications UMMISCO" radius={[4, 4, 0, 0]} />
                          </BarChart>
                        </ResponsiveContainer>
                      ) : (
                        <div className="h-full flex items-center justify-center text-slate-400 text-xs">Données insuffisantes</div>
                      )}
                    </div>
                  </div>

                  {/* Funding/Projects per Axe */}
                  <div className="bg-white p-5 rounded-2xl border border-slate-205 space-y-4">
                    <div className="border-b border-slate-105 pb-2">
                       <h4 className="font-semibold text-slate-800 text-xs uppercase tracking-wider">Activité Scientifique par Axe Thématique</h4>
                      <p className="text-[10px] text-slate-400">Répartition des conventions de financement et projets actifs</p>
                    </div>
                    <div className="h-64">
                      {axisProjectsData && axisProjectsData.length > 0 ? (
                        <ResponsiveContainer width="100%" height="100%">
                          <LineChart data={axisProjectsData}>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                            <XAxis dataKey="name" fontSize={11} stroke="#94A3B8" />
                            <YAxis fontSize={11} stroke="#94A3B8" />
                            <Tooltip contentStyle={{ fontSize: 11, borderRadius: 8 }} />
                            <Legend wrapperStyle={{ fontSize: 11 }} />
                            <Line type="monotone" dataKey="Projets" stroke="#4A8C3F" strokeWidth={3} activeDot={{ r: 8 }} name="Projets par Axe" />
                          </LineChart>
                        </ResponsiveContainer>
                      ) : (
                        <div className="h-full flex items-center justify-center text-slate-400 text-xs">Données insuffisantes</div>
                      )}
                    </div>
                  </div>

                  {/* Audit Logs analysis */}
                  <div className="bg-white p-5 rounded-2xl border border-slate-205 space-y-4 md:col-span-2">
                    <div className="border-b border-slate-105 pb-2">
                      <h4 className="font-semibold text-slate-800 text-xs uppercase tracking-wider">Activité d'Audit & Trafic Système Récents</h4>
                      <p className="text-[10px] text-slate-400">Variabilité d'accès aux ressources privées et signature d'actes</p>
                    </div>
                    <div className="h-60">
                      {auditActivitiesData && auditActivitiesData.length > 0 ? (
                        <ResponsiveContainer width="100%" height="100%">
                          <BarChart data={auditActivitiesData}>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                            <XAxis dataKey="name" fontSize={10} stroke="#94A3B8" />
                            <YAxis fontSize={11} stroke="#94A3B8" />
                            <Tooltip contentStyle={{ fontSize: 11, borderRadius: 8 }} />
                            <Bar dataKey="Activités" fill="#475569" radius={[4, 4, 0, 0]} name="Transactions Système" />
                          </BarChart>
                        </ResponsiveContainer>
                      ) : (
                        <div className="h-full flex items-center justify-center text-slate-400 text-xs">Données insuffisantes</div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              // High Fidelity 403 Forbidden Screen for Non-Admins at /dashboard/stats
              <div className="bg-white border-2 border-rose-150 rounded-2xl p-10 max-w-xl mx-auto shadow-sm text-center space-y-6 animate-fadeIn py-12">
                <div className="mx-auto w-16 h-16 rounded-full bg-rose-50 flex items-center justify-center text-rose-500 border border-rose-200">
                  <ShieldAlert size={36} />
                </div>
                <div className="space-y-2">
                  <h2 className="text-xl font-display font-bold text-slate-800">Erreur 403 : Accès Refusé</h2>
                  <div className="bg-mono text-mono text-[11px] bg-slate-100 text-slate-600 px-3 py-1 font-bold inline-block rounded font-mono border border-slate-200">
                    GET /dashboard/stats
                  </div>
                  <p className="text-xs text-slate-500 leading-relaxed max-w-md mx-auto">
                    La consultation des statistiques détaillées de l'unité et du trafic des serveurs est strictement restreinte aux utilisateurs possédant le niveau d'autorisation <strong>Administrateur</strong> (RBAC: All). Votre rôle actuel (<strong>{currentUser?.role}</strong>) ne possède pas cette permission de haut niveau.
                  </p>
                </div>
                <div className="pt-4 border-t border-slate-100 flex justify-center gap-3">
                  <button
                    onClick={() => setActiveAdminTab('dashboard')}
                    className="px-4 py-2 bg-slate-900 border border-slate-900 text-white font-bold rounded-xl text-xs cursor-pointer transition-colors hover:bg-slate-850"
                  >
                    Retourner au Tableau de Bord Personnel (Indicateurs)
                  </button>
                </div>
              </div>
            )
          )}

        </div>
      </main>

      {/* DYNAMIC MODALS FOR CRUD ACTIONS */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-3xs">
          <div className={`bg-white rounded-2xl w-full ${activeAdminTab === 'publications' && !editingId ? 'max-w-3xl' : 'max-w-xl'} overflow-hidden shadow-2xl border border-slate-205 transition-all`}>
            <div className="p-6 bg-gradient-to-r from-brand-dark to-brand-blue text-white">
              <h2 className="text-base font-display font-bold">
                {activeAdminTab === 'publications' && !editingId 
                  ? 'Indexation & Importation via Google Scholar' 
                  : editingId 
                    ? 'Modifier la fiche sélectionnée' 
                    : 'Enregistrer une nouvelle entrée'}
              </h2>
              <span className="text-xs text-slate-300">Catégorie: {activeAdminTab.toUpperCase()}</span>
            </div>

            <div className={`p-6 space-y-4 ${activeAdminTab === 'publications' && !editingId ? 'max-h-[75vh]' : 'max-h-[360px]'} overflow-y-auto text-xs`}>
              
              {/* Form elements conditional based on Active Tab */}

              {/* 1. Publication Form fields / Google Scholar Importer */}
              {activeAdminTab === 'publications' && (
                editingId ? (
                  <div className="space-y-3">
                    <div className="space-y-1">
                      <label className="font-bold text-slate-400">Titre de l'article</label>
                      <input type="text" value={publicationForm.title} onChange={e => setPublicationForm({ ...publicationForm, title: e.target.value })} className="w-full border p-2 rounded" placeholder="Mathematical model..." />
                    </div>
                    <div className="space-y-1">
                      <label className="font-bold text-slate-400">Collaborateur principal (Auteur)</label>
                      <input type="text" value={publicationForm.authors} onChange={e => setPublicationForm({ ...publicationForm, authors: e.target.value as any })} className="w-full border p-2 rounded" placeholder="Pr. Samba Diouf..." />
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-1">
                        <label className="font-bold text-slate-400">Revue d'édition</label>
                        <input type="text" value={publicationForm.journal} onChange={e => setPublicationForm({ ...publicationForm, journal: e.target.value })} className="w-full border p-2 rounded" placeholder="ARIMA..." />
                      </div>
                      <div className="space-y-1">
                        <label className="font-bold text-slate-400">Année</label>
                        <input type="number" value={publicationForm.year} onChange={e => setPublicationForm({ ...publicationForm, year: Number(e.target.value) })} className="w-full border p-2 rounded" />
                      </div>
                    </div>
                    <div className="space-y-1">
                      <label className="font-bold text-slate-400">Axe Scientifique de rattachement</label>
                      <select value={publicationForm.axisId} onChange={e => setPublicationForm({ ...publicationForm, axisId: e.target.value })} className="w-full border p-2 rounded text-slate-700">
                        {axes.map(a => <option key={a.id} value={a.id}>{a.code}</option>)}
                      </select>
                    </div>
                    <div className="space-y-1">
                      <label className="font-bold text-slate-400">Abstract (Résumé en français)</label>
                      <textarea rows={4} value={publicationForm.abstract} onChange={e => setPublicationForm({ ...publicationForm, abstract: e.target.value })} className="w-full border p-2 rounded" placeholder="Comprendre la transmission de..." />
                    </div>
                  </div>
                ) : (
                  <GoogleScholarImporter
                    axes={axes}
                    onClose={() => setModalOpen(false)}
                    onImport={(scholData) => {
                      const authorsArray = scholData.authors.split(',').map(a => a.trim());
                      const keywordsArray = scholData.keywords.split(',').map(k => k.trim());
                      const initialStatus = (currentUser?.role === 'Admin' || currentUser?.role === 'Directeur') ? 'Approved' : 'Pending';

                      addPublication({
                        title: scholData.title,
                        authors: authorsArray,
                        journal: scholData.journal,
                        year: Number(scholData.year),
                        type: scholData.type,
                        abstract: scholData.abstract,
                        axisId: scholData.axisId,
                        keywords: keywordsArray,
                        doi: scholData.doi,
                        status: initialStatus
                      } as any);

                      setModalOpen(false);
                      setEditingId(null);
                    }}
                  />
                )
              )}

              {/* 2. Researchers Form fields */}
              {activeAdminTab === 'researchers' && (
                <div className="space-y-3">
                  <div className="space-y-1">
                    <label className="font-bold text-slate-400">Nom du chercheur</label>
                    <input type="text" value={researcherForm.name} onChange={e => setResearcherForm({ ...researcherForm, name: e.target.value })} className="w-full border p-2 rounded" placeholder="Dr. Sokhna Thiam..." />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className="font-bold text-slate-400">Email</label>
                      <input type="email" value={researcherForm.email} onChange={e => setResearcherForm({ ...researcherForm, email: e.target.value })} className="w-full border p-2 rounded" />
                    </div>
                    <div className="space-y-1">
                      <label className="font-bold text-slate-400">Téléphone de bureau</label>
                      <input type="text" value={researcherForm.phone} onChange={e => setResearcherForm({ ...researcherForm, phone: e.target.value })} className="w-full border p-2 rounded" />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className="font-bold text-slate-400">Rang Académique</label>
                      <select value={researcherForm.rank} onChange={e => setResearcherForm({ ...researcherForm, rank: e.target.value })} className="w-full border p-2 rounded text-slate-705">
                        <option value="Professeur Titulaire">Professeur Titulaire</option>
                        <option value="Maître de Conférences">Maître de Conférences</option>
                        <option value="Chargé de Recherche">Chargé de Recherche</option>
                        <option value="Doctorant">Doctorant</option>
                      </select>
                    </div>
                    <div className="space-y-1">
                      <label className="font-bold text-slate-400">Affiliation</label>
                      <select value={researcherForm.affiliation} onChange={e => setResearcherForm({ ...researcherForm, affiliation: e.target.value })} className="w-full border p-2 rounded text-slate-705">
                        <option value="UCAD">UCAD (Dakar)</option>
                        <option value="IRD">IRD (France)</option>
                        <option value="Sorbonne Université">Sorbonne Université</option>
                      </select>
                    </div>
                  </div>
                  <div className="space-y-1">
                    <label className="font-bold text-slate-400">Biographie concise</label>
                    <textarea rows={3} value={researcherForm.bio} onChange={e => setResearcherForm({ ...researcherForm, bio: e.target.value })} className="w-full border p-2 rounded" />
                  </div>
                </div>
              )}

              {/* 3. Projects Form fields */}
              {activeAdminTab === 'projects' && (
                <div className="space-y-3">
                  <div className="space-y-1">
                    <label className="font-bold text-slate-400">Titre du Projet</label>
                    <input type="text" value={projectForm.title} onChange={e => setProjectForm({ ...projectForm, title: e.target.value })} className="w-full border p-2 rounded" placeholder="EPIMOD-Sénégal..." />
                  </div>
                  <div className="space-y-1">
                    <label className="font-bold text-slate-400">Budget prévu</label>
                    <input type="text" value={projectForm.budget} onChange={e => setProjectForm({ ...projectForm, budget: e.target.value })} className="w-full border p-2 rounded" placeholder="Ex: 350 000" />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className="font-bold text-slate-400">Bailleur Principal</label>
                      <select value={projectForm.fundingSourceId} onChange={e => setProjectForm({ ...projectForm, fundingSourceId: e.target.value })} className="w-full border p-2 rounded text-slate-705">
                        {partners.map(pa => <option key={pa.id} value={pa.id}>{pa.name}</option>)}
                      </select>
                    </div>
                    <div className="space-y-1">
                      <label className="font-bold text-slate-400">Axe Rattaché</label>
                      <select value={projectForm.axisId} onChange={e => setProjectForm({ ...projectForm, axisId: e.target.value })} className="w-full border p-2 rounded text-slate-705">
                        {axes.map(a => <option key={a.id} value={a.id}>{a.code}</option>)}
                      </select>
                    </div>
                  </div>
                  <div className="space-y-1">
                    <label className="font-bold text-slate-400">Description / Enjeux scientifiques</label>
                    <textarea rows={3} value={projectForm.description} onChange={e => setProjectForm({ ...projectForm, description: e.target.value })} className="w-full border p-2 rounded" />
                  </div>
                </div>
              )}

              {/* Fallback field when nothing selected */}
              {!['publications', 'researchers', 'projects'].includes(activeAdminTab) && (
                <p className="text-slate-500 font-medium">Pour des raisons de limitation d'interfaces, le CRUD interactif complet pour ce module est pré-seeding dans mockData.ts.</p>
              )}

            </div>

            <div className="p-4 bg-slate-50 border-t border-slate-150 flex justify-end gap-2 text-xs font-bold font-sans">
              <button onClick={() => setModalOpen(false)} className="px-4 py-2 bg-slate-205 text-slate-700 rounded-lg hover:bg-slate-250 cursor-pointer">
                {activeAdminTab === 'publications' && !editingId ? 'Fermer l\'indexeur' : 'Annuler'}
              </button>
              {!(activeAdminTab === 'publications' && !editingId) && (
                <button onClick={saveCrudForm} className="px-4 py-2 bg-brand-blue text-white rounded-lg hover:bg-brand-blue/90 cursor-pointer">
                  Sauvegarder dans le registre
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* OVERLAY MODAL: DOWNLOAD SOURCE CODE / PROJECT INSTRUCTIONS */}
      {codeDownloadModalOpen && (
        <div className="fixed inset-0 bg-slate-900/65 backdrop-blur-xs flex items-center justify-center p-4 z-50 text-slate-800">
          <div className="bg-white rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl border border-slate-200 transition-all">
            <div className="bg-brand-blue p-5 text-white flex justify-between items-center">
              <div className="flex items-center gap-2">
                <Download size={18} className="text-brand-gold animate-bounce" />
                <h3 className="font-display font-bold text-sm">Téléchargement & Exportation du Projet</h3>
              </div>
              <button 
                onClick={() => setCodeDownloadModalOpen(false)}
                className="text-white/80 hover:text-white font-bold text-xs cursor-pointer p-1"
              >
                ✕
              </button>
            </div>
            
            <div className="p-6 space-y-4 text-xs">
              <p className="text-slate-600 leading-relaxed font-sans">
                Pour récupérer l'intégralité du code source interactif (React, TypeScript, Vite, Tailwind CSS) et l'exécuter en local ou le déployer sur vos propres serveurs de l'UMMISCO, suivez ces deux méthodes :
              </p>

              <div className="space-y-3 bg-slate-50 p-4 rounded-xl border border-slate-150">
                <h4 className="font-bold text-slate-800 flex items-center gap-1.5">
                  <span className="flex items-center justify-center w-5 h-5 rounded-full bg-brand-gold text-slate-950 text-[10px] font-extrabold">1</span>
                  Export Local Autonome (ZIP)
                </h4>
                <p className="text-slate-600 leading-relaxed pl-6">
                  Dans le menu supérieur de l'éditeur de <strong>Google AI Studio Build</strong> (en haut à droite de l'écran principal de l'application), cliquez sur le bouton de partage ou l'icône de paramètres/exportation, puis choisissez :
                </p>
                <div className="ml-6 pl-3 bg-slate-100/60 p-2 rounded border border-dashed font-mono uppercase text-[9px] text-[#4285F4] flex items-center gap-1.5">
                  <span>⚙️ Paramètres ➔ Exporter vers GitHub ou Télécharger l'archive ZIP</span>
                </div>
              </div>

              <div className="space-y-3 bg-slate-50 px-4 py-3 rounded-xl border border-slate-150">
                <h4 className="font-bold text-slate-800 flex items-center gap-1.5">
                  <span className="flex items-center justify-center w-5 h-5 rounded-full bg-emerald-600 text-white text-[10px] font-extrabold">2</span>
                  Sauvegarde de la Base centrale (.json)
                </h4>
                <p className="text-slate-600 pl-6 leading-relaxed">
                  Exportez l'état actuel de votre registre numérique centralisé de l'UMMISCO (les membres, toutes les publications réelles importées, les conventions passées, et l'historique d'audit complété) :
                </p>
                <button
                  onClick={() => {
                    downloadDatabaseBackup();
                    setCodeDownloadModalOpen(false);
                  }}
                  className="ml-6 px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold rounded-lg text-[10px] uppercase flex items-center gap-1 cursor-pointer shadow-3xs transition-all"
                >
                  <Database size={11} />
                  Télécharger ummisco_database.json
                </button>
              </div>

              <div className="text-[10px] text-slate-500 italic leading-snug font-sans p-2 bg-amber-50 rounded border border-amber-100 text-amber-800">
                Note : Pour démarrer le serveur une fois téléchargé chez vous, exécutez la commande <code className="bg-amber-100/80 px-1 rounded text-[9px] font-bold">npm install</code> puis <code className="bg-amber-100/80 px-1 rounded text-[9px] font-bold">npm run dev</code>.
              </div>
            </div>

            <div className="p-4 bg-slate-100 border-t border-slate-200 flex justify-end">
              <button 
                onClick={() => setCodeDownloadModalOpen(false)}
                className="px-4 py-2 bg-slate-300 text-slate-800 hover:bg-slate-350 font-bold rounded-lg text-xs cursor-pointer transition-colors"
              >
                Fermer
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
