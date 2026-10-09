import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { AvatarComponent } from '../../shared/avatar/avatar.component';
import { AVATAR_ICON_OPTIONS } from '../../core/constants/avatar-icons';
import { SECURITY_QUESTION_OPTIONS, CUSTOM_SECURITY_QUESTION_OPTION } from '../../core/constants/security-questions';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, AvatarComponent],
  templateUrl: './profile.component.html',
  styleUrl: './profile.component.css',
})
export class ProfileComponent {
  iconOptions = AVATAR_ICON_OPTIONS;
  questionOptions = SECURITY_QUESTION_OPTIONS;
  customOptionValue = CUSTOM_SECURITY_QUESTION_OPTION;

  username = '';
  displayName = '';
  avatarIcon: string | null = null;

  // Pregunta de seguridad: solo se manda si el usuario completa la respuesta.
  changingSecurity = signal(false);
  selectedQuestion = this.questionOptions[0];
  customQuestion = '';
  securityAnswer = '';

  loading = signal(false);
  error = signal<string | null>(null);
  saved = signal(false);

  constructor(public authService: AuthService) {
    // Se asigna aca adentro (no como valor inicial del campo) porque un
    // campo de la clase se inicializa ANTES que el constructor termine de
    // asignar los parametros (como "authService"), y usarlo antes de eso
    // rompe la compilacion con "used before its initialization".
    this.username = this.authService.currentUser()?.username ?? '';
    this.displayName = this.authService.currentUser()?.displayName ?? '';
    this.avatarIcon = this.authService.currentUser()?.avatarIcon ?? null;
  }

  get isCustomQuestion(): boolean {
    return this.selectedQuestion === this.customOptionValue;
  }

  get finalQuestion(): string {
    return this.isCustomQuestion ? this.customQuestion.trim() : this.selectedQuestion;
  }

  selectIcon(key: string): void {
    this.avatarIcon = this.avatarIcon === key ? null : key;
  }

  submit(): void {
    if (!this.username.trim() || !this.displayName.trim()) return;

    // Solo mandamos la pregunta/respuesta si el usuario abrio esa seccion y
    // completo ambas. Si no, mandamos null y el backend deja todo como estaba.
    let securityQuestion: string | null = null;
    let securityAnswer: string | null = null;
    if (this.changingSecurity() && this.securityAnswer.trim() && this.finalQuestion) {
      securityQuestion = this.finalQuestion;
      securityAnswer = this.securityAnswer.trim();
    }

    this.loading.set(true);
    this.error.set(null);
    this.saved.set(false);

    this.authService
      .updateProfile(this.username.trim(), this.displayName.trim(), this.avatarIcon, securityQuestion, securityAnswer)
      .subscribe({
        next: () => {
          this.loading.set(false);
          this.saved.set(true);
          // despues de guardar, cerramos la seccion y limpiamos la respuesta
          this.changingSecurity.set(false);
          this.securityAnswer = '';
          this.customQuestion = '';
          setTimeout(() => this.saved.set(false), 2500);
        },
        error: (err) => {
          this.loading.set(false);
          this.error.set(err.error?.message ?? 'No se pudo guardar los cambios');
        },
      });
  }
}
