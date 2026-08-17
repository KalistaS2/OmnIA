import { Component } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { InputDirective } from './input.directive';

@Component({
  template: `<input appInput class="custom-class" />`,
  imports: [InputDirective],
})
class TestHostComponent {}

describe('InputDirective', () => {
  let fixture: ComponentFixture<TestHostComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TestHostComponent, InputDirective],
    }).compileComponents();

    fixture = TestBed.createComponent(TestHostComponent);
    fixture.detectChanges();
  });

  it('should create an instance', () => {
    const inputElement = fixture.nativeElement.querySelector('input');
    expect(inputElement).toBeTruthy();
    expect(inputElement.className).toContain('custom-class');
  });
});
