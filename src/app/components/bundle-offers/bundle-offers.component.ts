import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { ProductBundleOfferView } from 'src/app/interfaces/ProductBundleOffer';
import { AffiliateLinkService } from 'src/app/services/affiliate-link.service';

@Component({
  selector: 'app-bundle-offers',
  imports: [CommonModule],
  templateUrl: './bundle-offers.component.html',
  styleUrl: './bundle-offers.component.scss'
})
export class BundleOffersComponent {
  @Input() offers: ProductBundleOfferView[] = [];
  @Input() recommendedOfferId?: string;
  @Input() activeOfferId?: string;
  // Labels for the apply action so the grid can read as "Use this bundle" on
  // checkout and "Customize this build" on the results page.
  @Input() applyLabel = 'Use this bundle';
  @Input() appliedLabel = 'Bundle applied';
  @Output() applyOffer = new EventEmitter<ProductBundleOfferView>();

  constructor(private affiliateLink: AffiliateLinkService) {}

  savings(offer: ProductBundleOfferView): number {
    return offer.compareAtPrice - offer.price;
  }

  // The outbound "buy" CTA, decorated with affiliate/UTM params for this vendor.
  vendorLink(offer: ProductBundleOfferView): string {
    return this.affiliateLink.decorate(offer.vendorUrl, offer.vendor);
  }
}
