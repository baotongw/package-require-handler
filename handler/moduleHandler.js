var filesys = require('fs'),
	pathsys = require('path');

var patterns = {
	singleLineComment: /(?:^|\n|\r)\s*\/\/.*(?:\r|\n|$)/g,
	multiLineComment: /(?:^|\n|\r)\s*\/\*[\s\S]*?\*\/\s*(?:\r|\n|$)/g
}

function ModuleHandler(rootFolder, config) {
	this.config = config;

	this.moduleDirectories = config.modulesDirectories || [];

	this.rootFolder = rootFolder || process.cwd();

	this.sourceCfg = {
		'fekit_modules': {
			configFile: 'fekit.config',
			defaultEntry: '/src/index.js'
		},
		'node_modules': {
			configFile: 'package.json',
			defaultEntry: '/index.js'
		}
	}
}

ModuleHandler.prototype.readConfig = function(moduleType, moduleName, moduleConfig) {
	var configFilePath = pathsys.join(this.rootFolder, moduleType, moduleName, moduleConfig.configFile);

	var configInfo = filesys.readFileSync(configFilePath, 'utf-8');
    if(configInfo) {
        // remove comment
        configInfo.replace(patterns.singleLineComment, '\n').replace(patterns.multiLineComment, '\n');
        return JSON.parse(configInfo);    
    }
    
	return null;
}

// 获取module的入口文件，如果没有在配置文件中指定main，则使用默认的起始文件来处理
ModuleHandler.prototype.getIndexPath = function(moduleName) {
	var dir,
		stat,
		moduleType,
		moduleConfig,
        configInfo,
		self = this;

	this.moduleDirectories.forEach(function(v) {
		dir = pathsys.join(self.rootFolder, v, moduleName);

		// stat = filesys.statSync(dir);
		if(filesys.existsSync(dir)) {
			moduleType = v;
			moduleConfig = self.sourceCfg[v];
			return true;
		}
	});
    
    if(moduleConfig) {
        configInfo = this.readConfig(moduleType, moduleName, moduleConfig);
        
        if(configInfo) {
            return pathsys.join(this.rootFolder, moduleType, moduleName, configInfo.main || moduleConfig.defaultEntry);    
        }            
    }

	return null;
}

module.exports = ModuleHandler;