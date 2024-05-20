import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ApplianceCardComponent } from './appliance-card.component';

describe('ApplianceCardComponent', () => {
  let component: ApplianceCardComponent;
  let fixture: ComponentFixture<ApplianceCardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ApplianceCardComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(ApplianceCardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
