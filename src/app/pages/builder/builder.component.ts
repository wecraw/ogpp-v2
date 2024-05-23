import { Component, OnInit, QueryList, ViewChildren } from '@angular/core';
import { allAppliances } from '../../content/appliances';
import { ApplianceCardComponent } from '../../components/appliance-card/appliance-card.component';
import { CommonModule } from '@angular/common';
import { SunHoursService } from '../../services/sun-hours.service';
import { FormsModule } from '@angular/forms';
import { ModalComponent } from '../../components/modal/modal.component';
import { LOCATION_DISCLAIMER } from '../../content/strings';

@Component({
  selector: 'builder',
  standalone: true,
  imports: [ApplianceCardComponent, CommonModule, FormsModule, ModalComponent],
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
  }

  onApplianceValueChange(updatedAppliance: any, index: number) {
    this.allAppliances[index] = updatedAppliance;
    this.updateTotals();
  }

  onApplianceSelect(appliance: any, index: number) {
    this.allAppliances[index].selected = !this.allAppliances[index].selected;
    this.updateTotals();
    this.checkApplianceSelection();
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
    this.sunHoursService.getSunHoursByZip(zip).subscribe(
      (response: any) => {
        // Assuming the response contains the sun hours data
        this.sunHours = response.outputs.avg_ghi.annual;
      },
      (error: any) => {
        console.error('Error fetching sun hours:', error);
      }
    );
  }

  checkApplianceSelection() {
    this.isAnyApplianceSelected = this.allAppliances.some(appliance => appliance.selected);
  }
}
