import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CountUpModule } from 'ngx-countup';
import { ModalComponent } from 'src/app/components/modal/modal.component';
import { Build, defaultBuild } from 'src/app/interfaces/Build';
import { BuildService } from 'src/app/services/build.service';
import { CalculationUtilsService } from 'src/app/services/calculation-utils.service';
import { INVERTER_EXPLANATION, INVERTER_EXPLANATION_TITLE } from 'src/app/content/strings';
import { BuildComponentCardComponent } from 'src/app/components/build-component-card/build-component-card.component';
import { ProductSelectorService } from 'src/app/services/product-selector.service';
import { Inverter, defaultInverter } from 'src/app/interfaces/Inverter';
import { Battery, defaultBattery } from 'src/app/interfaces/Battery';
@Component({
  selector: 'app-build',
  standalone: true,
  imports: [CommonModule, CountUpModule, ModalComponent, BuildComponentCardComponent],
  templateUrl: './build.component.html',
  styleUrl: './build.component.scss'
})
export class BuildComponent implements OnInit {
  public build: Build = defaultBuild;
  public buildNotFound: boolean = false;

  // public inverter = inverters[0]; //debug

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private buildService: BuildService,
    private calculationUtils: CalculationUtilsService,
    private productSelectorService: ProductSelectorService
  ) {}

  public countUpOptions = { duration: 0.7 };

  public peakWattage: number = 0;
  public totalWattHours: number = 0;

  // Products
  public inverters: Inverter[] = [];

  // Content
  public modalContent: string = '';
  public modalTitle: string = '';

  // Compatibility
  public isInverterCompatible: boolean = false;

  // DOM Controllers
  public isModalOpen: boolean = false;
  public showInverterCheck: boolean = false;
  public showStep2: boolean = false;
  public showStep3: boolean = false;

  ngOnInit() {
    this.route.queryParams.subscribe(params => {
      const buildId = params['buildId'];
      if (buildId) {
        if (this.buildService.getBuild(buildId)) {
          this.build = this.buildService.getBuild(buildId)!;
        } else {
          this.buildNotFound = true;
        }
      }
    });
    if (this.build) {
      this.peakWattage = this.calculationUtils.peakWattage(this.build);
      this.totalWattHours = this.calculationUtils.totalWattHours(this.build);
      this.inverters = this.productSelectorService.getMatchingInverters(this.build);
    }
  }

  onInverterSelect(selected: boolean, inverter: Inverter) {
    setTimeout(() => {
      this.showStep2 = true;
    }, this.countUpOptions.duration * 1000);
    if (selected) {
      this.build.inverter = inverter;
    } else {
      this.build.inverter = defaultInverter;
    }
    this.confirmCompatibility('inverter');
  }

  editAppliances() {
    // Navigate to the "builds" page with the buildId as a query param
    const navigationExtras = {
      queryParams: { buildId: this.build.id }
    };
    this.router.navigate(['/builder'], navigationExtras);
  }

  confirmCompatibility(device: string) {
    if (device === 'inverter') {
      if (this.build.inverter.maxOutput >= this.peakWattage) {
        this.isInverterCompatible = true;
        setTimeout(() => {
          this.showInverterCheck = true;
        }, this.countUpOptions.duration * 1000);
      } else {
        this.isInverterCompatible = false;
        this.showInverterCheck = false;
      }
    }
  }

  // DOM Helpers
  toggleModal(content?: string) {
    this.isModalOpen = !this.isModalOpen;

    if (content === 'inverter') {
      this.modalContent = INVERTER_EXPLANATION;
      this.modalTitle = INVERTER_EXPLANATION_TITLE;
    }
  }
}
