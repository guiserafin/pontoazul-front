import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { Router } from '@angular/router';

import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
  styleUrl: './navbar.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class NavbarComponent {
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);

  protected readonly isAdmin = this.authService.isAdmin;
  protected readonly isMobileMenuOpen = signal(false);

  toggleMobileMenu(): void {
    this.isMobileMenuOpen.update(current => !current);
  }

  closeMobileMenu(): void {
    this.isMobileMenuOpen.set(false);
  }

  async navigateTo(route: string): Promise<void> {
    this.closeMobileMenu();
    await this.router.navigateByUrl(route);
  }

  async logout(): Promise<void> {
    this.closeMobileMenu();
    this.authService.clearToken();
    await this.router.navigateByUrl('/login');
  }
}
