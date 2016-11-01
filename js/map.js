let _layers = [];

loadData()
    .then(welcome)
    .then(init)
    .catch((err) => {
        console.log(err);
    });

/**
 * Loads GeoJSON data from config.path into data variable.
 * @return {Promise}
 */
function loadData() {
    return new Promise((resolve, reject) => {
        let s = document.createElement("script");
        s.setAttribute("src", config.path);
        s.setAttribute("async", true);

        s.addEventListener("load", function() {
            resolve(`Data from ${config.path} loaded.`);
        });

        s.addEventListener("error", function() {
            reject(`Data from ${config.path} failed to load.`);
        });

        document.body.appendChild(s);
    });
}

function welcome() {
    return new Promise((resolve, reject) => {
        document.getElementById("play").addEventListener("click", (e) => {
            document.body.removeChild(document.getElementById("welcome"));
            resolve("Let's play!");
        });
    });
}


/**
 * Initializes the game.
 * @return {void}
 */
function init() {
    let map = L.map("map");
    let resultControl = L.control.result();
    let timerControl = L.control.timer({position: config.timer.position});
    let answerControl = L.control.answer({onValidate: _checkAnswer});

    let isFirstLoaded = false;

    timerControl.addTo(map);
    resultControl.addTo(map);
    answerControl.addTo(map);

    data.features = _shuffle(data.features);

    let layer = L.geoJSON(data, {
        style: (feature) => {
            let style = {
                fill: true,
                fillOpacity: 0.3,
                weight: 1
            };

            if (!isFirstLoaded) {
                isFirstLoaded = true; // add first item
                style.color = style.fillColor = config.colors.selected;
            } else {
                style.color = style.fillColor = config.colors.default;
            }

            return style;
        },
        onEachFeature: _onEachFeature
    });

    _addBasemap(map);
    layer.addTo(map);

    map.fitBounds(_layers[0].getBounds(), {
        maxZoom: 5
    });

    answerControl.focus();

    L.DomEvent.on(L.DomUtil.get("bm-answer-input"), "keydown", (e) => {
        _validate(e, map);
        _controlProgress(resultControl, timerControl);
    });
}


function _onEachFeature(feature, layer) {
    _layers.push(layer);
    _addTooltip(feature, layer);
    _addFeatureCheck(feature, layer);
}

function _addTooltip(feature, layer) {
    let content = ["<ul>"];

    for (let field of config.field) {
        content.push(`<li>${field}: <strong>${feature.properties[field]}</strong></li>`);
    }

    content.push("</ul>");

    layer.bindTooltip(content.join(""));
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
    if (e.keyCode !== 13 || !_layers[0]) {
        return;
    }

    let answer = e.target.value;
    let props = _layers[0].feature.properties;
    let result = _checkAnswer(answer, _layers[0].feature);

    _layers[0].setStyle({
        color: result ? config.colors.right : config.colors.wrong,
        fillColor: result ? config.colors.right : config.colors.wrong
    });


    if (!props.retries || result) { // you ran out of retries
        props.done = true;

    }

    if (!props.retries && !result) {
        props.done = false;
    }

    _layers.shift();

    if (_layers.length === 0) {
        return;
    }

    _layers[0].setStyle({
            color: config.colors.selected,
            fillColor: config.colors.selected
        });

    map.flyToBounds(_layers[0].getBounds(), {
        maxZoom: 5
    });

    L.DomUtil.get("bm-answer-input").focus();
    L.DomUtil.get("bm-answer-input").value = "";
}


function _addFeatureCheck(feature, layer) {
    feature.properties.retries = config.retriesPerItem;
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

    for (let attr of config.field) {
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
    if (!config.basemap) {
        return;
    }

    L.tileLayer('http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: 'Map data &copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors, <a href="http://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>',
            maxZoom: 18
        }).addTo(map);
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
