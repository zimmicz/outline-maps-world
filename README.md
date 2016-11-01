## Purpose

When I went to school, we used to spend breaks standing in front of a map, trying to find places
we've never been to. Since then, I guess I kind of like blind maps. They're great help for studying
and they're fun as well.

That's why I made this simple project.

## Try it yourself
Right now you can test your knowledge of the following parts of the world:

| Name   | Guess by name URL [1]                               | Guess by feature URL [2]                    | Datasource                                       |
|--------|-------------------------------------------------|-----------------------------------------|--------------------------------------------------|
| CONUS  | https://www.zimmi.cz/blind-maps/usa/?inverse    | https://www.zimmi.cz/blind-maps/usa/    | [Natural Earth](http://www.naturalearthdata.com) |
| Europe | https://www.zimmi.cz/blind-maps/europe/?inverse | https://www.zimmi.cz/blind-maps/europe/ | [Natural Earth](http://www.naturalearthdata.com) |

[1] Given a name, you try to find the right feature in the map

[2] Given a feature (highlighted in the map), you try to fill in the right name

## Use it
Feel free to use this little game whenever and wherever you feel it might be useful: at school, at home, giving a speech, whatever.

## How to contribute

1. Fork the repo.
2. Run `yarn`.
3. Checkout the `gh-pages` branch.
4. I recommend copying `usa` folder to the new folder (name it after the piece of the world it represents)
5. In that folder, replace the `data/data.js` file with your own **GeoJSON** EPSG:4326 file. Please consider simplifying the geometries, so the file is not bloated. Don't forget to prepend `let data =` before the GeoJSON itself.
6. You'll find a config file at `js/config.js`. If you provide GeoJSON with `name` attribute (case-sensitive), no actions need to be taken. However, you can provide more than one attribute to check answers against in an array.
7. Check that everything works fine.
8. Update README.md.
9. Send PR.
10. Profit!
