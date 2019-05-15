module.exports = {
    presets: [
        '@vue/app',
        [
            '@babel/preset-env',
            {
                targets: {
                    node: 'current',
                },
            },
        ],
        '@babel/preset-flow',
    ],
    ignore: ['node_modules', 'dist'],
};
