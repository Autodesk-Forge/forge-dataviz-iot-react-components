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
import DeviceTree from "./DeviceTree.jsx";
import TextField from "@material-ui/core/TextField";
import Autocomplete from "@material-ui/lab/Autocomplete";
import SearchIcon from "@material-ui/icons/Search";
import InputAdornment from "@material-ui/core/InputAdornment";
// eslint-disable-next-line no-unused-vars

/**
 * A panel component that displays all of devices in the scene.
 * @component
 * @param {Object} props
 * @param {EventBus} props.eventBus Used to dispatch mouse events when a user interacts with a {@link TreeNode}
 * @param {TreeNode[]} props.devices Array of device {@link TreeNode} in the scene
 * @param {OnNodeSelected} props.onNodeSelected A callback function invoked
 * &nbsp;when a device {@link TreeNode} is selected
 * @param {Object} props.propertyIconMap A mapping of property names to image paths used for each {@link DeviceStats} in the {@link DeviceTree} .
 * @param {(SurfaceShadingGroup|SurfaceShadingNode)} props.selectedGroupNode Represents the
 * &nbsp;group node that is currently selected in the scene.
 * @param {CurrentDeviceData} props.currentDeviceData Data containing the estimated propertyValue for each property
 * @param {Function} props.onNavigateBack A callback function invoked when "Back to devices" button is clicked.
 *
 * @memberof Autodesk.DataVisualization.UI
 * @alias Autodesk.DataVisualization.UI.DevicePanel
 */
function DevicePanel(props) {
    /**
     * Generates the labels used for searching for each device that data has been fetched for.
     *
     * @returns {Object[]} A list of device label records that is used by the AutoComplete component to show and identify a device.
     * @memberof Autodesk.DataVisualization.UI
     * @alias Autodesk.DataVisualization.UI.DevicePanel#getDeviceLabels
     * @private
     */
    function getDeviceLabels() {
        let deviceLabels = [];

        for (let group of props.devices) {
            for (let device of group.children) {
                if (props.currentDeviceData[device.id]) {
                    deviceLabels.push({ id: device.id, name: device.name });
                }
            }
        }

        return deviceLabels;
    }

    return (
        <React.Fragment>
            <div id="title">Sensor List</div>
            <div id="searchBarDiv">
                <Autocomplete
                    autoComplete={true}
                    disableClearable
                    forcePopupIcon={false}
                    clearOnEscape={true}
                    options={getDeviceLabels()}
                    getOptionLabel={(option) => option.name}
                    getOptionSelected={(option, value) => option.id === value.id}
                    onChange={(event, newValue) => {
                        if (newValue) props.onNodeSelected(event, newValue.id);
                    }}
                    renderInput={(params) => (
                        <TextField
                            {...params}
                            placeholder="Search"
                            variant="outlined"
                            fullWidth
                            InputProps={{
                                ...params.InputProps,
                                endAdornment: (
                                    <InputAdornment position="end">
                                        <SearchIcon />
                                    </InputAdornment>
                                ),
                                autoComplete: "on",
                            }}
                            size="small"
                        />
                    )}
                />
            </div>
            <div id="device-tree-view">
                <DeviceTree
                    devices={props.devices}
                    onNodeSelected={props.onNodeSelected}
                    propertyIconMap={props.propertyIconMap}
                    currentDeviceData={props.currentDeviceData}
                    selectedGroupNode={props.selectedGroupNode}
                    eventBus={props.eventBus}
                    onNavigateBack={props.onNavigateBack}
                />
            </div>
        </React.Fragment>
    );
}

export default DevicePanel;
