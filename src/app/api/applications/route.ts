import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import { updateUserApplicationStatus } from '@/lib/userUtils';

const applicationsFilePath = path.join(process.cwd(), 'src/data/applications.json');
const usersFilePath = path.join(process.cwd(), 'src/data/users.json');
const activitiesFilePath = path.join(process.cwd(), 'src/data/activities.json');

// Tip tanımlamaları
interface ApplicationBody {
  userId: string;
  userName: string;
  userImage: string;
  discordId: string;
  personalInfo: {
    fullName: string;
    age: string;
    howFound: string;
    factionExperience: string;
    whyUs: string;
    pcSpecs: string;
    contentCreator: string;
  };
  characterInfo: {
    characterName: string;
    characterAge: string;
    characterStory: string;
    strengthsWeaknesses: string;
    occupation: string;
    birthplaceEthnicity: string;
    physicalAppearance: string;
    uniqueTraits: string;
    hobbiesPhobias: string;
  };
  scenarioAnswers: {
    scenario1: string;
    scenario2: string;
    scenario3: string;
    scenario4: string;
    scenario5: string;
  };
}

interface UpdateApplicationBody {
  applicationId: string;
  status: 'approved' | 'rejected';
}

// Karakter adını formatlayan yardımcı fonksiyon
function formatCharacterName(name: string) {
  return name.split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ');
}

// Discord bot API'sine bildirim gönder
async function notifyDiscordBot(endpoint: string, data: any) {
  try {
    // Eğer karakter adı varsa formatla
    if (data.characterName) {
      data.characterName = formatCharacterName(data.characterName);
    }

    const response = await fetch(`${process.env.DISCORD_BOT_URL}/notify/${endpoint}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      throw new Error(`Discord notification failed: ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Error notifying Discord:', error);
    throw error;
  }
}

// Aktivite ekle
async function addActivity(userId: string, userName: string, userAvatar: string, action: string) {
  try {
    const activities = JSON.parse(fs.readFileSync(activitiesFilePath, 'utf-8'));
    const newActivity = {
      type: 'application',
      user: {
        id: userId,
        name: userName,
        avatar: userAvatar
      },
      action,
      id: Math.random().toString(36).substr(2, 9),
      timestamp: new Date().toISOString()
    };
    
    activities.unshift(newActivity);
    fs.writeFileSync(activitiesFilePath, JSON.stringify(activities, null, 2));
  } catch (error) {
    console.error('Error adding activity:', error);
  }
}

// Kullanıcının başvuru limitini kontrol et
async function checkUserApplicationLimit(userId: string): Promise<boolean> {
  try {
    const data = JSON.parse(fs.readFileSync(usersFilePath, 'utf-8'));
    const user = data.users.find((u: any) => u.id === userId);
    
    if (!user) {
      return true;
    }

    const applications = JSON.parse(fs.readFileSync(applicationsFilePath, 'utf-8'));
    const existingApplication = applications.applications.find(
      (app: any) => app.userId === userId && app.status === 'pending'
    );

    if (existingApplication) {
      throw new Error('Zaten bekleyen bir başvurunuz bulunmaktadır.');
    }

    return user.rejectionCount < 3;
  } catch (error) {
    if (error instanceof Error) {
      throw error;
    }
    throw new Error('Başvuru limiti kontrol edilirken bir hata oluştu.');
  }
}

// Başvuruları getir
export async function GET() {
  try {
    const data = JSON.parse(fs.readFileSync(applicationsFilePath, 'utf-8'));
    return NextResponse.json(data.applications);
  } catch (error) {
    return NextResponse.json({ error: 'Başvurular yüklenirken hata oluştu' }, { status: 500 });
  }
}

// Başvuru durumunu güncelle
export async function PUT(req: Request) {
  try {
    const body = await req.json() as UpdateApplicationBody & {
      adminId: string;
      adminName: string;
      rejectReason?: string;
    };
    const { applicationId, status, adminId, adminName, rejectReason } = body;

    const applications = JSON.parse(fs.readFileSync(applicationsFilePath, 'utf-8'));
    const applicationIndex = applications.applications.findIndex((app: any) => app.id === applicationId);

    if (applicationIndex === -1) {
      return NextResponse.json(
        { error: 'Başvuru bulunamadı.' },
        { status: 404 }
      );
    }

    const application = applications.applications[applicationIndex];
    application.status = status;
    application.updatedAt = new Date().toISOString();
    application.adminId = adminId;
    application.adminName = adminName;
    if (rejectReason) {
      application.rejectReason = rejectReason;
    }

    applications.applications[applicationIndex] = application;
    fs.writeFileSync(applicationsFilePath, JSON.stringify(applications, null, 2));

    // Kullanıcı durumunu güncelle
    await updateUserApplicationStatus(application.userId, status);

    // Aktivite ekle
    const actionText = status === 'approved' 
      ? 'Başvuru onaylandı'
      : `Başvuru reddedildi${rejectReason ? ` (${rejectReason})` : ''}`;
    await addActivity(application.userId, application.userName, application.userImage, actionText);

    // Discord bildirimi gönder
    try {
      if (status === 'approved') {
        await notifyDiscordBot('approve', {
          userId: application.discordId,
          userName: application.userName,
          characterName: application.characterInfo.characterName,
          adminId,
          adminName
        });
      } else if (status === 'rejected') {
        await notifyDiscordBot('reject', {
          userId: application.discordId,
          userName: application.userName,
          adminId,
          adminName,
          rejectReason
        });
      }
    } catch (error) {
      console.error('Discord bildirimi gönderilirken hata:', error);
      // Discord hatası olsa bile başvuru güncellendi
    }

    return NextResponse.json(application);
  } catch (error) {
    console.error('Error updating application:', error);
    return NextResponse.json(
      { error: 'Başvuru güncellenirken bir hata oluştu.' },
      { status: 500 }
    );
  }
}

// Yeni başvuru ekle
export async function POST(req: Request) {
  try {
    const body = await req.json() as ApplicationBody;
    const { userId, userName, userImage, discordId, personalInfo, characterInfo, scenarioAnswers } = body;

    // Kullanıcı başvuru limitini kontrol et
    const canApply = await checkUserApplicationLimit(userId);
    if (!canApply) {
      return NextResponse.json(
        { error: 'Başvuru limitinize ulaştınız. Lütfen daha sonra tekrar deneyin.' },
        { status: 400 }
      );
    }

    // Başvuruyu kaydet
    const applications = JSON.parse(fs.readFileSync(applicationsFilePath, 'utf-8'));
    const newApplication = {
      id: Math.random().toString(36).substr(2, 9),
      userId,
      userName,
      userImage,
      discordId,
      personalInfo,
      characterInfo,
      scenarioAnswers,
      status: 'pending',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    applications.applications.push(newApplication);
    fs.writeFileSync(applicationsFilePath, JSON.stringify(applications, null, 2));

    // Aktivite ekle
    await addActivity(userId, userName, userImage, 'Yeni başvuru gönderdi');

    // Discord bildirimi gönder
    try {
      await notifyDiscordBot('submit', {
        userId: discordId,
        userName: userName
      });
    } catch (error) {
      console.error('Discord bildirimi gönderilirken hata:', error);
      // Discord hatası olsa bile başvuru kaydedildi
    }

    return NextResponse.json(newApplication);
  } catch (error) {
    console.error('Error creating application:', error);
    if (error instanceof Error && error.message) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }
    return NextResponse.json(
      { error: 'Başvuru oluşturulurken bir hata oluştu.' },
      { status: 500 }
    );
  }
}