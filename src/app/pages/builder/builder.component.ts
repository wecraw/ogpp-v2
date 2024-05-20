import { Component, OnInit, QueryList, ViewChildren } from '@angular/core';
import { allAppliances } from '../../content/appliances';
import { ApplianceCardComponent } from '../../components/appliance-card/appliance-card.component';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'builder',
  standalone: true,
  imports: [ApplianceCardComponent, CommonModule],
  templateUrl: './builder.component.html',
  styleUrls: ['./builder.component.scss']
})
export class BuilderComponent implements OnInit {
  @ViewChildren(ApplianceCardComponent) applianceCards!: QueryList<ApplianceCardComponent>;
  public allAppliances = allAppliances;
  public totalWattHours: number = 0;
  public peakWattage: number = 0;

  ngOnInit(): void {
    this.updateTotals();
  }

  onApplianceValueChange(updatedAppliance: any, index: number) {
    console.log(allAppliances);
    this.allAppliances[index] = updatedAppliance;
    this.updateTotals();
  }

  onApplianceSelect(appliance: any, index: number) {
    this.allAppliances[index].selected = !this.allAppliances[index].selected;
    this.updateTotals();
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
}
