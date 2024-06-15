import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BuildComponentCardComponent } from './build-component-card.component';

describe('BuildComponentCardComponent', () => {
  let component: BuildComponentCardComponent;
  let fixture: ComponentFixture<BuildComponentCardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BuildComponentCardComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(BuildComponentCardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
