import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { BehaviorSubject } from 'rxjs/internal/BehaviorSubject';

@Injectable({
  providedIn: 'root'
})
export class AuthUserService {
  private userSubject = new BehaviorSubject<{ id: string, username: string, email: string } | null>(null);

  constructor(){
    const savedUser = sessionStorage.getItem('authUser');
    if(savedUser){
      const user = JSON.parse(savedUser);
      this.userSubject.next(user);
    }
  }

  setUser(user: { id: string, username: string, email: string }): void {
    sessionStorage.setItem('authUser', JSON.stringify(user));
    this.userSubject.next(user);
  }

  getUser(): Observable<{ id: string, username: string, email: string } | null> {
    return this.userSubject.asObservable();
  }

  clearUser(): void {
    sessionStorage.removeItem('authUser');
    this.userSubject.next(null);
  }
}
