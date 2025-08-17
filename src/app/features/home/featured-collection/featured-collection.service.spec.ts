import { TestBed } from '@angular/core/testing';

import { FeaturedCollectionService } from './featured-collection.service';

describe('FeaturedCollectionService', () => {
  let service: FeaturedCollectionService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(FeaturedCollectionService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
