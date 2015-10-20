This script has been developped little by little, over a period of time depending on how much free time I had. The end product might look a bit haphazard but it works! :-)
It deserves to be rewritten from scratch with modern tools (bootstrap, angularJS ...)


Data come from aircraft position database
	For each airfield we find geographic bounds of the runway 

  minimum                                              maximum
  longitude                                            longitude
  
    |                                                     |
    |                                                     |
    ------------------------------------------------------------ maximum
    |                                                     |      latitude
    |                                                     |
    |       / .                                           |
    |      /     .                                        |
    |     /         .                                     |
    |      .           .                                  |
    |         .           .                               |
    |            .           .                            |
    |               .           .                         |
    |                  .           .                      |
    |                     .           .                   |
    |                        .           .                |
    |                           .           .             |
    |                              .           .          |
    |                                 .           .       |
    |                                    .        /       |
    |                                       .    /        |
    |                                          ./         |
    |                                                     |
    |                                                     |      minimum
    ------------------------------------------------------------ latitude
    
this enables to fill in the SQL request in the $aero array

ex:	'LFMF'=> array('FAYENCE',"l.rec='LFMF' AND (l.alt < 920) AND (l.lat BETWEEN 43.60377 AND 43.62095) AND (l.lon BETWEEN 6.6818 AND 6.7127)",220,''),
     ICAO          Fullname    reciever           maximum                   geographics bounds of the runway(s) + marge                      alti.   password
     code	                        ID              altitude                                                                                 of the   (optionnal)
                                               (for windlauch)                                                                           airfield
                           

The SQL request retrieves data that matches the gegraphic limits of the airfield and timestamp limits of the day requested.
TakeOff detection: ground speed> 55 Km/h
Landing detection: ground speed< 40 Km/h


ex:
F-CECG_CG	F-CECG	1bc3e43f	1	1419852286	11:24:46	212	0	0.0
F-CECG_CG	F-CECG	1bc3e43f	1	1419852291	11:24:51	212	0	0.0
F-CECG_CG	F-CECG	1bc3e43f	1	1419852296	11:24:56	213	0	0.0
F-CECG_CG	F-CECG	1bc3e43f	1	1419852301	11:25:01	213	0	0.0
F-CECG_CG	F-CECG	1bc3e43f	1	1419852306	11:25:06	213	30	0.0
F-CECG_CG	F-CECG	1bc3e43f	1	1419852311	11:25:11	213	61	0.0
F-CECG_CG	F-CECG	1bc3e43f	1	1419852316	11:25:16	214	87	0.1
...
F-CECG_CG	F-CECG	1bc3e43f	1	1419866694	15:24:54	218	72	-1.3
F-CECG_CG	F-CECG	1bc3e43f	1	1419866697	15:24:57	211	70	-0.2
F-CECG_CG	F-CECG	1bc3e43f	1	1419866700	15:25:00	212	39	0.1
F-CECG_CG	F-CECG	1bc3e43f	1	1419866705	15:25:05	212	0	0.0
F-CECG_CG	F-CECG	1bc3e43f	1	1419866711	15:25:11	211	0	0.0
F-GFPD_PD	F-GFPD	4ba827cc	2	1419852284	11:24:44	226	0	0.1
F-GFPD_PD	F-GFPD	4ba827cc	2	1419852289	11:24:49	228	0	0.1
F-GFPD_PD	F-GFPD	4ba827cc	2	1419852294	11:24:54	228	0	0.1
F-GFPD_PD	F-GFPD	4ba827cc	2	1419852299	11:24:59	230	0	0.1
F-GFPD_PD	F-GFPD	4ba827cc	2	1419852304	11:25:04	228	19	0.1
F-GFPD_PD	F-GFPD	4ba827cc	2	1419852309	11:25:09	228	48	0.1
F-GFPD_PD	F-GFPD	4ba827cc	2	1419852314	11:25:14	228	76	0.1
...
F-GFPD_PD	F-GFPD	4ba827cc	2	1419853100	11:38:20	218	83	-0.5
F-GFPD_PD	F-GFPD	4ba827cc	2	1419853105	11:38:25	219	61	0.1
F-GFPD_PD	F-GFPD	4ba827cc	2	1419853110	11:38:30	219	26	0.0
F-GFPD_PD	F-GFPD	4ba827cc	2	1419853115	11:38:35	219	7	0.0
F-GFPD_PD	F-GFPD	4ba827cc	2	1419853120	11:38:40	219	9	-0.1




