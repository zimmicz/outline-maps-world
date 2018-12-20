L.Control.MapRequest = L.Control.extend({
    options: {
        position: "topright"
    },

    initialize: function(options) {
        L.setOptions(this, options);
    },

    onAdd: function(map) {
        let self = this;
        let container = L.DomUtil.create("div", "bm-map-request");
        container.innerHTML = "<p>Would you like to play some other map? <a target='blank' href='https://feedback.userreport.com/2229a84e-c2fa-4427-99ab-27639f103569/'>Issue a map request.</a></p>";
        container.innerHTML += "<p>Chose the wrong map? <a href='/'>Choose again!</a></p>"

        L.DomEvent.disableClickPropagation(container);
        L.DomEvent.disableScrollPropagation(container);

        return container;
    }
});

L.control.mapRequest = function(opts) {
    return new L.Control.MapRequest(opts);
};

