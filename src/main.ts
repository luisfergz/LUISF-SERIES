import { bootstrapApplication } from '@angular/platform-browser';
import { appConfig } from './app/app.config';
import { AppComponent } from './app/app.component';

const originalConsoleError = console.error;
console.error = (...args: any[]) => {
  if (args[0] instanceof Error && args[0].message.includes('Acquiring an exclusive Navigator LockManager lock')) {
    return; // Suprime el error específico
  }
  originalConsoleError(...args); // De lo contrario, llama al método original
};

bootstrapApplication(AppComponent, appConfig)
  .catch((err) => console.error(err));
