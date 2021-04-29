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

import Checkbox from "@material-ui/core/Checkbox";
import ClickAwayListener from "@material-ui/core/ClickAwayListener";
import Divider from "@material-ui/core/Divider";
import FormControlLabel from "@material-ui/core/FormControlLabel";
import FormLabel from "@material-ui/core/FormLabel";
import FormGroup from "@material-ui/core/FormGroup";
import IconButton from "@material-ui/core/IconButton";
import Popper from "@material-ui/core/Popper";
import Radio from "@material-ui/core/Radio";
import RadioGroup from "@material-ui/core/RadioGroup";
import { makeStyles } from "@material-ui/core/styles";
import Typography from "@material-ui/core/Typography";
import LayersIcon from "@material-ui/icons/Layers";
import React, { useState, useEffect } from "react";
import BasicTree from "./BasicTree.jsx";
import SvgIcon from "@material-ui/core/SvgIcon";
import EventTypes from "./EventTypes.js";

const htcStyles = makeStyles(() => ({
    typography: {
        padding: "16px",
        backgroundColor: "#373737",
        color: "white",
        fontSize: "14px",
        borderRadius: "7px",
        marginLeft: "7px",
    },
    customHoverFocus: {
        "&:hover, &:focus": { fill: "#00bfff" },
        fill: "white",
    },
    popper: {
        zIndex: 2,
        maxHeight: "calc(100% - 250px)",
        overflowY: "auto",
        borderRadius: "7px",
        '&[x-placement*="right"] $arrow': {
            left: 0,
            height: "3em",
            width: "1em",
            "&::before": {
                borderWidth: "1em 1em 1em 0",
                borderColor: "transparent #373737 transparent transparent",
            },
        },
    },
    selectedItem: {
        color: "00bfff",
    },
    arrow: {
        position: "absolute",
        fontSize: 7,
        width: "4em",
        height: "4em",
        "&::before": {
            content: '""',
            margin: "auto",
            display: "block",
            width: 0,
            height: 0,
            borderStyle: "solid",
        },
    },
    formGroupRoot: {
        marginLeft: "20px",
    },
    divider: {
        backgroundColor: "#555555",
        margin: "6px"
    },
    formLabel: {
        color: "white",
        padding: "2px",
        marginTop: "8px",
        marginBottom: "3px",
        marginLeft: "-6px"
    },
    heatmapTypeRadioGroup: {
        marginTop: "1px"
    }
}));

const treeStyles = makeStyles(() => ({
    root: {
        "&.Mui-selected > .MuiTreeItem-content": {
            color: "#00bfff"
        }
    },
    itemLabel: {
        "&:hover": {
            backgroundColor: "#808080",
        },
    },
    categoryLabel: {
        "&:hover": {
            backgroundColor: "#808080",
        },
    },
    iconContainer: {
        marginLeft: "10px",
        marginRight: "0px",
    }
}));

/**
 * @returns {React.ReactFragment} The SvgIcon used to for the deviceButton.
 * @private
 */
