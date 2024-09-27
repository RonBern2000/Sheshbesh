import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { BehaviorSubject } from 'rxjs/internal/BehaviorSubject';

@Injectable({
  providedIn: 'root'
})
export class AuthUserService {
  private userSubject = new BehaviorSubject<{ id: string, username: string, email: string } | null>(null);

  setUser(user: { id: string, username: string, email: string }): void {
    this.userSubject.next(user);
  }

  getUser(): Observable<{ id: string, username: string, email: string } | null> {
    return this.userSubject.asObservable();
  }

  clearUser(): void {
    this.userSubject.next(null);
  }
}
