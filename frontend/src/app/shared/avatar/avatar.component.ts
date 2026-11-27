import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AVATAR_COLORS, readAvatar } from '../../core/constants/avatar-icons';

@Component({
  selector: 'app-avatar',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './avatar.component.html',
  styleUrl: './avatar.component.css',
})
export class AvatarComponent {
  @Input({ required: true }) name!: string;
  iconKey: string | null = null;
  iconColor: string | null = null;

  @Input() set icon(value: string | null) {
    const avatar = readAvatar(value);
    this.iconKey = avatar.icon;
    this.iconColor = avatar.color
      ? AVATAR_COLORS.find(option => option.key === avatar.color)?.color ?? null
      : null;
  }
  @Input() size: 'sm' | 'md' | 'lg' = 'md';

  initials(): string {
    const parts = this.name.trim().split(/\s+/).filter(Boolean);
    if (parts.length === 0) return '?';
    if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
    return (parts[0][0] + parts[1][0]).toUpperCase();
  }
}
