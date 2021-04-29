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
import Chip from "@material-ui/core/Chip";
import makeStyles from "@material-ui/core/styles/makeStyles";

const useStyles = makeStyles((theme) => ({
    chip: {
        color: "#D0D0D0",
        borderColor: "#D0D0D0",
        margin: theme.spacing(0.5),
        marginTop: "15px",
    },
    label: {
        paddngLeft: "10px",
    },
}));

/**
 * Displays the property value and corresponding property icon for a given device and property..
 * @component
 *
 * @param {Object} props
 * @param {string} props.deviceId String identifier of the device
 * @param {string} props.propertyValue String representation of the numerical value of the property and the corresponding data unit.
 * @param {string} props.propertyIcon Image src used to visually represent a property.
 * @memberof Autodesk.DataVisualization.UI
 * @alias Autodesk.DataVisualization.UI.DeviceStats
 */
function DeviceStats(props) {
    const styles = useStyles();

    return (
        <Chip
            key={props.deviceId}
            classes={{
                root: styles.chip,
                label: styles.label,
            }}
            variant="outlined"
            label={props.propertyValue}
            icon={<img src={props.propertyIcon} style={{ marginLeft: "8px", marginRight: "1px" }} />}
        />
    );
}

export default DeviceStats;
