module.exports = function (api) {
    api.cache(false);
    const presets = [
        [
            "@babel/preset-env",
            {
                corejs: { version: 3 },
                useBuiltIns: "usage",
            },
        ],
    ];
    const plugins = [
        ["@babel/plugin-proposal-decorators", { decoratorsBeforeExport: true }],
        ["@babel/plugin-proposal-class-properties"],
        ["@babel/transform-runtime"],
        ["@babel/plugin-transform-modules-commonjs"],
    ];
    return {
        presets,
        plugins,
    };
};
