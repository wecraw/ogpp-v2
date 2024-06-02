import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { ApplianceCardComponent } from './components/appliance-card/appliance-card.component';
import { BuilderComponent } from './pages/builder/builder.component';
import { HeaderComponent } from './components/header/header.component';

@Component({
  selector: 'app-root',
  standalone: true,
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss',
  imports: [RouterOutlet, BuilderComponent, ApplianceCardComponent, HeaderComponent]
})
export class AppComponent {
  title = 'ogpp-v2';
}
