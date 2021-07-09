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

import ClickAwayListener from "@material-ui/core/ClickAwayListener";
import IconButton from "@material-ui/core/IconButton";
import Button from "@material-ui/core/Button";
import Popper from "@material-ui/core/Popper";
import Typography from "@material-ui/core/Typography";
import React, { useState, useRef, useEffect } from "react";
import SvgIcon from "@material-ui/core/SvgIcon";
import ListItem from "@material-ui/core/ListItem";
import ListItemText from "@material-ui/core/ListItemText";
import { CopyToClipboard } from "react-copy-to-clipboard";
import Draggable from "react-draggable";
import { Controlled as CodeMirror } from "react-codemirror2";
import "codemirror/mode/javascript/javascript";
import "codemirror/lib/codemirror.css";
import "codemirror/theme/material-darker.css";

/**
 * @returns {React.ReactFragment} The SvgIcon used to for the Selection tool.
 * @private
 */
function SelectionToolIcon() {
    return (
        <React.Fragment>
            <SvgIcon
                viewBox="0 0 28 27"
                xmlns="http://www.w3.org/2000/svg"
                id="sensor-selection-tool-icon"
            >
                <path
                    d="M2.0580799999999986,11.03a9.38732,9.38732 0 1,0 18.77464,0a9.38732,9.38732 0 1,0 -18.77464,0"
                    fill="inherit"
                />
                <circle cx="18.4859" cy="18.0704" r="6.60504" fill="#373737" />
                <circle cx="11.5571" cy="11.1418" r="6.93452" fill="#545151" />
                <path
                    fillRule="evenodd"
                    clipRule="evenodd"
                    d="M25.5264 17.2881H20.8327V12.5945H17.7036V17.2881H13.0099V20.4172H17.7036V25.1109H20.8327V20.4172H25.5264V17.2881Z"
                    fill="inherit"
                />
            </SvgIcon>
        </React.Fragment>
    );
}

/**
 * @returns {React.ReactFragment} The SvgIcon used to for the Selection tool in AddPointsBar.
 * @private
 */
function SelectionToolIconInDone() {
    return (
        <React.Fragment>
            <SvgIcon
                viewBox="0 0 55 55"
                xmlns="http://www.w3.org/2000/svg"
                id="sensor-selection-tool-icon-in-bar"
            >
                <circle
                    cx="23.1371"
                    cy="22.2973"
                    r="19.0442"
                    fill="#007FC6"
                    stroke="white"
                    strokeWidth="6.34806"
                />
                <circle cx="37.4203" cy="36.5805" r="17.4572" fill="#007FC6" />
                <circle cx="23.3635" cy="22.524" r="16.0969" fill="#007FC6" />
                <path
                    fillRule="evenodd"
                    clipRule="evenodd"
                    d="M51.7033 34.9934H42.1812V25.4713H35.8331V34.9934H26.311V41.3415H35.8331V50.8635H42.1812V41.3415H51.7033V34.9934Z"
                    fill="white"
                />
            </SvgIcon>
        </React.Fragment>
    );
}

/**
 * @returns {React.ReactFragment} The SvgIcon used to for the closing the DeviceListContainer
 * @private
 */
function CancelIcon() {
    return (
        <React.Fragment>
            <SvgIcon
                viewBox="0 0 31 31"
                xmlns="http://www.w3.org/2000/svg"
                id="closeIcon"
                fill="none"
            >
                <circle cx="15.5" cy="15.5" r="15" fill="#2A2A2A" stroke="white" />
                <path
                    fillRule="evenodd"
                    clipRule="evenodd"
                    d="M23.4001 9.4001L22.6001 8.6001L16.0001 15.3001L9.4001 8.6001L8.6001 9.4001L15.3001 16.0001L8.6001 22.6001L9.4001 23.4001L16.0001 16.7001L22.6001 23.4001L23.4001 22.6001L16.7001 16.0001L23.4001 9.4001Z"
                    fill="white"
                />
            </SvgIcon>
        </React.Fragment>
    );
}

/**
 * A Dialog bar to indicate collection mode is 'ON'. Allows user to turn if off when they are done with their selction.
 * @component
 * @param {Object} props
 * @param {OnMouseEvent} props.onDone A function invoked when 'Done Button' is clicked.
 * @private
 */
function AddPointsBar(props) {
    return (
        <div id="selectionDoneBar">
            <div id="AddPointsTextContainer">
                <SelectionToolIconInDone />
                <Typography variant="body1" id="AddPointsTypography">
                    &nbsp; Select the model to add points.
                </Typography>
            </div>
            <div id="doneButtonDiv">
                <Button id="doneButton" size="small" onClick={props.onDone}>
                    Done
                </Button>
            </div>
        </div>
    );
}

