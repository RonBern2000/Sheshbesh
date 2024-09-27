import { Component, OnInit } from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';
import { UserHttpApiService } from '../../services/user-http-api.service';
import { tap, catchError } from 'rxjs/operators';
import { of } from 'rxjs';
import { NavigationServiceService } from '../../services/navigation-service.service';
import { AuthUserService } from '../../services/auth-user.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './header.component.html',
  styleUrl: './header.component.css'
})
export class HeaderComponent implements OnInit {

  btnText:string= 'Sign Up';
  targetRoute:string = '/signup';

  user: { id: string, username: string, email: string } | null = null;

  constructor(private authUser:AuthUserService,private router: Router, private userHttpService:UserHttpApiService,private navigationService: NavigationServiceService){}

  ngOnInit(): void {
    this.authUser.getUser().subscribe(user=>{
      this.user = user;
    });
    
    this.router.events.subscribe(event=>{
      if (event instanceof NavigationEnd) {
        const config = this.navigationService.getNavigationConfig(this.router.url);
        this.btnText = config.btnText;
        this.targetRoute = config.targetRoute;
      }
    });
  }

  navigate():void{
    if (this.btnText === 'Logout') {
    this.userHttpService.logout().pipe(
      tap(() => {
        this.router.navigate([this.targetRoute]);
      }),
      catchError(error => {
        console.error('Logout failed', error);
        return of(null);
      })
    ).subscribe();
    } else {
    this.router.navigate([this.targetRoute]);
    }
  }
}
