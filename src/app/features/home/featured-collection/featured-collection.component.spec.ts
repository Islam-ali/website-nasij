import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FeaturedCollectionComponent } from './featured-collection.component';

describe('FeaturedCollectionComponent', () => {
  let component: FeaturedCollectionComponent;
  let fixture: ComponentFixture<FeaturedCollectionComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FeaturedCollectionComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FeaturedCollectionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
