import { Routes } from '@angular/router';
import { BuilderComponent } from './pages/builder/builder.component';
import { BuildsComponent } from './pages/builds/builds.component';
import { BuildComponent } from './pages/build/build.component';
import { CheckoutComponent } from './pages/checkout/checkout.component';

export const routes: Routes = [
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
    path: 'checkout',
    component: CheckoutComponent
  },
  {
    path: '',
    redirectTo: '/builder',
    pathMatch: 'full'
  },
  {
    path: '**',
    redirectTo: '/builder'
  }
];
