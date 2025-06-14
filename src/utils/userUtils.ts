import fs from 'fs';
import path from 'path';
import { hash } from 'bcryptjs';
import { v4 as uuidv4 } from 'uuid';

const USER_FILE_PATH = path.join(process.cwd(), 'src', 'data', 'users.json');
const DEFAULT_PROFILE_IMAGE_PATH = path.join(process.cwd(), 'src', 'data', 'defaultProfileImage.json');

export interface User {
  id: string;
  name?: string;
  email?: string;
  password?: string;
  image?: string;
  role?: string;
  createdAt?: string;
  lastLogin?: string;
  coin?: number;
  joinedAt?: string;
  isBanned?: boolean;
}

// Kullanıcıları JSON dosyasından yükle
export const getUsers = (): User[] => {
  try {
    if (!fs.existsSync(USER_FILE_PATH)) {
      // Dosya yoksa boş bir users dizisi içeren obje oluştur
      fs.writeFileSync(USER_FILE_PATH, JSON.stringify({ users: [] }), 'utf-8');
      return [];
    }
    const data = fs.readFileSync(USER_FILE_PATH, 'utf-8');
    const parsed = JSON.parse(data);
    // Eğer dosya içinde users dizisi varsa onu döndür, yoksa boş dizi döndür
    return Array.isArray(parsed) ? parsed : (parsed.users || []);
  } catch (error) {
    console.error('Error loading users:', error);
    return [];
  }
};

// Kullanıcıları JSON dosyasına kaydet
export const saveUsers = (users: User[]): void => {
  try {
    // Mevcut dosya yapısını koru (users dizisini bir obje içinde sakla)
    fs.writeFileSync(USER_FILE_PATH, JSON.stringify({ users }, null, 2), 'utf-8');
  } catch (error) {
    console.error('Error saving users:', error);
  }
};

// Kullanıcı adı ile kullanıcı bul
export const getUserByUsername = (username: string): User | null => {
  try {
    //console.log('getUserByUsername called with:', username);
    const users = getUsers();
    //console.log('Total users:', users.length);
    
    const user = users.find(u => {
      const userName = (u.name || '').toLowerCase();
      const searchName = username.toLowerCase();
      console.log('Comparing:', userName, searchName);
      return userName === searchName;
    });
    
   // console.log('Found user:', user);
    return user || null;
  } catch (error) {
    console.error('Error in getUserByUsername:', error);
    return null;
  }
};

// ID ile kullanıcı bul
export const getUserById = async (id: string): Promise<User | null> => {
  try {
    //console.log(`getUserById çağrıldı, ID: ${id}`);
    const users = getUsers();
    
    //console.log(`getUsers sonuç: ${users.length} kullanıcı bulundu`);
    
    if (!Array.isArray(users)) {
      console.error('getUserById: users bir dizi değil!');
      return null;
    }
    
    const user = users.find(u => u.id === id);
    
    if (user) {
      //console.log(`Kullanıcı bulundu: ${user.name}`);
    } else {
      //console.error(`${id} ID'li kullanıcı bulunamadı`);
    }
    
    return user || null;
  } catch (error) {
    console.error('getUserById fonksiyonunda hata:', error);
    return null;
  }
};

// Yeni kullanıcı oluştur
export const createUser = async (userData: {
  username: string;
  password: string;
}): Promise<User | null> => {
  // Kullanıcının zaten var olup olmadığını kontrol et
  const existingUser = getUserByUsername(userData.username);
  if (existingUser) {
    return null;
  }

  // Şifreyi hashle
  const hashedPassword = await hash(userData.password, 10);

  // Default profil resmini oku
  let defaultImage = '/images/users/default.png';
  try {
    const defaultImagePath = path.join(process.cwd(), 'src', 'data', 'defaultProfileImage.json');
    if (fs.existsSync(defaultImagePath)) {
      const json = JSON.parse(fs.readFileSync(defaultImagePath, 'utf-8'));
      if (json.url) defaultImage = json.url;
    }
  } catch (error) {
    console.error('Error reading default profile image:', error);
  }

  // Yeni kullanıcı oluştur
  const newUser: User = {
    id: uuidv4(),
    name: userData.username,
    email: '',
    password: hashedPassword,
    role: 'Üye',
    image: defaultImage, // Default resmi kullan
    createdAt: new Date().toISOString(),
    joinedAt: new Date().toISOString(),
    lastLogin: new Date().toISOString(),
    coin: 0, // Coin alanı eklendi
    isBanned: false,
  };

  // Kullanıcıları yükle, yeni kullanıcıyı ekle ve kaydet
  const users = getUsers();
  users.push(newUser);
  saveUsers(users);

  return newUser;
};

// Kullanıcı güncelle
export const updateUser = async (id: string, updates: Partial<User>): Promise<User | null> => {
  try {
    const users = getUsers();
    const userIndex = users.findIndex(u => u.id === id);
    
    if (userIndex === -1) {
      return null;
    }

    // Güncellemeyi uygula
    users[userIndex] = { 
      ...users[userIndex], 
      ...updates,
      // Bazı alanları koru
      id: users[userIndex].id,
      createdAt: users[userIndex].createdAt,
      joinedAt: users[userIndex].joinedAt
    };
    
    saveUsers(users);
    return users[userIndex];
  } catch (error) {
    console.error('Error updating user:', error);
    return null;
  }
};

// Profil resmi güncelle
export const updateProfileImage = async (userId: string, imageUrl: string): Promise<User | null> => {
  const users = getUsers();
  const userIndex = users.findIndex(u => u.id === userId);
  
  if (userIndex === -1) {
    return null;
  }

  // URL validasyonu kaldırıldı, her türlü string kaydedilebilir
  users[userIndex].image = imageUrl;
  saveUsers(users);

  return users[userIndex];
};

export async function updateUserRole(userId: string, role: string): Promise<User | null> {
  try {
    const users = getUsers();
    const userIndex = users.findIndex(u => u.id === userId);
    
    if (userIndex === -1) {
      return null;
    }
    
    users[userIndex].role = role;
    saveUsers(users);
    
    return users[userIndex];
  } catch (error) {
    console.error('Error updating user role:', error);
    return null;
  }
}
