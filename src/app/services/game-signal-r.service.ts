import { Injectable } from '@angular/core';
import * as signalR from '@microsoft/signalR';
import { Observable, Subject, BehaviorSubject } from 'rxjs';
import { environment } from '../../environments/environment';
import { Sheshbesh } from '../shared/models/Sheshbesh';


@Injectable({
  providedIn: 'root'
})
export class GameSignalRService {

  private apiUrl:string = `${environment.apiBaseUrl}/sheshbeshHub`;
  private hubConnection!: signalR.HubConnection;

  private gameStateSubject = new BehaviorSubject<Sheshbesh | null>(null); // Adjust type based on your game's state
  private playerMoveSubject = new Subject<{ player: string, move: string }>();
  private playerId = new Subject<string>();

  constructor() {
    this.createConnection();
  }

  private createConnection():void{
    this.hubConnection = new signalR.HubConnectionBuilder()
      .withUrl(`${this.apiUrl}`,{
        skipNegotiation: true,
        transport: signalR.HttpTransportType.WebSockets
      })
      .configureLogging(signalR.LogLevel.Information)
      .build();

    this.hubConnection.on('PlayerJoined', (id:string) => {
      this.playerId.next(id);
    });

    this.hubConnection.on('StartGame', (gameState:Sheshbesh) => {
      this.gameStateSubject.next(gameState);
    });

    this.hubConnection.on('DiceRolled',(gamstate:Sheshbesh)=>{
      this.gameStateSubject.next(gamstate);
    });

    this.hubConnection.onclose(() => {
      console.log('Game SignalR connection closed.');
    });

    this.hubConnection.onreconnected(() => {
      console.log('SignalR connection reestablished.');
    });

    this.hubConnection.onreconnecting(() => {
      console.log('SignalR connection is reconnecting.');
    });
  }

  startConnection(): Observable<void> {
    return new Observable<void>((observer) => {
      if (this.hubConnection.state === signalR.HubConnectionState.Disconnected) {
        this.hubConnection
          .start()
          .then(() => {
            console.log('Game SignalR connected');
            observer.next();
            observer.complete();
          })
          .catch((error) => {
            console.error('Error connecting to Game SignalR hub:', error);
            observer.error(error);
          });
      } else {
        console.log('Game SignalR connection is already connected.');
        observer.next();
        observer.complete();
      }
    });
  }

  getConnectionId(): Observable<string> {
    return new Observable<string>((observer) => {
      if (this.hubConnection.state === signalR.HubConnectionState.Connected) {
        observer.next(this.hubConnection.connectionId!);
        observer.complete();
      } else {
        this.hubConnection.on('connected', () => {
          observer.next(this.hubConnection.connectionId!);
          observer.complete();
        });
      }
    });
  }

  joinRoom(groupName: string):void{
    if (this.hubConnection.state === signalR.HubConnectionState.Connected) {
      this.hubConnection.invoke('JoinGame', groupName)
        .then(() => console.log('Player joined group'))
        .catch(err => console.error('Error joining room', err.message));
    } else {
      console.error('Hub connection is not in Connected state.');
    }
  }

  receiveGameState(): Observable<Sheshbesh | null> {
    return this.gameStateSubject.asObservable();
  }

  receivePlayerId():Observable<string> {
    return this.playerId.asObservable();
  }

  rollDice(){
    if (this.hubConnection.state === signalR.HubConnectionState.Connected) {
      this.hubConnection.invoke('RollDice')
        .then(() => console.log('Player rolled dice'))
        .catch(err => console.error('Error rolling dice', err.message));
    } else {
      console.error('Hub connection is not in Connected state.');
    }
  }

  selectPawn(){

  }

  makeMove(){

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

  // receiveMove(): Observable<{ player: string, move: string }> {
  //   return this.playerMoveSubject.asObservable();
  // }

  // sendMove(player: string, move: string): void {
  //   if (this.hubConnection.state === signalR.HubConnectionState.Connected) {
  //     this.hubConnection.invoke('SendMove', player, move)
  //       .then(() => console.log('Move sent'))
  //       .catch(err => console.error('Error sending move:', err));
  //   } else {
  //     console.error('Cannot send move, SignalR is not connected.');
  //   }
  // }
}
