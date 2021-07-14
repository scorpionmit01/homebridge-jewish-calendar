"use strict";
let Service, Characteristic, ContactState;

module.exports = function (homebridge) {
        Service = homebridge.hap.Service;
        Characteristic = homebridge.hap.Characteristic;
        ContactState = homebridge.hap.Characteristic.ContactSensorState;
        homebridge.registerAccessory("homebridge-jewish-calendar","JewishCalendar", JewishCalendar);
};

class JewishCalendar {
  constructor (log, config, api) {
    this.log = log;

    this.lat = parseFloat(config.latitude);
    this.long = parseFloat(config.longitude);
    this.name = config.name;

    this.il = config.israel;
    this.sheminiatzeret_in_sukkot = config.sheminiatzeret_in_sukkot;
    this.candlelighting = config.candlelighting;
    this.havdalah = config.havdalah;
    this.sefiratOmerCustom = config.sefiratOmerCustom;
    this.threeWeeksCustom = config.threeWeeksCustom;  

    this.HeDate = require('he-date');
    this.SunCalc = require('suncalc');
    this.offset = config.offset;

    this.services = {};
    this.services.Shabbat = new Service.ContactSensor(config.Shabbat, "Shabbat");
    this.services.YomTov = new Service.ContactSensor(config.YomTov, "YomTov");
    this.services.Kodesh = new Service.ContactSensor(config.Kodesh, "Kodesh");
    this.services.RoshHashana = new Service.ContactSensor(config.RoshHashana, "RoshHashana");
    this.services.YomKippur = new Service.ContactSensor(config.YomKippur, "YomKippur");
    this.services.Sukkot = new Service.ContactSensor(config.Sukkot, "Sukkot");
    this.services.SheminiAtzeret = new Service.ContactSensor(config.SheminiAtzeret, "SheminiAtzeret");
    this.services.Pesach = new Service.ContactSensor(config.Pesach, "Pesach");
    this.services.Shavuot = new Service.ContactSensor(config.Shavuot, "Shavuot");
    this.services.Chanukah = new Service.ContactSensor(config.Chanukah, "Chanukah");
    this.services.ThreeWeeks = new Service.ContactSensor(config.ThreeWeeks, "ThreeWeeks");
    this.services.Omer = new Service.ContactSensor(config.Omer, "Omer");
    this.services.SefiratOmer = new Service.ContactSensor(config.SefiratOmer, "SefiratOmer");
    this.services.Mourning = new Service.ContactSensor(config.Mourning, "Mourning");

    this.updateJewishDay();
    this.updateSensors();
    setTimeout(this.updateLoop.bind(this), 30000);
  }

  updateSensors() {
    this.services.Shabbat.getCharacteristic(Characteristic.ContactSensorState).setValue(this.isShabbat());
    this.services.YomTov.getCharacteristic(Characteristic.ContactSensorState).setValue(this.isYomTov());
    this.services.Kodesh.getCharacteristic(Characteristic.ContactSensorState).setValue(this.isKodesh());
    this.services.RoshHashana.getCharacteristic(Characteristic.ContactSensorState).setValue(this.isRoshHashana());
    this.services.YomKippur.getCharacteristic(Characteristic.ContactSensorState).setValue(this.isYomKippur());
    this.services.Sukkot.getCharacteristic(Characteristic.ContactSensorState).setValue(this.isSukkot());
    this.services.SheminiAtzeret.getCharacteristic(Characteristic.ContactSensorState).setValue(this.isSheminiAtzeret());
    this.services.Pesach.getCharacteristic(Characteristic.ContactSensorState).setValue(this.isPesach());
    this.services.Shavuot.getCharacteristic(Characteristic.ContactSensorState).setValue(this.isShavuot());
    this.services.Chanukah.getCharacteristic(Characteristic.ContactSensorState).setValue(this.isChanukah());
    this.services.ThreeWeeks.getCharacteristic(Characteristic.ContactSensorState).setValue(this.isThreeWeeks());
    this.services.Omer.getCharacteristic(Characteristic.ContactSensorState).setValue(this.isOmer());
    this.services.SefiratOmer.getCharacteristic(Characteristic.ContactSensorState).setValue(this.isSefiratOmer());
    this.services.Mourning.getCharacteristic(Characteristic.ContactSensorState).setValue(this.isMourning());
  }

