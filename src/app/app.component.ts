import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { HeaderComponent } from "./header/header.component";
import { FooterComponent } from './footer/footer.component';
import { NgxSpinnerModule, NgxSpinnerService } from "ngx-spinner";
import { MenuFlotanteComponent } from "./menu-flotante/menu-flotante.component";

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, HeaderComponent, FooterComponent, NgxSpinnerModule, MenuFlotanteComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent {
  title = 'series';

  constructor(private spinner: NgxSpinnerService) {}

  ngOnInit(): void {
    this.spinner.hide();
  }
}
