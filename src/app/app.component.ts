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

  mostrarModal(mensaje: string, tipo: 'exito' | 'error' | 'aviso' = 'aviso') {
    const mensajeElemento = document.getElementById('modalMensaje');
    const header = document.getElementById('divHeader');
    const boton = document.getElementById('modalBoton');

    if (mensajeElemento) mensajeElemento.textContent = mensaje;

    // Establecer clases según tipo
    if (header && boton) {
      switch (tipo) {
        case 'exito':
          header.classList.add('bg-success', 'text-white');
          boton.classList.add('btn-success');
          break;
        case 'error':
          header.classList.add('bg-danger', 'text-white');
          boton.classList.add('btn-danger');
          break;
        case 'aviso':
        default:
          header.classList.add('bg-warning', 'text-dark');
          boton.classList.add('btn-warning');
          break;
      }
    }

    const modalElement = document.getElementById('modalAlerta');
    const modal = (window as any).bootstrap?.Modal.getOrCreateInstance(modalElement);
    modal.show();

  }
}
