import { Component } from '@angular/core';
import { FeatureService } from './feature.service';
import { Feature } from '../../../interfaces/feature.interface';

@Component({
  selector: 'app-feature',
  imports: [],
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
