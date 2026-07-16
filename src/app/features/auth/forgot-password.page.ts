import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { firstValueFrom } from 'rxjs';
import { HttpErrorResponse } from '@angular/common/http';
import { ApiClient } from '../../core/services/api-client.service';

interface ForgotPasswordRequest {
  email: string;
}

interface ForgotPasswordResponse {
  message: string;
  resetToken?: string;
}

@Component({
  selector: 'app-forgot-password-page',
  imports: [ReactiveFormsModule, RouterLink],
  templateUrl: './forgot-password.page.html',
  styleUrl: './login.page.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ForgotPasswordPage {
  private readonly formBuilder = inject(FormBuilder);
  private readonly apiClient = inject(ApiClient);

  protected readonly isSubmitting = signal(false);
  protected readonly errorMessage = signal<string | null>(null);
  protected readonly successMessage = signal<string | null>(null);

  protected readonly form = this.formBuilder.nonNullable.group({
    email: ['', [Validators.required, Validators.email]]
  });

  protected readonly emailControl = this.form.controls.email;

  async onSubmit(): Promise<void> {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const payload: ForgotPasswordRequest = this.form.getRawValue();

    this.isSubmitting.set(true);
    this.errorMessage.set(null);
    this.successMessage.set(null);

    try {
      const response = await firstValueFrom(
        this.apiClient.post<ForgotPasswordRequest, ForgotPasswordResponse>('auth/forgot-password', payload)
      );

      this.successMessage.set(
        response.message ??
          'Se o e-mail informado estiver cadastrado, enviaremos as instruções para redefinir a senha.'
      );
      this.form.reset();
    } catch (error) {
      this.errorMessage.set(this.resolveErrorMessage(error));
    } finally {
      this.isSubmitting.set(false);
    }
  }

  private resolveErrorMessage(error: unknown): string {
    if (error instanceof HttpErrorResponse) {
      if (error.status === 0) {
        return 'Não foi possível conectar ao servidor. Verifique sua conexão.';
      }
      if (error.error?.message) {
        return error.error.message;
      }
    }

    return 'Ocorreu um erro ao solicitar a redefinição. Tente novamente em instantes.';
  }
}
