import { Component, ElementRef, ViewChild } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { SeriesService } from '../services/series.service';
import { AbstractControl, FormArray, FormBuilder, FormGroup, ReactiveFormsModule, ValidatorFn, Validators } from '@angular/forms';
import { Serie } from '../models/serie.model';
import { CommonModule } from '@angular/common';
import { NgxSpinnerService } from 'ngx-spinner';

@Component({
  selector: 'app-serie-formulario',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './serie-formulario.component.html',
  styleUrl: './serie-formulario.component.css'
})
export class SerieFormularioComponent {
  modoEdicion: boolean = false;
  formulario: FormGroup;
  serie_id: number | null = null;

  constructor(private route: ActivatedRoute, private fb: FormBuilder, private seriesService: SeriesService, private spinner: NgxSpinnerService) {
    this.formulario = this.fb.group({
      nombre: ['', Validators.required],
      sinopsis: [''],
      sinopsiscorta: [''],
      banner: [''],
      portada: [''],
      contrasena: [''],
      slug: ['', [Validators.required]],
      temporadas: this.fb.array([]),
      peliculas: this.fb.array([]),
      informacion_tecnica: this.fb.array([]),
      activo: [true],
    });
  }

  async ngOnInit() {
    this.spinner.show();
    console.log((await this.seriesService.client.auth.getUser()).data.user?.id);

    this.formulario.get('nombre')?.valueChanges.subscribe(nombre => {
      const slug = this.generarSlug(nombre);
      this.formulario.get('slug')?.setValue(slug, { emitEvent: false });
    });

    this.serie_id = this.route.snapshot.paramMap.get('id') ? parseInt(this.route.snapshot.paramMap.get('id')!) : null;
    this.modoEdicion = !!this.serie_id;

    if (this.modoEdicion && this.serie_id) {
      this.seriesService.obtenerSeriePorId(this.serie_id).subscribe({
        next: (serie) => {
          if (!serie) {
            this.mostrarModal('No se pudo cargar la serie', 'error');
            return;
          }

          // Carga los campos básicos
          this.formulario.patchValue(serie);

          // Carga temporadas
          this.temporadas.clear();
          if (Array.isArray(serie.temporadas)) {
            serie.temporadas.forEach((t: any) => this.agregarTemporada(t));
          }

          // Carga peliculas
          this.peliculas.clear();
          if (Array.isArray(serie.peliculas)) {
            serie.peliculas.forEach((p: any) => this.agregarPelicula(p));
          }

          // Carga información técnica
          this.informacion_tecnica.clear();
          if (Array.isArray(serie.informacion_tecnica)) {
            serie.informacion_tecnica.forEach((info: any) => this.agregarInfoTecnica(info));
          }
          this.mostrarContenido();
        },
        error: () => {
          this.mostrarContenido();
          this.mostrarModal('Error al cargar la serie', 'error')
        }
      });
    } else {
      const temporadas = [
        { temporada: '1', imagen: '', link: '' },
      ];
      temporadas.forEach(temp => this.agregarTemporada(temp));
      const peliculas = [
        { temporada: '1', imagen: '', link: '' },
      ];
      peliculas.forEach(peli => this.agregarPelicula(peli));
      const infoTecnica = [
        { atributo: 'Tamaño promedio por episodio', valor: '400 MB' },
        { atributo: 'Formato', valor: 'MKV' },
        { atributo: 'Calidad', valor: 'WEB-DL' },
        { atributo: 'Codec', valor: 'x264' },
        { atributo: 'Vídeo Bit Rate Promedio', valor: '2400 Kbps' },
        { atributo: 'Audio principal', valor: 'Español Latino AAC 2.0 (93.4 Kb/s)' },
        { atributo: 'Resolución', valor: '1280 x 720' },
        { atributo: 'Subtítulos', valor: 'Ninguno' },
        { atributo: 'Duración', valor: '24 min por episodio aproximadamente' },
        { atributo: 'Temporadas', valor: '4' },
        { atributo: 'Episodios', valor: '52/52' },
      ];
      infoTecnica.forEach(info => this.agregarInfoTecnica(info));
      this.mostrarContenido();
    }
  }

