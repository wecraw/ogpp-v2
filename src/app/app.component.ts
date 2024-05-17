import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { BladeComponent } from "./components/blade/blade.component";

@Component({
    selector: 'app-root',
    standalone: true,
    templateUrl: './app.component.html',
    styleUrl: './app.component.scss',
    imports: [RouterOutlet, BladeComponent]
})
export class AppComponent {
  title = 'ogpp-v2';
}
