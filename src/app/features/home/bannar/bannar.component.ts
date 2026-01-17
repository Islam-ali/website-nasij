import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BannarService } from './bannar.service';
import { BaseResponse } from '../../../core/models/baseResponse';
import { Banner } from '../../../interfaces/banner.interface';
import { Router, RouterModule } from '@angular/router';
import { MultiLanguagePipe } from '../../../core/pipes/multi-language.pipe';
import { FallbackImgDirective } from '../../../core/directives/fallback-img.directive';
import { environment } from '../../../../environments/environment';
import { SafePipe } from '../../../core/pipes';
@Component({
  selector: 'app-bannar',
  standalone: true,
  imports: [CommonModule , RouterModule, MultiLanguagePipe, FallbackImgDirective, SafePipe],
  templateUrl: './bannar.component.html',
})
export class BannarComponent {
  bannar = signal<Banner[]>([]);
  domain = environment.domain+'/';
  constructor(private bannarService: BannarService, private router: Router) {
    this.bannarService.getBannar().subscribe((bannar: BaseResponse<Banner[]>) => {
      this.bannar.set(bannar.data);
    });
  }

  navigateTo(url: string) {
    this.router.navigateByUrl(url);
  }
}
