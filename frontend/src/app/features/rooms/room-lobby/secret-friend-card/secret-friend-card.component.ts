import { Component, Input, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RoomService } from '../../../../core/services/room.service';

@Component({
  selector: 'app-secret-friend-card',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './secret-friend-card.component.html',
  styleUrl: './secret-friend-card.component.css',
})
export class SecretFriendCardComponent implements OnInit {
  @Input({ required: true }) roomId!: number;

  revealed = signal(false);
  loading = signal(true);
  error = signal<string | null>(null);
  name = signal<string>('');
  mailing = signal(false);
  mailSent = signal(false);
  mailError = signal<string | null>(null);

  constructor(private roomService: RoomService) {}

  ngOnInit(): void {
    this.roomService.myAssignment(this.roomId).subscribe({
      next: (assignment) => {
        this.name.set(assignment.receiverDisplayName);
        this.loading.set(false);
      },
      error: (err) => {
        this.error.set(err.error?.message ?? 'Todavía no se hizo el sorteo');
        this.loading.set(false);
      },
    });
  }

  sendMail(): void {
    if (this.mailing()) return;
    this.mailing.set(true);
    this.mailSent.set(false);
    this.mailError.set(null);
    this.roomService.mailMyAssignment(this.roomId).subscribe({
      next: () => {
        this.mailing.set(false);
        this.mailSent.set(true);
      },
      error: (err) => {
        this.mailing.set(false);
        this.mailError.set(err.error?.message ?? 'No se pudo enviar el correo.');
      },
    });
  }
}
