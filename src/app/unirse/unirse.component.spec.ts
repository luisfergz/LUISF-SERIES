import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UnirseComponent } from './unirse.component';

describe('UnirseComponent', () => {
  let component: UnirseComponent;
  let fixture: ComponentFixture<UnirseComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [UnirseComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(UnirseComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
