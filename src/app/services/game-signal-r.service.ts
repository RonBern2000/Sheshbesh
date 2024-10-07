import { Injectable } from '@angular/core';
import * as signalR from '@microsoft/signalR';
import { Observable, Subject, BehaviorSubject ,from} from 'rxjs';
import { environment } from '../../environments/environment';
import { Sheshbesh } from '../shared/models/Sheshbesh';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';


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

  private playerCount = new BehaviorSubject<{ [key: string]: number }>({});

  constructor(private router:Router, private toastr: ToastrService) {
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


    this.hubConnection.on('Unauthorized', (message: string) => {
      this.router.navigate(['']);
      this.toastr.error("Please log in first...", message, {
            positionClass: 'toast-bottom-right',
            closeButton: true,
          });
    });
    this.hubConnection.on('GameWon',(wonPlayer:string)=>{
      this.router.navigate(['/chatHub']);
      this.toastr.success("White Player, try better next time", `Player ${wonPlayer} Won!!!`, {
            positionClass: 'toast-bottom-right',
            closeButton: true,
          });
    });

    this.hubConnection.on('OpponentCrashed',()=>{
      this.router.navigate(['/chatHub']);
      this.toastr.error("You are redirected to the chatHub", `Your opponent crashed`, {
            positionClass: 'toast-bottom-right',
            closeButton: true,
          });
    });

    this.hubConnection.on('UpdatePlayerCount', (roomPlayerCount: { [key: string]: number }) => {
      this.playerCount.next(roomPlayerCount);
    });

    this.hubConnection.on('ReceiveCurrentPlayerCount', (roomPlayerCount: { [key: string]: number }) => {
      this.playerCount.next(roomPlayerCount);
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

  requestCurrentPlayerCounts(): void {
    this.hubConnection.invoke('GetCurrentPlayerCounts').catch(err => console.error(err));
  }

  getPlayerCount(): Observable<{ [key: string]: number }> {
    return this.playerCount.asObservable();
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
