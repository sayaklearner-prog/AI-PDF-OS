import { Controller, Get, Param, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma.service';

@Controller('pendo')
export class PendoController {
  constructor(private readonly prisma: PrismaService) {}

  @Get('visitor/:userId')
  async getVisitorMetadata(@Param('userId') userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: {
        workspaces: {
          include: { workspace: true },
          take: 1,
        },
      },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    const workspace = user.workspaces[0]?.workspace;

    const pendoPayload: Record<string, unknown> = {
      visitor: {
        id: user.id,
        email: user.email,
        full_name: user.name,
        role: user.role,
        plan: user.plan,
        createdAt: user.createdAt.toISOString(),
        updatedAt: user.updatedAt.toISOString(),
      },
    };

    if (workspace) {
      pendoPayload.account = {
        id: workspace.id,
        name: workspace.name,
        createdAt: workspace.createdAt.toISOString(),
        updatedAt: workspace.updatedAt.toISOString(),
      };
    }

    return pendoPayload;
  }
}
