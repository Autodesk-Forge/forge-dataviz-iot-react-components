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
import React from "react";
import BasicTree from "./BasicTree.jsx";
import Typography from "@material-ui/core/Typography";
import makeStyles from "@material-ui/core/styles/makeStyles";

const useStyles = makeStyles(() => ({
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
    },
}));

/**
 * A tree component used to display a list of levels.
 *
 * @component
 * @param {Object} props
 * @param {TreeNode[]} props.data Array of {@link TreeNode} representing levels in the model.
 * @param {OnMouseEvent} props.onMouseOver Called when a user hovers over a level.
 * @param {OnMouseEvent} props.onMouseOut Called when a user removes the cursor from a level.
 * @param {OnMouseEvent} props.onLabelClick Called when a user selects a level.
 * @param {OnMouseEvent} props.onIconClick Called when a user expands/closes a grouping.
 * @param {string} props.expandedNodeId Identifier of node to be expanded.
 * @param {string} props.selectedNode Identifier of selected node
 * @memberof Autodesk.DataVisualization.UI
 * @alias Autodesk.DataVisualization.UI.LevelsTree
 */
function LevelsTree(props) {
    const styles = useStyles();

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
        <BasicTree
            expanded={props.expandNodeId}
            selectedNodeId={props.selectedNode}
            onLabelRequest={createLabel}
            data={props.data}
            onMouseOver={props.onMouseOver}
            onMouseOut={props.onMouseOut}
            onIconClick={props.onIconClick}
            onLabelClick={props.onLabelClick}
            classes={styles}
        />
    );
}

module.exports = LevelsTree;
