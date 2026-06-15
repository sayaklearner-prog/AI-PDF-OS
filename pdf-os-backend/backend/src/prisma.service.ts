import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
  async onModuleInit() {
    // Connect to database on startup
    try {
      await this.$connect();
      console.log('Successfully connected to the PDF OS database.');
    } catch (err) {
      console.warn('Prisma Database connection skipped (running in mockup mode).', err);
    }
  }

  async onModuleDestroy() {
    await this.$disconnect();
  }
}
