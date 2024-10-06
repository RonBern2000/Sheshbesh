import { Component, OnDestroy, OnInit ,ChangeDetectorRef, AfterViewChecked} from '@angular/core';
import { GameSignalRService } from '../../../services/game-signal-r.service';
import { Sheshbesh } from '../../../shared/models/Sheshbesh';
import { CommonModule } from '@angular/common';
import { Subscription, take } from 'rxjs';
import { NgxRerenderModule } from 'ngx-rerender';
import { ToastrService } from 'ngx-toastr';
import { Router } from '@angular/router';
@Component({
  selector: 'sheshbesh-game',
  standalone: true,
  imports: [CommonModule,NgxRerenderModule],
  templateUrl: './sheshbesh-game.component.html',
  styleUrl: './sheshbesh-game.component.css'
})
export class SheshbeshGameComponent implements OnInit, OnDestroy, AfterViewChecked{

  private subscriptions: Subscription[] = [];

  gameState!: Sheshbesh | null;
  connectionId: string = '';
  hasRolledDice: boolean = false;
  message: string = 'Black player turn';
  hasPressedLeaveRoom: boolean = false;

  constructor(private toastr: ToastrService, private gameSignalRService: GameSignalRService, private cdr: ChangeDetectorRef, private router: Router){}

  ngOnInit(): void {
    this.subscriptions.push(this.gameSignalRService.receiveGameState().subscribe((gameState: Sheshbesh | null) => {
      if (gameState) {
        this.gameState = gameState;
        this.cdr.detectChanges();
        this.checkTurn(); // auto check turns when game state updates
      }
    }));

    this.subscriptions.push(
      this.gameSignalRService.receiveMessageToPlayers().subscribe((message: string) => {
        this.message = message;
      })
    );

     this.subscriptions.push(
      this.gameSignalRService.receiveFirstPlayerJoined().subscribe((firstPlayer) => {
        if (firstPlayer.hasJoined) {
          this.toastr.success('Waiting for another player to join...', `Joined ${firstPlayer.roomName}`, {
            positionClass: 'toast-bottom-right',
            closeButton: true,
          });
        }
      })
    );

    this.subscriptions.push(
      this.gameSignalRService.receiveIsGameStarted().subscribe((isStarted: boolean) => {
        if (isStarted) {
          this.toastr.success('Black player goes first (who ever joined first)', 'Game has started, Enjoy!', {
            positionClass: 'toast-bottom-right',
            closeButton: true,
          });
        }
      })
    );

    this.subscriptions.push(
      this.gameSignalRService.receiveOtherId().subscribe((id) => {
        if (id == this.connectionId) {
          this.toastr.error("You are redirected to chatHub", "Your opponent left...", {
            positionClass: 'toast-bottom-right',
            closeButton: true,
          });
          this.router.navigate(['/chatHub']);
        }
      })
    );

    this.subscriptions.push(
      this.gameSignalRService.receiveLeaverId().subscribe((id) => {
        if (id == this.connectionId) {
          this.toastr.error("please don't do it again! (You are redirected to chatHub)", "You left the room mid game!", {
            positionClass: 'toast-bottom-right',
            closeButton: true,
          });
          this.hasPressedLeaveRoom = false;
        }
      })
    );
  }

  ngAfterViewChecked() {
    if (this.connectionId === this.gameState?.playerWhiteId) {
      const elementsToRotate = document.querySelectorAll('.gameContainer, .dices, .diceBtn, .jail');
      elementsToRotate.forEach((e) => {
      e.classList.remove('whiteRotate');
      e.classList.add('whiteRotate');
    });
  }
}

  getClassForPawnContainer(num: number):string{
    return `dPawns${num}`;
  }

  givePawnClass(pawn:string):string{
    return `${pawn[0]}Piece`;
  }

  joinRoom(groupName: string){
    this.gameSignalRService.startConnection().subscribe(() => {
      this.gameSignalRService.joinRoom(groupName);
      this.gameSignalRService.receivePlayerId().subscribe((id) => {
        this.connectionId = id;
        this.cdr.detectChanges();
      });
    });
  }

  LeaveRoom(){
    this.hasPressedLeaveRoom = true;
    
    this.gameSignalRService.leaveRoom().subscribe(() => {
      this.router.navigate(['/chatHub']);
    });
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
    return this.isCurrentPlayer(playerColor) && !this.gameState!.hasRolledDice;
  }
  isCurrentPlayer(playerColor: 'black' | 'white'): boolean {
    const currentPlayerId = playerColor === 'black' ? this.gameState!.playerBlackId : this.gameState!.playerWhiteId;
    return currentPlayerId === this.connectionId;
  }

  rollDice(){
    this.gameSignalRService.rollDice();
  }

  selectPawn(fromIndex: number){
    // black player turn, need to fix so he could pick only his pawns
    document.querySelectorAll('.highlighted').forEach((element) => {
      element.classList.remove('highlighted');
    });
    if(this.connectionId === this.gameState?.playerBlackId && this.gameState.isPlayerBlackTurn && this.gameState?.blackJailFilled){
      this.processPawnSelection(25);
    }
    else if(this.connectionId === this.gameState?.playerWhiteId && !this.gameState.isPlayerBlackTurn && this.gameState?.whiteJailFilled){
      this.processPawnSelection(0);
    }
    else{
      const pawnColor = document.getElementById(`${fromIndex}`)?.querySelector('.bPiece') !== null ? 'black' : 'white';
      if (this.connectionId === this.gameState?.playerBlackId && this.gameState.isPlayerBlackTurn && pawnColor === 'black') {
        this.processPawnSelection(fromIndex);
      } else if (this.connectionId === this.gameState?.playerWhiteId && !this.gameState.isPlayerBlackTurn && pawnColor === 'white') {
        this.processPawnSelection(fromIndex);
      }
      else{ 
        console.error("Unkown player denied to make a move");
      }
    }
  }
  private processPawnSelection(fromIndex: number) {
    this.gameSignalRService.selectPawn(fromIndex).subscribe({
        next: () => {
            this.highlightPossibleMoves(fromIndex);
        },
        error: (err) => {
            console.error('Error selecting pawn:', err);
        }
    });
  }
  private highlightPossibleMoves(fromIndex: number) {
   this.gameState?.possibleMoves.forEach((move) => {
    if (move !== -1) {
      const element = document.getElementById(`${move}`);
      if (element) {
        const newElement = element.cloneNode(true) as HTMLElement;
        element.replaceWith(newElement);

        // Add the event listener to the new element
        newElement.classList.add('highlighted');
        newElement.addEventListener('click', () => this.makeMove(fromIndex, move));
      }
    }
  });
  this.cdr.detectChanges();
  }

  private makeMove(fromIndex: number, toIndex:number){

    this.cdr.detectChanges();
    this.gameSignalRService.makeMove(fromIndex, toIndex).subscribe({
      next: () => {
        document.querySelectorAll('.highlighted').forEach((element) => {
            element.classList.remove('highlighted');
            element.replaceWith(element.cloneNode(true));
        });
        this.cdr.detectChanges();
    },
    error: (err) => {
        console.error('Error making move:', err);
    }
  });
  }

  private resetComponentState(): void {
    this.gameState = null;
    this.connectionId = '';
    this.hasRolledDice = false;
    this.message = 'Black player turn';
    this.hasPressedLeaveRoom = false;
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach(sub => sub.unsubscribe());
    this.gameSignalRService.disconnect();
    this.resetComponentState();
  }
}
