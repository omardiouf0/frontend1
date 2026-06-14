/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import {
  Researcher,
  ResearchAxis,
  Publication,
  Project,
  Dataset,
  Event,
  News,
  Partner,
  Funding,
  User,
  AuditLog,
  ValidationLog,
  IrdDocument,
  Course,
  Inscription
} from '../types';

export const INITIAL_RESEARCHERS: Researcher[] = [
  {
    id: "res-1",
    name: "Pr. Mame Samba Diouf",
    email: "msamba.diouf@ucad.edu.sn",
    phone: "+221 77 645 32 11",
    rank: "Professeur Titulaire",
    affiliation: "UCAD",
    bio: "Spécialiste de renommée mondiale en modélisation mathématique des systèmes dynamiques et de la propagation des maladies infectieuses en Afrique subsaharienne. Il coordonne les recherches conjointes UCAD/IRD sur le paludisme.",
    image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=200",
    axes: ["AXE-MOD", "AXE-SMA"],
    publicationsCount: 64,
    projectsCount: 12,
    officeLocation: "Pavillon Informatique, UCAD, Dakar, Sénégal"
  },
  {
    id: "res-2",
    name: "Dr. Sokhna Thiam",
    email: "sokhna.thiam@ird.fr",
    phone: "+221 33 849 55 44",
    rank: "Chargée de Recherche",
    affiliation: "IRD",
    bio: "Epidémiologiste de l'environnement et chercheuse IRD au laboratoire mixte international UMMISCO. Ses travaux portent sur l'impact du changement climatique sur la santé environnementale et les maladies hydriques.",
    image: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=200",
    axes: ["AXE-MOD", "AXE-BIO"],
    publicationsCount: 38,
    projectsCount: 8,
    officeLocation: "IRD Bel-Air, Dakar, Sénégal"
  },
  {
    id: "res-3",
    name: "Pr. Jean-Daniel Zucker",
    email: "jean-daniel.zucker@ird.fr",
    phone: "+33 1 44 27 80 00",
    rank: "Directeur de Recherche Exceptionnel",
    affiliation: "Sorbonne Université",
    bio: "Ancien directeur de l'UMMISCO France. Expert en intelligence artificielle, apprentissage automatique appliqué à la santé, et modélisation multi-échelle des systèmes biologiques complexes.",
    image: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&q=80&w=200",
    axes: ["AXE-IA", "AXE-SMA"],
    publicationsCount: 142,
    projectsCount: 22,
    officeLocation: "Sorbonne Université, Campus Jussieu, Paris, France"
  },
  {
    id: "res-4",
    name: "Dr. Papa Alioune Sine",
    email: "papaalioune.sine@ucad.edu.sn",
    phone: "+221 70 882 12 90",
    rank: "Maître de Conférences",
    affiliation: "UCAD",
    bio: "Docteur en informatique spécialisé dans le traitement thématique d'images satellitaires et les systèmes d'information géomatique pour la planification urbaine.",
    image: "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&q=80&w=200",
    axes: ["AXE-IA", "AXE-SMA"],
    publicationsCount: 24,
    projectsCount: 5,
    officeLocation: "Département Génie Informatique, ESP/UCAD, Dakar"
  },
  {
    id: "res-5",
    name: "Dr. Fatou Kiné Diop",
    email: "fatoukine.diop@ucad.edu.sn",
    phone: "+221 76 534 88 12",
    rank: "Maître de Conférences",
    affiliation: "UCAD",
    bio: "Experte en simulation multi-agents appliquée aux flux migratoires et au comportement des agents économiques locaux face aux perturbations climatiques au Sahel.",
    image: "https://images.unsplash.com/photo-1534751516642-a131ffd103ad?auto=format&fit=crop&q=80&w=200",
    axes: ["AXE-SMA", "AXE-BIO"],
    publicationsCount: 29,
    projectsCount: 7,
    officeLocation: "Faculté des Sciences, UCAD, Dakar, Sénégal"
  }
];

