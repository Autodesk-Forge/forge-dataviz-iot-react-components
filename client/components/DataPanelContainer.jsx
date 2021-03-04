//
// Copyright 2020 Autodesk
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
import React, { useState } from "react";
import { Rnd } from "react-rnd";
import DevicePanel from "./DevicePanel.jsx";
import Dashboard from "./Dashboard.jsx";
// JSDOC imports
// eslint-disable-next-line no-unused-vars

/**
 * The side panel component that displays the list of all sensors, or the charts for a single selected device
 * @component
 *
 * @param {Object} props
 * @param {string} props.selectedDevice An optional value that represents the
 * &nbsp;identifier of the current selected device. Empty string if no
 * &nbsp;device is selected.
 * @param {Function} props.onNavigateBack A callback function invoked when "Back
 * &nbsp;to devices" button is clicked.
 * @param {DeviceTreeNode[]} props.devices Array of device {@link DeviceTreeNode} in the scene
 * @param {Function} props.onNodeSelected A callback function that is invoked
 * &nbsp;when a tree node is selected
 * @param {Map<String,String>} props.deviceId2DbIdMap A mapping of device identifiers
 * &nbsp;to the dbId corresponding to its visual representation in the viewer.
 * @param {Object} props.dataVizExtn Represents the Forge Viewer Data Visualization extension
 * @param {ChartData} props.chartData Data used to generate charts for each property associated with props.selectedDevice
 * @param {CurrentDeviceData} props.currentDeviceData Data containing the estimated propertyValue for each property
 * &nbsp;associated with props.selectedDevice
 * @param {Object} props.propertyIconMap  A mapping of property names to image paths used for
 * &nbsp;each {@link Autodesk.Hyperion.UI.DeviceStats} object.
 * @param {Object} props.selectedFloorNode Represents the floor that is currently selected in the scene.
 * @param {Function} props.updateSelectedFloor A callback function to update the floor visible in the scene
 * &nbsp;when a user expands a different grouping of devices in the {@link Autodesk.Hyperion.UI.DeviceTree} object.
 *
 * @memberof Autodesk.Hyperion.UI
 * @alias Autodesk.Hyperion.UI.DataPanelContainer
 */
function DataPanelContainer(props) {
    const [panelSpecs, setPanelSpecs] = useState({
        width: "25%",
        height: "calc(100% - 120px)",
        x: 20,
        y: 20,
    });

    /**
     * @returns {HTMLDivElement} Containing a vertical ellipsis representing a movable handle.
     * @private
     */
    const CustomHandle = () => <div id="resizeHandle">&#8942;</div>;

    /**
     * Generates contents for display on the side of viewer. If a device has been selected, the
     * {@link Autodesk.Hyperion.UI.Dashboard} is rendered. Otherwise, {@link Autodesk.Hyperion.UI.DevicePanel} is rendered.
     *
     * @returns {JSX.Element} The contents to be rendered in place of the panel.
     * @memberof Autodesk.Hyperion.UI
     * @alias Autodesk.Hyperion.UI.DataPanelContainer#generatePanelContents
     */
    function generatePanelContents() {
        if (props.selectedDevice) {
            return (
                <Dashboard
                    selectedDeviceId={props.selectedDevice}
                    onNavigateBack={props.onNavigateBack}
                    chartData={props.chartData}
                />
            );
        } else {
            return (
                <DevicePanel
                    devices={props.devices}
                    onNodeSelected={props.onNodeSelected}
                    selectedDeviceId={props.selectedDevice}
                    onNavigateBack={props.onNavigateBack}
                    propertyIconMap={props.propertyIconMap}
                    selectedFloorNode={props.selectedFloorNode}
                    currentDeviceData={props.currentDeviceData}
                    updateSelectedFloor={props.updateSelectedFloor}
                />
            );
        }
    }

    return (
        <React.Fragment>
            {props.deviceId2DbIdMap && props.dataVizExtn && (
                <Rnd
                    default={{
                        x: panelSpecs.x,
                        y: panelSpecs.y,
                        width: panelSpecs.width,
                        height: panelSpecs.height,
                    }}
                    minWidth={"25%"}
                    disableDragging={true}
                    resizeHandleComponent={{ left: <CustomHandle /> }}
                    resizeHandleStyles={{
                        left: {
                            top: props.selectedDevice ? "15%" : "25%",
                            height: "70%",
                            paddingLeft: "2px",
                            paddingRight: "2px",
                        },
                    }}
                    bounds="parent"
                    // eslint-disable-next-line no-unused-vars
                    onResizeStop={(_e, _direction, ref, _delta, _position) => {
                        setPanelSpecs({
                            width: ref.style.width,
                            height: ref.style.height,
                        });
                    }}
                    enableResizing={{
                        top: false,
                        right: false,
                        bottom: false,
                        left: true,
                        topRight: false,
                        bottomRight: false,
                        bottomLeft: false,
                        topLeft: false,
                    }}
                >
                    {generatePanelContents()}
                </Rnd>
            )}
        </React.Fragment>
    );
}

module.exports = DataPanelContainer;
