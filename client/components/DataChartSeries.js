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

/**
 * The base class for data series types used in the Reference App.
 * @memberof Autodesk.DataVisualization.UI.DataChart
 * @alias Autodesk.DataVisualization.UI.DataChart.DataChartSeriesBase
 */
export class DataChartSeriesBase {
    /**
     * Constructs an instance of DataChartSeriesBase object. See https://echarts.apache.org/en/option.html#series for more information.
     *
     * @param {string} type The type of the chart, e.g. "line"
     * @param {any[]} data An array of values or objects.
     */
    constructor(type, data) {
        this._data = data;
        this._type = type;
    }

    /**
     * The name of the series to be displayed on
     * the tool-tip, or displayed as filter names in legend.
     *
     * @param {string} value
     */
    set name(value) {
        this._name = value;
    }

    /**
     * The name of the series if stacking of series
     * is desirable. Two series will be stack above one another if they
     * have the same stack name.
     *
     * @param {string} value
     */
    set stack(value) {
        this._stack = value;
    }

    /**
     * The style of the symbol point.
     *
     * @param {ItemStyle} value
     */
    set itemStyle(value) {
        this._itemStyle = value;
    }

    /**
     * Generates the options object representing the Echarts configurations.
     *
     * @memberof Autodesk.DataVisualization.UI.DataChart
     * @alias Autodesk.DataVisualization.UI.DataChart.DataChartSeriesBase#generateOptions
     */
    generateOptions() {
        return {
            name: this._name,
            type: this._type,
            data: this._data,
            stack: this._stack,
            itemStyle: this._itemStyle,
        };
    }
}

/**
 * The broken line series type. Broken line chart relates all of the data points with broken lines
 * which are used to show the trend of changing data. Can be used with rectangular or polar coordinates.
 *
 * @augments DataChartSeriesBase
 * @memberof Autodesk.DataVisualization.UI.DataChart
 * @alias Autodesk.DataVisualization.UI.DataChart.DataChartSeriesLine
 */
export class DataChartSeriesLine extends DataChartSeriesBase {
    /**
     * Constructs an instance of DataChartSeriesBase object.
     *
     * @param {any[]} data An array of values or objects.
     */
    constructor(data) {
        super("line", data);
    }

    /**
     * @param {LineStyle} value
     */
    set lineStyle(value) {
        this._lineStyle = value;
    }

    /**
     * @param {boolean} value Set this to false to prevent the
     * animation effect when the mouse is hovering over a symbol.
     */
    set hoverAnimation(value) {
        this._hoverAnimation = value;
    }

    /**
     * @param {boolean} value Whether to show symbol on tooltip.
     */
    set showSymbol(value) {
        this._showSymbol = value;
    }

    /**
     * @param {"circle"|"rect"|"roundRect"|"triangle"|"diamond"|"pin"|"arrow"|"none"} value Symbol icon of line point.
     */
    set symbol(value) {
        this._symbol = value;
    }

    /**
     * @param {number} value Line point symbol icon size.
     */
    set symbolSize(value) {
        this._symbolSize = value;
    }

    /**
     * @param {AreaStyle} value The area style options.
     */
    set areaStyle(value) {
        this._areaStyle = value;
    }

    /**
     * Generates the options object representing the Echarts configurations.
     *
     * @memberof Autodesk.DataVisualization.UI.DataChart
     * @alias Autodesk.DataVisualization.UI.DataChart.DataChartSeriesLine#generateOptions
     */
    generateOptions() {
        const options = super.generateOptions();

        options.lineStyle = this._lineStyle;
        options.hoverAnimation = this._hoverAnimation;
        options.showSymbol = this._showSymbol;
        options.symbol = this._symbol;
        options.symbolSize = this._symbolSize;
        options.areaStyle = this._areaStyle;

        return options;
    }
}
