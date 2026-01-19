import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ICategory } from '../../../interfaces/category.interface';
import { MultiLanguagePipe } from '../../../core/pipes/multi-language.pipe';
import { TranslateModule } from '@ngx-translate/core';
import { FallbackImgDirective } from '../../../core/directives/fallback-img.directive';
import { HeaderAlignment } from '../../../interfaces/product-feature.interface';
import { BusinessProfileService } from '../../../services/business-profile.service';

@Component({
  selector: 'app-categories',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MultiLanguagePipe,
    TranslateModule,
    FallbackImgDirective
  ],
  templateUrl: './categories.component.html',
  styleUrl: './categories.component.scss'
})
export class CategoriesComponent {
  @Input() categories: ICategory[] = [];
  @Output() categoryClick = new EventEmitter<ICategory>();
  constructor(private businessProfileService: BusinessProfileService) {}
  onCategoryClick(category: ICategory): void {
    this.categoryClick.emit(category);
  }

  getHeaderAlignmentClass(): string {
    const alignment = this.businessProfileService.businessProfile.value?.headerAlignment || HeaderAlignment.CENTER;
    switch (alignment) {
      case HeaderAlignment.START:
        return 'text-start items-start justify-start';
      case HeaderAlignment.END:
      return 'flex flex-col ' + alignment;
      case HeaderAlignment.CENTER:
      default:
        return 'text-center items-center justify-center';
    }
  }
}
