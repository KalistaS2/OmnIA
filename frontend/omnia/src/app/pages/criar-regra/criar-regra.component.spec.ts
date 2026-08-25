import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { CriarRegraComponent } from './criar-regra.component';

describe('CriarRegraComponent', () => {
  let component: CriarRegraComponent;
  let fixture: ComponentFixture<CriarRegraComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CriarRegraComponent],
      providers: [provideRouter([])],
    }).compileComponents();

    fixture = TestBed.createComponent(CriarRegraComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
