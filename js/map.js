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
    return window.localStorage.getItem(storageKey);
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
    let map = L.map("map");
    let resultControl = L.control.result();
    let timerControl = L.control.timer({position: config.timer.position});

    let isFirstLoaded = false;

    timerControl.addTo(map);
    resultControl.addTo(map);

    data.features = _shuffle(data.features);

    let layer = L.geoJSON(data, {
        style: (feature) => {
            let style = {
                fill: true,
                fillOpacity: 0.3,
                weight: 1
            };

            if (!isFirstLoaded && !isInverse()) {
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
        layer.on("click", _validate);
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

    for (let field of config.field) {
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

    let answer = isInverse() ? e.target.feature.properties[config.field[0]] : e.target.value;
    let props = _layers[0].feature.properties;
    let isRightAnswer = _checkAnswer(answer, _layers[0].feature);

    _layers[0].setStyle({
        color: isRightAnswer ? config.colors.right : config.colors.wrong,
        fillColor: isRightAnswer ? config.colors.right : config.colors.wrong
    });


    if (!props.retries || isRightAnswer) { // you ran out of retries
        props.done = true;

    }

    if (!props.retries && !isRightAnswer) {
        props.done = false;
    }

    _layers.shift();

    if (_layers.length === 0) {
        return;
    }

    if (!isInverse()) {
        _layers[0].setStyle({
                color: config.colors.selected,
                fillColor: config.colors.selected
            });

        map.flyToBounds(_layers[0].getBounds(), {
            maxZoom: 5
        });
    }

    L.DomUtil.get("bm-answer-input").focus();
    L.DomUtil.get("bm-answer-input").value = "";
    L.DomUtil.get("bm-answer-input").innerHTML =_layers[0].feature.properties[config.field[0]];
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
