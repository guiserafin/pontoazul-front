import { HttpClient, HttpContext, HttpHeaders, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';

type Primitive = string | number | boolean;

export type HttpQueryParams = Record<string, Primitive | ReadonlyArray<Primitive>>;

export interface ApiRequestOptions {
  headers?: HttpHeaders | Record<string, string | string[]>;
  params?: HttpParams | HttpQueryParams;
  context?: HttpContext;
  reportProgress?: boolean;
  withCredentials?: boolean;
  responseType?: 'json';
}

@Injectable({
  providedIn: 'root'
})
export class ApiClient {
  private readonly http = inject(HttpClient);

  get<TResponse>(endpoint: string, options?: ApiRequestOptions): Observable<TResponse> {
    return this.http.get<TResponse>(endpoint, options);
  }

  post<TRequest, TResponse = TRequest>(endpoint: string, body: TRequest, options?: ApiRequestOptions): Observable<TResponse> {
    return this.http.post<TResponse>(endpoint, body, options);
  }

  put<TRequest, TResponse = TRequest>(endpoint: string, body: TRequest, options?: ApiRequestOptions): Observable<TResponse> {
    return this.http.put<TResponse>(endpoint, body, options);
  }

  patch<TRequest, TResponse = TRequest>(endpoint: string, body: Partial<TRequest>, options?: ApiRequestOptions): Observable<TResponse> {
    return this.http.patch<TResponse>(endpoint, body, options);
  }

  delete<TResponse = void>(endpoint: string, options?: ApiRequestOptions): Observable<TResponse> {
    return this.http.delete<TResponse>(endpoint, options);
  }
}
