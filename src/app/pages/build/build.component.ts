import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CountUpModule } from 'ngx-countup';
import { Build, defaultBuild } from 'src/app/interfaces/Build';
import { BuildService } from 'src/app/services/build.service';
import { CalculationUtilsService } from 'src/app/services/calculation-utils.service';

@Component({
  selector: 'app-build',
  standalone: true,
  imports: [CommonModule, CountUpModule],
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
    private calculationUtils: CalculationUtilsService
  ) {}

  public countUpOptions = { duration: 1.5 };

  public peakWattage: number = 0;
  public totalWattHours: number = 0;

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
    }
  }

  editAppliances() {
    // Navigate to the "builds" page with the buildId as a query param
    const navigationExtras = {
      queryParams: { buildId: this.build.id }
    };
    //spoof loading time, not needed, purely ux
    this.router.navigate(['/builder'], navigationExtras);
  }
}
