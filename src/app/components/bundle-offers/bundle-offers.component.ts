import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { ProductBundleOfferView } from 'src/app/interfaces/ProductBundleOffer';

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
  @Output() applyOffer = new EventEmitter<ProductBundleOfferView>();

  savings(offer: ProductBundleOfferView): number {
    return offer.compareAtPrice - offer.price;
  }
}
