import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GestionarSeriesComponent } from './gestionar-series.component';

describe('GestionarSeriesComponent', () => {
  let component: GestionarSeriesComponent;
  let fixture: ComponentFixture<GestionarSeriesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [GestionarSeriesComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(GestionarSeriesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
