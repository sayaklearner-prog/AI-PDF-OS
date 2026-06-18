import { Controller, Post, Body, Get, Param, Res } from '@nestjs/common';
import { QrService } from './qr.service';
import * as express from 'express';

@Controller('qr')
export class QrController {
  constructor(private readonly qrService: QrService) {}

  @Post('generate')
  async generateQr(@Body('token') token: string) {
    const dataUrl = await this.qrService.generateQrStamp(token || 'default_qr_lease');
    return { dataUrl };
  }

  @Post('scan')
  async logScan(
    @Body('token') token: string,
    @Body('device') device: string,
    @Body('location') location: string,
    @Body('country') country: string
  ) {
    const success = await this.qrService.logScan(
      token, 
      device || 'Unknown Mobile', 
      location || 'San Francisco, US', 
      country || 'US'
    );
    return { success };
  }

  // Redirect gateway shortcut
  @Get('s/:token')
  async redirectGateway(@Param('token') token: string, @Res() res: express.Response) {
    // Increment scan log
    await this.qrService.logScan(token, 'Web Browser', 'Redirect Gateway', 'Global');
    
    const docId = this.qrService.getDocIdForToken(token);
    if (docId) {
      // Redirect directly to the PDF stream viewer in the browser!
      return res.redirect(`http://localhost:3001/documents/${docId}/view`);
    }

    // Redirect user to the local dashboard with scan token
    return res.redirect(`http://localhost:3000/?qr=${token}`);
  }

  // Get QR stats endpoint
  @Get('stats/:token')
  async getStats(@Param('token') token: string) {
    return this.qrService.getStats(token);
  }
}
