import { Component, OnDestroy} from '@angular/core';
import { GameSignalRService } from '../../../services/game-signal-r.service';
import { Sheshbesh } from '../../../shared/models/Sheshbesh';
import { CommonModule } from '@angular/common';
import { BoardService } from '../../../services/board.service';

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

  constructor(private boardService: BoardService,private gameSignalRService: GameSignalRService){}

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
    this.boardService.fillAndUpdateBoard(this.gameState!.board, this.gameState!.jail);
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
    // Logic to highlight pawns based on rolled dice
    // You might want to maintain a state to track highlighted pawns
  }

  selectPawn(){

  }

  private highlight(){

  }

  makeMove(){

  }

  ngOnDestroy(): void {
    this.gameSignalRService.disconnect();
  }
}