export const INITIAL_AXES: ResearchAxis[] = [
  {
    id: "AXE-MOD",
    title: "Modélisation Épidémiologique & Santé Publique",
    code: "ModEpid",
    description: "Conception, analyse mathématique et computationnelle de modèles épidémiologiques. Compréhension fine de la transmission vectorielle et conception d'outils de décision d'intervention pour les politiques de santé.",
    headId: "res-1",
    members: ["res-1", "res-2"],
    image: "https://images.unsplash.com/photo-1576086213369-97a306d36557?auto=format&fit=crop&q=80&w=600"
  },
  {
    id: "AXE-IA",
    title: "Systèmes Complexes, Intelligence Artificielle & Big Data",
    code: "SC-IA",
    description: "Extraction de connaissances à partir de masses de données hétérogènes. Algorithmes d'apprentissage profond pour les applications environnementales et le diagnostic médical de précision.",
    headId: "res-3",
    members: ["res-3", "res-4"],
    image: "https://images.unsplash.com/photo-1620712943543-bcc4688e7485?auto=format&fit=crop&q=80&w=600"
  },
  {
    id: "AXE-BIO",
    title: "Modélisation de la Biodiversité & Gestion Agro-écologique",
    code: "BioAgro",
    description: "Analyse logique et simulation biologique des agrosystèmes tropicaux. Optimisation des stratégies d'irrigation et analyse de la biodiversité végétale sous pressions anthropiques majeures et pastorale africaine.",
    headId: "res-2",
    members: ["res-2", "res-5"],
    image: "https://images.unsplash.com/photo-1530595467537-0b5996c41f2d?auto=format&fit=crop&q=80&w=600"
  },
  {
    id: "AXE-SMA",
    title: "Systèmes Multi-Agents & Simulation Globale",
    code: "SMA-G",
    description: "Modélisation d'agents autonomes interagissant dans un espace partagé. Applications de flux collectifs urbains, de gestion collective de l'eau potabilisée et d'aide à la décision territoriale.",
    headId: "res-5",
    members: ["res-1", "res-3", "res-4", "res-5"],
    image: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&q=80&w=600"
  }
];

export const INITIAL_PARTNERS: Partner[] = [
  {
    id: "part-1",
    name: "Université Cheikh Anta Diop (UCAD)",
    type: "Académique",
    logo: "🎓",
    country: "Sénégal",
    website: "https://www.ucad.sn"
  },
  {
    id: "part-2",
    name: "Institut de Recherche pour le Développement (IRD)",
    type: "Institutionnel",
    logo: "🌍",
    country: "France",
    website: "https://www.ird.fr"
  },
  {
    id: "part-3",
    name: "Sorbonne Université",
    type: "Académique",
    logo: "🏛️",
    country: "France",
    website: "https://www.sorbonne-universite.fr"
  },
  {
    id: "part-4",
    name: "Banque Mondiale (PROJET CEA-MITIC)",
    type: "Bailleur / Financier",
    logo: "💰",
    country: "International",
    website: "https://www.worldbank.org"
  },
  {
    id: "part-5",
    name: "Union Européenne (Horizon Europe)",
    type: "Bailleur / Financier",
    logo: "🇪🇺",
    country: "Europe",
    website: "https://ec.europa.eu"
  }
];

