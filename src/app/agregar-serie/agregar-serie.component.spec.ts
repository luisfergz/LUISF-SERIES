import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AgregarSerieComponent } from './agregar-serie.component';

describe('AgregarSerieComponent', () => {
  let component: AgregarSerieComponent;
  let fixture: ComponentFixture<AgregarSerieComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AgregarSerieComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AgregarSerieComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
