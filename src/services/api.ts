import type { Guest, Hotel, BudgetItem, Vendor, Message, LayoutItem, WeddingSettings, Project, User } from '../types';

const STORAGE_KEY = 'aura_wedding_saas_db';

const defaultSettings: WeddingSettings = {
  song_url: '',
  wedding_date: '2026-11-21',
  ceremony_time: '4:00 PM',
  reception_time: '5:30 PM',
  ceremony_venue: 'Lugar de la ceremonia',
  ceremony_address: 'Dirección de la ceremonia',
  ceremony_maps_url: '',
  reception_venue: 'Lugar de la recepción',
  reception_address: 'Dirección de la recepción',
  reception_maps_url: '',
  parent_bride_father: '', parent_bride_mother: '',
  parent_groom_father: '', parent_groom_mother: '',
  dress_code_note: 'Formal elegante.',
  registry_amazon: '', registry_ml: '', registry_palacio: '',
  rsvp_max_guests: 150,
  notification_email: '',
};

const seedGuests: Guest[] = [
  { id: 'g1', full_name: 'María Fernanda Torres', phone: '+52 442 100 0001', email: 'mafe@example.com', attending_status: 'confirmado', plus_one_count: 1, companion_names: 'Carlos Torres', lodging_needed: true, dietary_notes: 'Vegetariana', guest_message: '¡Muchas felicidades!', table_assignment: 'Mesa 3', admin_notes: '', created_at: '2026-01-15T10:00:00Z' },
  { id: 'g5', full_name: 'Valeria Ruiz', phone: '+52 442 100 0005', email: 'vale@example.com', attending_status: 'confirmado', plus_one_count: 2, companion_names: 'Diego Ruiz, Carla Ruiz', lodging_needed: true, dietary_notes: 'Alérgica a nueces', guest_message: 'Los amo.', table_assignment: 'Mesa 5', admin_notes: '', created_at: '2026-02-05T16:00:00Z' },
];

const seedLayoutItems: LayoutItem[] = [
  { id: 'li1', type: 'entrance', shape: 'rect', x: 350, y: 10, width: 100, height: 40, width_cm: 200, height_cm: 80, rotation: 0, label: 'Entrada', capacity: 0, notes: '', assigned_guests: [] },
  { id: 'li4', type: 'table_round', shape: 'circle', x: 50, y: 200, width: 80, height: 80, width_cm: 150, height_cm: 150, rotation: 0, label: 'Mesa 1', capacity: 8, notes: '', assigned_guests: [], chairs: [] },
];

interface ProjectData {
  project: Project;
  guests: Guest[];
  budget: BudgetItem[];
  vendors: Vendor[];
  messages: Message[];
  layout: LayoutItem[];
}

interface DB {
  user: User | null;
  projects: Record<string, ProjectData>;
  currentProjectId: string | null;
}

function getDB(): DB {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (raw) return JSON.parse(raw);

  const initialProject: Project = {
    id: 'proj-isra-liz',
    name: 'Boda Isra & Liz',
    slug: 'isra-y-liz',
    created_at: new Date().toISOString(),
    is_paid: true,
    settings: { ...defaultSettings, wedding_date: '2026-11-21', ceremony_venue: 'Casa Mädi Bernal' },
  };

  const initial: DB = {
    user: null,
    currentProjectId: 'proj-isra-liz',
    projects: {
      'proj-isra-liz': {
        project: initialProject,
        guests: seedGuests,
        budget: [],
        vendors: [],
        messages: [{ id: 'm1', guest_name: 'Ana & Pedro', message: '¡Estamos muy emocionados por ustedes!', approved: true, created_at: '2026-01-20T12:00:00Z' }],
        layout: seedLayoutItems,
      }
    }
  };
  saveDB(initial);
  return initial;
}

function saveDB(db: DB) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(db));
}

const delay = (ms = 120) => new Promise((r) => setTimeout(r, ms));

