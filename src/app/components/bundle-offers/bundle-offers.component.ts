import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { Inverter } from 'src/app/interfaces/Inverter';
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
  // The anchor power station these offers are built around; drives the heading
  // so it always names the actually-picked unit (e.g. "Bluetti AC200MAX bundles").
  @Input() anchorInverter?: Inverter;
  // Labels for the apply action so the grid can read as "Use this bundle" on
  // checkout and "Customize this build" on the results page.
  @Input() applyLabel = 'Use this bundle';
  @Input() appliedLabel = 'Bundle applied';
  @Output() applyOffer = new EventEmitter<ProductBundleOfferView>();

  constructor(private affiliateLink: AffiliateLinkService) {}

  // "<brand> <name> bundles", falling back to a generic label when no anchor
  // station is set.
  get bundleHeading(): string {
    const label = [this.anchorInverter?.brand, this.anchorInverter?.name]
      .filter(part => !!part?.trim())
      .join(' ')
      .trim();
    return label ? `${label} bundles` : 'Recommended bundles';
  }

  savings(offer: ProductBundleOfferView): number {
    return offer.compareAtPrice - offer.price;
  }

  // The outbound "buy" CTA, decorated with affiliate/UTM params for this vendor.
  vendorLink(offer: ProductBundleOfferView): string {
    return this.affiliateLink.decorate(offer.vendorUrl, offer.vendor);
  }
}
