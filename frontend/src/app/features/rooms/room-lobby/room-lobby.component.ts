import { Component, OnDestroy, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { Subscription, interval, switchMap } from 'rxjs';
import { RoomService } from '../../../core/services/room.service';
import { AuthService } from '../../../core/services/auth.service';
import { RoomDetail } from '../../../core/models/models';
import { ParticipantsListComponent } from './participants-list/participants-list.component';
import { SecretFriendCardComponent } from './secret-friend-card/secret-friend-card.component';
import { WishlistBoardComponent } from './wishlist-board/wishlist-board.component';
import { QuestionsWallComponent } from './questions-wall/questions-wall.component';
import { ExclusionsManagerComponent } from './exclusions-manager/exclusions-manager.component';
import { BudgetVoteComponent } from './budget-vote/budget-vote.component';
import { ROOM_ICON_OPTIONS } from '../../../core/constants/room-icons';

type Tab = 'resumen' | 'amigo' | 'tablon' | 'preguntas';
type ConfirmAction = 'draw' | 'delete' | null;

const POLL_INTERVAL_MS = 6000;

@Component({
  selector: 'app-room-lobby',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RouterLink,
    ParticipantsListComponent,
    SecretFriendCardComponent,
    WishlistBoardComponent,
    QuestionsWallComponent,
    ExclusionsManagerComponent,
    BudgetVoteComponent,
  ],
  templateUrl: './room-lobby.component.html',
  styleUrl: './room-lobby.component.css',
})
export class RoomLobbyComponent implements OnInit, OnDestroy {
  room = signal<RoomDetail | null>(null);
  error = signal<string | null>(null);
  tab = signal<Tab>('resumen');
  copied = signal(false);
  confirmAction = signal<ConfirmAction>(null);
  sharing = signal(false);

  // edicion de la sala
  iconOptions = ROOM_ICON_OPTIONS;
  editingRoom = signal(false);
  editName = '';
  editIcon = '';
  editBudget: number | null = null;
  editDate = '';
  editPlace = '';
  editNotes = '';
  editSaving = signal(false);
  editError = signal<string | null>(null);
  minDate = new Date().toISOString().split('T')[0];

  private roomId!: number;
  private pollSub?: Subscription;

