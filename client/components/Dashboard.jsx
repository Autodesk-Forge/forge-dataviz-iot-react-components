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
import DataChart from "./DataChart.jsx";
import { makeStyles } from "@material-ui/core/styles";
import IconButton from "@material-ui/core/IconButton";
import Typography from "@material-ui/core/Typography";
import ArrowBackIosIcon from "@material-ui/icons/ArrowBackIos";
import CircularProgress from "@material-ui/core/CircularProgress";
// eslint-disable-next-line no-unused-vars

const useStyles = makeStyles({
    dashboardRoot: {
        paddingRight: "2px",
    },
    headerBar: {
        display: "flex",
        alignItems: "center",
        fontWeight: "bold",
        backgroundColor: "#2a2a2a",
        padding: "15px 5px 15px 5px",
    },
    backButton: {
        color: "#ffffff",
        position: "absolute",
        zIndex: "2",
    },
    typographyBody1: {
        color: "#ffffff",
        fontSize: "18px",
        fontWeight: "bold",
        flexGrow: 1,
        position: "relative",
    },
    loadingIcon: {
        display: "block",
        margin: "auto",
        marginTop: "30px"
    }
});

/**
 * A dashboard component that hosts one or more charts for the selected device
 * @component
 *
 * @param {Object} props
 * @param {string} props.selectedDeviceId The selected device Id used for charting.
 * @param {Function} props.onNavigateBack Callback invoked when the "Back
 * &nbsp;to devices" button is clicked.
 * @param {ChartData} props.chartData Data used to generate charts for each property
 * &nbsp;associated with props.selectedDeviceId
 *
 * @memberof Autodesk.DataVisualization.UI
 * @alias Autodesk.DataVisualization.UI.Dashboard
 */
function Dashboard(props) {
    const classes = useStyles();

    function onBackButtonClicked() {
        if (props.onNavigateBack) {
            props.onNavigateBack();
        }
    }

    /**
     * Creates a {@link DataChart} for each property associated with props.selectedDeviceId.
     *
     * @returns {JSX.Element[]} An array of {@link DataChart} objects.
     * @memberof Autodesk.DataVisualization.UI
     * @alias Autodesk.DataVisualization.UI.Dashboard#generateChartElements
     */
    function generateChartElements() {
        // Get all the properties for this given device.
        const data = props.chartData[props.selectedDeviceId];
        const properties = data ? Object.keys(data["properties"]) : [];
        const chartElements = properties.map((property) => (
            <DataChart
                key={`${props.selectedDeviceId}-${property}`}
                deviceId={props.selectedDeviceId}
                deviceProperty={property}
                chartData={data["properties"][property]}
            />
        ));

        return chartElements.length ? chartElements : <CircularProgress size={50} color="secondary" classes={{ root: classes.loadingIcon }} />;
    }

    return (
        <div className={classes.dashboardRoot}>
            <div className={classes.headerBar}>
                <IconButton
                    className={classes.backButton}
                    onClick={onBackButtonClicked}
                    aria-label="navigate back to devices"
                >
                    <ArrowBackIosIcon />
                </IconButton>
                <Typography className={classes.typographyBody1} align="center" noWrap={true}>
                    {props.chartData[props.selectedDeviceId] ? props.chartData[props.selectedDeviceId].name : ""}
                </Typography>
            </div>
            {generateChartElements()}
        </div>
    );
}

export default Dashboard;
