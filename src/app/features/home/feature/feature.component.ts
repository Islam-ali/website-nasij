import { Component } from '@angular/core';
import { FeatureService } from './feature.service';
import { Feature } from '../../../interfaces/feature.interface';
import { MultiLanguagePipe } from '../../../core/pipes/multi-language.pipe';
import { FallbackImgDirective } from "../../../core/directives";

@Component({
  selector: 'app-feature',
  standalone: true,
  imports: [MultiLanguagePipe, FallbackImgDirective],
  templateUrl: './feature.component.html',
})
export class FeatureComponent {
  features: Feature[] = [];
  constructor(private featureService: FeatureService) {
    this.featureService.getFeature().subscribe((features) => {
      this.features = features.data;
    });
  }
}
