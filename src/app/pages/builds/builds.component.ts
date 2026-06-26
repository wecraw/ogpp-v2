import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { v4 as uuidv4 } from 'uuid';
import { Build } from 'src/app/interfaces/Build';
import { BuildService } from 'src/app/services/build.service';

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

  constructor(private router: Router, private buildService: BuildService) {}

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
    if ((event.target as HTMLElement).closest('button')) return;
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
