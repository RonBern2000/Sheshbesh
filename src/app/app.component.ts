import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { LoginComponentComponent } from './components/main/login-component/login-component.component';
import { HeaderComponent } from './components/header/header.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet,HeaderComponent,LoginComponentComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent {
  title = 'Sheshbesh';
}
