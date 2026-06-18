import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import * as QRCode from 'qrcode';

@Injectable()
export class QrService {
  private readonly logger = new Logger(QrService.name);
  
  // In-memory fallback database for demo mode
  private static readonly qrRegistry = new Map<string, { scanCount: number; scans: any[] }>();
  private static readonly tokenToDocMap = new Map<string, string>();

  constructor(private readonly prisma: PrismaService) {}

  mapTokenToDoc(token: string, docId: string) {
    QrService.tokenToDocMap.set(token, docId);
  }

  getDocIdForToken(token: string): string | undefined {
    return QrService.tokenToDocMap.get(token);
  }

  // Generate a physical QR code PNG base64 representation
  async generateQrStamp(token: string): Promise<string> {
    const url = `http://localhost:3001/qr/s/${token}`;
    this.logger.log(`Generating QR stamp pointing to: ${url}`);
    
    if (!QrService.qrRegistry.has(token)) {
      QrService.qrRegistry.set(token, { scanCount: 0, scans: [] });
    }

    try {
      const dataUrl = await QRCode.toDataURL(url, {
        color: {
          dark: '#0f172a',  // Dark charcoal matching theme
          light: '#ffffff', // Transparent/White backing
        },
        width: 250,
      });
      return dataUrl;
    } catch (err) {
      this.logger.error('Failed to create QR code', err);
      throw new Error(`QR generation failed: ${err.message}`);
    }
  }

  // Get scan analytics
  async getStats(token: string) {
    const record = QrService.qrRegistry.get(token);
    if (record) {
      return {
        scanCount: record.scanCount,
        scans: record.scans
      };
    }
    // Standard mock data if not registered
    return {
      scanCount: 140,
      scans: [
        { date: 'May 28', scans: 60, location: 'Berlin, DE' },
        { date: 'May 29', scans: 95, location: 'New York, US' },
        { date: 'May 30', scans: 140, location: 'San Francisco, US' }
      ]
    };
  }

  // Track and write scan events logs
  async logScan(token: string, device: string, location: string, country: string): Promise<boolean> {
    this.logger.log(`Scan logged for token: ${token} from ${location} (${device})`);
    
    // Write to in-memory fallback
    const record = QrService.qrRegistry.get(token) || { scanCount: 0, scans: [] };
    record.scanCount++;
    record.scans.push({
      date: new Date().toLocaleDateString([], { month: 'short', day: 'numeric' }),
      scans: record.scanCount,
      location: `${location}, ${country}`,
      device
    });
    QrService.qrRegistry.set(token, record);

    try {
      // Find QrIntelligence node in Prisma DB
      const qrIntel = await this.prisma.qrIntelligence.findUnique({
        where: { qrToken: token }
      });

      if (qrIntel) {
        // Increment scan count & append scan log
        await this.prisma.$transaction([
          this.prisma.qrIntelligence.update({
            where: { id: qrIntel.id },
            data: { scanCount: { increment: 1 } }
          }),
          this.prisma.qrScan.create({
            data: {
              qrIntelligenceId: qrIntel.id,
              device,
              location,
              country
            }
          })
        ]);
        return true;
      }
    } catch (err) {
      this.logger.warn('Prisma QR log write skipped (database unconnected).');
    }
    return true;
  }
}