  tabs: { id: Tab; label: string }[] = [
    { id: 'resumen', label: 'Resumen' },
    { id: 'amigo', label: 'Mi amigo invisible' },
    { id: 'tablon', label: 'Tablón' },
    { id: 'preguntas', label: 'Preguntas' },
  ];

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private roomService: RoomService,
    private authService: AuthService
  ) {}

  currentUserId(): number | undefined {
    return this.authService.currentUser()?.id;
  }

  ngOnInit(): void {
    this.roomId = Number(this.route.snapshot.paramMap.get('id'));
    this.load(this.roomId);
    this.startPolling();
  }

  ngOnDestroy(): void {
    this.pollSub?.unsubscribe();
  }

  private startPolling(): void {
    this.pollSub = interval(POLL_INTERVAL_MS)
      .pipe(switchMap(() => this.roomService.getDetail(this.roomId)))
      .subscribe({
        next: (room) => this.room.set(room),
        error: () => {},
      });
  }

  load(roomId: number): void {
    this.roomService.getDetail(roomId).subscribe({
      next: (room) => this.room.set(room),
      error: (err) => this.error.set(err.error?.message ?? 'No se pudo cargar la sala'),
    });
  }

  copyCode(): void {
    const room = this.room();
    if (!room) return;
    navigator.clipboard.writeText(room.code).then(() => {
      this.copied.set(true);
      setTimeout(() => this.copied.set(false), 1800);
    });
  }

  // Cuantos dias faltan para el evento. null si no hay fecha cargada,
  // 0 si es hoy, negativo si ya paso.
  daysUntilEvent(): number | null {
    const room = this.room();
    if (!room?.eventDate) return null;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const eventDate = new Date(room.eventDate + 'T00:00:00');
    const diffMs = eventDate.getTime() - today.getTime();
    return Math.round(diffMs / (1000 * 60 * 60 * 24));
  }

  // Comparte el link de invitacion. Si el navegador soporta el selector
  // nativo (Web Share API, casi todos los celus) lo usa; si no, copia
  // el link al portapapeles como respaldo.
  shareInvite(): void {
    const room = this.room();
    if (!room) return;

    const inviteUrl = `${window.location.origin}/rooms/join?code=${room.code}`;
    const text = `Unite a mi sala de Amigo Invisible "${room.name}" con el código ${room.code}`;

    if (navigator.share) {
      navigator.share({ title: 'Amigo invisible', text, url: inviteUrl }).catch(() => {});
    } else {
      navigator.clipboard.writeText(`${text}\n${inviteUrl}`).then(() => {
        this.sharing.set(true);
        setTimeout(() => this.sharing.set(false), 1800);
      });
    }
  }

  openEditRoom(): void {
    const room = this.room();
    if (!room) return;
    this.editName = room.name;
    this.editIcon = room.icon ?? this.iconOptions[0];
    this.editBudget = room.suggestedBudget;
    this.editDate = room.eventDate ?? '';
    this.editPlace = room.place ?? '';
    this.editNotes = room.notes ?? '';
    this.editError.set(null);
    this.editingRoom.set(true);
  }

  saveEditRoom(): void {
    const room = this.room();
    if (!room || !this.editName.trim()) return;
    this.editSaving.set(true);
    this.editError.set(null);

    this.roomService
      .update(room.id, {
        name: this.editName.trim(),
        icon: this.editIcon,
        suggestedBudget: this.editBudget,
        eventDate: this.editDate || null,
        place: this.editPlace || null,
        notes: this.editNotes || null,
      })
      .subscribe({
        next: (updated) => {
          this.room.set(updated);
          this.editSaving.set(false);
          this.editingRoom.set(false);
        },
        error: (err) => {
          this.editSaving.set(false);
          this.editError.set(err.error?.message ?? 'No se pudo guardar los cambios');
        },
      });
  }

  onDraw(): void {
    const room = this.room();
    if (!room) return;
    this.roomService.draw(room.id).subscribe({
      next: (updated) => {
        this.room.set(updated);
        this.confirmAction.set(null);
        this.tab.set('amigo');
      },
      error: (err) => {
        this.confirmAction.set(null);
        this.error.set(err.error?.message ?? 'No se pudo realizar el sorteo');
      },
    });
  }

  onDeleteRoom(): void {
    const room = this.room();
    if (!room) return;
    this.roomService.deleteRoom(room.id).subscribe({
      next: () => this.router.navigate(['/rooms']),
      error: (err) => {
        this.confirmAction.set(null);
        this.error.set(err.error?.message ?? 'No se pudo eliminar la sala');
      },
    });
  }

  onToggleReady(ready: boolean): void {
    const room = this.room();
    if (!room) return;
    this.roomService.setReady(room.id, ready).subscribe({
      next: (updated) => this.room.set(updated),
      error: (err) => this.error.set(err.error?.message ?? 'No se pudo actualizar tu estado'),
    });
  }

  onRemoveParticipant(userId: number): void {
    const room = this.room();
    if (!room) return;
    if (!confirm('¿Seguro que querés sacar a esta persona de la sala?')) return;

    this.roomService.removeParticipant(room.id, userId).subscribe({
      next: (updated) => this.room.set(updated),
      error: (err) => this.error.set(err.error?.message ?? 'No se pudo eliminar al participante'),
    });
  }

  onLeave(): void {
    const room = this.room();
    if (!room) return;
    if (!confirm('¿Seguro que querés salir de esta sala?')) return;

    this.roomService.leave(room.id).subscribe({
      next: () => this.router.navigate(['/rooms']),
      error: (err) => this.error.set(err.error?.message ?? 'No se pudo salir de la sala'),
    });
  }
}
