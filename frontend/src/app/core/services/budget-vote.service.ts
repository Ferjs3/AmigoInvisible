import { Injectable } from '@angular/core';
import { AuthService } from './auth.service';
import { Observable } from 'rxjs';
import { BudgetVoteStatus } from '../models/models';

@Injectable({ providedIn: 'root' })
export class BudgetVoteService {
  constructor(private auth: AuthService) {}

  getStatus(roomId: number): Observable<BudgetVoteStatus> {
    return this.auth.request<BudgetVoteStatus>('voteStatus', { roomId }, true);
  }

  open(roomId: number): Observable<BudgetVoteStatus> {
    return this.auth.request<BudgetVoteStatus>('voteOpen', { roomId }, true);
  }

  castVote(roomId: number, amount: number): Observable<BudgetVoteStatus> {
    return this.auth.request<BudgetVoteStatus>('voteCast', { roomId, amount }, true);
  }

  resolveTie(roomId: number, amount: number): Observable<BudgetVoteStatus> {
    return this.auth.request<BudgetVoteStatus>('voteResolve', { roomId, amount }, true);
  }
}
