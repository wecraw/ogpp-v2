import {
  ChangeDetectorRef,
  Component,
  Input,
  OnInit,
  QueryList,
  ViewChildren
} from '@angular/core';
import { allAppliances } from '../../content/appliances';
import { appliancePresets } from '../../content/appliancePresets';
import { AppliancePreset } from '../../interfaces/AppliancePreset';
import { ApplianceCardComponent } from '../../components/appliance-card/appliance-card.component';
import { PresetCardComponent } from '../../components/preset-card/preset-card.component';
import { CommonModule } from '@angular/common';
import { SunHoursLookupError, SunHoursService } from '../../services/sun-hours.service';
import { FormsModule } from '@angular/forms';
import { ModalComponent } from '../../components/modal/modal.component';
import { LOCATION_DISCLAIMER, LOCATION_DISCLAIMER_TITLE } from '../../content/strings';
import { MiniCardComponent } from '../../components/mini-card/mini-card.component';
import { Season } from '../../interfaces/Season';
import { Appliance } from '../../interfaces/Appliance';
import { CountUpDirective } from '../../directives/count-up.directive';
import { Build, defaultBuild } from '../../interfaces/Build';
import { CalculationUtilsService } from '../../services/calculation-utils.service';
import { BuildService } from '../../services/build.service';
import {
  CustomApplianceFormComponent
} from '../../components/custom-appliance-form/custom-appliance-form.component';
import {
  generateCustomApplianceId,
  isCustomApplianceId
} from '../../content/catalog-utils';
import { v4 as uuidv4 } from 'uuid';
import { ActivatedRoute, Router } from '@angular/router';
import { firstValueFrom } from 'rxjs';

@Component({
    selector: 'builder',
    imports: [
        ApplianceCardComponent,
        CommonModule,
        FormsModule,
        ModalComponent,
        MiniCardComponent,
        CountUpDirective,
        CustomApplianceFormComponent,
        PresetCardComponent
    ],
    templateUrl: './builder.component.html',
    styleUrls: ['./builder.component.scss']
})
export class BuilderComponent implements OnInit {
  @ViewChildren(MiniCardComponent) miniCards!: QueryList<MiniCardComponent>;

  // Content
  // Deep-clone the catalog so in-card edits never mutate the shared module arrays.
  public allAppliances: Appliance[] = allAppliances.map(appliance => ({ ...appliance }));
  public originalAppliances: Appliance[] = allAppliances.map(appliance => ({ ...appliance }));
  public appliancePresets: AppliancePreset[] = appliancePresets;
  // Names shown up front; the rest are tucked behind the "More" toggle.
  private readonly defaultPresetNames = ['Cabin weekend', 'RV kit', 'Van life basics'];
  public showMorePresets: boolean = false;
  public applianceGroups: string[] = [];
  public modalContent: string = LOCATION_DISCLAIMER;
  public modalTitle: string = LOCATION_DISCLAIMER_TITLE;

  // Display values
  public peakWattage: number = 0;
  public totalWattHours: number = 0;

  // Input validation
  public zipCode: string = '';
  public zipErrorLength: boolean = false;
  public zipErrorFormat: boolean = false;
  public sunHoursError: string = '';

  // DOM controllers
  public generatingBuild: boolean = false;
  public isModalOpen: boolean = false;
  public isCustomFormOpen: boolean = false;

  // A preset click against a non-empty selection parks the choice here until the
  // user confirms the replace; `'scratch'` represents the "Start from scratch"
  // clear action through the same confirm dialog.
  public pendingPreset: AppliancePreset | 'scratch' | null = null;
  public countUpOptionsPeakWattage = { duration: 1.5, startVal: 0 };
  public countUpOptionsTotalWattHours = { duration: 1.5, startVal: 0 };

  // Loading overlay
  private readonly loadingMessages = [
    'Looking up solar data for your area…',
    'Sizing your system…',
    'Matching gear to your needs…',
    'Almost ready…',
  ];
  public loadingMessage: string = this.loadingMessages[0];
  public messageFading: boolean = false;
  private messageIntervalId: ReturnType<typeof setInterval> | null = null;