/**
 * A Device List container component that displays the list of all the sensorPoint objects on Viewer canvas.
 * @component
 * @param {Object} props Props for DeviceListContainer component
 * @param {Map<string,RoomDevice>} props.deviceListMap A Map of all the selected points
 * @return {JSX.Element} Contains a generated list of all the selected object that defines the structure of a Device in a Room.
 *
 * @memberof Autodesk.DataVisualization.UI
 * @alias Autodesk.DataVisualization.UI.SelectionTool.DeviceListContainer
 */
function DeviceListContainer(props) {
    const deviceMap = props.deviceListMap;
    const deviceList = [...deviceMap.values()];

    return (
        <Draggable>
            <div id="showAllDiv">
                {deviceList.length > 0 ? (
                    <div id="listDiv">
                        <Typography variant="body1">Selection List =</Typography>
                        <CodeMirror
                            value={JSON.stringify(deviceList, undefined, 2)}
                            options={{
                                mode: "javascript",
                                lineNumbers: false,
                                json: true,
                                theme: "material-darker",
                                tabSize: 2,
                                readOnly: true,
                            }}
                        />
                        <div id="CopyButtonDiv">
                            <CopyToClipboard text={JSON.stringify(deviceList, undefined, 2)}>
                                <Button id="Copybutton" size="small">
                                    Copy
                                </Button>
                            </CopyToClipboard>
                        </div>
                    </div>
                ) : (
                    "No Points in Selection List"
                )}
                <IconButton id="closeIconButton" onClick={props.handleClose}>
                    <CancelIcon />
                </IconButton>
            </div>
        </Draggable>
    );
}

/**
 * A Selection Tool component responsible for displaying selection tool options
 * &nbsp;that allows user to click-and-add viewables to the loaded model in Viewer canvas
 * &nbsp; and get a list that represents the selected points as {@link RoomDevice} objects.
 * @component
 *
 * @param {Object} props
 * @param {Autodesk.Viewing.GuiViewer3D} viewer Instance of Forge Viewer
 * @param {Function} props.updateDevices A function to update the deviceList of parent component.
 *
 * @memberof Autodesk.DataVisualization.UI
 * @alias Autodesk.DataVisualization.UI.SelectionTool
 */
