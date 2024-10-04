import { Component, OnDestroy} from '@angular/core';
import { GameSignalRService } from '../../../services/game-signal-r.service';
import { Sheshbesh } from '../../../shared/models/Sheshbesh';
import { CommonModule } from '@angular/common';
import { switchMap } from 'rxjs';
@Component({
  selector: 'sheshbesh-game',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './sheshbesh-game.component.html',
  styleUrl: './sheshbesh-game.component.css'
})
export class SheshbeshGameComponent implements OnDestroy{

  gameState!: Sheshbesh | null;
  connectionId: string = '';

  constructor(private gameSignalRService: GameSignalRService){}

  getClassForPawnContainer(num: number):string{
    return `dPawns${num}`;
  }

  givePawnClass(pawn:string):string{
    return `${pawn[0]}Piece`;
  }

  joinRoom(groupName: string){
    this.gameSignalRService.startConnection().subscribe(()=>{
      this.gameSignalRService.joinRoom(groupName);

      this.gameSignalRService.receivePlayerId().subscribe((id)=>{
        this.connectionId = id;
      });

      this.gameSignalRService.receiveGameState().subscribe((gameState: Sheshbesh | null)=>{
        if(gameState != null){
          this.gameState = gameState;
          this.startGame();
        }
      });
    });
  }

  startGame() {
    this.checkTurn();
  }

  checkTurn(): boolean{
    if (!this.gameState || !this.connectionId) {
    return false;
  }
    if (this.gameState.isPlayerBlackTurn) {
      return this.enableRollDice('black');
    } else {
      return this.enableRollDice('white');
    }
  }

  enableRollDice(playerColor: 'black' | 'white') {
    return this.isCurrentPlayer(playerColor);
  }
  isCurrentPlayer(playerColor: 'black' | 'white'): boolean {
    const currentPlayerId = playerColor === 'black' ? this.gameState!.playerBlackId : this.gameState!.playerWhiteId;
    return currentPlayerId === this.connectionId;
  }

  rollDice(){
    this.gameSignalRService.rollDice();
    this.gameSignalRService.receiveGameState().subscribe((gameState:Sheshbesh | null)=>{
      this.gameState = gameState;
      
      if (this.gameState?.isPlayerBlackTurn) {
            this.highlightAvailablePawns('black');
        } else {
            this.highlightAvailablePawns('white');
        }
    });
  }

  private highlightAvailablePawns(playerColor: 'black' | 'white') {
    const pawns = playerColor === 'black' ? 'bPiece' : 'wPiece';

  }

  selectPawn(fromIndex: number){
    // black player turn, need to fix so he could pick only his pawns
    document.querySelectorAll('.highlighted').forEach((element) => {
    element.classList.remove('highlighted');
  });

  // For the black player
  if (this.connectionId === this.gameState?.playerBlackId && this.gameState.isPlayerBlackTurn) {
    this.gameSignalRService.selectPawn(fromIndex).pipe(
      switchMap(() => this.gameSignalRService.receiveGameState())).subscribe((gameState: Sheshbesh | null) => {
      this.gameState = gameState;
      document.querySelectorAll('.highlighted').forEach((element) => {
        element.classList.remove('highlighted');
      });
      this.gameState!.possibleMoves.forEach((move) => {
        if (move !== 0) {
          document.getElementById(`${move}`)?.classList.add('highlighted');
        }
      });
    });
  }

  // For the white player
  if (this.connectionId === this.gameState?.playerWhiteId && !this.gameState.isPlayerBlackTurn) {
    this.gameSignalRService.selectPawn(fromIndex).pipe(
      switchMap(() => this.gameSignalRService.receiveGameState())).subscribe((gameState: Sheshbesh | null) => {
      this.gameState = gameState;
      document.querySelectorAll('.highlighted').forEach((element) => {
        element.classList.remove('highlighted');
      });
      this.gameState!.possibleMoves.forEach((move) => {
        if (move !== 0) {
          document.getElementById(`${move}`)?.classList.add('highlighted');
        }
      });
    });
  }
  }

  makeMove(){
    // after this we should update both playes gameState
  }

  ngOnDestroy(): void {
    this.gameSignalRService.disconnect();
  }
}
