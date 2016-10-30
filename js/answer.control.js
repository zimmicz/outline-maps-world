L.Control.Answer = L.Control.extend({
    options: {
        position: "topright"
    },

    initialize: function(options) {
        L.setOptions(this, options);
    },

    onAdd: function(map) {
        let container = L.DomUtil.create("div", "bm-answer");
        this.input = L.DomUtil.create("input", "", container);
        this.input.id = "bm-answer-input";
        this.input.placeholder = "Select any map feature";

        L.DomEvent.disableClickPropagation(container);
        L.DomEvent.disableScrollPropagation(container);

        return container;
    },

    focus: function() {
        this.input.focus();
    }
});

L.control.answer = function(opts) {
    return new L.Control.Answer(opts);
};