function SelectionTool(props) {
    const [selectionButtonAnchor, setSelectionButtonAnchor] = useState(null);
    const [selectionArrowRef, setSelectionArrowRef] = useState(null);
    const [showDoneBar, setShowDoneBar] = useState(false);
    const [showList, setShowList] = useState(false);

    let collectionModeRef = useRef("OFF");
    let dbIdNameMapRef = useRef(new Map());
    let selectedPointsMapRef = useRef(new Map());

    const viewer = props.viewer;
    const DATAVIZEXTN = Autodesk.DataVisualization.Core;

    useEffect(() => {
        viewer.addEventListener(DATAVIZEXTN.MOUSE_CLICK, onClickSelection);
        return function cleanUp() {
            if (viewer) {
                viewer.removeEventListener(DATAVIZEXTN.MOUSE_CLICK, onClickSelection);
            }
        };
    }, []);

    /**
     * Handle Selection Tool Container click
     * @param {MouseEvent} event Click event indicating that the user has clicked on Selection Tool Icon.
     * @private
     */
    const handleButtonClick = (event) => {
        setSelectionButtonAnchor(event.currentTarget);
    };

    /**
     * Closes the selection tool menu,
     *
     * @param {MouseEvent} event Click event indicating that the user has clicked elsewhere in the scene.
     * @private
     */
    const handleClickAway = (/* event */) => {
        setSelectionButtonAnchor(null);
    };

    /**
     * Handle click event indicating that the user has selected 'Add Points' in Selection tool menu
     * Turns on the collection mode
     * @private
     */
    function handleAddPoints() {
        //Start collecting the selected point on the Viewer canvas.
        collectionModeRef.current = "ON";
        setShowDoneBar(true);
    }

    /**
     * Handle click event indicating that the user has selected 'Show All points' in Selection tool menu to
     * display the Selection List container.
     * @private
     */
    function handleShowClick() {
        setShowList(true);
    }

    /**
     * Handle click event indicating that the user has selected 'Clear All' in Selection tool menu to
     * clear the viewables and selection list.
     * @private
     */
    function handleClearAll() {
        // Clear the selectedPoint Map
        selectedPointsMapRef.current.clear();
        dbIdNameMapRef.current.clear();
        props.updateDevices([]);
    }

    /**
     * Handle click event indicating that the user has selected 'Done' in Add Points Bar to
     * stop the Collection Mode
     * @private
     */
    function handleDone() {
        collectionModeRef.current = "OFF";
        setShowDoneBar(false);
    }

    /**
     * Handle click event to close the Selection List container
     * @private
     */
    function handleClose() {
        setShowList(false);
    }

    /**
     * Function to extract the properties of a selected point from the Viewer.
     * @param {number} dbId The DbID of the selected point.
     * @returns {Promise} A promise that resolves to the name property of the selected point.
     */
    function getPropertiesFromDbId(dbId) {
        return new Promise((resolve, reject) => {
            viewer.getProperties(
                dbId,
                function (e) {
                    var name = e.name;
                    resolve(name);
                },
                (error) => {
                    reject(error);
                }
            );
        });
    }

    /**
     * Handles the 'MOUSE_CLICK' event.
     * Generates a JSON object representing a {@link RoomDevice} based on the selected point on the Viewer canvas.
     * @param {MouseEvent} event Click event indicating that the user has selected a point on the loaded model.
     * @param {Object} event.clickInfo The selection point which is passed through the event
     * @param {number} event.clickInfo.dbId The dbId of the selection point
     * @param {{x:number, y:number, z:number}} event.clickInfo.point The position information of the selection point
     */
    async function onClickSelection(event) {
        if (collectionModeRef.current == "ON") {
            if (event.dbId == 0) {
                // User clicked an area with no sprites
                var sp = event.clickInfo;
                //Generate an id for the sensorPoint.
                var spId;

                // Check if we already extracted properties of the selected point
                if (dbIdNameMapRef.current.has(sp.dbId)) {
                    let dbProp = dbIdNameMapRef.current.get(sp.dbId);
                    dbProp.index++;
                    spId = dbProp.name + "-" + dbProp.index;
                } else {
                    // Extract name for selected point from viewer
                    var name = await getPropertiesFromDbId(sp.dbId);
                    dbIdNameMapRef.current.set(sp.dbId, { name: name, index: 1 });
                    spId = name + "-1";
                }

                /** @type {RoomDevice} An object that defines the structure of a Device in a Room. */
                var sensorPoint = {
                    id: spId,
                    dbId: sp.dbId,
                    position: sp.point,
                    type: "my-sensor-type",
                    sensorTypes: ["Temperature"],
                };

                const key = `${sensorPoint.position.x.toFixed(2)}-${sensorPoint.position.y.toFixed(
                    2
                )}-${sensorPoint.position.z.toFixed(2)}`;

                /**
                 * @type {Map<String,RoomDevice>}
                 */
                selectedPointsMapRef.current.set(key, sensorPoint);

                /**
                 * @type {Array.<RoomDevice>}
                 */
                props.updateDevices([...selectedPointsMapRef.current.values()]);
            }
        }
    }

    return (
        <React.Fragment>
            <div id="selectionToolContainer">
                <IconButton className="container-button" onClick={handleButtonClick}>
                    <SelectionToolIcon />
                </IconButton>
                <Popper
                    className="popper"
                    open={Boolean(selectionButtonAnchor)}
                    anchorEl={selectionButtonAnchor}
                    placement="left-start"
                    disablePortal={false}
                    modifiers={{
                        flip: {
                            enabled: true,
                        },
                        preventOverflow: {
                            enabled: true,
                            boundariesElement: "scrollParent",
                        },
                        arrow: {
                            enabled: true,
                            element: selectionArrowRef,
                        },
                    }}
                >
                    <React.Fragment>
                        <span className="arrow" ref={setSelectionArrowRef} />
                        <ClickAwayListener onClickAway={handleClickAway}>
                            <Typography id="settings-typography" component="div">
                                <ListItem button onClick={handleAddPoints}>
                                    <ListItemText primary="Add Points" />
                                </ListItem>
                                <ListItem button onClick={handleShowClick}>
                                    <ListItemText primary="Show Point List" />
                                </ListItem>
                                <ListItem button onClick={handleClearAll}>
                                    <ListItemText primary="Clear All" />
                                </ListItem>
                            </Typography>
                        </ClickAwayListener>
                    </React.Fragment>
                </Popper>
            </div>
            {showDoneBar ? <AddPointsBar onDone={handleDone} /> : ""}
            {showList ? (
                <DeviceListContainer
                    deviceListMap={selectedPointsMapRef.current}
                    handleClose={handleClose}
                />
            ) : null}
        </React.Fragment>
    );
}

export default SelectionTool;
