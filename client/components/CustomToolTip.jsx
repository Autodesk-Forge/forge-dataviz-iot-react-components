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
import Tooltip from "@material-ui/core/Tooltip";
import CircularProgress from "@material-ui/core/CircularProgress";
import DataChart from "../components/DataChart.jsx";
import { makeStyles } from "@material-ui/core/styles";
import * as _ from "lodash";
// eslint-disable-next-line no-unused-vars

/**
 * A custom tool-tip that is displayed over Forge Viewer canvas when a user hovers over a device. Contains a {@link DataChart} for each property along with the estimated current property value.
 * @component
 *
 * @param {Object} props
 * @param {HoveredDeviceInfo} props.hoveredDeviceInfo Object containing the id and (x,y) canvas coordinates of the
 * &nbsp;device being hovered over.
 * @param {ChartData} props.chartData Data used to generate charts for each property associated with props.hoveredDeviceInfo
 * @param {CurrentDeviceData} props.currentDeviceData Data containing the estimated propertyValue for each property
 * &nbsp;associated with props.hoveredDeviceInfo
 * @param {Object} props.styles Material UI styles to apply to the Tooltip component. See https://material-ui.com/api/tooltip/#css
 *
 * @memberof Autodesk.DataVisualization.UI
 * @alias Autodesk.DataVisualization.UI.CustomToolTip
 */
function CustomToolTip(props) {
    if (props.hoveredDeviceInfo.id) {
        const chartData = props.chartData[props.hoveredDeviceInfo.id];
        const deviceName = chartData ? chartData.name : <CircularProgress className="tooltip-loading-icon" color="secondary" size={30} />;
        const properties = chartData ? Object.keys(chartData["properties"]) : [];

        const currentDeviceData = props.currentDeviceData[props.hoveredDeviceInfo.id];

        const useStyles = makeStyles(
            _.merge(
                {
                    tooltip: {
                        backgroundColor: "#373737",
                        fontSize: "12px",
                        padding: "0px",
                        paddingTop: "2px",
                        paddingBottom: "3px",
                        margin: "0px",
                    },
                    arrow: {
                        color: "#373737",
                        marginBottom: "0px",
                        fontSize: "20px",
                    },
                },
                props.styles
            )
        );

        const classes = useStyles();

        return (
            <Tooltip
                title={
                    <React.Fragment>
                        <span className="tooltip-device-name">{deviceName}</span>
                        {properties.map((property) => (
                            <React.Fragment key={`${props.hoveredDeviceInfo.id}-${property}`}>
                                <span className="tooltip-property-val">
                                    {currentDeviceData ? currentDeviceData[property] : ""}
                                </span>
                                <DataChart
                                    key={`${props.hoveredDeviceInfo.id}-${property}`}
                                    deviceId={props.hoveredDeviceInfo.id}
                                    deviceProperty={property}
                                    chartData={chartData["properties"][property]}
                                    tooltip={true}
                                />
                            </React.Fragment>
                        ))}
                    </React.Fragment>
                }
                arrow={true}
                placement="top"
                open={Boolean(props.hoveredDeviceInfo.id)}
                classes={classes}
            >
                <span
                    className="tooltip"
                    style={{
                        left: `${props.hoveredDeviceInfo.xcoord}px`,
                        top: `${props.hoveredDeviceInfo.ycoord - 2}px`,
                    }}
                ></span>
            </Tooltip>
        );
    }

    return null;
}

export default CustomToolTip;
