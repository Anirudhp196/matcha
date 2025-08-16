import { Buffer } from "buffer";

window.Buffer = Buffer;
window.process = {
  env: { NODE_ENV: process.env.NODE_ENV || "development" },
};

// Add global fallbacks for Node.js modules
if (typeof global === 'undefined') {
  window.global = window;
}

// Simple polyfills to avoid webpack errors
window.require = window.require || (() => ({}));

// Mock stream module if needed
const mockStream = {
  Readable: class Readable {
    constructor() {}
    pipe() { return this; }
    on() { return this; }
    emit() { return this; }
  },
  Writable: class Writable {
    constructor() {}
    write() { return true; }
    end() { return this; }
    on() { return this; }
  }
};

// Make stream available globally
window.stream = mockStream;
if (typeof require !== 'undefined') {
  try {
    require.cache = require.cache || {};
    require.cache['stream'] = { exports: mockStream };
  } catch (e) {
    // Ignore errors
  }
}
