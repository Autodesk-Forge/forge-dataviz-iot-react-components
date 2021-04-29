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

/*
    eslint no-unused-vars: [ "warn", {
        "varsIgnorePattern": "(props|event)"
    }]
*/
import React, { useState, useEffect } from "react";
import { makeStyles, withStyles } from "@material-ui/core/styles";
import Slider from "@material-ui/core/Slider";
import MenuItem from "@material-ui/core/MenuItem";
import TextField from "@material-ui/core/TextField";
import FormControl from "@material-ui/core/FormControl";
import VisibilityOffIcon from "@material-ui/icons/VisibilityOff";
import VisibilityIcon from "@material-ui/icons/Visibility";
import IconButton from "@material-ui/core/IconButton";
import Tooltip from "@material-ui/core/Tooltip";

const useStyles = makeStyles({
    root: {
        width: "75%",
        zIndex: 1,
        display: "flex",
        height: "10%",
        justifyContent: "center",
        position: "absolute",
        pointerEvents: "none",
    },
});

const CustomIconButton = withStyles({
    root: {
        paddingTop: "10px",
        height: "10px",
        "&:hover, &:focus": { background: "none", outline: "0" },
        fill: "#353536",
        display: "inline-block",
        marginTop: "15px",
        marginLeft: "-10px",
        pointerEvents: "auto",
    },
})(IconButton);

const useSliderStyle = makeStyles({
    rail: {
        backgroundImage: (props) => props.backgroundImage,
        height: "10px",
        opacity: "1",
        left: 0,
        borderRadius: "10px",
    },
    mark: {
        backgroundColor: "#ffffff33",
        height: 10,
        width: 1,
        left: 0,
    },
    root: {
        width: "30%",
        margin: "1%",
        marginTop: "20px",
        "& .MuiSlider-markLabel": {
            color: "#000000",
        },
    },
    thumb: {
        display: "none",
    },
});

const SensorCustomForm = withStyles({
    fullWidth: {
        width: "fit-content",
    },
    root: {
        width: "auto",
        pointerEvents: "auto",
        "& .MuiFilledInput-input": {
            padding: "10px",
            paddingRight: "27px",
        },
        "& .MuiSelect-icon": {
            color: "white",
        },
        "& .MuiInputBase-root": {
            color: "white",
            background: "none",
        },
        "& .MuiFormControl-marginNormal": {
            background: "#2D2C2C",
            borderRadius: "5px",
        },
    },
})(FormControl);

const ResolutionCustomForm = withStyles({
    fullWidth: {
        width: "fit-content",
    },
    root: {
        paddingLeft: "20px",
        paddingRight: "20px",
        width: "auto",
        pointerEvents: "auto",
        "& .MuiFilledInput-input": {
            padding: "10px",
            paddingRight: "27px",
        },
        "& .MuiSelect-icon": {
            color: "white",
        },
        "& .MuiInputBase-root": {
            color: "white",
            background: "none",
        },
        "& .MuiFormControl-marginNormal": {
            background: "#2D2C2C",
            borderRadius: "5px",
        },
    },
})(FormControl);

/**
 * A menu to pick sensor type and resolution
 * @component
 *
 * @param {Object} props
 * @param {string} props.resolutionValue Data resolution vaue. Ex. PT1H, PT15M etc.
 * @param {string} props.selectedPropertyId String identifer of selected property.
 * @param {boolean} props.showHeatMap Flag that shows heatmap when true and hides heatmap when false.
 * @param {Map.<string,DeviceProperty>} props.deviceModelProperties Map of all the properties across all devicesModels in a {@link DataStore} object.
 * @param {OnHeatMapOptionChange} props.onHeatmapOptionChange A callback function invoked when any combination of
 * &nbsp;resolutionValue, selectedPropertyId, and showHeatMap are changed.
 *
 * @memberof Autodesk.DataVisualization.UI.HeatmapOptions
 * @alias Autodesk.DataVisualization.UI.HeatmapOptions.HeatmapSelectionMenu
 */
