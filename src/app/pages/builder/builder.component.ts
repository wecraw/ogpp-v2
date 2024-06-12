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
import { SunHoursService } from '../../services/sun-hours.service';
import { FormsModule } from '@angular/forms';
import { ModalComponent } from '../../components/modal/modal.component';
import { LOCATION_DISCLAIMER } from '../../content/strings';
import { MiniCardComponent } from '../../components/mini-card/mini-card.component';
import { catchError, map } from 'rxjs';
import { Season } from '../../interfaces/Season';
import { Appliance } from '../../interfaces/Appliance';
import { CountUpModule } from 'ngx-countup';
import { Build, defaultBuild } from '../../interfaces/Build';
import { CalculationUtilsService } from '../../services/calculation-utils.service';
import { BuildService } from '../../services/build.service';
import { v4 as uuidv4 } from 'uuid';
import { ActivatedRoute, Router } from '@angular/router';

@Component({
  selector: 'builder',
  standalone: true,
  imports: [
    ApplianceCardComponent,
    CommonModule,
    FormsModule,
    ModalComponent,
    MiniCardComponent,
    CountUpModule
  ],
  templateUrl: './builder.component.html',
  styleUrls: ['./builder.component.scss']
})
export class BuilderComponent implements OnInit {
  @ViewChildren(MiniCardComponent) miniCards!: QueryList<MiniCardComponent>;

  // Content
  public allAppliances: Appliance[] = [...allAppliances];
  public originalAppliances: Appliance[] = [...allAppliances];
  public applianceGroups: string[] = [];
  public modalContent: string = LOCATION_DISCLAIMER;

  // Display values
  public peakWattage: number = 0;
  public totalWattHours: number = 0;

  // Input validation
  public zipCode: string = '';
  public zipErrorLength: boolean = false;
  public zipErrorFormat: boolean = false;

  // DOM controllers
  public generatingBuild: boolean = false;
  public showStep2: boolean = false;
  public isModalOpen: boolean = false;
  public countUpOptionsPeakWattage = { duration: 1.5, startVal: 0 };
  public countUpOptionsTotalWattHours = { duration: 1.5, startVal: 0 };

  // Inputs
  @Input() build: Build = defaultBuild;

  // Debug
  public debug = true;
  // public showResults: boolean = false; //debug

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private sunHoursService: SunHoursService,
    private calculationUtils: CalculationUtilsService,
    private buildService: BuildService,
    private changeDetectorRef: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.originalAppliances = allAppliances.map(appliance => ({ ...appliance }));

    this.route.queryParams.subscribe(params => {
      const buildId = params['buildId'];
      if (buildId) {
        if (this.buildService.getBuild(buildId)) {
          this.build = this.buildService.getBuild(buildId)!;
          this.showStep2 = true;
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

  // Modify getSunHours to return a Promise
  getSunHours(zip: string): Promise<void> {
    return new Promise((resolve, reject) => {
      if (this.debug) {
        this.build.zipCode = zip;
        this.build.monthlyGhi = {
          jan: 1,
          feb: 1,
          mar: 1,
          apr: 1,
          may: 1,
          jun: 1,
          jul: 1,
          aug: 1,
          sep: 1,
          oct: 1,
          nov: 1,
          dec: 1
        };
        resolve();
        return;
      }

      if (this.zipErrorFormat || this.zipErrorLength) {
        reject('Invalid ZIP code.');
        return;
      }

      if (!this.build.monthlyGhi || this.build.zipCode !== zip) {
        this.build.zipCode = zip;
        this.sunHoursService
          .getSunHoursByZip(zip)
          .pipe(
            map((response: any) => {
              this.build.monthlyGhi = response.outputs.avg_ghi.monthly;
              resolve();
            }),
            catchError((error: any) => {
              console.error('Error fetching sun hours:', error);
              reject(error);
              return error;
            })
          )
          .subscribe();
      } else {
        resolve();
      }
    });
  }

  updateTotals() {
    if (this.showStep2) {
      this.countUpOptionsPeakWattage = { duration: 0.7, startVal: this.peakWattage };
      this.countUpOptionsTotalWattHours = { duration: 0.7, startVal: this.totalWattHours };
      this.changeDetectorRef.detectChanges();
    }

    this.totalWattHours = this.calculationUtils.totalWattHours(this.build);
    this.peakWattage = this.calculationUtils.peakWattage(this.build);
  }

  // Modify generateBuild to await the completion of getSunHours
  async generateBuild() {
    this.generatingBuild = true;
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
      console.error('Failed to generate build:', error);
    } finally {
      //
    }
  }

  // Validators =============================================================

  validateZip(checkLength: boolean) {
    this.zipErrorFormat = /\D/.test(this.zipCode);
    if (checkLength) this.zipErrorLength = this.zipCode.length !== 5;
    if (this.zipErrorLength) this.zipErrorLength = this.zipCode.length !== 5;
  }

  isAnyApplianceSelected() {
    return this.build.appliances.length > 0;
  }

  // DOM Helpers ============================================================

  enableStep2() {
    this.showStep2 = true;

    setTimeout(() => {
      const element = document.getElementById('step2');
      if (element) {
        element.scrollIntoView({
          behavior: 'smooth',
          block: 'start',
          inline: 'nearest'
        });
      }
    }, 1);
  }

  openModal() {
    this.isModalOpen = true;
  }

  closeModal() {
    this.isModalOpen = false;
  }
}
