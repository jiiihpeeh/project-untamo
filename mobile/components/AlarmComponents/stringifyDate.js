import { timePadding } from "./timePadding";
export const stringifyDate = (date) => {
	let dateArr = [];
	dateArr.push(timePadding(parseInt(date.getFullYear()),4));
	dateArr.push(timePadding(parseInt(date.getMonth(date)) +1  ));
	dateArr.push(timePadding(parseInt(date.getDate())));
	return dateArr.join('-');	
}
