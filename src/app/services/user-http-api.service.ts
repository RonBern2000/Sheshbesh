import { Injectable } from '@angular/core';
import { catchError, Observable, tap, throwError } from 'rxjs';
import { environment } from '../../environments/environment';
import { LoginUser } from '../shared/models/LoginUser';
import { HttpClient } from '@angular/common/http';
import { SignupUser } from '../shared/models/SignupUser';
import { AuthUserService } from './auth-user.service';

@Injectable({
  providedIn: 'root'
})
export class UserHttpApiService {

  private apiUrl:string = `${environment.apiBaseUrl}/api/User`;

  constructor(private authUser:AuthUserService,private http:HttpClient) { }

   getAllUsers(page: number, pageSize: number): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/allUsers?page=${page}&size=${pageSize}`);
  }

  login(loginUser:LoginUser):Observable<any>{
    return this.http.post<void>(`${this.apiUrl}/login`,loginUser,{ withCredentials: true})
      .pipe(catchError((error) => {
        return throwError(()=> new Error(`User Not found, ${error.message}`))
      }));
  }

  logout():Observable<any>{
    return this.http.post(`${this.apiUrl}/logout`,{},{withCredentials: true})
    .pipe(
      tap(() => {
        this.authUser.clearUser();
      }),
      catchError((error) => {
        return throwError(() => new Error(`Logout failed, ${error.message}`));
      })
    ); 
  }

  createUser(newUser: SignupUser):Observable<any>{
    return this.http.post<any>(`${this.apiUrl}/signup`,newUser,{withCredentials: true})
    .pipe(catchError((error) => {
        return throwError(()=> new Error(`User Not created, ${error.message}`)) 
      }));
  }

  isAuth():Observable<any>{
    return this.http.post<any>(`${this.apiUrl}/authStatus`,{},{ withCredentials: true})
      .pipe(catchError((error)=>{
        return throwError(()=> new Error(`User Not created, ${error.message}`))
      }));
  }
}