  // Inputs
  @Input() build: Build = defaultBuild;

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private sunHoursService: SunHoursService,
    private calculationUtils: CalculationUtilsService,
    private buildService: BuildService,
    private changeDetectorRef: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.route.queryParams.subscribe(params => {
      const buildId = params['buildId'];
      if (buildId) {
        const existingBuild = this.buildService.getBuild(buildId);
        if (existingBuild) {
          this.build = existingBuild;
          this.zipCode = this.build.zipCode;
          this.updateTotals();

          // Reconcile saved appliances with the catalog. Catalog items are
          // merged onto their clone; custom appliances (no catalog match) are
          // re-injected so they render as selectable/editable cards on reload.
          this.build.appliances.forEach(buildAppliance => {
            const applianceIndex = this.allAppliances.findIndex(
              appliance => appliance.id === buildAppliance.id
            );
            if (applianceIndex !== -1) {
              this.allAppliances[applianceIndex] = {
                ...this.allAppliances[applianceIndex],
                ...buildAppliance
              };
            } else {
              this.allAppliances.push({ ...buildAppliance });
            }
          });
        }
      }
    });

    this.refreshGroups();
  }

  // Derive the rendered group list from the live appliance set so a custom
  // group appears when its first custom is added and disappears when emptied.
  private refreshGroups(): void {
    this.applianceGroups = [
      ...new Set(this.allAppliances.map(appliance => appliance.applianceGroup))
    ];
  }

  isCustom(appliance: Appliance): boolean {
    return isCustomApplianceId(appliance.id);
  }

  openCustomForm(): void {
    this.isCustomFormOpen = true;
  }

  closeCustomForm(): void {
    this.isCustomFormOpen = false;
  }

  // Assign a collision-safe runtime ID, render the appliance as a card, select
  // it into the build, and recompute totals — identical to a catalog pick.
  addCustomAppliance(appliance: Appliance): void {
    const id = generateCustomApplianceId(
      appliance.name,
      this.allAppliances.map(existing => existing.id!).filter(Boolean)
    );
    const custom: Appliance = { ...appliance, id };

    this.allAppliances.push(custom);
    this.build.appliances.push(custom);
    this.build.appliancePresetId = undefined;
    this.refreshGroups();
    this.isCustomFormOpen = false;
    this.updateTotals();
  }

  // Fully remove a custom appliance: it has no catalog default to fall back to,
  // so it's dropped from both the rendered set and the build.
  deleteAppliance(appliance: Appliance): void {
    this.allAppliances = this.allAppliances.filter(item => item.id !== appliance.id);
    this.build.appliances = this.build.appliances.filter(item => item.id !== appliance.id);
    this.build.appliancePresetId = undefined;
    this.refreshGroups();
    this.updateTotals();
  }

  getOriginalApplianceById(id: string): Appliance | undefined {
    return this.originalAppliances.find(appliance => appliance.id === id);
  }

  isApplianceSelected(id: string): boolean {
    return this.build.appliances.some(appliance => appliance.id === id);
  }

  getAppliancesByGroup(group: string): Appliance[] {
    return this.allAppliances.filter(appliance => appliance.applianceGroup === group);
  }

  onApplianceValueChange(updatedAppliance: any, appliance: Appliance) {
    const buildApplianceIndex = this.build.appliances.findIndex(item => item.id === appliance.id);
    if (buildApplianceIndex !== -1) {
      this.build.appliances[buildApplianceIndex] = {
        ...this.build.appliances[buildApplianceIndex],
        ...updatedAppliance
      };
    }

    this.build.appliancePresetId = undefined;
    this.updateTotals();
  }

  onApplianceSelect(id: string) {
    const selectedAppliance = this.allAppliances.find(item => item.id === id);
    if (selectedAppliance) {
      const index = this.build.appliances.findIndex(
        appliance => appliance.id === selectedAppliance.id
      );
      if (index !== -1) {
        this.build.appliances.splice(index, 1);
        // Revert the deselected card to its catalog default so any lingering
        // preset override (or manual edit) doesn't carry into a later re-select.
        this.restoreCatalogDefault(selectedAppliance.id!);
      } else {
        this.build.appliances.push(selectedAppliance);
      }
    }

    this.build.appliancePresetId = undefined;
    this.updateTotals();
  }

  // Reset a single catalog appliance in `allAppliances` back to its original
  // values. Custom appliances have no catalog default, so they're left as-is.
  private restoreCatalogDefault(id: string): void {
    const index = this.allAppliances.findIndex(appliance => appliance.id === id);
    const original = this.originalAppliances.find(appliance => appliance.id === id);
    if (index !== -1 && original) {
      this.allAppliances[index] = { ...original };
    }
  }

  // Presets =================================================================

  get defaultPresets(): AppliancePreset[] {
    return this.appliancePresets.filter(p => this.defaultPresetNames.includes(p.name));
  }

  get extraPresets(): AppliancePreset[] {
    return this.appliancePresets.filter(p => !this.defaultPresetNames.includes(p.name));
  }

  toggleMorePresets(): void {
    this.showMorePresets = !this.showMorePresets;
  }

  isPresetActive(preset: AppliancePreset): boolean {
    return !!preset.id && this.build.appliancePresetId === preset.id;
  }

  // Clicking a preset replaces the current selection. If the user has already
  // chosen appliances, confirm before wiping their work.
  onPresetSelect(preset: AppliancePreset): void {
    if (this.isAnyApplianceSelected()) {
      this.pendingPreset = preset;
      return;
    }
    this.applyPreset(preset);
  }

  onStartFromScratch(): void {
    if (!this.isAnyApplianceSelected()) return;
    this.pendingPreset = 'scratch';
  }

  confirmPendingPreset(): void {
    const pending = this.pendingPreset;
    this.pendingPreset = null;
    if (pending === 'scratch') {
      this.clearSelection();
    } else if (pending) {
      this.applyPreset(pending);
    }
  }

  cancelPendingPreset(): void {
    this.pendingPreset = null;
  }

  get pendingPresetName(): string {
    return this.pendingPreset && this.pendingPreset !== 'scratch' ? this.pendingPreset.name : '';
  }

  // Reset the selection to empty, restoring catalog appliances to their defaults
  // so a previously-applied preset's overrides don't linger on the cards. Custom
  // appliances (no catalog default) are kept rendered, just deselected.
  private clearSelection(): void {
    this.build.appliances = [];
    this.allAppliances.forEach(appliance => this.restoreCatalogDefault(appliance.id!));
    this.build.appliancePresetId = undefined;
    this.refreshGroups();
    this.updateTotals();
  }

  // Populate the selection from a preset: clear what's there, then select each
  // referenced catalog appliance, applying any quantity/hours overrides. Unknown
  // ids are skipped at runtime (a unit test guards against them at build time).
  applyPreset(preset: AppliancePreset): void {
    this.clearSelection();
    for (const item of preset.items) {
      const index = this.allAppliances.findIndex(appliance => appliance.id === item.applianceId);
      if (index === -1) continue;
      const merged: Appliance = { ...this.allAppliances[index] };
      if (item.quantity !== undefined) merged.quantity = item.quantity;
      if (item.hours !== undefined) merged.hours = item.hours;
      this.allAppliances[index] = merged;
      this.build.appliances.push(merged);
    }
    this.build.appliancePresetId = preset.id;
    this.updateTotals();
  }

  onSeasonSelect(selected: boolean, selectedSeason: Season) {
    if (selected) this.build.seasons.push(selectedSeason);
    if (!selected)
      this.build.seasons = this.build.seasons.filter(season => season !== selectedSeason);
  }

  async getSunHours(zip: string): Promise<void> {
    this.validateZip(true);

    if (this.zipErrorFormat || this.zipErrorLength) {
      throw new SunHoursLookupError('unknown-zip', 'Invalid ZIP code.');
    }

    if (this.build.monthlyGhi && this.build.zipCode === zip) {
      return;
    }

    const monthlyGhi = await firstValueFrom(this.sunHoursService.getSunHoursByZip(zip));
    this.build.zipCode = zip;
    this.build.monthlyGhi = monthlyGhi;
  }

  updateTotals() {
    // Animate the running totals up from their current value on every change.
    this.countUpOptionsPeakWattage = { duration: 0.7, startVal: this.peakWattage };
    this.countUpOptionsTotalWattHours = { duration: 0.7, startVal: this.totalWattHours };
    this.changeDetectorRef.detectChanges();

    this.totalWattHours = this.calculationUtils.totalWattHours(this.build);
    this.peakWattage = this.calculationUtils.peakWattage(this.build);
  }

  async generateBuild() {
    this.generatingBuild = true;
    this.sunHoursError = '';
    this.startLoadingMessages();

    try {
      await this.getSunHours(this.zipCode);
      if (!this.build.name?.trim()) {
        this.build.name = this.suggestedName;
      }
      this.build.id = uuidv4();
      this.buildService.saveBuild(this.build);
      const navigationExtras = {
        queryParams: { buildId: this.build.id }
      };
      setTimeout(() => {
        this.stopLoadingMessages();
        this.router.navigate(['/results'], navigationExtras);
      }, 1200);
    } catch (error) {
      this.stopLoadingMessages();
      this.generatingBuild = false;
      this.sunHoursError = this.getSunHoursErrorMessage(error);
    }
  }

  private startLoadingMessages() {
    let index = 0;
    this.loadingMessage = this.loadingMessages[0];
    this.messageFading = false;
    this.messageIntervalId = setInterval(() => {
      this.messageFading = true;
      setTimeout(() => {
        index = (index + 1) % this.loadingMessages.length;
        this.loadingMessage = this.loadingMessages[index];
        this.messageFading = false;
      }, 260);
    }, 1400);
  }

  private stopLoadingMessages() {
    if (this.messageIntervalId !== null) {
      clearInterval(this.messageIntervalId);
      this.messageIntervalId = null;
    }
  }

  // Validators =============================================================

  validateZip(checkLength: boolean) {
    this.zipErrorFormat = /\D/.test(this.zipCode);
    if (checkLength) this.zipErrorLength = this.zipCode.length !== 5;
  }

  onZipChange() {
    this.validateZip(false);
    this.zipErrorLength = false;
    this.sunHoursError = '';
  }

  isAnyApplianceSelected() {
    return this.build.appliances.length > 0;
  }

  // A friendly default name derived from the chosen seasons. Shown as the
  // name-field placeholder and used as the fallback name when left blank, so
  // builds are always identifiable on /builds.
  get suggestedName(): string {
    const seasons = this.build.seasons;
    if (seasons.length === 0) return 'My off-grid build';
    if (seasons.length === 4) return 'Year-round build';
    if (seasons.length === 1) {
      const season = seasons[0];
      return `${season.charAt(0).toUpperCase()}${season.slice(1)} build`;
    }
    return 'Multi-season build';
  }

  // Readiness ==============================================================
  // The single summary CTA validates all three inputs at once; `ctaHint`
  // tells the user exactly what's still missing.

  private get hasZip(): boolean {
    return this.zipCode.length === 5 && !this.zipErrorFormat;
  }

  private get hasSeason(): boolean {
    return this.build.seasons.length > 0;
  }

  get canGenerate(): boolean {
    return this.isAnyApplianceSelected() && this.hasZip && this.hasSeason;
  }

  get ctaHint(): string {
    const missing: string[] = [];
    if (!this.isAnyApplianceSelected()) missing.push('an appliance');
    if (!this.hasZip) missing.push('a ZIP code');
    if (!this.hasSeason) missing.push('a season');

    if (missing.length === 0) return '';
    if (missing.length === 1) return `Add ${missing[0]} to continue`;

    const last = missing.pop();
    return `Add ${missing.join(', ')} and ${last} to continue`;
  }

  // DOM Helpers ============================================================

  toggleModal() {
    this.isModalOpen = !this.isModalOpen;
  }

  private getSunHoursErrorMessage(error: unknown): string {
    if (error instanceof SunHoursLookupError) {
      switch (error.code) {
        case 'unknown-zip':
          return "We couldn't find that ZIP code. Check it and try again.";
        case 'timeout':
          return 'The solar data lookup took too long. Please try again.';
        case 'no-data':
          return "Solar data isn't available for that ZIP code. Try a nearby ZIP code.";
        case 'unavailable':
          return 'The solar data service is unavailable right now. Please try again later.';
      }
    }

    return 'We could not look up solar data right now. Please try again later.';
  }
}
