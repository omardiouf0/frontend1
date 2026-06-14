/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import {
  User,
  Role,
  ResearchAxis,
  Researcher,
  Publication,
  Project,
  Dataset,
  Event,
  News,
  Partner,
  Funding,
  ValidationLog,
  AuditLog,
  IrdDocument,
  Course,
  Inscription
} from '../types';
import {
  INITIAL_RESEARCHERS,
  INITIAL_AXES,
  INITIAL_PARTNERS,
  INITIAL_PUBLICATIONS,
  INITIAL_PROJECTS,
  INITIAL_DATASETS,
  INITIAL_EVENTS,
  INITIAL_NEWS,
  INITIAL_USERS,
  INITIAL_AUDIT_LOGS,
  INITIAL_FUNDING,
  INITIAL_IRD_DOCUMENTS,
  INITIAL_COURSES,
  INITIAL_INSCRIPTIONS
} from '../data/mockData';
import {
  mapResearcher,
  mapAxe,
  mapPublication,
  mapProject,
  mapDataset,
  mapEvent,
  mapNews,
  mapPartner,
  mapAuditLog,
  mapUser,
  extractItems
} from '../utils/api';

interface AppContextProps {
  // Auth state
  currentUser: User | null;
  jwtToken: string | null;
  login: (email: string, roleCode?: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
  switchRole: (role: string) => void;

  // Active Database State
  researchers: Researcher[];
  axes: ResearchAxis[];
  partners: Partner[];
  publications: Publication[];
  projects: Project[];
  datasets: Dataset[];
  events: Event[];
  news: News[];
  users: User[];
  auditLogs: AuditLog[];
  fundings: Funding[];

  // CRUD Actions
  // Users
  addUser: (user: Omit<User, 'id' | 'createdAt'>) => void;
  updateUser: (id: string, user: Partial<User>) => void;
  deleteUser: (id: string) => void;

  // Axes
  addAxis: (axis: Omit<ResearchAxis, 'id'>) => void;
  updateAxis: (id: string, axis: Partial<ResearchAxis>) => void;
  deleteAxis: (id: string) => void;

  // Researchers
  addResearcher: (researcher: Omit<Researcher, 'id'>) => void;
  updateResearcher: (id: string, researcher: Partial<Researcher>) => void;
  deleteResearcher: (id: string) => void;

  // Publications
  addPublication: (pub: Omit<Publication, 'id' | 'createdAt' | 'status'>) => void;
  updatePublication: (id: string, pub: Partial<Publication>) => void;
  deletePublication: (id: string) => void;

  // Projects
  addProject: (proj: Omit<Project, 'id' | 'createdAt' | 'status'>) => void;
  updateProject: (id: string, proj: Partial<Project>) => void;
  deleteProject: (id: string) => void;

  // Datasets
  addDataset: (dataset: Omit<Dataset, 'id' | 'createdAt' | 'status'>) => void;
  updateDataset: (id: string, dataset: Partial<Dataset>) => void;
  deleteDataset: (id: string) => void;

  // Events
  addEvent: (evt: Omit<Event, 'id' | 'createdAt' | 'status'>) => void;
  updateEvent: (id: string, evt: Partial<Event>) => void;
  deleteEvent: (id: string) => void;

  // News
  addNews: (item: Omit<News, 'id' | 'createdAt' | 'status'>) => void;
  updateNews: (id: string, item: Partial<News>) => void;
  deleteNews: (id: string) => void;

  // Partners
  addPartner: (partner: Omit<Partner, 'id'>) => void;
  updatePartner: (id: string, partner: Partial<Partner>) => void;
  deletePartner: (id: string) => void;

  // Fundings
  addFunding: (funding: Omit<Funding, 'id'>) => void;
  updateFunding: (id: string, funding: Partial<Funding>) => void;
  deleteFunding: (id: string) => void;

  // Validation Workflows
  validateEntity: (
    entityType: 'Publication' | 'Project' | 'Dataset' | 'Event' | 'News',
    entityId: string,
    action: 'Approved' | 'Rejected',
    comment?: string
  ) => void;
  submitForValidation: (
    entityType: 'Publication' | 'Project' | 'Dataset' | 'Event' | 'News',
    entityId: string
  ) => void;

  // Global search input
  searchQuery: string;
  setSearchQuery: (query: string) => void;

  // Multilingual State Support
  currentLanguage: 'fr' | 'en' | 'ar';
  setCurrentLanguage: (lang: 'fr' | 'en' | 'ar') => void;

  // IRD Administrative Documents
  irdDocuments: IrdDocument[];
  addIrdDocument: (doc: Omit<IrdDocument, 'id' | 'createdAt' | 'signedByDirector' | 'status'>) => void;
  updateIrdDocument: (id: string, doc: Partial<IrdDocument>) => void;
  deleteIrdDocument: (id: string) => void;
  signIrdDocument: (id: string, comment?: string) => void;
  validateIrdDocument: (id: string, action: 'Approved' | 'Rejected', comment?: string) => void;

  // Formations/Courses & Inscriptions Action Handles
  courses: Course[];
  inscriptions: Inscription[];
  addCourse: (course: Omit<Course, 'id' | 'createdAt' | 'status'>) => void;
  updateCourse: (id: string, course: Partial<Course>) => void;
  deleteCourse: (id: string) => void;
  addInscription: (inscription: Omit<Inscription, 'id' | 'createdAt' | 'status'>) => void;
  updateInscriptionStatus: (id: string, status: 'Pending' | 'Approved' | 'Rejected') => void;

  // API Config (Allows connecting real Backend if desired)
  backendUrl: string;
  setBackendUrl: (url: string) => void;
  isUsingMock: boolean;
  setIsUsingMock: (val: boolean) => void;
}

const AppContext = createContext<AppContextProps | undefined>(undefined);

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  // Load initial states from LocalStorage or use seeded mockData
  const [currentUser, setCurrentUser] = useState<User | null>(() => {
    const saved = localStorage.getItem('ummisco_user');
    return saved ? JSON.parse(saved) : null;
  });

  const [jwtToken, setJwtToken] = useState<string | null>(() => {
    return localStorage.getItem('ummisco_token') || null;
  });

  const [backendUrl, setBackendUrl] = useState<string>(() => {
    return localStorage.getItem('ummisco_backend_url') || 'https://backend-s1g3.onrender.com';
  });

  const [isUsingMock, setIsUsingMock] = useState<boolean>(() => {
    const saved = localStorage.getItem('ummisco_use_mock');
    return saved ? JSON.parse(saved) : false;
  });

  const [searchQuery, setSearchQuery] = useState('');

  // Domain states
  const [researchers, setResearchers] = useState<Researcher[]>(() => {
    const saved = localStorage.getItem('db_researchers');
    return saved ? JSON.parse(saved) : INITIAL_RESEARCHERS;
  });

  const [axes, setAxes] = useState<ResearchAxis[]>(() => {
    const saved = localStorage.getItem('db_axes');
    return saved ? JSON.parse(saved) : INITIAL_AXES;
  });

  const [partners, setPartners] = useState<Partner[]>(() => {
    const saved = localStorage.getItem('db_partners');
    return saved ? JSON.parse(saved) : INITIAL_PARTNERS;
  });

  const [publications, setPublications] = useState<Publication[]>(() => {
    const saved = localStorage.getItem('db_publications');
    return saved ? JSON.parse(saved) : INITIAL_PUBLICATIONS;
  });

  const [projects, setProjects] = useState<Project[]>(() => {
    const saved = localStorage.getItem('db_projects');
    return saved ? JSON.parse(saved) : INITIAL_PROJECTS;
  });

  const [datasets, setDatasets] = useState<Dataset[]>(() => {
    const saved = localStorage.getItem('db_datasets');
    return saved ? JSON.parse(saved) : INITIAL_DATASETS;
  });

  const [events, setEvents] = useState<Event[]>(() => {
    const saved = localStorage.getItem('db_events');
    if (saved) {
      try {
        const parsed: Event[] = JSON.parse(saved);
        return parsed.map(evt => {
          if (evt.id === 'evt-2' || (evt.title && evt.title.includes("Soutenance de Thèse de Doctorat : Modélisation"))) {
            return {
              ...evt,
              image: "https://images.unsplash.com/photo-1524178232363-1fb2b075b655?auto=format&fit=crop&q=80&w=600"
            };
          }
          return evt;
        });
      } catch (e) {
        return INITIAL_EVENTS;
      }
    }
    return INITIAL_EVENTS;
  });

