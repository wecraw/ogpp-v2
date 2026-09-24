import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { v4 as uuidv4 } from 'uuid';
import { Build } from 'src/app/interfaces/Build';
import { BuildService } from 'src/app/services/build.service';
import { BuildShareService } from 'src/app/services/build-share.service';

// A flattened, display-ready view of a Build for the saved-builds list. Computing the
// key specs once on load keeps the template free of reduce()/null-guard logic.
interface BuildSummary {
  id: string;
  name: string;
  station: string; // chosen inverter (all-in-one unit) name
  brand: string;
  applianceCount: number;
  output: number; // inverter max output, W
  capacity: number; // built-in + added battery capacity, Wh
  panelWattage: number; // total solar panel wattage, W
  createdOn: string | Date;
  lastEdited: string | Date;
}

@Component({
  selector: 'app-builds',
  imports: [CommonModule],
  templateUrl: './builds.component.html',
  styleUrl: './builds.component.scss'
})
export class BuildsComponent implements OnInit {
  public builds: BuildSummary[] = [];

  // Inline-edit state: only one card is ever confirming a delete at a time.
  public confirmingDeleteId: string | null = null;

  // The card whose share link was just copied, for a brief "copied" check state.
  public copiedId: string | null = null;
  private copiedTimer?: ReturnType<typeof setTimeout>;

  constructor(
    private router: Router,
    private buildService: BuildService,
    private buildShareService: BuildShareService
  ) {}

  ngOnInit() {
    this.loadBuilds();
  }

  private loadBuilds() {
    this.builds = this.buildService
      .listBuilds()
      .map(build => this.toSummary(build))
      // Most recently edited first, so the build the user just finished sits on top.
      .sort((a, b) => new Date(b.lastEdited).getTime() - new Date(a.lastEdited).getTime());
  }

  private toSummary(build: Build): BuildSummary {
    const builtIn = build.inverter?.batteryCapacity ?? 0;
    const capacity = (build.batteries ?? []).reduce(
      (total, battery) => total + (battery.batteryCapacity ?? 0),
      builtIn
    );
    const panelWattage = (build.powerSources ?? []).reduce(
      (total, panel) => total + (panel.maxOutput ?? 0),
      0
    );

    return {
      id: build.id,
      name: build.name?.trim() ?? '',
      station: build.inverter?.name ?? '',
      brand: build.inverter?.brand ?? '',
      applianceCount: build.appliances?.length ?? 0,
      output: build.inverter?.maxOutput ?? 0,
      capacity,
      panelWattage,
      createdOn: build.createdOn,
      lastEdited: build.lastEdited
    };
  }

  // Builds created before the rename UI existed have no name; fall back to the chosen
  // station, then a generic label, so a card is never blank.
  displayName(summary: BuildSummary): string {
    return summary.name || summary.station || 'Untitled build';
  }

  // ----- Reopen -----

  // The whole card is clickable, but clicks on the action buttons (Open, duplicate,
  // delete, and the delete-confirm controls) should run their own handler instead of
  // navigating. Guarding on the real event target is bulletproof regardless of how
  // Angular dispatches the bubbled event.
  onCardClick(event: MouseEvent, id: string) {
    const target = event.target as HTMLElement;
    if (target.closest('button') || target.closest('.icon-actions')) return;
    this.reopen(id);
  }

  reopen(id: string) {
    this.router.navigate(['/build'], { queryParams: { buildId: id } });
  }

  // ----- Duplicate -----

  duplicate(id: string) {
    const build = this.buildService.getBuild(id);
    if (!build) return;
    const now = new Date();
    const copy: Build = {
      ...build,
      id: uuidv4(),
      name: `${build.name?.trim() || build.inverter?.name || 'Untitled build'} copy`,
      createdOn: now,
      lastEdited: now
    };
    this.buildService.saveBuild(copy);
    this.loadBuilds();
  }

  // ----- Share -----

  // Copies a link that opens the build on another device/browser, falling back to a prompt
  // with the URL when the Clipboard API isn't available.
  async share(id: string) {
    const build = this.buildService.getBuild(id);
    if (!build) return;
    const copied = await this.buildShareService.copyShareLink(build);
    if (!copied) {
      window.prompt('Copy this link to share your build:', this.buildShareService.shareUrl(build));
      return;
    }
    this.copiedId = id;
    clearTimeout(this.copiedTimer);
    this.copiedTimer = setTimeout(() => (this.copiedId = null), 2000);
  }

  // ----- Delete (inline confirm) -----

  startDelete(id: string) {
    this.confirmingDeleteId = id;
  }

  confirmDelete(id: string) {
    this.buildService.removeBuild(id);
    this.confirmingDeleteId = null;
    this.loadBuilds();
  }

  cancelDelete() {
    this.confirmingDeleteId = null;
  }

  // ----- Empty state -----

  createBuild() {
    this.router.navigate(['/builder']);
  }
}
