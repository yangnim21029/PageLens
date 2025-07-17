/**
 * Jest 測試設置文件
 */

import { JSDOM } from 'jsdom';

// 設置測試超時
jest.setTimeout(30000);

// 設置環境變量
process.env.NODE_ENV = 'test';
process.env.WP_ARTICLE_SEO_URL = 'https://test-api.example.com/seo';
process.env.WP_ARTICLE_URL = 'https://test-api.example.com/article';
process.env.WP_TIMEOUT = '30000';
process.env.PORT = '3001';

// 設置 JSDOM 環境
const dom = new JSDOM('<!DOCTYPE html><html><body></body></html>', {
  url: 'http://localhost',
  pretendToBeVisual: false,
  resources: 'usable'
});

global.window = dom.window as any;
global.document = dom.window.document;
global.navigator = dom.window.navigator;
global.HTMLElement = dom.window.HTMLElement;
global.Element = dom.window.Element;
global.Document = dom.window.Document;

// 模擬 console 輸出（減少測試噪音）
global.console = {
  ...console,
  log: jest.fn(),
  warn: jest.fn(),
  error: jest.fn()
};