export const INITIAL_PUBLICATIONS: Publication[] = [
  {
    id: "pub-1",
    title: "Mathematical analysis of a malaria transmission model with spatial heterogeneity in the Dakar region",
    authors: ["Pr. Mame Samba Diouf", "Dr. Sokhna Thiam"],
    journal: "Journal of Mathematical Biology",
    year: 2025,
    type: "Journal",
    doi: "10.1007/s00285-025-0123-x",
    abstract: "Ce travail modélise mathématiquement l'impact des mouvements pendulaires de population entre la banlieue dakaroise et le centre-ville sur la persistance du paludisme saisonnier. Les résultats identifient des foyers d'amplification micro-locaux prioritaires pour la vectorisation des insecticides.",
    axisId: "AXE-MOD",
    status: "Approved",
    keywords: ["Malarial transmission", "Differential equations", "Mobility profiles", "Senegal"],
    fileUrl: "#pdf",
    downloadCount: 142,
    createdAt: "2025-02-14"
  },
  {
    id: "pub-2",
    title: "Deep learning based satellite imagery analytics for agro-pastoral monitoring in the Ferlo region",
    authors: ["Dr. Papa Alioune Sine", "Pr. Jean-Daniel Zucker"],
    journal: "Remote Sensing of Environment",
    year: 2025,
    type: "Journal",
    doi: "10.1016/j.rse.2024.11412",
    abstract: "L'article présente l'application de réseaux de neurones convolutionnels combinés pour détecter automatiquement la dynamique hydrique des mares temporaires critiques du bassin sylvopastoral sénégalais. Un outil d'aide aux éleveurs nomades est découlé.",
    axisId: "AXE-IA",
    status: "Approved",
    keywords: ["Deep learning", "Sentinel-2", "Ferlo Senegal", "Hydric network"],
    fileUrl: "#pdf",
    downloadCount: 98,
    createdAt: "2025-01-20"
  },
  {
    id: "pub-3",
    title: "Multi-Agent Simulation of Sahelian farming households' adaptation paths to rainfall variability",
    authors: ["Dr. Fatou Kiné Diop", "Pr. Mame Samba Diouf"],
    journal: "Ecological Complexity",
    year: 2024,
    type: "Journal",
    doi: "10.1016/j.ecocom.2024.101032",
    abstract: "Nous décrivons le modèle 'SIM-SAHEL' associant dynamiques hydrologiques de surface et règles décisionnelles des ménages ruraux confrontés aux sécheresses intermittentes programmées.",
    axisId: "AXE-SMA",
    status: "Approved",
    keywords: ["Agent-based modeling", "Agro-ecology", "Sahel", "Climatic resilience"],
    fileUrl: "#pdf",
    downloadCount: 220,
    createdAt: "2024-11-05"
  },
  {
    id: "pub-4",
    title: "Modélisation participative de la gestion des déchets solides à Rufisque avec l'outil GAMA",
    authors: ["Dr. Fatou Kiné Diop", "Dr. Papa Alioune Sine"],
    journal: "Revue Africaine de Recherche en Informatique et Mathématiques Appliquées (ARIMA)",
    year: 2026,
    type: "Journal",
    doi: "10.46298/arima.12931",
    abstract: "Cet article présente la construction participative d'une simulation sous la plateforme GAMA représentant les comportements des ménages, des charretiers informels et de la voirie municipale pour l'évacuation des déchets à Rufisque.",
    axisId: "AXE-SMA",
    status: "Approved",
    keywords: ["GAMA Platform", "Participatory Modeling", "Waste Management", "Rufisque"],
    fileUrl: "#pdf",
    downloadCount: 37,
    createdAt: "2026-03-12"
  },
  {
    id: "pub-5",
    title: "Deep reinforcement learning for epidemiological adaptive treatment strategies in vector-borne diseases",
    authors: ["Dr. Papa Alioune Sine", "Pr. Jean-Daniel Zucker"],
    journal: "IEEE Transactions on Evolutionary Computation",
    year: 2026,
    type: "Journal",
    doi: "10.1109/TEVC.2026.331422",
    abstract: "Utilisation du Deep Q-Networks (DQN) pour optimiser dynamiquement la temporalité d'aspersion de biopesticides en fonction de données de piégeages d'insectes temps réel collectées à Dakar et Kaolack.",
    axisId: "AXE-IA",
    status: "Pending",
    keywords: ["Reinforcement Learning", "Vector control", "Epidemiology", "Decision boundaries"],
    fileUrl: "#pdf",
    downloadCount: 5,
    createdAt: "2026-05-18"
  }
];

