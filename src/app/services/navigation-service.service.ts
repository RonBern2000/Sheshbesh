import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class NavigationServiceService {
  private routeConfig:{ [key: string]: { btnText: string; targetRoute: string } } = {
    '/signup': { btnText: 'Login', targetRoute: '' },
    '/chatHub': { btnText: 'Logout', targetRoute: '' },
    '/game': { btnText: 'Logout', targetRoute: '' },
    '': { btnText: 'Sign Up', targetRoute: '/signup' }
  };

  constructor(){}

  getNavigationConfig(url: string) {
    return this.routeConfig[url] || this.routeConfig[''];
  }
}
