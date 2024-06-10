import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Build } from 'src/app/interfaces/Build';
import { BuildService } from 'src/app/services/build.service';

@Component({
  selector: 'app-build',
  standalone: true,
  imports: [],
  templateUrl: './build.component.html',
  styleUrl: './build.component.scss'
})
export class BuildComponent implements OnInit {
  build: Build | null = null;

  constructor(private route: ActivatedRoute, private buildService: BuildService) {}

  ngOnInit() {
    this.route.queryParams.subscribe(params => {
      const buildId = params['buildId'];
      if (buildId) {
        this.build = this.buildService.getBuild(buildId);
        console.log(this.build);
      }
    });
  }
}