  getName(obj, callback) {
    callback(null, obj.name);
  }

  getServices() {

    var informationService = new Service.AccessoryInformation();


    informationService
      .setCharacteristic(Characteristic.Name, this.name)
      .setCharacteristic(Characteristic.Manufacturer, "Alex Hochberger")
      .setCharacteristic(Characteristic.Model, "Standard Jewish Calendar")
      .setCharacteristic(Characteristic.SerialNumber, "613")
      .setCharacteristic(Characteristic.FirmwareRevision, 613);   

    var services = [
      informationService,
      this.services.Shabbat,
      this.services.YomTov,
      this.services.Kodesh,
      this.services.RoshHashana,
      this.services.YomKippur,
      this.services.Sukkot,
      this.services.SheminiAtzeret,
      this.services.Pesach,
      this.services.Shavuot,
      this.services.Chanukah,
      this.services.ThreeWeeks,
      this.services.Omer,
      this.services.SefiratOmer,
      this.services.Mourning
    ];
    return services;
  }

  updateJewishDay() {
    this.gDate = new Date();
    if ((typeof this.offset !== 'undefined') && (this.offset != 0)) {
      this.log.debug("Shifting the time by " + this.offset + " minutes.");
      this.gDate = new Date(this.gDate.getTime() + this.offset * 60000);
    }
    this.log.debug("Test date is " + this.gDate.toISOString());
    this.hDate = new this.HeDate(this.gDate);

    const midday = new Date(this.gDate.getFullYear(), this.gDate.getMonth(), this.gDate.getDate(), 12, 0, 0, 0, 0);
    this.log.debug("updateJewishDay():  today=" + this.gDate.toISOString());
    this.log.debug("updateJewishDay(): midday=" + midday.toISOString());
    
    var suntimes = this.SunCalc.getTimes(midday, this.lat, this.long);
    this.sunset = suntimes.sunsetStart;

    this.log.debug("Sunset Tonight: " + this.sunset.toLocaleString());
// Note, this is for programming. In non leap years, Adar1 and Adar2 are BOTH 5. Month is zero indexed.

    this.hebrewMonths = {'Tishri': 0, 'Heshvan': 1, 'Kislev': 2, 'Tevet': 3, 'Shevat': 4, 'Adar1': 5};
    var thisYear = this.hDate.getFullYear();
    this.hebrewMonths.Adar2 = new this.HeDate(thisYear + 1, -7).getMonth();
    this.hebrewMonths.Nisan = new this.HeDate(thisYear + 1, -6).getMonth();
    this.hebrewMonths.Iyar = new this.HeDate(thisYear + 1, -5).getMonth();
    this.hebrewMonths.Sivan = new this.HeDate(thisYear + 1, -4).getMonth();
    this.hebrewMonths.Tamuz = new this.HeDate(thisYear + 1, -3).getMonth();
    this.hebrewMonths.Av = new this.HeDate(thisYear + 1, -2).getMonth();
    this.hebrewMonths.Elul = new this.HeDate(thisYear + 1, -1).getMonth();

    this.log.debug("This Year's Hebrew Months: ");
    this.log.debug(this.hebrewMonths);
  }

  updateLoop() {
    var today = new Date();
/*    if (
      (this.gDate.getFullYear() != today.getFullYear()) ||
      (this.gDate.getMonth() != today.getMonth()) ||
      (this.gDate.getDate() != today.getDate())
    ) {
  */
        this.updateJewishDay();
/*
    }
*/
    this.updateSensors();
    setTimeout(this.updateLoop.bind(this), 30000); 
  }



