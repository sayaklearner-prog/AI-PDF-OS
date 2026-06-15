import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaService } from './prisma.service';

// Module Components
import { DocumentsService } from './documents/documents.service';
import { DocumentsController } from './documents/documents.controller';
import { AiService } from './ai/ai.service';
import { AiController } from './ai/ai.controller';
import { QrService } from './qr/qr.service';
import { QrController } from './qr/qr.controller';
import { CollaborationGateway } from './collaboration/collaboration.gateway';

// Contract Intelligence AI Pipeline
import { ContractPipelineService } from './ai/orchestrator/contract-pipeline.service';
import { OcrService } from './ai/services/ocr.service';
import { VectorService } from './ai/services/vector.service';
import { RiskEngineService } from './ai/services/risk-engine.service';
import { ComparisonService } from './ai/services/comparison.service';
import { ExtractorAgent } from './ai/agents/extractor.agent';
import { RiskAgent } from './ai/agents/risk.agent';
import { SummaryAgent } from './ai/agents/summary.agent';
import { NegotiationAgent } from './ai/agents/negotiation.agent';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
  ],
  controllers: [
    AppController,
    DocumentsController,
    AiController,
    QrController,
  ],
  providers: [
    AppService,
    PrismaService,
    DocumentsService,
    AiService,
    QrService,
    CollaborationGateway,
    
    // Contract Intelligence Pipeline
    ContractPipelineService,
    OcrService,
    VectorService,
    RiskEngineService,
    ComparisonService,
    ExtractorAgent,
    RiskAgent,
    SummaryAgent,
    NegotiationAgent,
  ],
})
export class AppModule {}
