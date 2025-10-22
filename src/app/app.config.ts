import { ApplicationConfig, importProvidersFrom } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { provideRouter } from '@angular/router';
import { provideNgxMask } from 'ngx-mask';
import { routes } from './app.routes';  // se você tiver rotas, senão pode omitir provideRouter
import { provideHttpClient } from '@angular/common/http';

  export const appConfig: ApplicationConfig = {
  providers: [
    importProvidersFrom(FormsModule),
    provideRouter(routes),
    provideNgxMask(), // 👈 aqui
    provideHttpClient()
  ]
}; 
