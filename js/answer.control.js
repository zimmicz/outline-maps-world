L.Control.Answer = L.Control.extend({
    options: {
        position: "topright"
    },

    initialize: function(options) {
        L.setOptions(this, options);
    },

    onAdd: function(map) {
        let container = L.DomUtil.create("div", "bm-answer");
        this.answer = L.DomUtil.create(this.options.inverse ? "strong" : "input", "", container);
        this.answer.id = "bm-answer-input";
        this.answer.placeholder = "Type the name...";

        if (this.options.inverse) {
            this.answer.innerHTML = _layers[0].feature.properties[config.field[0]];
        }

        L.DomEvent.disableClickPropagation(container);
        L.DomEvent.disableScrollPropagation(container);

        return container;
    },

    focus: function() {
        this.answer.focus();
    }
});

L.control.answer = function(opts) {
    return new L.Control.Answer(opts);
};
