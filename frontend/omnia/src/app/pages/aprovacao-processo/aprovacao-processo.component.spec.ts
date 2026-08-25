import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { AprovacaoProcessoComponent } from './aprovacao-processo.component';

describe('AprovacaoProcessoComponent', () => {
  let component: AprovacaoProcessoComponent;
  let fixture: ComponentFixture<AprovacaoProcessoComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AprovacaoProcessoComponent],
      providers: [provideRouter([])],
    }).compileComponents();

    fixture = TestBed.createComponent(AprovacaoProcessoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
