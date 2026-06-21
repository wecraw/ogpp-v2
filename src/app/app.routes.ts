import { Routes } from '@angular/router';
import { HomeComponent } from './pages/home/home.component';
import { BuilderComponent } from './pages/builder/builder.component';
import { BuildsComponent } from './pages/builds/builds.component';
import { BuildComponent } from './pages/build/build.component';
import { ResultsComponent } from './pages/results/results.component';
import { CheckoutComponent } from './pages/checkout/checkout.component';

export const routes: Routes = [
  {
    path: 'home',
    component: HomeComponent
  },
  {
    path: 'builder',
    component: BuilderComponent
  },
  {
    path: 'builds',
    component: BuildsComponent
  },
  {
    path: 'build',
    component: BuildComponent
  },
  {
    path: 'results',
    component: ResultsComponent
  },
  {
    path: 'checkout',
    component: CheckoutComponent
  },
  {
    path: '',
    redirectTo: '/home',
    pathMatch: 'full'
  },
  {
    path: '**',
    redirectTo: '/home'
  }
];
