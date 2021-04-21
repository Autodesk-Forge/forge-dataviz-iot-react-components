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
/*eslint no-inner-declarations: "warn"*/
import React, { useEffect, useRef } from "react";

/**
 * @component
 * Component for rendering LMV
 * @param {Object} props
 * @param {("AutodeskProduction"|"AutodeskStaging"|"MD20ProdUS"|"MD20ProdEU")} props.env Forge API environment
 * @param {Function} props.getToken Returns the Forge API token to access LMV
 * @param {"derivativeV2"|"derivativeV2_EU"|"modelDerivativeV2"|"fluent"|"D3S"|"D3S_EU"} props.api Default = "derivativeV2". Please refer to LMV documentation for more information.
 * @param {string} props.docUrn Document URN of model
 * @param {OnModelLoaded} props.onModelLoaded Callback function invoked when the model has loaded
 * @param {OnViewerInitialized} props.onViewerInitialized Callback function invoked when LMV has been intialized
 * @param {string[]} [props.extensions] List of extension ids forwarded to viewer config to load.
 * @param {Object.<string, Object>} [props.disabledExtensions] Default extensions to prevent being loaded.
 * @param {string} [props.phaseName] phaseName of view to load in scene.
 * @param {string} [props.guid] guid of BubbleNode to load in scene.
 * @param {string} [props.viewableID] viewableID of BubbleNode to load in scene.
 * @param {number} [props.geomIndex] Index of geometry to load in scene.
 * @param {Boolean} props.skipHiddenFragments Boolean to specify if hidden fragments should be skipped (Default: false,
 * Hidden fragments are required for heatmaps in rooms, only applicable to SVF2)
 * @param {Object} props.viewerOptions Options object to forward to Autodesk.Viewing.Initializer
 * @memberof Autodesk.DataVisualization.UI
 * @alias Autodesk.DataVisualization.UI.Viewer
 */

export default function Viewer(props) {
    const viewerRef = useRef(null);
    const viewerDomRef = useRef(null);

    function onModelLoaded(event) {
        const viewer = viewerRef.current;

        const av = Autodesk.Viewing;
        viewer.removeEventListener(av.GEOMETRY_LOADED_EVENT, onModelLoaded);

        if (props.onModelLoaded) {
            props.onModelLoaded(viewer, event);
        }
    }

    /**
     * Initializes LMV.
     *
     * @memberof Autodesk.DataVisualization.UI
     * @alias Autodesk.DataVisualization.UI.Viewer#initializeViewer
     * @private
     */
    function initializeViewer() {
        let viewerOptions = props.viewerOptions;

        var options = Object.assign({}, viewerOptions, {
            env: props.env,
            api: props.api || "derivativeV2", // for models uploaded to EMEA change this option to 'derivativeV2_EU'
            getAccessToken: async function (onTokenReady) {
                let token = await props.getToken();
                var timeInSeconds = 3600; // Use value provided by Forge Authentication (OAuth) API
                onTokenReady(token, timeInSeconds);
            },
        });

        Autodesk.Viewing.Initializer(options, async function () {

            const extensionsToLoad = props.extensions;

            const extensionsWithConfig = [];
            const extensionsWithoutConfig = [];
            
            for (let key in extensionsToLoad) {
                const config = extensionsToLoad[key];
                if (Object.keys(config).length === 0) {
                    extensionsWithoutConfig.push(key);
                } else {
                    extensionsWithConfig.push(key);
                }
            }

            const viewer = new Autodesk.Viewing.GuiViewer3D(viewerDomRef.current, {
                extensions: extensionsWithoutConfig,
                disabledExtensions: props.disabledExtensions || {},
            });

            extensionsWithConfig.forEach((ext) => {
                viewer.loadExtension(ext, extensionsToLoad[ext])
            })

            viewerRef.current = viewer;

            const startedCode = viewer.start(undefined, undefined, undefined, undefined, options);
            if (startedCode > 0) {
                console.error("Failed to create a Viewer: WebGL not supported.");
                return;
            }

            const av = Autodesk.Viewing;
            viewer.addEventListener(av.GEOMETRY_LOADED_EVENT, onModelLoaded, { once: true });
            loadModel(viewer, props.docUrn);

            if (props.onViewerInitialized) {
                props.onViewerInitialized(viewer);
            }
        });
    }

    /**
     * Loads the specified model into the viewer.
     *
     * @param {Object} viewer Initialized LMV object
     * @param {string} documentId Document URN of the model to be loaded
     * @memberof Autodesk.DataVisualization.UI
     * @alias Autodesk.DataVisualization.UI.Viewer#loadModel
     * @private
     */
    function loadModel(viewer, documentId) {
        function onDocumentLoadSuccess(viewerDocument) {
            // viewerDocument is an instance of Autodesk.Viewing.Document
            const bubbleNode = viewerDocument.getRoot();
            let defaultModel;

            if (props.phaseName) {
                defaultModel = bubbleNode.getMasterView(props.phaseName);
            } else if (props.guid) {
                defaultModel = bubbleNode.findByGuid(props.guid);
            } else if (props.viewableID) {
                const results = bubbleNode.search({ viewableID: props.viewableID });
                if (results && results.length) {
                    defaultModel = results[0];
                }
            }
            else if (props.geomIndex) {
                const geoms = bubbleNode.search({ 'type': 'geometry' })
                if (geoms.length) {
                    if (props.geomIndex < 0 || props.geomIndex >= geoms.length) {
                        console.warn("GeometryIndex Error: Invalid geometry index.")
                    }
                    const index = Math.min(Math.max(props.geomIndex, 0), geoms.length - 1) // Ensure index is valid.
                    defaultModel = geoms[index];
                }
            }

            if (!defaultModel) defaultModel = bubbleNode.getDefaultGeometry(true);
            const skipHiddenFragments = props.skipHiddenFragments || false;
            viewer.loadDocumentNode(viewerDocument, defaultModel, {
                keepCurrentModels: true,
                skipHiddenFragments: skipHiddenFragments,
            });

            // modify the preference settings, since ghosting is causing heavy z-fighting with the room geometry
            // it would be good we turn it off
            viewer.prefs.set("ghosting", false);
        }

        function onDocumentLoadFailure() {
            console.error("Failed fetching Forge manifest");
        }

        if (documentId) {
            Autodesk.Viewing.Document.load(documentId, onDocumentLoadSuccess, onDocumentLoadFailure);
        } else {
            props.eventBus.dispatchEvent({ type: "VIEWER_READY", data: { viewer } });
        }
    }

    useEffect(() => {
        initializeViewer();

        return function cleanUp() {
            if (viewerRef.current) {
                viewerRef.current.finish();
            }
        };
    }, []);

    return <div id="forgeViewer" ref={viewerDomRef}></div>;
}

Viewer.displayName = "Viewer";
