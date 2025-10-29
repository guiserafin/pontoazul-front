import { ChangeDetectionStrategy, Component, computed, inject, OnInit, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { firstValueFrom } from 'rxjs';
import { HttpErrorResponse } from '@angular/common/http';
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
export class LoginPage implements OnInit {
  private readonly formBuilder = inject(FormBuilder);
  private readonly apiClient = inject(ApiClient);
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);

  protected readonly isSubmitting = signal(false);
  protected readonly errorMessage = signal<string | null>(null);
  protected readonly warningMessage = signal<string | null>(null);

  protected readonly form = this.formBuilder.nonNullable.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(6)]]
  });

  protected readonly emailControl = this.form.controls.email;
  protected readonly passwordControl = this.form.controls.password;

  protected readonly emailInvalid = computed(() => this.emailControl.invalid && this.emailControl.touched);
  protected readonly passwordInvalid = computed(() => this.passwordControl.invalid && this.passwordControl.touched);

  ngOnInit(): void {
    // Verifica se foi redirecionado por token expirado
    this.route.queryParams.subscribe(params => {
      if (params['expired'] === 'true') {
        this.warningMessage.set('Sua sessão expirou. Por favor, faça login novamente.');
      }
    });
  }

  async onSubmit(): Promise<void> {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const credentials: LoginRequest = this.form.getRawValue();

    this.isSubmitting.set(true);
    this.errorMessage.set(null);
    this.warningMessage.set(null);

    try {
      const response = await firstValueFrom(this.apiClient.post<LoginRequest, LoginResponse>('auth/login', credentials));
      this.authService.setToken(response.token);

      // Redireciona para a URL de retorno ou home
      const returnUrl = this.route.snapshot.queryParams['returnUrl'] || '/home';
      await this.router.navigateByUrl(returnUrl);
    } catch (error) {
      this.errorMessage.set(this.resolveErrorMessage(error));
    } finally {
      this.isSubmitting.set(false);
    }
  }

  private resolveErrorMessage(error: unknown): string {
    if (error instanceof HttpErrorResponse) {
      if (error.status === 401) {
        return 'E-mail ou senha incorretos.';
      }
      if (error.status === 0) {
        return 'Não foi possível conectar ao servidor. Verifique sua conexão.';
      }
      if (error.error?.message) {
        return error.error.message;
      }
    }

    return 'Ocorreu um erro ao realizar o login. Tente novamente em instantes.';
  }
}
