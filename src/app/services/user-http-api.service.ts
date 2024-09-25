import { Injectable } from '@angular/core';
import { catchError, Observable, throwError } from 'rxjs';
import { environment } from '../../environments/environment';
import { LoginUser } from '../shared/models/LoginUser';
import { HttpClient } from '@angular/common/http';
import { CookieService } from 'ngx-cookie-service';
import { SignupUser } from '../shared/models/SignupUser';

@Injectable({
  providedIn: 'root'
})
export class UserHttpApiService {

  private apiUrl:string = `${environment.apiBaseUrl}/api/User`;

  constructor(private http:HttpClient, private cookie: CookieService) { }

  getUser(loginUser:LoginUser):Observable<any>{
    return this.http.post<void>(`${this.apiUrl}/login`,loginUser,{ withCredentials: true})
      .pipe(catchError((error) => {
        return throwError(()=> new Error(`User Not found, ${error.message}`)) //TODO: checkout about this
      }));
  }

  createUser(newUser: SignupUser):Observable<SignupUser>{
    return this.http.post<SignupUser>(`${this.apiUrl}/signup`,newUser)
    .pipe(catchError((error) => {
        return throwError(()=> new Error(`User Not created, ${error.message}`)) //TODO: checkout about this
      }));
  }
}
