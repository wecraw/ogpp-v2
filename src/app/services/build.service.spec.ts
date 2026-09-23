import { TestBed } from '@angular/core/testing';

import { BuildService } from './build.service';
import { Build, defaultBuild } from '../interfaces/Build';

function makeBuild(overrides: Partial<Build>): Build {
  return { ...defaultBuild, ...overrides };
}

describe('BuildService', () => {
  let service: BuildService;

  beforeEach(() => {
    localStorage.clear();
    TestBed.configureTestingModule({});
    service = TestBed.inject(BuildService);
  });

  afterEach(() => localStorage.clear());

  it('stores builds under a build_<id> key', () => {
    service.saveBuild(makeBuild({ id: 'abc' }));
    expect(localStorage.getItem('build_abc')).not.toBeNull();
  });

  it('round-trips a saved build', () => {
    service.saveBuild(makeBuild({ id: 'abc', name: 'Cabin', zipCode: '94107' }));

    const loaded = service.getBuild('abc');

    expect(loaded?.id).toBe('abc');
    expect(loaded?.name).toBe('Cabin');
    expect(loaded?.zipCode).toBe('94107');
  });

  it('overwrites an existing build with the same id', () => {
    service.saveBuild(makeBuild({ id: 'abc', name: 'First' }));
    service.saveBuild(makeBuild({ id: 'abc', name: 'Second' }));

    expect(service.getBuild('abc')?.name).toBe('Second');
    expect(service.listBuilds().length).toBe(1);
  });

  it('returns null for an unknown build id', () => {
    expect(service.getBuild('missing')).toBeNull();
  });

  it('lists only build_ entries, ignoring unrelated localStorage keys', () => {
    service.saveBuild(makeBuild({ id: 'a' }));
    service.saveBuild(makeBuild({ id: 'b' }));
    localStorage.setItem('some_other_key', '{"id":"nope"}');

    const ids = service.listBuilds().map(build => build.id).sort();

    expect(ids).toEqual(['a', 'b']);
  });

  it('skips a corrupt entry instead of failing the whole list', () => {
    service.saveBuild(makeBuild({ id: 'good' }));
    localStorage.setItem('build_bad', '{not json');

    const builds = service.listBuilds();

    expect(builds.map(build => build.id)).toEqual(['good']);
  });

  it('removes a build', () => {
    service.saveBuild(makeBuild({ id: 'gone' }));

    service.removeBuild('gone');

    expect(service.getBuild('gone')).toBeNull();
    expect(service.listBuilds().length).toBe(0);
  });
});