export const INITIAL_PROJECTS: Project[] = [
  {
    id: "proj-1",
    title: "EPIMOD-Sénégal : Modélisation Intégrée des Risques Infectieux et Hydriques",
    description: "Projet de recherche d'une durée de 3 ans visant à coupler les dynamiques hydrologiques au Sénégal aux réseaux de contacts humains locaux pour optimiser la prévision des épidémies de choléra et de dengue dans les zones semi-urbaines d'Afrique de l'Ouest.",
    leaderId: "res-1",
    timeline: "2024 - 2027",
    budget: "350 000",
    currency: "EUR",
    fundingSourceId: "part-5",
    members: ["res-1", "res-2", "res-5"],
    status: "Approved",
    axisId: "AXE-MOD",
    progress: 45,
    createdAt: "2024-01-10"
  },
  {
    id: "proj-2",
    title: "DIA-AGRO : Intelligence Artificielle et Télédétection pour la Sécurité Alimentaire au Sahel",
    description: "Initiative partenariale franco-sénégalaise pour cartographier le stress hydrique des cultures céréalières à haute résolution en utilisant des drones et l'imagerie Sentinel-2, combinés à des modèles prédictifs gérés par IA.",
    leaderId: "res-4",
    timeline: "2025 - 2028",
    budget: "480 000",
    currency: "USD",
    fundingSourceId: "part-4",
    members: ["res-4", "res-3"],
    status: "Approved",
    axisId: "AXE-IA",
    progress: 20,
    createdAt: "2025-01-15"
  },
  {
    id: "proj-3",
    title: "GAMA-Territoire : Plateforme d'Aide à l'Aménagement Durable face à l'Érosion Côtière",
    description: "Conception de modules géospatiaux avancés sous la plateforme de simulation GAMA pour simuler des scénarios d'évacuation, de rechargement sédimentaire artificiel et de digues naturelles à Saint-Louis du Sénégal.",
    leaderId: "res-5",
    timeline: "2024 - 2026",
    budget: "180 000",
    currency: "EUR",
    fundingSourceId: "part-2",
    members: ["res-5", "res-4", "res-1"],
    status: "Approved",
    axisId: "AXE-SMA",
    progress: 75,
    createdAt: "2024-06-01"
  }
];

export const INITIAL_DATASETS: Dataset[] = [
  {
    id: "data-1",
    title: "Spatio-temporal climatological and mosquito trap counts in Senegal (Kaolack & Dakar) 2018-2024",
    description: "Ce jeu de données de référence regroupe les relevés hebdomadaires de températures, de pluviométries issues de capteurs IRD, couplés aux densités d'Anophèles femelles collectées sur 18 stations territoriales spécifiques.",
    authors: ["Dr. Sokhna Thiam", "Pr. Mame Samba Diouf"],
    size: "650 MB",
    licenseType: "Creative Commons Attribution 4.0 International",
    downloadCount: 421,
    fileUrl: "#data-1",
    axisId: "AXE-MOD",
    status: "Approved",
    createdAt: "2024-10-15",
    classification: "PUBLIC"
  },
  {
    id: "data-2",
    title: "Labelled high-definition aerial drone pictures of sorghum fields during drought, Fatick (Senegal)",
    description: "Plus de 12 000 clichés aériens segmentés pixel par pixel avec annotations expertes sur l'état des cultures de sorgho et de mil pour calibrer des modèles d'intelligence artificielle d'évaluation de récolte.",
    authors: ["Dr. Papa Alioune Sine", "Pr. Jean-Daniel Zucker"],
    size: "12.4 GB",
    licenseType: "Open Data Commons Open Database License (ODbL)",
    downloadCount: 187,
    fileUrl: "#data-2",
    axisId: "AXE-IA",
    status: "Approved",
    createdAt: "2025-03-02",
    classification: "PROTEGE"
  },
  {
    id: "data-3",
    title: "Trajectory logging maps of multi-agent pastoral cattle migration in Northern Ferlo",
    description: "Tracés GPS bruts et filtrés de 15 troupeaux de bétail suivis sur deux ans d'analyses de transhumance. Inclus de plus les charges végétales recensées sur des quadrats écologiques témoins.",
    authors: ["Dr. Fatou Kiné Diop"],
    size: "82 MB",
    licenseType: "Public Domain Dedication (CC0)",
    downloadCount: 54,
    fileUrl: "#data-3",
    axisId: "AXE-BIO",
    status: "Approved",
    createdAt: "2025-05-10",
    classification: "PRIVE"
  }
];

