const MiniCssExtractPlugin = require('mini-css-extract-plugin')
const Path = require("path");

var env = process.env.ENV || "local";
const isDevEnv = /^(local|dev|develop)$/gi.test(env);
const sourceMapOptions = isDevEnv ? "eval-cheap-module-source-map" : false;

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
                    options: {
                        presets: ["@babel/react", ["@babel/env", { "targets": "defaults" }]],
                        plugins: ["@babel/plugin-transform-spread"]
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
                        },
                    },
                },
            ],
        },
    },
    {
        entry: ["./node_modules/react-dates/lib/css/_datepicker.css", "./scss/components.scss"],
        output: {
            path: __dirname + "/dist",
            libraryTarget: "umd",
            library: "hyperion",
            globalObject: "this",
        },
        mode: "development",
        module: {
            rules: [
                {
                    test: /\.(css|sass|scss)$/,
                    use: [
                        MiniCssExtractPlugin.loader,
                        {
                            loader: "css-loader",
                        },
                        {
                            loader: "sass-loader",
                        },
                    ],
                },
            ],
        },
        plugins: [
            new MiniCssExtractPlugin({
                filename: "[name].bundle.css"
            }),
        ],
    },
];

module.exports = config;
