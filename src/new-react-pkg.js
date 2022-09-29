// make context and provider to pass clickedTile and to button
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
var _this = this;
var Context = React.createContext(null);
var useClickedTile = function () {
    var context = React.useContext(Context);
    if (!context) {
        throw new Error("useClickedTile must be used within a ClickedTileProvider");
    }
    return context;
};
var ClickedTileProvider = function (_a) {
    var children = _a.children;
    var _b = React.useState(null), clickedTile = _b[0], setClickedTile = _b[1];
    return (<Context.Provider value={{ clickedTile: clickedTile, setClickedTile: setClickedTile }}>
      {children}
    </Context.Provider>);
};
var Button = function () {
    var _a = useClickedTile(), clickedTile = _a.clickedTile, setClickedTile = _a.setClickedTile;
    var _b = React.useState(clickedTile || 1), input = _b[0], setInput = _b[1];
    React.useEffect(function () {
        setInput(clickedTile || input);
    }, [clickedTile]);
    return (
    // make form for gettting tileId and set it to clickedTile
    <div>
      <input type="number" value={input} onChange={function (e) {
            setInput(e.target.valueAsNumber);
        }}/>
      <button onClick={function () {
            setClickedTile(input);
        }}>
        GoTo
      </button>
      <button onClick={function () {
            setClickedTile(0);
        }}>
        Back
      </button>
    </div>);
};
var makeInsideTile = function (tile, ratio, map) {
    if (ratio === void 0) { ratio = 100; }
    if (map === void 0) { map = [0, 0, 18, 0, 9, 63, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]; }
    return __awaiter(_this, void 0, void 0, function () {
        var meshWidth, meshHeight, tileHeight, tileWidth, tileNumber, texWidth, texHeight, rows, width, height, ctx, texture, drawFromMap, clear, drawTile, geometry, material, mesh;
        var _this = this;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    meshWidth = ratio * 1;
                    meshHeight = ratio * 1;
                    console.log(tile);
                    tileHeight = 64, tileWidth = 130, tileNumber = 4, texWidth = 130, texHeight = 230, rows = 9, width = tileWidth * tileNumber, height = tileWidth * tileNumber;
                    ctx = document.createElement("canvas").getContext("2d");
                    ctx.canvas.width = width;
                    ctx.canvas.height = height;
                    ctx.translate(width / 2, tileHeight * 2.5);
                    texture = new THREE.CanvasTexture(ctx.canvas);
                    drawFromMap = function (img, tileMap) {
                        clear();
                        tileMap.forEach(function (t, i) {
                            var x = Math.trunc(i / tileNumber);
                            var y = Math.trunc(i % tileNumber);
                            var row = Math.trunc(t / rows);
                            var col = Math.trunc(t % rows);
                            drawTile(img, x, y, row, col);
                        });
                    };
                    clear = function () {
                        ctx.clearRect(-width, -height, width * 2, height * 2);
                    };
                    drawTile = function (img, x, y, row, col) {
                        ctx.save();
                        ctx.translate(((y - x) * tileWidth) / 2, ((x + y) * tileHeight) / 2);
                        ctx.drawImage(img, row * texWidth, col * texHeight, texWidth, texHeight, -tileHeight, -tileWidth, texWidth, texHeight);
                        ctx.restore();
                    };
                    geometry = new THREE.PlaneGeometry(meshWidth, meshHeight);
                    material = new THREE.MeshBasicMaterial({
                        transparent: true,
                        map: texture
                    });
                    mesh = new THREE.Mesh(geometry, material);
                    return [4 /*yield*/, fetch("./Texture.png").then(function (image) { return __awaiter(_this, void 0, void 0, function () {
                            var img, _a;
                            return __generator(this, function (_b) {
                                switch (_b.label) {
                                    case 0:
                                        _a = createImageBitmap;
                                        return [4 /*yield*/, image.blob()];
                                    case 1: return [4 /*yield*/, _a.apply(void 0, [_b.sent()])];
                                    case 2:
                                        img = _b.sent();
                                        drawFromMap(img, map);
                                        texture.needsUpdate = true;
                                        return [2 /*return*/];
                                }
                            });
                        }); })];
                case 1:
                    _a.sent();
                    return [2 /*return*/, mesh];
            }
        });
    });
};
var GlobeWithTile = function (_a) {
    var globeEl = _a.globeEl, tiles = _a.tiles;
    var _b = useClickedTile(), clickedTile = _b.clickedTile, setClickedTile = _b.setClickedTile;
    var radius = 100.1;
    var _c = React.useMemo(function () {
        var ratio = radius / 450, geometry = new THREE.PlaneGeometry(12 * ratio, 12 * ratio), dotGeo = new THREE.BufferGeometry(), positionsArray = [], colorsArray = [], tilesIdsArray = [], vector = new THREE.Vector3();
        console.log("readed");
        tiles.forEach(function (_a) {
            var phi = _a.phi, theta = _a.theta, color = _a.color, id = _a.id;
            vector.setFromSphericalCoords(radius, phi, theta);
            dotGeo.copy(geometry);
            dotGeo.lookAt(vector);
            dotGeo.translate(vector.x, vector.y, vector.z);
            // convert number color into rgb vector3
            var rgb = new THREE.Color(color).toArray();
            for (var j = 0; j <= 3; j += 3) {
                for (var k = 0; k <= 6; k += 3) {
                    colorsArray.push.apply(colorsArray, rgb);
                    for (var l = 0; l < 3; l++) {
                        positionsArray.push(dotGeo.attributes.position.array[j + k + l]);
                        tilesIdsArray.push(id);
                    }
                }
            }
        });
        var positions = new THREE.Float32BufferAttribute(positionsArray, 3);
        var tilesIds = new THREE.Float32BufferAttribute(tilesIdsArray, 3);
        var colors = new THREE.Float32BufferAttribute(colorsArray, 3);
        return { positions: positions, tilesIds: tilesIds, colors: colors };
    }, [tiles]), positions = _c.positions, tilesIds = _c.tilesIds, colors = _c.colors;
    var material = React.useMemo(function () {
        return new THREE.ShaderMaterial({
            side: THREE.DoubleSide,
            uniforms: {
                time: { value: 1.0 },
                u_hovered: { value: 0 },
                u_clicked: { value: 0 }
            },
            vertexShader: "\n        uniform float u_hovered;\n        uniform float u_clicked;\n        uniform float time;\n        attribute vec3 color;\n        attribute float tileId;\n        varying vec3 vRndId;\n        void main() {\n          vRndId = color;\n          if(time > 0.0) {\n            if(tileId == u_hovered) {\n              vRndId = vec3(1.0, 0.0, 2.0);\n            }\n            if(tileId == u_clicked) {\n              vRndId = vec3(0.0, 1.0, 2.0);\n            }\n          }\n\n          if(u_hovered == tileId) {\n            vRndId = vec3(1.0, 0.0, 0.0);\n          }\n          if(u_clicked == tileId) {\n            vRndId = vec3(0.0, 0.0, 0.0);\n          }\n          vec4 modelViewPosition = modelViewMatrix * vec4(position, 1.0);\n          gl_Position = projectionMatrix * modelViewPosition;\n      }",
            fragmentShader: "\n        varying vec3 vRndId;\n        void main() {         \n          gl_FragColor = vec4(vRndId, 1);\n      }"
        });
    }, []);
    var points = React.useMemo(function () {
        var points = new THREE.BufferGeometry();
        points.setAttribute("position", positions);
        points.setAttribute("tileId", tilesIds);
        points.setAttribute("color", colors);
        return points;
    }, [positions, tilesIds, colors]);
    var rightClickHandler = React.useCallback(function () {
        setClickedTile(null);
    }, []);
    var clickHandler = React.useCallback(function (tileId) {
        setClickedTile(tileId);
    }, []);
    var hoverHandler = React.useCallback(function (tileId) {
        material.uniforms.u_hovered.value = tileId;
    }, []);
    return (<Globe ref={globeEl} rendererConfig={{ antialias: false }} height={700} onGlobeReady={function () {
            globeEl.current.controls().autoRotateSpeed = 0.1;
            globeEl.current.controls().autoRotate = true;
            globeEl.current.controls().enableDamping = true;
            globeEl.current.controls().dampingFactor = 0.1;
            globeEl.current.controls().minDistance = 99;
            globeEl.current.controls().maxDistance = 300;
        }} customLayerData={[{}]} customThreeObject={React.useCallback(function () { return new THREE.Mesh(points, material); }, [points, material])} customLayerLabel={React.useCallback(function () {
            var tileId = material.userData.tileId;
            return tileId
                ? "\n          <div style=\"border:1px solid; width: 70px; height: 25px; background: rgba(0, 0, 0, 0.5); color: white; display: flex; justify-content: center; align-items: center;\">\n            <b>".concat(tileId, "</b>\n          </div>\n        ")
                : null;
        }, [])} onCustomLayerHover={React.useCallback(function (_, _a) {
            var faceIndex = _a.faceIndex;
            return clickedTile ? undefined : hoverHandler(Math.floor(faceIndex / 2) + 1);
        }, [clickedTile])} onCustomLayerClick={React.useCallback(function (_, _a) {
            var faceIndex = _a.faceIndex;
            if (clickedTile)
                return;
            var tileId = Math.floor(faceIndex / 2) + 1;
            clickHandler(tileId);
        }, [clickedTile])} onCustomLayerRightClick={rightClickHandler} onGlobeRightClick={rightClickHandler}/>);
};
var App = function () {
    var _a = React.useState([]), tiles = _a[0], setTiles = _a[1];
    var texture = React.useRef(null);
    var globeEl = React.useRef();
    var cameraPov = React.useRef({ lat: 0, lng: 0, altitude: 2 });
    var clickedTile = useClickedTile().clickedTile;
    React.useEffect(function () {
        var fetchTiles = function () { return __awaiter(_this, void 0, void 0, function () {
            var res, tiles;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, fetch("./tiles.json")];
                    case 1:
                        res = _a.sent();
                        return [4 /*yield*/, res.json()];
                    case 2:
                        tiles = _a.sent();
                        setTiles(tiles);
                        return [2 /*return*/];
                }
            });
        }); };
        fetchTiles();
    }, []);
    React.useEffect(function () {
        console.log("clickedTile", clickedTile);
        var timer;
        if (clickedTile) {
            var tile_1 = tiles[clickedTile - 1];
            if (tile_1) {
                clearTimeout(timer);
                cameraPov.current = globeEl.current.pointOfView();
                globeEl.current.controls().autoRotate = false;
                globeEl.current.controls().enableZoom = false;
                globeEl.current.controls().enableRotate = false;
                globeEl.current.pointOfView({
                    lat: tile_1.lat,
                    lng: tile_1.lng,
                    altitude: -0.1
                }, 1000);
                var async = function () { return __awaiter(_this, void 0, void 0, function () {
                    var _a;
                    return __generator(this, function (_b) {
                        switch (_b.label) {
                            case 0:
                                globeEl.current.scene().remove(texture.current);
                                _a = texture;
                                return [4 /*yield*/, makeInsideTile(tile_1)];
                            case 1:
                                _a.current = _b.sent();
                                timer = setTimeout(function () {
                                    texture.current.lookAt(globeEl.current.camera().position);
                                    globeEl.current.scene().add(texture.current);
                                }, 1000);
                                return [2 /*return*/];
                        }
                    });
                }); };
                async();
            }
        }
        else {
            clearTimeout(timer);
            globeEl.current.controls().enableZoom = true;
            globeEl.current.controls().enableRotate = true;
            var _a = cameraPov.current, lat = _a.lat, lng = _a.lng, altitude = _a.altitude;
            globeEl.current.pointOfView({ lat: lat, lng: lng, altitude: altitude > 0.5 ? altitude : 0.5 }, 1000);
            timer = setTimeout(function () {
                globeEl.current.controls().autoRotate = true;
            }, 2000);
        }
        return function () {
            globeEl.current.pointOfView(cameraPov.current, 1000);
            clearTimeout(timer);
        };
    }, [clickedTile]);
    return (<div style={{ width: "100vw", height: "100vh" }}>
      <GlobeWithTile globeEl={globeEl} tiles={tiles}/>
      <Button />
    </div>);
};
ReactDOM.render(<ClickedTileProvider>
    <App />
  </ClickedTileProvider>, document.getElementById("globeViz"));
