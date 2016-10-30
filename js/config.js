let config = {
    path: "./data/data.geojson",
    field: ["name"], // attribute(s) to use for comparison
    basemap: false,
    retriesPerItem: 1, // set to -1 for infinity
    colors: {
        current: "#53777A",
        right: "green",
        wrong: "red",
        selected: "yellow"
    },
    timer: {
        position: "topright", // or boolean
        timeout: 0 // milliseconds - set to 0 to turn off
    }
};