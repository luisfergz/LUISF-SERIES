import { CommonModule } from '@angular/common';
import { Component, HostListener } from '@angular/core';
import { Router, RouterModule } from '@angular/router';

declare var bootstrap: any;

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './header.component.html',
  styleUrl: './header.component.css'
})
export class HeaderComponent {
  isLoggedIn = true; // Cambiar a true si el usuario está autenticado
  userProfilePicture = 'general/user-default.jpg'; // Ruta por defecto o cargada dinámicamente
  userName = 'Jose Angel Guzman Zavalet'; // 25 chars Cambiar al nombre del usuario autenticado
  dropdownOpen = false; // Estado del menú desplegable

  accountActive: boolean = false;
  menuAbierto: boolean = false;
  cuentaAbierto: boolean = false;
  menu: any[] = [
    {
      nombre: 'Inicio',
      exact: true,
      icon: 'fa fa-home',
      url: '/'
    },
    {
      nombre: 'Series',
      exact: false,
      icon: 'fa-solid fa-tv',
      url: '/series'
    },
    // {
    //   nombre: 'Admin',
    //   exact: false,
    //   icon: 'fa-solid fa-user-gear',
    //   url: '/admin'
    // }
    // {
    //   nombre: 'Mis Películas',
    //   url: '/peliculas'
    // },
    // {
    //   nombre: 'Blog',
    //   url: '/blog'
    // }
  ];

  constructor(
    private router: Router
  ) {}

  ngOnInit() {
    this.router.events.subscribe(() => {
      this.closeMenu();
      this.closeAccount()
      this.dropdownOpen = false;
    });
  }

  alternarMenu() {
    this.menuAbierto = !this.menuAbierto;
    document.body.style.overflow = this.menuAbierto ? 'hidden' : '';
    if (this.cuentaAbierto) {
      this.alternarCuenta();
    }
  }

  alternarCuenta() {
    this.cuentaAbierto = !this.cuentaAbierto;
    document.body.style.overflow = this.cuentaAbierto ? 'hidden' : '';
    if (this.menuAbierto) {
      this.alternarMenu();
    }
  }

  closeMenu() {
    this.menuAbierto = false;
  }

  toggleAccount() {
    this.accountActive = !this.accountActive;
    this.closeMenu();
  }

  closeAccount() {
    this.accountActive = false;
  }

  toggleDropdown() {
    this.dropdownOpen = !this.dropdownOpen; // Alternar el estado del dropdown
  }

  logout() {
    // Lógica para cerrar sesión
    this.isLoggedIn = false;
    this.dropdownOpen = false;
  }

  // openSignupModal() {
  //   this.modalService.open(SignupComponent, {
  //     centered: true,
  //   });
  // }

  // openLoginModal() {
  //   const modalRef = this.modalService.open(LoginComponent, {
  //     centered: true,
  //   });

  //   modalRef.result
  //     .then((result) => {
  //       console.log('Resultado del modal:', result);
  //     })
  //     .catch((error) => {
  //       console.error('Error cerrando el modal:', error);
  //     });

  //   this.isLoggedIn = true;
  // }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: Event) {
    const target = event.target as HTMLElement;

    // Cerrar el dropdown si el clic no es dentro del menú o perfil
    if (!target.closest('.user-profile') && !target.closest('.dropdown-menu')) {
      this.dropdownOpen = false;
    }
  }
}
