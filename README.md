# ogn-live

Talking about http://live.glidernet.org

This website displays live (mostly) glider traffic.
More information can be found on: http://glidernet.org

You can use this repo to report issues.


## Usage

You can create custom links to ogn-live,
for example:
```
http://live.glidernet.org/#c=44.84593,5.83412&z=6&o=1&b=46.3069,42.5792,11.0471,0.5003&l=pr&w=0&p=2&t=http://cunimb.fr/tasks_example.txt
```

### URL Parameters


The following URL parameters are currently supported:

Flag | Description                      | Value
---- | -------------------------------- | ----------------------------------------------------------:
   c | center coordinates               | latitude,longitude
   w | show warning window              | 0 - hidden
   z | zoom level                       | 0  (entire world) to 21 (most detailed)
   o | show offline aircrafts           | 1 - show offline
   m | map type                         | s:sattelite, h:hybrid, r:roadmap, t:relief
   b | bounds                           | lat_max,lat_min,lon_max,lon_min
   s | auto set to map                  | 1 - true
   l | show special layers              | v:wind, p:pressure, z:airspaces, a:airports, r:recievers
   u | use imperial units               | i - activated
   p | path lenght                      | default: 5 min, p=2: 10 min, p=3 all points
   n | show side panel                  | 0 - hidden
   t | load task file, (see [Tasks](#task-file-format)) | URL

[source](http://wiki.glidernet.org/links#toc7)


### Task File Format

Currently the code handles JSON and XCSoar TSK files.
You can generate such a task file with many programs (e.g. [prosoar.de](http://prosoar.de)).
The task file can be local or hosted somewhere (hosting with [CORS](https://en.wikipedia.org/wiki/Cross-origin_resource_sharing)).
Remark: github and [gists](https://gist.github.com/) has CORS enabled.

To display only aircrafts you want, you can specify a "whitelist" of device IDs in the task file (currently only supported by JSON files).
The devices need to be registered in the [OGN database](http://ddb.glidernet.org) to be recognized.

#### Example task file (json-encoded)

```
{"tasks": [
    {"name": "15m", "color": "0000FF", "legs": [ [47.3,1.55],[48.2,2.3],[30000],[47.5,-1.3],[50000],[47.3,1.5] ] },
    {"name": "standart","color": "FFFF00","legs": [ [47.2,1.55],[46.5,2.3],[46.5,-0.2],[47,-0.2],[47.2,1.5] ] },
    {"name": "open","color": "FFFFFF","legs": [ [47.25,1.6],[48,3],[46,3],[47.22,1.6] ],"wlist": ["DD1111", "DD2222", "DD3333", "DD4444"]}
]}
```

There is an external program [cup2ogn.exe](http://www.spsys.demon.co.uk/software/cup2ogn.exe) that will
generate such a file either of a .CUC (SeeYou competition scoring file),
or of a .CUP file (with or without a task, but with is better).


## License

Licensed under the [AGPLv3](LICENSE).
