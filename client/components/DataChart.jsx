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
import React from "react";

// Core and additional chart components
import ReactEchartsCore from "echarts-for-react/lib/core";
import echarts from "echarts/lib/echarts";
import "echarts/lib/chart/line";
import "echarts/lib/component/tooltip";
import "echarts/lib/component/title";
import { DataChartOptions, DataChartXAxis, DataChartYAxis, DataChartToolTip } from "./DataChartOptions";
import { DataChartSeriesLine } from "./DataChartSeries";

/**
 * A chart that displays values of a single property for a single device.
 * @component
 *
 * @param {Object} props
 * @param {string} props.key Unique string identifier.
 * @param {string} props.deviceId The device Id used for this specific chart.
 * @param {string} props.deviceProperty String identifier for property displayed in chart.
 * @param {ChartDataProperty} props.chartData Data used to generate charts for (props.deviceId, props.deviceProperty)
 * @param {boolean} props.tooltip An optional flag when true indicates embeds the chart in a
 * &nbsp;{@link CustomToolTip} object.
 *
 * @memberof Autodesk.DataVisualization.UI
 * @alias Autodesk.DataVisualization.UI.DataChart
 */
function DataChart(props) {
    const { dataUnit, seriesData, yAxis } = props.chartData;

    /**
     * Used as the pointer formatter for a {@link DataChartXAxis#pointerFormatter}
     * 
     * @param {Object} params
     * @param {number} params.value An integer timestamp value that represents the number of milliseconds since January 1, 1970
     * @returns {string} Formatted pointer value
     * @memberof Autodesk.DataVisualization.UI
     * @alias Autodesk.DataVisualization.UI.DataChart#xAxisPointerFormatter
     */
    function xAxisPointerFormatter(params) {
        const date = new Date(params.value);
        const options = { weekday: "short", year: "numeric", month: "short", day: "numeric" };
        return `${date.toLocaleDateString(undefined, options)}`;
    }

    /**
     * Used as the label formatter for a {@link DataChartYAxis#labelFormatter} in {@link DataChart#createBasicChartOptions}
     * 
     * @param {number} value chart value of the property
     * @param {number} index index of the axis label
     * @returns {string} Formatted label value
     * @memberof Autodesk.DataVisualization.UI
     * @alias Autodesk.DataVisualization.UI.DataChart#yAxisLabelFormatter
     */
    function yAxisLabelFormatter(value, index) {
        return value ? value.toFixed(2) : "0.00";
    }

    /**
     * Used as the pointer formatter for a {@link DataChartYAxis#pointerFormatter} in {@link DataChart#createBasicChartOptions}
     * 
     * @param {Object} params
     * @param {number} params.value chart value of the property
     * @returns {string} Formatted pointer value
     * @memberof Autodesk.DataVisualization.UI
     * @alias Autodesk.DataVisualization.UI.DataChart#yAxisPointerFormatter
     */
    function yAxisPointerFormatter(params) {
        const v = params.value ? params.value.toFixed(2) : "0.00";
        return `${v} ${dataUnit}`;
    }

    /**
     * Used as a tooltip formatter for a {@link DataChartToolTip#formatter} in {@link DataChart#createBasicChartOptions}
     * 
     * @param {Object} params
     * @param {number} params.value chart value of the property
     * @returns {string} Formatted tool tip value
     * @memberof Autodesk.DataVisualization.UI
     * @alias Autodesk.DataVisualization.UI.DataChart#toolTipFormatter
     */
    function toolTipFormatter(params) {
        const v = params.value ? params.value.toFixed(2) : "0.00";
        return `${v} ${dataUnit}`;
    }

    /**
     * Creates basic chart options for the given Device.
     * 
     * @returns {DataChartOptions} A configured {@link DataChartOptions} object.
     * @memberof Autodesk.DataVisualization.UI
     * @alias Autodesk.DataVisualization.UI.DataChart#createBasicChartOptions
     */
    function createBasicChartOptions() {
        const caption = `${props.deviceProperty} (${dataUnit})`;
        const dco = new DataChartOptions("", caption, "center");

        const dataChartyAxis = new DataChartYAxis();
        dataChartyAxis.labelFormatter = yAxisLabelFormatter;
        dataChartyAxis.pointerFormatter = yAxisPointerFormatter;

        const { min, max } = yAxis;
        dataChartyAxis.dataMin = min;
        dataChartyAxis.dataMax = max;

        dco.yAxis = dataChartyAxis;

        const toolTip = new DataChartToolTip();
        toolTip.formatter = toolTipFormatter;
        dco.toolTip = toolTip;

        return dco;
    }

    /**
     * Gets the chart line color associated with the specified property
     * 
     * @param {string} propertyId The id of the property
     * @returns {string} Color to use for the specified property. #ffffff if propertyId isn't found.
     * @memberof Autodesk.DataVisualization.UI
     * @alias Autodesk.DataVisualization.UI.DataChart#getColorForProperty
     */
    function getColorForProperty(propertyId) {
        const colors = {
            Temperature: "#ff8c8c",
            Humidity: "#94deff",
            "CO₂": "#cff98c",
        };

        return colors[propertyId] || "#ffffff";
    }

    /**
     * Creates a new {@link DataChartSeriesLine} with the specified values and color
     * 
     * @param {ChartSeriesData} values Data values to be used for the chart line.
     * @param {string} colorValue Color value obtained from getColorForProperty method
     * @returns {DataChartSeriesLine} Series line with the specified values and color
     * @memberof Autodesk.DataVisualization.UI
     * @alias Autodesk.DataVisualization.UI.DataChart#createSeriesForValues
     */
    function createSeriesForValues(values, colorValue) {
        const mainSeries = new DataChartSeriesLine(values);
        mainSeries.hoverAnimation = false;
        mainSeries.symbolSize = 6;
        mainSeries.itemStyle = { color: colorValue };
        return mainSeries;
    }

    let showLoading = true;
    let chartOptions = { text: "Sensor name", subtext: "Sensor GUID", left: "center" };

    const dco = createBasicChartOptions();
    // xAxis will be created just once. Note that the data for x-axis
    // is not specified here. Instead, it is encoded in 'seriesData'
    // below as the first element of 'value' array (with the second
    // element as the actual sensor value). A label formatter is not
    // used here because it is left to the chart to format the text
    // based on the date range (to include 'time-of-day' or not.)
    //
    const xAxis = new DataChartXAxis(undefined, "time");
    xAxis.pointerFormatter = xAxisPointerFormatter;

    dco.xAxis = xAxis;

    const color = getColorForProperty(props.deviceProperty);
    const series = createSeriesForValues(seriesData, color);
    dco.addSeries(series);

    if (props.tooltip) {
        // If chart will be generated inside a tooltip.
        chartOptions = dco.generateToolTipOptions();
    } else {
        chartOptions = dco.generateOptions();
    }

    showLoading = false; // Data available, mark loading as false.

    return (
        <div className="chart-container">
            <ReactEchartsCore
                echarts={echarts}
                option={chartOptions}
                style={
                    props.tooltip
                        ? { width: "170px", height: "30px" }
                        : { width: "100%", height: "220px", padding: "15px 20px 15px 20px" }
                }
                showLoading={showLoading}
            />
        </div>
    );
}

export default DataChart;
