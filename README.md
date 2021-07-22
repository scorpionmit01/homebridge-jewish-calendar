[![npm version](https://badge.fury.io/js/homebridge-jewish-calendar.svg)](https://badge.fury.io/js/homebridge-jewish-calendar)
[![GitHub release](https://img.shields.io/github/release/scorpionmit01/homebridge-jewish-calendar.svg)](https://GitHub.com/scorpionmit01/homebridge-jewish-calendar/releases/)
[![GitHub license](https://img.shields.io/github/license/scorpionmit01/homebridge-jewish-calendar.svg)](https://github.com/scorpionmit01/homebridge-jewish-calendar/blob/master/LICENSE)
[![verified-by-homebridge](https://badgen.net/badge/homebridge/verified/purple)](https://github.com/homebridge/homebridge/wiki/Verified-Plugins)

# "Jewish Calendar" Plugin

This Plugin creates a series of Contact Switches that you can use in Automation related to the Hebrew Calendar. The heavy lift of this is from he-date and sun-calc. The rest was just calculating the various events.


Example config.json:

```

    "accessories": [
        {
            "accessory": "JewishCalendar"
            "name": "Jewish Calendar",
            "latitude": 40.7128,
            "longitude": -74.0060,
            "candlelighting": 18,
            "havdalah": 42,
            "offset": 0,
            "israel": false,
            "sheminiatzeret_in_sukkot": false,
            "Shabbat": "Shabbes",
            "YomTov": "Yom Tov",
            "RoshHashana": "Rosh Hashana",
            "YomKippur": "Yom Kippur",
            "Sukkot": "Sukkot",
            "SheminiAtzeret": "Simchat Torah",
            "Pesach": "Passover",
            "Shavuot": "Shavuot",
            "Chanukah": "Hanukkah",
            "Kodesh": "Kodesh",
            "Mourning": "Mourning",
            "Omer": "Omer",
            "SefiratOmer": "Sefirat Omer",
            "sefiratOmerCustom": "Ashkenazi",
            "ThreeWeeks": "Three Weeks",
            "threeWeeksCustom": "Ashkenazi",
    ]

```

## Explanation of Plugin and Config

The project was originally designed for me to have a better "Shabbat Mode" in Homekit, but for completeness I added some very specific ones. The settings in the Config for the holidays are to change spelling. I use a modern Transliterated spelling, but feel free to replace with Hebrew, Ashkenazi transliterations, English, or whatever language you prefer. If you look in the sample above, you can see a variation of languages.

## Caveats

Suncalc is known to occaisionaly have issues of a few minutes. Unfortunately the other library I found was not compatible with Homebridge. If you are concerned with Halachic specificity, you need to add at least 1 minute to cover the fractional minute between updates, and 3 minutes for safety on Sun-Calc. In general, this is more useful for limiting Trigger Events in your Automation rules than serious Halachic implications.

## How to Use in Automations

I use the Home App for building my scenes (to include Homepods), and the Eve App for programing. But any Homekit app should work.

Example of Programming:

Turn the Dining Room on for lunch on all Sabbath and Holidays, except Sukkot. On Sukkot, we turn the Sukkah on instead.

Trigger: Timer: 12:30 PM
Conditions:
  Kodesh: Open
  Sukkot: Closed
Scene: Dining Room Entertaining

Trigger: Timer 12:30 PM
Conditions:
  Kodesh: Closed
  Sukkot: Closed
Scene: Sukkah On

NOTE: Because of quirks in how Sun-Calc and Apple can calculate things like Sundown, I recommend that you either use a fixed Time for your Trigger, or Sundown or later. But setting it to run 15 minutes before Sundown when Shabbat: On should work.

On/Off Settings - the words may be backwards. Contact sensors are open/closed. Eve is a fantastic for editing rules but it terminology felt "backwards" for checking the settings.

## Debugging your rules

You can set the Offset to add (negative to subtract) minutes to the date/time to allow you to test rules. This is important if you are testing Shabbat rules and don't want to be using your electronics on Shabbat.

If you want to code your Shabbat rules on Sunday, you can do offset: -1440, and it will run everything as though then.

Hat tip to moshed for the idea, Issue #3
https://github.com/scorpionmit01/homebridge-jewish-calendar/issues/3

## Silly but valid examples

Trigger: at Sundown each day
Conditions: Chanukah: on

Action: turn on Menorah Outlet

Trigger: at Midnight each day
Action: turn off Menorah Outlet

Use: a store/dorm that wants a Hanukkah Menorah to light up their window during Chanukah.


Trigger: at 7:00 AM
Conditions: Kodesh: off
            Mourning: off
Action: Scene Good Morning Music

If you come up with clever hacks, feel free to let me know. I mostly disable the rules fired by my motion sensors

## Explanations of some Specifics:

Koshesh is true whenever Shabbat or Yom Tov is true. I have it so I can check a single value when disabling routines that run off motion sensors.

Sefirat Omer settings are:
  Ashkenazi: Pesach 2 -> before Lag B'omer
  Sephardic: Pesach 2 -> Lag B'omer
  Iyar: Rosh Chodesh Iyar until Sivan 3
  Iyar 2: Iyar 2 until Shavuot

Three Weeks Settings:
  Ashkenazi: Fast of Tamuz through day after Tisha B'av Fast
  Sephardic: Rosh Chodesh Av through day after Tisha B'av Fast

Sukkot: is on from beginning of holiday through Shemini Atzeret. If you enable sheminiatzeret_in_sukkot in the config, it will run until Simchat Torah (or end of Shemini Atzeret in Israel). Chol Hamoed is part of this Sensor.

Pesach: runs from beginning of holiday through the end, including Chol Hamoed.

## Special Thank You

Hat tip to shayweiss who found the bug and the fix. It's Suncalc Issue #11, apparently not being fixed
https://github.com/mourner/suncalc/issues/11


## How to say thank you for this

Drop me an email, scorpion@alum.mit.edu will always forward to me and say thanks. It's happened a few times, and it really makes my day. If you want to do more, please consider a donation to your local Jewish Federation in honor of Homebridge Jewish Calendar.