  const [news, setNews] = useState<News[]>(() => {
    const saved = localStorage.getItem('db_news');
    return saved ? JSON.parse(saved) : INITIAL_NEWS;
  });

  const [users, setUsers] = useState<User[]>(() => {
    const saved = localStorage.getItem('db_users');
    return saved ? JSON.parse(saved) : INITIAL_USERS;
  });

  const [auditLogs, setAuditLogs] = useState<AuditLog[]>(() => {
    const saved = localStorage.getItem('db_audit_logs');
    return saved ? JSON.parse(saved) : INITIAL_AUDIT_LOGS;
  });

  const [fundings, setFundings] = useState<Funding[]>(() => {
    const saved = localStorage.getItem('db_fundings');
    return saved ? JSON.parse(saved) : INITIAL_FUNDING;
  });

  const [currentLanguage, setCurrentLanguage] = useState<'fr' | 'en' | 'ar'>(() => {
    const saved = localStorage.getItem('ummisco_lang');
    return (saved as 'fr' | 'en' | 'ar') || 'fr';
  });

  const [irdDocuments, setIrdDocuments] = useState<IrdDocument[]>(() => {
    const saved = localStorage.getItem('db_ird_documents');
    return saved ? JSON.parse(saved) : INITIAL_IRD_DOCUMENTS;
  });

  const [courses, setCourses] = useState<Course[]>(() => {
    const saved = localStorage.getItem('db_courses');
    return saved ? JSON.parse(saved) : INITIAL_COURSES;
  });

  const [inscriptions, setInscriptions] = useState<Inscription[]>(() => {
    const saved = localStorage.getItem('db_inscriptions');
    return saved ? JSON.parse(saved) : INITIAL_INSCRIPTIONS;
  });

  // Sync to local storage
  useEffect(() => {
    localStorage.setItem('db_courses', JSON.stringify(courses));
  }, [courses]);

  useEffect(() => {
    localStorage.setItem('db_inscriptions', JSON.stringify(inscriptions));
  }, [inscriptions]);

  // Sync to local storage
  useEffect(() => {
    localStorage.setItem('ummisco_lang', currentLanguage);
    // Apply RTL / dir attribute to body tag
    if (currentLanguage === 'ar') {
      document.documentElement.dir = 'rtl';
    } else {
      document.documentElement.dir = 'ltr';
    }
  }, [currentLanguage]);

  useEffect(() => {
    localStorage.setItem('db_ird_documents', JSON.stringify(irdDocuments));
  }, [irdDocuments]);

  useEffect(() => {
    localStorage.setItem('db_researchers', JSON.stringify(researchers));
  }, [researchers]);

  useEffect(() => {
    localStorage.setItem('db_axes', JSON.stringify(axes));
  }, [axes]);

  useEffect(() => {
    localStorage.setItem('db_partners', JSON.stringify(partners));
  }, [partners]);

  useEffect(() => {
    localStorage.setItem('db_publications', JSON.stringify(publications));
  }, [publications]);

  useEffect(() => {
    localStorage.setItem('db_projects', JSON.stringify(projects));
  }, [projects]);

  useEffect(() => {
    localStorage.setItem('db_datasets', JSON.stringify(datasets));
  }, [datasets]);

  useEffect(() => {
    localStorage.setItem('db_events', JSON.stringify(events));
  }, [events]);

  useEffect(() => {
    localStorage.setItem('db_news', JSON.stringify(news));
  }, [news]);

  useEffect(() => {
    localStorage.setItem('db_users', JSON.stringify(users));
  }, [users]);

  useEffect(() => {
    localStorage.setItem('db_audit_logs', JSON.stringify(auditLogs));
  }, [auditLogs]);

  useEffect(() => {
    localStorage.setItem('db_fundings', JSON.stringify(fundings));
  }, [fundings]);

  useEffect(() => {
    localStorage.setItem('ummisco_backend_url', backendUrl);
  }, [backendUrl]);

  useEffect(() => {
    localStorage.setItem('ummisco_use_mock', JSON.stringify(isUsingMock));
  }, [isUsingMock]);

  // Sync with FastAPI backend if mock mode is turned off
  useEffect(() => {
    if (isUsingMock) {
      return;
    }

    const fetchAllData = async () => {
      const cleanUrl = backendUrl.replace(/\/$/, '');
      const headers: HeadersInit = {
        'Accept': 'application/json',
      };
      if (jwtToken) {
        headers['Authorization'] = `Bearer ${jwtToken}`;
      }

      const getApi = async (path: string) => {
        try {
          const res = await fetch(`${cleanUrl}${path}`, { headers });
          if (!res.ok) return null;
          return await res.json();
        } catch (e) {
          console.warn(`Error fetching from backend path ${path}:`, e);
          return null;
        }
      };

      try {
        const resData = await getApi('/api/chercheurs/');
        if (resData) setResearchers(extractItems(resData).map(mapResearcher));

        const axesData = await getApi('/api/axes/');
        if (axesData) setAxes(extractItems(axesData).map(mapAxe));

        const partnersData = await getApi('/api/partenaires/');
        if (partnersData) setPartners(extractItems(partnersData).map(mapPartner));

        const pubData = await getApi('/api/publications/');
        if (pubData) setPublications(extractItems(pubData).map(mapPublication));

        const projData = await getApi('/api/projets/');
        if (projData) setProjects(extractItems(projData).map(mapProject));

        const datasetData = await getApi('/api/datasets/');
        if (datasetData) setDatasets(extractItems(datasetData).map(mapDataset));

        const evtData = await getApi('/api/evenements/');
        if (evtData) setEvents(extractItems(evtData).map(mapEvent));

        const newsData = await getApi('/api/actualites/');
        if (newsData) setNews(extractItems(newsData).map(mapNews));

        const usersData = await getApi('/api/users/');
        if (usersData) setUsers(extractItems(usersData).map(mapUser));

        const auditData = await getApi('/api/audit-logs/');
        if (auditData) setAuditLogs(extractItems(auditData).map(mapAuditLog));

      } catch (err: any) {
        console.error("FastAPI Sync error:", err);
      }
    };

    fetchAllData();
  }, [isUsingMock, backendUrl, jwtToken]);

  // Log Actions helper
  const logAudit = (username: string, action: string, module: string, status: 'SUCCESS' | 'FAILED') => {
    const newLog: AuditLog = {
      id: `log-${Date.now()}`,
      username,
      action,
      ipAddress: "196.207.241.112",
      module,
      timestamp: new Date().toISOString(),
      status
    };
    setAuditLogs(prev => [newLog, ...prev]);
  };

  // Auth Operations
  const login = async (email: string, selectedRole?: string) => {
    if (!isUsingMock) {
      try {
        const cleanUrl = backendUrl.replace(/\/$/, '');
        const response = await fetch(`${cleanUrl}/api/login-json`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            email,
            password: 'password' // Standard seeded fallback password
          })
        });

