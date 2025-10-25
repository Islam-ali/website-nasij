import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { Carousel } from 'primeng/carousel';
import { ButtonModule } from 'primeng/button';
import { CommonModule } from '@angular/common';
import { environment } from '../../../../environments/environment';
import { ProductCardComponent } from "../product-card/product-card.component";

@Component({
  selector: 'app-carousel',
  imports: [Carousel, ButtonModule, CommonModule, ProductCardComponent],
  templateUrl: './carousel.component.html',
  styleUrl: './carousel.component.scss'
})

export class CarouselComponent implements OnInit {
  @Input() items: any[] = [];
  @Output() onItemClick: EventEmitter<any> = new EventEmitter<any>();
  responsiveOptions: any[] | undefined;
  domain = environment.domain;
  constructor() { }

  ngOnInit() {
    this.responsiveOptions = [
      {
        breakpoint: '1400px',
        numVisible: 3,
        numScroll: 1,
      },
      {
        breakpoint: '1199px',
        numVisible: 3,
        numScroll: 1,
      },
      {
        breakpoint: '767px',
        numVisible: 3,
        numScroll: 1,
      },
      {
        breakpoint: '575px',
        numVisible: 1,
        numScroll: 1,
      },
    ];
  }

  getSeverity(status: string) {
    switch (status) {
      case 'INSTOCK':
        return 'success';
      case 'LOWSTOCK':
        return 'warn';
      case 'OUTOFSTOCK':
        return 'danger';
      default:
        return 'info';
    }
  }
  toggleWishlist() {
    
  }
  addToCart() {
    
  }
}