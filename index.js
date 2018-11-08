const dotenv        = require('dotenv');
const fs            = require('fs');
const webpack       = require('webpack');


class WebpackDotEnvPlugin {

    constructor(options) {

        this._options = {
            path: './.env',
            blueprint: './.env.dist'
        };

        this._env = this.loadEnvFileData(this.options.path);

        // If this.env is object, normalize values
        if (typeof this.env === 'object') {

            this.env = Object.entries(this.env).reduce((obj, [key, value]) => {
                obj[key] = this.parseValue(value);
                return obj;
            }, {});
        }

        return new webpack.EnvironmentPlugin(this.env);
    }

    /**
     * @return {*}
     */
    get options() {
        return this._options;
    }

    /**
     * @param options
     */
    set options(options) {
        this._options = options;
    }

    /**
     * @return {*}
     */
    get env() {
        return this._env;
    }

    /**
     * @param vars
     */
    set env(vars) {
        this._env = vars;
    }

    /**
     * Load and parse environement data from file
     * @return {Object}
     */
    loadEnvFileData(path) {

        if (!fs.existsSync(path)) {
            return {};
        }

        return dotenv.parse(fs.readFileSync(path));
    }

    /**
     * Parse provided value to correct data type
     * @param {*} value
     * @return {*}
     */
    parseValue(value) {

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
            return JSON.stringify(value);
        }

        return value;
    }
}

module.exports = WebpackDotEnvPlugin;