import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { take } from 'rxjs';
import { BuildService } from 'src/app/services/build.service';
import { BuildShareService } from 'src/app/services/build-share.service';

// Landing page for shareable build links (`/share#<payload>`). Imports the shared build into
// this browser's localStorage, then hands off to the normal build flow. Only renders
// anything itself when the link can't be read.
@Component({
  selector: 'app-share',
  templateUrl: './share.component.html',
  styleUrl: './share.component.scss'
})
export class ShareComponent implements OnInit {
  public invalidLink: boolean = false;

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private buildService: BuildService,
    private buildShareService: BuildShareService
  ) {}

  ngOnInit() {
    this.route.fragment.pipe(take(1)).subscribe(fragment => {
      if (!fragment) {
        this.invalidLink = true;
        return;
      }

      let buildId: string;
      try {
        buildId = this.buildShareService.importBuild(fragment);
      } catch {
        this.invalidLink = true;
        return;
      }

      // A build with a station chosen opens on /build; one shared straight from the builder
      // (no station yet) opens on /results, same as the builder's own hand-off.
      const build = this.buildService.getBuild(buildId);
      const route = build?.inverter?.maxOutput ? '/build' : '/results';
      // replaceUrl so Back doesn't return here and re-run the import.
      this.router.navigate([route], { queryParams: { buildId }, replaceUrl: true });
    });
  }

  viewSavedBuilds() {
    this.router.navigate(['/builds']);
  }

  createBuild() {
    this.router.navigate(['/builder']);
  }
}
