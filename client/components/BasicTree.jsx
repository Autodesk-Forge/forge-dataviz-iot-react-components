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
import TreeView from "@material-ui/lab/TreeView";
import ArrowRightIcon from "@material-ui/icons/ArrowRight";
import ArrowDropDownIcon from "@material-ui/icons/ArrowDropDown";
import TreeItem from "@material-ui/lab/TreeItem";

/**
 * A basic tree structure component.
 * @component
 *
 * @param {Object} props
 * @param {string[]} props.expanded Array of expanded nodes
 * @param {string} props.selectedNodeId ID of the currently selected node
 * @param {Function} props.onLabelRequest Function to generate a label given a {@link TreeNode}
 * @param {Array.<TreeNode>} props.data Represents an array of hierarchical {@link TreeNode} to be rendered.
 * @param {Function} props.onIconClick Function to be invoked when the arrow icon is clicked
 * @param {Function} props.onLabelClick Function to be invoked when a label is clicked
 * @param {Function} props.onMouseOver Function to be invoked on the mouseover of a {@link TreeNode}
 * @param {Function} props.onMouseOut Function to be invoked when the mouse hovers off a {@link TreeNode}.
 * @param {Object} props.classes Styles to be applied to a {@link TreeNode}. See
 * &nbsp;{@link https://material-ui.com/api/tree-item/#css } for structure.
 *
 * @memberof Autodesk.Hyperion.UI
 * @alias Autodesk.Hyperion.UI.BasicTree
 */
function BasicTree(props) {
    function onEvent(handlerName, data) {
        return (event) => {
            if (props[handlerName]) {
                props[handlerName](event, data);
            }
        };
    }

    const classes = props.classes;

    /**
     *
     * @param {Object} node Represents a node in props.data
     * @returns {String[]} Returns the children if found for the given node. Returns [] otherwise.
     * @private
     */
    function getChildNodes(node) {
        if (Array.isArray(node.children)) {
            return node.children;
        }

        return [];
    }

    /**
     * Renders a row for the given node and its children, if any.
     *
     * @param {TreeNode} node Represents a node in props.data
     */
    const renderTree = (node) => (
        <TreeItem
            classes={{
                root: classes.root,
                selected: classes.selected,
                group: classes.group,
                content: node.children.length > 0 ? classes.categoryContent : classes.itemContent,
                label: node.children.length > 0 ? classes.categoryLabel : classes.itemLabel,
                iconContainer: classes.iconContainer,
            }}
            key={node.id}
            nodeId={node.id.toString()}
            onMouseOver={onEvent("onMouseOver", node)}
            onMouseOut={onEvent("onMouseOut", node)}
            onLabelClick={onEvent("onLabelClick", node)}
            onIconClick={onEvent("onIconClick", node)}
            label={props.onLabelRequest(node)}
        >
            {
                // Render only child nodes of the expanded node.
                getChildNodes(node).map((child) => renderTree(child))
            }
        </TreeItem>
    );

    return (
        <TreeView
            defaultCollapseIcon={<ArrowDropDownIcon />}
            defaultExpandIcon={<ArrowRightIcon />}
            expanded={props.expanded}
            selected={props.selectedNodeId}
        >
            {props.data.map((device) => renderTree(device))}
        </TreeView>
    );
}

module.exports = BasicTree;