function HeatmapSelectionMenu(props) {
    const resolutionValue = props.resolutionValue;
    const selectedPropertyId = props.selectedPropertyId;
    const showHeatMap = props.showHeatMap;

    /**
     * Updates showheatMap based on user selection.
     *
     * @param {MouseEvent} event Click event indication that user has modified showHeatmap.
     * @private
     */
    const onHeatmapCheckboxChange = (event) => {
        if (props.onHeatmapOptionChange) {
            props.onHeatmapOptionChange({
                resolutionValue,
                selectedPropertyId,
                showHeatMap: !showHeatMap,
            });
        }
    };

    /**
     * Updates resolutionValue based on user selection.
     *
     * @param {MouseEvent} event Click event indicating that user has modified the resolution value.
     * @private
     */
    function onResolutionChange(event) {
        if (props.onHeatmapOptionChange) {
            props.onHeatmapOptionChange({
                resolutionValue: event.target.value,
                selectedPropertyId,
                showHeatMap,
            });
        }
    }

    /**
     * Updates selectedPropertyId based on user selection.
     *
     * @param {MouseEvent} event Click event indicating that user has modified the selectedProperty.
     * @private
     */
    function onSensorTypeChange(event) {
        if (props.onHeatmapOptionChange) {
            props.onHeatmapOptionChange({
                resolutionValue,
                selectedPropertyId: event.target.value,
                showHeatMap,
            });
        }
    }

    /**
     * Generates a list of selectable property options to display.
     *
     * @returns {JSX.Element[]}
     * @private
     */
    function generateSensorProperties() {
        const allProperties = [...props.deviceModelProperties.keys()]
        return allProperties.map((propId) => {
            return (
                <MenuItem key={propId} value={propId}>
                    {propId}
                </MenuItem>
            );
        });
    }

    /**
     * Generates a list of selectable resolution values to display.
     *
     * @returns {JSX.Element[]}
     * @private
     */
    function generateResolutions() {
        var resolutionOptionKeys = ["1 day", "6 hrs", "1 hr", "15 mins", "5 min"];
        var resolutionOptionVals = ["P1D", "PT6H", "PT1H", "PT15M", "PT5M"];

        return resolutionOptionKeys.map((option, index) => (
            <MenuItem key={option} value={resolutionOptionVals[index]}>
                {option}
            </MenuItem>
        ));
    }

    return (
        <div id="menuOptions" style={{ display: "flex", pointerEvents: "none" }}>
            <SensorCustomForm>
                <TextField
                    select
                    variant="filled"
                    margin={"normal"}
                    value={selectedPropertyId}
                    onChange={(event) => onSensorTypeChange(event)}
                    InputProps={{ disableUnderline: true }}
                >
                    {generateSensorProperties()}
                </TextField>
            </SensorCustomForm>

            <ResolutionCustomForm>
                <TextField
                    select
                    variant="filled"
                    margin={"normal"}
                    value={resolutionValue}
                    onChange={(event) => onResolutionChange(event)}
                    InputProps={{ disableUnderline: true }}
                >
                    {generateResolutions()}
                </TextField>
            </ResolutionCustomForm>
            <Tooltip title={showHeatMap ? "Hide HeatMap" : "Show HeatMap"}>
                <CustomIconButton id="showHeatMap" onClick={onHeatmapCheckboxChange}>
                    {showHeatMap ? (
                        <VisibilityIcon style={{ fill: "inherit" }} />
                    ) : (
                            <VisibilityOffIcon style={{ fill: "inherit" }} />
                        )}
                </CustomIconButton>
            </Tooltip>
        </div>
    );
}

/**
 * A linear gradient slider with labeled marks
 * @component
 *
 * @param {Object} props
 * @param {string} props.selectedPropertyId The property ID, if any is selected.
 * @param {Object.<string, number[]>} props.propIdGradientMap The mapping of property
 * IDs to their corresponding gradient color values.
 * @param {GetPropertyRanges} props.getPropertyRanges The function to get the selected property's range and dataUnit
 * @param {number} props.totalMarkers The total number of slider marks to display on the slider.
 *
 * @memberof Autodesk.DataVisualization.UI.HeatmapOptions
 * @alias Autodesk.DataVisualization.UI.HeatmapOptions.GradientBar
 */
