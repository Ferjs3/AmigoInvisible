import { Injectable } from '@angular/core';
import { AuthService } from './auth.service';
import { Observable } from 'rxjs';
import {
  RoomSummary,
  RoomMode,
  RoomPreview,
  RoomDetail,
  ExclusionResponse,
  MyAssignment,
} from '../models/models';

export interface CreateRoomPayload {
  name: string;
  mode?: RoomMode;
  icon?: string | null;
  suggestedBudget?: number | null;
  eventDate?: string | null;
  place?: string | null;
  notes?: string | null;
}

@Injectable({ providedIn: 'root' })
export class RoomService {
  constructor(private auth: AuthService) {}

  create(payload: CreateRoomPayload): Observable<RoomDetail> {
    return this.auth.request<RoomDetail>('createRoom', payload, true);
  }

  update(roomId: number, payload: CreateRoomPayload): Observable<RoomDetail> {
    return this.auth.request<RoomDetail>('updateRoom', { ...payload, roomId }, true);
  }

  deleteRoom(roomId: number): Observable<void> {
    return this.auth.request<void>('deleteRoom', { roomId }, true);
  }

  myRooms(): Observable<RoomSummary[]> {
    return this.auth.request<RoomSummary[]>('rooms', {}, true);
  }

  preview(code: string): Observable<RoomPreview> {
    return this.auth.request<RoomPreview>('previewRoom', { code }, false);
  }

  join(code: string): Observable<RoomDetail> {
    return this.auth.request<RoomDetail>('joinRoom', { code }, true);
  }

  getDetail(roomId: number): Observable<RoomDetail> {
    return this.auth.request<RoomDetail>('roomDetail', { roomId }, true);
  }

  setReady(roomId: number, ready: boolean): Observable<RoomDetail> {
    return this.auth.request<RoomDetail>('ready', { roomId, ready }, true);
  }

  leave(roomId: number): Observable<void> {
    return this.auth.request<void>('leaveRoom', { roomId }, true);
  }

  removeParticipant(roomId: number, userId: number): Observable<RoomDetail> {
    return this.auth.request<RoomDetail>('removeMember', { roomId, userId }, true);
  }

  listExclusions(roomId: number): Observable<ExclusionResponse[]> {
    return this.auth.request<ExclusionResponse[]>('listExclusions', { roomId }, true);
  }

  addExclusion(roomId: number, giverId: number, receiverId: number): Observable<ExclusionResponse> {
    return this.auth.request<ExclusionResponse>('addExclusion', { roomId, giverId, receiverId }, true);
  }

  removeExclusion(roomId: number, exclusionId: string): Observable<void> {
    return this.auth.request<void>('removeExclusion', { roomId, exclusionId }, true);
  }

  draw(roomId: number): Observable<RoomDetail> {
    return this.auth.request<RoomDetail>('drawRoom', { roomId }, true);
  }

  myAssignment(roomId: number): Observable<MyAssignment> {
    return this.auth.request<MyAssignment>('myAssignment', { roomId }, true);
  }
  mailMyAssignment(roomId: number): Observable<void> {
    return this.auth.request<void>('mailMyAssignment', { roomId }, true);
  }

  savePaper(roomId: number, receiverId: number): Observable<RoomDetail> {
    return this.auth.request<RoomDetail>('savePaper', { roomId, receiverId }, true);
  }
}
