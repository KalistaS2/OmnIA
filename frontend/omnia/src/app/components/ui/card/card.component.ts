import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-card',
  standalone: true,
  imports: [CommonModule],
  styleUrl: './card.component.scss',
  host: { class: 'block' },
  template: `<div [class]="'rounded-xl border bg-card text-card-foreground shadow ' + customClass"><ng-content></ng-content></div>`,
})
export class CardComponent {
  @Input('class') customClass: string = '';
}

@Component({
  selector: 'app-card-header',
  standalone: true,
  imports: [CommonModule],
  styleUrl: './card.component.scss',
  template: `<div [class]="'flex flex-col space-y-1.5 p-6 ' + customClass"><ng-content></ng-content></div>`,
})
export class CardHeaderComponent {
  @Input('class') customClass: string = '';
}

@Component({
  selector: 'app-card-title',
  standalone: true,
  imports: [CommonModule],
  styleUrl: './card.component.scss',
  template: `<h3 [class]="'font-semibold leading-none tracking-tight ' + customClass"><ng-content></ng-content></h3>`,
})
export class CardTitleComponent {
  @Input('class') customClass: string = '';
}

@Component({
  selector: 'app-card-description',
  standalone: true,
  imports: [CommonModule],
  styleUrl: './card.component.scss',
  template: `<p [class]="'text-sm text-muted-foreground ' + customClass"><ng-content></ng-content></p>`,
})
export class CardDescriptionComponent {
  @Input('class') customClass: string = '';
}

@Component({
  selector: 'app-card-content',
  standalone: true,
  imports: [CommonModule],
  styleUrl: './card.component.scss',
  template: `<div [class]="'p-6 pt-0 ' + customClass"><ng-content></ng-content></div>`,
})
export class CardContentComponent {
  @Input('class') customClass: string = '';
}

@Component({
  selector: 'app-card-footer',
  standalone: true,
  imports: [CommonModule],
  styleUrl: './card.component.scss',
  template: `<div [class]="'flex items-center p-6 pt-0 ' + customClass"><ng-content></ng-content></div>`,
})
export class CardFooterComponent {
  @Input('class') customClass: string = '';
}

// Array facilitador para importar todos de uma vez
export const CARD_COMPONENTS = [
  CardComponent,
  CardHeaderComponent,
  CardTitleComponent,
  CardDescriptionComponent,
  CardContentComponent,
  CardFooterComponent,
] as const;