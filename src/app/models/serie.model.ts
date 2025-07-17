export interface Temporada {
  temporada: string;  // Ej. "1", "Especial", etc.
  imagen: string;     // URL de la imagen
  link: string;       // Enlace de descarga
}

export interface Pelicula {
  pelicula: string;  // Ej. "1", "Especial", etc.
  imagen: string;     // URL de la imagen
  link: string;       // Enlace de descarga
}

export interface InformacionTecnica {
  atributo: string;  // Ej. "Audio", "Calidad"
  valor: string;     // Ej. "Español Latino", "1080p"
}

export interface Serie {
  id: number;  // ID de la serie
  nombre: string;  // Nombre de la serie
  sinopsis: string;  // Descripción larga
  sinopsiscorta: string;  // Descripción corta
  banner: string;  // Imagen de portada
  portada: string;  // Imagen principal
  contrasena: string;  // Contraseña
  comentario: string;  // Comentario de la serie
  slug: string;  // URL personalizada de la serie
  temporadas: Temporada[];  // Relación de temporadas
  peliculas: Pelicula[];  // Relación de temporadas
  informacion_tecnica: InformacionTecnica[];  // Relación de información técnica
  activo?: boolean;  // Indica si la serie está activa (opcional)
  creado?: Date;  // Fecha de creación (opcional)
}

export interface Carrusel {
  serie_id: number;  // ID de la serie
  posicion: number;  // Posición en el carrusel
}

export interface CarruselConSerie {
  serie: Serie;  // Detalles de la serie
  posicion: number;  // Posición en el carrusel
}