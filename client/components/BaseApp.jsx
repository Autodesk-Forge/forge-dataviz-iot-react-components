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

/* eslint no-unused-vars: [
    "error", {
        "varsIgnorePattern": "(DataStore|DataView|masterDataView|deviceTypes|currentTime|startSecond|endSecond|resolution|currentSecond|DeviceProperty)"
    }
] */

import React, { useEffect, useState, useRef } from "react";
import Viewer from "./Viewer.jsx";
import CustomToolTip from "./CustomToolTip.jsx";
import DataPanelContainer from "./DataPanelContainer.jsx";
import HyperionToolContainer from "./HyperionToolContainer.jsx";
import { SpriteSize, SensorStyleDefinitions, PropIdGradientMap, PropertyIconMap } from "../config/SensorStyles.js";
import adskLogoSvg from "../../assets/images/autodesk-logo.svg";
import ChronosTimeSlider from "./ChronosTimeSlider.jsx";
import BasicDatePicker from "./BasicDatePicker.jsx";
import { getPaddedRange, getTimeInEpochSeconds, getClosestValue, clamp } from "../../shared/Utility";
import HeatmapOptions from "./HeatmapOptions.jsx";
import EventTypes from "./EventTypes.js";
import io from "socket.io-client";



import {
    Session,
    AzureDataAdapter,
    RestApiDataAdapter,
    DataView,
    DateTimeSpan,
    EventType,
    DeviceProperty,
    DeviceModel
} from "forge-dataviz-iot-data-modules/client";

// End Range for timeslider
const endRange = new Date(new Date().getTime() + 7 * 60 * 60 * 1000 * 24);
const startRange = new Date("2020-01-01T00:00:00Z");

// TODO: This function does not sound like it belongs in the main application
//  file, more suitable to be in a "device utility file". Move this to where
//  it rightfully belong.
/**
 * Creates the initial device-id-to-style map for all the device models found
 * defined in the downloaded list.
 *
 * @returns {Object.<string, ViewableStyle>} The style map
 * that maps a given device model ID to the corresponding {@link ViewableStyle}.
 *
 * @memberof Autodesk.DataVisualization.UI.BaseApp
 */
function initialDeviceModelStyleMap(surfaceShadingConfig) {
    let styleMap = {};
    let styleDef = SensorStyleDefinitions;
    if (surfaceShadingConfig && surfaceShadingConfig.deviceStyles) {
        styleDef = surfaceShadingConfig.deviceStyles;
    }

    // Create model-to-style map from style definitions.
    const DataVizCore = Autodesk.DataVisualization.Core;
    Object.entries(styleDef).forEach(([deviceModelId, styleDef]) => {
        styleMap[deviceModelId] = new DataVizCore.ViewableStyle(
            DataVizCore.ViewableType.SPRITE,
            new THREE.Color(styleDef.color),
            styleDef.url,
            new THREE.Color(styleDef.highlightedColor),
            styleDef.highlightedUrl,
            styleDef.animatedUrls
        );
    });

    return styleMap;
}

/**
 * Time slice selection of the timeline object
 * @property {Date} endDate End date of the timeslice
 * @property {Date} startDate Starting date of the timeslice
 * @property {string} resolution Current resolution of data
 * @property {Date} currentDate Current date of the timeslice
 */
class TimeOptions { }
export { TimeOptions };

/**
 * Configure default start/end date to be ranging from two weeks
 * in the past, to tomorrow. Also the current time to be now.
 */
const currDate = new Date();
currDate.setUTCHours(0, 0, 0, 0);
const endDate = new Date(currDate.getTime() + 1 * 24 * 60 * 60 * 1000);
endDate.setUTCHours(0, 0, 0, 0);
const startDate = new Date(currDate.getTime() - 14 * 24 * 60 * 60 * 1000);
startDate.setUTCHours(0, 0, 0, 0);

/**
 * Main Base App component.
 * 
 * @component
 * @param {Object} props
 * @param {Object} props.appData Data passed to the BaseApp.
 * @param {("AutodeskStaging"|"AutodeskProduction")} props.appData.env Forge API environment
 * @param {string} props.appData.docUrn Document URN of model
 * @param {string} props.appData.adapterType Corresponds to Data Adapter used to query data. i.e - synthetic, azure etc.
 * @param {"derivativeV2"|"derivativeV2_EU"|"modelDerivativeV2"|"fluent"|"D3S"|"D3S_EU"} [props.appData.api] Please refer to LMV documentation for more information.
 * @param {string} [props.appData.dataStart] Start date for provided CSV data in ISO string format.
 * @param {string} [props.appData.dataEnd] End date for provided CSV data in ISO string format.
 * @param {EventBus} props.eventBus Used to dispatch mouse events when a user interacts with a {@link TreeNode}
 * @param {Object} props.appContext Contains base urls used to query assets, LMV, data etc.
 * @param {string} [props.appContext.dataUrl] The base url used to configure a specific {@link DataAdapter}
 * @param {Object} props.data
 * @param {SurfaceShadingData} props.data.shadingData {@link SurfaceShadingData} associated with the model.
 * @param {TreeNode[]} props.data.devicePanelData Represents array of device {@link TreeNode} in the scene.
 * @param {Object} [props.renderSettings]
 * @param {boolean} [props.renderSettings.showViewables] Defines whether {@link SpriteViewable} are visible in the scene.
 * @param {boolean} [props.renderSettings.occlusion] Defines whether {@link SpriteViewable} are occluded.
 * @param {boolean} [props.renderSettings.showTextures] Defines whether textures are shown.
 * @param {"GeometryHeatmap"|"PlanarHeatmap"} [props.renderSettings.heatmapType] Heatmap type to render in scene.
 * @param {Object} [props.surfaceShadingConfig]
 * @param {number} [props.surfaceShadingConfig.spriteSize] Defines the size of a {@link SpriteViewable}
 * @param {Object.<string, Object>} [props.surfaceShadingConfig.deviceStyles] Represents different style definitions for a {@link SpriteViewable}
 * @param {Object.<string, number[]>} [props.surfaceShadingConfig.gradientSetting] Mapping of proerties to corresponding gradient bar color stop values.
 * @param {Object} [props.propertyIconMap]  A mapping of property names to image paths used for each {@link DeviceStats} object.
 * @param {number} [props.geomIndex] Index of geometry to load in scene.
 * @memberof Autodesk.DataVisualization.UI
 * @alias Autodesk.DataVisualization.UI.BaseApp
 */