not sorted array:
...
["1419852314+000002"]=>
  array(7) {
    [0]=>
    string(1) "2"
    [1]=>
    string(6) "F-GFPD"
    [2]=>
    string(21) "PA-25                "
    [3]=>
    string(3) "PD "
    [4]=>
    string(10) "1419852314"
    [5]=>
    string(10) "1419853110"
    [6]=>
    string(9) "F-GFPD_PD"
  }
...
["1419852311+000009"]=>
  array(7) {
    [0]=>
    string(1) "1"
    [1]=>
    string(6) "F-CECG"
    [2]=>
    string(21) "ASW-17               "
    [3]=>
    string(3) "   "
    [4]=>
    string(10) "1419852311"
    [5]=>
    string(10) "1419866700"
    [6]=>
    string(9) "F-CECG_CG"
  }
  
  
sorted array:
...
 ["1419852311+000009"]=>
  array(7) {
    [0]=>
    string(1) "1"
    [1]=>
    string(6) "F-CECG"
    [2]=>
    string(21) "ASW-17               "
    [3]=>
    string(3) "   "
    [4]=>
    string(10) "1419852311"
    [5]=>
    string(10) "1419866700"
    [6]=>
    string(9) "F-CECG_CG"
  }
  ["1419852314+000002"]=>
  array(7) {
    [0]=>
    string(1) "2"
    [1]=>
    string(6) "F-GFPD"
    [2]=>
    string(21) "PA-25                "
    [3]=>
    string(3) "PD "
    [4]=>
    string(10) "1419852314"
    [5]=>
    string(10) "1419853110"
    [6]=>
    string(9) "F-GFPD_PD"
  }
...

P1:
...
 [1]=>
  array(7) {
    [0]=>
    string(1) "1"
    [1]=>
    string(6) "F-CECG"
    [2]=>
    string(21) "ASW-17               "
    [3]=>
    string(3) "   "
    [4]=>
    string(10) "1419852311"
    [5]=>
    string(10) "1419866700"
    [6]=>
    string(9) "F-CECG_CG"
  }
  [2]=>
  array(7) {
    [0]=>
    string(1) "2"
    [1]=>
    string(6) "F-GFPD"
    [2]=>
    string(21) "PA-25                "
    [3]=>
    string(3) "PD "
    [4]=>
    string(10) "1419852314"
    [5]=>
    string(10) "1419853110"
    [6]=>
    string(9) "F-GFPD_PD"
  }
...


P2:
 [1]=>
  array(10) {
    [0]=>
    int(1)
    [1]=>
    string(6) "F-GFPD"
    [2]=>
    string(21) "PA-25                "
    [3]=>
    string(10) "1419852314"
    [4]=>
    string(10) "1419853110"
    [5]=>
    string(6) "F-CECG"
    [6]=>
    string(3) "   "
    [7]=>
    string(21) "ASW-17               "
    [8]=>
    string(10) "1419866700"
    [9]=>
    string(4) "1704"
  }
  
  
  
final:
     	TowPlane Plane	Type	(Moto)Glider	CN	Type	Take Off	Glider Landing	Glider Time	Plane Landing	Plane Time	TowPlane Max Alt.( QFE )

	F-GFPD	PA-25 	F-CECG		ASW-17 	12:25:14	16:25:00	03h59m46s	12:38:30	00h13m16s	1484 m
