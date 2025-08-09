import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';

@Component({
  selector: 'app-footer',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './footer.component.html',
  styleUrl: './footer.component.css'
})
export class FooterComponent {
  redes = [
    {
      nombre: 'Youtube',
      icon: 'fab fa-youtube',
      url: 'https://www.youtube.com/@LuisF-Series'
    },
    // {
    //   nombre: 'Facebook',
    //   icon: 'fab fa-facebook',
    //   url: 'https://www.facebook.com/luisf.series'
    // },
    // {
    //   nombre: 'Instagram',
    //   icon: 'fab fa-instagram',
    //   url: 'https://www.instagram.com/luisfseries'
    // },
    // {
    //   nombre: 'Twitter',
    //   icon: 'fab fa-twitter',
    //   url: 'https://twitter.com/luisfseries'
    // },
  ];

  currentYear: number = new Date().getFullYear();
}
