import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';

type Step = 'code' | 'password' | 'done';

@Component({
  selector: 'app-forgot-password',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './forgot-password.component.html',
  styleUrl: './forgot-password.component.css',
})
export class ForgotPasswordComponent {
  step = signal<Step>('code');

  username = '';
  code = '';
  newPassword = '';
  confirmPassword = '';

  loading = signal(false);
  error = signal<string | null>(null);
  showPassword = signal(false);

  constructor(private authService: AuthService, private router: Router) {}

  verifyCode(): void {
    if (!this.username.trim() || !this.code.trim()) return;
    this.loading.set(true);
    this.error.set(null);

    this.authService.verifyRecovery(this.username.trim(), this.code.trim()).subscribe({
      next: () => {
        this.loading.set(false);
        this.step.set('password');
      },
      error: (err) => {
        this.loading.set(false);
        this.error.set(err.error?.message ?? 'No se pudo validar el código');
      },
    });
  }

  submitReset(): void {
    if (!this.code.trim() || !this.newPassword) return;
    if (this.newPassword.length < 8) {
      this.error.set('La contraseña nueva tiene que tener al menos 8 caracteres');
      return;
    }
    if (this.newPassword !== this.confirmPassword) {
      this.error.set('Las contraseñas no coinciden');
      return;
    }

    this.loading.set(true);
    this.error.set(null);

    this.authService.resetPassword(this.username.trim(), this.code.trim(), this.newPassword).subscribe({
      next: () => {
        this.loading.set(false);
        this.code = '';
        this.newPassword = '';
        this.confirmPassword = '';
        this.step.set('done');
      },
      error: (err) => {
        this.loading.set(false);
        this.error.set(err.error?.message ?? 'No se pudo cambiar la contraseña');
      },
    });
  }

  backToCode(): void {
    this.step.set('code');
    this.code = '';
    this.newPassword = '';
    this.confirmPassword = '';
    this.error.set(null);
  }

  goToLogin(): void {
    this.router.navigateByUrl('/login');
  }
}