function GradientBar(props) {
    const [sliderMarks, setSliderMarks] = useState([
        { value: 20, label: "1" },
        { value: 40, label: "2" },
        { value: 60, label: "3" },
        { value: 80, label: "4" },
    ]);

    /**
     * 
     * @param {Object.<string, number[]>} propIdGradientMap A mapping of property IDs to their corresponding gradient color values.
     * @param {string} propertyId string identifier of selected property.
     * 
     * @returns {string} String representation of the background gradient image used for the slider.
     * @private
     */
    function generateGradientStyle(propIdGradientMap, propertyId) {
        let colorStops = propIdGradientMap[propertyId];
        colorStops = colorStops ? colorStops : [0xf9d423, 0xff4e50]; // Default colors.

        const colorStopsHex = colorStops.map((c) => `#${c.toString(16).padStart(6, "0")}`);
        return `linear-gradient(.25turn, ${colorStopsHex.join(", ")})`;
    }

    /**
     * Get the HeatMap Slider markers based on the selected SensorType
     *
     * @param {string} propertyId Selected sensor type
     * @private
     */
    function generateMarks(propertyId) {
        let localMarks = [];
        const totalMarkers = props.totalMarkers ? props.totalMarkers : 4; // Generate [1, 2, 3, ..., totalMarkers ]
        const seeds = Array.from({ length: totalMarkers }, (_, x) => x + 1);
        const valueOffset = 100.0 / (totalMarkers + 1.0);

        // Get the selected property's range min, max and dataUnit value from Ref App
        let propertyInfo = props.getPropertyRanges(propertyId);

        const delta = (propertyInfo.rangeMax - propertyInfo.rangeMin) / (totalMarkers + 1.0);
        localMarks = seeds.map((i) => {
            return {
                value: i * valueOffset,
                label: `${(propertyInfo.rangeMin + i * delta).toFixed()}${propertyInfo.dataUnit}`,
            };
        });
        return localMarks;
    }

    useEffect(() => {
        // Re-generate slider marks based on the selected property type.
        setSliderMarks(generateMarks(props.selectedPropertyId));
    }, [props.selectedPropertyId]);

    const classes = useSliderStyle({
        // Generate slider gradient styles based on the color stops specified and selected property.
        backgroundImage: generateGradientStyle(props.propIdGradientMap, props.selectedPropertyId),
    });

    return <Slider classes={classes} valueLabelDisplay="off" marks={sliderMarks} track={false} disabled={true} />;
}

/**
 * The HeatmapOptions component with a linear gradient and an options menu.
 * @component
 *
 * @param props
 * @param {string} props.selectedPropertyId The property id, if any is selected
 * @param {Object.<string, number[]>} props.propIdGradientMap The mapping of property
 * IDs to their corresponding gradient color values.
 * @param {GetPropertyRanges} props.getPropertyRanges The function to get the selected property's range and dataUnit
 * @param {number} props.totalMarkers The total number of slider markers
 * @param {string} props.resolutionValue The value for resolution. Ex. PT1H, PT15M etc.
 * @param {boolean} props.showHeatMap Flag to show/hide heatmap
 * @param {OnHeatMapOptionChange} props.onHeatMapOptionChange A callback function invoked when any combination of
 * &nbsp;resolutionValue, selectedPropertyId, and showHeatMap are changed.
 * @param {Map.<string, DeviceProperty>} props.deviceModelProperties  Map of all the properties across all devicesModels in a {@link DataStore} object.
 *
 * @memberof Autodesk.DataVisualization.UI
 * @alias Autodesk.DataVisualization.UI.HeatmapOptions
 */
function HeatmapOptions(props) {
    const classes = useStyles();

    return (
        <div id="surfaceShader_Container" className={classes.root}>
            <GradientBar {...props} />
            <HeatmapSelectionMenu {...props} />
        </div>
    );
}

export default HeatmapOptions;
