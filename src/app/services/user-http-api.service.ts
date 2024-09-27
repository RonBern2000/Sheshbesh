import { Injectable } from '@angular/core';
import { catchError, Observable, tap, throwError } from 'rxjs';
import { environment } from '../../environments/environment';
import { LoginUser } from '../shared/models/LoginUser';
import { HttpClient } from '@angular/common/http';
import { CookieService } from 'ngx-cookie-service';
import { SignupUser } from '../shared/models/SignupUser';
import { AuthUserService } from './auth-user.service';

@Injectable({
  providedIn: 'root'
})
export class UserHttpApiService {

  private apiUrl:string = `${environment.apiBaseUrl}/api/User`;

  constructor(private authUser:AuthUserService,private http:HttpClient, private cookie: CookieService) { }

  login(loginUser:LoginUser):Observable<any>{
    return this.http.post<void>(`${this.apiUrl}/login`,loginUser,{ withCredentials: true})
      .pipe(catchError((error) => {
        return throwError(()=> new Error(`User Not found, ${error.message}`)) //TODO: logging
      }));
  }

  logout():Observable<any>{
    return this.http.post(`${this.apiUrl}/logout`,{},{withCredentials: true})
    .pipe(
      tap(() => {
        this.authUser.clearUser();
      }),
      catchError((error) => {
        return throwError(() => new Error(`Logout failed, ${error.message}`)); // TODO: catch the error here + logging
      })
    ); 
  }

  createUser(newUser: SignupUser):Observable<any>{
    return this.http.post<void>(`${this.apiUrl}/signup`,newUser,{ withCredentials: true})
    .pipe(catchError((error) => {
        return throwError(()=> new Error(`User Not created, ${error.message}`)) //TODO: logging
      }));
  }

  isAuth():Observable<any>{
    return this.http.post<boolean>(`${this.apiUrl}/authStatus`,{},{ withCredentials: true})
      .pipe(catchError((error)=>{
        return throwError(()=> new Error(`User Not created, ${error.message}`)) //TODO: logging
      }));
  }
}
