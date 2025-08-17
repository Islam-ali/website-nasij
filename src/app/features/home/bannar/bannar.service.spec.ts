import { TestBed } from '@angular/core/testing';

import { BannarService } from './bannar.service';

describe('BannarService', () => {
  let service: BannarService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(BannarService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
