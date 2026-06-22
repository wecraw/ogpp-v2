import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CountUpDirective } from 'src/app/directives/count-up.directive';
import { ModalComponent } from 'src/app/components/modal/modal.component';
import { Build, defaultBuild } from 'src/app/interfaces/Build';
import { BuildService } from 'src/app/services/build.service';
import { CalculationUtilsService } from 'src/app/services/calculation-utils.service';
import {
  INVERTER_EXPLANATION,
  INVERTER_EXPLANATION_TITLE,
  BATTERY_EXPLANATION,
  BATTERY_EXPLANATION_TITLE,
  AUTONOMY_EXPLANATION,
  AUTONOMY_EXPLANATION_TITLE,
  SOLAR_EXPLANATION,
  SOLAR_EXPLANATION_TITLE,
  BATTERY_LIMIT_NOTICE,
  SOLAR_LIMIT_NOTICE,
  STEP_UP_TITLE,
  STEP_UP_NOTICE
} from 'src/app/content/strings';
import {
  BuildComponentCardComponent
} from 'src/app/components/build-component-card/build-component-card.component';
import { ProductSelectorService } from 'src/app/services/product-selector.service';
import { Inverter, defaultInverter } from 'src/app/interfaces/Inverter';
import { Battery } from 'src/app/interfaces/Battery';
import { PowerSource } from 'src/app/interfaces/PowerSource';

// Days of usage the battery bank should cover. Now user-configurable on the Batteries step
// (see `daysOfAutonomy`); these bound the control and seed builds that predate the field.
const DEFAULT_DAYS_OF_AUTONOMY = 2;
const MIN_DAYS_OF_AUTONOMY = 1;
const MAX_DAYS_OF_AUTONOMY = 7;

