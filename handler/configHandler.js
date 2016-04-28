var handler = {
    initConfig: function (config) {
        var config = {
            alias: config.alias || {},
            modulesDirectories: config.modulesDirectories || {},
            extensions: config.extensions || {}
        }

        return config;
    }
}

module.exports = handler;