  isShabbat() {
    var day = this.gDate.getDay();
    var candletime = new Date(this.sunset);
    candletime.setMinutes(this.sunset.getMinutes() - this.candlelighting);

    var havdalahtime = new Date(this.sunset);
    havdalahtime.setMinutes(this.sunset.getMinutes() + this.havdalah);
    this.log.debug("isShabbat(): day = " + day + ", this.gDate = " + this.gDate + ", this.hDate = " + this.hDate + ", candletime = " + candletime + ", havdalahtime = " + havdalahtime);
    return (((5 == day) && (this.gDate > candletime)) || ((6 == day) && (this.gDate < havdalahtime)));
  }

  isRoshHashana() {
    // Because of year wraps, if it's Elul 29, we check candle lighting, otherwise, use normal DateRange
    if ((this.hDate.getMonth() == this.hebrewMonths.Elul)&& this.hDate.getDate () == 29) {
      var candletime = new Date(this.sunset);
      candletime.setMinutes(this.sunset.getMinutes() - this.candlelighting);
      return this.gDate > candletime;
    }
    return this._inHebrewHolidayDateRange({month: this.hebrewMonths.Tishri, date: 0}, {month: this.hebrewMonths.Tishri, date: 2});
  }
  isYomKippur() {
    return this._inHebrewHolidayDateRange({month: this.hebrewMonths.Tishri, date: 9}, {month: this.hebrewMonths.Tishri, date: 10});
  }
  isSukkot() {
    var begin = {month: this.hebrewMonths.Tishri, date: 14};
    var end = (!this.il && this.sheminiatzeret_in_sukkot) ? {month: this.hebrewMonths.Tishri, date: 22} : {month: this.hebrewMonths.Tishri, date: 21};
    return this._inHebrewHolidayDateRange(begin, end);
  }
  _isSukkotYomTov() {
    var begin = {month: this.hebrewMonths.Tishri, date: 14};
    var end = (this.il) ? {month: this.hebrewMonths.Tishri, date: 15} : {month: this.hebrewMonths.Tishri, date: 16};
    return this._inHebrewHolidayDateRange(begin, end);
  }
  isSheminiAtzeret() {
    var begin = {month: this.hebrewMonths.Tishri, date: 21};
    var end = (this.il) ? {month: this.hebrewMonths.Tishri, date: 22} : {month: this.hebrewMonths.Tishri, date: 23};
    return this._inHebrewHolidayDateRange(begin, end);
  }
  isPesach() {
    var begin = {month: this.hebrewMonths.Nisan, date: 14};
    var end = (this.il) ? {month: this.hebrewMonths.Nisan, date: 21} : {month: this.hebrewMonths.Nisan, date: 22};
    return this._inHebrewHolidayDateRange(begin, end);
  }
  isThreeWeeks() {
    var begin; // night before Erev 17th of Tamuz
    if (this.threeWeeksCustom == "Ashkenazi") {
      begin = {month: this.hebrewMonths.Tamuz, date: 16};
    } else if (this.threeWeeksCustom == "Sephardic") {
      begin = {month: this.hebrewMonths.Tamuz, date: 29};
    }
    var Av9 = new this.HeDate(this.hDate.getFullYear(), this.hebrewMonths.Av, 9);
    var endDate = (Av9.getDay() == 6) ? 11 : 10; // Includes day after Fast.
    var end = {month: this.hebrewMonths.Av, date: endDate };
    return this._inHebrewHolidayDateRange(begin, end);
  }

