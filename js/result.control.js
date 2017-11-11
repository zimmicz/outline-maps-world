L.Control.Result = L.Control.extend({
    options: {
        position: "topright"
    },

    initialize: function(options) {
        L.setOptions(this, options);
        this.result = {
            todo: GEOJSON_DATA.features.length,
            done: 0,
            right: 0,
            wrong: 0
        };
    },

    onAdd: function(map) {
        let container = L.DomUtil.create("div", "bm-result");

        L.DomEvent.disableClickPropagation(container);
        L.DomEvent.disableScrollPropagation(container);

        this.container = container;
        this._getProgress();
        return container;
    },

    /**
     * Gets statistics of todo/done and right/wrong answers.
     * @return {object}
     */
    showProgress: function() {
        this.result = {
            todo: GEOJSON_DATA.features.length,
            done: 0,
            right: 0,
            wrong: 0
        };

        GEOJSON_DATA.features.forEach((item) => {
            if (item.properties.done) {
                this.result.done += 1;
                this.result.todo -= 1;
                this.result.right += 1;
            }

            if (item.properties.done === false) {
                this.result.done += 1;
                this.result.todo -= 1;
                this.result.wrong += 1;
            }
        }, this);

        this._getProgress();
        return this.result;
    },

    /**
     * Displays results.
     * @internal
     * @return {void}
     */
    _getProgress: function() {
        if (!this.container) {
            return;
        }

        let html = "<ul>";

        for (let item in this.result) {
            html += `<li><span>${item}: </span><strong>${this.result[item]}</strong></li>`;
        }

        html += "</ul>";

        this.container.innerHTML = html;
    }
});

L.control.result = function(opts) {
    return new L.Control.Result(opts);
}
