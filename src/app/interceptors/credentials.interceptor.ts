import { HttpInterceptorFn } from '@angular/common/http';

import { environment } from '../../environments/environment';

export const credentialsInterceptor: HttpInterceptorFn = (request, next) => {
    if (!request.url.startsWith(environment.apiUrl)) {
    return next(request);
    }

    const requestWithCredentials = request.clone({
    withCredentials: true
    });

    return next(requestWithCredentials);
};