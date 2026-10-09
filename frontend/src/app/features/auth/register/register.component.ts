import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { SECURITY_QUESTION_OPTIONS, CUSTOM_SECURITY_QUESTION_OPTION } from '../../../core/constants/security-questions';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './register.component.html',
  styleUrl: './register.component.css',
})
export class RegisterComponent {
  questionOptions = SECURITY_QUESTION_OPTIONS;
  customOptionValue = CUSTOM_SECURITY_QUESTION_OPTION;

  username = '';
  displayName = '';
  email = '';
  password = '';
  selectedQuestion = this.questionOptions[0];
  customQuestion = '';
  securityAnswer = '';

  loading = signal(false);
  error = signal<string | null>(null);
  showPassword = signal(false);

  constructor(
    private authService: AuthService,
    private router: Router,
    private route: ActivatedRoute
  ) {}

  get isCustomQuestion(): boolean {
    return this.selectedQuestion === this.customOptionValue;
  }

  get finalQuestion(): string {
    return this.isCustomQuestion ? this.customQuestion.trim() : this.selectedQuestion;
  }

  submit(): void {
    if (!this.username || !this.displayName || !this.email || !this.password) return;
    if (!this.finalQuestion || !this.securityAnswer.trim()) return;

    this.loading.set(true);
    this.error.set(null);

    this.authService
      .register(this.username, this.displayName, this.email, this.password, this.finalQuestion, this.securityAnswer.trim())
      .subscribe({
        next: () => {
          // Si llegaste por un link de invitacion (ej. WhatsApp), te lleva
          // directo a unirte a esa sala en vez de a "Mis salas".
          const redirectTo = this.route.snapshot.queryParamMap.get('redirectTo') ?? '/rooms';
          this.router.navigateByUrl(redirectTo);
        },
        error: (err) => {
          this.loading.set(false);
          this.error.set(err.error?.message ?? 'No se pudo crear la cuenta');
        },
      });
  }
}
