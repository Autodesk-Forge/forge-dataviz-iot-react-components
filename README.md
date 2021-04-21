# forge-dataviz-iot-react-components

[![npm version](https://badge.fury.io/js/forge-dataviz-iot-react-components.svg)](https://badge.fury.io/js/forge-dataviz-iot-react-components)
![npm downloads](https://img.shields.io/npm/dw/forge-dataviz-iot-react-components.svg)
![platforms](https://img.shields.io/badge/platform-windows%20%7C%20osx%20%7C%20linux-lightgray.svg)
[![License](https://img.shields.io/badge/License-Apache%202.0-blue.svg)](https://opensource.org/licenses/Apache-2.0)

Re-usable React components used by the [Forge Dataviz IoT Reference App](https://github.com/Autodesk-Forge/forge-dataviz-iot-reference-app).

## Installing and Using the Modules

For full instructions for installing and running the Data Visualization Extension (Beta) Reference Application and supporting modules, see the [Data Visualization Extension (Beta) QuickStart](https://forge.autodesk.com/en/docs/dataviz/v1/developers_guide/quickstart/).

To install only this module:

```bash
npm install forge-dataviz-iot-react-components
```

To import the components:

```javascript
// To import the Viewer component
import { Viewer } from "dataviz-iot-react-components";

function SampleApp(props) {
    return (
        <Viewer
            env={env}
            docUrn={docUrn}
            api={api}
            onViewerInitialized={onViewerInitialized}
            onModelLoaded={onModelLoaded}
            getToken={getToken}
        />
    );
}
module.export = SampleApp;
```

## Contents

This package contains all of the React components used in the [Data Visualization Reference Application](https://github.com/Autodesk-Forge/forge-dataviz-iot-reference-app). 

NOTE: Most of these components were created using the [Material UI](http://material-ui.com/) framework.

### Components

-   BaseApp - Complete UI encompassing all of the following components:

![Component Mapping Image 1](https://github.com/Autodesk-Forge/forge-dataviz-iot-react-components/raw/main/images/component-mapping-p1.png)

-   BasicDatePicker - A date picker component that enables date selection via calendar input.
-   ChronosTimeSlider - Interactive timeslider based off the chronos-etu npm package
-   DataPanelContainer - Extendable panel that contains the DevicePanel and Dashboard
-   DevicePanel - Displays the DeviceTree and a search bar for a user to search through the devices.
-   DeviceStats - Chip components showing the icon and property value
-   DeviceTree - Hierarchical arrangement of devices
-   HeatmapOptions - Gradient slider and associated heatmap property and resolution selection options.
-   HyperionToolContainer - 2-button menu to show the Levels Tree and a panel containing device setting options.
-   Viewer - React component wrapper for Autodesk Forge Viewer.
-   BasicTree - Basic hierarchical tree structure used by DeviceTree and HyperionToolContainer.
-   EventTypes - Defines the events dispatched by the components.

![Component Mapping Image 2](https://github.com/Autodesk-Forge/forge-dataviz-iot-react-components/raw/main/images/component-mapping-p2.png)

-   CustomToolTip - A tooltip component that contains DataCharts for a specific device.
-   Dashboard - Shows chart data for each property associated with a device.
-   DataChart - A React Echarts instance representing the chart data for a property of a device.

For the API documentation for each component, see the Data Visualization (Beta) [API Reference](https://forge.autodesk.com/en/docs/dataviz/v1/reference/UI/)

## Troubleshooting:
If the styling for **BasicDatePicker** is missing, add the following line to import react-dates styles:

```javascript
import "react-dates/lib/css/_datepicker.css";
```
