import {
  ChangeDetectorRef,
  Component,
  Input,
  OnInit,
  QueryList,
  ViewChildren
} from '@angular/core';
import { allAppliances } from '../../content/appliances';
import { ApplianceCardComponent } from '../../components/appliance-card/appliance-card.component';
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
        CountUpDirective
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
  public countUpOptionsPeakWattage = { duration: 1.5, startVal: 0 };
  public countUpOptionsTotalWattHours = { duration: 1.5, startVal: 0 };

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

          // Update appliance properties based on the loaded build
          this.build.appliances.forEach(buildAppliance => {
            const applianceIndex = this.allAppliances.findIndex(
              appliance => appliance.id === buildAppliance.id
            );
            if (applianceIndex !== -1) {
              this.allAppliances[applianceIndex] = {
                ...this.allAppliances[applianceIndex],
                ...buildAppliance
              };
            }
          });
        }
      }
    });

    this.applianceGroups = [
      ...new Set(this.allAppliances.map(appliance => appliance.applianceGroup))
    ];
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
      } else {
        this.build.appliances.push(selectedAppliance);
      }
    }

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

    try {
      await this.getSunHours(this.zipCode);
      this.build.id = uuidv4();
      this.buildService.saveBuild(this.build);
      // Navigate to the "builds" page with the buildId as a query param
      const navigationExtras = {
        queryParams: { buildId: this.build.id }
      };
      setTimeout(() => {
        //spoof loading time, not needed, purely ux
        this.router.navigate(['/build'], navigationExtras);
      }, 1200);
    } catch (error) {
      this.generatingBuild = false;
      this.sunHoursError = this.getSunHoursErrorMessage(error);
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
