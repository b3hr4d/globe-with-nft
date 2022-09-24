"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const fs_1 = require("fs");
const jsdom_1 = __importDefault(require("jsdom"));
const THREE = __importStar(require("three"));
const { window } = new jsdom_1.default.JSDOM();
global.window = window;
global.document = window.document;
class ThreeClass {
    renderer;
    camera;
    scene;
    constructor() {
        this.renderer = new THREE.WebGLRenderer({
            alpha: true,
            antialias: true,
            preserveDrawingBuffer: true,
        });
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.renderer.setPixelRatio(window.devicePixelRatio);
        this.camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
        this.camera.position.z = 2;
        this.scene = new THREE.Scene();
    }
}
const selectRandom = (chance = 100) => Math.random() * 100 < chance;
const length = 10000;
const config = {
    tilesColor: [0x499b4a, 0xfffafa, 0x87ceeb, 0xfbd6a6],
    raidus: 100,
    ratio: 1,
    tileLength: 10000 + 1,
};
const tilesData = Array.from({ length }, (_, i) => {
    const randomType = [60, 20, 15, 5].reduce((acc, cur, index) => (selectRandom(cur) ? index : acc), 0);
    const id = i + 1;
    const color = config.tilesColor[randomType];
    const phi = Math.acos(-1 + (2 * id) / config.tileLength);
    const theta = Math.sqrt(config.tileLength * Math.PI) * phi;
    const lat = Math.round(90 - (180 * phi) / Math.PI);
    const lng = Math.round((180 * theta) / Math.PI);
    return { id, color, phi, theta, lat, lng };
});
// save tilesData to json file
(0, fs_1.writeFile)("tilesData.json", JSON.stringify(tilesData), (err) => {
    if (err)
        throw err;
    console.log("The file has been saved!");
});
