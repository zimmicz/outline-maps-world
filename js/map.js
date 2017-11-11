"use strict";

let _layers = [];

loadData()
    .then(welcome)
    .then(init)
    .catch((err) => {
        console.log(err);
        showHomepage();
    });


function showHomepage() {
    document.querySelector("#map").style.display = "none";
    const table = document.querySelector("#list table");

    for (let map of Object.entries(CONFIG)) {
        let tr = document.createElement("tr");
        let name = document.createElement("td");
        name.innerHTML = map[1].name;
        tr.appendChild(name);
        tr.innerHTML += `<td><a href='/?inverse&map=${map[0]}'>Find by name</a></td>`
        tr.innerHTML += `<td><a href='/?map=${map[0]}'>Find by feature</a></td>`
        table.appendChild(tr);
    }
}


/**
 * Loads GeoJSON data from config.path into data variable.
 * @return {Promise}
 */
function loadData() {
    return new Promise((resolve, reject) => {
        if (!CONFIG_COMMON.MAP_CONFIG()) {
            reject("Map config not found: defaulting to list of maps.");
        }
        let s = document.createElement("script");
        s.setAttribute("src", CONFIG_COMMON.MAP_CONFIG().path);
        s.setAttribute("async", true);

        s.addEventListener("load", function() {
            resolve(`Data from ${CONFIG_COMMON.MAP_CONFIG().path} loaded.`);
        });

        s.addEventListener("error", function() {
            reject(`Data from ${CONFIG_COMMON.MAP_CONFIG().path} failed to load.`);
        });

        document.body.appendChild(s);
    });
}


/**
 * Shows welcome screen and waits for user to hit the start button.
 * @return {Promise}
 */
function welcome() {
    return new Promise((resolve, reject) => {
        let welcome = document.getElementById("welcome");

        if (_getSettings()) {
            document.body.removeChild(welcome);
            resolve("Let's play!");
        }

        welcome.style.display = "block";
        document.getElementById("play").addEventListener("click", (e) => {
            _saveSettings();
            document.body.removeChild(welcome);
            resolve("Let's play!");
        });
    });
}


function _getSettings() {
    let storageKey = "remember" + (isInverse() ? "Inverse" : "");
    return window.localStorage.getItem(storageKey) == "true";
}


function _saveSettings() {
    let remember = document.getElementById("remember");
    let storageKey = "remember" + (isInverse() ? "Inverse" : "");

    remember.checked
        ? window.localStorage.setItem(storageKey, true)
        : window.localStorage.setItem(storageKey, false);
}


/**
 * Decides what type of game the user is playing.
 * True means we're guessing features by names.
 * False means we're guessing names by features.
 * @return {Boolean}
 */
function isInverse() {
    return window.location.href.indexOf("inverse") > -1;
}


/**
 * Initializes the game.
 * @return {void}
 */
function init() {
    document.querySelector("#list").style.display = "none";

    let map = L.map("map", {
        zoomSnap: 0.2
    });
    let resultControl = L.control.result();
    let timerControl = L.control.timer({position: CONFIG_COMMON.timer.position});

    let isFirstLoaded = false;

    timerControl.addTo(map);
    resultControl.addTo(map);

    data.features = _shuffle(data.features);

    let layer = L.geoJSON(data, {
        attribution: CONFIG_COMMON.MAP_CONFIG().attribution,
        style: (feature) => {
            let _style = {
                fill: true,
                fillOpacity: 0.4,
                weight: 1
            };

            if (!isFirstLoaded && !isInverse()) {
                isFirstLoaded = true; // add first item
                _style = Object.assign(_style, style("selected"));
            } else {
                _style = Object.assign(_style, style("default"));
            }

            return _style;
        },
        onEachFeature: _onEachFeature,
        pointToLayer: (point, latlng) => {
            return L.circleMarker(latlng).setRadius(5);
        }
    });

    _addBasemap(map);
    layer.addTo(map);

    isInverse()
        ? map.fitBounds(layer.getBounds())
        : map.fitBounds(_layers[0].getBounds(), {maxZoom: 5});

    let answerControl = L.control.answer({onValidate: _checkAnswer, inverse: isInverse(), layers: _layers});
    answerControl.addTo(map);
    answerControl.focus();

    if (isInverse()) {
        map.on("click", (e) => {
            _controlProgress(resultControl, timerControl);
        });
    }

    L.DomEvent.on(L.DomUtil.get("bm-answer-input"), "keydown", (e) => {
        _validate(e, map);
        _controlProgress(resultControl, timerControl);
    });
}


/**
 * Stores features in the global array.
 * Attaches tooltips to features.
 * Adds answer checks to features.
 * @param  {object} feature
 * @param  {object} layer
 * @return {void}
 */