function SensorOptionIcon() {
    return (
        <React.Fragment>
            <SvgIcon
                viewBox="0 0 30 26"
                xmlns="http://www.w3.org/2000/svg"
                style={{ fill: "inherit", width: "30", height: "26" }}
            >
                <path d="M13.04656,10.793a2.15724,2.15724 0 1,0 4.31448,0a2.15724,2.15724 0 1,0 -4.31448,0" />
                <path d="M27.6947 10.7923C27.6947 7.60096 26.4978 4.68913 24.5285 2.4812C24.1858 2.09699 24.1427 1.52037 24.4598 1.11484V1.11484C24.8251 0.647805 25.5153 0.593926 25.9148 1.03206C28.2629 3.60738 29.6947 7.03264 29.6947 10.7923C29.6947 14.46 28.332 17.8095 26.0854 20.3621C25.6816 20.821 24.966 20.7611 24.6022 20.2698V20.2698C24.3057 19.8692 24.3489 19.315 24.6741 18.9373C26.5567 16.7504 27.6947 13.9043 27.6947 10.7923ZM5.80514 20.2696C6.1017 19.869 6.05843 19.3148 5.73328 18.9371C3.85083 16.7502 2.71289 13.9042 2.71289 10.7923C2.71289 7.60104 3.90966 4.68928 5.87889 2.48137C6.22156 2.09716 6.26472 1.52054 5.94755 1.11502V1.11502C5.58228 0.647977 4.89205 0.594103 4.49258 1.03225C2.14461 3.60755 0.71289 7.03274 0.71289 10.7923C0.71289 14.4599 2.07543 17.8093 4.32192 20.3619C4.72579 20.8208 5.4414 20.7609 5.80514 20.2696V20.2696ZM8.10802 17.159C7.72911 17.6708 6.97619 17.7156 6.59537 17.2052C5.26038 15.416 4.47007 13.1965 4.47007 10.7925C4.47007 8.25108 5.35328 5.91596 6.82951 4.07733C7.21145 3.60163 7.92694 3.64583 8.30277 4.12636V4.12636C8.61122 4.52074 8.58036 5.07752 8.27522 5.47448C7.14313 6.94727 6.47007 8.79128 6.47007 10.7925C6.47007 12.6816 7.06983 14.4306 8.08933 15.8595C8.36688 16.2485 8.39236 16.7749 8.10802 17.159V17.159ZM22.2995 17.1594C22.6784 17.6712 23.4313 17.716 23.8121 17.2057C25.1474 15.4164 25.9378 13.1967 25.9378 10.7925C25.9378 8.25088 25.0545 5.91558 23.578 4.07688C23.1961 3.60122 22.4806 3.64543 22.1048 4.12595V4.12595C21.7963 4.52035 21.8272 5.07716 22.1324 5.47411C23.2647 6.94696 23.9378 8.79111 23.9378 10.7925C23.9378 12.6818 23.3379 14.431 22.3183 15.8599C22.0407 16.249 22.0152 16.7754 22.2995 17.1594V17.1594ZM19.7259 13.6831C20.1508 14.2571 21.0111 14.256 21.3105 13.6076C21.706 12.7512 21.9266 11.7976 21.9266 10.7924C21.9266 9.58011 21.6057 8.44278 21.0443 7.46069C20.717 6.8882 19.9313 6.90502 19.525 7.42446V7.42446C19.2392 7.78985 19.24 8.2953 19.4447 8.7116C19.7533 9.33936 19.9266 10.0456 19.9266 10.7924C19.9266 11.393 19.8145 11.9675 19.61 12.496C19.4574 12.8904 19.4742 13.3432 19.7259 13.6831V13.6831ZM10.6816 13.6827C10.9333 13.3428 10.9501 12.8901 10.7976 12.4956C10.5932 11.9672 10.4811 11.3929 10.4811 10.7924C10.4811 10.0457 10.6544 9.33957 10.9629 8.71188C11.1675 8.29559 11.1683 7.79017 10.8825 7.42479V7.42479C10.4762 6.90534 9.69046 6.88854 9.3632 7.46108C8.80189 8.44308 8.4811 9.58027 8.4811 10.7924C8.4811 11.7974 8.70163 12.7509 9.09693 13.6071C9.3963 14.2555 10.2567 14.2567 10.6816 13.6827V13.6827ZM14.7543 25.2764C14.9035 25.2809 15.0534 25.2832 15.2038 25.2832C15.3542 25.2832 15.504 25.2809 15.6533 25.2764L14.7543 25.2764Z" />
            </SvgIcon>
        </React.Fragment>
    );
}

