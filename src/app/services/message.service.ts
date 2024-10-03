import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment';
import { HttpClient, HttpParams } from '@angular/common/http';
import { catchError, Observable, throwError } from 'rxjs';



@Injectable({
  providedIn: 'root'
})
export class MessageService {

  private apiUrl:string = `${environment.apiBaseUrl}/api/Chat`;

  constructor(private http:HttpClient) { }

  getPastMessages(senderUsername: string, recipientUsername:string):Observable<any>{
    const params = new HttpParams()
      .set('senderUsername', senderUsername)
      .set('recipientUsername', recipientUsername);
    return this.http.get<any>(`${this.apiUrl}/between`, {params, withCredentials: true})
      .pipe(catchError((error) => {
        return throwError(()=> new Error(`Messages Not found, ${error.message}`)) //TODO: logging
      }));
  }
}
