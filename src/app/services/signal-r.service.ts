import { Injectable } from '@angular/core';
import * as signalR from '@microsoft/signalR'
import { Observable, Subject } from 'rxjs';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class SignalRService {

  private apiUrl:string = `${environment.apiBaseUrl}/chatHub`;

  private hubConnection!: signalR.HubConnection;

  private messageSubject = new Subject<string>();

  constructor() {
    this.createConnection();
   }

   private createConnection():void{
    this.hubConnection = new signalR.HubConnectionBuilder()
      .withUrl(`${this.apiUrl}`)
      .build();

      this.hubConnection.on('ReceiveMessage', (message: string) => {
      this.messageSubject.next(message);
    });

    this.hubConnection.onclose(() => {
      console.log('SignalR connection closed.'); // TODO: Logging
    });

    this.hubConnection.onreconnected(() => {
      console.log('SignalR connection reestablished.'); // TODO: Logging
    });

    this.hubConnection.onreconnecting(() => {
      console.log('SignalR connection is reconnecting.'); // TODO: Logging
    });
   
    }

   startConnection(): Observable<void>{
    return new Observable<void>((observer)=>{
      if(this.hubConnection.state === signalR.HubConnectionState.Disconnected){
        this.hubConnection
        .start()
        .then(()=>{
          console.log('SignalR connected'); // TODO: Logging
          observer.next();
          observer.complete();
        })
        .catch((error)=>{
          console.error(`Error connecting to SignalR hub:`, error);
          observer.error(error);
        })
      }else{ // Handdling already exsiting connection
        console.log('SignalR connection is already in progress or connected.'); // TODO: Logging
        observer.next();
        observer.complete();
      }
    });
   }

   receiveMessage():Observable<string>{
    return this.messageSubject.asObservable();
   }

   sendMessage(message:string):void{
    if(this.hubConnection.state === signalR.HubConnectionState.Connected){
      this.hubConnection.invoke('SendMessage', message)
        .then(() => console.log('Message sent'))
        .catch(err => console.error('Error sending message:', err));
    } else {
      console.error('Cannot send message, SignalR is not connected.');
    }
   }

   disconnect(): void {
    if (this.hubConnection.state === signalR.HubConnectionState.Connected) {
      this.hubConnection.stop()
        .then(() => console.log('SignalR connection stopped'))
        .catch(err => console.error('Error stopping SignalR connection:', err));
    } else {
      console.log('SignalR connection is not connected.');
    }
  }
}
