import { Injectable } from '@angular/core';
import { Build } from '../interfaces/Build';

@Injectable({
  providedIn: 'root'
})
export class BuildService {
  private buildKey = 'build';

  saveBuild(build: Build) {
    localStorage.setItem(`${this.buildKey}_${build.id}`, JSON.stringify(build));
  }

  getBuild(buildId: string): Build | null {
    const storedBuild = localStorage.getItem(`${this.buildKey}_${buildId}`);
    return storedBuild ? JSON.parse(storedBuild) : null;
  }

  // Scans localStorage for every `build_<id>` entry and returns the parsed builds.
  // Malformed entries are skipped rather than throwing, so one bad record can't
  // break the whole saved-builds list.
  listBuilds(): Build[] {
    const builds: Build[] = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (!key || !key.startsWith(`${this.buildKey}_`)) continue;
      const raw = localStorage.getItem(key);
      if (!raw) continue;
      try {
        builds.push(JSON.parse(raw));
      } catch {
        // Skip a corrupt entry instead of failing the entire list.
      }
    }
    return builds;
  }

  removeBuild(buildId: string) {
    localStorage.removeItem(`${this.buildKey}_${buildId}`);
  }
}
