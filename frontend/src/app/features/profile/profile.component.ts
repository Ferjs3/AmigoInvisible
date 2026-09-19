import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { AvatarComponent } from '../../shared/avatar/avatar.component';
import { AVATAR_ICON_OPTIONS } from '../../core/constants/avatar-icons';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, AvatarComponent],
  templateUrl: './profile.component.html',
  styleUrl: './profile.component.css',
})
export class ProfileComponent {
  iconOptions = AVATAR_ICON_OPTIONS;

  username = '';
  displayName = '';
  avatarIcon: string | null = null;

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

  selectIcon(key: string): void {
    this.avatarIcon = this.avatarIcon === key ? null : key;
  }

  submit(): void {
    if (!this.username.trim() || !this.displayName.trim()) return;
    this.loading.set(true);
    this.error.set(null);
    this.saved.set(false);

    this.authService.updateProfile(this.username.trim(), this.displayName.trim(), this.avatarIcon).subscribe({
      next: () => {
        this.loading.set(false);
        this.saved.set(true);
        setTimeout(() => this.saved.set(false), 2500);
      },
      error: (err) => {
        this.loading.set(false);
        this.error.set(err.error?.message ?? 'No se pudo guardar los cambios');
      },
    });
  }
}
