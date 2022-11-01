const addDays = (date, count) => {
    let calculated = new Date(date.getTime() + (count * (24 * 60 * 60 * 1000)));
    let calculatedHours = calculated.getHours();
    let dateHours = date.getHours();
    if(calculatedHours > dateHours){
        calculated = new Date(calculated.getTime() - (60 * 60 * 1000));
    }else if (calculatedHours < dateHours){
        calculated = new Date(calculated.getTime() + (60 * 60 * 1000));
    }
    return calculated;
};
    
export const weekDayToNumber = (weekDay) => {
    //console.log(weekDay)
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

export const numberToWeekDay = (number) =>{
    switch(number){
        case 1:
            return 'Monday';
        case 2:
            return  'Tuesday';
        case 3:
            return 'Wednesday';
        case 4:
            return 'Thursday';
        case 5:
            return 'Friday';
        case 6:
            return 'Saturday';
        case 0:
            return 'Sunday';
        default:
            return 'Sunday';
    };
};

export const dayContinuation = (dayNumberList) => {
   // console.log(dayNumberList)
    let dayNumbers = dayNumberList;
    dayNumbers.sort(function(a, b){return a - b});
    let continuation = [];
    for(const num of dayNumbers){
        let min = num;
        let max = num;
        while( dayNumbers.includes(max) ){
            max++;
        };
        if(min !== max - 1){
            if(continuation.length > 0){
                let prev = continuation[continuation.length -1];
                let prevMax = Math.max(...prev);
                let prevMin = Math.min(...prev);
                if (!(min >= prevMin && (max - 1) <= prevMax )){
                    continuation.push([min, max - 1]);
                }
            }else{
                continuation.push([min, max - 1]);
            };
        }else{
            if(continuation.length > 0){
                let prev = continuation[continuation.length -1];
                let prevMax = Math.max(...prev);
                let prevMin = Math.min(...prev);
                if (!(min >= prevMin && min <= prevMax )){
                    continuation.push([min]);
                };
            }else{
                continuation.push([min]);
            };     
        }; 
    };
    return continuation;
};

export const dayContinuationDays = (dayList) => {
    //console.log('InpUT:', dayList)
    let dayNumberList = [];
    for(const day of dayList){
        let d = weekDayToNumber(day);
        dayNumberList.push((d===0)?7:d);
    }
    let continuationArr = dayContinuation(dayNumberList);
    let dayContinuationArr = [];
    for(const c of continuationArr){
        let subList = [];
        for(const i of c){
            subList.push(numberToWeekDay((i===7)?0:i));
        }
        dayContinuationArr.push(subList);
    }
    return dayContinuationArr;
}

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
    dateObj.setDate(Number.parseInt(dateArr[2]));
    dateObj.setMonth(Number.parseInt(dateArr[1]) -1);
    dateObj.setFullYear(Number.parseInt(dateArr[0]));
    return dateObj;
}

export const nextAlarmOnce = (timeString, dateString) => {
    let timeNow = new Date();
    let timeCompare = initAlarmDate(timeString);
    timeCompare = insertDate(timeCompare, dateString); 
    
    if(timeCompare > timeNow){
        //console.log(timeCompare)
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
    //console.log(weekday)
    let timeNow = new Date();
    let timeCompare = initAlarmDate(timeString);
    let dayNumbers =  [];
    for(const item of weekday){
        dayNumbers.push( weekDayToNumber(item));
    };
    dayNumbers.sort();
    //console.log(dayNumbers)
    let dayDifferences = [];
    let dayNumberNow = timeNow.getDay();
    for(const dayNumber of dayNumbers){
        let dayDifference = dayNumber - dayNumberNow;
        if(dayDifference < 0){
            dayDifference = 7 + dayDifference
        }
        dayDifferences.push(dayDifference);
    }
    //console.log(dayDifferences)
    let timeComparisons = [];
    for(const dayDifference of dayDifferences){
        let timeComparison;
        switch (dayDifference){
            case 0:        
                if (timeCompare < timeNow){
                    timeComparison = addDays(timeCompare, 7);
                }else{
                    timeComparison = timeCompare;
                }
                break;
            default:
                timeComparison = addDays(timeCompare, dayDifference);
                break;
        };
        timeComparisons.push(timeComparison.getTime());
    };
    //console.log(timeComparisons);
    let nextAlarm =  new Date(Math.min(...timeComparisons));
    //
    
    //console.log('next alarm', nextAlarm)
    return nextAlarm;
};

export const timeForNextAlarm = (alarm) => {

    switch(alarm.occurence){
        case 'once':
            return nextAlarmOnce(alarm.time, alarm.date) ;
        case 'daily':
            return nextAlarmDaily(alarm.time);
        case 'weekly':
            return nextAlarmWeekly(alarm.time,alarm.wday) ;
        case 'yearly':
            return nextAlarmYearly(alarm.time, alarm.date);
        default:
            return NaN;
    };
};

export const timeToNextAlarm = (alarm) => {    
    let snoozer = Infinity;
    if(alarm.hasOwnProperty('snooze')){
        let snoozed = alarm.snooze;
        let timeStamp = Date.now();
        
        let snoozeMax = Math.min(...snoozed) + (30 * 60 * 1000);
        let snoozeMin = timeStamp - (30 * 60 * 1000);
        //console.log('snoozes',snoozeMax,snoozeMin,  Math.min(...snoozed));
        if ((Math.max(...snoozed) < snoozeMax) && (Math.min(...snoozed) > snoozeMin)){
            snoozer = Math.max(...snoozed) + (5 * 60 * 1000);
        }
    }
    let preliminaryAlarm =  timeForNextAlarm(alarm);
    //console.log('next snooze ', snoozer);
    
    if(!isNaN(preliminaryAlarm)){

        let now = new Date().getTime();
        let timeToAlarm = preliminaryAlarm.getTime() - now;
        let timeToSnoozer = snoozer - now
        let launchTime = 0;
        if(Math.abs(timeToSnoozer) !== Infinity){
            launchTime = Math.min(timeToAlarm, timeToSnoozer) ;
        }else {
            launchTime = timeToAlarm;
        }
        //console.log('launching in... ', launchTime, preliminaryAlarm);

        return launchTime;
    } 
    return snoozer;

};