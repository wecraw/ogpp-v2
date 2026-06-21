import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { LegalLayoutComponent } from '../legal-layout/legal-layout.component';

@Component({
  selector: 'app-privacy',
  imports: [LegalLayoutComponent, RouterLink],
  templateUrl: './privacy.component.html'
})
export class PrivacyComponent {
  readonly lastUpdated = 'June 21, 2026';
}
