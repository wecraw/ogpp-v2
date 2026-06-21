import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { BundleOffersComponent } from 'src/app/components/bundle-offers/bundle-offers.component';
import { batteries as batteryCatalog } from 'src/app/content/batteries';
import { solarPanels as solarPanelCatalog } from 'src/app/content/solarPanels';
import {
  INVERTER_EXPLANATION,
  INVERTER_EXPLANATION_TITLE,
  STEP_UP_TITLE,
  STEP_UP_NOTICE
} from 'src/app/content/strings';
import { Build, defaultBuild } from 'src/app/interfaces/Build';
import { Inverter } from 'src/app/interfaces/Inverter';
import { ProductBundleOfferView } from 'src/app/interfaces/ProductBundleOffer';
import { BuildService } from 'src/app/services/build.service';
import { CalculationUtilsService } from 'src/app/services/calculation-utils.service';
import { ProductDealsService } from 'src/app/services/product-deals.service';
import { ProductSelectorService } from 'src/app/services/product-selector.service';

// Mirrors the default in BuildComponent: builds arrive from the "dumb" builder
// without a days-of-autonomy choice, so the results page falls back to the same
// value when sizing the battery target.
const DEFAULT_DAYS_OF_AUTONOMY = 2;

@Component({
  selector: 'app-results',
  imports: [CommonModule, BundleOffersComponent],
  templateUrl: './results.component.html',
  styleUrl: './results.component.scss'
})
export class ResultsComponent implements OnInit {
  public build: Build = defaultBuild;
  public buildNotFound = false;
  public offers: ProductBundleOfferView[] = [];
  public recommendedOfferId?: string;

  // Demand sizing surfaced in the "why this size?" header.
  public peakWattage = 0;
  public totalWattHours = 0;
  public batteryTarget = 0;
  public solarTarget = 0;
  public daysOfAutonomy = DEFAULT_DAYS_OF_AUTONOMY;

  // True when no single station in the catalog covers the build's peak load, so
  // there is no anchor to recommend bundles against.
  public noAnchorInverter = false;
  public whyExpanded = false;

  // The next larger same-brand station to recommend when the auto-picked anchor can't
  // reach the storage/solar targets within its caps. Surfaced as a re-anchor card.
  public stepUpInverter?: Inverter;

  public readonly whyTitle = INVERTER_EXPLANATION_TITLE;
  public readonly whyExplanation = INVERTER_EXPLANATION;
  public readonly stepUpTitle = STEP_UP_TITLE;

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
      this.daysOfAutonomy = existingBuild.daysOfAutonomy ?? DEFAULT_DAYS_OF_AUTONOMY;

      this.peakWattage = this.calculationUtils.peakWattage(this.build);
      this.totalWattHours = this.calculationUtils.totalWattHours(this.build);
      this.solarTarget = this.calculationUtils.wattageNeeded(this.build);
      this.batteryTarget = this.totalWattHours * this.daysOfAutonomy;

      // The builder stays demand-only; the results page picks the anchor station
      // and persists it so /build (and /checkout) reload a fully sized build.
      const anchor = this.productSelectorService.getAnchorInverter(this.build);
      this.noAnchorInverter = !anchor;
      if (!anchor) {
        // No catalog station covers the peak draw (e.g. a saved build whose load
        // was raised above every unit). Drop the stale inverter so we never offer
        // or customize bundles for a station that can't actually run the load.
        this.build.inverter = {} as Inverter;
        this.offers = [];
        this.recommendedOfferId = undefined;
        return;
      }

      this.build.inverter = anchor;
      this.build.daysOfAutonomy = this.daysOfAutonomy;
      this.save();

      this.loadOffers(anchor);
      this.stepUpInverter = this.productSelectorService.getStepUpInverter(
        this.build,
        this.batteryTarget,
        this.solarTarget
      );
    });
  }

  get anchorInverter() {
    return this.build.inverter;
  }

  get stepUpMessage(): string {
    if (!this.stepUpInverter) return '';
    return STEP_UP_NOTICE(this.stepUpInverter.brand, this.stepUpInverter.name);
  }

  toggleWhy() {
    this.whyExpanded = !this.whyExpanded;
  }

  // Re-anchor onto the recommended larger station: persist it, reload its bundle offers,
  // and clear the step-up prompt (the new anchor reaches the targets).
  useStepUp() {
    const stepUp = this.stepUpInverter;
    if (!stepUp) return;
    this.build.inverter = stepUp;
    this.build.bundleOfferId = undefined;
    this.save();
    this.loadOffers(stepUp);
    this.stepUpInverter = this.productSelectorService.getStepUpInverter(
      this.build,
      this.batteryTarget,
      this.solarTarget
    );
  }

  private loadOffers(inverter: Inverter) {
    this.offers = this.productDealsService.getOffersForInverter(inverter.id);
    this.recommendedOfferId = this.productDealsService.getRecommendedOffer(
      this.offers,
      this.batteryTarget,
      this.solarTarget
    )?.id;
  }

  // Pre-seed the build with the chosen bundle's gear and hand off to the manual
  // /build flow, which re-derives everything from the persisted Build.
  customize(offer: ProductBundleOfferView) {
    this.productDealsService.applyOfferToBuild(
      this.build,
      offer,
      batteryCatalog,
      solarPanelCatalog
    );
    this.save();
    this.goToBuild();
  }

  // "Build it yourself" — keep the auto-picked anchor but no bundle, then open
  // the manual sizing flow.
  customizeManual() {
    this.build.bundleOfferId = undefined;
    this.save();
    this.goToBuild();
  }

  viewSavedBuilds() {
    if (!this.buildNotFound) this.save();
    this.router.navigate(['/builds']);
  }

  private goToBuild() {
    this.router.navigate(['/build'], { queryParams: { buildId: this.build.id } });
  }

  private save() {
    this.build.lastEdited = new Date();
    this.buildService.saveBuild(this.build);
  }
}
