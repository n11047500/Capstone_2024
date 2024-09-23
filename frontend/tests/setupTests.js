// Jest setup file to extend expect with jest-dom matchers
import '@testing-library/jest-dom';
import { TextEncoder, TextDecoder } from 'util';
import fetch from 'cross-fetch';


global.TextEncoder = TextEncoder;
global.TextDecoder = TextDecoder;
global.fetch = fetch;

global.Response = fetch.Response;
global.Request = fetch.Request;