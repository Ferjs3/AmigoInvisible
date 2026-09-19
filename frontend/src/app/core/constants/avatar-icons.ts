// Iconos de avatar predefinidos. La clave (key) es lo unico que se guarda
// en la base -- el dibujo en si vive en AvatarComponent, no hace falta
// subir ni guardar ningun archivo de imagen.
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
];

export const DEFAULT_AVATAR_KEY = 'gamepad';