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
var ExtractTextPlugin = require("extract-text-webpack-plugin");
const Path = require("path");

var env = process.env.ENV || "local";
const isDevEnv = /^(local|dev|develop)$/gi.test(env);
const sourceMapOptions = isDevEnv ? "eval-cheap-module-source-map" : "none";

var config = [
    {
        entry: {
            bundle: "./client/app.js",
        },
        devtool: sourceMapOptions,
        output: {
            filename: "[name].js",
            path: __dirname + "/dist",
            libraryTarget: "umd",
            library: "hyperion",
            globalObject: "this",
        },
        mode: "development",
        externals: {
            three: "THREE",
            react: "react",
            "react-dom": "react-dom",
        },
        resolve: {
            alias: {
                PIXI: Path.resolve(__dirname, "node_modules/pixi.js/"),
            },
        },
        module: {
            rules: [
                {
                    test: /.jsx?$/,
                    loader: "babel-loader",
                    exclude: Path.resolve(__dirname, "node_modules"),
                    query: {
                        presets: ["react", "es2015"],
                        plugins: ["transform-object-rest-spread"],
                    },
                },
                {
                    test: /\.(css|sass|scss)$/,
                    use: [
                        {
                            loader: "css-loader",
                        },
                        {
                            loader: "sass-loader",
                        },
                    ],
                },
                {
                    test: /\.svg$/i,
                    use: {
                        loader: "svg-url-loader",
                        options: {
                            // loader behaves like url-loader for all svg files
                            encoding: "base64",
                        }
                    }
                }
            ],
        },
    },
    {
        entry: ["./scss/components.scss"],
        output: {
            filename: "[name].bundle.css",
            path: __dirname + "/dist",
            libraryTarget: "umd",
            library: "hyperion",
            globalObject: "this",
        },
        mode: "development",

        externals: {
            three: "THREE",
            react: {
                commonjs: "react",
                commonjs2: "react",
                amd: "React",
                root: "React",
            },
            "react-dom": {
                commonjs: "react-dom",
                commonjs2: "react-dom",
                amd: "ReactDOM",
                root: "ReactDOM",
            },
        },
        resolve: {
            alias: {
                react: Path.resolve(__dirname, "./node_modules/react"),
                "react-dom": Path.resolve(__dirname, "./node_modules/react-dom"),
            },
        },
        module: {
            rules: [
                {
                    test: /\.(css|sass|scss)$/,
                    use: ExtractTextPlugin.extract({
                        use: [
                            {
                                loader: "css-loader",
                            },
                            {
                                loader: "sass-loader",
                            },
                        ],
                    }),
                },
            ],
        },
        plugins: [
            new ExtractTextPlugin({
                filename: "[name].bundle.css",
                allChunks: true,
            }),
        ],
    },
];

module.exports = config;
