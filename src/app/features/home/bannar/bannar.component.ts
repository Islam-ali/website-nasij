import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BannarService } from './bannar.service';
import { BaseResponse } from '../../../core/models/baseResponse';
import { Banner } from '../../../interfaces/banner.interface';
import { RouterModule } from '@angular/router';
import { MultiLanguagePipe } from '../../../core/pipes/multi-language.pipe';
import { FallbackImgDirective } from '../../../core/directives/fallback-img.directive';
  
@Component({
  selector: 'app-bannar',
  standalone: true,
  imports: [CommonModule , RouterModule, MultiLanguagePipe, FallbackImgDirective],
  templateUrl: './bannar.component.html',
})
export class BannarComponent {
  bannar = signal<Banner[]>([]);
  constructor(private bannarService: BannarService) {
    this.bannarService.getBannar().subscribe((bannar: BaseResponse<Banner[]>) => {
      this.bannar.set(bannar.data);
    });
  }

}
