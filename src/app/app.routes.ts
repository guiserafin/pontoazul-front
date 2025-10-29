import { Routes } from '@angular/router';

import { authGuard } from './core/guards/auth.guard';
import { adminGuard } from './core/guards/admin.guard';
import { guestGuard } from './core/guards/guest.guard';

export const routes: Routes = [
	{
		path: '',
		pathMatch: 'full',
		redirectTo: 'login'
	},
	{
		path: 'login',
		title: 'Login',
		canActivate: [guestGuard],
		loadComponent: () => import('./features/auth/login.page').then((m) => m.LoginPage)
	},
	{
		path: 'home',
		title: 'Home',
		canActivate: [authGuard],
		loadComponent: () => import('./features/home/home.page').then((m) => m.HomePage)
	},
	{
		path: 'usuarios',
		title: 'Usuários',
		canActivate: [authGuard, adminGuard],
		loadComponent: () => import('./features/usuarios/usuarios.page').then((m) => m.UsuariosPage)
	},
	{
		path: 'pontos',
		title: 'Pontos',
		canActivate: [authGuard],
		loadComponent: () => import('./features/pontos/pontos.page').then((m) => m.PontosPage)
	},
	{
		path: '**',
		redirectTo: 'login'
	}
];
