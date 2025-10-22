import { bootstrapApplication } from '@angular/platform-browser';
import { App } from './app/app';
import { provideHttpClient } from '@angular/common/http';
import { provideNgxMask } from 'ngx-mask';
 
bootstrapApplication(App, {
  providers: [
    provideHttpClient(),
    provideNgxMask() // ✅ Adicione esta linha aqui
  ]
});