import { Component, Input } from '@angular/core';
import { RouterLink } from '@angular/router';

// Presentational shell shared by every legal page (privacy, terms, etc.). It owns
// the page chrome — title, "last updated" line, and prose typography — so each
// document only has to supply its body via <ng-content>.
@Component({
  selector: 'app-legal-layout',
  imports: [RouterLink],
  templateUrl: './legal-layout.component.html',
  styleUrl: './legal-layout.component.scss'
})
export class LegalLayoutComponent {
  @Input({ required: true }) title!: string;

  // Plain date string, e.g. 'June 21, 2026'. Surfaced verbatim under the title.
  @Input({ required: true }) lastUpdated!: string;
}
