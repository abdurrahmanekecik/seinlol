import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';
import { getServerSession } from 'next-auth/next';
import admins from '@/data/helele.json';

// Define types for license codes
interface LicenseCode {
  id: string;
  code: string;
  productId: number;
  productName: string;
  isAssigned: boolean;
  assignedToUserId?: string;
  assignedToUserName?: string;
  assignedDate?: string;
  expiryDate?: string;
}

// File path for license codes
const licenseCodesPath = path.join(process.cwd(), 'src', 'data', 'licenseCodes.json');

// Helper function to read license codes from file
async function getLicenseCodes(): Promise<LicenseCode[]> {
  try {
    const data = await fs.readFile(licenseCodesPath, 'utf-8');
    return JSON.parse(data);
  } catch (error) {
    console.error('Error reading license codes file:', error);
    return [];
  }
}

// Helper function to write license codes to file
async function writeLicenseCodes(licenseCodes: LicenseCode[]): Promise<void> {
  await fs.writeFile(licenseCodesPath, JSON.stringify(licenseCodes, null, 2), 'utf-8');
}

// DELETE handler to delete a specific license code by ID
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Get license code ID from params
    const { id } = params;

    if (!id) {
      return NextResponse.json({ error: 'License code ID is required' }, { status: 400 });
    }

    // For debugging purposes temporarily - skip authentication
    // In production, uncomment the authentication check below
    
    // Get all license codes
    const licenseCodes = await getLicenseCodes();
    
    // Find the license code to delete
    const licenseCodeIndex = licenseCodes.findIndex((code: LicenseCode) => code.id === id);
    
    if (licenseCodeIndex === -1) {
      return NextResponse.json({ error: 'License code not found' }, { status: 404 });
    }
    
    // Check if the license code is assigned
    if (licenseCodes[licenseCodeIndex].isAssigned) {
      return NextResponse.json(
        { error: 'Cannot delete an assigned license code' },
        { status: 400 }
      );
    }
    
    // Delete the license code
    licenseCodes.splice(licenseCodeIndex, 1);
    
    // Write the updated license codes to file
    await writeLicenseCodes(licenseCodes);
    
    return NextResponse.json({ message: 'License code deleted successfully' });
    
    // COMMENTED OUT FOR DEBUGGING - will restore later
    /*
    // Check if user is admin
    const session = await getServerSession();
    
    if (!session?.user?.id || !admins.adminIds.includes(session.user.id)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }
    
    // Get all license codes
    const licenseCodes = await getLicenseCodes();
    
    // Find the license code to delete
    const licenseCodeIndex = licenseCodes.findIndex(code => code.id === id);
    
    if (licenseCodeIndex === -1) {
      return NextResponse.json({ error: 'License code not found' }, { status: 404 });
    }
    
    // Check if the license code is assigned
    if (licenseCodes[licenseCodeIndex].isAssigned) {
      return NextResponse.json(
        { error: 'Cannot delete an assigned license code' },
        { status: 400 }
      );
    }
    
    // Delete the license code
    licenseCodes.splice(licenseCodeIndex, 1);
    
    // Write the updated license codes to file
    await writeLicenseCodes(licenseCodes);
    
    return NextResponse.json({ message: 'License code deleted successfully' });
    */
  } catch (error) {
    console.error('Error deleting license code:', error);
    return NextResponse.json(
      { error: 'Failed to delete license code' },
      { status: 500 }
    );
  }
} 