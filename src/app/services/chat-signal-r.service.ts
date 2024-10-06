import { Injectable } from '@angular/core';
import * as signalR from '@microsoft/signalR'
import { Observable, Subject } from 'rxjs';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class ChatSignalRService {

  private apiUrl:string = `${environment.apiBaseUrl}/chatHub`;

  private hubConnection!: signalR.HubConnection;

  private globalMessageSubject = new Subject<{ username: string, message: string }>();

  private messageSubject = new Subject<{username: string, message: string }>();

  constructor() {
    this.createConnection();
   }

   private createConnection():void{
    this.hubConnection = new signalR.HubConnectionBuilder()
      .withUrl(`${this.apiUrl}`)
      .configureLogging(signalR.LogLevel.Information)
      .build();

      this.hubConnection.on('ReceiveMessage', (username:string ,message: string) => {
        this.globalMessageSubject.next({username, message});
      });

      this.hubConnection.on('ReceiveGroupMessage', (username, message:string)=>{
        this.messageSubject.next({username, message});
      });

       this.hubConnection.on('Userleft', (username: string) => {
        console.log(`${username} has left the group.`);
    });

      this.hubConnection.onclose(() => {
        console.log('Chat SignalR connection closed.'); // TODO: Logging
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
          console.log('Chat SignalR connected'); // TODO: Logging
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

   receiveMessage():Observable<{ username: string, message: string }>{
    return this.globalMessageSubject.asObservable();
   }

   receiveGroupMessage():Observable<{username: string,message: string }>{
    return this.messageSubject.asObservable();
   }

   sendMessage(username:string ,message:string):void{
    if(this.hubConnection.state === signalR.HubConnectionState.Connected){
      this.hubConnection.invoke('SendMessage',username, message)
        .then(() => console.log('Message sent'))
        .catch(err => console.error('Error sending message:', err));
    } else {
      console.error('Cannot send message, SignalR is not connected.');
    }
   }

   sendGroupMessage(username1: string, username2:string, message:string){
    if(this.hubConnection.state === signalR.HubConnectionState.Connected){
      this.hubConnection.invoke('SendGroupMessage',username1, username2, message)
        .then(() => console.log('Message sent'))
        .catch(err => console.error('Error sending message:', err));
    } else {
      console.error('Cannot send message, SignalR is not connected.');
    }
   }

   joinRoom(username1:string, username2:string){
    if(this.hubConnection.state === signalR.HubConnectionState.Connected){
      this.hubConnection.invoke('JoinRoom',username1, username2)
        .then(() => console.log('Connected To group'))
        .catch(err => console.error('Error sending message:', err));
    } else {
      console.error('Cannot send message, SignalR is not connected.');
    }
   }

   leaveRoom(username1:string, username2:string){
    if(this.hubConnection.state === signalR.HubConnectionState.Connected){
      this.hubConnection.invoke('LeaveRoom',username1, username2)
        .then(() => console.log('Left a group'))
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
