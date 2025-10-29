import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { Router } from '@angular/router';

import { API_BASE_URL } from '../../core/config/environment.tokens';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-home-page',
  template: `
    <section class="home">
      <h1 class="home__title">Ponto Azul Frontend</h1>
      <p class="home__subtitle">
        Backend base URL: <span class="home__url">{{ apiBaseUrl }}</span>
      </p>
      <p class="home__hint">
        Use the ApiClient service to integrate new features with the backend endpoints.
      </p>
      <button class="home__logout" type="button" (click)="logout()">Sair</button>
    </section>
  `,
  styles: [
    `
      .home {
        display: grid;
        gap: 1rem;
        padding: 2rem;
      }

      .home__title {
        margin: 0;
        font-size: 2rem;
      }

      .home__subtitle {
        margin: 0;
        font-size: 1rem;
      }

      .home__url {
        font-weight: 600;
      }

      .home__hint {
        margin: 0;
        color: #555;
      }

      .home__logout {
        justify-self: start;
        padding: 0.75rem 1.5rem;
        border: none;
        border-radius: 0.5rem;
        background: linear-gradient(135deg, #0f172a 0%, #1e3a8a 100%);
        color: #ffffff;
        font-size: 1rem;
        font-weight: 600;
        cursor: pointer;
        transition: all 0.3s ease;
      }

      .home__logout:hover {
        transform: translateY(-2px);
        box-shadow: 0 8px 16px rgba(30, 58, 138, 0.3);
      }
    `
  ],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class HomePage {
  protected readonly apiBaseUrl = inject(API_BASE_URL);
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);

  async logout(): Promise<void> {
    this.authService.clearToken();
    await this.router.navigateByUrl('/login');
  }
}
