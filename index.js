/*
 * @license
 * Copyright (c) 2015 ARODAX a.s.
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all
 * copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 * SOFTWARE.
 */

'use strict'

const dotenv = require('dotenv')
const fs = require('fs')
const webpack = require('webpack')

/**
 * This webpack plugin will parse .env files and load them using dotenv into webpack
 *
 * This will allow you to use process.env variables in your javascript files, these variables
 * will be parsed and replaced by resolved envrironment variables by dotenv plugin.
 *
 * @author Daniel Chodusov <daniel@chodusov.com>
 */
class WebpackDotEnvPlugin {
    /**
     *
     * @param {string} options.env The .env file to be loaded (default ./.env)
     * @param {string} options.blueprint The blueprint file to be loaded (default ./.env.dist)
     *
     * @return {webpack.EnvironmentPlugin}
     */
    constructor (options = { env: './.env', blueprint: './env.dist' }) {
        this.env = options.env
        this.blueprint = options.blueprint
        this.vars = {}

        if (typeof this.env !== 'string') {
            throw (Error('No valid .env file path has beeen provided'))
        }

        if (typeof this.blueprint !== 'string' && typeof this.blueprint !== 'undefined') {
            throw (Error('No valid blueprint file path has beeen provided'))
        }

        this.vars = Object.assign(this.loadEnvFileData(this.blueprint), this.loadEnvFileData(this.env))

        // If this.env is object, normalize values
        if (typeof this.vars === 'object') {
            this.vars = Object.entries(this.vars).reduce((obj, [key, value]) => {
                obj[key] = this.parseValue(value)
                return obj
            }, {})
        }

        return new webpack.EnvironmentPlugin(this.vars)
    }

    /**
     * Load and parse environement data from file
     * @return {Object}
     */
    loadEnvFileData (path) {
        if (!fs.existsSync(path)) {
            return {}
        }

        return dotenv.parse(fs.readFileSync(path))
    }

    /**
     * Parse provided value to correct data type
     * @param value
     * @return {*}
     */
    parseValue (value) {
        // Boolean
        if (value.toLowerCase() === 'true' || value.toLowerCase() === 'false') {
            return value === 'true'
        }

        // Number
        if (!isNaN(value)) {
            return Number(value)
        }

        // Array
        if (value.indexOf(',') !== -1) {
            return value.split(',').map(this.parseValue)
        }

        // Object
        if (typeof value === 'object') {
            return JSON.stringify(value)
        }

        return value
    }
}

module.exports = WebpackDotEnvPlugin