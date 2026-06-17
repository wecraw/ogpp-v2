import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { BundleOffersComponent } from 'src/app/components/bundle-offers/bundle-offers.component';
import { batteries as batteryCatalog } from 'src/app/content/batteries';
import { inverters } from 'src/app/content/inverters';
import { solarPanels as solarPanelCatalog } from 'src/app/content/solarPanels';
import { Battery } from 'src/app/interfaces/Battery';
import { Build, defaultBuild } from 'src/app/interfaces/Build';
import { Inverter } from 'src/app/interfaces/Inverter';
import { ProductBundleOfferView } from 'src/app/interfaces/ProductBundleOffer';
import { PowerSource } from 'src/app/interfaces/PowerSource';
import { BuildService } from 'src/app/services/build.service';
import { CalculationUtilsService } from 'src/app/services/calculation-utils.service';
import { ProductDealsService } from 'src/app/services/product-deals.service';
import { ProductSelectorService } from 'src/app/services/product-selector.service';

export interface CheckoutLineItem {
  id: string;
  role: string;
  icon?: string;
  name: string;
  brand: string;
  quantity: number;
  unitPrice: number;
  lineTotal: number;
  lineSavings: number;
  productUrl?: string;
}

@Component({
  selector: 'app-checkout',
  imports: [CommonModule, BundleOffersComponent],
  templateUrl: './checkout.component.html',
  styleUrl: './checkout.component.scss'
})
export class CheckoutComponent implements OnInit {
  public build: Build = defaultBuild;
  public buildNotFound = false;
  public offers: ProductBundleOfferView[] = [];
  public recommendedOfferId?: string;
  public batteryQuantities: Record<string, number> = {};
  public solarQuantities: Record<string, number> = {};
  public totalPrice = 0;
  public compareAtTotal = 0;
  public totalSavings = 0;
  public lineItems: CheckoutLineItem[] = [];

