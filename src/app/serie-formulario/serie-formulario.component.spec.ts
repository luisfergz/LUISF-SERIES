import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SerieFormularioComponent } from './serie-formulario.component';

describe('SerieFormularioComponent', () => {
  let component: SerieFormularioComponent;
  let fixture: ComponentFixture<SerieFormularioComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SerieFormularioComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SerieFormularioComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
