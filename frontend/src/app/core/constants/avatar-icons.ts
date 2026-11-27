// AvatarComponent dibuja los íconos a partir de su clave.
export interface AvatarIconOption {
  key: string;
  label: string;
}

export const AVATAR_ICON_OPTIONS: AvatarIconOption[] = [
  { key: 'gamepad', label: 'Joystick' },
  { key: 'headphones', label: 'Auriculares' },
  { key: 'coffee', label: 'Café / Mate' },
  { key: 'flame', label: 'Fuego' },
  { key: 'cat', label: 'Gato' },
  { key: 'ufo', label: 'OVNI' },
  { key: 'sword', label: 'Espada' },
  { key: 'ghost', label: 'Fantasma' },
  { key: 'heart', label: 'Corazón' },
  { key: 'star', label: 'Estrella' },
  { key: 'moon', label: 'Luna' },
  { key: 'bolt', label: 'Rayo' },
  { key: 'gift', label: 'Regalo' },
  { key: 'mountain', label: 'Montaña' },
  { key: 'music', label: 'Música' },
  { key: 'rocket', label: 'Cohete' },
  { key: 'snowflake', label: 'Copo de nieve' },
];

export const DEFAULT_AVATAR_KEY = 'gamepad';

export const AVATAR_COLORS = [
  { key: '', label: 'Original', color: 'var(--primary)' },
  { key: 'sky', label: 'Celeste', color: '#559BD1' },
  { key: 'mint', label: 'Verde menta', color: '#4EAB85' },
  { key: 'violet', label: 'Violeta', color: '#A07BD4' },
  { key: 'rose', label: 'Rosa', color: '#D8739D' },
  { key: 'gold', label: 'Dorado', color: '#C89B41' },
];

export function readAvatar(value: string | null): { icon: string | null; color: string } {
  const [icon, color = ''] = value?.split('--') ?? [];
  return {
    icon: icon && icon !== 'initials' ? icon : null,
    color: AVATAR_COLORS.some(option => option.key === color) ? color : '',
  };
}

export function writeAvatar(icon: string | null, color: string): string | null {
  return color ? `${icon ?? 'initials'}--${color}` : icon;
}
