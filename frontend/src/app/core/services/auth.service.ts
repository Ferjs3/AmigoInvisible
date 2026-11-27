import { Injectable, computed, signal } from '@angular/core';
import { HttpBackend, HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable, map, tap } from 'rxjs';
import { environment } from '../../../environments/environment';
import { AuthResponse, UserResponse } from '../models/models';

const TOKEN_KEY = 'amigo_invisible_sheets_token';
const USER_KEY = 'amigo_invisible_sheets_user';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly http: HttpClient;

  private readonly currentUserSignal = signal<UserResponse | null>(this.readStoredUser());
  private readonly tokenSignal = signal<string | null>(localStorage.getItem(TOKEN_KEY));

  readonly currentUser = computed(() => this.currentUserSignal());
  readonly isAuthenticated = computed(() => this.tokenSignal() !== null);

  constructor(backend: HttpBackend, private router: Router) {
    this.http = new HttpClient(backend);
  }

  register(username: string, displayName: string, email: string, password: string): Observable<AuthResponse> {
    return this.request<AuthResponse>('register', { username, displayName, email, password })
      .pipe(tap((response) => this.storeSession(response)));
  }

  login(username: string, password: string): Observable<AuthResponse> {
    return this.request<AuthResponse>('login', { username, password })
      .pipe(tap((response) => this.storeSession(response)));
  }

  updateProfile(username: string, displayName: string, email: string, avatarIcon: string | null): Observable<UserResponse> {
    return this.request<UserResponse>('profile', { username, displayName, email, avatarIcon }, true).pipe(
      tap((user) => {
        localStorage.setItem(USER_KEY, JSON.stringify(user));
        this.currentUserSignal.set(user);
      })
    );
  }

  verifyRecovery(username: string, code: string): Observable<void> {
    return this.request<void>('verifyRecovery', { username, code });
  }

  resetPassword(username: string, code: string, newPassword: string): Observable<void> {
    return this.request<void>('resetPassword', { username, code, newPassword });
  }

  request<T>(action: string, payload: object = {}, authenticated = false): Observable<T> {
    const body = JSON.stringify({ ...payload, action, token: authenticated ? this.getToken() : undefined });
    return this.http.post<{ ok: true; data: T } | { ok: false; status: number; message: string }>(
      environment.sheetsUrl, body, { headers: { 'Content-Type': 'text/plain;charset=UTF-8' } }
    ).pipe(map((response) => {
      if (response.ok && 'data' in response) return response.data;
      if (response.ok) {
        throw new HttpErrorResponse({ status: 503, error: { message: 'Actualizá la implementación de Apps Script.' } });
      }
      if (response.status === 401 && authenticated) this.forceLocalLogout();
      throw new HttpErrorResponse({ status: response.status, error: { message: response.message } });
    }));
  }

  // Invalida el token del lado del servidor (asi no queda "vivo" en la base
  // hasta que expire solo) y despues limpia todo localmente.
  logout(): void {
    const hadToken = this.tokenSignal() !== null;

    const finish = () => {
      this.clearLocalSession();
      this.router.navigateByUrl('/login');
    };

    if (!hadToken) {
      finish();
      return;
    }

    this.request<void>('logout', {}, true).subscribe({
      next: finish,
      error: finish, // si el backend no responde, igual cerramos sesion localmente
    });
  }

  // Para cuando el propio interceptor detecta un 401: no vuelve a pegarle
  // a la red (ese token ya no sirve), solo limpia el estado local.
  forceLocalLogout(): void {
    this.clearLocalSession();
    this.router.navigateByUrl('/login');
  }

  getToken(): string | null {
    return this.tokenSignal();
  }

  private clearLocalSession(): void {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    this.tokenSignal.set(null);
    this.currentUserSignal.set(null);
  }

  private storeSession(res: AuthResponse): void {
    localStorage.setItem(TOKEN_KEY, res.token);
    localStorage.setItem(USER_KEY, JSON.stringify(res.user));
    this.tokenSignal.set(res.token);
    this.currentUserSignal.set(res.user);
  }

  private readStoredUser(): UserResponse | null {
    const raw = localStorage.getItem(USER_KEY);
    return raw ? (JSON.parse(raw) as UserResponse) : null;
  }
}
