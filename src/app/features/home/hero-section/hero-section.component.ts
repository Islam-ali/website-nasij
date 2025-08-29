import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { HeroSectionService } from './hero-section.service';
import { HeroSection } from './hero-section';

@Component({
  selector: 'app-hero-section',
  imports: [CommonModule, RouterModule],
  templateUrl: './hero-section.component.html',
})
export class HeroSectionComponent implements OnInit {
  heroes: HeroSection[] = [];
  isLoading = true;
  loading = true;
  heroSection: any = null;

  constructor(
    private heroSectionService: HeroSectionService,
    private router: Router
  ) {}

  ngOnInit() {
    this.heroSectionService.getHeroesActive().subscribe((response) => {
      this.heroes = response.data;
      this.isLoading = false;
    });
  }

  // Compute grid container classes based on total count
  getGridClasses(total: number): string {
    if (total === 1) {
      return 'grid-cols-1 auto-rows-[540px]';
    } else if (total === 2) {
      return 'grid-cols-1 sm:grid-cols-2 auto-rows-[200px] sm:auto-rows-[350px] md:auto-rows-[400px] lg:auto-rows-[500px]';
    } else if (total >= 3) {
      return 'grid-cols-2 md:grid-cols-3 auto-rows-[160px]  md:auto-rows-[240px]';
    }
    return 'grid-cols-1 auto-rows-[400px]';
  }

  // Compute tile classes based on index and total count
  getTileClasses(index: number, total: number): string[] {
    const classes: string[] = [];

    if (total === 1) {
      // واحد: يعرض بالكامل
      classes.push('col-span-1 row-span-1');
    } else if (total === 2) {
      // اثنان: نصفين متساويين
      classes.push('col-span-1 sm:col-span-1 row-span-1');
    } else if (total >= 3) {
      // ثلاثة: واحد كبير + اثنان فوق بعض
      if (index === 0) {
        // العنصر الأول كبير
        classes.push(' row-span-2 col-span-2 col-span-1 sm:col-span-2 md:col-span-2 row-span-1 md:row-span-2');
      } else {
        // باقي العناصر صغيرة
        classes.push('col-span-1 sm:col-span-1 md:col-span-1 row-span-1');
      }
    }

    return classes;
  }

  // Compute title classes based on total count and index
  getTitleClasses(total: number, index: number): string {
    if (total === 1) {
      return 'text-4xl lg:text-5xl';
    } else if (total === 2) {
      return 'text-3xl lg:text-4xl';
    } else if (total >= 3) {
      if (index === 0) {
        return 'text-3xl lg:text-4xl';
      } else {
        return 'text-xl lg:text-2xl';
      }
    }
    return 'text-2xl lg:text-3xl';
  }

  // Compute subtitle classes based on total count and index
  getSubtitleClasses(total: number, index: number): string {
    if (total === 1) {
      return 'text-lg lg:text-xl';
    } else if (total === 2) {
      return 'text-base lg:text-lg';
    } else if (total >= 3) {
      if (index === 0) {
        return 'text-base lg:text-lg';
      } else {
        return 'text-sm lg:text-base';
      }
    }
    return 'text-sm lg:text-base';
  }

  // Compute button classes based on total count and index
  getButtonClasses(total: number, index: number): string {
    if (total === 1) {
      return 'px-8 py-3 text-lg';
    } else if (total === 2) {
      return 'px-6 py-2 text-base';
    } else if (total >= 3) {
      if (index === 0) {
        return 'px-6 py-2 text-base';
      } else {
        return 'px-4 py-2 text-sm';
      }
    }
    return 'px-5 py-2 text-base';
  }

  navigateTo(url: string) {
    this.router.navigate([url]);
  }
  
  navigateToProducts() {
    this.router.navigate(['/products']);
  }
  
  navigateToCategories() {
    this.router.navigate(['/categories']);
  }
  
  navigateToButton(button: any) {
    if (button && button.link) {
      this.router.navigate([button.link]);
    }
  }
}
