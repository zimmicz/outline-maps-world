const CONFIG_COMMON = {
    "colors": {
        "default": "#53777A",
        "right": "green",
        "wrong": "red",
        "selected": "yellow"
    },
    "timer": {
        "position": "topright",
        "timeout": 0
    },
    "MAP_CONFIG": function() {
        if (window.location.search.indexOf("=") === -1) {
            return;
        }

        return CONFIG[window.location.search.split("=")[1]];
    }
};

const CONFIG = {
    "usa": {
        "path": "../data/usa.geojson",
        "field": ["name"], // attribute(s) to use for comparison
        "basemap": false,
        "retriesPerItem": 0 // set to -1 for infinity
    },
    "world-capitals": {
        "path": "../data/world_capitals.geojson",
        "field": ["name"], // attribute(s) to use for comparison
        "basemap": true,
        "retriesPerItem": 0 // set to -1 for infinity
    }
};
