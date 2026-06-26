import { CommonModule } from '@angular/common';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { BundleOffersComponent } from 'src/app/components/bundle-offers/bundle-offers.component';
import { ModalComponent } from 'src/app/components/modal/modal.component';
import { batteries as batteryCatalog } from 'src/app/content/batteries';
import { solarPanels as solarPanelCatalog } from 'src/app/content/solarPanels';
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
const MIN_DAYS_OF_AUTONOMY = 1;
const MAX_DAYS_OF_AUTONOMY = 7;

// Sizing here is local and effectively instant. We hold a brief skeleton on the
// offers section after an autonomy edit so the recalculation reads as deliberate
// rather than flashing new numbers into place.
const RECALC_DELAY_MS = 1000;

type DemandMetric = 'peak' | 'daily' | 'storage' | 'solar';

const MODAL_TITLES: Record<DemandMetric, string> = {
  peak: 'Peak power draw',
  daily: 'Daily energy usage',
  storage: 'Recommended storage capacity',
  solar: 'Recommended solar array size'
};

@Component({
  selector: 'app-results',
  imports: [CommonModule, BundleOffersComponent, ModalComponent],
  templateUrl: './results.component.html',
  styleUrl: './results.component.scss'
})
export class ResultsComponent implements OnInit, OnDestroy {
  public build: Build = defaultBuild;
  public buildNotFound = false;
  public offers: ProductBundleOfferView[] = [];
  public recommendedOfferId?: string;

  // Demand sizing surfaced in the demand-summary cards and their explainer modals.
  public peakWattage = 0;
  public totalWattHours = 0;
  public batteryTarget = 0;
  public solarTarget = 0;
  // Worst-season daily sun-hours behind the solar target — shown in the solar modal's math.
  public worstSeasonSunHours = 0;

  // Battery autonomy is editable from the storage modal, mirroring the /build step.
  public daysOfAutonomy = DEFAULT_DAYS_OF_AUTONOMY;
  public readonly minDays = MIN_DAYS_OF_AUTONOMY;
  public readonly maxDays = MAX_DAYS_OF_AUTONOMY;

  // True when no single station in the catalog covers the build's peak load, so
  // there is no anchor to recommend bundles against.
  public noAnchorInverter = false;

  // Skeleton state for the offers section while a (fake) recalculation runs after
  // an autonomy edit. `autonomyDirty` tracks whether the open modal actually changed
  // the target, so closing it without a change doesn't trigger a needless reload.
  public recalculating = false;
  private autonomyDirty = false;
  private recalcTimer?: ReturnType<typeof setTimeout>;

  // Per-metric explainer modal. Carries the same live math breakdowns as the manual
  // /build route, including the editable days-of-autonomy stepper for storage.
  public isModalOpen = false;
  public modalMetric: DemandMetric | null = null;
  public modalTitle = '';

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
      this.recompute();
    });
  }

  // Full sizing pass used on initial load: derive the demand targets, then pick the
  // anchor station and offers against them.
  private recompute() {
    this.peakWattage = this.calculationUtils.peakWattage(this.build);
    this.totalWattHours = this.calculationUtils.totalWattHours(this.build);
    this.solarTarget = this.calculationUtils.wattageNeeded(this.build);
    this.worstSeasonSunHours = this.calculationUtils.getSunHoursBySeason(this.build);
    this.batteryTarget = this.totalWattHours * this.daysOfAutonomy;
    this.applySizing();
  }

  // Picks the anchor station against the current targets and reloads the matching
  // offers. Split out from `recompute()` so an autonomy edit can re-run just this
  // part (the demand targets above don't change with autonomy except storage, which
  // the stepper already updates live).
  private applySizing() {
    // The builder stays demand-only; the results page picks the anchor station
    // and persists it so /build (and /checkout) reload a fully sized build. We pass
    // the storage/solar targets so the engine lands on a station that already
    // reaches them — no immediate "step up to a larger station" prompt on arrival.
    const anchor = this.productSelectorService.getAnchorInverter(
      this.build,
      this.batteryTarget,
      this.solarTarget
    );
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
  }

  get anchorInverter() {
    return this.build.inverter;
  }

  openModal(metric: DemandMetric) {
    this.modalMetric = metric;
    this.modalTitle = MODAL_TITLES[metric];
    this.isModalOpen = true;
  }

  closeModal() {
    this.isModalOpen = false;
    // Re-pick the anchor/offers only once the user is done editing in the modal,
    // behind a brief skeleton so the change reads as a recalculation.
    if (this.autonomyDirty) {
      this.autonomyDirty = false;
      this.runRecalc();
    }
  }

  changeDaysOfAutonomy(delta: number) {
    const next = Math.min(this.maxDays, Math.max(this.minDays, this.daysOfAutonomy + delta));
    if (next === this.daysOfAutonomy) return;
    this.daysOfAutonomy = next;
    // Update the storage target live for the modal/summary; defer re-picking the
    // station and offers until the modal closes (see closeModal).
    this.batteryTarget = this.totalWattHours * this.daysOfAutonomy;
    this.build.daysOfAutonomy = this.daysOfAutonomy;
    this.autonomyDirty = true;
  }

  private runRecalc() {
    clearTimeout(this.recalcTimer);
    this.recalculating = true;
    this.recalcTimer = setTimeout(() => {
      this.applySizing();
      this.recalculating = false;
    }, RECALC_DELAY_MS);
  }

  ngOnDestroy() {
    clearTimeout(this.recalcTimer);
  }

  private loadOffers(inverter: Inverter) {
    this.offers = this.productDealsService.getOffersForInverter(inverter.id);

    // The empty state is reserved for builds no single station can run. When a
    // station fits but we have no curated vendor bundle for it, synthesize a kit
    // from the catalog (right-sized storage + solar within the station's caps) so
    // we still recommend a complete package instead of dead-ending the user.
    if (this.offers.length === 0) {
      const autoKit = this.productDealsService.buildAutoKit(
        inverter,
        this.batteryTarget,
        this.solarTarget,
        this.productSelectorService.getMatchingBatteries(this.build),
        this.productSelectorService.getMatchingSolarPanels(this.build)
      );
      if (autoKit) this.offers = [autoKit];
    }

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
