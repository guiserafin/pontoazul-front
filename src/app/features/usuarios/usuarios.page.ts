import { ChangeDetectionStrategy, Component, inject, signal, OnInit } from '@angular/core';
import { firstValueFrom } from 'rxjs';

import { NavbarComponent } from '../../components/navbar/navbar.component';
import { NovoUsuarioModalComponent } from '../../components/novo-usuario-modal/novo-usuario-modal.component';
import { ApiClient } from '../../core/services/api-client.service';
import { Role } from '../../models/role.enum';

interface Usuario {
  id: number;
  name: string;
  email: string;
  role: Role;
  active: boolean;
}

@Component({
  selector: 'app-usuarios-page',
  imports: [NavbarComponent, NovoUsuarioModalComponent],
  templateUrl: './usuarios.page.html',
  styleUrl: './usuarios.page.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class UsuariosPage implements OnInit {
  private readonly apiClient = inject(ApiClient);

  protected readonly usuarios = signal<Usuario[]>([]);
  protected readonly isLoading = signal(false);
  protected readonly errorMessage = signal<string | null>(null);
  protected readonly successMessage = signal<string | null>(null);
  protected readonly isModalOpen = signal(false);

  ngOnInit(): void {
    this.loadUsuarios();
  }

  async loadUsuarios(): Promise<void> {
    this.isLoading.set(true);
    this.errorMessage.set(null);

    try {
      const usuarios = await firstValueFrom(
        this.apiClient.get<Usuario[]>('user')
      );
      this.usuarios.set(usuarios);
    } catch (error) {
      this.errorMessage.set('Erro ao carregar usuários. Tente novamente.');
      console.error('Erro ao carregar usuários:', error);
    } finally {
      this.isLoading.set(false);
    }
  }

  abrirModalNovoUsuario(): void {
    this.isModalOpen.set(true);
  }

  fecharModal(): void {
    this.isModalOpen.set(false);
  }

  async onNovoUsuarioSubmit(data: { name: string; email: string; cpf: string; isAdmin: boolean }): Promise<void> {
    this.successMessage.set(null);
    this.errorMessage.set(null);

    try {
      await firstValueFrom(
        this.apiClient.post('auth/register', {
          name: data.name,
          email: data.email,
          cpf: data.cpf,
          isAdmin: data.isAdmin
        })
      );

      this.successMessage.set('Usuário criado com sucesso!');
      this.fecharModal();
      await this.loadUsuarios();

      // Limpar mensagem de sucesso após 5 segundos
      setTimeout(() => this.successMessage.set(null), 5000);
    } catch (error) {
      this.errorMessage.set('Erro ao criar usuário. Tente novamente.');
      console.error('Erro ao criar usuário:', error);

      // Limpar mensagem de erro após 8 segundos
      setTimeout(() => this.errorMessage.set(null), 8000);
    }
  }

  toggleUsuarioStatus(usuarioId: number): void {
    this.apiClient.patch(`user`, { id: usuarioId }).subscribe({
      next: () => {
        this.loadUsuarios();
      },
      error: (error) => {
        console.error('Erro ao alterar status do usuário:', error);
      }
    });
  }
}

