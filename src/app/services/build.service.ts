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

  removeBuild(buildId: string) {
    localStorage.removeItem(`${this.buildKey}_${buildId}`);
  }
}
