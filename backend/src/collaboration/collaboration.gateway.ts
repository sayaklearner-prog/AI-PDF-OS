import { 
  WebSocketGateway, 
  WebSocketServer, 
  SubscribeMessage, 
  OnGatewayConnection, 
  OnGatewayDisconnect,
  MessageBody,
  ConnectedSocket
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Logger } from '@nestjs/common';

@WebSocketGateway({ cors: { origin: '*' } })
export class CollaborationGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer() server: Server;
  private readonly logger = new Logger(CollaborationGateway.name);

  handleConnection(client: Socket) {
    this.logger.log(`Client connected: ${client.id}`);
  }

  handleDisconnect(client: Socket) {
    this.logger.log(`Client disconnected: ${client.id}`);
    this.server.emit('collaborator-left', { id: client.id });
  }

  // Join a document room for granular broadcasts
  @SubscribeMessage('join-document')
  handleJoinDocument(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { documentId: string; username: string; color: string }
  ) {
    client.join(data.documentId);
    this.logger.log(`User "${data.username}" joined document room: ${data.documentId}`);
    
    // Broadcast user presence
    client.to(data.documentId).emit('collaborator-joined', {
      id: client.id,
      name: data.username,
      color: data.color,
      x: 0,
      y: 0,
      activePage: 0
    });
  }

  // Broadcast mouse cursor coordinates tracking
  @SubscribeMessage('cursor-move')
  handleCursorMove(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { documentId: string; x: number; y: number; page: number }
  ) {
    client.to(data.documentId).emit('cursor-update', {
      id: client.id,
      x: data.x,
      y: data.y,
      page: data.page
    });
  }

  // Broadcast drawing stroke lines or shapes updates
  @SubscribeMessage('draw-annotation')
  handleDrawAnnotation(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { documentId: string; annotation: any }
  ) {
    this.logger.log(`Annotation drawn on room: ${data.documentId}`);
    client.to(data.documentId).emit('annotation-added', data.annotation);
  }
}
