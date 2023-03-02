import React from "react";
import AlarmOnce from "./AlarmOnce";
import AlarmWeekly from "./AlarmWeekly";
import AlarmDaily from "./AlarmDaily";
import AlarmYearly from "./AlarmYearly";
import AlarmCase from "./AlarmCase";
import { Divider } from "@chakra-ui/react";
import useAlarm, { AlarmCases } from "./alarmStates";

const AlarmSelector = () => {
    const alarmCase = useAlarm((state)=> state.occurence)
    return(<>
            <AlarmCase/>
            <Divider m={'5px'}/>
            {alarmCase === AlarmCases.Once &&
            <AlarmOnce />}
            {alarmCase === AlarmCases.Weekly &&
            <AlarmWeekly  />}
            {alarmCase === AlarmCases.Daily &&
            <AlarmDaily />}
            {alarmCase === AlarmCases.Yearly &&
            <AlarmYearly  />}
    </>)
};

export default AlarmSelector;