        if (response.ok) {
          const res = await response.json();
          const mappedUser: User = {
            id: String(res.user_id),
            name: res.email.split('@')[0].toUpperCase(),
            email: res.email,
            role: res.role === 'admin' ? 'Admin' : res.role === 'directeur' ? 'Directeur' : res.role === 'responsable_axe' ? "Chef d'Axe" : 'Chercheur',
            active: true,
            createdAt: new Date().toISOString().split('T')[0]
          };
          setCurrentUser(mappedUser);
          setJwtToken(res.access_token);
          localStorage.setItem('ummisco_user', JSON.stringify(mappedUser));
          localStorage.setItem('ummisco_token', res.access_token);
          logAudit(email, "Authentification réussie (FastAPI)", "AUTH", "SUCCESS");
          return { success: true };
        } else {
          // If the server rejected it, try standard OAuth login form or throw
          throw new Error("Authentification rejetée par le serveur de production. Redirection vers la session locale.");
        }
      } catch (err: any) {
        console.warn("FastAPI Login error, using local simulation:", err.message);
      }
    }

    // Default simulated JWT login helper
    const foundUser = users.find(u => u.email.toLowerCase() === email.toLowerCase());
    
    if (foundUser) {
      if (!foundUser.active) {
        logAudit(email, "Tentative de connexion : Compte désactivé", "AUTH", "FAILED");
        return { success: false, error: "Votre compte a été désactivé par l'administrateur." };
      }

      // If they passed a custom role option to simulate, let's override for debug
      const userToLogin = selectedRole 
        ? { ...foundUser, role: selectedRole }
        : foundUser;

      setCurrentUser(userToLogin);
      const fakeToken = `eySimulatedJWTTokenForUMMISCO.${btoa(JSON.stringify(userToLogin))}.${Date.now()}`;
      setJwtToken(fakeToken);
      
      localStorage.setItem('ummisco_user', JSON.stringify(userToLogin));
      localStorage.setItem('ummisco_token', fakeToken);
      
      logAudit(userToLogin.email, "Authentification réussie (JWT)", "AUTH", "SUCCESS");
      return { success: true };
    } else {
      // Create transient visitor if they type a random email, so it's frictionless to try
      const visitorUser: User = {
        id: `usr-visitor-${Date.now()}`,
        name: email.split('@')[0].toUpperCase(),
        email: email,
        role: selectedRole || "Chercheur",
        active: true,
        createdAt: new Date().toISOString().split('T')[0]
      };
      
      setCurrentUser(visitorUser);
      const fakeToken = `eySimulatedJWTTokenForUMMISCO.${btoa(JSON.stringify(visitorUser))}.${Date.now()}`;
      setJwtToken(fakeToken);
      localStorage.setItem('ummisco_user', JSON.stringify(visitorUser));
      localStorage.setItem('ummisco_token', fakeToken);
      
      logAudit(email, `Création automatique d'un compte de démonstration : ${visitorUser.role}`, "AUTH", "SUCCESS");
      return { success: true };
    }
  };

  const logout = () => {
    const previousEmail = currentUser?.email || 'unknown';
    setCurrentUser(null);
    setJwtToken(null);
    localStorage.removeItem('ummisco_user');
    localStorage.removeItem('ummisco_token');
    logAudit(previousEmail, "Déconnexion de l'utilisateur", "AUTH", "SUCCESS");
  };

  const switchRole = (role: string) => {
    if (currentUser) {
      const updated = { ...currentUser, role };
      setCurrentUser(updated);
      localStorage.setItem('ummisco_user', JSON.stringify(updated));
      logAudit(currentUser.email, `Changement de rôle de simulation : ${role}`, "AUTH", "SUCCESS");
    }
  };

  // CRUD Implementations

  // General CRUD helper
  const generateId = (prefix: string) => `${prefix}-${Math.floor(Math.random() * 8999) + 1000}`;

  const parseIdToInt = (idStr: string, fallback: number = 1): number => {
    const matched = idStr.match(/\d+/);
    return matched ? parseInt(matched[0], 10) : fallback;
  };

  const formatTimeStr = (timeStr?: string): string => {
    if (!timeStr) return "09:00:00";
    if (/^\d{2}:\d{2}:\d{2}$/.test(timeStr)) return timeStr;
    if (/^\d{2}:\d{2}$/.test(timeStr)) return `${timeStr}:00`;
    return "09:00:00";
  };

  // Users Management
  const addUser = async (userData: Omit<User, 'id' | 'createdAt'>) => {
    if (!isUsingMock) {
      try {
        const cleanUrl = backendUrl.replace(/\/$/, '');
        const payload = {
          email: userData.email,
          role: userData.role === 'Admin' ? 'admin' : userData.role === 'Directeur' ? 'directeur' : userData.role === "Chef d'Axe" ? 'responsable_axe' : 'chercheur',
          is_active: userData.active !== undefined ? userData.active : true,
          password: 'password'
        };
        const response = await fetch(`${cleanUrl}/api/users/`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            ...(jwtToken ? { 'Authorization': `Bearer ${jwtToken}` } : {})
          },
          body: JSON.stringify(payload)
        });
        if (response.ok) {
          const res = await response.json();
          setUsers(prev => [...prev, mapUser(res)]);
          logAudit(currentUser?.email || 'System', `Ajout de l'utilisateur : ${res.email} (API)`, "USERS", "SUCCESS");
          return;
        }
      } catch (err: any) {
        console.warn("API user creation warning:", err.message);
      }
    }

    const newUser: User = {
      ...userData,
      id: generateId('usr'),
      createdAt: new Date().toISOString().split('T')[0]
    };
    setUsers(prev => [...prev, newUser]);
    logAudit(currentUser?.email || 'System', `Ajout de l'utilisateur : ${newUser.email}`, "USERS", "SUCCESS");
  };

  const updateUser = async (id: string, updatedData: Partial<User>) => {
    if (!isUsingMock && /^\d+$/.test(id)) {
      try {
        const cleanUrl = backendUrl.replace(/\/$/, '');
        const payload = {
          email: updatedData.email,
          role: updatedData.role === 'Admin' ? 'admin' : updatedData.role === 'Directeur' ? 'directeur' : updatedData.role === "Chef d'Axe" ? 'responsable_axe' : updatedData.role === 'Chercheur' ? 'chercheur' : undefined,
          is_active: updatedData.active
        };
        const response = await fetch(`${cleanUrl}/api/users/${id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            ...(jwtToken ? { 'Authorization': `Bearer ${jwtToken}` } : {})
          },
          body: JSON.stringify(payload)
        });
        if (response.ok) {
          const res = await response.json();
          setUsers(prev => prev.map(u => u.id === id ? mapUser(res) : u));
          logAudit(currentUser?.email || 'System', `Mise à jour de l'utilisateur ID: ${id} (API)`, "USERS", "SUCCESS");
          return;
        }
      } catch (err: any) {
        console.warn("API user update warning:", err.message);
      }
    }

    setUsers(prev => prev.map(u => u.id === id ? { ...u, ...updatedData } : u));
    logAudit(currentUser?.email || 'System', `Mise à jour de l'utilisateur ID: ${id}`, "USERS", "SUCCESS");
    
    if (currentUser && currentUser.id === id) {
      const synced = { ...currentUser, ...updatedData };
      setCurrentUser(synced);
      localStorage.setItem('ummisco_user', JSON.stringify(synced));
    }
  };

  const deleteUser = async (id: string) => {
    if (!isUsingMock && /^\d+$/.test(id)) {
      try {
        const cleanUrl = backendUrl.replace(/\/$/, '');
        const response = await fetch(`${cleanUrl}/api/users/${id}`, {
          method: 'DELETE',
          headers: {
            ...(jwtToken ? { 'Authorization': `Bearer ${jwtToken}` } : {})
          }
        });
        if (response.ok) {
          logAudit(currentUser?.email || 'System', `Suppression de l'utilisateur ID: ${id} (API)`, "USERS", "SUCCESS");
        }
      } catch (err: any) {
        console.warn("API user deletion warning:", err.message);
      }
    }

    const target = users.find(u => u.id === id);
    setUsers(prev => prev.filter(u => u.id !== id));
    logAudit(currentUser?.email || 'System', `Suppression de l'utilisateur : ${target?.email || id}`, "USERS", "SUCCESS");
  };

  // Axes Management
  const addAxis = async (axisData: Omit<ResearchAxis, 'id'>) => {
    if (!isUsingMock) {
      try {
        const cleanUrl = backendUrl.replace(/\/$/, '');
        const payload = {
          nom: axisData.title,
          description: axisData.description,
          thematique: axisData.code,
          date_creation: new Date().toISOString().split('T')[0]
        };
        const response = await fetch(`${cleanUrl}/api/axes/`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            ...(jwtToken ? { 'Authorization': `Bearer ${jwtToken}` } : {})
          },
          body: JSON.stringify(payload)
        });
        if (response.ok) {
          const res = await response.json();
          setAxes(prev => [...prev, mapAxe(res)]);
          logAudit(currentUser?.email || 'System', `Création de l'axe scientifique : ${res.nom} (API)`, "AXES", "SUCCESS");
          return;
        }
      } catch (err: any) {
        console.warn("API axis creation warning:", err.message);
      }
    }

    const newAxis: ResearchAxis = {
      ...axisData,
      id: generateId('AXE')
    };
    setAxes(prev => [...prev, newAxis]);
    logAudit(currentUser?.email || 'System', `Création d'un axe scientifique : ${newAxis.title}`, "AXES", "SUCCESS");
  };

  const updateAxis = async (id: string, axisData: Partial<ResearchAxis>) => {
    if (!isUsingMock && /^\d+$/.test(id.replace('AXE-', ''))) {
      try {
        const cleanUrl = backendUrl.replace(/\/$/, '');
        const rawId = id.replace('AXE-', '');
        const payload = {
          nom: axisData.title,
          description: axisData.description,
          thematique: axisData.code
        };
        const response = await fetch(`${cleanUrl}/api/axes/${rawId}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            ...(jwtToken ? { 'Authorization': `Bearer ${jwtToken}` } : {})
          },
          body: JSON.stringify(payload)
        });
        if (response.ok) {
          const res = await response.json();
          setAxes(prev => prev.map(a => a.id === id ? mapAxe(res) : a));
          logAudit(currentUser?.email || 'System', `Mise à jour de l'axe scientifique ID: ${rawId} (API)`, "AXES", "SUCCESS");
          return;
        }
      } catch (err: any) {
        console.warn("API axis update warning:", err.message);
      }
    }

    setAxes(prev => prev.map(a => a.id === id ? { ...a, ...axisData } : a));
    logAudit(currentUser?.email || 'System', `Mise à jour de l'axe scientifique ID: ${id}`, "AXES", "SUCCESS");
  };

  const deleteAxis = async (id: string) => {
    if (!isUsingMock && /^\d+$/.test(id.replace('AXE-', ''))) {
      try {
        const cleanUrl = backendUrl.replace(/\/$/, '');
        const rawId = id.replace('AXE-', '');
        const response = await fetch(`${cleanUrl}/api/axes/${rawId}`, {
          method: 'DELETE',
          headers: {
            ...(jwtToken ? { 'Authorization': `Bearer ${jwtToken}` } : {})
          }
        });
        if (response.ok) {
          logAudit(currentUser?.email || 'System', `Suppression de l'axe ID: ${rawId} (API)`, "AXES", "SUCCESS");
        }
      } catch (err: any) {
        console.warn("API axis deletion warning:", err.message);
      }
    }

    setAxes(prev => prev.filter(a => a.id !== id));
    logAudit(currentUser?.email || 'System', `Suppression de l'axe : ${id}`, "AXES", "SUCCESS");
  };

  // Researchers
  const addResearcher = async (resData: Omit<Researcher, 'id'>) => {
    if (!isUsingMock) {
      try {
        const cleanUrl = backendUrl.replace(/\/$/, '');
        const payload = {
          nom_complet: resData.name,
          titre: resData.rank,
          photo: resData.image,
          institution: resData.affiliation,
          email: resData.email,
          telephone: resData.phone,
          specialite: resData.bio
        };
        const response = await fetch(`${cleanUrl}/api/chercheurs/`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            ...(jwtToken ? { 'Authorization': `Bearer ${jwtToken}` } : {})
          },
          body: JSON.stringify(payload)
        });
        if (response.ok) {
          const res = await response.json();
          setResearchers(prev => [...prev, mapResearcher(res)]);
          logAudit(currentUser?.email || 'System', `Ajout du membre chercheur-enseignant : ${res.nom_complet} (API)`, "RESEARCHERS", "SUCCESS");
          return;
        }
      } catch (err: any) {
        console.warn("API researcher creation warning:", err.message);
      }
    }

    const newRes: Researcher = {
      ...resData,
      id: generateId('res')
    };
    setResearchers(prev => [...prev, newRes]);
    logAudit(currentUser?.email || 'System', `Ajout d'un membre chercheur : ${newRes.name}`, "RESEARCHERS", "SUCCESS");
  };

  const updateResearcher = async (id: string, resData: Partial<Researcher>) => {
    if (!isUsingMock && /^\d+$/.test(id)) {
      try {
        const cleanUrl = backendUrl.replace(/\/$/, '');
        const payload = {
          nom_complet: resData.name,
          titre: resData.rank,
          photo: resData.image,
          institution: resData.affiliation,
          email: resData.email,
          telephone: resData.phone,
          specialite: resData.bio
        };
        const response = await fetch(`${cleanUrl}/api/chercheurs/${id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            ...(jwtToken ? { 'Authorization': `Bearer ${jwtToken}` } : {})
          },
          body: JSON.stringify(payload)
        });
        if (response.ok) {
          const res = await response.json();
          setResearchers(prev => prev.map(r => r.id === id ? mapResearcher(res) : r));
          logAudit(currentUser?.email || 'System', `Mise à jour de l'identité du chercheur ID: ${id} (API)`, "RESEARCHERS", "SUCCESS");
          return;
        }
      } catch (err: any) {
        console.warn("API researcher update warning:", err.message);
      }
    }

    setResearchers(prev => prev.map(r => r.id === id ? { ...r, ...resData } : r));
    logAudit(currentUser?.email || 'System', `Mise à jour de l'identité du chercheur ID: ${id}`, "RESEARCHERS", "SUCCESS");
  };

  const deleteResearcher = async (id: string) => {
    if (!isUsingMock && /^\d+$/.test(id)) {
      try {
        const cleanUrl = backendUrl.replace(/\/$/, '');
        const response = await fetch(`${cleanUrl}/api/chercheurs/${id}`, {
          method: 'DELETE',
          headers: {
            ...(jwtToken ? { 'Authorization': `Bearer ${jwtToken}` } : {})
          }
        });
        if (response.ok) {
          logAudit(currentUser?.email || 'System', `Suppression du chercheur ID: ${id} (API)`, "RESEARCHERS", "SUCCESS");
        }
      } catch (err: any) {
        console.warn("API researcher deletion warning:", err.message);
      }
    }
    const target = researchers.find(r => r.id === id);
    setResearchers(prev => prev.filter(r => r.id !== id));
    logAudit(currentUser?.email || 'System', `Suppression du chercheur : ${target?.name || id}`, "RESEARCHERS", "SUCCESS");
  };

  // Publications
  const addPublication = async (pubData: Omit<Publication, 'id' | 'createdAt' | 'status'>) => {
    if (!isUsingMock) {
      try {
        const cleanUrl = backendUrl.replace(/\/$/, '');
        const payload = {
          titre: pubData.title,
          resume: pubData.abstract,
          type: pubData.type === 'Journal' ? 'article' : pubData.type === 'Conférence' ? 'conference' : pubData.type === 'Livre' ? 'chapitre' : pubData.type === 'Thèse' ? 'these' : 'article',
          annee: Number(pubData.year),
          doi: pubData.doi || '',
          fichier_url: pubData.fileUrl || '',
          axe_id: parseInt(pubData.axisId.replace('AXE-', '')) || 1,
          projet_id: null
        };
        const response = await fetch(`${cleanUrl}/api/publications/`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            ...(jwtToken ? { 'Authorization': `Bearer ${jwtToken}` } : {})
          },
          body: JSON.stringify(payload)
        });
        if (response.ok) {
          const res = await response.json();
          setPublications(prev => [...prev, mapPublication(res)]);
          logAudit(currentUser?.email || 'System', `Création d'une publication : ${res.titre} (API)`, "PUBLICATIONS", "SUCCESS");
          return;
        }
      } catch (err: any) {
        console.warn("API publication creation warning:", err.message);
      }
    }

    const newPub: Publication = {
      ...pubData,
      id: generateId('pub'),
      status: (pubData as any).status || 'Draft',
      createdAt: new Date().toISOString().split('T')[0]
    };
    setPublications(prev => [...prev, newPub]);
    logAudit(currentUser?.email || 'System', `Création d'une fiche publication : ${newPub.title}`, "PUBLICATIONS", "SUCCESS");
  };

  const updatePublication = async (id: string, pubData: Partial<Publication>) => {
    if (!isUsingMock && /^\d+$/.test(id)) {
      try {
        const cleanUrl = backendUrl.replace(/\/$/, '');
        const payload = {
          titre: pubData.title,
          resume: pubData.abstract,
          type: pubData.type === 'Journal' ? 'article' : pubData.type === 'Conférence' ? 'conference' : pubData.type === 'Livre' ? 'chapitre' : pubData.type === 'Thèse' ? 'these' : undefined,
          annee: pubData.year ? Number(pubData.year) : undefined,
          doi: pubData.doi,
          fichier_url: pubData.fileUrl,
          axe_id: pubData.axisId ? parseInt(pubData.axisId.replace('AXE-', '')) : undefined
        };
        const response = await fetch(`${cleanUrl}/api/publications/${id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            ...(jwtToken ? { 'Authorization': `Bearer ${jwtToken}` } : {})
          },
          body: JSON.stringify(payload)
        });
        if (response.ok) {
          const res = await response.json();
          setPublications(prev => prev.map(p => p.id === id ? mapPublication(res) : p));
          logAudit(currentUser?.email || 'System', `Modification de la publication ID: ${id} (API)`, "PUBLICATIONS", "SUCCESS");
          return;
        }
      } catch (err: any) {
        console.warn("API publication update warning:", err.message);
      }
    }

    setPublications(prev => prev.map(p => p.id === id ? { ...p, ...pubData } : p));
    logAudit(currentUser?.email || 'System', `Modification de la publication ID: ${id}`, "PUBLICATIONS", "SUCCESS");
  };

  const deletePublication = async (id: string) => {
    if (!isUsingMock && /^\d+$/.test(id)) {
      try {
        const cleanUrl = backendUrl.replace(/\/$/, '');
        const response = await fetch(`${cleanUrl}/api/publications/${id}`, {
          method: 'DELETE',
          headers: {
            ...(jwtToken ? { 'Authorization': `Bearer ${jwtToken}` } : {})
          }
        });
        if (response.ok) {
          logAudit(currentUser?.email || 'System', `Suppression de la publication ID: ${id} (API)`, "PUBLICATIONS", "SUCCESS");
        }
      } catch (err: any) {
        console.warn("API publication deletion warning:", err.message);
      }
    }
    setPublications(prev => prev.filter(p => p.id !== id));
    logAudit(currentUser?.email || 'System', `Suppression de la publication ID: ${id}`, "PUBLICATIONS", "SUCCESS");
  };

  // Projects
  const addProject = async (projData: Omit<Project, 'id' | 'createdAt' | 'status'>) => {
    if (!isUsingMock) {
      try {
        const cleanUrl = backendUrl.replace(/\/$/, '');
        let timelineParts = projData.timeline ? projData.timeline.split('-') : [];
        let date_debut = timelineParts[0] ? timelineParts[0].trim() + "-01-01" : new Date().toISOString().split('T')[0];
        let date_fin = timelineParts[1] ? timelineParts[1].trim() + "-12-31" : new Date().toISOString().split('T')[0];
        const payload = {
          titre: projData.title,
          thematique: projData.axisId || '',
          description: projData.description,
          date_debut,
          date_fin,
          budget: projData.budget ? parseFloat(projData.budget.replace(/[^0-9.]/g, '')) : 0,
          statut: projData.progress === 100 ? 'termine' : 'en_cours',
          classification: 'public',
          axe_id: projData.axisId ? parseIdToInt(projData.axisId) : 1,
          responsable_id: projData.leaderId ? parseIdToInt(projData.leaderId) : 1
        };
        const response = await fetch(`${cleanUrl}/api/projets/`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            ...(jwtToken ? { 'Authorization': `Bearer ${jwtToken}` } : {})
          },
          body: JSON.stringify(payload)
        });
        if (response.ok) {
          const res = await response.json();
          setProjects(prev => [...prev, mapProject(res)]);
          logAudit(currentUser?.email || 'System', `Création du projet scientifique : ${res.titre} (API)`, "PROJECTS", "SUCCESS");
          return;
        }
      } catch (err: any) {
        console.warn("API project creation warning:", err.message);
      }
    }

    const newProj: Project = {
      ...projData,
      id: generateId('proj'),
      status: (projData as any).status || 'Draft',
      createdAt: new Date().toISOString().split('T')[0]
    };
    setProjects(prev => [...prev, newProj]);
    logAudit(currentUser?.email || 'System', `Création du projet scientifique : ${newProj.title}`, "PROJECTS", "SUCCESS");
  };

  const updateProject = async (id: string, projData: Partial<Project>) => {
    if (!isUsingMock && /^\d+$/.test(id)) {
      try {
        const cleanUrl = backendUrl.replace(/\/$/, '');
        let timelineParts = projData.timeline ? projData.timeline.split('-') : [];
        let date_debut = timelineParts[0] ? timelineParts[0].trim() + "-01-01" : undefined;
        let date_fin = timelineParts[1] ? timelineParts[1].trim() + "-12-31" : undefined;
        const payload = {
          titre: projData.title,
          thematique: projData.axisId,
          description: projData.description,
          date_debut,
          date_fin,
          budget: projData.budget ? parseFloat(projData.budget.replace(/[^0-9.]/g, '')) : undefined,
          statut: projData.progress !== undefined ? (projData.progress === 100 ? 'termine' : 'en_cours') : undefined,
          axe_id: projData.axisId ? parseIdToInt(projData.axisId) : undefined,
          responsable_id: projData.leaderId ? parseIdToInt(projData.leaderId) : undefined
        };
        const response = await fetch(`${cleanUrl}/api/projets/${id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            ...(jwtToken ? { 'Authorization': `Bearer ${jwtToken}` } : {})
          },
          body: JSON.stringify(payload)
        });
        if (response.ok) {
          const res = await response.json();
          setProjects(prev => prev.map(p => p.id === id ? mapProject(res) : p));
          logAudit(currentUser?.email || 'System', `Mise à jour du projet scientifique ID: ${id} (API)`, "PROJECTS", "SUCCESS");
          return;
        }
      } catch (err: any) {
        console.warn("API project update warning:", err.message);
      }
    }

    setProjects(prev => prev.map(p => p.id === id ? { ...p, ...projData } : p));
    logAudit(currentUser?.email || 'System', `Mise à jour du projet scientifique ID: ${id}`, "PROJECTS", "SUCCESS");
  };

  const deleteProject = async (id: string) => {
    if (!isUsingMock && /^\d+$/.test(id)) {
      try {
        const cleanUrl = backendUrl.replace(/\/$/, '');
        const response = await fetch(`${cleanUrl}/api/projets/${id}`, {
          method: 'DELETE',
          headers: {
            ...(jwtToken ? { 'Authorization': `Bearer ${jwtToken}` } : {})
          }
        });
        if (response.ok) {
          logAudit(currentUser?.email || 'System', `Suppression du projet ID: ${id} (API)`, "PROJECTS", "SUCCESS");
        }
      } catch (err: any) {
        console.warn("API project deletion warning:", err.message);
      }
    }

    setProjects(prev => prev.filter(p => p.id !== id));
    logAudit(currentUser?.email || 'System', `Suppression du projet ID: ${id}`, "PROJECTS", "SUCCESS");
  };

  // Datasets
  const addDataset = async (datasetData: Omit<Dataset, 'id' | 'createdAt' | 'status'>) => {
    if (!isUsingMock) {
      try {
        const cleanUrl = backendUrl.replace(/\/$/, '');
        const payload = {
          nom: datasetData.title,
          description: datasetData.description,
          licence: datasetData.licenseType,
          url_acces: datasetData.fileUrl || '',
          format: 'CSV',
          taille: datasetData.size || '0 MB',
          version: '1.0',
          date_publication: new Date().toISOString().split('T')[0],
          classification: datasetData.classification ? datasetData.classification.toLowerCase() : 'public',
          chercheur_id: datasetData.authors && datasetData.authors.length > 0 ? parseIdToInt(datasetData.authors[0]) : 1,
          axe_id: datasetData.axisId ? parseIdToInt(datasetData.axisId) : 1,
          projet_id: null
        };
        const response = await fetch(`${cleanUrl}/api/datasets/`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            ...(jwtToken ? { 'Authorization': `Bearer ${jwtToken}` } : {})
          },
          body: JSON.stringify(payload)
        });
        if (response.ok) {
          const res = await response.json();
          setDatasets(prev => [...prev, mapDataset(res)]);
          logAudit(currentUser?.email || 'System', `Création du dataset : ${res.nom} (API)`, "DATASETS", "SUCCESS");
          return;
        }
      } catch (err: any) {
        console.warn("API dataset creation warning:", err.message);
      }
    }

    const newDataset: Dataset = {
      ...datasetData,
      id: generateId('data'),
      status: (datasetData as any).status || 'Draft',
      createdAt: new Date().toISOString().split('T')[0]
    };
    setDatasets(prev => [...prev, newDataset]);
    logAudit(currentUser?.email || 'System', `Création du dataset : ${newDataset.title}`, "DATASETS", "SUCCESS");
  };

  const updateDataset = async (id: string, datasetData: Partial<Dataset>) => {
    if (!isUsingMock && /^\d+$/.test(id)) {
      try {
        const cleanUrl = backendUrl.replace(/\/$/, '');
        const payload = {
          nom: datasetData.title,
          description: datasetData.description,
          licence: datasetData.licenseType,
          url_acces: datasetData.fileUrl,
          taille: datasetData.size,
          classification: datasetData.classification ? datasetData.classification.toLowerCase() : undefined,
          axe_id: datasetData.axisId ? parseIdToInt(datasetData.axisId) : undefined
        };
        const response = await fetch(`${cleanUrl}/api/datasets/${id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            ...(jwtToken ? { 'Authorization': `Bearer ${jwtToken}` } : {})
          },
          body: JSON.stringify(payload)
        });
        if (response.ok) {
          const res = await response.json();
          setDatasets(prev => prev.map(d => d.id === id ? mapDataset(res) : d));
          logAudit(currentUser?.email || 'System', `Mise à jour du dataset ID: ${id} (API)`, "DATASETS", "SUCCESS");
          return;
        }
      } catch (err: any) {
        console.warn("API dataset update warning:", err.message);
      }
    }

    setDatasets(prev => prev.map(d => d.id === id ? { ...d, ...datasetData } : d));
    logAudit(currentUser?.email || 'System', `Mise à jour du dataset ID: ${id}`, "DATASETS", "SUCCESS");
  };

  const deleteDataset = async (id: string) => {
    if (!isUsingMock && /^\d+$/.test(id)) {
      try {
        const cleanUrl = backendUrl.replace(/\/$/, '');
        const response = await fetch(`${cleanUrl}/api/datasets/${id}`, {
          method: 'DELETE',
          headers: {
            ...(jwtToken ? { 'Authorization': `Bearer ${jwtToken}` } : {})
          }
        });
        if (response.ok) {
          logAudit(currentUser?.email || 'System', `Suppression du dataset ID: ${id} (API)`, "DATASETS", "SUCCESS");
        }
      } catch (err: any) {
        console.warn("API dataset deletion warning:", err.message);
      }
    }

    setDatasets(prev => prev.filter(d => d.id !== id));
    logAudit(currentUser?.email || 'System', `Suppression du dataset ID: ${id}`, "DATASETS", "SUCCESS");
  };

  // Events
  const addEvent = async (evtData: Omit<Event, 'id' | 'createdAt' | 'status'>) => {
    if (!isUsingMock) {
      try {
        const cleanUrl = backendUrl.replace(/\/$/, '');
        const payload = {
          titre: evtData.title,
          description: evtData.description,
          date_debut: evtData.date || new Date().toISOString().split('T')[0],
          date_fin: evtData.date || new Date().toISOString().split('T')[0],
          heure_debut: formatTimeStr(evtData.time),
          heure_fin: "18:00:00",
          lieu: evtData.location || "Laboratoire UMMISCO",
          organisateur: "UMMISCO",
          participants: evtData.coordinatorId || "",
          image: evtData.image || null,
          site_web: null,
          type: evtData.type === 'Séminaire' ? 'seminaire' : evtData.type === 'Atelier' ? 'atelier' : 'colloque',
          classification: 'public',
          axe_id: evtData.axisId ? parseIdToInt(evtData.axisId) : 1
        };
        const response = await fetch(`${cleanUrl}/api/evenements/`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            ...(jwtToken ? { 'Authorization': `Bearer ${jwtToken}` } : {})
          },
          body: JSON.stringify(payload)
        });
        if (response.ok) {
          const res = await response.json();
          setEvents(prev => [...prev, mapEvent(res)]);
          logAudit(currentUser?.email || 'System', `Création de l'événement : ${res.titre} (API)`, "EVENTS", "SUCCESS");
          return;
        }
      } catch (err: any) {
        console.warn("API event creation warning:", err.message);
      }
    }

    const newEvt: Event = {
      ...evtData,
      id: generateId('evt'),
      status: (evtData as any).status || 'Draft',
      createdAt: new Date().toISOString().split('T')[0]
    };
    setEvents(prev => [...prev, newEvt]);
    logAudit(currentUser?.email || 'System', `Création de l'événement : ${newEvt.title}`, "EVENTS", "SUCCESS");
  };

  const updateEvent = async (id: string, evtData: Partial<Event>) => {
    if (!isUsingMock && /^\d+$/.test(id)) {
      try {
        const cleanUrl = backendUrl.replace(/\/$/, '');
        const payload = {
          titre: evtData.title,
          description: evtData.description,
          date_debut: evtData.date,
          date_fin: evtData.date,
          heure_debut: evtData.time ? formatTimeStr(evtData.time) : undefined,
          lieu: evtData.location,
          type: evtData.type === 'Séminaire' ? 'seminaire' : evtData.type === 'Atelier' ? 'atelier' : evtData.type === 'Colloque' ? 'colloque' : undefined,
          axe_id: evtData.axisId ? parseIdToInt(evtData.axisId) : undefined
        };
        const response = await fetch(`${cleanUrl}/api/evenements/${id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            ...(jwtToken ? { 'Authorization': `Bearer ${jwtToken}` } : {})
          },
          body: JSON.stringify(payload)
        });
        if (response.ok) {
          const res = await response.json();
          setEvents(prev => prev.map(e => e.id === id ? mapEvent(res) : e));
          logAudit(currentUser?.email || 'System', `Mise à jour de l'événement ID: ${id} (API)`, "EVENTS", "SUCCESS");
          return;
        }
      } catch (err: any) {
        console.warn("API event update warning:", err.message);
      }
    }

    setEvents(prev => prev.map(e => e.id === id ? { ...e, ...evtData } : e));
    logAudit(currentUser?.email || 'System', `Mise à jour de l'événement ID: ${id}`, "EVENTS", "SUCCESS");
  };

  const deleteEvent = async (id: string) => {
    if (!isUsingMock && /^\d+$/.test(id)) {
      try {
        const cleanUrl = backendUrl.replace(/\/$/, '');
        const response = await fetch(`${cleanUrl}/api/evenements/${id}`, {
          method: 'DELETE',
          headers: {
            ...(jwtToken ? { 'Authorization': `Bearer ${jwtToken}` } : {})
          }
        });
        if (response.ok) {
          logAudit(currentUser?.email || 'System', `Suppression de l'événement ID: ${id} (API)`, "EVENTS", "SUCCESS");
        }
      } catch (err: any) {
        console.warn("API event deletion warning:", err.message);
      }
    }

    setEvents(prev => prev.filter(e => e.id !== id));
    logAudit(currentUser?.email || 'System', `Suppression de l'événement ID: ${id}`, "EVENTS", "SUCCESS");
  };

  // News
  const addNews = async (itemData: Omit<News, 'id' | 'createdAt' | 'status'>) => {
    if (!isUsingMock) {
      try {
        const cleanUrl = backendUrl.replace(/\/$/, '');
        const payload = {
          titre: itemData.title,
          contenu: itemData.content || itemData.summary || '',
          image_url: itemData.image || '',
          titre_en: itemData.summary || '',
          contenu_en: itemData.content || '',
          classification: 'public'
        };
        const response = await fetch(`${cleanUrl}/api/actualites/`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            ...(jwtToken ? { 'Authorization': `Bearer ${jwtToken}` } : {})
          },
          body: JSON.stringify(payload)
        });
        if (response.ok) {
          const res = await response.json();
          setNews(prev => [...prev, mapNews(res)]);
          logAudit(currentUser?.email || 'System', `Publication d'une actualité : ${res.titre} (API)`, "NEWS", "SUCCESS");
          return;
        }
      } catch (err: any) {
        console.warn("API news creation warning:", err.message);
      }
    }

    const newItem: News = {
      ...itemData,
      id: generateId('news'),
      status: (itemData as any).status || 'Draft',
      createdAt: new Date().toISOString().split('T')[0]
    };
    setNews(prev => [...prev, newItem]);
    logAudit(currentUser?.email || 'System', `Publication d'une dépêche actualité : ${newItem.title}`, "NEWS", "SUCCESS");
  };

  const updateNews = async (id: string, itemData: Partial<News>) => {
    if (!isUsingMock && /^\d+$/.test(id)) {
      try {
        const cleanUrl = backendUrl.replace(/\/$/, '');
        const payload = {
          titre: itemData.title,
          contenu: itemData.content,
          image_url: itemData.image,
          titre_en: itemData.summary,
          contenu_en: itemData.content
        };
        const response = await fetch(`${cleanUrl}/api/actualites/${id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            ...(jwtToken ? { 'Authorization': `Bearer ${jwtToken}` } : {})
          },
          body: JSON.stringify(payload)
        });
        if (response.ok) {
          const res = await response.json();
          setNews(prev => prev.map(n => n.id === id ? mapNews(res) : n));
          logAudit(currentUser?.email || 'System', `Mise à jour de l'actualité ID: ${id} (API)`, "NEWS", "SUCCESS");
          return;
        }
      } catch (err: any) {
        console.warn("API news update warning:", err.message);
      }
    }

    setNews(prev => prev.map(n => n.id === id ? { ...n, ...itemData } : n));
    logAudit(currentUser?.email || 'System', `Mise à jour de la dépêche ID: ${id}`, "NEWS", "SUCCESS");
  };

  const deleteNews = async (id: string) => {
    if (!isUsingMock && /^\d+$/.test(id)) {
      try {
        const cleanUrl = backendUrl.replace(/\/$/, '');
        const response = await fetch(`${cleanUrl}/api/actualites/${id}`, {
          method: 'DELETE',
          headers: {
            ...(jwtToken ? { 'Authorization': `Bearer ${jwtToken}` } : {})
          }
        });
        if (response.ok) {
          logAudit(currentUser?.email || 'System', `Suppression de l'actualité ID: ${id} (API)`, "NEWS", "SUCCESS");
        }
      } catch (err: any) {
        console.warn("API news deletion warning:", err.message);
      }
    }

    setNews(prev => prev.filter(n => n.id !== id));
    logAudit(currentUser?.email || 'System', `Suppression de la dépêche actualité ID: ${id}`, "NEWS", "SUCCESS");
  };

  // Partners
  const addPartner = async (partnerData: Omit<Partner, 'id'>) => {
    if (!isUsingMock) {
      try {
        const cleanUrl = backendUrl.replace(/\/$/, '');
        const payload = {
          nom: partnerData.name,
          type: partnerData.type === 'Académique' ? 'universite' : 'autre',
          domaine_expertise: "Recherche durable",
          pays: partnerData.country || 'Sénégal',
          site_web: partnerData.website || '',
          logo: partnerData.logo || '🌐',
          description: "Partenaire institutionnel",
          date_partenariat: new Date().toISOString().split('T')[0]
        };
        const response = await fetch(`${cleanUrl}/api/partenaires/`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            ...(jwtToken ? { 'Authorization': `Bearer ${jwtToken}` } : {})
          },
          body: JSON.stringify(payload)
        });
        if (response.ok) {
          const res = await response.json();
          setPartners(prev => [...prev, mapPartner(res)]);
          logAudit(currentUser?.email || 'System', `Ajout du partenaire : ${res.nom} (API)`, "PARTNERS", "SUCCESS");
          return;
        }
      } catch (err: any) {
        console.warn("API partner creation warning:", err.message);
      }
    }

    const newPartner: Partner = {
      ...partnerData,
      id: generateId('part')
    };
    setPartners(prev => [...prev, newPartner]);
    logAudit(currentUser?.email || 'System', `Formulation d'un partenaire institutionnel : ${newPartner.name}`, "PARTNERS", "SUCCESS");
  };

  const updatePartner = async (id: string, partnerData: Partial<Partner>) => {
    if (!isUsingMock && /^\d+$/.test(id)) {
      try {
        const cleanUrl = backendUrl.replace(/\/$/, '');
        const payload = {
          nom: partnerData.name,
          type: partnerData.type === 'Académique' ? 'universite' : 'autre',
          pays: partnerData.country,
          site_web: partnerData.website,
          logo: partnerData.logo
        };
        const response = await fetch(`${cleanUrl}/api/partenaires/${id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            ...(jwtToken ? { 'Authorization': `Bearer ${jwtToken}` } : {})
          },
          body: JSON.stringify(payload)
        });
        if (response.ok) {
          const res = await response.json();
          setPartners(prev => prev.map(p => p.id === id ? mapPartner(res) : p));
          logAudit(currentUser?.email || 'System', `Mise à jour du partenaire ID: ${id} (API)`, "PARTNERS", "SUCCESS");
          return;
        }
      } catch (err: any) {
        console.warn("API partner update warning:", err.message);
      }
    }

    setPartners(prev => prev.map(p => p.id === id ? { ...p, ...partnerData } : p));
    logAudit(currentUser?.email || 'System', `Modification du partenaire ID: ${id}`, "PARTNERS", "SUCCESS");
  };

  const deletePartner = async (id: string) => {
    if (!isUsingMock && /^\d+$/.test(id)) {
      try {
        const cleanUrl = backendUrl.replace(/\/$/, '');
        const response = await fetch(`${cleanUrl}/api/partenaires/${id}`, {
          method: 'DELETE',
          headers: {
            ...(jwtToken ? { 'Authorization': `Bearer ${jwtToken}` } : {})
          }
        });
        if (response.ok) {
          logAudit(currentUser?.email || 'System', `Suppression du partenaire ID: ${id} (API)`, "PARTNERS", "SUCCESS");
        }
      } catch (err: any) {
        console.warn("API partner deletion warning:", err.message);
      }
    }

    setPartners(prev => prev.filter(p => p.id !== id));
    logAudit(currentUser?.email || 'System', `Suppression de la fiche partenaire ID: ${id}`, "PARTNERS", "SUCCESS");
  };

  // Fundings
  const addFunding = (fundingData: Omit<Funding, 'id'>) => {
    const newFunding: Funding = {
      ...fundingData,
      id: generateId('fund')
    };
    setFundings(prev => [...prev, newFunding]);
    logAudit(currentUser?.email || 'System', `Allocation budgétaire enregistrée : ${newFunding.amount} ${newFunding.currency}`, "FUNDINGS", "SUCCESS");
  };

  const updateFunding = (id: string, fundingData: Partial<Funding>) => {
    setFundings(prev => prev.map(f => f.id === id ? { ...f, ...fundingData } : f));
  };

  const deleteFunding = (id: string) => {
    setFundings(prev => prev.filter(f => f.id !== id));
  };

  // Validation Workflows (State Transition Engines)
  const submitForValidation = (
    entityType: 'Publication' | 'Project' | 'Dataset' | 'Event' | 'News',
    entityId: string
  ) => {
    const comment = "Soumission automatique par l'auteur pour contrôle d'intégrité scientifique.";
    
    // Set entity status to 'Pending'
    if (entityType === 'Publication') updatePublication(entityId, { status: 'Pending' });
    else if (entityType === 'Project') updateProject(entityId, { status: 'Pending' });
    else if (entityType === 'Dataset') updateDataset(entityId, { status: 'Pending' });
    else if (entityType === 'Event') updateEvent(entityId, { status: 'Pending' });
    else if (entityType === 'News') updateNews(entityId, { status: 'Pending' });

    logAudit(
      currentUser?.email || 'System',
      `Soumission pour validation : [${entityType}] ID: ${entityId}`,
      "WORKFLOW",
      "SUCCESS"
    );
  };

  const validateEntity = async (
    entityType: 'Publication' | 'Project' | 'Dataset' | 'Event' | 'News',
    entityId: string,
    action: 'Approved' | 'Rejected',
    comment?: string
  ) => {
    const userRole = currentUser?.role || 'Guest';
    if (userRole !== 'Admin' && userRole !== 'Chef d\'Axe' && userRole !== 'Validateur' && userRole !== 'Directeur') {
      logAudit(
        currentUser?.email || 'Unauthorised',
        `Tentative non autorisée de validation sur [${entityType}] ID: ${entityId}`,
        "WORKFLOW",
        "FAILED"
      );
      return;
    }

    if (!isUsingMock && /^\d+$/.test(entityId)) {
      try {
        const cleanUrl = backendUrl.replace(/\/$/, '');
        const pluralMap: Record<string, string> = {
          Publication: 'publications',
          Project: 'projets',
          Dataset: 'datasets',
          Event: 'evenements',
          News: 'actualites'
        };
        const pathSegment = pluralMap[entityType];
        const endpoint = action === 'Approved' ? 'validate' : 'reject';
        const url = `${cleanUrl}/api/${pathSegment}/${entityId}/${endpoint}?comment=${encodeURIComponent(comment || '')}`;
        
        const response = await fetch(url, {
          method: 'POST',
          headers: {
            ...(jwtToken ? { 'Authorization': `Bearer ${jwtToken}` } : {})
          }
        });
        if (response.ok) {
          logAudit(currentUser?.email || 'System', `Décision de validation [${action}] sur [${entityType}] ID: ${entityId} (API)`, "WORKFLOW", "SUCCESS");
        } else {
          console.warn("FastAPI validate/reject failed with status:", response.status);
        }
      } catch (err: any) {
        console.warn("FastAPI validation action error:", err.message);
      }
    }

    // Apply change
    if (entityType === 'Publication') updatePublication(entityId, { status: action });
    else if (entityType === 'Project') updateProject(entityId, { status: action });
    else if (entityType === 'Dataset') updateDataset(entityId, { status: action });
    else if (entityType === 'Event') updateEvent(entityId, { status: action });
    else if (entityType === 'News') updateNews(entityId, { status: action });

    logAudit(
      currentUser?.email || 'System',
      `Décision de validation [${action}] sur [${entityType}] ID: ${entityId}. Commentaire : ${comment || 'Aucun'}`,
      "WORKFLOW",
      "SUCCESS"
    );
  };

  // IRD Administrative Documents Actions
  const addIrdDocument = (docData: Omit<IrdDocument, 'id' | 'createdAt' | 'signedByDirector' | 'status'>) => {
    let creatorId = docData.createdBy;
    if (!creatorId && currentUser) {
      const researcher = researchers.find(r => r.email.toLowerCase() === currentUser.email.toLowerCase());
      creatorId = researcher?.id || currentUser.id || 'res-1';
    }
    if (!creatorId) {
      creatorId = 'res-1';
    }

    const newDoc: IrdDocument = {
      ...docData,
      createdBy: creatorId,
      id: generateId('doc'),
      status: 'Pending',
      signedByDirector: false,
      createdAt: new Date().toISOString().split('T')[0]
    };
    setIrdDocuments(prev => [newDoc, ...prev]);
    logAudit(currentUser?.email || 'System', `Création document administratif : ${newDoc.title}`, "IRD_DOCS", "SUCCESS");
  };

  const updateIrdDocument = (id: string, docData: Partial<IrdDocument>) => {
    setIrdDocuments(prev => prev.map(d => d.id === id ? { ...d, ...docData } : d));
    logAudit(currentUser?.email || 'System', `Mise à jour document ID: ${id}`, "IRD_DOCS", "SUCCESS");
  };

  const deleteIrdDocument = (id: string) => {
    setIrdDocuments(prev => prev.filter(d => d.id !== id));
    logAudit(currentUser?.email || 'System', `Suppression document ID: ${id}`, "IRD_DOCS", "SUCCESS");
  };

  const signIrdDocument = (id: string, comment?: string) => {
    setIrdDocuments(prev => prev.map(d => d.id === id ? { 
      ...d, 
      signedByDirector: true,
      comments: comment ? (d.comments ? `${d.comments}\n[Signature] ${comment}` : comment) : d.comments
    } : d));
    logAudit(currentUser?.email || 'System', `Signature du Directeur sur le document ID: ${id}`, "IRD_DOCS", "SUCCESS");
  };

  const validateIrdDocument = (id: string, action: 'Approved' | 'Rejected', comment?: string) => {
    setIrdDocuments(prev => prev.map(d => d.id === id ? { 
      ...d, 
      status: action,
      comments: comment || d.comments
    } : d));
    logAudit(currentUser?.email || 'System', `Décision administrative [${action}] pour le document ID: ${id}`, "IRD_DOCS", "SUCCESS");
  };

  const addCourse = (courseData: Omit<Course, 'id' | 'createdAt' | 'status'>) => {
    const newCourse: Course = {
      ...courseData,
      id: generateId('course'),
      status: 'Approved', // Pre-approved for instant simulation
      createdAt: new Date().toISOString().split('T')[0]
    };
    setCourses(prev => [newCourse, ...prev]);
    logAudit(currentUser?.email || 'System', `Création cours/formation : ${newCourse.title} (${newCourse.code})`, "FORMATIONS", "SUCCESS");
  };

  const updateCourse = (id: string, courseData: Partial<Course>) => {
    setCourses(prev => prev.map(c => c.id === id ? { ...c, ...courseData } : c));
    logAudit(currentUser?.email || 'System', `Mise à jour cours ID: ${id}`, "FORMATIONS", "SUCCESS");
  };

  const deleteCourse = (id: string) => {
    setCourses(prev => prev.filter(c => c.id !== id));
    logAudit(currentUser?.email || 'System', `Suppression cours ID: ${id}`, "FORMATIONS", "SUCCESS");
  };

  const addInscription = (inscData: Omit<Inscription, 'id' | 'createdAt' | 'status'>) => {
    const newInsc: Inscription = {
      ...inscData,
      id: generateId('insc'),
      status: 'Pending',
      createdAt: new Date().toISOString().split('T')[0]
    };
    setInscriptions(prev => [newInsc, ...prev]);
    logAudit(currentUser?.email || 'System', `Nouvelle inscription d'étudiant : ${newInsc.studentName} au cours ${newInsc.courseTitle}`, "FORMATIONS", "SUCCESS");
  };

  const updateInscriptionStatus = (id: string, status: 'Pending' | 'Approved' | 'Rejected') => {
    setInscriptions(prev => prev.map(i => i.id === id ? { ...i, status } : i));
    logAudit(currentUser?.email || 'System', `Statut inscription ID: ${id} changé en ${status}`, "FORMATIONS", "SUCCESS");
  };

  return (
    <AppContext.Provider
      value={{
        currentUser,
        jwtToken,
        login,
        logout,
        switchRole,
        researchers,
        axes,
        partners,
        publications,
        projects,
        datasets,
        events,
        news,
        users,
        auditLogs,
        fundings,

        addUser,
        updateUser,
        deleteUser,
        addAxis,
        updateAxis,
        deleteAxis,
        addResearcher,
        updateResearcher,
        deleteResearcher,
        addPublication,
        updatePublication,
        deletePublication,
        addProject,
        updateProject,
        deleteProject,
        addDataset,
        updateDataset,
        deleteDataset,
        addEvent,
        updateEvent,
        deleteEvent,
        addNews,
        updateNews,
        deleteNews,
        addPartner,
        updatePartner,
        deletePartner,
        addFunding,
        updateFunding,
        deleteFunding,

        validateEntity,
        submitForValidation,

        searchQuery,
        setSearchQuery,

        backendUrl,
        setBackendUrl,
        isUsingMock,
        setIsUsingMock,

        currentLanguage,
        setCurrentLanguage,
        irdDocuments,
        addIrdDocument,
        updateIrdDocument,
        deleteIrdDocument,
        signIrdDocument,
        validateIrdDocument,

        courses,
        inscriptions,
        addCourse,
        updateCourse,
        deleteCourse,
        addInscription,
        updateInscriptionStatus
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
