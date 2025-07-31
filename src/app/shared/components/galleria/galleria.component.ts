
import { Component, OnInit } from '@angular/core';
import { GalleriaModule } from 'primeng/galleria';
import { CommonModule } from '@angular/common';

interface GalleriaImage {
  itemImageSrc: string;
  thumbnailImageSrc: string;
  alt: string;
  title: string;
}

@Component({
  selector: 'app-galleria',
  standalone: true,
  imports: [CommonModule, GalleriaModule],
  templateUrl: './galleria.component.html',
  styleUrls: ['./galleria.component.scss']
})
export class GalleriaComponent implements OnInit {
  images: GalleriaImage[] = [];
  activeIndex: number = 0;

  responsiveOptions: any[] = [
    {
      breakpoint: '1024px',
      numVisible: 3,
      numScroll: 3
    },
    {
      breakpoint: '768px',
      numVisible: 2,
      numScroll: 2
    },
    {
      breakpoint: '560px',
      numVisible: 1,
      numScroll: 1
    },
    {
      breakpoint: '575px',
      numVisible: 1,
      numScroll: 1
    }
  ];

  constructor() {}

  ngOnInit() {
    this.images = [
      {
        itemImageSrc: 'slider/img-1.jpg',
        thumbnailImageSrc: 'slider/img-1.jpg',
        alt: 'Fashion Sale',
        title: 'Mega Sale Up To 50% Off'
      },
      {
        itemImageSrc: 'slider/img-2.jpeg',
        thumbnailImageSrc: 'slider/img-2.jpeg',
        alt: 'New Collection',
        title: 'New Arrivals'
      },
      {
        itemImageSrc: 'slider/img-3.jpg',
        thumbnailImageSrc: 'slider/img-3.jpg',
        alt: 'Summer Sale',
        title: 'Summer Collection 2023'
      }
    ];
  }

  imageClicked(index: number) {
    this.activeIndex = index;
  }
}
