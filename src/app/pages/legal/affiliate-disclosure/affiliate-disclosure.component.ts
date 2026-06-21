import { Component } from '@angular/core';
import { LegalLayoutComponent } from '../legal-layout/legal-layout.component';

@Component({
  selector: 'app-affiliate-disclosure',
  imports: [LegalLayoutComponent],
  templateUrl: './affiliate-disclosure.component.html'
})
export class AffiliateDisclosureComponent {
  readonly lastUpdated = 'June 21, 2026';
}
