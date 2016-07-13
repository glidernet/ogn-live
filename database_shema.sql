-- Adminer 4.2.2 MySQL dump

SET NAMES utf8;
SET time_zone = '+00:00';
SET foreign_key_checks = 0;
SET sql_mode = 'NO_AUTO_VALUE_ON_ZERO';

CREATE TABLE `devices` (
  `dev_id` varchar(6) COLLATE utf8_unicode_ci NOT NULL,
  `dev_type` tinyint(4) NOT NULL DEFAULT '2',
  `dev_actype` varchar(32) COLLATE utf8_unicode_ci NOT NULL,
  `dev_acreg` varchar(7) COLLATE utf8_unicode_ci NOT NULL,
  `dev_accn` varchar(3) COLLATE utf8_unicode_ci NOT NULL,
  `dev_userid` mediumint(8) unsigned NOT NULL,
  `dev_notrack` tinyint(3) unsigned NOT NULL DEFAULT '0',
  `dev_noident` tinyint(3) unsigned NOT NULL DEFAULT '0',
  UNIQUE KEY `dev_id` (`dev_id`)
) ENGINE=MyISAM DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci;


CREATE TABLE `flightlog` (
  `fdate` date NOT NULL,
  `airfield` varchar(16) COLLATE utf8_unicode_ci NOT NULL,
  `num` smallint(5) unsigned NOT NULL,
  `planereg` varchar(10) COLLATE utf8_unicode_ci NOT NULL,
  `planemodel` varchar(20) COLLATE utf8_unicode_ci NOT NULL,
  `planelanding` bigint(20) NOT NULL DEFAULT '0',
  `gliderreg` varchar(10) COLLATE utf8_unicode_ci NOT NULL,
  `glidercn` varchar(3) COLLATE utf8_unicode_ci NOT NULL,
  `glidermodel` varchar(20) COLLATE utf8_unicode_ci NOT NULL,
  `gliderlanding` bigint(20) NOT NULL DEFAULT '0',
  `takeoff` bigint(20) NOT NULL DEFAULT '0',
  `maxaltitude` smallint(6) NOT NULL,
  `gliderfid` varchar(10) COLLATE utf8_unicode_ci NOT NULL,
  `planefid` varchar(10) COLLATE utf8_unicode_ci NOT NULL,
  UNIQUE KEY `fdate_2` (`fdate`,`airfield`,`num`,`planereg`,`planemodel`,`planelanding`,`gliderreg`,`glidercn`,`glidermodel`,`gliderlanding`,`takeoff`,`maxaltitude`,`gliderfid`,`planefid`),
  KEY `fdate` (`fdate`),
  KEY `airfield` (`airfield`)
) ENGINE=MyISAM DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci;


CREATE TABLE `live` (
  `idd` char(20) COLLATE latin1_general_ci NOT NULL,
  `cn` varchar(3) CHARACTER SET ascii NOT NULL,
  `pseudo` varchar(16) CHARACTER SET ascii NOT NULL,
  `lat` float(12,6) NOT NULL,
  `lon` float(12,6) NOT NULL,
  `alt` int(11) NOT NULL,
  `tim` bigint(20) NOT NULL,
  `cap` smallint(11) NOT NULL,
  `vit` smallint(11) NOT NULL,
  `vz` float(5,1) NOT NULL,
  `type` tinyint(4) NOT NULL,
  `rec` varchar(16) COLLATE latin1_general_ci NOT NULL,
  `fid` varchar(20) COLLATE latin1_general_ci DEFAULT NULL,
  `crc` varchar(16) COLLATE latin1_general_ci NOT NULL,
  `dtype` tinyint(3) unsigned NOT NULL,
  UNIQUE KEY `fid` (`fid`),
  KEY `idd` (`idd`)
) ENGINE=MyISAM DEFAULT CHARSET=latin1 COLLATE=latin1_general_ci;


CREATE TABLE `liveall` (
  `rec` varchar(9) CHARACTER SET utf8 COLLATE utf8_unicode_ci NOT NULL,
  `cn` varchar(3) COLLATE latin1_general_ci NOT NULL,
  `pseudo` varchar(16) COLLATE latin1_general_ci NOT NULL,
  `lat` float(15,10) NOT NULL,
  `lon` float(15,10) NOT NULL,
  `alt` int(11) NOT NULL,
  `tim` bigint(20) NOT NULL,
  `vit` smallint(11) NOT NULL,
  `vz` float(5,1) NOT NULL,
  `type` tinyint(4) NOT NULL,
  `crc` varchar(16) COLLATE latin1_general_ci NOT NULL,
  `fid` varchar(10) COLLATE latin1_general_ci NOT NULL,
  KEY `crc` (`crc`),
  KEY `tim` (`tim`),
  KEY `fid` (`fid`),
  KEY `rec` (`rec`)
) ENGINE=MyISAM DEFAULT CHARSET=latin1 COLLATE=latin1_general_ci;


CREATE TABLE `timers` (
  `tid` tinyint(4) NOT NULL,
  `tim` bigint(20) NOT NULL
) ENGINE=MyISAM DEFAULT CHARSET=latin1;


CREATE TABLE `_cb_receivers` (
  `rid` char(16) COLLATE latin1_general_ci NOT NULL,
  `rlat` float(12,7) NOT NULL,
  `rlon` float(12,7) NOT NULL,
  `ralt` tinyint(4) NOT NULL,
  `rup` tinyint(1) NOT NULL,
  `rinfo` varchar(255) COLLATE latin1_general_ci NOT NULL,
  PRIMARY KEY (`rid`)
) ENGINE=MyISAM DEFAULT CHARSET=latin1 COLLATE=latin1_general_ci;


-- 2015-10-20 18:15:44
