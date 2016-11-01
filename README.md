

A little project for educational purposes.

Feel free to contribute by sending more data.

## How to contribute

1. Fork the repo
2. Run `yarn`
3. Checkout the `gh-pages` branch
4. I recommend copying `usa` folder to the new folder (name it after the piece of the world it represents)
5. In that folder, replace the `data/data.js` file with your own **GeoJSON** EPSG:4326 file. Please consider simplifying the geometries, so the file is not bloated. Don't forget to prepend `let data =` before the GeoJSON itself.
6. You'll find a config file at `js/config.js`. If you provide GeoJSON with `name` attribute (case-sensitive), no actions need to be taken. However, you can provide more than one attribute to check answers against in an array.
7. Check that everything works fine.
8. Update README.md.
9. Send PR.
10. Profit!
