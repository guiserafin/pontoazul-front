import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { firstValueFrom } from 'rxjs';

import { AuthService } from '../../core/services/auth.service';
import { ApiClient } from '../../core/services/api-client.service';
import { PerfilModalComponent } from '../perfil-modal/perfil-modal.component';

interface UserProfile {
  id: number;
  name: string;
  email: string;
  role: string;
  active: boolean;
}

@Component({
  selector: 'app-navbar',
  imports: [PerfilModalComponent],
  templateUrl: './navbar.component.html',
  styleUrl: './navbar.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class NavbarComponent {
  private readonly authService = inject(AuthService);
  private readonly apiClient = inject(ApiClient);
  private readonly router = inject(Router);

  protected readonly isAdmin = this.authService.isAdmin;
  protected readonly isMobileMenuOpen = signal(false);
  protected readonly isPerfilModalOpen = signal(false);
  protected readonly userProfile = signal<UserProfile | null>(null);
  protected readonly isLoadingProfile = signal(false);

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

  async openPerfilModal(): Promise<void> {
    this.closeMobileMenu();
    const userId = this.authService.userId();

    console.log('User ID for profile:', userId);

    if (userId === null) {
      return;
    }

    this.isLoadingProfile.set(true);

    try {
      const profile = await firstValueFrom(
        this.apiClient.get<UserProfile>(`user/${userId}`)
      );
      this.userProfile.set(profile);
      this.isPerfilModalOpen.set(true);
    } catch (error) {
      console.error('Erro ao carregar perfil:', error);
    } finally {
      this.isLoadingProfile.set(false);
    }
  }

  closePerfilModal(): void {
    this.isPerfilModalOpen.set(false);
  }

  async onAlterarSenhaSubmit(data: { novaSenha: string; confirmarSenha: string }): Promise<void> {
    const userId = this.authService.userId();

    if (userId === null) {
      return;
    }

    try {
      await firstValueFrom(
        this.apiClient.patch('user/update-password', {
          userId,
          newPassword: data.novaSenha
        })
      );

      alert('Senha alterada com sucesso!');
      this.closePerfilModal();
    } catch (error) {
      console.error('Erro ao alterar senha:', error);
      alert('Erro ao alterar senha. Tente novamente.');
    }
  }

  async logout(): Promise<void> {
    this.closeMobileMenu();
    this.authService.clearToken();
    await this.router.navigateByUrl('/login');
  }
}
