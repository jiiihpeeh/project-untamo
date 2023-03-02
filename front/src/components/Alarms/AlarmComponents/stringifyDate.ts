import { timePadding } from "./timePadding"
export const stringifyDate = (date: Date) => {
	let dateArr : Array<string> = [] 
	dateArr.push(timePadding(date.getFullYear(),4))
	dateArr.push(timePadding(date.getMonth() +1  ))
	dateArr.push(timePadding(date.getDate()))
	return dateArr.join('-')	
}
export const stringToDate = (dateStr: string) => {
	let dateStrArr = dateStr.split('-')
	let date = new Date()
	try{
		let dateNumber = [ parseInt(dateStrArr[0]),parseInt(dateStrArr[1]) -1,parseInt(dateStrArr[2])]
		for (const item of dateNumber){
			if(isNaN(item)){
				return date
			}
		}
		date.setFullYear(dateNumber[0])
		date.setMonth(dateNumber[1])
		date.setDate(dateNumber[2])
	}catch{
		date = new Date()
	}
	return date	
}
