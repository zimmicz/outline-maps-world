const CONFIG_COMMON = {
    "basemap": {
        "url": "https://cartodb-basemaps-{s}.global.ssl.fastly.net/light_nolabels/{z}/{x}/{y}.png",
        "attribution": "Map data &copy; <a href='http://openstreetmap.org'>OpenStreetMap</a> contributors, <a href='http://creativecommons.org/licenses/by-sa/2.0/''>CC-BY-SA</a>"
    },
    "colors": {
        "default": "#1C45A5",
        "right": "#23A51C",
        "wrong": "#A71D31",
        "selected": "#C29979"
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
        "name": "Africa",
        "path": "../data/africa.geojson",
        "field": ["NAME", "NAME_LONG", "FORMAL_EN"],
        "basemap": false,
        "retriesPerItem": 0,
        "attribution": "Made with Natural Earth."
    },
    "europe": {
        "name": "Europe",
        "path": "../data/europe.geojson",
        "field": ["NAME", "NAME_LONG", "FORMAL_EN"],
        "basemap": true,
        "retriesPerItem": 0,
        "attribution": "Made with Natural Earth."
    },
    "south-america": {
        "name": "South America",
        "path": "../data/south_america.geojson",
        "field": ["NAME", "NAME_LONG", "FORMAL_EN"],
        "basemap": false,
        "retriesPerItem": 0,
        "attribution": "Made with Natural Earth."
    },
    "usa": {
        "name": "United States of America",
        "path": "../data/usa.geojson",
        "field": ["name"],
        "basemap": false,
        "retriesPerItem": 0,
        "attribution": "Made with Natural Earth."
    },
    "world-capitals": {
        "name": "World Capitals",
        "path": "../data/world_capitals.geojson",
        "field": ["name"],
        "basemap": true,
        "retriesPerItem": 0,
        "attribution": "Made with Natural Earth."
    },
    "european-capitals": {
        "name": "European Capitals",
        "path": "../data/european_capitals.geojson",
        "field": ["name", ["namealt"]],
        "basemap": true,
        "retriesPerItem": 0,
        "attribution": "Made with Natural Earth."
    },
    "comarques_catalunya": {
        "name": "Comarques de Catalunya",
        "path": "../data/comarques_catalunya.geojson",
        "field": ["nom_comar", "cap_comar"],
        "basemap": true,
        "retriesPerItem": 0,
        "attribution": "ICGC"
    }
};
