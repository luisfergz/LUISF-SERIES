export interface Temporada {
  id: number;
  serie_id: string;
  temporada: string;
  imagen: string;
  link: string;
}

export interface InformacionTecnica {
  id: number;
  serie_id: string;
  atributo: string;
  valor: string;
}

export interface Serie {
  id: string;  // ID de la serie
  pos: number;  // Posición en el carrusel
  nombre: string;  // Nombre de la serie
  sinopsis: string;  // Descripción larga
  sinopsiscorta: string;  // Descripción corta
  portada: string;  // Imagen de portada
  imagen: string;  // Imagen principal
  contrasena: string;  // Contraseña
  comentario: string;  // Comentario de la serie
  temporada: Temporada[];  // Relación de temporadas
  informacion_tecnica: InformacionTecnica[];  // Relación de información técnica
}
