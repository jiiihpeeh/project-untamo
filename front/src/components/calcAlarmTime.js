const addDays = (date, count) => {
    return new Date(date.getTime() + (count * (24 * 60 * 60 * 1000)));
};

const weekDayToNumber = (weekDay) => {
    switch(weekDay){
        case 'Monday':
            return 1;
        case 'Tuesday':
            return 2;
        case 'Wednesday':
            return 3;
        case 'Thursday':
            return 4;
        case 'Friday':
            return 5;
        case 'Saturday':
            return 6;
        case 'Sunday':
            return 0;
        default:
            return 0;
    };
};

const initAlarmDate = (timeString) => {
    let timeCompare = new Date();
    let timeArr = timeString.split(':');
    timeCompare.setHours(timeArr[0]);
    timeCompare.setMinutes(timeArr[1]);
    timeCompare.setSeconds(0);
    timeCompare.setMilliseconds(0);
    return timeCompare;
};



export const nextAlarmDaily = (timeString) => {
    let timeNow = new Date();
    let timeCompare = initAlarmDate(timeString);
    if (timeCompare < timeNow){
        timeCompare = addDays(timeCompare, 1);
    };
    return timeCompare;
};



export const nextAlarmWeekly = (timeString, weekday) => {
    let timeNow = new Date();
    let timeCompare = initAlarmDate(timeString);
    let dayNumber = weekDayToNumber(weekday);
    let dayNumberNow = timeNow.getDay();
    let dayDifference = dayNumber - dayNumberNow;
    if(dayDifference < 0){
        dayDifference = 7 + dayDifference
    }
    switch (dayDifference){
        case 0:        
            if (timeCompare < timeNow){
                timeCompare = addDays(timeCompare, 7);
            };
            break;
        default:
            timeCompare = addDays(timeCompare, dayDifference);
            break;
    };
    //console.log(timeCompare);
    return timeCompare;
};

export const timeToNextAlarm = (alarm) => {
    switch(alarm.occurence){
        case 'once':
            break;
        case 'daily':
            return nextAlarmDaily(alarm.time)
        case 'weekly':
            return nextAlarmDaily(alarm.time,alarm.wday)
        case 'yearly':
            break;
        default:
            break;
    }
} 