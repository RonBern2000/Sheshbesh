export interface Sheshbesh {
    board: string[];
    jail: string;
    isPlayerBlackTurn: boolean;
    playerBlackId: string;
    playerWhiteId: string;
    possibleMoves: number[];
    diceRolls: number[];
    isDouble: boolean;
    hasRolledDice: boolean;
    blackJailFilled: boolean;
    whiteJailFilled: boolean;
}