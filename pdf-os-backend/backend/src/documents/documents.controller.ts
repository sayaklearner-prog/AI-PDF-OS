import { Controller, Post, Body, UploadedFiles, UseInterceptors, Res, Get, Param } from '@nestjs/common';
import { FilesInterceptor } from '@nestjs/platform-express';
import { DocumentsService } from './documents.service';
import { QrService } from '../qr/qr.service';
import { PrismaService } from '../prisma.service';
import * as express from 'express';

@Controller('documents')
export class DocumentsController {
  constructor(
    private readonly documentsService: DocumentsService,
    private readonly qrService: QrService,
    private readonly prisma: PrismaService
  ) {}

  @Post('merge')
  @UseInterceptors(FilesInterceptor('files'))
  async mergeFiles(
    @UploadedFiles() files: Express.Multer.File[],
    @Res() res: express.Response
  ) {
    if (!files || files.length < 2) {
      return res.status(400).json({ error: 'At least 2 PDF files must be provided for merging.' });
    }
    const buffers = files.map(file => file.buffer);
    const mergedBuffer = await this.documentsService.mergeDocuments(buffers);
    
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', 'attachment; filename=merged.pdf');
    return res.send(mergedBuffer);
  }

  @Post('split')
  @UseInterceptors(FilesInterceptor('files'))
  async splitFile(
    @UploadedFiles() files: Express.Multer.File[],
    @Body('ranges') rangesStr: string,
    @Res() res: express.Response
  ) {
    if (!files || files.length === 0) {
      return res.status(400).json({ error: 'A PDF file must be provided for splitting.' });
    }
    // Parse ranges array e.g. "0,1,3" -> [0, 1, 3]
    const ranges = rangesStr.split(',').map(n => parseInt(n.trim()));
    const splitBuffer = await this.documentsService.splitDocument(files[0].buffer, ranges);
    
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', 'attachment; filename=split.pdf');
    return res.send(splitBuffer);
  }

  @Post('compress')
  @UseInterceptors(FilesInterceptor('files'))
  async compressFile(
    @UploadedFiles() files: Express.Multer.File[],
    @Body('quality') quality: 'low' | 'medium' | 'high' | 'extreme',
    @Res() res: express.Response
  ) {
    if (!files || files.length === 0) {
      return res.status(400).json({ error: 'A PDF file must be provided for compression.' });
    }
    const mode = quality || 'medium';
    const result = await this.documentsService.compressDocument(files[0].buffer, mode);
    
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('X-Compression-Ratio', result.ratio.toString());
    res.setHeader('Content-Disposition', `attachment; filename=compressed_${mode}.pdf`);
    return res.send(result.buffer);
  }

  @Post('watermark')
  @UseInterceptors(FilesInterceptor('files'))
  async watermarkFile(
    @UploadedFiles() files: Express.Multer.File[],
    @Body('text') text: string,
    @Body('opacity') opacityStr: string,
    @Res() res: express.Response
  ) {
    if (!files || files.length === 0) {
      return res.status(400).json({ error: 'A PDF file must be provided.' });
    }
    const opacity = opacityStr ? parseFloat(opacityStr) : 0.2;
    const watermarkedBuffer = await this.documentsService.addWatermark(files[0].buffer, text || 'CONFIDENTIAL', opacity);
    
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', 'attachment; filename=watermarked.pdf');
    return res.send(watermarkedBuffer);
  }

  @Post('publish')
  @UseInterceptors(FilesInterceptor('files'))
  async publishFile(
    @UploadedFiles() files: Express.Multer.File[],
    @Res() res: express.Response
  ) {
    if (!files || files.length === 0) {
      return res.status(400).json({ error: 'A PDF file must be provided.' });
    }
    
    const docId = `doc_${Date.now()}`;
    const token = `qr_${Date.now()}_${Math.floor(Math.random() * 1000)}`;

    try {
      // Create User if missing for default
      let user = await this.prisma.user.findFirst();
      if (!user) {
        user = await this.prisma.user.create({
          data: { name: 'Admin', email: 'admin@pdfos.com' }
        });
      }

      // Create Database Document record BEFORE saving file so that contractAnalysis can link to it
      await this.prisma.document.create({
        data: {
          id: docId,
          title: files[0].originalname || 'Uploaded Document',
          fileUrl: `/uploads/${docId}.pdf`,
          fileSize: files[0].size || 1024,
          ownerId: user.id
        }
      });

      // Save file to disk
      await this.documentsService.saveUploadedFile(files[0].buffer, docId);
      
      // Generate QR base64 stamp pointing to redirect gateway
      const qrCodeDataUrl = await this.qrService.generateQrStamp(token);

      // Map QR token to docId so redirect knows where to send visitors
      this.qrService.mapTokenToDoc(token, docId);

      return res.json({
        docId,
        token,
        qrCodeDataUrl,
        redirectUrl: `http://localhost:3001/qr/s/${token}`
      });
    } catch (error) {
      return res.status(500).json({ error: `Cloud publishing failed: ${error.message}` });
    }
  }

  @Get(':id/view')
  async viewFile(
    @Param('id') id: string,
    @Res() res: express.Response
  ) {
    try {
      const buffer = await this.documentsService.getFileBuffer(id);
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', 'inline'); // streams in browser PDF viewer
      return res.send(buffer);
    } catch (err) {
      return res.status(404).json({ error: 'Document not found.' });
    }
  }
}
