import { ChangeDetectionStrategy, Component, inject, OnInit, signal } from '@angular/core';
import { AbstractControl, FormBuilder, ReactiveFormsModule, ValidationErrors, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { firstValueFrom } from 'rxjs';
import { HttpErrorResponse } from '@angular/common/http';
import { ApiClient } from '../../core/services/api-client.service';

interface ResetPasswordRequest {
  token: string;
  newPassword: string;
}

interface ResetPasswordResponse {
  message: string;
}

function passwordsMatchValidator(group: AbstractControl): ValidationErrors | null {
  const newPassword = group.get('newPassword')?.value;
  const confirmPassword = group.get('confirmPassword')?.value;

  if (!newPassword || !confirmPassword) {
    return null;
  }

  return newPassword === confirmPassword ? null : { passwordsMismatch: true };
}

@Component({
  selector: 'app-reset-password-page',
  imports: [ReactiveFormsModule, RouterLink],
  templateUrl: './reset-password.page.html',
  styleUrl: './login.page.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ResetPasswordPage implements OnInit {
  private readonly formBuilder = inject(FormBuilder);
  private readonly apiClient = inject(ApiClient);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);

  private token = '';

  protected readonly isSubmitting = signal(false);
  protected readonly errorMessage = signal<string | null>(null);
  protected readonly successMessage = signal<string | null>(null);
  protected readonly hasToken = signal(true);

  protected readonly form = this.formBuilder.nonNullable.group(
    {
      newPassword: ['', [Validators.required, Validators.minLength(6)]],
      confirmPassword: ['', [Validators.required]]
    },
    { validators: passwordsMatchValidator }
  );

  protected readonly newPasswordControl = this.form.controls.newPassword;
  protected readonly confirmPasswordControl = this.form.controls.confirmPassword;

  ngOnInit(): void {
    const token = this.route.snapshot.queryParams['token'];

    if (token) {
      this.token = token;
    } else {
      this.hasToken.set(false);
      this.errorMessage.set('Link inválido. Solicite uma nova redefinição de senha.');
    }
  }

  async onSubmit(): Promise<void> {
    if (!this.hasToken()) {
      return;
    }

    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const { newPassword } = this.form.getRawValue();
    const payload: ResetPasswordRequest = { token: this.token, newPassword };

    this.isSubmitting.set(true);
    this.errorMessage.set(null);
    this.successMessage.set(null);

    try {
      const response = await firstValueFrom(
        this.apiClient.post<ResetPasswordRequest, ResetPasswordResponse>('auth/reset-password', payload)
      );

      this.successMessage.set(response.message ?? 'Senha redefinida com sucesso.');
      this.form.disable();

      // Redireciona ao login após uma breve confirmação visual.
      setTimeout(() => this.router.navigate(['/login']), 2500);
    } catch (error) {
      this.errorMessage.set(this.resolveErrorMessage(error));
    } finally {
      this.isSubmitting.set(false);
    }
  }

  private resolveErrorMessage(error: unknown): string {
    if (error instanceof HttpErrorResponse) {
      if (error.status === 400) {
        return 'Token inválido ou expirado. Solicite uma nova redefinição.';
      }
      if (error.status === 0) {
        return 'Não foi possível conectar ao servidor. Verifique sua conexão.';
      }
      if (error.error?.message) {
        return error.error.message;
      }
    }

    return 'Ocorreu um erro ao redefinir a senha. Tente novamente em instantes.';
  }
}
