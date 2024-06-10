import { Component, Input, OnInit, QueryList, ViewChildren } from '@angular/core';
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
import { Router } from '@angular/router';

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
  @ViewChildren(ApplianceCardComponent) applianceCards!: QueryList<ApplianceCardComponent>;

  // Content
  public allAppliances = allAppliances;
  public applianceGroups: string[] = [];
  public modalContent = LOCATION_DISCLAIMER;

  // Input validation
  public zipCode: string = '';
  public zipErrorLength: boolean = false;
  public zipErrorFormat: boolean = false;

  // DOM controllers
  public showResults: boolean = false;
  public generatingBuild: boolean = false;
  public hideButton: boolean = false;
  public showStep2: boolean = false;
  public isModalOpen = false;

  // Inputs
  @Input() build: Build = defaultBuild;

  // Debug
  public debug = false;

  constructor(
    private router: Router,
    private sunHoursService: SunHoursService,
    public calculationUtils: CalculationUtilsService,
    private buildService: BuildService
  ) {}

  ngOnInit(): void {
    this.applianceGroups = [
      ...new Set(this.allAppliances.map(appliance => appliance.applianceGroup))
    ];
  }

  getAppliancesByGroup(group: string): Appliance[] {
    return this.allAppliances.filter(appliance => appliance.applianceGroup === group);
  }

  onApplianceValueChange(updatedAppliance: any, appliance: Appliance) {
    Object.assign(appliance, updatedAppliance); // Update the properties of the existing appliance
  }

  onApplianceSelect(id: string) {
    const selectedAppliance = this.allAppliances.find(item => item.id === id);
    if (selectedAppliance) {
      const index = this.build.appliances.indexOf(selectedAppliance);
      if (index !== -1) {
        this.build.appliances.splice(index, 1);
      } else {
        this.build.appliances.push(selectedAppliance);
      }
    }
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
    this.hideButton = true;
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
