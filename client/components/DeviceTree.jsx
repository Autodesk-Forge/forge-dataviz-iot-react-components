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
import React, { memo } from "react";
import BasicTree from "./BasicTree.jsx";
import DeviceStats from "./DeviceStats.jsx";
import Avatar from "@material-ui/core/Avatar";
import Typography from "@material-ui/core/Typography";
import makeStyles from "@material-ui/core/styles/makeStyles";
import EventTypes from "./EventTypes.js";
// eslint-disable-next-line no-unused-vars

const useStyles = makeStyles((theme) => ({
    categoryLabel: {
        backgroundColor: "#2A2A2A",
        fontSize: "16px",
        padding: "5px",
        verticalAlign: "bottom",
        alignItems: "center",
        display: "inline-flex",
        paddingTop: "5px",
    },
    itemLabel: {
        backgroundColor: "#373737",
        padding: "10px",
        borderBottom: "1px solid #555555",
        fontSize: "17px",
        marginLeft: "0px",
        marginRight: "0px",
        "&:hover": {
            backgroundColor: "#2A2A2A",
        },
    },
    categoryContent: {
        backgroundColor: "#2A2A2A",
        maxWidth: "100%",
        overflowX: "hidden",
    },
    itemContent: {
        backgroundColor: "#373737",
        display: "contents",
        border: "1px solid black",
    },
    group: {
        padding: 0,
        margin: 0,
    },
    iconContainer: {
        marginLeft: "10px",
        marginRight: "0px",
    },
    avatar: {
        width: theme.spacing(3),
        height: theme.spacing(3),
        marginLeft: theme.spacing(1.5),
        fontSize: 10,
        backgroundColor: "#5B5B5B",
        display: "inline-flex",
    },
    typography: {
        fontWeight: "900",
        paddingTop: "5px",
    },
    iconButton: {
        display: "inline-block",
        float: "right",
        padding: "0px",
        marginRight: "12px",
    },
}));

const MemoizedDeviceStats = memo(DeviceStats);

/**
 * A tree component used to display a list of devices.
 * @component
 *
 * @param {Object} props
 * @param {EventBus} props.eventBus Used to dispatch mouse events when a user interacts with a {@link TreeNode}
 * @param {TreeNode[]} props.devices Array of device {@link TreeNode} in the scene
 * @param {OnNodeSelected} props.onNodeSelected A callback function invoked
 * &nbsp;when a device {@link TreeNode} is selected
 * @param {(SurfaceShadingGroup|SurfaceShadingNode)} props.selectedGroupNode Represents the
 * &nbsp;group node that is currently selected in the scene.
 * @param {CurrentDeviceData} props.currentDeviceData Data containing the estimated propertyValue for each property
 * &nbsp;associated with the selected device.
 * @param {Object} props.propertyIconMap A mapping of property names to image paths used for each {@link DeviceStats} object.
 * @param {Function} props.onNavigateBack A callback function invoked when "Back to devices" button is clicked.
 * 
 * @memberof Autodesk.DataVisualization.UI
 * @alias Autodesk.DataVisualization.UI.DeviceTree
 */
function DeviceTree(props) {
    const styles = useStyles();

    const eventBus = props.eventBus;

    /**
     * Dispatches the event if an eventBus is found.
     *
     * @param {MouseEvent} event MouseEvent that needs to be dispatched.
     * @private
     */
    function dispatchEvent(event) {
        if (eventBus) {
            eventBus.dispatchEvent(event);
        } else {
            console.warn("Please add an eventBus to dispatch events");
        }
    }

    /**
     *
     * @param {TreeNode} node {@link TreeNode}
     * @returns {number} The total number of descendants that a struct has.
     * @private
     */
    function getNumDescendants(node) {
        if (node.children.length === 0) {
            return 1;
        } else {
            let count = 0;
            node.children.forEach((child) => {
                count += getNumDescendants(child);
            });
            return count;
        }
    }

    /**
     * Called when a user selects the arrow icon in the device tree to expand or close a group of devices.
     *
     * @param {MouseEvent} event Event indicating a user has expanded or closed a row in the {@link DeviceTree}.
     * @param {TreeNode} node Node corresponding to the grouping of devices expanded/closed by the user.
     * @private
     */
    function onIconClick(event, node) {
        dispatchEvent({
            type: EventTypes.DEVICE_TREE_EXPAND_EVENT,
            originalEvent: event,
            data: node,
        });
    }

    /**
     * Called when a user selects a row in the {@link DeviceTree}.
     *
     * @param {MouseEvent} event Click event indicating a user has selected a row in the {@link DeviceTree}.
     * @param {TreeNode} node Node corresponding to the row selected by the user.
     * @private
     */
    function onLabelClick(event, node) {
        props.onNodeSelected(event, node.id);
    }

    /**
     * Creates a label to be displayed for the given node. If node refers to a grouping of devices, the <React.Fragment>
     * &nbsp;contains the group name and the number of devices in the group. If node refers to an
     * &nbsp;individual device, the <React.Fragment> contains the device name and a {@link DeviceStats}
     * &nbsp;for each device property.
     *
     * @param {TreeNode} node Represents a device.
     * @returns a <React.Fragment> that represents a row in the {@link DeviceTree}.
     * @private
     */
    function createLabel(node) {
        const data = props.currentDeviceData[node.id];
        const properties = data ? Object.keys(data) : [];
        const propertyIconMap = props.propertyIconMap || {};

        return node.children.length > 0 ? (
            <React.Fragment>
                <Typography component={"div"} noWrap={true}>
                    {node.name}
                </Typography>
                <Avatar className={styles.avatar}>{getNumDescendants(node)}</Avatar>
            </React.Fragment>
        ) : (
                <React.Fragment>
                    <div id="deviceName">
                        <Typography className={styles.typography} noWrap={true}>
                            {node.name}
                        </Typography>
                    </div>
                    {properties.map((property) => (
                        <MemoizedDeviceStats
                            key={`${node.id}-${property}`}
                            deviceId={node.id}
                            propertyIcon={propertyIconMap[property]}
                            propertyValue={data[property]}
                        />
                    ))}
                </React.Fragment>
            );
    }

    return (
        <BasicTree
            expanded={props.selectedGroupNode ? props.selectedGroupNode.id : ""}
            onLabelRequest={createLabel}
            data={props.devices}
            onIconClick={onIconClick}
            onLabelClick={onLabelClick}
            onMouseOver={onLabelClick}
            onMouseOut={props.onNavigateBack}
            classes={styles}
        />
    );
}

export default DeviceTree;
