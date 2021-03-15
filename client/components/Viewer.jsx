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
/*eslint no-inner-declarations: "warn"*/
import React, { useEffect, useRef } from "react";

/**
 * @component
 * Component for rendering LMV
 * @param {Object} props
 * @param {("AutodeskProduction"|"AutodeskStaging")} env Forge API environment
 * @param {Function} getToken Returns the Forge API token to access LMV
 * @param {string} api Defines the derivative API used. Default = "derivativeV2"
 * @param {string} docUrn Document URN of model
 * @param {Function} onModelLoaded Callback function invoked when the model has loaded
 * @param {Function} onViewerInitialized Callback function invoked when LMV has been intialized
 * @memberof Autodesk.DataVisualization.UI
 * @alias Autodesk.DataVisualization.UI.Viewer
 */
function Viewer(props) {
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
     */
    function initializeViewer() {
        var options = {
            env: props.env,
            api: props.api || "derivativeV2", // for models uploaded to EMEA change this option to 'derivativeV2_EU'
            getAccessToken: async function (onTokenReady) {
                let token = await props.getToken();
                var timeInSeconds = 3600; // Use value provided by Forge Authentication (OAuth) API
                onTokenReady(token, timeInSeconds);
            },
        };

        Autodesk.Viewing.Initializer(options, async function () {
            const viewer = new Autodesk.Viewing.GuiViewer3D(viewerDomRef.current);
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
     */
    function loadModel(viewer, documentId) {
        function onDocumentLoadSuccess(viewerDocument) {
            // viewerDocument is an instance of Autodesk.Viewing.Document
            const defaultModel = viewerDocument.getRoot().getDefaultGeometry(true);
            viewer.loadDocumentNode(viewerDocument, defaultModel, { keepCurrentModels: true });

            // modify the preference settings, since ghosting is causing heavy z-fighting with the room geometry
            // it would be good we turn it off
            viewer.prefs.set("ghosting", false);
        }

        function onDocumentLoadFailure() {
            console.error("Failed fetching Forge manifest");
        }

        if (documentId) {
            Autodesk.Viewing.Document.load(documentId, onDocumentLoadSuccess, onDocumentLoadFailure);
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

module.exports = Viewer;
Viewer.displayName = "Viewer";
