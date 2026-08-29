import {
  ApplicationConfig,
  inject,
  provideAppInitializer,
  provideBrowserGlobalErrorListeners,
} from '@angular/core';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { provideRouter } from '@angular/router';
import { firstValueFrom } from 'rxjs';
import { routes } from '@src/app/app.routes';
import { authInterceptor } from '@src/app/core/auth/auth.interceptor';
import { AuthService } from '@src/app/core/auth/auth.service';
import { ThemeService } from '@src/app/features/profile/components/theme/theme.service';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideRouter(routes),
    provideHttpClient(withInterceptors([authInterceptor])),
    provideAppInitializer(() => {
      inject(ThemeService);
      return firstValueFrom(inject(AuthService).restoreSession());
    }),
  ],
};
