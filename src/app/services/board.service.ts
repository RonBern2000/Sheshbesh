import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class BoardService {

  buildBackgammonBoardArray():Element[]{
    const boardArray = [];
    const bBearingOff = document.querySelector('.bBearing-off');
    if (bBearingOff) {
        boardArray[0] = bBearingOff;
    }
    const rightBottomRowDivs = document.querySelectorAll('.right-bin .bottom-row > div');
    rightBottomRowDivs.forEach((div, index) => {
        boardArray[6 - index] = div; 
    });
    const leftBottomRowDivs = document.querySelectorAll('.left-bin .bottom-row > div');
    leftBottomRowDivs.forEach((div, index) => {
        boardArray[12 - index] = div; 
    });
    const leftTopRowDivs = document.querySelectorAll('.left-bin .top-row > div');
    leftTopRowDivs.forEach((div, index) => {
        boardArray[index + 13] = div; 
    });
    const rightTopRowDivs = document.querySelectorAll('.right-bin .top-row > div');
    rightTopRowDivs.forEach((div, index) => {
        boardArray[index + 19] = div;
    });
    const wBearingOff = document.querySelector('.wBearing-off');
    if (wBearingOff) {
        boardArray[25] = wBearingOff;
    }
    return boardArray;
  }

  fillAndUpdateBoard(board: string[], jail:string) {
  const triangles = this.buildBackgammonBoardArray();
  for (let i = 0; i < board.length; i++) {
    if (board[i] === null){
      continue;
    }
    const pawn = board[i];
    const pawnAmount = +pawn[1];
    const whiteFragment = document.createDocumentFragment();
    const blackFragment = document.createDocumentFragment();
    
    if (pawn[0] === 'w') {
      for (let j = 0; j < pawnAmount; j++) {
        const wPawnDiv = document.createElement('div');
        wPawnDiv.classList.add('wPiece');
        whiteFragment.appendChild(wPawnDiv);
      }
    } else {
      for (let j = 0; j < pawnAmount; j++) {
        const bPawnDiv = document.createElement('div');
        bPawnDiv.classList.add('bPiece');
        blackFragment.appendChild(bPawnDiv);
      }
    }
    if(i !== 0 && i !== 25){
      const targetDiv = triangles[i].querySelector('div');
      targetDiv!.className = '';
      targetDiv!.innerHTML = '';
      const isDownTriangle = triangles[i].classList.contains('arrow-down') ?  true : false;
      if(isDownTriangle){
        // TODO: above 5 pawns same location draw +1 for example
        targetDiv?.classList.add('pawns');
      }
      else{
        // TODO: above 5 pawns same location draw +1 for example
        targetDiv?.classList.add(`dPawns${pawnAmount}`);
      }
      targetDiv!.appendChild(pawn[0] === 'w' ? whiteFragment.cloneNode(true) : blackFragment.cloneNode(true));
    }
    else{
      triangles[i].appendChild(pawn[0] === 'w' ? whiteFragment.cloneNode(true) : blackFragment.cloneNode(true));
    }
  }
  const jailBar = document.querySelector('.middle-bar');
  if (jailBar) {
    jailBar.innerHTML = '';
    const whiteFragment = document.createDocumentFragment();
    const blackFragment = document.createDocumentFragment();
    for (let k = 0; k < +jail[1]; k++) {
      const wPawnDiv = document.createElement('div');
      wPawnDiv.classList.add('wPiece');
      whiteFragment.appendChild(wPawnDiv);
    }
    for (let k = 0; k < +jail[3]; k++) {
      const bPawnDiv = document.createElement('div');
      bPawnDiv.classList.add('bPiece');
      blackFragment.appendChild(bPawnDiv);
    }
    jailBar.appendChild(whiteFragment);
    jailBar.appendChild(blackFragment);
    }
  }
}
