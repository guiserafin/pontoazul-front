import { ChangeDetectionStrategy, Component } from '@angular/core';

import { NavbarComponent } from '../../components/navbar/navbar.component';

@Component({
  selector: 'app-pontos-page',
  imports: [NavbarComponent],
  template: `
    <app-navbar />
    <section class="pontos">
      <h1 class="pontos__title">Pontos</h1>
      <p class="pontos__description">Gerenciamento de pontos do sistema</p>
    </section>
  `,
  styles: [
    `
      .pontos {
        display: grid;
        gap: 1rem;
        padding: 2rem;
      }

      .pontos__title {
        margin: 0;
        font-size: 2rem;
        color: #0f172a;
      }

      .pontos__description {
        margin: 0;
        font-size: 1rem;
        color: #64748b;
      }
    `
  ],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class PontosPage {}
