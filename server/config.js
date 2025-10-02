const fs = require('fs');
const path = require('path');

class Config {
  constructor() {
    this.configPath = path.join(__dirname, 'config.json');
    this.defaultConfig = {
      provider: 'ollama',
      ollama: {
        baseUrl: 'http://localhost:11434',
        model: 'qwen3:1.7b'
      },
      server: {
        port: 3001
      },
      database: {
        path: path.join(__dirname, 'phrases.db')
      }
    };
    this.config = this.loadConfig();
  }

  loadConfig() {
    try {
      if (fs.existsSync(this.configPath)) {
        const configData = fs.readFileSync(this.configPath, 'utf8');
        const userConfig = JSON.parse(configData);

        // Merge user config with defaults
        return this.deepMerge(this.defaultConfig, userConfig);
      } else {
        // Create default config file
        this.saveConfig(this.defaultConfig);
        console.log(`Created default config file at ${this.configPath}`);
        return this.defaultConfig;
      }
    } catch (error) {
      console.error('Error loading config file, using defaults:', error.message);
      return this.defaultConfig;
    }
  }

  saveConfig(config) {
    try {
      fs.writeFileSync(this.configPath, JSON.stringify(config, null, 2));
    } catch (error) {
      console.error('Error saving config file:', error.message);
    }
  }

  deepMerge(target, source) {
    const result = { ...target };

    for (const key in source) {
      if (source[key] && typeof source[key] === 'object' && !Array.isArray(source[key])) {
        result[key] = this.deepMerge(result[key] || {}, source[key]);
      } else {
        result[key] = source[key];
      }
    }

    return result;
  }

  get(key) {
    const keys = key.split('.');
    let value = this.config;

    for (const k of keys) {
      if (value && typeof value === 'object' && k in value) {
        value = value[k];
      } else {
        return undefined;
      }
    }

    return value;
  }

  set(key, value) {
    const keys = key.split('.');
    let config = this.config;

    for (let i = 0; i < keys.length - 1; i++) {
      const k = keys[i];
      if (!(k in config)) {
        config[k] = {};
      }
      config = config[k];
    }

    config[keys[keys.length - 1]] = value;
    this.saveConfig(this.config);
  }

  // Convenience getters
  get provider() {
    return this.get('provider');
  }

  get ollamaBaseUrl() {
    return this.get('ollama.baseUrl');
  }

  get ollamaModel() {
    return this.get('ollama.model');
  }

  get deepseekBaseUrl() {
    return this.get('deepseek.baseUrl');
  }

  get deepseekModel() {
    return this.get('deepseek.model');
  }

  get serverPort() {
    return this.get('server.port');
  }

  get databasePath() {
    return this.get('database.path');
  }
}

module.exports = new Config();