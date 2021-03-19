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
// This file contains options that are deemed necessary for the reference
// application. ECharts component is highly configurable with the vast
// options it provides, more can be added from the original documentation:
//
//      https://echarts.apache.org/en/option.html
//

// eslint-disable-next-line no-unused-vars
import { DataChartSeriesBase } from "./DataChartSeries";

/**
 * X-axis options for a chart to be added to a {@link DataChartOptions} object
 * @memberof Autodesk.DataVisualization.UI.DataChart
 * @alias Autodesk.DataVisualization.UI.DataChart.DataChartXAxis
 */
export class DataChartXAxis {
    /**
     * Constructs an instance of DataChartXAxis object.
     * @param {any[]} data An array of input values
     * @param {"value"|"category"|"time"|"log"} type The data type of the x-axis.
     */
    constructor(data, type) {
        this._data = data;
        this._type = type || "category";
    }

    /**
     * @function
     * @param {PointerLabelFormatter} callback The callback function that
     * &nbsp;will be invoked when the chart requires a pointer label string.
     * @memberof Autodesk.DataVisualization.UI.DataChart
     * @alias Autodesk.DataVisualization.UI.DataChart.DataChartXAxis#pointerFormatter
     */
    set pointerFormatter(callback) {
        this._pointerFormatter = callback;
    }

    /**
     * Generates the options object representing the Echarts configurations.
     * @memberof Autodesk.DataVisualization.UI.DataChart
     * @alias Autodesk.DataVisualization.UI.DataChart.DataChartXAxis#generateOptions
     */
    generateOptions() {
        const results = {
            type: this._type,
            axisLabel: {
                color: "#979797",
            },
            axisPointer: {
                label: {
                    formatter: this._pointerFormatter,
                },
            },

            splitLine: {
                show: false,
            },
            boundaryGap: false,
            axisLine: {
                lineStyle: {
                    color: "#555555",
                },
            },
        };

        if (this._data) {
            results.data = this._data;
        }

        return results;
    }
}

/**
 * Y-axis options for a chart to be added to a {@link DataChartOptions} object
 * @memberof Autodesk.DataVisualization.UI.DataChart
 * @alias Autodesk.DataVisualization.UI.DataChart.DataChartYAxis
 */
class DataChartYAxis {
    constructor() { }

    /**
     * Minimum in data range on the Y-axis
     * @type {number}
     * 
     * @param {number} value The minimum in data range on Y-axis
     */
    set dataMin(value) {
        this._dataMin = value;
    }

    /**
     * Maximum in data range on the Y-axis
     * @type {number}
     * 
     * @param {number} value The maximum in data range on Y-axis
     */
    set dataMax(value) {
        this._dataMax = value;
    }

    /**
     * 
     * Callback function invoked when the chart requires a label string.
     * @type {IndexedFormatterFunc}
     * 
     * @param {IndexedFormatterFunc} callback The callback function
     * invoked when the chart requires a label string.
     * @memberof Autodesk.DataVisualization.UI.DataChart.DataChartYAxis
     * @alias Autodesk.DataVisualization.UI.DataChart.DataChartYAxis#labelFormatter
     */
    set labelFormatter(callback) {
        this._labelFormatter = callback;
    }

    /**
     * Callback function invoked when the chart requires a pointer label string.
     * @type {PointerLabelFormatter}
     * 
     * @param {PointerLabelFormatter} callback The callback function
     * &nbsp;invoked when the chart requires a pointer label string.
     * @memberof Autodesk.DataVisualization.UI.DataChart.DataChartYAxis
     * @alias Autodesk.DataVisualization.UI.DataChart.DataChartYAxis#pointerFormatter
     */
    set pointerFormatter(callback) {
        this._pointerFormatter = callback;
    }

    /**
     * Generates the options object representing the Echarts configurations.
     * 
     * @memberof Autodesk.DataVisualization.UI.DataChart.DataChartYAxis
     * @alias Autodesk.DataVisualization.UI.DataChart.DataChartYAxis#generateOptions
     */
    generateOptions() {
        return {
            axisLabel: {
                color: "#979797",
                formatter: this._labelFormatter,
            },
            axisPointer: {
                label: {
                    formatter: this._pointerFormatter,
                },
            },
            splitNumber: 3,
            splitLine: {
                show: false,
            },
            axisLine: {
                lineStyle: {
                    color: "#555555",
                },
            },
            min: this._dataMin || "dataMin",
            max: this._dataMax || "dataMax",
        };
    }
}
export { DataChartYAxis }

/**
 * Tooltip options for the data chart to be used with {@link DataChartOptions}
 * 
 * @memberof Autodesk.DataVisualization.UI.DataChart
 * @alias Autodesk.DataVisualization.UI.DataChart.DataChartToolTip
 */
