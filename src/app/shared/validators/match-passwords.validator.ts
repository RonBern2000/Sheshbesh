export function matchPasswordsValidator(psswd:string, cPsswd:string): boolean{
    if((!psswd || !cPsswd) || psswd !== cPsswd)
        return false;
    return true;
}