export const INITIAL_EVENTS: Event[] = [
  {
    id: "evt-1",
    title: "L'Ecole d'Eté Internationale : Modélisation Mathématique & Systèmes Complexes",
    description: "Une formation intensive sur 10 jours regroupant doctorants et chercheurs africains autour des outils modernes de simulation (GAMA, R, Differential Equations solvers). Plus de 8 modules complets de cours et travaux pratiques dirigés par l'UMMISCO.",
    location: "Amphi de l'ESP, Université Cheikh Anta Diop (Dakar)",
    date: "2026-07-15",
    time: "08:30",
    coordinatorId: "res-1",
    status: "Approved",
    type: "Colloque",
    agenda: [
      "Jour 1: Introduction aux équations différentielles ordinaires appliquées aux épidémies",
      "Jour 2: Modélisation spatio-temporelle et équations aux dérivées partielles",
      "Jour 3: Prise en main avancée de la plateforme GAMA",
      "Jour 4: Calibration de modèles multi-agents par algorithmes génétiques",
      "Jour 5: Présentation des mini-projets étudiants de recherche"
    ],
    image: "https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&q=80&w=600",
    createdAt: "2026-05-01"
  },
  {
    id: "evt-2",
    title: "Soutenance de Thèse de Doctorat : Modélisation multi-agents de la mobilité urbaine à Dakar",
    description: "Soutenance publique de thèse de M. Ousmane Ndiaye face à un jury international d'experts rattachés à Sorbonne Université, l'UCAD et l'IRD.",
    location: "Salle de conférence de l'UMMISCO, IRD Bel-Air, Dakar",
    date: "2026-06-25",
    time: "10:00",
    coordinatorId: "res-1",
    status: "Approved",
    type: "Soutenance de Thèse",
    agenda: [
      "10:00 - Accueil et installation des membres du Jury",
      "10:15 - Présentation des travaux de recherche par le candidat",
      "11:00 - Questions et remarques de l'Auditoire et du Jury",
      "12:30 - Délibération à huis clos",
      "13:00 - Proclamation des résultats et cocktail académique"
    ],
    image: "https://images.unsplash.com/photo-1524178232363-1fb2b075b655?auto=format&fit=crop&q=80&w=600",
    createdAt: "2026-05-10"
  },
  {
    id: "evt-3",
    title: "Séminaire Scientifique : Épidémiologie participative et capteurs connectés",
    description: "Présentation des premiers travaux de récolte mobile décentralisée des risques environnementaux menés à Rufisque et Guédiawaye.",
    location: "Visioconférence Teams & Salle de séminaire UMMISCO Bondy (France)",
    date: "2026-06-18",
    time: "14:00",
    coordinatorId: "res-2",
    status: "Approved",
    type: "Séminaire",
    agenda: [
      "14:00 - Présentation du Dr Sokhna Thiam (15 min)",
      "14:20 - Démonstration technique de capteurs de qualité de l'air (20 min)",
      "14:40 - Débat scientifique : Biais d'échantillonnage et épidémiologie numérique (20 min)"
    ],
    image: "https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?auto=format&fit=crop&q=80&w=600",
    createdAt: "2026-06-03"
  }
];

export const INITIAL_NEWS: News[] = [
  {
    id: "news-1",
    title: "Cérémonie d'ouverture de l'antenne UMMISCO à l'Université de Thiès",
    summary: "Afin de renforcer l'implantation nationale du laboratoire mixte international, une convention cadre a été co-signée à Dakar par le recteur de l'Université de Thiès et la délégation IRD.",
    content: "Dans l'optique d'essaimer la pratique des mathématiques et de l'informatique décisionnelle dans d'autres universités du Sénégal, l'UMMISCO ouvre officiellement un pôle thématique focalisé sur la gestion de l'eau à l'Université de Thiès. Ce pôle réunira deux nouveaux chercheurs juniors sénégalais et bénéficiera de l'infrastructure Serveur financée par les bailleurs français.",
    category: "Partenariat",
    authorId: "res-1",
    image: "https://images.unsplash.com/photo-1556761175-5973dc0f32e7?auto=format&fit=crop&q=80&w=600",
    date: "2026-05-24",
    status: "Approved",
    featured: true,
    createdAt: "2026-05-24"
  },
  {
    id: "news-2",
    title: "Dr Sokhna Thiam lauréate du prix de la recherche interdisciplinaire en Afrique",
    summary: "Ce prestigieux prix honorifique récompense ses recherches novatrices couplant la dynamique climatique, les infrastructures scolaires dégradées et les affections d'enfants au Sénégal.",
    content: "La Fondation d'Interdisciplinarité pour la Santé Globale a remis officiellement son prix d'argent annuel à la chercheuse Sokhna Thiam de l'IRD pour l'excellence académique de son projet interdisciplinaire impliquant des géographes, des informaticiens et des personnels hospitaliers sénégalais.",
    category: "Distinction",
    authorId: "res-2",
    image: "https://images.unsplash.com/photo-1567168544813-cc03465b4fa8?auto=format&fit=crop&q=80&w=600",
    date: "2026-04-18",
    status: "Approved",
    featured: true,
    createdAt: "2026-04-18"
  },
  {
    id: "news-3",
    title: "Lancement de la plateforme GAMA 2.0 pour les simulations temps réel de foules",
    summary: "L'équipe de recherche de l'UMMISCO (France / Vietnam / Sénégal) annonce la disponibilité du plugin GAMA-Live-Sync intégrant des capteurs géolocalisés.",
    content: "Cette version majeure propose une synchronisation continue de flux de trajectoires directement issues de flux d'images IP d'analyse de caméras urbaines. Elle permettra de simuler des congestions et la vulnérabilité évacuation d'établissements recevant du public à grande échelle.",
    category: "Recherche",
    authorId: "res-3",
    image: "https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?auto=format&fit=crop&q=80&w=600",
    date: "2026-03-05",
    status: "Approved",
    featured: false,
    createdAt: "2026-03-05"
  }
];

