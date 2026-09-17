import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './register.component.html',
  styleUrl: './register.component.css',
})
export class RegisterComponent {
  username = '';
  displayName = '';
  email = '';
  password = '';
  loading = signal(false);
  error = signal<string | null>(null);
  showPassword = signal(false);

  constructor(
    private authService: AuthService,
    private router: Router,
    private route: ActivatedRoute
  ) {}

  submit(): void {
    if (!this.username || !this.displayName || !this.email || !this.password) return;
    this.loading.set(true);
    this.error.set(null);

    this.authService.register(this.username, this.displayName, this.email, this.password).subscribe({
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
