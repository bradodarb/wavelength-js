import json from "rollup-plugin-json";
import typescript from "rollup-plugin-typescript2";
import commonjs from "rollup-plugin-commonjs";
import nodeResolve from "rollup-plugin-node-resolve";

import pkg from "./package.json";

export default [
    {
        input: `src/${pkg.libraryFile}.ts`,
        output: [
            {
                file: pkg.module,
                format: "es",
                sourcemap: true
            }
        ],
        external: [
            ...Object.keys(pkg.devDependencies || {}),
            ...['os','fs', 'util','assert','events','stream']
        ],
        plugins: [
            nodeResolve({browser:false}),
            json(),
            typescript({
                typescript: require("typescript")
            }),
            commonjs({
                include: /node_modules/,
                namedExports: {
                    'node_modules/lodash/lodash.js': [
                        'isFinite',
                        'isString',
                        'isNumber',
                        'isObject',
                        'isArray'
                    ]
                }
            }),
        ]
    }
];
