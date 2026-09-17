import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { InstallButtonComponent } from './shared/install-button/install-button.component';
import { ThemeToggleComponent } from './shared/theme-toggle/theme-toggle.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, InstallButtonComponent, ThemeToggleComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css',
})
export class AppComponent {}
