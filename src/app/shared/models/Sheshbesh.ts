export interface Sheshbesh {
    board: string[];
    jail: string;
    isPlayerBlackTurn: boolean;
    playerBlackId: string;
    playerWhiteId: string;
    possibleMoves: number[];
    diceRolls: number[];
    isDouble: boolean;
}