function _onEachFeature(feature, layer) {
    _layers.push(layer);
    _addTooltip(feature, layer);
    _addFeatureCheck(feature, layer);

    if (isInverse()) {
        _highlight(feature, layer);
        layer.on("click", _validate);
    }
}


/**
 * Returns style by its name.
 * @param  {string} key
 * @return {object}
 */
function style(key) {
    return {
        color: CONFIG_COMMON.colors[key],
        fillColor: CONFIG_COMMON.colors[key]
    };
}


/**
 * Adds feature highlighting.
 * @param  {object} feature
 * @param  {object} layer
 * @return {void}
 */
function _highlight(feature, layer) {
    layer.on("mouseover", (e) => {
        !_isDone(e) ? layer.setStyle(style("selected")) : null;
    });

    layer.on("mouseout", (e) => {
        !_isDone(e) ? layer.setStyle(style("default")) : null;
    });

    function _isDone(e) {
        return typeof e.target.feature.properties.done === "boolean";
    }
}


/**
 * Adds tooltip to map features.
 * Tooltip is only shown once all the features were answered.
 * @param {object} feature
 * @param {object} layer
 */
function _addTooltip(feature, layer) {
    let content = ["<ul>"];

    for (let field of CONFIG_COMMON.MAP_CONFIG().field) {
        content.push(`<li>${field}: <strong>${feature.properties[field]}</strong></li>`);
    }

    content.push("</ul>");

    layer.bindTooltip(content.join(""));
    layer.off("click"); // keep tooltip hidden
    layer.on("mouseover", (e) => {
        if (_layers.length > 0) {
            layer.closeTooltip();
        }
    });
}


function _controlProgress(resultCtrl, timerCtrl) {
    let progress = resultCtrl.showProgress();
    if (!progress.todo) {
        timerCtrl.stopTime();
    }
}


/**
 * Provides mechanism to validate user input against the geoJSON properties
 * and act accordingly.
 * @param {object} feature
 * @param {object} layer
 */
function _validate(e, map) {
    if (!isInverse() && e.keyCode !== 13 || !_layers[0]) {
        return;
    }

    let answer = isInverse() ? e.target.feature.properties[CONFIG_COMMON.MAP_CONFIG().field[0]] : e.target.value;
    let props = _layers[0].feature.properties;
    let isRightAnswer = _checkAnswer(answer, _layers[0].feature);

    _layers[0].setStyle(style(isRightAnswer ? "right" : "wrong"));


    if (props.retries < 0 || isRightAnswer) { // you ran out of retries
        props.done = true;
    }

    if (props.retries < 0 && !isRightAnswer) {
        props.done = false;
    }

    _layers.shift();

    if (_layers.length === 0) {
        return;
    }

    if (!isInverse()) {
        _layers[0].setStyle(style("selected"));
        map.flyToBounds(_layers[0].getBounds(), {maxZoom: 5});
    }

    L.DomUtil.get("bm-answer-input").focus();
    L.DomUtil.get("bm-answer-input").value = "";
    L.DomUtil.get("bm-answer-input").innerHTML =_layers[0].feature.properties[CONFIG_COMMON.MAP_CONFIG().field[0]];
}


function _addFeatureCheck(feature, layer) {
    feature.properties.retries = CONFIG_COMMON.MAP_CONFIG().retriesPerItem;
    feature.properties.done = null;
}


/**
 * Checks the answer against the attribute value(s).
 * @param  {string} value      [user provided value]
 * @param  {object} feature    [feature]
 * @return {boolean}
 */
function _checkAnswer(value, feature) {
    let result = false;
    feature.properties.retries -= 1;

    for (let attr of CONFIG_COMMON.MAP_CONFIG().field) {
        if (feature.properties[attr].toLowerCase().trim() !== value.toLowerCase().trim()) {
            continue;
        }

        result = true;
    }

    return result;
}


/**
 * Decides whether to add basemap or not
 * @param {L.map} map
 */
function _addBasemap(map) {
    if (!CONFIG_COMMON.MAP_CONFIG().basemap) {
        return;
    }

    const basemap = L.tileLayer(CONFIG_COMMON.basemap.url, {
        attribution: CONFIG_COMMON.basemap.attribution
    });

    map.addLayer(basemap);
}


/**
 * Shuffles input data.
 * @param  {array} array
 * @return {array}
 */
function _shuffle(array) {
    for (let i = array.length - 1; i > 0; i -= 1) {
        let j = Math.floor(Math.random() * (i + 1));
        let temp = array[i];
        array[i] = array[j];
        array[j] = temp;
    }

    return array;
}


/**
 * Adds getBounds method to L.CircleMarker.
 * @return {L.latLngBounds}
 */
L.CircleMarker.prototype.getBounds = function() {
    return L.latLngBounds([this.getLatLng()], [this.getLatLng]);
}
