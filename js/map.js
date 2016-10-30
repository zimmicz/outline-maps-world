let current; // placeholder for the currently selected feature

loadData()
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


function init() {
    let map = L.map("map");
    let resultControl = L.control.result();
    let timerControl = L.control.timer({
        position: config.timer.position,
        timeout: config.timer.timeout
    });
    let answerControl = L.control.answer({
        onValidate: _checkAnswer
    });

    let firstFeature;

    timerControl.addTo(map);
    resultControl.addTo(map);
    answerControl.addTo(map);

    data.features = _shuffle(data.features);

    let layer = L.geoJSON(data, {
        style: (feature) => {
            return {
                color: config.colors.current,
                fill: true,
                fillColor: config.colors.current,
                fillOpacity: 0.3,
                weight: 1
            };
        },
        onEachFeature: _onEachFeature.bind(null, resultControl)
    });

    _addBasemap(map);
    layer.addTo(map);
    map.fitBounds(layer.getBounds());

    L.DomEvent.on(L.DomUtil.get("bm-answer-input"), "keydown", _validate);
}

function _onEachFeature(resultCtrl, feature, layer) {
    _addFeatureCheck(feature, layer);

    layer.on("click", (e) => {
        let progress = resultCtrl.showProgress();

        if (!progress.todo) {
            timerControl.stopTime();
        }
    });
}

/**
 * Provides mechanism to validate user input against the geoJSON properties
 * and act accordingly.
 * @param {object} feature
 * @param {object} layer
 */


function _validate(e) {
    if (e.keyCode !== 13) {
        return;
    }

    let value = e.target.value;
    let props = current.target.feature.properties;
    let result = _checkAnswer(value, current.target.feature);

    current.target.setStyle({
        color: result ? config.colors.right : config.colors.wrong,
        fillColor: result ? config.colors.right : config.colors.wrong
    });

    if (!props.retries || result) { // you ran out of retries
        current.target.clearAllEventListeners();
        props.done = true;
    }

    if (!props.retries && !result) {
        current.target.clearAllEventListeners();
        props.done = false;
    }
}

function _addFeatureCheck(feature, layer) {
    feature.properties.retries = config.retriesPerItem;
    feature.properties.done = null;

    layer.on("click", (e) => {
        L.DomUtil.get("bm-answer-input").focus();
        L.DomUtil.get("bm-answer-input").placeholder = "Type the name...";
        L.DomUtil.get("bm-answer-input").value = "";

        if (current && current.target.feature.properties.done === null) {
            current.target.setStyle({
                color: config.colors.current,
                fillColor: config.colors.current
            });
        }

        current = e;

        current.target.setStyle({
            color: config.colors.selected,
            fillColor: config.colors.selected
        });
    });
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
