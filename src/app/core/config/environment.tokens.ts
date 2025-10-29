import { InjectionToken } from '@angular/core';

export interface AppEnvironment {
  production: boolean;
  apiUrl: string;
}

export const APP_ENVIRONMENT = new InjectionToken<AppEnvironment>('APP_ENVIRONMENT');
export const API_BASE_URL = new InjectionToken<string>('API_BASE_URL');
