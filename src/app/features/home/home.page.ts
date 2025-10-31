import { ChangeDetectionStrategy, Component, inject, signal, OnInit, OnDestroy } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';

import { API_BASE_URL } from '../../core/config/environment.tokens';
import { AuthService } from '../../core/services/auth.service';
import { ApiClient } from '../../core/services/api-client.service';
import { NavbarComponent } from '../../components/navbar/navbar.component';
import { AjustarPontoModalComponent } from '../../components/ajustar-ponto-modal/ajustar-ponto-modal.component';

@Component({
  selector: 'app-home-page',
  imports: [
    NavbarComponent,
    AjustarPontoModalComponent
  ],
  templateUrl: './home.page.html',
  styleUrl: './home.page.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class HomePage implements OnInit, OnDestroy {
  protected readonly apiBaseUrl = inject(API_BASE_URL);
  private readonly authService = inject(AuthService);
  private readonly apiClient = inject(ApiClient);

  protected readonly isAdmin = this.authService.isAdmin;
  protected readonly currentDate = signal('');
  protected readonly currentTime = signal('');
  protected readonly isRegistering = signal(false);
  protected readonly successMessage = signal<string | null>(null);
  protected readonly errorMessage = signal<string | null>(null);
  protected readonly isModalOpen = signal(false);

  private timeInterval?: number;

  ngOnInit(): void {
    if (!this.isAdmin()) {
      this.updateTime();
      this.timeInterval = window.setInterval(() => this.updateTime(), 1000);
    }
  }

  ngOnDestroy(): void {
    if (this.timeInterval) {
      clearInterval(this.timeInterval);
    }
  }

  private updateTime(): void {
    const now = new Date();

    // Formato de data: Segunda-feira, 28 de Outubro
    const dateOptions: Intl.DateTimeFormatOptions = {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      timeZone: 'America/Sao_Paulo'
    };

    // Formato de hora: HH:MM:SS
    const timeOptions: Intl.DateTimeFormatOptions = {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false,
      timeZone: 'America/Sao_Paulo'
    };

    const dateFormatter = new Intl.DateTimeFormat('pt-BR', dateOptions);
    const timeFormatter = new Intl.DateTimeFormat('pt-BR', timeOptions);

    this.currentDate.set(dateFormatter.format(now));
    this.currentTime.set(timeFormatter.format(now));
  }

  async registrarPonto(): Promise<void> {
    this.isRegistering.set(true);
    this.successMessage.set(null);
    this.errorMessage.set(null);

    const userId = this.authService.userId();

    if (userId === null) {
      this.errorMessage.set('Erro: Usuário não identificado. Faça login novamente.');
      this.isRegistering.set(false);
      return;
    }

    const pontoRequest = {
      userId: userId,
      justification: null as string | null
    };

    try {
      await firstValueFrom(this.apiClient.post<typeof pontoRequest, any>('ponto', pontoRequest));
      this.successMessage.set('Ponto registrado com sucesso!');

      // Limpar mensagem de sucesso após 5 segundos
      setTimeout(() => this.successMessage.set(null), 5000);
    } catch (error) {
      this.errorMessage.set(this.resolveErrorMessage(error));

      // Limpar mensagem de erro após 8 segundos
      setTimeout(() => this.errorMessage.set(null), 8000);
    } finally {
      this.isRegistering.set(false);
    }
  }

  abrirModalAjuste(): void {
    this.isModalOpen.set(true);
  }

  fecharModal(): void {
    this.isModalOpen.set(false);
  }

  async onAjustarPontoSubmit(data: { data: string; hora: string; justificativa: string }): Promise<void> {
    this.successMessage.set(null);
    this.errorMessage.set(null);

    const userId = this.authService.userId();

    if (userId === null) {
      this.errorMessage.set('Erro: Usuário não identificado. Faça login novamente.');
      return;
    }

    // Parse da data no formato DD/MM/YYYY
    const dataParts = data.data.split('/');
    const dia = parseInt(dataParts[0], 10);
    const mes = parseInt(dataParts[1], 10) - 1; // Mês é 0-indexed
    const ano = parseInt(dataParts[2], 10);

    // Parse da hora no formato HH:MM
    const horaParts = data.hora.split(':');
    const horas = parseInt(horaParts[0], 10);
    const minutos = parseInt(horaParts[1], 10);

    // Cria o timestamp no formato ISO 8601
    const timestamp = new Date(Date.UTC(ano, mes, dia, horas, minutos));

    const adjustRequest = {
      userId: userId,
      timestamp: timestamp.toISOString(),
      justification: data.justificativa
    };

    try {
      await firstValueFrom(this.apiClient.post<typeof adjustRequest, any>('ponto/adjust', adjustRequest));
      this.successMessage.set('Ponto ajustado com sucesso!');
      this.fecharModal();

      // Limpar mensagem de sucesso após 5 segundos
      setTimeout(() => this.successMessage.set(null), 5000);
    } catch (error) {
      this.errorMessage.set(this.resolveErrorMessage(error));

      // Limpar mensagem de erro após 8 segundos
      setTimeout(() => this.errorMessage.set(null), 8000);
    }
  }

  private resolveErrorMessage(error: unknown): string {
    if (error instanceof HttpErrorResponse) {
      if (typeof error.error === 'string' && error.error.trim().length > 0) {
        return error.error;
      }

      if (error.error && typeof error.error === 'object' && 'message' in error.error) {
        const message = (error.error as Record<string, unknown>)['message'];
        if (typeof message === 'string' && message.trim().length > 0) {
          return message;
        }
      }

      if (error.status === 0) {
        return 'Não foi possível conectar ao servidor. Verifique sua conexão.';
      }

      if (error.status >= 500) {
        return 'Erro no servidor. Tente novamente mais tarde.';
      }
    }

    return 'Ocorreu um erro ao registrar o ponto. Tente novamente.';
  }
}
