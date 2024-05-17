import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BladeComponent } from './blade.component';

describe('BladeComponent', () => {
  let component: BladeComponent;
  let fixture: ComponentFixture<BladeComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BladeComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(BladeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
