import { ChangeDetectionStrategy, Component, inject, signal, OnInit } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { firstValueFrom } from 'rxjs';

import { NavbarComponent } from '../../components/navbar/navbar.component';
import { AuthService } from '../../core/services/auth.service';
import { ApiClient } from '../../core/services/api-client.service';

interface User {
  id: number;
  name: string;
  email: string;
  role: string;
  active: boolean;
}

interface Ponto {
  id: number;
  userId: number;
  userName: string;
  hour: string;
  situation: string;
  justification: string | null;
}

@Component({
  selector: 'app-pontos-page',
  imports: [NavbarComponent, ReactiveFormsModule],
  templateUrl: './pontos.page.html',
  styleUrl: './pontos.page.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class PontosPage implements OnInit {
  private readonly formBuilder = inject(FormBuilder);
  private readonly authService = inject(AuthService);
  private readonly apiClient = inject(ApiClient);

  protected readonly isAdmin = this.authService.isAdmin;
  protected readonly usuarios = signal<User[]>([]);
  protected readonly pontos = signal<Ponto[]>([]);
  protected readonly isLoadingPontos = signal(false);
  protected readonly errorMessage = signal<string | null>(null);
  protected readonly hasSearched = signal(false);

  protected readonly filterForm = this.formBuilder.group({
    usuarioId: [''],
    dataInicio: ['', Validators.required],
    dataFim: ['', Validators.required]
  });

  ngOnInit(): void {
    if (this.isAdmin()) {
      this.loadUsuarios();
    }
  }

  async loadUsuarios(): Promise<void> {
    try {
      const users = await firstValueFrom(
        this.apiClient.get<User[]>('user')
      );
      this.usuarios.set(users);
    } catch (error) {
      console.error('Erro ao carregar usuários:', error);
    }
  }

  async buscarPontos(): Promise<void> {
    if (this.filterForm.invalid) {
      this.filterForm.markAllAsTouched();
      return;
    }

    this.isLoadingPontos.set(true);
    this.errorMessage.set(null);
    this.hasSearched.set(true);

    const { dataInicio, dataFim, usuarioId } = this.filterForm.value;

    // Monta os parâmetros da query
    const params = new URLSearchParams();
    params.append('initialDate', dataInicio!);
    params.append('finalDate', dataFim!);

    if (usuarioId && usuarioId !== '') {
      params.append('userId', usuarioId);
    } else if (!this.isAdmin()) {
      // Se não é admin, usa o ID do usuário logado
      const currentUserId = this.authService.userId();
      if (currentUserId !== null) {
        params.append('userId', currentUserId.toString());
      }
    }

    try {
      const pontos = await firstValueFrom(
        this.apiClient.get<Ponto[]>(`ponto/pontos?${params.toString()}`)
      );
      this.pontos.set(pontos);
    } catch (error) {
      this.errorMessage.set('Erro ao buscar pontos. Tente novamente.');
      console.error('Erro ao buscar pontos:', error);
    } finally {
      this.isLoadingPontos.set(false);
    }
  }

  formatDateTime(isoString: string): string {
    const date = new Date(isoString);

    const dateOptions: Intl.DateTimeFormatOptions = {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      timeZone: 'America/Sao_Paulo'
    };

    return new Intl.DateTimeFormat('pt-BR', dateOptions).format(date);
  }

  formatDate(isoString: string): string {
    const date = new Date(isoString);

    const dateOptions: Intl.DateTimeFormatOptions = {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      timeZone: 'America/Sao_Paulo'
    };

    return new Intl.DateTimeFormat('pt-BR', dateOptions).format(date);
  }

  formatTime(isoString: string): string {
    const date = new Date(isoString);

    const timeOptions: Intl.DateTimeFormatOptions = {
      hour: '2-digit',
      minute: '2-digit',
      timeZone: 'America/Sao_Paulo'
    };

    return new Intl.DateTimeFormat('pt-BR', timeOptions).format(date);
  }

  getSituationLabel(situation: string): string {
    const labels: Record<string, string> = {
      'Approved': 'Aprovado',
      'Rejected': 'Reprovado',
      'Pending': 'Pendente'
    };
    return labels[situation] || situation;
  }
}

