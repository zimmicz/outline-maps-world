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
    "africa": {
        "path": "../data/africa.geojson",
        "field": ["NAME", "NAME_LONG", "FORMAL_EN"],
        "basemap": false,
        "retriesPerItem": 0
    },
    "usa": {
        "path": "../data/usa.geojson",
        "field": ["name"],
        "basemap": false,
        "retriesPerItem": 0
    },
    "world-capitals": {
        "path": "../data/world_capitals.geojson",
        "field": ["name"],
        "basemap": true,
        "retriesPerItem": 0
    }
};
