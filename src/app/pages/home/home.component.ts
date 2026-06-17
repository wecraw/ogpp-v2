import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Build } from 'src/app/interfaces/Build';
import { BuildService } from 'src/app/services/build.service';

// A trimmed view of a Build for the "continue where you left off" rail.
interface RecentBuild {
  id: string;
  name: string;
  station: string; // chosen inverter (all-in-one unit) name, if picked yet
  applianceCount: number;
  lastEdited: string | Date;
}

@Component({
  selector: 'app-home',
  imports: [CommonModule],
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss'
})
export class HomeComponent implements OnInit {
  public recentBuilds: RecentBuild[] = [];

  // The three steps of the flow, surfaced on the landing page so a first-time
  // visitor knows what they're signing up for before they tap "Get started".
  public readonly steps = [
    {
      icon: 'bi-grid-1x2',
      title: 'Pick your appliances',
      body: "Tell us what you want to run off grid and where you are. We size the load."
    },
    {
      icon: 'bi-sliders',
      title: 'Match your gear',
      body: 'We filter every inverter, battery, and panel down to what actually fits.'
    },
    {
      icon: 'bi-box-seam',
      title: 'Get your build',
      body: 'See a complete, compatible system with pricing and where to buy it.'
    }
  ];

  constructor(private router: Router, private buildService: BuildService) {}

  ngOnInit() {
    this.recentBuilds = this.buildService
      .listBuilds()
      .sort((a, b) => new Date(b.lastEdited).getTime() - new Date(a.lastEdited).getTime())
      .slice(0, 3)
      .map(build => this.toRecent(build));
  }

  get hasBuilds(): boolean {
    return this.recentBuilds.length > 0;
  }

  startBuild() {
    this.router.navigate(['/builder']);
  }

  openBuild(id: string) {
    this.router.navigate(['/build'], { queryParams: { buildId: id } });
  }

  viewAllBuilds() {
    this.router.navigate(['/builds']);
  }

  private toRecent(build: Build): RecentBuild {
    return {
      id: build.id,
      name: build.name?.trim() || 'Untitled build',
      station: build.inverter?.name ?? '',
      applianceCount: build.appliances?.length ?? 0,
      lastEdited: build.lastEdited
    };
  }
}
