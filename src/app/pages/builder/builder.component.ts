import { Component, OnInit, QueryList, ViewChildren } from '@angular/core';
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

@Component({
  selector: 'builder',
  standalone: true,
  imports: [ApplianceCardComponent, CommonModule, FormsModule, ModalComponent, MiniCardComponent],
  templateUrl: './builder.component.html',
  styleUrls: ['./builder.component.scss']
})
export class BuilderComponent implements OnInit {
  @ViewChildren(ApplianceCardComponent) applianceCards!: QueryList<ApplianceCardComponent>;
  public allAppliances = allAppliances;
  public totalWattHours: number = 0;
  public peakWattage: number = 0;
  public isAnyApplianceSelected: boolean = false;
  public sunHours: number = 0;
  public zipCode: string = '';
  public selectedSeasons: Season[] = [];
  public applianceGroups: string[] = [];
  public showStep2: boolean = false;
  public zipErrorLength: boolean = false;
  public zipErrorFormat: boolean = false;

  isModalOpen = false;
  modalContent = LOCATION_DISCLAIMER;

  openModal() {
    this.isModalOpen = true;
  }

  closeModal() {
    this.isModalOpen = false;
  }
  constructor(private sunHoursService: SunHoursService) {}

  ngOnInit(): void {
    this.updateTotals();
    this.applianceGroups = [
      ...new Set(this.allAppliances.map(appliance => appliance.applianceGroup))
    ];
  }
  getAppliancesByGroup(group: string): Appliance[] {
    return this.allAppliances.filter(appliance => appliance.applianceGroup === group);
  }

  onApplianceValueChange(updatedAppliance: any, appliance: Appliance) {
    Object.assign(appliance, updatedAppliance); // Update the properties of the existing appliance
    this.updateTotals();
  }

  onApplianceSelect(appliance: any, index: number) {
    this.allAppliances[index].selected = !this.allAppliances[index].selected;
    this.updateTotals();
    this.checkApplianceSelection();
  }

  onSeasonSelect(selected: boolean, selectedSeason: Season) {
    if (selected) this.selectedSeasons.push(selectedSeason);
    if (!selected)
      this.selectedSeasons = this.selectedSeasons.filter(season => season !== selectedSeason);
  }

  validateZip(checkLength: boolean) {
    this.zipErrorFormat = /\D/.test(this.zipCode);
    if (checkLength) this.zipErrorLength = this.zipCode.length !== 5;
    if (this.zipErrorLength) this.zipErrorLength = this.zipCode.length !== 5;
  }

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

  updateTotals() {
    // Calculate totalWattHours and peakWattage for selected appliances only
    this.totalWattHours = this.allAppliances.reduce((total, appliance) => {
      if (appliance.selected) {
        return total + appliance.wattage * appliance.hours * appliance.quantity;
      }
      return total;
    }, 0);

    this.peakWattage = this.allAppliances.reduce((total, appliance) => {
      if (appliance.selected) {
        return total + appliance.wattage * appliance.quantity;
      }
      return total;
    }, 0);
  }

  getSunHours(zip: string) {
    if (zip.length !== 5) return;
    this.sunHoursService
      .getSunHoursByZip(zip)
      .pipe(
        map((response: any) => {
          const monthlyData = response.outputs.avg_ghi.monthly;
          const seasonMonthsMap: { [season in Season]: string[] } = {
            winter: ['dec', 'jan', 'feb'],
            spring: ['mar', 'apr', 'may'],
            summer: ['jun', 'jul', 'aug'],
            fall: ['sep', 'oct', 'nov']
          };

          const selectedMonths = this.selectedSeasons.reduce<string[]>((months, season) => {
            if (seasonMonthsMap[season]) {
              months.push(...seasonMonthsMap[season]);
            }
            return months;
          }, []);

          const selectedValues = selectedMonths.map(month => monthlyData[month]);
          this.sunHours = Math.min(...selectedValues);
          console.log(this.sunHours);
        }),
        catchError((error: any) => {
          console.error('Error fetching sun hours:', error);
          return error;
        })
      )
      .subscribe();
  }

  checkApplianceSelection() {
    //permanent flag, once set to true will not turn back off
    if (!this.isAnyApplianceSelected)
      this.isAnyApplianceSelected = this.allAppliances.some(appliance => appliance.selected);
  }
}