export const INITIAL_USERS: User[] = [
  {
    id: "usr-dir",
    name: "Pr. Pascal Valentin",
    email: "pascal.valentin@ird.fr",
    role: "Directeur",
    active: true,
    createdAt: "2024-01-10",
    permissions: ["all", "reports.view", "director.supervision", "publications.validate"]
  },
  {
    id: "usr-1",
    name: "Administrateur Système",
    email: "admin@ummisco.sn",
    role: "Admin",
    active: true,
    createdAt: "2023-01-01",
    permissions: ["all"]
  },
  {
    id: "usr-2",
    name: "Pr. Mame Samba Diouf",
    email: "msamba.diouf@ucad.edu.sn",
    role: "Chef d'Axe",
    active: true,
    createdAt: "2024-03-12",
    permissions: ["axes.manage", "publications.validate", "projects.manage"]
  },
  {
    id: "usr-3",
    name: "Dr. Sokhna Thiam",
    email: "sokhna.thiam@ird.fr",
    role: "Chercheur",
    active: true,
    createdAt: "2024-05-15",
    permissions: ["publications.create", "projects.view", "datasets.create"]
  },
  {
    id: "usr-4",
    name: "Secrétaire Scientifique",
    email: "secretariat@ummisco.sn",
    role: "Gestionnaire",
    active: true,
    createdAt: "2025-01-05",
    permissions: ["events.manage", "news.manage", "partners.manage"]
  },
  {
    id: "usr-5",
    name: "Dr. Papa Alioune Sine",
    email: "papaalioune.sine@ucad.edu.sn",
    role: "Chercheur",
    active: true,
    createdAt: "2025-02-18",
    permissions: ["publications.create", "datasets.create"]
  }
];

export const INITIAL_AUDIT_LOGS: AuditLog[] = [
  {
    id: "log-1",
    username: "admin@ummisco.sn",
    action: "Authentification de l'utilisateur réussie",
    ipAddress: "196.207.241.112",
    module: "AUTH",
    timestamp: "2026-06-06T15:24:10Z",
    status: "SUCCESS"
  },
  {
    id: "log-2",
    username: "admin@ummisco.sn",
    action: "Création d'un nouvel utilisateur : secretiat@ummisco.sn",
    ipAddress: "196.207.241.112",
    module: "USERS",
    timestamp: "2026-06-06T15:30:15Z",
    status: "SUCCESS"
  },
  {
    id: "log-3",
    username: "msamba.diouf@ucad.edu.sn",
    action: "Approbation de la publication : Mathematical analysis of a malaria...",
    ipAddress: "196.207.235.14",
    module: "WORKFLOW",
    timestamp: "2026-06-06T14:15:22Z",
    status: "SUCCESS"
  },
  {
    id: "log-4",
    username: "sokhna.thiam@ird.fr",
    action: "Création d'un brouillon d'événement : Séminaire participatif",
    ipAddress: "196.1.13.44",
    module: "EVENTS",
    timestamp: "2026-06-06T12:05:00Z",
    status: "SUCCESS"
  },
  {
    id: "log-5",
    username: "visitor-api",
    action: "Tentative de connexion échouée (Mot de passe incorrect)",
    ipAddress: "41.82.164.200",
    module: "AUTH",
    timestamp: "2026-06-06T09:44:12Z",
    status: "FAILED"
  }
];

