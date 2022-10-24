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

const insertDate = (dateObj, dateString) => {
    let dateArr = dateString.split('-');
    dateObj.setDate(Number.parseInt(dateArr[1]) -1);
    dateObj.setMonth(Number.parseInt(dateArr[2]) -1);
    dateObj.setFullYear(Number.parseInt(dateArr[0]));
    return dateObj;
}

export const nextAlarmOnce = (timeString, dateString) => {
    let timeNow = new Date();
    let timeCompare = initAlarmDate(timeString);
    timeCompare = insertDate(timeCompare, dateString); 
    if(timeCompare > timeNow){
        return timeCompare;
    }
    return NaN;    
};

export const nextAlarmYearly = (timeString, dateString) => {
    let timeNow = new Date();
    let timeCompare = initAlarmDate(timeString);
    timeCompare = insertDate(timeCompare, dateString);
    let year = timeNow.getFullYear();
    timeCompare.setFullYear(year);
    if(timeCompare > timeNow){
        return timeCompare;
    }
    timeCompare.setFullYear(year + 1);
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

export const timeForNextAlarm = (alarm) => {
    if(alarm.hasOwnProperty('snooze')){
        let snoozed = alarm.snooze
        let timeStamp = Date.now();
        let snoozeMax = timeStamp + (30 * 60 * 1000);
        let snoozeMin = timeStamp - (30 * 60 * 1000);
        if ((snoozed < snoozeMax) && (snoozed > snoozeMin)){
            let nextNotification = snoozed + (5 * 60 * 1000);
            return new Date(nextNotification);
        }
    }
    switch(alarm.occurence){
        case 'once':
            return nextAlarmDaily(alarm.time, alarm.date);
        case 'daily':
            return nextAlarmDaily(alarm.time);
        case 'weekly':
            return  nextAlarmDaily(alarm.time,alarm.wday);
        case 'yearly':
            return nextAlarmYearly(alarm.time, alarm.date);
        default:
            return NaN;
    };
};

export const timeToNextAlarm = (alarm) => {
    let date = new Date();
    return Math.max( timeForNextAlarm(alarm) - date, 0);
};