  _isPesachYomTov() {
    // Leap years can make Nisan's month number "bounce" so we check for it
    
    var begin = {month: this.hebrewMonths.Nisan, date: 14};
    var end = (this.il) ? {month: this.hebrewMonths.Nisan, date: 15} : {month: this.hebrewMonths.Nisan, date: 16};
    var firstDays = this._inHebrewHolidayDateRange(begin, end);
    begin = {month: this.hebrewMonths.Nisan, date: 20};
    end = (this.il) ? {month: this.hebrewMonths.Nisan, date: 21} : {month: this.hebrewMonths.Nisan, date: 22};
    var secondDays = this._inHebrewHolidayDateRange(begin, end);
    return firstDays || secondDays;
  }
  isOmer() {
    var begin = {month: this.hebrewMonths.Nisan, date: 15};
    var end = {month: this.hebrewMonths.Sivan, date: 6};
    return this._inHebrewHolidayDateRange(begin, end);
  }
  isSefiratOmer() {
    var begin = false;
    var end = false;
    if (this.sefiratOmerCustom == "Ashkenazi") {
      begin = {month: this.hebrewMonths.Nisan, date: 15};
      end = {month: this.hebrewMonths.Iyar, date: 18};
    } else if (this.sefiratOmerCustom == "Sephardic") {
      begin = {month: this.hebrewMonths.Nisan, date: 15};
      end = {month: this.hebrewMonths.Iyar, date: 19};
    } else if (this.sefiratOmerCustom == "Iyar") {
      begin = {month: this.hebrewMonths.Nisan, date: 29};
      end = {month: this.hebrewMonths.Sivan, date: 3};
    } else if (this.sefiratOmerCustom == "Iyar2") {
      begin = {month: this.hebrewMonths.Iyar, date: 2};
      end = {month: this.hebrewMonths.Sivan, date: 5};
    }
    if (begin && end) {
      return this._inHebrewHolidayDateRange(begin, end);
    }
    return false;
  }
  isMourning() { return this.isSefiratOmer() || this.isThreeWeeks();}

  isShavuot() {
    // Leap years can make Sivan's month number "bounce" so we check for it
    var begin = {month: this.hebrewMonths.Sivan, date: 5};
    var end = (this.il) ? {month: this.hebrewMonths.Sivan, date: 7} : {month: this.hebrewMonths.Sivan, date: 7};
    return this._inHebrewHolidayDateRange(begin, end);
  }
  isYomTov() {
    var holidays = this.isRoshHashana() || this.isYomKippur() || this._isSukkotYomTov() ||
         this.isSheminiAtzeret() || this._isPesachYomTov() || this.isShavuot();
    return holidays;
  }
  isKodesh() {
    return (this.isShabbat() || this.isYomTov());
  }

  isChanukah() {
    var ChanukahEnd = new this.HeDate(this.hDate.getFullYear(), 2, 32);

    var begin = {month: this.hebrewMonths.Kislev, date: 24 };
    var end = {month: ChanukahEnd.getMonth(), date: ChanukahEnd.getDate() };
    return this._inHebrewHolidayDateRange(begin, end);    
  }
  _inHebrewHolidayDateRange(erev, end) {
    // Assumes that all ranges are within the same Hebraic year. 
    // We COULD support wrap arounds, but it is only needed for Rosh Hashana
    // Handled there as a special case rule

    var candletime = new Date(this.sunset);
    candletime.setMinutes(this.sunset.getMinutes() - this.candlelighting);

    var havdalahtime = new Date(this.sunset);
    havdalahtime.setMinutes(this.sunset.getMinutes() + this.havdalah);    

    var todayHebrewMonth = this.hDate.getMonth();
    var todayHebrewDate = this.hDate.getDate();

    // Date should be in the format {month, date}
    if ((todayHebrewMonth == erev.month) && (todayHebrewDate == erev.date)) {
      // First Day -- true after sunset
      return (this.gDate > candletime);
    } else if ((todayHebrewMonth == end.month) && (todayHebrewDate == end.date)) {
      // Last Day -- true until sunset
      return (this.gDate < havdalahtime);
    } else if (
          ((todayHebrewMonth > erev.month) || (todayHebrewMonth == erev.month && todayHebrewDate > erev.date))
          &&
          ((todayHebrewMonth < end.month) || (todayHebrewMonth == end.month && todayHebrewDate < end.date))) {
      return true;
    } else {
      // Not in the middle
      return false;
    }
  }
}