import { Component } from '@angular/core';
import { FeatureService } from './feature.service';
import { Feature } from '../../../interfaces/feature.interface';

@Component({
  selector: 'app-feature',
  imports: [],
  templateUrl: './feature.component.html',
  styleUrl: './feature.component.scss'
})
export class FeatureComponent {
  features: Feature[] = [];
  constructor(private featureService: FeatureService) {
    this.featureService.getFeature().subscribe((features) => {
      this.features = features.data;
    });
  }
}
