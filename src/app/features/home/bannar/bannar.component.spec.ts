import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BannarComponent } from './bannar.component';

describe('BannarComponent', () => {
  let component: BannarComponent;
  let fixture: ComponentFixture<BannarComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BannarComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(BannarComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
