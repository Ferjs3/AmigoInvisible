import { Injectable } from '@angular/core';
import { AuthService } from './auth.service';
import { Observable } from 'rxjs';
import { WishlistItem } from '../models/models';

export interface WishlistItemPayload {
  title: string;
  note?: string | null;
  url?: string | null;
}

@Injectable({ providedIn: 'root' })
export class WishlistService {
  constructor(private auth: AuthService) {}

  getWishlist(roomId: number, userId: number): Observable<WishlistItem[]> {
    return this.auth.request<WishlistItem[]>('wishList', { roomId, userId }, true);
  }

  addItem(roomId: number, payload: WishlistItemPayload): Observable<WishlistItem> {
    return this.auth.request<WishlistItem>('wishAdd', { ...payload, roomId }, true);
  }

  updateItem(roomId: number, itemId: number, payload: WishlistItemPayload): Observable<WishlistItem> {
    return this.auth.request<WishlistItem>('wishUpdate', { ...payload, roomId, itemId }, true);
  }

  deleteItem(roomId: number, itemId: number): Observable<void> {
    return this.auth.request<void>('wishDelete', { roomId, itemId }, true);
  }
}
