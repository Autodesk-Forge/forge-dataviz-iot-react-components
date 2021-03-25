//
// Copyright 2021 Autodesk
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//     http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.
//
/* eslint no-unused-vars: ["error", { "varsIgnorePattern": "()"}]*/
import moment from "moment";
import React, { useState } from "react";
import { DateRangePicker } from "react-dates";
import "react-dates/initialize";
import "react-dates/lib/css/_datepicker.css";
import { timeEqual } from "../../shared/Utility";

/**
 * A basic date picker component.
 * @component
 *
 * @param {Object} props
 * @param {Date} props.startTime The start date for the DatePicker
 * @param {Date} props.endTime The end date for the DatePicker
 * @param {Date} props.disabledDate The last date the user can select from the DatePicker
 * @param {HandleTimeRangeUpdates} props.onRangeChange A callback
 * &nbsp;invoked when changes are made to the DatePicker.
 *
 * @returns {JSX.Element} The element that represents a BasicDatePicker object.
 * @memberof Autodesk.DataVisualization.UI
 * @alias Autodesk.DataVisualization.UI.BasicDatePicker
 */
function BasicDatePicker(props) {
    const startDate = moment.utc(props.startTime);
    const endDate = moment.utc(props.endTime);
    const disableDates = moment.utc(props.disabledDate);
    const [focusedInput, setFocusedInput] = useState(null);

    /**
     * Called when a date change occurs in the picker.
     * @param {moment.Moment} start Start moment of date picked
     * @param {moment.Moment} end End moment of date picked
     * @private
     */
    function handleDateChange(start, end) {
        start = start ? moment.utc(start).toDate() : props.startTime;
        end = end ? moment.utc(end).toDate() : props.endTime;

        if (props.onRangeChange && (!timeEqual(props.startTime, start) || !timeEqual(props.endTime, end))) {
            props.onRangeChange(start, end);
        }
    }

    let isOutsideRange = (day) => day.isAfter(disableDates);

    return (
        <div className="date-picker-container">
            <DateRangePicker
                startDate={startDate}
                startDateId="start_date_id"
                endDate={endDate}
                endDateId="end_date_id"
                onDatesChange={({ startDate, endDate }) => handleDateChange(startDate, endDate)}
                focusedInput={focusedInput}
                onFocusChange={(focusedInput) => setFocusedInput(focusedInput)}
                displayFormat="MMM D,Y"
                isOutsideRange={isOutsideRange}
                minimumNights={0}
            />
        </div>
    );
}

export default BasicDatePicker;
