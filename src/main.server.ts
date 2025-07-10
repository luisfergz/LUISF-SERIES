import { bootstrapApplication } from '@angular/platform-browser';
import { AppComponent } from './app/app.component';
import { provideClientHydration } from '@angular/platform-browser';
import { provideServerRendering } from '@angular/platform-server';

bootstrapApplication(AppComponent, {
  providers: [
    provideClientHydration(),
    provideServerRendering(),
    // Otros proveedores necesarios
  ],
}).catch(err => console.error(err));