export class DataChartToolTip {
    /**
     * @param {"item"|"axis"|"none"} value The type of tool-tip trigger.
     */
    set trigger(value) {
        this._trigger = value;
    }

    /**
     * Callback function invoked when the chart requires a tool-tip string.
     * @type {Function}
     * 
     * @param {Function} callback The callback function
     * invoked when the chart requires a tool-tip string.
     * @memberof Autodesk.DataVisualization.UI.DataChart
     * @alias Autodesk.DataVisualization.UI.DataChart.DataChartToolTip#formatter
     */
    set formatter(callback) {
        this._formatter = callback;
    }

    /**
     * Generates the options object representing the Echarts configurations.
     * 
     * @memberof Autodesk.DataVisualization.UI.DataChart
     * @alias Autodesk.DataVisualization.UI.DataChart.DataChartToolTip#generateOptions
     */
    generateOptions() {
        return {
            trigger: this._trigger,
            axisPointer: {
                type: "cross",
                animation: false,
                label: {
                    backgroundColor: "#ccc",
                    borderColor: "#aaa",
                    borderWidth: 1,
                    shadowBlur: 0,
                    shadowOffsetX: 0,
                    shadowOffsetY: 0,

                    color: "#222",
                },
            },
            formatter: this._formatter,
        };
    }
}

/**
 * Options for rendering a chart
 * @memberof Autodesk.DataVisualization.UI.DataChart
 * @alias Autodesk.DataVisualization.UI.DataChart.DataChartOptions
 */
export class DataChartOptions {
    /**
     * Constructs an instance of DataChartOptions object.
     *
     * @param {string} title The main title of the chart
     * @param {string} subtitle The sub-title of the chart
     * @param {"left"|"center"|"right"} alignment The alignment of the title
     */
    constructor(title, subtitle, alignment) {
        this._title = title;
        this._subtitle = subtitle;
        this._alignment = alignment;
    }

    /**
     * @param {DataChartXAxis} value The definition of X-axis for the chart.
     */
    set xAxis(value) {
        this._xAxis = value;
    }

    /**
     * @param {DataChartYAxis} value The definition of Y-axis for the chart.
     */
    set yAxis(value) {
        this._yAxis = value;
    }

    /**
     * @param {DataChartToolTip} value The definition of chart tool-tip.
     */
    set toolTip(value) {
        this._toolTip = value;
    }

    /**
     * Adds a new series to the data chart.
     *
     * @param {DataChartSeriesBase} series The series to be added to the
     * &nbsp;chart. This can be any of the derived classes of DataChartSeriesBase.
     * @memberof Autodesk.DataVisualization.UI.DataChart
     * @alias Autodesk.DataVisualization.UI.DataChart.DataChartOptions#addSeries
     */
    addSeries(series) {
        this._series = this._series || [];
        this._series.push(series);
    }

    /**
     * Generates the options object for E-Chart's consumption.
     * @memberof Autodesk.DataVisualization.UI.DataChart
     * @alias Autodesk.DataVisualization.UI.DataChart.DataChartOptions#generateOptions
     */
    generateOptions() {
        const options = {
            title: {
                text: this._title,
                subtext: this._subtitle,
                left: this._alignment,
                subtextStyle: {
                    color: "#fff",
                    fontSize: 16,
                    fontFamily: "Roboto, Helvetica, Arial, sans-serif",
                    fontWeight: 500,
                },
                textStyle: {
                    color: "#d0d0d0",
                    fontSize: 12,
                    fontFamily: "Roboto, Helvetica, Arial, sans-serif",
                },
            },
            tooltip: this._toolTip ? this._toolTip.generateOptions() : undefined,
            grid: {
                left: "2%",
                right: "2%",
                bottom: "10%",
                containLabel: true,
            },
            xAxis: this._xAxis.generateOptions(),
            yAxis: this._yAxis.generateOptions(),
            series: [],
        };

        if (this._series) {
            options.series = this._series.map((s) => s.generateOptions());
        }

        return options;
    }

    /**
     * Generates the options objects for charts displayed inside a tooltip.
     * @memberof Autodesk.DataVisualization.UI.DataChart
     * @alias Autodesk.DataVisualization.UI.DataChart.DataChartOptions#generateToolTipOptions
     */
    generateToolTipOptions() {
        const options = this.generateOptions();
        options.grid = {};
        options.grid.top = "5%";
        options.grid.bottom = "65%";
        options.xAxis.show = false;
        options.yAxis.show = false;
        options.title.subtextStyle.fontSize = 10;

        return options;
    }
}
