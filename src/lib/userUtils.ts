import fs from 'fs';
import path from 'path';

const usersFilePath = path.join(process.cwd(), 'src/data/users.json');

export async function updateUserApplicationStatus(userId: string, status: string | null, isRejection: boolean = false) {
  try {
    const data = JSON.parse(fs.readFileSync(usersFilePath, 'utf-8'));
    const user = data.users.find((u: any) => u.id === userId);
    
    if (user) {
      user.applicationStatus = status;
      if (isRejection) {
        user.rejectionCount = (user.rejectionCount || 0) + 1;
      }
      fs.writeFileSync(usersFilePath, JSON.stringify(data, null, 2));
      return true;
    }
    return false;
  } catch (error) {
    console.error('Error updating user application status:', error);
    return false;
  }
} 