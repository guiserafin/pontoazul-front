import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';

import { API_BASE_URL } from '../config/environment.tokens';

const absoluteUrlPattern = /^https?:\/\//i;

export const apiPrefixInterceptor: HttpInterceptorFn = (req, next) => {
  if (absoluteUrlPattern.test(req.url)) {
    return next(req);
  }

  const baseUrl = inject(API_BASE_URL);
  const sanitizedBase = baseUrl.endsWith('/') ? baseUrl.slice(0, -1) : baseUrl;
  const normalizedPath = req.url.startsWith('/') ? req.url : `/${req.url}`;

  return next(req.clone({ url: `${sanitizedBase}${normalizedPath}` }));
};