/**
 * Component responsible for displaying the grouping information as defined by the parent component and a menu to configure device render settings.
 * @component
 * 
 * @param {Object} props
 * @param {TreeNode[]} props.data Array of device {@link TreeNode} in the scene
 * @param {EventBus} props.eventBus Used to dispatch mouse events when a user interacts with a {@link TreeNode}
 * @param {boolean} [props.structureToolOnly] Flag that renders only the BasicTree option when true.
 * @param {(SurfaceShadingGroup|SurfaceShadingNode)} props.selectedGroupNode Represents the 
 * &nbsp;group node that is currently selected in the scene.
 * @param {{Object}} props.renderSettings Defines settings that are configured via the DataViz extension.
 * @param {boolean} props.renderSettings.showViewables Defines whether sprite viewables are visible in the scene.
 * @param {boolean} props.renderSettings.occlusion Defines whether the sprite viewables are occluded.
 * @param {boolean} props.renderSettings.showTextures Defines whether textures are shown.
 * @param {"GeometryHeatmap"|"PlanarHeatmap"} props.renderSettings.heatmapType Heatmap type to render in scene.
 * 
 * @memberof Autodesk.DataVisualization.UI
 * @alias Autodesk.DataVisualization.UI.HyperionToolContainer
 */
function HyperionToolContainer(props) {
    const [ssdButtonAnchor, setSSDButtonAnchor] = useState(null); //SSD = SurfaceShadingData
    const [deviceButtonAnchor, setDeviceButtonAnchor] = useState(null);
    const [expandNodeId, setExpandNodeId] = useState("");
    const [selectedNodeId, setSelectedNodeId] = useState("");
    const [showSSD, setShowSSD] = useState(false); // SSD = SurfaceShadingData
    const [fromDeviceTree, setFromDeviceTree] = useState(false);
    const [canClose, setCanClose] = useState(false);

    const settings = props.renderSettings || {
        showViewables: true,
        occlusion: false,
        showTextures: true,
    };

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

    // Used to open the SurfaceShadingData icon by default.
    useEffect(() => {
        if (props.selectedGroupNode && props.selectedGroupNode.id != selectedNodeId) { // Change originating from deviceTree.
            setCanClose(!showSSD);
            setFromDeviceTree(true);
        } else {
            setFromDeviceTree(false); // Change didn't originate from DeviceTree
        }

        if (props.data.length > 0) setShowSSD(true);
        if (props.selectedGroupNode) setSelectedNodeId(props.selectedGroupNode.id);
    }, [props.selectedGroupNode])

    const [arrowRef, setArrowRef] = useState(null);

    /**
     * Opens a menu to reveal {@link SurfaceShadingData}
     * 
     * @param {MouseEvent} event Click event indicating that the first button has been selected.
     * @private
     */
    const handleSSDButtonClick = (event) => {
        setSSDButtonAnchor(event.currentTarget);
        setShowSSD(true);
        setDeviceButtonAnchor(null)
    };

    /**
     * Opens the device settings menu.
     * 
     * @param {MouseEvent} event Click event indicating that the device button has been selected.
     * @private
     */
    const handleDeviceButtonClick = (event) => {
        setShowSSD(false);
        setSSDButtonAnchor(null);
        setDeviceButtonAnchor(event.currentTarget);
    };

    /**
     * Uses the Data Visualization Extension to reflect device settings in the scene.
     * 
     * @param {MouseEvent} event Click event indicating that the user has modified the 
     * &nbsp;configuration in the device settings menu,
     * @private
     */
    const handleSettingsChange = (event) => {
        let newSettings = Object.assign({}, settings);
        if (event.target.type === "radio") {
            if (event.target.name === "heatmapType") {
                newSettings[event.target.name] = event.target.value;
            }
            else {
                newSettings[event.target.name] = event.target.value === "true";
            }
        } else {
            newSettings[event.target.name] = event.target.checked;
        }

        dispatchEvent({
            type: EventTypes.RENDER_SETTINGS_CHANGED,
            data: newSettings,
        });
    };

    const classes = htcStyles();
    const treeClasses = treeStyles();

    /**
     * Highlights the node in the forge viewer canvas.
     * 
     * @param {MouseEvent} event MouseOver event indicating that a user has hovered over a group name.
     * @param {TreeNode} node Represents the group that a user has hovered over.
     * @private
     */
    function onMouseOver(event, node) {
        dispatchEvent({
            type: EventTypes.GROUP_SELECTION_MOUSE_OVER,
            originalEvent: event,
            data: node,
        });

        event.stopPropagation();
    }

    /**
     * Removes node highlight shown in the forge viewer canvas.
     * 
     * @param {MouseEvent} event MouseOver event indicating that a user has hovered over a group name.
     * @param {TreeNode} node Represents the group that a user has hovered over.
     * @private
     */
    function onMouseOut(event, node) {
        dispatchEvent({
            type: EventTypes.GROUP_SELECTION_MOUSE_OUT,
            originalEvent: event,
            data: node,
        });
        event.stopPropagation();
    }

    /**
     * Updates the scene to show the selected group.
     * 
     * @param {MouseEvent} event Click event indicating that a user has selected a group.
     * @param {TreeNode} node Represents the group that the user has selected.
     * @private
     */
    function onLabelClick(event, node) {
        dispatchEvent({
            type: EventTypes.GROUP_SELECTION_MOUSE_CLICK,
            originalEvent: event,
            data: node,
        });

        event.stopPropagation();
    }

    /**
     * Called when a user selects the arrow icon in the groups menu to expand or close a group.
     * 
     * @param {MouseEvent} event Click event indicating that a user has expanded/closed a grouping in the groups menu.
     * @param {TreeNode} node Node that user has selected to expand/close.
     * @private
     */
    function onIconClick(event, node) {
        dispatchEvent({
            type: EventTypes.GROUP_SELECTION_MOUSE_OUT,
            originalEvent: event,
            data: node,
        });

        if (expandNodeId === node.id.toString()) {
            setExpandNodeId("");
        } else {
            setExpandNodeId(node.id.toString());
        }

        event.stopPropagation();
    }

    /**
     * Closes the surface shading data menu.
     * 
     * @param {MouseEvent} event Click event indicating that the user has clicked elsewhere in the scene.
     * @private
     */
    const handleClickAway = (event) => {
        if (fromDeviceTree) {
            setFromDeviceTree(false);
            if (canClose) {
                setShowSSD(false);
                setCanClose(false);
            } else {
                setShowSSD(true);
            }
        } else {
            setShowSSD(false);
            setFromDeviceTree(false);
        }
    };

    /**
     * Closes the device settings menu,
     * 
     * @param {MouseEvent} event Click event indicating that the user has clicked elsewhere in the scene.
     * @private
     */
    const handleSettingsClickAway = (event) => {
        setDeviceButtonAnchor(null);
    };

    /**
     * Creates a label to be displayed for the given node.
     *
     * @param {TreeNode} node
     * @returns a <React.Fragment> that represents a row in the {@link BasicTree}.
     * @private
     */
    function createLabel(node) {
        return (
            <React.Fragment>
                {node.children.length > 0 ? (
                    <React.Fragment>
                        <Typography component={"div"} noWrap={true}>
                            {node.name}
                        </Typography>
                    </React.Fragment>
                ) : (
                        <div id="deviceName">
                            <Typography noWrap={true}>{node.name}</Typography>
                        </div>
                    )}
            </React.Fragment>
        );
    }

    return (
        <React.Fragment>
            <div id="hyperionToolContainer">
                <IconButton
                    id="ssdButton"
                    className={classes.customHoverFocus}
                    onClick={handleSSDButtonClick}
                    ref={props.data.length > 0 ? setSSDButtonAnchor : null}
                >
                    <LayersIcon style={{ fill: "inherit" }} />
                </IconButton>
                <Popper
                    className={classes.popper}
                    open={showSSD}
                    anchorEl={ssdButtonAnchor}
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
                            element: arrowRef,
                        },
                    }}
                >
                    <React.Fragment>
                        <span className={classes.arrow} ref={setArrowRef} />
                        <ClickAwayListener onClickAway={handleClickAway}>
                            <Typography className={classes.typography} component="div">
                                {props.data.length > 0 ? <BasicTree
                                    data={props.data}
                                    onMouseOver={onMouseOver}
                                    onMouseOut={onMouseOut}
                                    onLabelClick={onLabelClick}
                                    onIconClick={onIconClick}
                                    expanded={expandNodeId}
                                    selectedNodeId={selectedNodeId}
                                    onLabelRequest={createLabel}
                                    classes={{
                                        root: treeClasses.root,
                                        itemLabel: treeClasses.itemLabel,
                                        categoryLabel: treeClasses.categoryLabel,
                                        iconContainer: treeClasses.iconContainer
                                    }}
                                /> : <span>No data found in the model.</span>}
                            </Typography>
                        </ClickAwayListener>
                    </React.Fragment>
                </Popper>

                {!props.structureToolOnly &&
                    (<React.Fragment>
                        <Divider style={{ backgroundColor: "white" }} />
                        <IconButton className={classes.customHoverFocus} onClick={handleDeviceButtonClick}>
                            <SensorOptionIcon />
                        </IconButton>
                        <Popper
                            className={classes.popper}
                            open={Boolean(deviceButtonAnchor)}
                            anchorEl={deviceButtonAnchor}
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
                                    element: arrowRef,
                                },
                            }}
                        >
                            <React.Fragment>
                                <span className={classes.arrow} ref={setArrowRef} />
                                <ClickAwayListener onClickAway={handleSettingsClickAway}>
                                    <Typography className={classes.typography} component="div">
                                        <FormGroup className={classes.formGroupRoot}>
                                            <FormControlLabel
                                                control={
                                                    <Checkbox
                                                        checked={settings.showViewables}
                                                        onChange={handleSettingsChange}
                                                        style={{ color: "white", padding: "6px" }}
                                                        name="showViewables"
                                                        size="small"
                                                    />
                                                }
                                                label="Sensors"
                                            />
                                        </FormGroup>
                                        <div style={{ marginLeft: "35px", fontSize: "10px" }}>
                                            <RadioGroup
                                                name="occlusion"
                                                value={settings.occlusion}
                                                onChange={handleSettingsChange}
                                            >
                                                <FormControlLabel
                                                    value={true}
                                                    control={
                                                        <Radio
                                                            className={classes.radioButtons}
                                                            size="small"
                                                            style={{ color: "white", padding: "6px" }}
                                                        />
                                                    }
                                                    label="Occluded view"
                                                />

                                                <FormControlLabel
                                                    value={false}
                                                    control={<Radio size="small" style={{ color: "white", padding: "6px" }} />}
                                                    label="Display all in front"
                                                />
                                            </RadioGroup>
                                        </div>
                                        <FormGroup className={classes.formGroupRoot}>
                                            <FormControlLabel
                                                control={
                                                    <Checkbox
                                                        checked={settings.showTextures}
                                                        onChange={handleSettingsChange}
                                                        style={{ color: "white", padding: "6px" }}
                                                        name="showTextures"
                                                        size="small"
                                                    />
                                                }
                                                label="Textures"
                                            />
                                        </FormGroup>
                                        <Divider variant="middle" className={classes.divider} />
                                        <FormGroup className={classes.formGroupRoot}>
                                            <FormLabel component="legend" className={classes.formLabel}>Heatmap Types</FormLabel>
                                            <RadioGroup className={classes.heatmapTypeRadioGroup}
                                                name="heatmapType"
                                                value={settings.heatmapType}
                                                onChange={handleSettingsChange}
                                            >
                                                <FormControlLabel
                                                    value="GeometryHeatmap"
                                                    control={<Radio size="small" style={{ color: "white", padding: "6px" }} />}
                                                    label="Geometry"
                                                />

                                                <FormControlLabel
                                                    value="PlanarHeatmap"
                                                    control={<Radio size="small" style={{ color: "white", padding: "6px" }} />}
                                                    label="Planar"
                                                />
                                            </RadioGroup>
                                        </FormGroup>
                                    </Typography>
                                </ClickAwayListener>
                            </React.Fragment>
                        </Popper> </React.Fragment>)}
            </div>
        </React.Fragment>
    );
}

export default HyperionToolContainer;
