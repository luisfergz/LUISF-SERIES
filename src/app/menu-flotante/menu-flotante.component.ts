import {
  Component,
  ElementRef,
  HostListener,
  ViewChild,
  AfterViewInit,
  OnDestroy,
} from '@angular/core';
import { AuthService } from '../services/auth.service';
import { CommonModule } from '@angular/common';
import { NavigationEnd, Router, RouterModule } from '@angular/router';
import { Collapse } from 'bootstrap';
import { filter, Subscription, firstValueFrom } from 'rxjs';
import { SeriesService } from '../services/series.service';

@Component({
  selector: 'app-menu-flotante',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './menu-flotante.component.html',
  styleUrl: './menu-flotante.component.css'
})
export class MenuFlotanteComponent implements AfterViewInit, OnDestroy {
  accesoPermitido = false;
  @ViewChild('menuRef') menuRef!: ElementRef;
  @ViewChild('toggleBtn') toggleBtn!: ElementRef;
  private bsCollapse?: Collapse;
  private menuVisible = false;
  private navSub?: Subscription;

  constructor(
    private authService: AuthService,
    private router: Router,
    private seriesService: SeriesService
  ) {}

  async ngOnInit() {
    try {
      const user = await this.authService.getUser();
      if (!user) return;

      this.accesoPermitido = await firstValueFrom(this.seriesService.esUsuarioAdmin());

    } catch (err) {
      console.error('Error en ngOnInit:', err);
    }
  }

  ngAfterViewInit(): void {
    if (this.accesoPermitido) this.initCollapse();
  }

  ngOnDestroy(): void {
    this.navSub?.unsubscribe();
  }

  toggleMenu(): void {
    if (!this.bsCollapse) return;
    this.menuVisible ? this.bsCollapse.hide() : this.bsCollapse.show();
    this.menuVisible = !this.menuVisible;
  }

  private initCollapse(): void {
    if (!this.menuRef?.nativeElement || this.bsCollapse) return;

    this.bsCollapse = new Collapse(this.menuRef.nativeElement, { toggle: false });

    this.navSub = this.router.events
      .pipe(filter(event => event instanceof NavigationEnd))
      .subscribe(() => {
        this.bsCollapse?.hide();
        this.menuVisible = false;
      });
  }

  @HostListener('document:click', ['$event'])
  onClickOutside(event: MouseEvent): void {
    const target = event.target as HTMLElement;
    if (
      !this.menuRef?.nativeElement.contains(target) &&
      !this.toggleBtn?.nativeElement.contains(target)
    ) {
      this.bsCollapse?.hide();
      this.menuVisible = false;
    }
  }

  async cerrarSesion(): Promise<void> {
    try {
      await this.authService.signOut();
      window.location.reload();
    } catch (err: any) {
      console.error('Error al cerrar sesión:', err.message);
    }
  }
}