export const api = {
  async getProjectBySlug(slug: string): Promise<ProjectData | null> {
    const db = getDB();
    const data = Object.values(db.projects).find(p => p.project.slug === slug);
    return data || null;
  },

  async getCurrentProject(): Promise<Project | null> {
    const db = getDB();
    if (!db.currentProjectId) return null;
    return db.projects[db.currentProjectId].project;
  },

  async getProjects(): Promise<Project[]> {
    const db = getDB();
    return Object.values(db.projects).map(p => p.project);
  },

  async createProject(name: string, slug: string): Promise<Project> {
    await delay(500);
    const db = getDB();
    const id = `proj-${Date.now()}`;
    const newProject: Project = {
      id, name, slug, created_at: new Date().toISOString(), is_paid: false, settings: { ...defaultSettings }
    };
    db.projects[id] = {
      project: newProject, guests: [], budget: [], vendors: [], messages: [], layout: []
    };
    db.currentProjectId = id;
    saveDB(db);
    return newProject;
  },

  async markAsPaid(projectId: string): Promise<void> {
    await delay(800);
    const db = getDB();
    if (db.projects[projectId]) {
      db.projects[projectId].project.is_paid = true;
      saveDB(db);
    }
  },

  async getGuests(): Promise<Guest[]> {
    const db = getDB();
    return db.currentProjectId ? db.projects[db.currentProjectId].guests : [];
  },

  async addGuest(guest: Omit<Guest, 'id' | 'created_at'>): Promise<Guest> {
    const db = getDB();
    if (!db.currentProjectId) throw new Error('No active project');
    const newGuest: Guest = { ...guest, id: `g${Date.now()}`, created_at: new Date().toISOString() };
    db.projects[db.currentProjectId].guests.push(newGuest);
    saveDB(db);
    return newGuest;
  },

  async updateGuest(id: string, updates: Partial<Guest>): Promise<Guest> {
    const db = getDB();
    if (!db.currentProjectId) throw new Error('No active project');
    const projectData = db.projects[db.currentProjectId];
    const idx = projectData.guests.findIndex(g => g.id === id);
    if (idx === -1) throw new Error('Guest not found');
    projectData.guests[idx] = { ...projectData.guests[idx], ...updates };
    saveDB(db);
    return projectData.guests[idx];
  },

  async deleteGuest(id: string): Promise<void> {
    const db = getDB();
    if (!db.currentProjectId) return;
    db.projects[db.currentProjectId].guests = db.projects[db.currentProjectId].guests.filter(g => g.id !== id);
    saveDB(db);
  },

  async getBudget(): Promise<BudgetItem[]> {
    const db = getDB();
    return db.currentProjectId ? db.projects[db.currentProjectId].budget : [];
  },

  async addBudgetItem(item: Omit<BudgetItem, 'id'>): Promise<BudgetItem> {
    const db = getDB();
    const id = db.currentProjectId;
    if (!id) throw new Error('No active project');
    const newItem = { ...item, id: `b${Date.now()}` };
    db.projects[id].budget.push(newItem);
    saveDB(db);
    return newItem;
  },

  async updateBudgetItem(id: string, updates: Partial<BudgetItem>): Promise<BudgetItem> {
    const db = getDB();
    const pid = db.currentProjectId;
    if (!pid) throw new Error('No active project');
    const idx = db.projects[pid].budget.findIndex(b => b.id === id);
    db.projects[pid].budget[idx] = { ...db.projects[pid].budget[idx], ...updates };
    saveDB(db);
    return db.projects[pid].budget[idx];
  },

  async deleteBudgetItem(id: string): Promise<void> {
    const db = getDB();
    if (!db.currentProjectId) return;
    db.projects[db.currentProjectId].budget = db.projects[db.currentProjectId].budget.filter(b => b.id !== id);
    saveDB(db);
  },

  async getVendors(): Promise<Vendor[]> {
    const db = getDB();
    return db.currentProjectId ? db.projects[db.currentProjectId].vendors : [];
  },

  async addVendor(vendor: Omit<Vendor, 'id'>): Promise<Vendor> {
    const db = getDB();
    const pid = db.currentProjectId;
    if (!pid) throw new Error('No active project');
    const newVendor = { ...vendor, id: `v${Date.now()}` };
    db.projects[pid].vendors.push(newVendor);
    saveDB(db);
    return newVendor;
  },

  async updateVendor(id: string, updates: Partial<Vendor>): Promise<Vendor> {
    const db = getDB();
    const pid = db.currentProjectId;
    if (!pid) throw new Error('No active project');
    const idx = db.projects[pid].vendors.findIndex(v => v.id === id);
    db.projects[pid].vendors[idx] = { ...db.projects[pid].vendors[idx], ...updates };
    saveDB(db);
    return db.projects[pid].vendors[idx];
  },

  async deleteVendor(id: string): Promise<void> {
    const db = getDB();
    const pid = db.currentProjectId;
    if (!pid) return;
    db.projects[pid].vendors = db.projects[pid].vendors.filter(v => v.id !== id);
    saveDB(db);
  },

  async getMessages(): Promise<Message[]> {
    const db = getDB();
    return db.currentProjectId ? db.projects[db.currentProjectId].messages : [];
  },

  async addMessage(msg: Omit<Message, 'id' | 'created_at' | 'approved'>): Promise<Message> {
    const db = getDB();
    const pid = db.currentProjectId;
    if (!pid) throw new Error('No active project');
    const newMsg: Message = { ...msg, id: `m${Date.now()}`, approved: false, created_at: new Date().toISOString() };
    db.projects[pid].messages.push(newMsg);
    saveDB(db);
    return newMsg;
  },

  async approveMessage(id: string, approved: boolean): Promise<void> {
    const db = getDB();
    const pid = db.currentProjectId;
    if (!pid) return;
    const msg = db.projects[pid].messages.find(m => m.id === id);
    if (msg) { msg.approved = approved; saveDB(db); }
  },

  async deleteMessage(id: string): Promise<void> {
    const db = getDB();
    const pid = db.currentProjectId;
    if (!pid) return;
    db.projects[pid].messages = db.projects[pid].messages.filter(m => m.id !== id);
    saveDB(db);
  },

  async getLayout(): Promise<LayoutItem[]> {
    const db = getDB();
    return db.currentProjectId ? db.projects[db.currentProjectId].layout : [];
  },

  async saveLayout(items: LayoutItem[]): Promise<void> {
    const db = getDB();
    if (db.currentProjectId) {
      db.projects[db.currentProjectId].layout = items;
      saveDB(db);
    }
  },

  async getSettings(): Promise<WeddingSettings> {
    const db = getDB();
    return db.currentProjectId ? db.projects[db.currentProjectId].project.settings : defaultSettings;
  },

  async updateSettings(updates: Partial<WeddingSettings>): Promise<WeddingSettings> {
    const db = getDB();
    if (db.currentProjectId) {
      const s = db.projects[db.currentProjectId].project.settings;
      db.projects[db.currentProjectId].project.settings = { ...s, ...updates };
      saveDB(db);
      return db.projects[db.currentProjectId].project.settings;
    }
    return defaultSettings;
  },

  async login(password: string): Promise<boolean> {
    await delay(300);
    return password === 'IsraLiz2026' || password === 'admin';
  },

  async getHotels(): Promise<Hotel[]> {
    return [
      { id: 'h1', name: 'Casa Mädi Bernal', description: 'Hotel recomendado.', tier: 'featured', whatsapp_number: '524421234567', website: 'https://casamadi.com', price_range: '$$$', distance: '5 min', notes: '', active: true },
    ];
  },
};
