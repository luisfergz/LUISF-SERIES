import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { HeaderComponent } from "./header/header.component";
import { FooterComponent } from './footer/footer.component';
import { NgxSpinnerModule, NgxSpinnerService } from "ngx-spinner";
import { CommonModule } from '@angular/common';
import { AuthService } from './services/auth.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterOutlet, HeaderComponent, FooterComponent, NgxSpinnerModule],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent {
  title = 'series';
  accesoPermitido = false;

  constructor(private spinner: NgxSpinnerService, private authService: AuthService) {}

  async ngOnInit() {
    this.spinner.hide();
    try {
      const user = await this.authService.getUser();
      this.accesoPermitido = !!user;
    } catch (err) {
      this.accesoPermitido = false;
    }
  }
}
