import {
  Component,
  ElementRef,
  HostListener,
  ViewChild,
  AfterViewInit
} from '@angular/core';
import { AuthService } from '../services/auth.service';
import { CommonModule } from '@angular/common';
import { NavigationEnd, Router, RouterModule } from '@angular/router';
import { Collapse } from 'bootstrap';
import { filter } from 'rxjs/operators';

@Component({
  selector: 'app-menu-flotante',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './menu-flotante.component.html',
  styleUrl: './menu-flotante.component.css'
})
export class MenuFlotanteComponent implements AfterViewInit {
  accesoPermitido = false;
  @ViewChild('menuRef') menuRef!: ElementRef;
  @ViewChild('toggleBtn') toggleBtn!: ElementRef;
  private bsCollapse?: Collapse;
  private menuVisible = false;

  constructor(private authService: AuthService, private router: Router) { }

  async ngOnInit() {
    try {
      const user = await this.authService.getUser();
      this.accesoPermitido = !!user;

      // Esperar al próximo ciclo para asegurar que menuRef esté disponible
      setTimeout(() => this.initCollapse(), 0);
    } catch {
      this.accesoPermitido = false;
    }
  }

  ngAfterViewInit(): void {
    // Si ya tienes acceso, intenta inicializar por seguridad
    if (this.accesoPermitido) {
      this.initCollapse();
    }
  }

  toggleMenu() {
    if (!this.bsCollapse) return;
    if (this.menuVisible) {
      this.bsCollapse.hide();
    } else {
      this.bsCollapse.show();
    }
    this.menuVisible = !this.menuVisible;
  }

  private initCollapse(): void {
    if (this.menuRef?.nativeElement && !this.bsCollapse) {
      this.bsCollapse = new Collapse(this.menuRef.nativeElement, {
        toggle: false
      });

      this.router.events
        .pipe(filter(event => event instanceof NavigationEnd))
        .subscribe(() => {
          this.bsCollapse?.hide();
          this.menuVisible = false;
        });
    }
  }

  @HostListener('document:click', ['$event'])
  onClickOutside(event: MouseEvent): void {
    const target = event.target as HTMLElement;
    const clickedInsideMenu = this.menuRef?.nativeElement.contains(target);
    const clickedToggleBtn = this.toggleBtn?.nativeElement.contains(target);

    if (!clickedInsideMenu && !clickedToggleBtn) {
      this.bsCollapse?.hide();
      this.menuVisible = false;
    }
  }

  async cerrarSesion() {
    try {
      await this.authService.signOut();
      window.location.reload();
    } catch (err: any) {
      console.error('Error al cerrar sesión:', err.message);
    }
  }

}
