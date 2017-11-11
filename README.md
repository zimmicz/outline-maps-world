## Purpose

When I went to school, we used to spend breaks standing in front of a map, trying to find places we've never been to. Since then, I guess I kind of like outline maps. They're great help for studying and they're fun as well.

That's why I made this simple project.

## Use it
Feel free to use this little game whenever and wherever you feel it might be useful: at school, at home, giving a speech, whatever.

Every map is available at https://outline-maps.world/?map=mapName, where `mapName` represents the keys of `CONFIG` object inside `js/config.js`. The `inverse` flag may be used to toggle find by name/find by feature settings (e.g. https://outline-maps.world/?inverse&map=usa). No backend needed.

## How to contribute

1. Fork the repo.
2. Add a new dataset to `data` folder named by the piece of Earth it represents (e.g. `usa.geojson`).
3. Add it to `js/config.js`.
4. Send PR.
5. Profit!
