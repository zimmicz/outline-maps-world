L.Control.Timer = L.Control.extend({
    options: {
        position: "topright"
    },

    initialize: function(options) {
        L.setOptions(this, options);
    },

    onAdd: function(map) {
        let self = this;
        let container = L.DomUtil.create("div", "bm-timer");
        let display = L.DomUtil.create("h1", "", container);
        this.time = this.showTime(display);

        L.DomEvent.disableClickPropagation(container);
        L.DomEvent.disableScrollPropagation(container);

        if (this.options.timeout) {
            setTimeout(function() {
                clearInterval(self.time);
                if (typeof self.options.timeout === "function") {
                    self.options.timeoutFn();
                }
            }, this.options.timeout);
        }

        return container;
    },

    showTime: function(where) {
        let self = this;
        if (!where.innerHTML) {
            where.innerHTML = 'Start!';
        }

        let i = 0;

        return setInterval(function() {
            i += 1;
            where.innerHTML = `${i} seconds`;
            where.innerHTML = self._formatTime(i);
        }, 1000);
    },

    stopTime: function() {
        clearInterval(this.time);
    },

    _formatTime: function(_seconds) {
        let minutes = 0;
        let seconds = _seconds;

        if (_seconds >= 60) {
            minutes = parseInt(_seconds / 60);
            seconds = Math.abs(minutes * 60 - _seconds);
        }

        if (seconds < 10) {
            seconds = "0" + seconds.toString();
        }

        if (minutes < 10) {
            minutes = "0" + minutes.toString();
        }

        return `${minutes}:${seconds}`;
    }
});

L.control.timer = function(opts) {
    return new L.Control.Timer(opts);
}
