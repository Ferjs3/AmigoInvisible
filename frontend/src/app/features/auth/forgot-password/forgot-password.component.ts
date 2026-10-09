import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';

type Step = 'username' | 'answer' | 'done';

@Component({
  selector: 'app-forgot-password',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './forgot-password.component.html',
  styleUrl: './forgot-password.component.css',
})
export class ForgotPasswordComponent {
  step = signal<Step>('username');

  username = '';
  question = signal('');
  securityAnswer = '';
  newPassword = '';
  confirmPassword = '';

  loading = signal(false);
  error = signal<string | null>(null);
  showPassword = signal(false);

  constructor(private authService: AuthService, private router: Router) {}

  // Paso 1: el usuario escribe su nombre de usuario y le mostramos su pregunta.
  findQuestion(): void {
    if (!this.username.trim()) return;
    this.loading.set(true);
    this.error.set(null);

    this.authService.getSecurityQuestion(this.username.trim()).subscribe({
      next: (res) => {
        this.question.set(res.securityQuestion);
        this.loading.set(false);
        this.step.set('answer');
      },
      error: (err) => {
        this.loading.set(false);
        this.error.set(err.error?.message ?? 'No pudimos encontrar esa cuenta');
      },
    });
  }

  // Paso 2: responde la pregunta y elige la contraseña nueva.
  submitReset(): void {
    if (!this.securityAnswer.trim() || !this.newPassword) return;
    if (this.newPassword.length < 6) {
      this.error.set('La contraseña nueva tiene que tener al menos 6 caracteres');
      return;
    }
    if (this.newPassword !== this.confirmPassword) {
      this.error.set('Las contraseñas no coinciden');
      return;
    }

    this.loading.set(true);
    this.error.set(null);

    this.authService.resetPassword(this.username.trim(), this.securityAnswer.trim(), this.newPassword).subscribe({
      next: () => {
        this.loading.set(false);
        this.step.set('done');
      },
      error: (err) => {
        this.loading.set(false);
        this.error.set(err.error?.message ?? 'No se pudo cambiar la contraseña');
      },
    });
  }

  backToUsername(): void {
    this.step.set('username');
    this.securityAnswer = '';
    this.newPassword = '';
    this.confirmPassword = '';
    this.error.set(null);
  }

  goToLogin(): void {
    this.router.navigateByUrl('/login');
  }
}
