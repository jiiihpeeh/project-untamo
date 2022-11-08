export const timePadding = (number, numbers = 2) => {
    let numberStr = `${number}`;
    while(numberStr.length < numbers){
        numberStr = `0${numberStr}`;
    }
    return numberStr;
};