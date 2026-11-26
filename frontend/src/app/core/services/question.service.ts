import { Injectable } from '@angular/core';
import { AuthService } from './auth.service';
import { Observable } from 'rxjs';
import { AskedQuestionResponse, QuestionResponse } from '../models/models';

@Injectable({ providedIn: 'root' })
export class QuestionService {
  constructor(private auth: AuthService) {}

  getAskedByMe(roomId: number): Observable<AskedQuestionResponse[]> {
    return this.auth.request<AskedQuestionResponse[]>('questionsAsked', { roomId }, true);
  }

  getReceivedByMe(roomId: number): Observable<QuestionResponse[]> {
    return this.auth.request<QuestionResponse[]>('questionsReceived', { roomId }, true);
  }

  ask(roomId: number, questionText: string): Observable<AskedQuestionResponse> {
    return this.auth.request<AskedQuestionResponse>('questionAsk', { roomId, questionText }, true);
  }

  answer(roomId: number, questionId: number, answerText: string): Observable<QuestionResponse> {
    return this.auth.request<QuestionResponse>('questionAnswer', { roomId, questionId, answerText }, true);
  }
}
