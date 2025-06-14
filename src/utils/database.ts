import fs from 'fs';
import path from 'path';

// Types
export interface User {
  id: string;
  name: string;
  avatar: string;
}

export interface Activity {
  id?: string;
  type: 'profile' | 'server' | 'announcement';
  timestamp?: string;
  user: User;
  action: string;
}

// Database file paths
const DB_DIR = path.join(process.cwd(), 'data');
const ACTIVITIES_FILE = path.join(DB_DIR, 'activities.json');

// Ensure database directory exists
if (!fs.existsSync(DB_DIR)) {
  fs.mkdirSync(DB_DIR, { recursive: true });
}

// Ensure activities file exists
if (!fs.existsSync(ACTIVITIES_FILE)) {
  fs.writeFileSync(ACTIVITIES_FILE, JSON.stringify([], null, 2));
}

// Read activities from database
const readActivities = (): Activity[] => {
  try {
    const data = fs.readFileSync(ACTIVITIES_FILE, 'utf-8');
    return JSON.parse(data);
  } catch (error) {
    console.error('Error reading activities:', error);
    return [];
  }
};

// Write activities to database
const writeActivities = (activities: Activity[]): void => {
  try {
    fs.writeFileSync(ACTIVITIES_FILE, JSON.stringify(activities, null, 2));
  } catch (error) {
    console.error('Error writing activities:', error);
  }
};

// Add a new activity
export const addActivity = async (activity: Activity): Promise<Activity> => {
  const activities = readActivities();
  const newActivity = {
    ...activity,
    id: Math.random().toString(36).substr(2, 9),
    timestamp: new Date().toISOString()
  };
  activities.unshift(newActivity);
  // Sadece son 4 aktiviteyi tut
  const trimmedActivities = activities.slice(0, 4);
  writeActivities(trimmedActivities);
  return newActivity;
};

// Get recent activities
export const getActivities = async (limit: number = 10): Promise<Activity[]> => {
  const activities = readActivities();
  return activities.slice(0, limit);
};

export interface ServerStatus {
  isOnline: boolean;
  playerCount: number;
  lastUpdated: string;
}

export interface Announcement {
  id: string;
  title: string;
  description: string;
  isImportant: boolean;
  adminId?: string;
  adminName?: string;
  adminImage?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Database {
  serverStatus: ServerStatus;
  activities: Activity[];
  announcements: Announcement[];
}

export async function readDatabase(): Promise<Database> {
  const data = await fs.promises.readFile(ACTIVITIES_FILE, 'utf-8');
  return JSON.parse(data);
}

export async function writeDatabase(data: Database): Promise<void> {
  await fs.promises.writeFile(ACTIVITIES_FILE, JSON.stringify(data, null, 2));
}

export async function updateServerStatus(status: Partial<ServerStatus>): Promise<ServerStatus> {
  const db = await readDatabase();
  db.serverStatus = {
    ...db.serverStatus,
    ...status,
    lastUpdated: new Date().toISOString()
  };
  await writeDatabase(db);
  return db.serverStatus;
}

export async function getAnnouncements(limit = 5): Promise<Announcement[]> {
  const db = await readDatabase();
  return db.announcements.slice(0, limit);
} 