@Component({
    selector: 'app-build',
    imports: [
      CommonModule,
      CountUpDirective,
      ModalComponent,
      BuildComponentCardComponent
    ],
    templateUrl: './build.component.html',
    styleUrl: './build.component.scss'
})
export class BuildComponent implements OnInit {
  public build: Build = defaultBuild;
  public buildNotFound: boolean = false;

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private buildService: BuildService,
    private calculationUtils: CalculationUtilsService,
    private productSelectorService: ProductSelectorService
  ) {}

  public countUpOptions = { duration: 0.7 };

  // Targets (from the build's appliances + location)
  public peakWattage: number = 0;
  public totalWattHours: number = 0;
  public wattageNeeded: number = 0;
  // Worst-season daily sun-hours that drive the solar target — surfaced in the "why this size?"
  // breakdowns so the user can see the number behind the recommendation.
  public worstSeasonSunHours: number = 0;

  // Which inline "why this size?" breakdown panels are expanded, keyed by step.
  public whyOpen: { inverter: boolean; battery: boolean; solar: boolean } = {
    inverter: false,
    battery: false,
    solar: false
  };

  // Matching products
  public inverters: Inverter[] = [];
  public batteries: Battery[] = [];
  public solarPanels: PowerSource[] = [];

  // Per-item quantities, keyed by catalog id
  public batteryQuantities: Record<string, number> = {};
  public solarQuantities: Record<string, number> = {};

  // How many sunless days the battery bank should cover. User-configurable on the
  // Batteries step; scales `batteryTarget`. Exposed bounds drive the stepper UI.
  public daysOfAutonomy: number = DEFAULT_DAYS_OF_AUTONOMY;
  public readonly minDays = MIN_DAYS_OF_AUTONOMY;
  public readonly maxDays = MAX_DAYS_OF_AUTONOMY;

  // Running totals. Price is intentionally absent here: the build page is for
  // sizing/fit, and the real price (best bundle vs à-la-carte) is revealed at
  // checkout. Per-card MSRP tags still show, for cost-of-choice between models.
  public selectedBatteryCapacity: number = 0;
  public selectedSolarWattage: number = 0;

  // Hardware-cap state, recomputed in `recalculate()`. `atBatteryLimit`/`atSolarLimit`
  // gate the inline cap notices; `stepUpInverter` is the next larger same-brand station
  // to recommend when the chosen one can't reach the build's targets within its caps.
  public atBatteryLimit: boolean = false;
  public atSolarLimit: boolean = false;
  public stepUpInverter?: Inverter;
  public readonly stepUpTitle = STEP_UP_TITLE;

  // Content
  public modalContent: string = '';
  public modalTitle: string = '';

  // Compatibility
  public isInverterCompatible: boolean = false;
  public isBatteryCompatible: boolean = false;
  public isSolarCompatible: boolean = false;

  // DOM Controllers
  public isModalOpen: boolean = false;
  public showInverterCheck: boolean = false;
  public showBatteryCheck: boolean = false;
  public showSolarCheck: boolean = false;
  public showStep2: boolean = false;
  public showStep3: boolean = false;

  ngOnInit() {
    this.route.queryParams.subscribe(params => {
      const buildId = params['buildId'];
      const existingBuild = buildId ? this.buildService.getBuild(buildId) : null;
      if (!existingBuild) {
        this.buildNotFound = true;
        return;
      }
      this.build = existingBuild;
      // Seed builds saved before days-of-autonomy was configurable, and persist the value
      // so it round-trips on the next save.
      this.daysOfAutonomy = existingBuild.daysOfAutonomy ?? DEFAULT_DAYS_OF_AUTONOMY;
      this.build.daysOfAutonomy = this.daysOfAutonomy;
      this.peakWattage = this.calculationUtils.peakWattage(this.build);
      this.totalWattHours = this.calculationUtils.totalWattHours(this.build);
      this.wattageNeeded = this.calculationUtils.wattageNeeded(this.build);
      this.worstSeasonSunHours = this.calculationUtils.getSunHoursBySeason(this.build);
      this.inverters = this.productSelectorService.getMatchingInverters(this.build);
      this.restoreSelections();
    });
  }

  // ----- Targets -----

  get builtInBatteryCard(): Battery | null {
    const cap = this.build.inverter?.batteryCapacity;
    if (!cap) return null;
    return {
      id: 'built-in',
      name: 'Built-in Battery',
      brand: this.build.inverter!.brand,
      icon: 'bi-battery-full',
      batteryCapacity: cap,
      price: 0
    };
  }

  get batteryTarget(): number {
    return this.totalWattHours * this.daysOfAutonomy;
  }

  // ----- Days of autonomy -----

  changeDaysOfAutonomy(delta: number) {
    const next = Math.min(this.maxDays, Math.max(this.minDays, this.daysOfAutonomy + delta));
    if (next === this.daysOfAutonomy) return;
    this.daysOfAutonomy = next;
    this.build.daysOfAutonomy = next;

    // Raising the target can make a previously-sufficient bank fall short (and vice versa),
    // so re-size everything downstream and re-evaluate the revealed steps.
    this.recalculate();
    this.save();
    this.confirmCompatibility('battery');
    this.maybeRevealSolar();
  }

  get noInverterMeetsPeak(): boolean {
    return (
      this.peakWattage > 0 &&
      !this.inverters.some(inverter => inverter.maxOutput >= this.peakWattage)
    );
  }

  // ----- Bottom-bar progress (0–100, capped) -----
  // Drives each segment's fill bar so progress toward a target reads at a glance
  // instead of from a value/target fraction.

  get inverterProgress(): number {
    if (!this.peakWattage) return 0;
    return Math.min((this.build.inverter?.maxOutput ?? 0) / this.peakWattage, 1) * 100;
  }

  get batteryProgress(): number {
    if (!this.batteryTarget) return 0;
    return Math.min(this.selectedBatteryCapacity / this.batteryTarget, 1) * 100;
  }

  get solarProgress(): number {
    if (!this.wattageNeeded) return 0;
    return Math.min(this.selectedSolarWattage / this.wattageNeeded, 1) * 100;
  }

  // ----- Step 1: Inverter -----

  onInverterSelect(selected: boolean, inverter: Inverter) {
    this.build.inverter = selected ? inverter : defaultInverter;
    this.build.bundleOfferId = undefined;

    // The brand of the chosen inverter drives which batteries/panels match, so any
    // downstream selections from a previous inverter are no longer valid.
    this.build.batteries = [];
    this.build.powerSources = [];
    this.batteryQuantities = {};
    this.solarQuantities = {};
    this.showStep3 = false;
    this.showSolarCheck = false;
    this.showBatteryCheck = false;

    this.batteries = this.productSelectorService.getMatchingBatteries(this.build);
    this.solarPanels = this.productSelectorService.getMatchingSolarPanels(this.build);

    this.recalculate();
    this.save();
    this.confirmCompatibility('inverter');
    this.confirmCompatibility('battery');

    setTimeout(() => {
      this.showStep2 = !!this.build.inverter.maxOutput;
      if (this.showStep2) this.scrollToStep('step2');
    }, this.countUpOptions.duration * 1000);

    // The inverter's built-in battery may already cover the day's needs, in which case the
    // battery step is satisfied with zero added batteries — reveal solar so the user can proceed.
    this.maybeRevealSolar();
  }

  // ----- Step 2: Batteries -----

  onBatteryQuantityChange(battery: Battery, quantity: number) {
    if (battery.id) {
      this.batteryQuantities[battery.id] = quantity;
    }
    this.build.batteries = this.flatten(this.batteries, this.batteryQuantities);
    this.build.bundleOfferId = undefined;

    this.recalculate();
    this.save();
    this.confirmCompatibility('battery');
    this.maybeRevealSolar();
  }

  private maybeRevealSolar() {
    if (!this.isBatteryCompatible) return;
    const wasHidden = !this.showStep3;
    this.solarPanels = this.productSelectorService.getMatchingSolarPanels(this.build);
    setTimeout(() => {
      this.showStep3 = true;
      if (wasHidden) this.scrollToStep('step3');
    }, this.countUpOptions.duration * 1000);
  }

  // Smoothly bring a freshly revealed step into view so the eye follows the flow
  // instead of the section popping in unnoticed. Deferred a tick so the @if block
  // has rendered before we scroll to it.
  private scrollToStep(id: string) {
    setTimeout(() => {
      document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 80);
  }

  getBatteryQuantity(battery: Battery): number {
    return battery.id ? this.batteryQuantities[battery.id] ?? 0 : 0;
  }

  // ----- Step 3: Solar panels -----

  onSolarQuantityChange(panel: PowerSource, quantity: number) {
    if (panel.id) {
      this.solarQuantities[panel.id] = quantity;
    }
    this.build.powerSources = this.flatten(this.solarPanels, this.solarQuantities);
    this.build.bundleOfferId = undefined;

    this.recalculate();
    this.save();
    this.confirmCompatibility('solar');
  }

  getSolarQuantity(panel: PowerSource): number {
    return panel.id ? this.solarQuantities[panel.id] ?? 0 : 0;
  }

  // ----- Hardware caps -----
  // `maxBatteries` is a bank total, so each card's ceiling is its own current quantity
  // plus whatever bank slots are still free. The built-in battery is shown as a locked
  // card and excluded here — the caps cover expansion batteries only.

  get totalBatteryQuantity(): number {
    return Object.values(this.batteryQuantities).reduce((sum, quantity) => sum + (quantity ?? 0), 0);
  }

  get remainingBatterySlots(): number {
    const max = this.build.inverter?.maxBatteries ?? 0;
    return Math.max(0, max - this.totalBatteryQuantity);
  }

  getBatteryMaxQuantity(battery: Battery): number {
    return this.getBatteryQuantity(battery) + this.remainingBatterySlots;
  }

  // Solar is capped by the station's `maxSolarInput` (watts), not a unit count, so each
  // panel's ceiling is its current quantity plus however many more fit in the headroom.
  get remainingSolarInput(): number {
    const max = this.build.inverter?.maxSolarInput ?? 0;
    return Math.max(0, max - this.selectedSolarWattage);
  }

  getSolarMaxQuantity(panel: PowerSource): number {
    const perPanel = panel.maxOutput ?? 0;
    if (perPanel <= 0) return this.getSolarQuantity(panel);
    return this.getSolarQuantity(panel) + Math.floor(this.remainingSolarInput / perPanel);
  }

  // Smallest panel currently on offer — used to decide when solar headroom is exhausted
  // (no panel could still be added without exceeding the cap).
  private get smallestSolarWattage(): number {
    return this.solarPanels.reduce(
      (smallest, panel) => Math.min(smallest, panel.maxOutput ?? Infinity),
      Infinity
    );
  }

  get batteryLimitMessage(): string {
    return BATTERY_LIMIT_NOTICE(this.build.inverter?.maxBatteries ?? 0);
  }

  get solarLimitMessage(): string {
    return SOLAR_LIMIT_NOTICE(this.build.inverter?.maxSolarInput ?? 0, this.selectedSolarWattage);
  }

  get stepUpMessage(): string {
    if (!this.stepUpInverter) return '';
    return STEP_UP_NOTICE(this.stepUpInverter.brand, this.stepUpInverter.name);
  }

  // The most storage the chosen station could ever hold (built-in + a full bank of its
  // largest expansion battery). When this is below the target, no amount of batteries
  // closes the gap — that's when the step-up banner appears on the battery step.
  private get anchorMaxStorage(): number {
    const builtIn = this.build.inverter?.batteryCapacity ?? 0;
    const maxBatteries = this.build.inverter?.maxBatteries ?? 0;
    const largestBattery = this.batteries.reduce(
      (largest, battery) => Math.max(largest, battery.batteryCapacity ?? 0),
      0
    );
    return builtIn + maxBatteries * largestBattery;
  }

  get batteryNeedsStepUp(): boolean {
    return !!this.stepUpInverter && this.anchorMaxStorage < this.batteryTarget;
  }

  get solarNeedsStepUp(): boolean {
    return !!this.stepUpInverter && (this.build.inverter?.maxSolarInput ?? 0) < this.wattageNeeded;
  }

  // Re-anchor onto the recommended larger station, reusing the inverter-select flow so
  // downstream selections reset and resize exactly as a manual pick would.
  selectStepUpInverter() {
    if (this.stepUpInverter) this.onInverterSelect(true, this.stepUpInverter);
  }

  // ----- Completion -----

  get allComplete(): boolean {
    return this.isInverterCompatible && this.isBatteryCompatible && this.isSolarCompatible;
  }

  finish() {
    this.save();
    this.router.navigate(['/checkout'], { queryParams: { buildId: this.build.id } });
  }

  editAppliances() {
    this.router.navigate(['/builder'], { queryParams: { buildId: this.build.id } });
  }

  // ----- Bottom-bar row colors -----

  get inverterRowClass(): string {
    if (!this.build.inverter || !this.build.inverter.maxOutput) return 'unset';
    return this.isInverterCompatible ? 'compatible' : 'incompatible';
  }

  get batteryRowClass(): string {
    if (!this.selectedBatteryCapacity) return 'unset';
    return this.isBatteryCompatible ? 'compatible' : 'incompatible';
  }

  get solarRowClass(): string {
    if (this.isSolarCompatible) return 'compatible';
    return this.selectedSolarWattage > 0 ? 'incompatible' : 'unset';
  }

  // ----- Shared logic -----

  private recalculate() {
    const inverterBuiltIn = this.build.inverter?.batteryCapacity ?? 0;
    const addedCapacity = this.build.batteries.reduce(
      (total, battery) => total + (battery.batteryCapacity ?? 0),
      0
    );
    this.selectedBatteryCapacity = inverterBuiltIn + addedCapacity;

    this.selectedSolarWattage = this.build.powerSources.reduce(
      (total, panel) => total + (panel.maxOutput ?? 0),
      0
    );

    this.isInverterCompatible =
      !!this.build.inverter?.maxOutput && this.build.inverter.maxOutput >= this.peakWattage;
    this.isBatteryCompatible =
      this.isInverterCompatible && this.selectedBatteryCapacity >= this.batteryTarget;
    this.isSolarCompatible =
      this.isBatteryCompatible && this.selectedSolarWattage >= this.wattageNeeded;

    const maxBatteries = this.build.inverter?.maxBatteries ?? 0;
    this.atBatteryLimit = maxBatteries > 0 && this.totalBatteryQuantity >= maxBatteries;

    const maxSolarInput = this.build.inverter?.maxSolarInput ?? 0;
    this.atSolarLimit =
      maxSolarInput > 0 &&
      this.selectedSolarWattage > 0 &&
      this.remainingSolarInput < this.smallestSolarWattage;

    this.stepUpInverter = this.build.inverter?.maxOutput
      ? this.productSelectorService.getStepUpInverter(
          this.build,
          this.batteryTarget,
          this.wattageNeeded
        )
      : undefined;
  }

  // Expands a quantity map into a flat array of duplicated catalog entries, which is how
  // selections are persisted on the Build (keeping the Build interface unchanged).
  private flatten<T extends { id?: string }>(
    items: T[],
    quantities: Record<string, number>
  ): T[] {
    const result: T[] = [];
    for (const item of items) {
      const quantity = item.id ? quantities[item.id] ?? 0 : 0;
      for (let i = 0; i < quantity; i++) {
        result.push(item);
      }
    }
    return result;
  }

  // Rebuilds a per-id quantity map by counting duplicate entries in a persisted array.
  private groupQuantities(list: { id?: string }[]): Record<string, number> {
    const out: Record<string, number> = {};
    for (const item of list) {
      if (!item.id) continue;
      out[item.id] = (out[item.id] ?? 0) + 1;
    }
    return out;
  }

  // On reload, re-derive matches, quantities, revealed steps and compatibility from the
  // persisted Build so the user lands exactly where they left off.
  private restoreSelections() {
    if (this.build.inverter && this.build.inverter.maxOutput) {
      const currentInverter = this.inverters.find(
        inverter => inverter.id === this.build.inverter.id
      );
      if (currentInverter) this.build.inverter = currentInverter;

      this.batteries = this.productSelectorService.getMatchingBatteries(this.build);
      this.batteryQuantities = this.groupQuantities(this.build.batteries);
      this.build.batteries = this.flatten(this.batteries, this.batteryQuantities);
      this.solarPanels = this.productSelectorService.getMatchingSolarPanels(this.build);
      this.solarQuantities = this.groupQuantities(this.build.powerSources);
      this.build.powerSources = this.flatten(this.solarPanels, this.solarQuantities);
      this.showStep2 = true;
    }

    this.recalculate();

    if (this.isBatteryCompatible) {
      this.showStep3 = true;
    } else if (this.build.powerSources.length > 0) {
      this.showStep3 = true;
    }

    // Surface the persisted compatibility checks without the entry animation delay.
    this.showInverterCheck = this.isInverterCompatible;
    this.showBatteryCheck = this.isBatteryCompatible;
    this.showSolarCheck = this.isSolarCompatible;
  }

  private save() {
    this.build.lastEdited = new Date();
    this.buildService.saveBuild(this.build);
  }

  confirmCompatibility(device: string) {
    const reveal = (set: (value: boolean) => void, compatible: boolean) => {
      if (compatible) {
        setTimeout(() => set(true), this.countUpOptions.duration * 1000);
      } else {
        set(false);
      }
    };

    if (device === 'inverter') {
      reveal(v => (this.showInverterCheck = v), this.isInverterCompatible);
    } else if (device === 'battery') {
      reveal(v => (this.showBatteryCheck = v), this.isBatteryCompatible);
    } else if (device === 'solar') {
      reveal(v => (this.showSolarCheck = v), this.isSolarCompatible);
    }
  }

  // Expand/collapse a step's inline "why this size?" math breakdown.
  toggleWhy(step: 'inverter' | 'battery' | 'solar') {
    this.whyOpen[step] = !this.whyOpen[step];
  }

  // DOM Helpers
  toggleModal(content?: string) {
    this.isModalOpen = !this.isModalOpen;

    if (content === 'inverter') {
      this.modalContent = INVERTER_EXPLANATION;
      this.modalTitle = INVERTER_EXPLANATION_TITLE;
    } else if (content === 'battery') {
      this.modalContent = BATTERY_EXPLANATION;
      this.modalTitle = BATTERY_EXPLANATION_TITLE;
    } else if (content === 'autonomy') {
      this.modalContent = AUTONOMY_EXPLANATION;
      this.modalTitle = AUTONOMY_EXPLANATION_TITLE;
    } else if (content === 'solar') {
      this.modalContent = SOLAR_EXPLANATION;
      this.modalTitle = SOLAR_EXPLANATION_TITLE;
    }
  }
}
