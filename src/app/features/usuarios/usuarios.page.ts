import { ChangeDetectionStrategy, Component, inject, signal, OnInit } from '@angular/core';
import { firstValueFrom } from 'rxjs';

import { NavbarComponent } from '../../components/navbar/navbar.component';
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
  imports: [NavbarComponent],
  templateUrl: './usuarios.page.html',
  styleUrl: './usuarios.page.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class UsuariosPage implements OnInit {
  private readonly apiClient = inject(ApiClient);

  protected readonly usuarios = signal<Usuario[]>([]);
  protected readonly isLoading = signal(false);
  protected readonly errorMessage = signal<string | null>(null);

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
    // TODO: Implementar modal de novo usuário
    console.log('Abrir modal de novo usuário');
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
    // console.log('Toggle status do usuário:', usuarioId, 'Status atual:', statusAtual);
  }
}

