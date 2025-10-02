const config = require('./config');
const OllamaClient = require('./ollamaClient');
const DeepSeekClient = require('./deepseekClient');

class AIProvider {
  static create() {
    const provider = config.provider;

    switch (provider) {
      case 'deepseek':
        console.log('Using DeepSeek AI provider');
        return new DeepSeekClient();
      case 'ollama':
      default:
        console.log('Using Ollama AI provider');
        return new OllamaClient();
    }
  }
}

module.exports = AIProvider;