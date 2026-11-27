import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { AvatarComponent } from '../../shared/avatar/avatar.component';
import { InstallButtonComponent } from '../../shared/install-button/install-button.component';
import { AVATAR_COLORS, AVATAR_ICON_OPTIONS, readAvatar, writeAvatar } from '../../core/constants/avatar-icons';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, AvatarComponent, InstallButtonComponent],
  templateUrl: './profile.component.html',
  styleUrl: './profile.component.css',
})
export class ProfileComponent {
  iconOptions = AVATAR_ICON_OPTIONS;
  colorOptions = AVATAR_COLORS;
  avatarColor = '';

  username = '';
  displayName = '';
  email = '';
  avatarIcon: string | null = null;

  loading = signal(false);
  error = signal<string | null>(null);
  saved = signal(false);

  constructor(public authService: AuthService) {
    this.username = this.authService.currentUser()?.username ?? '';
    this.displayName = this.authService.currentUser()?.displayName ?? '';
    this.email = this.authService.currentUser()?.email ?? '';
    const avatar = readAvatar(this.authService.currentUser()?.avatarIcon ?? null);
    this.avatarIcon = avatar.icon;
    this.avatarColor = avatar.color;
  }

  avatarPreview(icon: string | null): string | null {
    return writeAvatar(icon, this.avatarColor);
  }

  submit(): void {
    if (!this.username.trim() || !this.displayName.trim() || !this.email.trim() || this.loading()) return;

    this.loading.set(true);
    this.error.set(null);
    this.saved.set(false);

    this.authService
      .updateProfile(this.username.trim(), this.displayName.trim(), this.email.trim(), this.avatarPreview(this.avatarIcon))
      .subscribe({
        next: (user) => {
          this.email = user.email;
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
