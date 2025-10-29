import { ChangeDetectionStrategy, Component } from '@angular/core';

import { NavbarComponent } from '../../components/navbar/navbar.component';

@Component({
  selector: 'app-usuarios-page',
  imports: [NavbarComponent],
  template: `
    <app-navbar />
    <section class="usuarios">
      <h1 class="usuarios__title">Usuários</h1>
      <p class="usuarios__description">Gerenciamento de usuários do sistema</p>
    </section>
  `,
  styles: [
    `
      .usuarios {
        display: grid;
        gap: 1rem;
        padding: 2rem;
      }

      .usuarios__title {
        margin: 0;
        font-size: 2rem;
        color: #0f172a;
      }

      .usuarios__description {
        margin: 0;
        font-size: 1rem;
        color: #64748b;
      }
    `
  ],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class UsuariosPage {}
