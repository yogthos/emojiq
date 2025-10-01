// Mock Browser API's which are not supported by JSDOM, e.g. ServiceWorker, LocalStorage

// Add missing globals for Jest
if (typeof global.TextEncoder === 'undefined') {
  const { TextEncoder, TextDecoder } = require('util');
  global.TextEncoder = TextEncoder;
  global.TextDecoder = TextDecoder;
}

// Mock ReadableStream for Jest environment
if (typeof global.ReadableStream === 'undefined') {
  global.ReadableStream = class ReadableStream {
    constructor() {
      this.locked = false;
    }

    getReader() {
      return {
        read: () => Promise.resolve({ done: true, value: undefined }),
        releaseLock: () => {},
        closed: Promise.resolve()
      };
    }

    cancel() {
      return Promise.resolve();
    }
  };
}

// Mock MessagePort for Jest environment
if (typeof global.MessagePort === 'undefined') {
  global.MessagePort = class MessagePort {
    constructor() {
      this.onmessage = null;
      this.onmessageerror = null;
    }

    postMessage() {}
    start() {}
    close() {}

    addEventListener() {}
    removeEventListener() {}
    dispatchEvent() { return true; }
  };
}

// Mock MessageChannel for Jest environment
if (typeof global.MessageChannel === 'undefined') {
  global.MessageChannel = class MessageChannel {
    constructor() {
      this.port1 = new global.MessagePort();
      this.port2 = new global.MessagePort();
    }
  };
}

// Mock AbortController for Jest environment
if (typeof global.AbortController === 'undefined') {
  global.AbortController = class AbortController {
    constructor() {
      this.signal = {
        aborted: false,
        addEventListener: () => {},
        removeEventListener: () => {},
        dispatchEvent: () => true
      };
    }

    abort() {
      this.signal.aborted = true;
    }
  };
}

// Mock fetch for Jest environment
if (typeof global.fetch === 'undefined') {
  global.fetch = jest.fn(() =>
    Promise.resolve({
      ok: true,
      status: 200,
      json: () => Promise.resolve({}),
      text: () => Promise.resolve(''),
      headers: new Map()
    })
  );
}

/**
 * An example how to mock localStorage is given below 👇
 */

/*
// Mocks localStorage
const localStorageMock = (function() {
	let store = {};

	return {
		getItem: (key) => store[key] || null,
		setItem: (key, value) => store[key] = value.toString(),
		clear: () => store = {}
	};

})();

Object.defineProperty(window, 'localStorage', {
	value: localStorageMock
}); */
