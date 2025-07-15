import { Component, ElementRef, ViewChild } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { SeriesService } from '../services/series.service';
import { Serie, Temporada, InformacionTecnica } from '../models/serie.model';

@Component({
  selector: 'app-agregar-serie',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './agregar-serie.component.html',
  styleUrl: './agregar-serie.component.css'
})
export class AgregarSerieComponent {
  @ViewChild('serieAgregadaModal') modalRef!: ElementRef;
  formulario: FormGroup;

  constructor(private fb: FormBuilder, private seriesService: SeriesService) {
    this.formulario = this.fb.group({
      nombre: ['', Validators.required],
      sinopsis: [''],
      sinopsiscorta: [''],
      banner: [''],
      portada: [''],
      contrasena: [''],
      comentario: [''],
      slug: [''],
      temporadas: this.fb.array([]),
      informacion_tecnica: this.fb.array([]),
      activo: [true]
    });
  }

  ngOnInit() {
    this.formulario.get('nombre')?.valueChanges.subscribe(nombre => {
      const slug = this.generarSlug(nombre);
      this.formulario.get('slug')?.setValue(slug, { emitEvent: false });
    });
  }

  get temporadas() {
    return this.formulario.get('temporadas') as FormArray;
  }

  get informacion_tecnica() {
    return this.formulario.get('informacion_tecnica') as FormArray;
  }

  agregarTemporada() {
    this.temporadas.push(this.fb.group({
      temporada: ['', Validators.required],
      imagen: [''],
      link: ['']
    }));
  }

  eliminarTemporada(index: number) {
    this.temporadas.removeAt(index);
  }

  agregarInfoTecnica() {
    this.informacion_tecnica.push(this.fb.group({
      atributo: ['', Validators.required],
      valor: ['', Validators.required]
    }));
  }

  eliminarInfoTecnica(index: number) {
    this.informacion_tecnica.removeAt(index);
  }

  agregarSerie() {
    if (this.formulario.invalid) {
      this.formulario.markAllAsTouched();
      return;
    }

    const nombreSerie = this.formulario.value.nombre.trim();
    const slug = this.formulario.value.slug?.trim();

    // Validación de nombre y slug en paralelo
    Promise.all([
      this.seriesService.existeSerieConNombre(nombreSerie).toPromise(),
      this.seriesService.existeSerieConSlug(slug).toPromise()
    ])
      .then(([nombreExiste, slugExiste]) => {
        if (nombreExiste) {
          this.mostrarModal('Ya existe una serie con ese nombre.', 'aviso');
          return;
        }

        if (slugExiste) {
          this.mostrarModal('Ya existe una serie con esa URL personalizada.', 'aviso');
          return;
        }

        const nuevaSerie: Omit<Serie, 'id'> = {
          nombre: nombreSerie,
          sinopsis: this.formulario.value.sinopsis,
          sinopsiscorta: this.formulario.value.sinopsiscorta,
          banner: this.formulario.value.banner,
          portada: this.formulario.value.portada,
          contrasena: this.formulario.value.contrasena,
          comentario: this.formulario.value.comentario,
          slug,
          temporadas: this.temporadas.value,
          informacion_tecnica: this.informacion_tecnica.value,
          activo: this.formulario.value.activo ?? true,
        };

        this.seriesService.insertarSerie(nuevaSerie).subscribe({
          next: () => {
            this.mostrarModal('Serie agregada con éxito.', 'exito');
            this.limpiar();
          },
          error: (error) => {
            this.mostrarModal(`Error al agregar la serie: ${error.message}`, 'error');
          }
        });
      })
      .catch((error) => {
        this.mostrarModal(`Error al verificar los datos: ${error.message}`, 'error');
      });
  }

  generarSlug(texto: string | null | undefined): string {
    if (!texto) return '';
    return texto
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/--+/g, '-');
  }

  limpiar() {
    this.formulario.reset({
      nombre: '',
      sinopsis: '',
      sinopsiscorta: '',
      banner: '',
      portada: '',
      contrasena: '',
      comentario: '',
      slug: '',
      activo: true
    });

    this.temporadas.clear();
    this.informacion_tecnica.clear();
  }


  bannerError(event: Event) {
    const imgElement = event.target as HTMLImageElement;
    imgElement.src = '/general/default-image-large.png';
  }

  portadaError(event: Event) {
    const imgElement = event.target as HTMLImageElement;
    imgElement.src = '/general/default-image.png';
  }

  mostrarModal(mensaje: string, tipo: 'exito' | 'error' | 'aviso' = 'aviso') {
    const mensajeElemento = document.getElementById('modalMensaje');
    const header = document.getElementById('modalHeader');
    const boton = document.getElementById('modalBoton');

    if (mensajeElemento) mensajeElemento.textContent = mensaje;

    // Establecer clases según tipo
    if (header && boton) {
      header.className = 'modal-header';
      boton.className = 'btn';

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
