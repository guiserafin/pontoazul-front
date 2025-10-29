import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { firstValueFrom } from 'rxjs';

import { ApiClient } from '../../core/services/api-client.service';
import { AuthService } from '../../core/services/auth.service';

interface LoginRequest {
  email: string;
  password: string;
}

interface LoginResponse {
  token: string;
}

@Component({
  selector: 'app-login-page',
  imports: [ReactiveFormsModule],
  templateUrl: './login.page.html',
  styleUrl: './login.page.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class LoginPage {
  private readonly formBuilder = inject(FormBuilder);
  private readonly apiClient = inject(ApiClient);
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);

  protected readonly isSubmitting = signal(false);
  protected readonly errorMessage = signal<string | null>(null);

  protected readonly form = this.formBuilder.nonNullable.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(6)]]
  });

  protected readonly emailControl = this.form.controls.email;
  protected readonly passwordControl = this.form.controls.password;

  protected readonly emailInvalid = computed(() => this.emailControl.invalid && this.emailControl.touched);
  protected readonly passwordInvalid = computed(() => this.passwordControl.invalid && this.passwordControl.touched);

  async onSubmit(): Promise<void> {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const credentials: LoginRequest = this.form.getRawValue();

    this.isSubmitting.set(true);
    this.errorMessage.set(null);

    try {
      const response = await firstValueFrom(this.apiClient.post<LoginRequest, LoginResponse>('auth/login', credentials));
      this.authService.setToken(response.token);
      await this.router.navigateByUrl('home');
    } catch (error) {
      this.errorMessage.set(this.resolveErrorMessage(error));
    } finally {
      this.isSubmitting.set(false);
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

      if (error.status === 401) {
        return 'Credenciais inválidas. Confira seu e-mail e senha.';
      }
    }

    return 'Ocorreu um erro ao realizar o login. Tente novamente em instantes.';
  }
}