export default function BaseApp(props) {
    /**
     * Most import variables that will define the behavior of this APP.
     * env: String -- AutodeskProduction/AutodeskStaging
     * api: "derivativeV2"|"derivativeV2_EU"|"modelDerivativeV2"|"fluent"|"D3S"|"D3S_EU" -- Please refer to LMV documentation
     * docUrn: String -- the document user want to load
     */
    const { env, docUrn, adapterType, api } = props.appData;

    /**
     * Function to get the access token used to load the model into {@link Viewer}
     * @private
     */
    async function getToken() {
        return fetch("/api/token")
            .then((res) => res.json())
            .then((data) => data.access_token);
    }

    let DataAdapter = RestApiDataAdapter;
    if (adapterType == "azure") {
        DataAdapter = AzureDataAdapter;
    }

    // calculate start/end range of the timeline if there is limitted data range
    // override the timeslider with the date range (from CSV or other database)
    if (props.appData.dataStart && props.appData.dataEnd) {
        let dataStart = new Date(props.appData.dataStart);
        let dataEnd = new Date(props.appData.dataEnd);
        startRange.setTime(dataStart.getTime());
        endRange.setTime(dataEnd.getTime());

        if (startDate.getTime() < startRange.getTime() || startDate.getTime() >= endRange.getTime()) {
            startDate.setTime(startRange.getTime());
        }

        if (endDate.getTime() <= startRange.getTime() || endDate.getTime() >= endRange.getTime()) {
            endDate.setTime(endRange.getTime());
        }

        if (currDate.getTime() <= startRange.getTime() || currDate.getTime() >= endRange.getTime()) {
            currDate.setTime(endRange.getTime());
        }

        // give it a little bit buffer to make the range selection visible
        startRange.setTime(dataStart.getTime() - 2 * 60 * 60 * 24 * 1000);
        endRange.setTime(dataEnd.getTime() + 2 * 60 * 60 * 24 * 1000);
    }

    const lmvViewerRef = useRef(null);
    const activeListenersRef = useRef({});
    const appStateRef = useRef(null);
    const timeOptionRef = useRef(null);
    const hoveredDeviceInfoRef = useRef({});
    const selectedGroupNodeRef = useRef();
    const needRefreshHeatmapRef = useRef(false);

    const [hoveredDeviceInfo, setHoveredDeviceInfo] = useState({});

    const [appState, setAppState] = useState({});
    const [deviceTree, setDeviceTree] = useState([]);
    const [selectedDevice, setSelectedDevice] = useState("");
    const [selectedGroupNode, setSelectedGroupNode] = useState();
    const [renderSettings, setRenderSettings] = useState(Object.assign({}, {
        showViewables: true,
        occlusion: false,
        showTextures: true,
        heatmapType: "GeometryHeatmap"
    }, props.renderSettings));

    const currentSurfaceShadingGroupRef = useRef("");

    const [heatmapOptions, setHeatmapOptions] = useState({
        resolutionValue: "PT1H",
        showHeatMap: true,
    });

    const [timeOptions, setTimeOptions] = useState({
        endTime: endDate,
        startTime: startDate,
        resolution: heatmapOptions.resolutionValue,
        currentTime: currDate,
    });

    const [dataContext, setDataContext] = useState("");
    const currentDeviceDataRef = useRef({});
    const chartDataRef = useRef({});

    timeOptionRef.current = timeOptions;
    appStateRef.current = appState;
    hoveredDeviceInfoRef.current = hoveredDeviceInfo;

    useEffect(() => {
        document.title = "Hyperion Reference App";
        return function cleanUp() {
            const viewer = lmvViewerRef.current;
            const listeners = activeListenersRef.current;

            if (viewer) {
                for (let key in listeners) {
                    viewer.removeEventListener(key, listeners[key]);
                }

                activeListenersRef.current = {};
            }
        };
    }, []);

    useEffect(() => {
        if (props.data) {
            onDataReady();
        }
    }, [props.data]);

    /**
     * Adjust the current time window of the given DataView object.
     *
     * @param {Date} startTime The start time of the time window
     * @param {Date} endTime The end time of the time window
     * @param {DataView} dataView The DataView object whose time
     * window is to be adjusted.
     * @private
     */
    function setTimeWindow(startTime, endTime, dataView, resolution = timeOptionRef.current.resolution) {
        const startSecond = getTimeInEpochSeconds(startTime);
        const endSecond = getTimeInEpochSeconds(endTime);

        const span = new DateTimeSpan(startSecond, endSecond, resolution);
        dataView.setTimeWindow(span);
    }

    function dispatchEventToHandler(event) {
        if (props.eventBus && props.eventBus.dispatchEvent) {
            props.eventBus.dispatchEvent(event);
        }
    }

    /**
     * Initializes a {@link DataStore} to generate a corresponding {@link DataView}.
     * @alias Autodesk.DataVisualization.UI.BaseApp#initializeDataStore
     * @private
     */
    async function initializeDataStore() {
        // Create a data adapter to pull in data from server.
        const adapter = new DataAdapter(adapterType, props.appContext.dataUrl);

        // Register the adapter and pull in all device models.
        const session = new Session();
        session.dataStore.registerDataAdapter(adapter);
        session.dataStore.addEventListener(EventType.QueryCompleted, function () {
            needRefreshHeatmapRef.current = true;
        });
        await session.dataStore.loadDeviceModelsFromAdapters();

        const masterDataView = session.dataStore.createView();

        // Add all known devices to masterDataView so they are watched.
        const deviceModels = session.dataStore.deviceModels;
        deviceModels.forEach((deviceModel) => {
            // Get all the properties that belong to this device type.
            const pids = deviceModel.properties.map((p) => p.id);

            deviceModel.devices.forEach((device) => {
                // Add a device and all its properties into the view.
                masterDataView.addDeviceProperties(device.id, pids);
            });
        });

        setTimeWindow(timeOptions.startTime, timeOptions.endTime, masterDataView);
        return [session, masterDataView];
    }


    // Called when heatmap type has changed.
    useEffect(() => {
        async function updateHeatmapType() {
            const currAppState = appStateRef.current;
            if (currAppState.dataVizExtn) {
                await currAppState.dataVizExtn.setupSurfaceShading(currAppState.model, currAppState.shadingData, { type: renderSettings.heatmapType });

                const currentSelectedNode = selectedGroupNodeRef.current;
                currAppState.dataVizExtn.renderSurfaceShading(currentSelectedNode.id, heatmapOptions.selectedPropertyId, getSensorValue)
            }
        }
        updateHeatmapType();

    }, [renderSettings.heatmapType])

    /**
     * Called by {@link Viewer} when the model has been loaded.
     * 
     * @param {Autodesk.Viewing.GuiViewer3D} viewer Instance of Forge Viewer
     * @param {*} data 
     * @callback
     */
    async function onModelLoaded(viewer, data) {
        const [session, masterDataView] = await initializeDataStore();
        const dataVizExtn = viewer.getExtension("Autodesk.DataVisualization")

        // Optional: load the MinimapExtension
        // viewer.loadExtension('Autodesk.AEC.Minimap3DExtension')

        props.eventBus.addEventListener(EventTypes.RENDER_SETTINGS_CHANGED, async (event) => {
            if (!event.hasStopped) {
                let newSettings = event.data;
                let { occlusion, showViewables, showTextures, heatmapType } = newSettings;
                setRenderSettings(newSettings);

                dataVizExtn.showHideViewables(showViewables, occlusion);
                if (showTextures) {
                    dataVizExtn.showTextures();
                } else {
                    dataVizExtn.hideTextures();
                }
            }
        });

        dispatchEventToHandler({
            type: EventTypes.MODEL_LOAD_COMPLETED,
            data: {
                viewer,
                data,
                session,
            },
        });

        setAppState({
            viewer: viewer,
            session: session,
            masterDataView: masterDataView,
            model: data.model,
            dataVizExtn,
        });
    }

    async function onDataReady() {
        let { session, masterDataView, viewer, model, dataVizExtn } = appState;
        const DataVizCore = Autodesk.DataVisualization.Core;

        let styleMap = initialDeviceModelStyleMap(props.surfaceShadingConfig);
        // let shadingData = await mapDevicesToRooms(session, model);
        let { shadingData, devicePanelData } = props.data;
        shadingData.initialize(model);
        const leafNodes = [];
        shadingData.getChildLeafs(leafNodes);

        function handleTreeNodeClick(event) {
            let currentSelectedNode = selectedGroupNodeRef.current;
            if (currentSelectedNode && currentSelectedNode.id == event.data.id) {
                setSelectedGroupNode(null);
                selectedGroupNodeRef.current = null;
            } else {
                let selectedNode = shadingData.getNodeById(event.data.id);
                if (selectedNode) {
                    setSelectedGroupNode(selectedNode);
                    selectedGroupNodeRef.current = selectedNode;
                }
            }
        }

        props.eventBus.addEventListener(EventTypes.DEVICE_TREE_EXPAND_EVENT, handleTreeNodeClick);
        props.eventBus.addEventListener(EventTypes.GROUP_SELECTION_MOUSE_CLICK, handleTreeNodeClick);

        function highlightOnMouseOver(event, isHighlight) {
            let node = shadingData.getNodeById(event.data.id);
            if (node && node.dbIds) {
                node.dbIds.map((dbId) => viewer.impl.highlightObjectNode(model, dbId, isHighlight));
                viewer.impl.invalidate(false, false, true);
            } else {
                for (let i = 0; i < leafNodes.length; i++) {
                    let leaf = leafNodes[i];
                    if (leaf.shadingPoints && leaf.shadingPoints.find((item) => item.id == event.data.id)) {
                        let sp = leaf.shadingPoints.find((item) => item.id == event.data.id);

                        if (sp.dbId != null) {
                            viewer.impl.highlightObjectNode(model, sp.dbId, isHighlight);
                        } else {
                            leaf.dbIds.map((dbId) => viewer.impl.highlightObjectNode(model, dbId, isHighlight));
                        }
                        viewer.impl.invalidate(false, false, true);
                        break;
                    }
                }
            }

            event.originalEvent.stopPropagation();
        }

        props.eventBus.addEventListener(EventTypes.GROUP_SELECTION_MOUSE_OUT, (event) => {
            highlightOnMouseOver(event, false);
        });

        props.eventBus.addEventListener(EventTypes.GROUP_SELECTION_MOUSE_OVER, (event) => {
            highlightOnMouseOver(event, true);
        });

        /**
         * Gets the ViewableStyle object for the given device model.
         *
         * @param {string} styleId Identifier of the device model.
         *
         * @returns {ViewableStyle} The corresponding
         * ViewableStyle object for the given device model, or the default style if none is found matching.
         *
         */
        function getViewableStyle(styleId) {
            return styleMap[styleId] || styleMap["default"];
        }

        /**
         * Asynchronously generates SpriteViewable objects for each device loaded within the session.
         *
         * @param {Session} session The session that contains the data store
         * &nbsp;where all of the loaded devices from service providers are stored.
         * @param {DataView} masterDataView The master view of device data
         * &nbsp;stored inside session data store.
         * @alias Autodesk.DataVisualization.UI.BaseApp#generateViewables
         * @private
         */
        async function generateViewables(shadingData) {
            let dbId = 1;
            const dbId2DeviceIdMap = {};
            const deviceId2DbIdMap = {};

            const viewableData = new DataVizCore.ViewableData();
            viewableData.spriteSize = props.surfaceShadingConfig && props.surfaceShadingConfig.spriteSize ? props.surfaceShadingConfig.spriteSize : SpriteSize;

            for (let i = 0; i < leafNodes.length; i++) {
                let leaf = leafNodes[i];

                for (let j = 0; leaf.shadingPoints && j < leaf.shadingPoints.length; j++) {
                    let device = leaf.shadingPoints[j];

                    const style = getViewableStyle(device.contextData.styleId);
                    const position = device.position;
                    const viewable = new DataVizCore.SpriteViewable(position, style, dbId);

                    dbId2DeviceIdMap[dbId] = device.id;
                    deviceId2DbIdMap[device.id] = dbId;
                    dbId++;

                    viewableData.addViewable(viewable);
                }
            }

            await viewableData.finish();
            dataVizExtn.addViewables(viewableData);
            dataVizExtn.showHideViewables(renderSettings.showViewables, renderSettings.occlusion);

            if (!renderSettings.showTextures) {
                dataVizExtn.hideTextures();
            }

            const propertyMap = session.dataStore.getPropertiesFromDataStore()
            const defaultHeatmapOptions = Object.assign({}, heatmapOptions, { selectedPropertyId: Array.from(propertyMap.keys())[0] || "" });
            setHeatmapOptions(defaultHeatmapOptions);

            if (props.surfaceShadingConfig && props.surfaceShadingConfig.gradientSetting) {
                let gradientSettings = props.surfaceShadingConfig.gradientSetting;
                for (let deviceType in gradientSettings) {
                    dataVizExtn.registerSurfaceShadingColors(deviceType, gradientSettings[deviceType], 0.7);
                }
            }

            let state = Object.assign({}, appState, {
                viewer: viewer,
                dataVizExtn,
                session: session,
                masterDataView: masterDataView,
                deviceId2DbIdMap: deviceId2DbIdMap,
                dbId2DeviceIdMap: dbId2DeviceIdMap,
                propertyMap: propertyMap,
                shadingData: shadingData,
                model,
            });

            setAppState(state);
        }

        function processEvent(callback) {
            return function (event) {
                props.eventBus.dispatchEvent(event);

                if (event.hasStopped) return;
                callback(event);
            };
        }

        /**
         * Called when a user selects a device in the scene. The corresponding device is selected in the scene.
         * 
         * @param {Event} event 
         * @private
         */
        function onItemClick(event) {
            const currAppState = appStateRef.current;
            if (currAppState.dataVizExtn && currAppState.dbId2DeviceIdMap) {
                setSelectedDevice(currAppState.dbId2DeviceIdMap[event.dbId]);
            }
        }

        /**
         * Called when a user hovers over a device in the scene.
         * 
         * @param {Event} event 
         * @private
         */
        async function onItemHovering(event) {
            const currAppState = appStateRef.current;
            if (event.hovering && currAppState.dbId2DeviceIdMap) {
                const deviceId = currAppState.dbId2DeviceIdMap[event.dbId];
                const device = currAppState.session.dataStore.getDevice(deviceId);

                if (device) {
                    const position = device.position;
                    const mappedPosition = currAppState.viewer.impl.worldToClient(position);

                    // Accounting for vertical offset of viewer container.
                    const vertificalOffset = event.originalEvent.clientY - event.originalEvent.offsetY;

                    setHoveredDeviceInfo({
                        id: deviceId,
                        xcoord: mappedPosition.x,
                        ycoord: mappedPosition.y + vertificalOffset - SpriteSize / viewer.getWindow().devicePixelRatio,
                    });
                }
            } else {
                if (hoveredDeviceInfoRef.current && hoveredDeviceInfoRef.current.id != null) {
                    setHoveredDeviceInfo({});
                }
            }
        }

        /**
         * When we work with client provided shading data, in order to get the internal device model working,
         * we have to provide a way to populate the shading data in the devices model.
         * @param {DataAdapter} adapter 
         */
        function updateDataStore(adapter) {
            const dataStore = session.dataStore;
            adapter = adapter || dataStore.adapters[0];

            let nodes = [];
            shadingData.getChildLeafs(nodes);

            let model = new DeviceModel("synthetic_device_model_" + new Date().getTime(), adapter.id);
            let hasData = false;

            for (let node of nodes) {
                for (let sp of node.shadingPoints) {
                    let dm = dataStore.getDeviceModelFromDeviceId(sp.id);
                    if (!dm) {
                        let deviceObj = model.addDevice(sp.id);
                        deviceObj.name = sp.name;
                        deviceObj.deviceModel = model;
                        deviceObj.sensorTypes = sp.types;
                        deviceObj.position = sp.position;
                        hasData = true;
                    }
                }
            }

            if (hasData) {
                dataStore.addDeviceModel(model);
            }
        }

        // Need to convert the deviceList to viewable data
        await Promise.all([dataVizExtn.setupSurfaceShading(model, shadingData, { type: renderSettings.heatmapType }), generateViewables(shadingData)]);

        updateDataStore();
        const completeDeviceTree = devicePanelData;
        setDeviceTree(completeDeviceTree);

        const itemClickListener = processEvent(onItemClick);
        const itemHoverListener = processEvent(onItemHovering);

        viewer.addEventListener(DataVizCore.MOUSE_CLICK, itemClickListener);
        viewer.addEventListener(DataVizCore.MOUSE_HOVERING, itemHoverListener);
        activeListenersRef.current[DataVizCore.MOUSE_CLICK] = itemClickListener;
        activeListenersRef.current[DataVizCore.MOUSE_HOVERING] = itemHoverListener;

        //Initialize websocket
        /**
         * 
         * @param {Session} session {@link Session} object 
         * initialized from the {@link BaseApp#initializeDataStore} 
         * @private
         */
        async function createWebsocket(session) {
            const dataStore = session.dataStore;
            // console.log("Starting websocket");
            let socket = new io({
                path: "/api/socket",
            });
            socket.on("connect", () => {
                // console.log("Socket open.");
            });
            socket.on("iot-data", (message) => {
                let events = JSON.parse(message);
                for (let e of events) {
                    let deviceId = e["DeviceId"];
                    for (const [key, value] of Object.entries(e)) {
                        if (key === "timeStamp" || key === "DeviceId") continue;
                        //Outside of timeStamp and DeviceId all other keys are properties
                        dataStore.updateCurrentPropertyValue(deviceId, key, value);
                    }
                }
            });
            socket.on("disconnect", () => {
                // console.log("Socket Disconnection");
            });
        }
        createWebsocket(session);
        props.eventBus.dispatchEvent({
            type: EventTypes.VIEWABLES_LOADED,
            data: {
                dataVizExtn,
                DataVizCore,
            },
        });
    }

    /**
     * Called when by {@link Viewer} when Forge Viewer has been initialized.
     * 
     * @param {Autodesk.Viewing.GuiViewer3D} viewer Instance of Forge Viewer
     * @callback
     */
    function onViewerInitialized(viewer) {
        if (lmvViewerRef.current) {
            throw new Error("Viewer has been recreated");
        }

        lmvViewerRef.current = viewer;
    }

    var triggerDataRefresh = (function () {
        let lastTime = new Date();
        let pendingOptions = null;

        // If the event was fired less than 16 ms, (or more than 60hz)
        // React UI will slow down and some event will be put into yeild mode
        // Control the frequency of the events will improve the performance a lot
        function updateTimeOptions(options) {
            let currentTime = new Date();
            if (currentTime - lastTime > 16) {
                lastTime = currentTime;
                needRefreshHeatmapRef.current = true;
                setTimeOptions(options);
            } else {
                pendingOptions = options;
                setTimeout(() => {
                    updateTimeOptions(pendingOptions);
                }, 10);
            }
        }
        return updateTimeOptions;
    })();

    /**
     * Handles changes on the time slider. The start date and/or end date can
     * be modified by user inputs interactively. This function will be called
     * when such changes happen.
     * @param {Date} startTime The start time for device data fetch call
     * @param {Date} endTime The end time for device data fetch call
     * @param {Date} currentTime The current time at which the TimeMarker is
     * @alias Autodesk.DataVisualization.UI.BaseApp.#handleTimeRangeUpdated
     */
    function handleTimeRangeUpdated(startTime, endTime, currentTime) {
        const currAppState = appStateRef.current;
        if (currAppState && currAppState.masterDataView) {
            setTimeWindow(startTime, endTime, currAppState.masterDataView);

            // Update component time option state.
            const options = Object.assign({}, timeOptionRef.current);
            options.startTime = startTime;
            options.endTime = endTime;
            options.currentTime = currentTime ? currentTime : startTime;

            triggerDataRefresh(options);
        }
    }

    /**
     * Handles changes of the time slider's time marker. The time marker can be
     * changed interactively by the user when it is dragged within the time window,
     * or during a playback mode of the time slider.
     * @param {Date} currentTime The current time at which the time marker is.
     * @alias Autodesk.DataVisualization.UI.BaseApp.#handleCurrTimeUpdated
     */
    function handleCurrTimeUpdated(currentTime) {
        const options = Object.assign({}, timeOptionRef.current);
        options.currentTime = currentTime;

        triggerDataRefresh(options);
    }

    /**
     * Called when a device has been selected. Uses the Data Visualization Extension to highlight node.
     * 
     * @param {MouseEvent} event Click event indicating that a row in {@link DeviceTree} has been selected.
     * @param {string} node Device identifier
     * @private
     */
    async function onNodeSelected(event, node) {
        /** @type {string} */
        const deviceId = node;

        // Only attempt select if device IDs have been established.
        if (appState.deviceId2DbIdMap && appState.deviceId2DbIdMap[deviceId]) {
            appState.dataVizExtn.highlightViewables([appState.deviceId2DbIdMap[deviceId]]);
            setSelectedDevice(deviceId);
        } else {
            setSelectedDevice("");
        }
    }

    /**
     * Clears selected device from the scene and from the {@link DevicePanel}.
     * @private
     */
    function navigateBackToDevices() {
        setSelectedDevice("");
        appState.dataVizExtn.clearHighlightedViewables();
    }

    /**
     * Gets the device property value given the current time marker.
     *
     * @param {SurfaceShadingPoint} surfaceShadingPoint A point that
     * &nbsp;contributes to the heatmap generally generated from a {@link Device} object.
     * &nbsp;This is generally created from a call to {@link ModelSurfaceInfo#generateSurfaceShadingData}
     * @param {string} sensorType The device property for which normalized
     * &nbsp;property value is to be retrieved.
     * @returns {number} The property value of the device at the time given in
     * &nbsp;timeOptions.currentTime field.
     * @alias Autodesk.DataVisualization.UI.BaseApp#getSensorValue
     * @private
     */
    function getSensorValue(surfaceShadingPoint, sensorType) {
        const currAppState = appStateRef.current;
        const options = timeOptionRef.current;

        if (currAppState && options) {
            const deviceId = surfaceShadingPoint.id;

            /** @type {DataView} */
            const dataView = currAppState.masterDataView;

            /** @type {Map.<string, DeviceProperty>} */
            const properties = currAppState.propertyMap;

            // Get the aggregated value for the selected property.
            const prop = properties.get(sensorType);
            if (prop) {
                const ct = getTimeInEpochSeconds(options.currentTime);
                const av = dataView.getAggregatedValues(deviceId, prop.id);

                if (av) {
                    // Given the current time, find the closest from time stamp array.
                    const value = getClosestValue(av, ct);
                    // Compute the normalized sensor value from the data range.
                    const range = av.getDataRange("avgValues");
                    let normalized = (value - range.min) / (range.max - range.min);

                    normalized = clamp(normalized, 0, 1);
                    return normalized;
                }
            }
        }

        return 0;
    }

    /**
     * Uses the application based on user changes to the {@link HeatmapOptions} component.
     * 
     * @param {Object} options Settings defined in the {@link HeatmapOptions}.
     * @private
     */
    function onHeatmapOptionChange(options) {
        setHeatmapOptions(options);
        const currAppState = appStateRef.current;

        // Update timeOptions with new resolution value if applicable.
        if (options.resolutionValue != timeOptionRef.current.resolutionValue) {
            var newTimeOptions = Object.assign({}, timeOptionRef.current);
            newTimeOptions.resolution = options.resolutionValue;

            setTimeWindow(
                newTimeOptions.startTime,
                newTimeOptions.endTime,
                currAppState.masterDataView,
                newTimeOptions.resolution
            );
            setTimeOptions(newTimeOptions);
        }

        if (selectedGroupNode && currAppState) {
            const { dataVizExtn } = currAppState;
            if (options.showHeatMap) {
                const selectedProperty = options.selectedPropertyId;
                dataVizExtn.renderSurfaceShading(selectedGroupNode.id, selectedProperty, getSensorValue);
            } else {
                dataVizExtn.removeSurfaceShading();
            }
        }
    }

    /**
     * Called when a user has changed the selected group in the scene using the {@link HyperionToolContainer} 
     * or the {@link DeviceTree}
     * 
     * @private
     */
    function checkGroupChange() {
        const currAppState = appStateRef.current;
        const { dataVizExtn } = currAppState;

        // A different group has been selected.
        if (
            selectedGroupNode &&
            selectedGroupNode.id != currentSurfaceShadingGroupRef.current &&
            currAppState &&
            dataVizExtn
        ) {
            currentSurfaceShadingGroupRef.current = selectedGroupNode.id;

            dataVizExtn.removeSurfaceShading();

            // Set resolution back to 1 hour.
            if (timeOptionRef.current.resolution != "PT1H") {
                var newHeatmapOptions = heatmapOptions;
                newHeatmapOptions.resolutionValue = "PT1H";
                setHeatmapOptions(newHeatmapOptions);

                var newTimeOptions = Object.assign({}, timeOptionRef.current);
                newTimeOptions.resolution = "PT1H";
                setTimeWindow(
                    newTimeOptions.startTime,
                    newTimeOptions.endTime,
                    currAppState.masterDataView,
                    newTimeOptions.resolution
                );
                setTimeOptions(newTimeOptions);
            }
            if (heatmapOptions.showHeatMap) {
                const selectedProperty = heatmapOptions.selectedPropertyId;
                dataVizExtn.renderSurfaceShading(selectedGroupNode.id, selectedProperty, getSensorValue);
            }
        } else if (selectedGroupNode == null && dataVizExtn) {
            dataVizExtn.removeSurfaceShading();
            currentSurfaceShadingGroupRef.current = null;
        }
    }

    useEffect(() => {
        if (!selectedGroupNode && appStateRef.current.propertyMap && props.data.shadingData) {
            if (props.data.shadingData.children.length > 0) {
                dispatchEventToHandler({
                    type: EventTypes.GROUP_SELECTION_MOUSE_CLICK,
                    data: props.data.shadingData.children[0],
                });
            }
        }
    }, [appStateRef.current.propertyMap]);

    /**
     * Gets the selected property's range min, max and dataUnit value.
     * 
     * @param {string} propertyId String identifier of a device property.
     * @returns {Object} The rangeMin, rangeMax and dataUnit for the selected propertyId
     * @private
     */
    function getPropertyRanges(propertyId) {
        const currAppState = appStateRef.current;

        if (propertyId !== "None") {
            let dataUnit = "";
            let rangeMin = Infinity;
            let rangeMax = -Infinity;

            /** @type {Map.<string,DeviceProperty>} */
            const propertyMap = currAppState.propertyMap;

            //Get the property data from the device model
            let deviceProperty = propertyMap.get(propertyId);

            if (deviceProperty) {
                dataUnit = deviceProperty.dataUnit;
                dataUnit = dataUnit.toLowerCase() === "celsius" ? "°C" : dataUnit;
                dataUnit = dataUnit.toLowerCase() === "fahrenheit" ? "°F" : dataUnit;
                rangeMin = Math.min(rangeMin, deviceProperty.rangeMin); // will be NaN if deviceProperty.rangeMin == undefined or NaN
                rangeMax = Math.max(rangeMax, deviceProperty.rangeMax); // will be NaN if deviceProperty.rangeMax == undefined or NaN
            }

            // Check if the property min and max range is available in the device model, else notify user
            if (isNaN(rangeMin) || isNaN(rangeMax)) {
                console.warn(
                    `RangeMin and RangeMax for ${propertyId} not specified. Please update these values in the device model`
                );
                rangeMin = 0;
                rangeMax = 100;
                dataUnit = "%";
            }
            return { rangeMin, rangeMax, dataUnit };
        }
    }

    const currAppState = appStateRef.current;
    if (selectedGroupNode && currAppState) {
        const { dataVizExtn } = currAppState;
        if (heatmapOptions.showHeatMap && dataVizExtn && needRefreshHeatmapRef.current) {
            needRefreshHeatmapRef.current = false;
            dataVizExtn.updateSurfaceShading(getSensorValue);
        }
    }

    /**
     * Returns the {@link TreeNode} in deviceTree that matches the given id.
     * 
     * @param {string} selectedNodeId group name
     * @private
     */
    function findNode(selectedNodeId) {
        let stack = deviceTree.slice();

        while (stack.length) {
            let item = stack.shift()
            if (item.id == selectedNodeId) return item;

            stack = stack.concat(item.children)
        }
    }

    /**
     * Returns all devices given the name of a group. [] if no devices found.
     * 
     * @param {Object} selectedNode Group object
     * @returns {Array.<TreeNode>} All devices (if any) on selectedNode.
     * @private
     */
    function getDevicesInGroup(selectedNode) {
        const deviceTreeFloor = findNode(selectedNode.id);

        function getChildren(accumulator, item) {
            if (!item.children || item.children.length === 0) {
                accumulator.push(item);
                return accumulator;
            }
            item.children.forEach((element) => {
                getChildren(accumulator, element);
            });
        }

        let devices = [];
        if (deviceTreeFloor) {
            getChildren(devices, deviceTreeFloor);
        }

        return devices;
    }

    /**
     * Given a list of deviceToQuery, checks masterDataView for relevant data. If not found, triggers a fetch and updates currentDeviceData when complete.
     * 
     * @param {*} devicesToQuery List of {@link TreeNode} to fetch device data for.
     * @private
     */
    function getDeviceData(devicesToQuery) {
        let currAppState = appStateRef.current;
        /** @type {CurrentDeviceData} */
        let data = {};
        let propertyMap = currAppState.propertyMap;
        devicesToQuery.forEach((device) => {
            device.propIds.forEach((property) => {
                let av = currAppState.masterDataView.getAggregatedValues(device.id, property)
                if (av) {
                    let options = timeOptionRef.current;
                    const ct = getTimeInEpochSeconds(options.currentTime);
                    let val = getClosestValue(av, ct);

                    Object.assign(data, currentDeviceDataRef.current);

                    if (!data[device.id]) {
                        data[device.id] = {};
                    }
                    let deviceProperty = propertyMap.get(property);
                    let dataUnit = deviceProperty ? deviceProperty.dataUnit : "%";
                    data[device.id][property] = `${val.toFixed(2)} ${dataUnit}`;
                }
            });
        });
        if (Object.keys(data).length) currentDeviceDataRef.current = data;
    }

    /**
     * Fetches and populates chartData for all devices in devicesToQuery that haven't already been fetched.
     * 
     * @param {Array.<TreeNode>} devicesToQuery List of {@link TreeNode} to retrieve chart data for.
     * @private
     */
    function getChartData(devicesToQuery) {
        let currAppState = appStateRef.current;
        /**@type {ChartData} */
        let data = {};
        let propertyMap = currAppState.propertyMap;

        devicesToQuery.forEach((device) => {
            device.propIds.forEach((property) => {
                let av = currAppState.masterDataView.getAggregatedValues(device.id, property)
                if (av) {
                    const { min, max } = getPaddedRange(av.avgValues, 10.0);
                    Object.assign(data, chartDataRef.current);

                    if (!data[device.id]) {
                        data[device.id] = {
                            name: device.name,
                            properties: {},
                        };
                    }

                    const seriesData = [];
                    av.tsValues.forEach((tsValue, index) => {
                        seriesData.push({
                            value: [tsValue * 1000, av.avgValues[index]],
                            label: {},
                        });
                    });
                    let deviceProperty = propertyMap.get(property);
                    let dataUnit = deviceProperty ? deviceProperty.dataUnit : "%";
                    data[device.id]["properties"][property] = {
                        dataUnit: dataUnit,
                        seriesData: seriesData,
                        yAxis: {
                            dataMin: min,
                            dataMax: max,
                        },
                    };
                }
            });
        });
        if (Object.keys(data).length) chartDataRef.current = data;
    }

    let devicesToQuery = [];
    if (selectedGroupNode && deviceTree.length) {
        devicesToQuery = getDevicesInGroup(selectedGroupNode);
    }
    if (hoveredDeviceInfoRef.current.id && !currentDeviceDataRef.current[hoveredDeviceInfoRef.current.id]) {
        devicesToQuery.push(findNode(hoveredDeviceInfoRef.current.id));
    }
    else if (selectedGroupNode === null && deviceTree) { // Viewing entire model, need to query all devices.
        deviceTree.forEach((group) => {
            devicesToQuery.push.apply(devicesToQuery, group.children);
        });
    }
    getDeviceData(devicesToQuery);
    getChartData(devicesToQuery);

    /**
    * Handle QueryCompleted event originating from the DataView object. Informs this component about the completion of a particular data fetch.
    * 
    * @param {QueryCompletedEventArgs} eventArgs The arguments for which the {@link DataView} was queried.
    * @private
    */
    function handleQueryCompleted(eventArgs) {
        // The following hook causes BaseApp to repaint every time a device
        // fetch is completed. E.g. if the time slider is adjusted, and 10 devices
        // are being queried for their data (in bulk), then the following will 
        // trigger 10 renders. This should not be a concern as React will only ever
        // update the relevant DOM sub-tree that actually changes.
        const query = eventArgs.query;
        setDataContext(`${query.dateTimeSpan.hashCode}-${query.deviceId}`);
    };

    checkGroupChange();

    useEffect(() => {
        if (currAppState.masterDataView) {
            currAppState.masterDataView.addEventListener(EventType.QueryCompleted, handleQueryCompleted);
            return () => {
                currAppState.masterDataView.removeEventListener(EventType.QueryCompleted, handleQueryCompleted);
            };
        }
    }, [currAppState.masterDataView]);

    return (
        <React.Fragment>
            <div id="main_header" style={{ display: "flex", backgroundColor: "#474747" }}>
                <ChronosTimeSlider
                    rangeStart={startRange.toISOString()}
                    rangeEnd={endRange.toISOString()}
                    {...timeOptions}
                    onTimeRangeUpdated={handleTimeRangeUpdated}
                    onCurrTimeUpdated={handleCurrTimeUpdated}
                />
                <BasicDatePicker
                    {...timeOptions}
                    disabledDate={endRange}
                    onRangeChange={handleTimeRangeUpdated}
                />
            </div>
            <CustomToolTip
                hoveredDeviceInfo={hoveredDeviceInfo}
                chartData={chartDataRef.current}
                currentDeviceData={currentDeviceDataRef.current}
            />
            
            <div className="viewer-container">
                <Viewer
                    env={env}
                    docUrn={docUrn}
                    api={api}
                    onViewerInitialized={onViewerInitialized}
                    onModelLoaded={onModelLoaded}
                    getToken={getToken}
                    extensions={{ "Autodesk.Viewing.ZoomWindow": {}, "Autodesk.DataVisualization": {} }}
                    geomIndex={props.geomIndex}
                />
            </div>
            {props.data && props.data.devicePanelData && (
                <HyperionToolContainer
                    eventBus={props.eventBus}
                    data={props.data.devicePanelData}
                    selectedGroupNode={selectedGroupNode}
                    renderSettings={renderSettings}
                />
            )}
            {selectedGroupNode && (
                <HeatmapOptions
                    {...heatmapOptions}
                    propIdGradientMap={
                        props.surfaceShadingConfig ? props.surfaceShadingConfig.gradientSetting : PropIdGradientMap
                    }
                    onHeatmapOptionChange={onHeatmapOptionChange}
                    getPropertyRanges={getPropertyRanges}
                    deviceModelProperties={appStateRef.current.propertyMap}
                    totalMarkers={4}
                />
            )}
            {props.data && props.data.devicePanelData && (
                <DataPanelContainer
                    {...appStateRef.current}
                    selectedDevice={selectedDevice}
                    selectedPropertyId={heatmapOptions.selectedPropertyId}
                    devices={props.data.devicePanelData}
                    onNodeSelected={onNodeSelected}
                    onNavigateBack={navigateBackToDevices}
                    propertyIconMap={props.propertyIconMap ? props.propertyIconMap : PropertyIconMap}
                    selectedGroupNode={selectedGroupNode}
                    currentDeviceData={currentDeviceDataRef.current}
                    chartData={chartDataRef.current}
                    eventBus={props.eventBus}
                />
            )}
            <img
                className="logo"
                src={adskLogoSvg}
                style={{ width: "9%", bottom: "22px", position: "absolute", zIndex: 2, left: "15px", opacity: 0.85 }}
            ></img>
        </React.Fragment>
    );
}