export const INITIAL_FUNDING: Funding[] = [
  {
    id: "fund-1",
    sourceId: "part-5",
    amount: 350000,
    currency: "EUR",
    projectId: "proj-1",
    type: "Subvention",
    dateAwarded: "2024-01-10"
  },
  {
    id: "fund-2",
    sourceId: "part-4",
    amount: 480000,
    currency: "USD",
    projectId: "proj-2",
    type: "Contrat de Recherche",
    dateAwarded: "2025-01-15"
  },
  {
    id: "fund-3",
    sourceId: "part-2",
    amount: 180000,
    currency: "EUR",
    projectId: "proj-3",
    type: "Subvention",
    dateAwarded: "2024-06-01"
  }
];

export const INITIAL_IRD_DOCUMENTS: IrdDocument[] = [
  {
    id: "doc-1",
    title: "Demande de bon d'achat d'équipements de calcul haute performance",
    type: "PurchaseRequest",
    amount: 8500,
    envelopeManagerSignature: "Signé électroniquement par Dr. Sokhna Thiam (Responsable d'Enveloppe)",
    status: "Pending",
    createdBy: "res-3",
    createdAt: "2026-05-18",
    signedByDirector: false,
    comments: "Besoin urgent de 4 cartes graphiques GPU pour l'axe IA & Systèmes Complexes."
  },
  {
    id: "doc-2",
    title: "Convention de Stage de recherche de Fatoumata Bamba (Master 2 UCAD)",
    type: "InternshipAgreement",
    studentName: "Fatoumata Bamba",
    university: "Université Cheikh Anta Diop (UCAD)",
    status: "Approved",
    createdBy: "res-1",
    createdAt: "2026-04-10",
    signedByDirector: true,
    comments: "Sujet de stage : Modélisation mathématique du paludisme à Dakar. Convention validée et signée par l'IRD et le Directeur d'UMMISCO."
  },
  {
    id: "doc-3",
    title: "Reçu de Prestation de Service Diagnostic d'Epidémies Horticoles",
    type: "ServiceReceipt",
    amount: 3200,
    status: "Draft",
    createdBy: "res-2",
    createdAt: "2026-06-01",
    signedByDirector: false,
    comments: "Prestation réalisée pour le compte du Ministère de l'Agriculture du Sénégal."
  },
  {
    id: "doc-4",
    title: "Proposition de stage : Simulation participative de la résilience du bétail",
    type: "InternshipProposal",
    studentName: "Moustapha Ndiaye (Master 2 GAMA)",
    university: "Université Gaston Berger de Saint-Louis (UGB)",
    status: "Pending",
    createdBy: "res-5",
    createdAt: "2026-06-03",
    signedByDirector: false,
    comments: "Sujet de stage SMA : Modélisation des chemins de transhumance pastorale face aux aléas pluviométriques."
  }
];

