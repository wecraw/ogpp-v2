import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { LegalLayoutComponent } from '../legal-layout/legal-layout.component';

@Component({
  selector: 'app-terms',
  imports: [LegalLayoutComponent, RouterLink],
  templateUrl: './terms.component.html'
})
export class TermsComponent {
  readonly lastUpdated = 'June 21, 2026';
}