  private batteries: Battery[] = [];
  private solarPanels: PowerSource[] = [];

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private buildService: BuildService,
    private calculationUtils: CalculationUtilsService,
    private productDealsService: ProductDealsService,
    private productSelectorService: ProductSelectorService
  ) {}

  ngOnInit() {
    this.route.queryParams.subscribe(params => {
      const buildId = params['buildId'];
      const existingBuild = buildId ? this.buildService.getBuild(buildId) : null;
      if (!existingBuild) {
        this.buildNotFound = true;
        return;
      }

      this.buildNotFound = false;
      this.build = existingBuild;
      this.refreshCatalogSelections();
      this.offers = this.productDealsService.getOffersForInverter(this.build.inverter?.id);
      this.recommendedOfferId = this.productDealsService.getRecommendedOffer(
        this.offers,
        this.calculationUtils.totalWattHours(this.build),
        this.calculationUtils.wattageNeeded(this.build)
      )?.id;
      this.validateBundleSelection();
      this.computePricing();
    });
  }

  get activeBundleOffer(): ProductBundleOfferView | undefined {
    const offer = this.offers.find(item => item.id === this.build.bundleOfferId);
    if (
      !offer ||
      !this.productDealsService.isOfferSatisfied(
        offer,
        this.batteryQuantities,
        this.solarQuantities
      )
    ) {
      return undefined;
    }
    return offer;
  }

  get stationCapacity(): number {
    return (
      (this.build.inverter?.batteryCapacity ?? 0) +
      this.build.batteries.reduce((total, battery) => total + battery.batteryCapacity, 0)
    );
  }

  get solarWattage(): number {
    return this.build.powerSources.reduce((total, panel) => total + panel.maxOutput, 0);
  }

  applyBundle(offer: ProductBundleOfferView) {
    this.build.bundleOfferId = offer.id;
    this.batteryQuantities = this.mergeRequiredQuantities(
      this.batteryQuantities,
      offer.batteryQuantities
    );
    this.solarQuantities = this.mergeRequiredQuantities(
      this.solarQuantities,
      offer.powerSourceQuantities
    );
    this.build.batteries = this.flatten(this.batteries, this.batteryQuantities);
    this.build.powerSources = this.flatten(this.solarPanels, this.solarQuantities);
    this.computePricing();
    this.save();
  }

  backToBuild() {
    this.router.navigate(['/build'], { queryParams: { buildId: this.build.id } });
  }

  viewSavedBuilds() {
    if (!this.buildNotFound) this.save();
    this.router.navigate(['/builds']);
  }

  private refreshCatalogSelections() {
    const currentInverter = inverters.find(inverter => inverter.id === this.build.inverter?.id);
    if (currentInverter) this.build.inverter = currentInverter;

    this.batteries = this.productSelectorService.getMatchingBatteries(this.build);
    this.solarPanels = this.productSelectorService.getMatchingSolarPanels(this.build);
    this.batteryQuantities = this.groupQuantities(this.build.batteries ?? []);
    this.solarQuantities = this.groupQuantities(this.build.powerSources ?? []);
    this.build.batteries = this.flatten(this.batteries, this.batteryQuantities);
    this.build.powerSources = this.flatten(this.solarPanels, this.solarQuantities);
  }

  private computePricing() {
    const offer = this.activeBundleOffer;

    if (!offer) {
      this.totalPrice =
        (this.build.inverter?.price ?? 0) +
        this.build.batteries.reduce((total, battery) => total + battery.price, 0) +
        this.build.powerSources.reduce((total, panel) => total + panel.price, 0);
      this.compareAtTotal =
        (this.build.inverter?.listPrice ?? this.build.inverter?.price ?? 0) +
        this.build.batteries.reduce(
          (total, battery) => total + (battery.listPrice ?? battery.price),
          0
        ) +
        this.build.powerSources.reduce(
          (total, panel) => total + (panel.listPrice ?? panel.price),
          0
        );
    } else {
      this.totalPrice = offer.price;
      this.compareAtTotal = offer.compareAtPrice;
      this.addExtraProductPrices(offer);
    }

    this.totalSavings = Math.max(this.compareAtTotal - this.totalPrice, 0);
    this.buildLineItems();
  }

  private buildLineItems() {
    const items: CheckoutLineItem[] = [];

    if (this.build.inverter?.id) {
      items.push(this.toLineItem(this.build.inverter, 'Power station', 1));
    }

    for (const [id, quantity] of Object.entries(this.batteryQuantities)) {
      if (quantity <= 0) continue;
      const battery = this.batteries.find(item => item.id === id);
      if (battery) items.push(this.toLineItem(battery, 'Expansion battery', quantity));
    }

    for (const [id, quantity] of Object.entries(this.solarQuantities)) {
      if (quantity <= 0) continue;
      const panel = this.solarPanels.find(item => item.id === id);
      if (panel) items.push(this.toLineItem(panel, 'Solar panel', quantity));
    }

    this.lineItems = items;
  }

  private toLineItem(
    product: Inverter | Battery | PowerSource,
    role: string,
    quantity: number
  ): CheckoutLineItem {
    const unitPrice = product.price;
    const unitListPrice = product.listPrice ?? product.price;
    return {
      id: product.id ?? role,
      role,
      icon: product.icon,
      name: product.name,
      brand: product.brand,
      quantity,
      unitPrice,
      lineTotal: unitPrice * quantity,
      lineSavings: Math.max(unitListPrice - unitPrice, 0) * quantity,
      productUrl: product.productUrl
    };
  }

  private addExtraProductPrices(offer: ProductBundleOfferView) {
    for (const battery of batteryCatalog) {
      if (!battery.id) continue;
      const extras = Math.max(
        (this.batteryQuantities[battery.id] ?? 0) -
          (offer.batteryQuantities[battery.id] ?? 0),
        0
      );
      this.totalPrice += extras * battery.price;
      this.compareAtTotal += extras * (battery.listPrice ?? battery.price);
    }

    for (const panel of solarPanelCatalog) {
      if (!panel.id) continue;
      const extras = Math.max(
        (this.solarQuantities[panel.id] ?? 0) -
          (offer.powerSourceQuantities[panel.id] ?? 0),
        0
      );
      this.totalPrice += extras * panel.price;
      this.compareAtTotal += extras * (panel.listPrice ?? panel.price);
    }
  }

  private validateBundleSelection() {
    if (this.build.bundleOfferId && !this.activeBundleOffer) {
      this.build.bundleOfferId = undefined;
    }
  }

  private flatten<T extends { id?: string }>(
    items: T[],
    quantities: Record<string, number>
  ): T[] {
    const result: T[] = [];
    for (const item of items) {
      const quantity = item.id ? quantities[item.id] ?? 0 : 0;
      for (let index = 0; index < quantity; index++) {
        result.push(item);
      }
    }
    return result;
  }

  private groupQuantities(items: { id?: string }[]): Record<string, number> {
    const quantities: Record<string, number> = {};
    for (const item of items) {
      if (!item.id) continue;
      quantities[item.id] = (quantities[item.id] ?? 0) + 1;
    }
    return quantities;
  }

  private mergeRequiredQuantities(
    selected: Record<string, number>,
    required: Record<string, number>
  ): Record<string, number> {
    const merged = { ...selected };
    for (const [id, quantity] of Object.entries(required)) {
      merged[id] = Math.max(merged[id] ?? 0, quantity);
    }
    return merged;
  }

  private save() {
    this.build.lastEdited = new Date();
    this.buildService.saveBuild(this.build);
  }
}