export const INITIAL_COURSES: Course[] = [
  {
    id: "course-1",
    title: "Modélisation Multi-agents avec la plateforme GAMA",
    code: "SYSCOM-501",
    description: "Ce cours enseigne les fondements de la modélisation à base d'agents (ABM). Les étudiants apprendront à developper des simulations spatiales complexes en GAML : gestion de mobilités urbaines, dynamiques d'épidémies, et propagation d'avis sous contraintes géographiques réelles.",
    professorId: "res-1",
    professorName: "Pr. Mame Samba Diouf",
    institution: "SysCom / UCAD",
    credits: 6,
    durationHours: 36,
    level: "Master",
    syllabus: [
      "Introduction à la pensée Complexe et aux Systèmes Multi-agents",
      "Syntaxe GAML de base : agents, espèces, grilles et environnements",
      "Utilisation des données géographiques (shapefiles) et SIG",
      "Élaboration d'architectures d'agents cognitives (BDI)",
      "Projet guidé : simulation d'inondations à Guédiawaye"
    ],
    status: "Approved",
    createdAt: "2026-03-10"
  },
  {
    id: "course-2",
    title: "Épidémiologie Mathématique & Modèles de Compartiments",
    code: "EDMI-603",
    description: "Introduction approfondie aux équations différentielles ordinaires et partielles appliquées à la propagation des agents infectieux. Étude des modèles SIR, SEIR, SIS ainsi que de l'estimation du taux de reproduction de base R0 sous différents scénarios d'interventions publiques.",
    professorId: "res-2",
    professorName: "Dr. Sokhna Thiam",
    institution: "École Doctorale EDMI / UCAD",
    credits: 8,
    durationHours: 40,
    level: "Doctorat",
    syllabus: [
      "Modèles déterministes continus d'épidémiologie",
      "Stabilité linéaire locale et globale des états d'équilibre",
      "Calcul symbolique et numérique du taux R0 (Next Generation Matrix)",
      "Modélisation de pathologies vectorielles (Paludisme, Dengue)",
      "Ajustement de paramètres à partir de données réelles"
    ],
    status: "Approved",
    createdAt: "2026-04-12"
  },
  {
    id: "course-3",
    title: "Intelligence Artificielle et Systèmes Complexes",
    code: "AIMS-405",
    description: "Ce cours explore le croisement entre l'apprentissage automatique moderne et la dynamique des systèmes complexes. Applications directes sur les prévisions climatiques, la résilience des réseaux énergétiques connectés et l'auto-apprentissage d'agents de simulation.",
    professorId: "res-5",
    professorName: "Dr. Alassane Diop",
    institution: "AIMS Sénégal",
    credits: 5,
    durationHours: 32,
    level: "Master",
    syllabus: [
      "Processus auto-organisés et réseaux complexes",
      "Apprentissage par renforcement (Q-Learning) appliqué aux agents",
      "Réseaux de neurones graphiques (GNN) pour systèmes distribués",
      "Modélisation neuronale hybride de processus physiques",
      "Analyse de sensibilité statistique et calibration de modèles"
    ],
    status: "Approved",
    createdAt: "2026-05-01"
  },
  {
    id: "course-4",
    title: "Méthodologie de Recherche en Sciences du Climat",
    code: "ED-UGB-701",
    description: "Séminaire de recherche doctorale sur la rédaction scientifique, la structuration de protocoles de simulation expérimentale, l'ouverture éthique des données de recherche et la revue systématique de littérature selon les normes internationales ACM/IEEE.",
    professorId: "res-3",
    professorName: "Dr. Rama Sy",
    institution: "UGB Saint-Louis & IRD",
    credits: 4,
    durationHours: 24,
    level: "Séminaire",
    syllabus: [
      "Définition d'une problématique de thèse scientifique rigoureuse",
      "Protocoles de reproductibilité computationnelle",
      "Introduction à la science ouverte : FAIR et Open Data",
      "Exercice pratique de peer-review académique comparé",
      "Rédaction de propositions de conventions de financement international"
    ],
    status: "Pending",
    createdAt: "2026-05-20"
  }
];

export const INITIAL_INSCRIPTIONS: Inscription[] = [
  {
    id: "insc-1",
    courseId: "course-1",
    courseTitle: "Modélisation Multi-agents avec la plateforme GAMA",
    studentName: "Mamadou Lamine Diallo",
    studentEmail: "lamine.diallo@ucad.edu.sn",
    studentLevel: "Master",
    motivation: "Je souhaite modéliser la dynamique d'évacuation d'urgence de la presqu'île de Dakar en cas de catastrophe naturelle dans le cadre de mon mémoire de Master 2 SysCom.",
    status: "Approved",
    createdAt: "2026-06-03"
  },
  {
    id: "insc-2",
    courseId: "course-2",
    courseTitle: "Épidémiologie Mathématique & Modèles de Compartiments",
    studentName: "Mariama Ndiaye",
    studentEmail: "mariama.nd@ugb.edu.sn",
    studentLevel: "Doctorant",
    motivation: "Chercheuse en mathématiques de la santé, je veux étendre mes travaux sur la tuberculose au Sénégal par de puissants modèles d'EDOs compartimentaux.",
    status: "Pending",
    createdAt: "2026-06-05"
  }
];

