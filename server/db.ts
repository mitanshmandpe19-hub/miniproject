import fs from 'fs';
import path from 'path';
import bcrypt from 'bcryptjs';

export interface User {
  id: string;
  email: string;
  passwordHash: string;
  name: string;
  createdAt: string;
}

export interface UserPublic {
  id: string;
  email: string;
  name: string;
  createdAt: string;
}

const DATA_DIR = path.join(process.cwd(), 'server', 'data');
const USERS_FILE = path.join(DATA_DIR, 'users.json');

// Ensure data directory exists
function ensureDataDir() {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
  if (!fs.existsSync(USERS_FILE)) {
    fs.writeFileSync(USERS_FILE, JSON.stringify([], null, 2), 'utf-8');
  }
}

// Read all users from disk
export function getAllUsers(): User[] {
  ensureDataDir();
  try {
    const rawData = fs.readFileSync(USERS_FILE, 'utf-8');
    return JSON.parse(rawData) as User[];
  } catch (error) {
    console.error('Error reading users database:', error);
    return [];
  }
}

// Save all users to disk atomically
export function saveUsers(users: User[]): void {
  ensureDataDir();
  const tempFile = `${USERS_FILE}.tmp`;
  fs.writeFileSync(tempFile, JSON.stringify(users, null, 2), 'utf-8');
  fs.renameSync(tempFile, USERS_FILE);
}

// Find user by email (case-insensitive)
export function findUserByEmail(email: string): User | undefined {
  const users = getAllUsers();
  const normalized = email.trim().toLowerCase();
  return users.find((u) => u.email.toLowerCase() === normalized);
}

// Find user by id
export function findUserById(id: string): User | undefined {
  const users = getAllUsers();
  return users.find((u) => u.id === id);
}

// Create new user with hashed password
export async function createUser(data: {
  email: string;
  password: string;
  name?: string;
}): Promise<UserPublic> {
  const email = data.email.trim().toLowerCase();
  const existing = findUserByEmail(email);
  if (existing) {
    throw new Error('An account with this email address already exists.');
  }

  const saltRounds = 10;
  const passwordHash = await bcrypt.hash(data.password, saltRounds);

  const newUser: User = {
    id: `usr_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
    email,
    passwordHash,
    name: data.name?.trim() || email.split('@')[0] || 'User',
    createdAt: new Date().toISOString(),
  };

  const users = getAllUsers();
  users.push(newUser);
  saveUsers(users);

  return toPublicUser(newUser);
}

// Verify password
export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

// Convert user to public representation (strip password hash)
export function toPublicUser(user: User): UserPublic {
  return {
    id: user.id,
    email: user.email,
    name: user.name,
    createdAt: user.createdAt,
  };
}