  mostrarContenido() {
    this.spinner.hide();
    const serieFormulario = document.getElementById('serie-formulario');
    if (serieFormulario) {
      serieFormulario.classList.add('active');
    }
  }

  get temporadas() {
    return this.formulario.get('temporadas') as FormArray;
  }

  get peliculas() {
    return this.formulario.get('peliculas') as FormArray;
  }

  get informacion_tecnica() {
    return this.formulario.get('informacion_tecnica') as FormArray;
  }

  agregarTemporada(data?: any) {
    this.temporadas.push(this.fb.group({
      temporada: [data?.temporada || '', Validators.required],
      imagen: [data?.imagen || ''],
      link: [data?.link || '']
    }));
  }

  eliminarTemporada(index: number) {
    this.temporadas.removeAt(index);
  }

  agregarPelicula(data?: any) {
    this.peliculas.push(this.fb.group({
      pelicula: [data?.pelicula || '', Validators.required],
      imagen: [data?.imagen || ''],
      link: [data?.link || '']
    }));
  }

  eliminarPelicula(index: number) {
    this.peliculas.removeAt(index);
  }

  agregarInfoTecnica(data?: any) {
    this.informacion_tecnica.push(this.fb.group({
      atributo: [data?.atributo || '', Validators.required],
      valor: [data?.valor || '', Validators.required]
    }));
  }

  eliminarInfoTecnica(index: number) {
    this.informacion_tecnica.removeAt(index);
  }

  guardarSerie() {
    this.formulario.markAllAsTouched();

    const temporadasValidas = this.validarCamposArray(this.temporadas, ['temporada']);
    const peliculasValidas = this.validarCamposArray(this.peliculas, ['pelicula']);
    const infoTecnicaValida = this.validarCamposArray(this.informacion_tecnica, ['atributo', 'valor']);

    if (!temporadasValidas) {
      this.mostrarModal('Cada temporada debe tener al menos el número de temporada.', 'aviso');
      return;
    }

    if (!peliculasValidas) {
      this.mostrarModal('Cada película debe tener al menos el número de película.', 'aviso');
      return;
    }

    if (!infoTecnicaValida) {
      this.mostrarModal('Cada entrada de información técnica debe tener atributo y valor.', 'aviso');
      return;
    }

    if (this.formulario.invalid) {
      this.mostrarModal('Completa todos los campos obligatorios.', 'aviso');
      return;
    }

    const nombreSerie = this.formulario.value.nombre.trim();
    const slug = this.formulario.value.slug?.trim();

    const nuevaSerie: Omit<Serie, 'id'> = {
      nombre: nombreSerie,
      sinopsis: this.formulario.value.sinopsis,
      sinopsiscorta: this.formulario.value.sinopsiscorta,
      banner: this.formulario.value.banner,
      portada: this.formulario.value.portada,
      contrasena: this.formulario.value.contrasena,
      slug,
      temporadas: this.temporadas.value,
      peliculas: this.peliculas.value,
      informacion_tecnica: this.informacion_tecnica.value,
      activo: this.formulario.value.activo ?? true,
    };

    if (this.modoEdicion && this.serie_id) {
      this.seriesService.actualizarSeriePorId(this.serie_id, nuevaSerie).subscribe({
        next: () => this.mostrarModal('Serie actualizada correctamente.', 'exito'),
        error: (err) => this.mostrarModal(`Error al actualizar: ${err.message}`, 'error')
      });
    } else {
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
      temporadas: [],
      peliculas: [],
      informacion_tecnica: [],
      activo: true
    });

    this.temporadas.clear();
    this.peliculas.clear();
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

  validarCamposArray(formArray: FormArray, camposRequeridos: string[]): boolean {
    return formArray.controls.every(group => {
      return camposRequeridos.every(campo => {
        const valor = group.get(campo)?.value;
        return valor !== null && valor !== '';
      });
    });
  }


}
