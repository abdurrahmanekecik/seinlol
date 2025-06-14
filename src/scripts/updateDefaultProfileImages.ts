import fs from 'fs';
import path from 'path';
import { getUsers, saveUsers } from '../utils/userUtils';
import { v4 as uuidv4 } from 'uuid';

const DEFAULT_PROFILE_IMAGE_PATH = path.join(process.cwd(), 'src', 'data', 'defaultProfileImage.json');

async function updateDefaultProfileImages() {
  // Load all users
  const users = getUsers();
  let updatedCount = 0;

  // Read the new default profile image URL
  let newDefaultImage = '/images/users/default.jpg';
  try {
    if (fs.existsSync(DEFAULT_PROFILE_IMAGE_PATH)) {
      const json = JSON.parse(fs.readFileSync(DEFAULT_PROFILE_IMAGE_PATH, 'utf-8'));
      if (json.url) newDefaultImage = json.url;
    }
  } catch (error) {
    console.error('Error reading default profile image:', error);
  }

  // Iterate over each user
  for (const user of users) {
    // Check if the user registered with a username (email is empty or undefined)
    if (!user.email) {
      // Check if the current image is empty or the old default image
      if (!user.image || user.image === '/images/users/default.png' || user.image === '/images/users/default.jpg') {
        user.image = newDefaultImage;
        updatedCount++;
      }
    }
  }

  // Save the updated users
  saveUsers(users);
  console.log(`Updated ${updatedCount} users with the new default profile image.`);
}

async function cleanUpDiscordIds() {
  const users = getUsers();
  let cleanedCount = 0;

  for (const user of users) {
    // Sadece email yoksa (yani normal kullanıcıysa) kontrol et
    if (!user.email) {
      // Eğer id alanı 18 haneli rakam veya sadece rakamlardan oluşuyorsa, uuid ile değiştir
      if (/^\d{18,}$/.test(user.id) || /^\d+$/.test(user.id)) {
        user.id = uuidv4();
        cleanedCount++;
      }
      // discordId, provider, providerAccountId gibi alanları sil
      delete (user as any).discordId;
      delete (user as any).provider;
      delete (user as any).providerAccountId;
    }
  }

  saveUsers(users);
  console.log(`Temizlenen kullanıcı sayısı: ${cleanedCount}`);
}

updateDefaultProfileImages().catch(console.error);
cleanUpDiscordIds().catch(console.error); 