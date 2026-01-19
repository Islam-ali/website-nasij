import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { HeroSectionService } from './hero-section.service';
import { HeroSection } from './hero-section';
import { MultiLanguagePipe } from '../../../core/pipes/multi-language.pipe';
import { FallbackImgDirective } from '../../../core/directives/fallback-img.directive';
import { TranslateModule } from '@ngx-translate/core';
import { environment } from '../../../../environments/environment';
import { SafePipe } from "../../../core/pipes/safe.pipe";
import { IResponsiveGridConfig } from '../../../interfaces/featured-collection';

@Component({
  selector: 'app-hero-section',
  standalone: true,
  imports: [CommonModule, RouterModule, MultiLanguagePipe, FallbackImgDirective, TranslateModule, SafePipe],
  templateUrl: './hero-section.component.html',
})
export class HeroSectionComponent implements OnInit {
  heroes: HeroSection[] = [];
  isLoading = true;
  loading = true;
  heroSection: any = null;
  domain = environment.domain+'/';
  videoPlayingStates: { [key: number]: boolean } = {};
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
      return 'grid-cols-2 md:grid-cols-3 auto-rows-[200px]  md:auto-rows-[280px]';
    }
    return 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3';
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
    if (url) {
      this.router.navigate([url]);
    }
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

  toggleVideoPlay(event: Event, videoElement: HTMLVideoElement, index: number): void {
    event.stopPropagation();
    
    try {
      if (videoElement.paused) {
        const playPromise = videoElement.play();
        
        // play() returns a Promise in modern browsers
        if (playPromise !== undefined) {
          playPromise
            .then(() => {
              this.videoPlayingStates[index] = true;
            })
            .catch(err => {
              // Ignore AbortError - it means play() was interrupted (user clicked pause quickly)
              // This is not a real error, just a normal interruption
              if (err?.name !== 'AbortError' && err?.constructor?.name !== 'AbortError') {
                // Only log real errors
              }
            });
        }
      } else {
        videoElement.pause();
        this.videoPlayingStates[index] = false;
      }
    } catch (err: any) {
      // Ignore AbortError in catch block as well
      if (err?.name !== 'AbortError' && err?.constructor?.name !== 'AbortError') {
      }
    }
  }

  onVideoPlay(event: Event, index: number): void {
    this.videoPlayingStates[index] = true;
  }

  onVideoPause(event: Event, index: number): void {
    this.videoPlayingStates[index] = false;
  }

  onVideoLoaded(event: Event, videoElement: HTMLVideoElement, index: number): void {
    // Try to start playing when video metadata is loaded
    // This ensures autoplay works even if it was blocked initially
    if (videoElement.paused) {
      const playPromise = videoElement.play();
      if (playPromise !== undefined) {
        playPromise
          .then(() => {
            this.videoPlayingStates[index] = true;
          })
          .catch(() => {
            // Autoplay was blocked (browser policy), keep paused state
            this.videoPlayingStates[index] = false;
          });
      }
    } else {
      // Video is already playing
      this.videoPlayingStates[index] = true;
    }
  }

  onVideoCanPlay(event: Event, videoElement: HTMLVideoElement, index: number): void {
    // Video is ready to play - ensure it starts playing if not already
    if (videoElement.paused && !this.videoPlayingStates[index]) {
      const playPromise = videoElement.play();
      if (playPromise !== undefined) {
        playPromise
          .then(() => {
            this.videoPlayingStates[index] = true;
          })
          .catch(() => {
            // Autoplay was blocked, but poster will show
            this.videoPlayingStates[index] = false;
          });
      }
    } else if (!videoElement.paused) {
      // Video is already playing
      this.videoPlayingStates[index] = true;
    }
  }

  onVideoCanPlayThrough(event: Event, videoElement: HTMLVideoElement, index: number): void {
    // Video can play through without stopping - ensure it's playing
    if (videoElement.paused && !this.videoPlayingStates[index]) {
      const playPromise = videoElement.play();
      if (playPromise !== undefined) {
        playPromise
          .then(() => {
            this.videoPlayingStates[index] = true;
          })
          .catch(() => {
            this.videoPlayingStates[index] = false;
          });
      }
    } else if (!videoElement.paused) {
      this.videoPlayingStates[index] = true;
    }
  }

  onVideoWaiting(event: Event, videoElement: HTMLVideoElement, index: number): void {
    // Video is buffering - poster will show automatically due to opacity classes
    // The poster image will fade in while video is buffering
  }
}
