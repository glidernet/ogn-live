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
   p | path length                      | default: 5 min, p=2: 10 min, p=3 all points
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
    {"name": "standard","color": "FFFF00","legs": [ [47.2,1.55],[46.5,2.3],[46.5,-0.2],[47,-0.2],[47.2,1.5] ] },
    {"name": "open","color": "FFFFFF","legs": [ [47.25,1.6],[48,3],[46,3],[47.22,1.6] ],"wlist": ["DD1111", "DD2222", "DD3333", "DD4444"]}
]}
```

There is an external program [cup2ogn.exe](http://www.spsys.demon.co.uk/software/cup2ogn.exe) that will
generate such a file either of a .CUC (SeeYou competition scoring file),
or of a .CUP file (with or without a task, but with is better).


## Backend

The backend code used in production is not yet public.
However there is a alternative backend [ogn-live-backend](https://github.com/Meisterschueler/ogn-live-backend).

### AJAX endpoints


Description   | name  | URL
------------- | ----- | -----------------------------------------------------------------------
Receiver list | rxml  | rec.php
Flights       | cxml  | lxml.php?a={{ all }}{{ boundc }}{{ recc }}{{ parc }}{{ tz }}{{ hashy }}
Flight path   | cxml1 | livexml1.php?id={{ p }}&l={{ lo }}
Flight data   | dxml  | dataxml.php?i=M\_{{ p }}&f={{ fi }}


Variable | Description          | Value
-------- | -------------------- | -------------------
all      | show offline gliders | 1 - true, 0 -false
boundc   | Bounds               | &b={{ amax }}&c={{ amin }}&d={{ omax }}&e={{ omin }}
amax     | Latitude             | eg. 50.123456789
omax     | Longitude            | eg. -9.123456789
recc     | unknown              | &r={{ rec }}
parc     | unknown              | &p={{ pw }}
tz       | timezone offset      | eg. -120
hashy    |                      | &y={{ dt }}, "" for all types
dt       | device type bitmask  | 0x1 ICAO, 0x2 Flarm, 0x4 OGN
p        | flight identifier    | eg. 12345678
lo       | longitude.toFixed()  | eg. 7
fi       | flight id            | {{ reg }} or 'hidden'
reg      | registry             | eg. XXXXXX
encpath  | encoded path         |

Examples:

http://live.glidernet.org/rec.php
```
<?xml version="1.0" encoding="UTF-8"?>
<markers>
<m e="0"/>
<m a="EHTL" b="52.0607986" c="5.9376998" d="1"/>
<m a="Musbach" b="48.5047989" c="8.4768000" d="1"/>
</markers>
```

http://live.glidernet.org/lxml.php?a=0&b=48.86612088725434&c=48.84692039542289&d=2.413544128417925&e=2.3053974609374563&z=2
http://live.glidernet.org/lxml.php?a=1&b=51.7568&c=47.3490&d=15.0239&e=1.0054&z=2
```
<?xml version="1.0" encoding="UTF-8"?>
<markers>
<m a="48.660000,12.198000,_b8,8bde76b8,807,23:11:22,633,103,131,-0.4,3,Moosburg,0,8bde76b8"/>
<m a="49.000500,9.080170,BF,D-9989,284,21:51:28,5427,0,0,-0.1,1,Loechgau,DDA286,fc73a533"/>
</markers>
```

http://live.glidernet.org/livexml1.php?id=87183180&l=7
```
<?xml version="1.0" encoding="UTF-8"?>
<markers>
<m e="0" i="{{ p }}" r="{{ enc_path }}"/>
</markers>```

http://live.glidernet.org/dataxml.php?i=M_4c4d735b&f=DDE1E1
```
<?xml version="1.0" encoding="UTF-8"?>
<markers>
<m g="0" i="M_4c4d735b" a="" b="" c="Pegase" d="449" e=""/>
</markers>
```




## License

Licensed under the [AGPLv3](LICENSE).
