export const parseDate = (dateStr: string) => {
	let dateArr = dateStr.split('-')
	if(dateArr.length === 3){
		let year = parseInt(dateArr[0])
		let month = parseInt(dateArr[1]) - 1
		let day = parseInt(dateArr[2])
		let date = new Date()
		date.setFullYear(year)
		date.setMonth(month)
		date.setDate(day)
		return date
	}
}
