import { Injectable } from '@angular/core';
import * as signalR from '@microsoft/signalR';
import { Observable, Subject, BehaviorSubject ,from} from 'rxjs';
import { environment } from '../../environments/environment';
import { Sheshbesh } from '../shared/models/Sheshbesh';


@Injectable({
  providedIn: 'root'
})
export class GameSignalRService {

  private apiUrl:string = `${environment.apiBaseUrl}/sheshbeshHub`;
  private hubConnection!: signalR.HubConnection;

  private gameStateSubject = new Subject<Sheshbesh | null>();
  private playerId = new Subject<string>();
  private messageToPlayers = new Subject<string>();
  private gameStarted = new Subject<boolean>();
  private firstPlayerJoined = new Subject<{ hasJoined: boolean, roomName: string }>();
  private leaverId = new Subject<string>();
  private otherId = new Subject<string>();

  public playerCount = new BehaviorSubject<{ [key: string]: number }>({});

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

    this.hubConnection.on('UpdatePlayerCount', (roomName: string, count: number) => {
      const currentCounts = this.playerCount.getValue();
      this.playerCount.next({ ...currentCounts, [roomName]: count });
    });
    
    this.hubConnection.on('PlayerJoined', (id:string) => {
      this.playerId.next(id);
    });

    this.hubConnection.on('StartGame', (gameState:Sheshbesh) => {
      this.gameStateSubject.next({...gameState});
    });

    this.hubConnection.on('DiceRolled',(gameState:Sheshbesh)=>{
      this.gameStateSubject.next({...gameState});
    });

    this.hubConnection.on('ReceivePossbleMoves', (gameState: Sheshbesh)=>{
      this.gameStateSubject.next({...gameState});
    });

    this.hubConnection.on('MoveMade', (gameState:Sheshbesh)=>{
      this.gameStateSubject.next({...gameState});
    });

    this.hubConnection.on('TurnSkipped',(message)=>{
      this.messageToPlayers.next(message);
    });

    this.hubConnection.on('GameHasStartedMsg', (isStarted)=>{
      this.gameStarted.next(isStarted);
    });

    this.hubConnection.on('FirstPlayerJoined',(firstPlayerJoined)=>{
      this.firstPlayerJoined.next({...firstPlayerJoined});
    });

    this.hubConnection.on('RedirectTheLeaver',(id)=>{
      this.leaverId.next(id);
    });

    this.hubConnection.on('RedirectTheOther',(id)=>{
      this.otherId.next(id);
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

  receiveGameState(): Observable<Sheshbesh | null> {
    return this.gameStateSubject.asObservable();
  }

  receivePlayerId():Observable<string> {
    return this.playerId.asObservable();
  }

  receiveMessageToPlayers():Observable<string>{
    return this.messageToPlayers.asObservable();
  }

  receiveIsGameStarted():Observable<boolean>{
    return this.gameStarted.asObservable();
  }

  receiveFirstPlayerJoined(): Observable<{ hasJoined: boolean, roomName: string }> {
    return this.firstPlayerJoined.asObservable();
  }

  receiveLeaverId(): Observable<string> {
    return this.leaverId.asObservable();
  }

  receiveOtherId(): Observable<string> {
    return this.otherId.asObservable();
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

  leaveRoom(){
    if (this.hubConnection.state === signalR.HubConnectionState.Connected) {
        return from(this.hubConnection.invoke('LeaveRoom'));
    } else {
      console.error('Hub connection is not in Connected state.');
      return new Observable(observer => {
      observer.error('Hub connection is not in Connected state.');
      });
    }
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

  selectPawn(fromIndex: number): Observable<any>{
    if (this.hubConnection.state === signalR.HubConnectionState.Connected) {
        return from(this.hubConnection.invoke('GetPossibleMoves', fromIndex));
    } else {
      console.error('Hub connection is not in Connected state.');
      return new Observable(observer => {
      observer.error('Hub connection is not in Connected state.');
      });
    }
  }

  makeMove(fromIndex:number, toIndex:number){
    if (this.hubConnection.state === signalR.HubConnectionState.Connected) {
        return from(this.hubConnection.invoke('MakeMove', fromIndex, toIndex));
    } else {
      console.error('Hub connection is not in Connected state.');
      return new Observable(observer => {
      observer.error('Hub connection is not in Connected state.');
      });
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
