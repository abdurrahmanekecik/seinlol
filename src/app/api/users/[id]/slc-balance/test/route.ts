import { NextRequest, NextResponse } from 'next/server';

// Discord Bot API URL from environment variable
const DISCORD_BOT_API_URL = process.env.DISCORD_BOT_API_URL || 'http://localhost:80';

// Bu endpoint doğrudan Discord botu ile iletişim kurar ve bakiyeyi test eder
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const userId = params.id;
    const searchParams = request.nextUrl.searchParams;
    const amount = Number(searchParams.get('amount') || 0);
    
    if (!userId) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 });
    }
    
    console.log(`[SLC TEST API] Testing balance for user ${userId}`);
    
    // Direkt olarak Discord bot API'sine bağlan
    const balanceEndpoint = `${DISCORD_BOT_API_URL}/users/${userId}/balance`;
    console.log(`[SLC TEST API] Requesting from: ${balanceEndpoint}`);
    
    // Bakiyeyi getir
    const response = await fetch(balanceEndpoint);
    
    if (!response.ok) {
      console.error(`[SLC TEST API] Error response: ${response.status} ${response.statusText}`);
      return NextResponse.json({
        error: 'Failed to fetch SLC balance',
        botApiUrl: DISCORD_BOT_API_URL,
        endpoint: balanceEndpoint,
        status: response.status
      }, { status: response.status });
    }
    
    const data = await response.json();
    console.log(`[SLC TEST API] Balance data:`, data);
    
    let updatedBalance = data.balance;
    
    // Eğer miktar belirtildiyse, bakiyeyi güncelle
    if (amount !== 0) {
      console.log(`[SLC TEST API] Updating balance by ${amount}`);
      
      const updateResponse = await fetch(`${DISCORD_BOT_API_URL}/users/${userId}/balance`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ amount })
      });
      
      if (!updateResponse.ok) {
        console.error(`[SLC TEST API] Error updating balance:`, await updateResponse.text());
        return NextResponse.json({
          error: 'Failed to update balance',
          original: data,
          status: updateResponse.status
        }, { status: updateResponse.status });
      }
      
      const updateData = await updateResponse.json();
      updatedBalance = updateData.balance;
      console.log(`[SLC TEST API] Updated balance:`, updateData);
    }
    
    return NextResponse.json({
      originalBalance: data.balance,
      updatedBalance,
      botApiUrl: DISCORD_BOT_API_URL,
      command: amount !== 0 ? `Updated by ${amount}` : "Viewed only",
      userId,
      success: true
    });
    
  } catch (error) {
    console.error('[SLC TEST API] Error:', error);
    return NextResponse.json({
      error: 'Error in test endpoint',
      details: error instanceof Error ? error.message : String(error),
      botApiUrl: DISCORD_BOT_API_URL
    }, { status: 500 });
  }
} 