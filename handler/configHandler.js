var handler = {
    initConfig: function (config) {
        var fixedConfig = {
            alias: config.alias || {},
            modulesDirectories: config.modulesDirectories || {},
            extensions: config.extensions || {}
        }

        return fixedConfig;
    }
}

module.exports = handler;