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
                file: pkg.main,
                format: 'cjs',
                exports: 'named',
                sourcemap: true
            },
            {
                file: pkg.module,
                format: "es",
                exports: 'named',
                sourcemap: true
            }
        ],
        external: [
            ...Object.keys(pkg.devDependencies || {}),
            ...['os', 'fs', 'util', 'assert', 'events', 'stream', 'module', 'path', 'perf_hooks']
        ],
        plugins: [
            nodeResolve({browser: false}),
            json(),
            typescript({
                rollupCommonJSResolveHack: true,
                exclude: 'test',
                clean: true
            }),
            commonjs({
                include: /node_modules/,
                namedExports: {
                    'node_modules/lodash/lodash.js': [
                        'isFinite',
                        'isString',
                        'isNumber',
                        'isObject',
                        'isArray',
                        'isFunction',
                        'isEmpty',
                        'isUndefined',
                        'isBoolean',
                        'get'
                    ],
                    'node_modules/bunyan/lib/bunyan.js': [
                        'stdSerializers'
                    ]
                }
            })
        ]
    }
];
