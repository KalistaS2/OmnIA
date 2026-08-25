import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-panel',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './panel.component.html',
  styleUrl: './panel.component.scss',
  host: {
    class: 'block',
  },
})
export class PanelComponent {
  @Input() title?: string;
  @Input() description?: string;
  @Input() customClass: string = '';
}