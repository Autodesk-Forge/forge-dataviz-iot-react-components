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
import React, { useState, useEffect, useRef } from "react";
import * as darkGrayHighDensityTheme from "@hig/theme-data/build/esm/darkGrayHighDensityTheme";
import { timeEqual } from "../../shared/Utility";
import { TimeSlider } from "chronos-etu";

/**
 * The time slider component based off https://www.npmjs.com/package/chronos-etu.
 * @component
 * @param {Object} props
 * @param {Date} props.startTime The start time for the time range selected in the slider.
 * @param {Date} props.endTime The end time for the time range selected in the slider.
 * @param {String} props.rangeStart The earliest start date (in ISO string format) for the slider.
 * @param {String} props.rangeEnd The latest end date (in ISO string format) for the slider.
 * @param {HandleTimeRangeUpdated} props.onTimeRangeUpdated A callback
 * &nbsp;function to be invoked when the time selection is updated
 * @param {HandleCurrTimeUpdated} props.onCurrTimeUpdated A callback
 * &nbsp;handler invoked when the current time marker is updated without
 * &nbsp;changing the time selection.
 *
 * @memberof Autodesk.DataVisualization.UI
 * @alias Autodesk.DataVisualization.UI.ChronosTimeSlider
 */
function ChronosTimeSlider(props) {
    /** @type {TimeSlider} */
    const [timeSliderControl, setTimeSliderControl] = useState(null);
    const [timeSliderView, setTimeSliderView] = useState(null);
    const [timeSelectionId, setTimeselectionId] = useState(null);
    const containerRef = useRef();

    const cntrStyle = {
        height: "120px",
        backgroundColor: "gray",
        width: "75%",
    };

    /**
     * Creates a timeline selection for the provided Date range.
     *
     * @param {Date} start Start date of the Date range.
     * @param {Date} end End date of the Date range.
     * @private
     */
    function createTimeSelection(start, end) {
        //Also zoom the slider to 5 days before and after the selection.
        if (start && end) {
            if (timeSelectionId) {
                removeTimeSelection(timeSelectionId);
            }
            /** @type {string} */
            let tsId = timeSliderControl.addTimeSelection(start.toISOString(), end.toISOString());
            var padding = 5; // days
            let zoomStart = new Date(start.getTime() - padding * 24 * 60 * 60 * 1000);
            let zoomEnd = new Date(end.getTime() + padding * 24 * 60 * 60 * 1000);
            timeSliderControl.zoomTo(zoomStart.toISOString(), zoomEnd.toISOString());
            timeSliderControl.mStartTime = props.startTime;
            timeSliderControl.mEndTime = props.endTime;
            setTimeselectionId(tsId);
        }
    }

    /**
     * Removes the time selection from the timeSliderControl.
     *
     * @param {string} tsId The id of the last timeSelection
     * @private
     */
    function removeTimeSelection(tsId) {
        timeSliderControl.removeTimeSelection(tsId);
        setTimeselectionId(null);
    }

    function getCurrentTheme() {
        let theme = darkGrayHighDensityTheme;
        return theme.resolvedRoles;
    }

    function updateTimeSliderContainer(parentCntr) {
        // the parentCntr is the DOM object that we will use as container to add pixi stage(canvas)
        if (parentCntr && parentCntr.children.length <= 0) {
            if (timeSliderView) {
                parentCntr.appendChild(timeSliderView);
                createTimeSelection(props.startTime, props.endTime);

                const resizeApp = () => {
                    const w = parentCntr.clientWidth;
                    const h = "120";
                    timeSliderControl.resize(w, h);
                };
                window.onresize = resizeApp;
            }
        }
    }

    /**
     * Function to initialize the Timeslider
     * @property {TimeSlider} timeSliderControl
     * @private
     */
    function createTimeSlider() {
        const sliderWidth = containerRef.current.clientWidth;
        const sliderHeight = cntrStyle.height.replace("px", "");
        const theme = getCurrentTheme();

        let timeSliderControl = new TimeSlider(sliderWidth, sliderHeight, props.rangeStart, props.rangeEnd, theme);

        timeSliderControl._timeFormat = "dddd, MMMM Do YYYY, HH:mm:ss";
        timeSliderControl._userDefinedTimeFormat = true;

        timeSliderControl.on("appready", () => {
            if (timeSliderControl.app && timeSliderControl.view()) {
                let timelineCanvas = timeSliderControl.view();
                timeSliderControl.off("appready"); // Unsubscribe event
                setTimeSliderView(timelineCanvas);
            }

            function onTimeRangeUpdated(data) {
                if (props.onTimeRangeUpdated) {
                    let start = new Date(data.start);
                    let end = new Date(data.end);
                    let current = data.currentTime ? new Date(data.currentTime) : start;
                    timeSliderControl.mStartTime = start;
                    timeSliderControl.mEndTime = end;
                    props.onTimeRangeUpdated(start, end, current);
                }
            }

            function onCurrTimeUpdated(data) {
                if (props.onCurrTimeUpdated) {
                    let time = new Date(data.time);
                    props.onCurrTimeUpdated(time);
                }
            }

            // Subscribe to other TimeSlider events
            timeSliderControl.on("tscreated", onTimeRangeUpdated);
            timeSliderControl.on("tsmodified", onTimeRangeUpdated);

            timeSliderControl.on("timemarkerchanged", onCurrTimeUpdated);
            timeSliderControl.on("playbackmarkerchanged", onCurrTimeUpdated);

            timeSliderControl.on("play", () => {
                // Calls the timeline.play() method
                // This emits a series of playbackmarkerchanged events
            });

            timeSliderControl.on("pause", onCurrTimeUpdated);

            timeSliderControl.on("stop", () => {
                // Calls timeline.stop() method
                // Moves currentTimeMarker to start of selection.
            });
        });
        timeSliderControl.mStartTime = props.startTime;
        timeSliderControl.mEndTime = props.endTime;
        setTimeSliderControl(timeSliderControl);
    }

    /**
     * Updates the time selection if the start or end times change.
     * @private
     */
    function updateSelection() {
        if (
            containerRef.current &&
            timeSliderView &&
            timeSliderControl &&
            (!timeEqual(timeSliderControl.mStartTime, props.startTime) ||
                !timeEqual(timeSliderControl.mEndTime, props.endTime))
        ) {
            timeSliderControl.mStartTime = props.startTime;
            timeSliderControl.mEndTime = props.endTime;
            // Make sure the Start time is smaller than endTime otherwise addTimeSelection would fail
            if (timeSliderControl.mStartTime.getTime() <= timeSliderControl.mEndTime.getTime()) {
                createTimeSelection(props.startTime, props.endTime);
            }
        }
    }

    useEffect(() => {
        //This will be run exactly once to create the actual time slider.
        createTimeSlider();

        return function cleanUp() {
            if (timeSliderControl) {
                timeSliderControl.off("tscreated");
                timeSliderControl.off("tsdeleted");
                timeSliderControl.off("tsmodified");
                timeSliderControl.off("timemarkerchanged");
                timeSliderControl.off("playbackmarkerchanged");
                timeSliderControl.off("play");
                timeSliderControl.off("pause");
                timeSliderControl.off("stop");
                timeSliderControl._app._app.destroy(true); // Destroy the Pixi Application
            }
        };
    }, []);

    useEffect(() => {
        updateSelection();
    }, [props.startTime, props.endTime]);

    if (containerRef.current) {
        updateTimeSliderContainer(containerRef.current);
    }

    /**
     * The chronos timeslider does not fully support touch event
     * Simulate the touch event to pointer events
     * Hack? It is very common strategy when something out of our control
     */
    let lastDownEvent;
    function onTouchStart(event) {
        event.touches[0].pointerType = "pen";
        let mouseEvent = new PointerEvent("pointerdown", event.touches[0]);
        lastDownEvent = event.touches[0];
        if (timeSliderView) {
            timeSliderView.dispatchEvent(mouseEvent);
        }
    }

    function onTouchMove(event) {
        event.touches[0].pointerType = "pen";
        lastDownEvent = event.touches[0];
        let mouseEvent = new PointerEvent("pointermove", event.touches[0]);
        if (timeSliderView) {
            timeSliderView.dispatchEvent(mouseEvent);
        }
    }

    function onTouchEnd() {
        let mouseEvent = new PointerEvent("pointerup", lastDownEvent);
        if (timeSliderView) {
            timeSliderView.dispatchEvent(mouseEvent);
        }
    }

    return (
        <div
            id="timeline_header"
            style={cntrStyle}
            ref={containerRef}
            onTouchStart={onTouchStart}
            onTouchMove={onTouchMove}
            onTouchEnd={onTouchEnd}
        />
    );
}

export default ChronosTimeSlider;
