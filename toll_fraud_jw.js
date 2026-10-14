/* FG SCRIPT. Please keep this line. */

/**
 * Script to bypass common TF cloaking techiques for JW:
 *   it contains all techniques from toll_fraud_ua script
 *   and mock SIM card techniques from mock_simcard_info_BR.js
 *   with support for mocking them dynamically for different regions
 *   based on selected locale.
 */

/**
 * Print current backtrace
 */
function printBacktrace() {
  Java.perform(function() {
    var androidLog = Java.use('android.util.Log');
    var exception = Java.use('java.lang.Throwable').$new();
    console.warn(androidLog.getStackTraceString(exception));
    androidLog.e('FG', 'Backtrace', Java.use('java.lang.Exception').$new());
  });
}

/**
 * Overwrite log to logcat log
 * @param {string} logStr The log message
 */
function log(logStr) {
  console.log(logStr);

  if(logStr.startsWith("[*] CLOAKING")) {
    printBacktrace();
  }

  Java.perform(function() {
    const androidLog = Java.use('android.util.Log');
    androidLog.e('FG', logStr);
  });
}

/**
 * Generate random int
 * @param {?int} max maximum result
 * @return {?int}
 */
function getRand(max) {
  return Math.floor(Math.random() * max);
}

/** Returns a random string with specified length.
* @param {string} len
* @return {string}
*/
function randomStr(len) {
  const str = '0123456789';
  let output = '';
  for (let i = 0; i < len; ++i) {
      output += str.charAt(Math.floor(Math.random() * str.length));
  }
  return output;
}

// Valid mock device data for different country, scraped from mcc-mnc.org
const mockData = [
  {"country_code": "GR", "operators": [{"name": "Cyta Hellas", "mccmnc": "20214"}, {"name": "Vodafone", "mccmnc": "20205"}, {"name": "Cosmote", "mccmnc": "20201"}], "dial_code": "+30", "phone_number_length": 10, "timezone": "Europe/Athens"},
  {"country_code": "NL", "operators": [{"name": "Rgtn", "mccmnc": "20462"}, {"name": "Lebara", "mccmnc": "20417"}, {"name": "ProRail", "mccmnc": "20421"}, {"name": "KORE Wireless Nederland", "mccmnc": "20423"}], "dial_code": "+31", "phone_number_length": 9, "timezone": "Europe/Amsterdam"},
  {"country_code": "BE", "operators": [{"name": "Orange Belgium", "mccmnc": "20610"}, {"name": "Proximus", "mccmnc": "20601"}, {"name": "Voo", "mccmnc": "20608"}], "dial_code": "+32", "phone_number_length": 9, "timezone": "Europe/Brussels"},
  {"country_code": "FR", "operators": [{"name": "Haute-Garonne num\u00e9rique", "mccmnc": "20819"}, {"name": "Truphone", "mccmnc": "20812"}, {"name": "Free", "mccmnc": "20836"}], "dial_code": "+33", "phone_number_length": 9, "timezone": "Europe/Paris"},
  {"country_code": "MC", "operators": [{"name": "Office des Telephones", "mccmnc": "21210"}], "dial_code": "+377", "phone_number_length": 9, "timezone": "Europe/Monaco"},
  {"country_code": "AD", "operators": [{"name": "Som, Mobiland", "mccmnc": "21303"}], "dial_code": "+376", "phone_number_length": 6, "timezone": "Europe/Andorra"},
  {"country_code": "ES", "operators": [{"name": "Fibracat", "mccmnc": "21402"}, {"name": "Aire Networks del Mediterr\u00e1neo, S.L.U.", "mccmnc": "21434"}, {"name": "TeleCable", "mccmnc": "21416"}], "dial_code": "+34", "phone_number_length": 9, "timezone": "Atlantic/Canary"},
  {"country_code": "HU", "operators": [{"name": "Vodafone", "mccmnc": "21670"}, {"name": "Upc", "mccmnc": "21671"}, {"name": "MVM Net", "mccmnc": "21602"}, {"name": "Telekom", "mccmnc": "21630"}], "dial_code": "+36", "phone_number_length": 9, "timezone": "Europe/Budapest"},
  {"country_code": "BA", "operators": [{"name": "Ht-Eronet", "mccmnc": "21803"}, {"name": "M:Tel", "mccmnc": "21805"}, {"name": "BH Mobile", "mccmnc": "21890"}], "dial_code": "+387", "phone_number_length": 8, "timezone": "Europe/Sarajevo"},
  {"country_code": "HR", "operators": [{"name": "Ht Hr", "mccmnc": "21901"}, {"name": "Telemach", "mccmnc": "21902"}, {"name": "A1 Hr", "mccmnc": "21910"}], "dial_code": "+385", "phone_number_length": 9, "timezone": "Europe/Zagreb"},
  {"country_code": "RS", "operators": [{"name": "Yettel", "mccmnc": "22001"}, {"name": "Globaltel", "mccmnc": "22011"}, {"name": "A1 Srb", "mccmnc": "22005"}, {"name": "Mt:S", "mccmnc": "22003"}], "dial_code": "+381", "phone_number_length": 9, "timezone": "Europe/Belgrade"},
  {"country_code": "XK", "operators": [{"name": "Vala", "mccmnc": "22101"}, {"name": "Z Mobile", "mccmnc": "22106"}, {"name": "Ipko", "mccmnc": "22102"}], "dial_code": "+383", "phone_number_length": 8, "timezone": "Europe/Belgrade"},
  {"country_code": "IT", "operators": [{"name": "Digi Mobil", "mccmnc": "22236"}, {"name": "GO internet", "mccmnc": "22241"}, {"name": "COOP Voce", "mccmnc": "22253"}], "dial_code": "+39", "phone_number_length": 10, "timezone": "Europe/Rome"},
  {"country_code": "RO", "operators": [{"name": "Telekom", "mccmnc": "22603"}, {"name": "Vodafone", "mccmnc": "22601"}, {"name": "Orange", "mccmnc": "22610"}], "dial_code": "+40", "phone_number_length": 9, "timezone": "Europe/Bucharest"},
  {"country_code": "CH", "operators": [{"name": "Upc Cablecom", "mccmnc": "22853"}, {"name": "Tele4u", "mccmnc": "22808"}, {"name": "Nth AG", "mccmnc": "22864"}], "dial_code": "+41", "phone_number_length": 9, "timezone": "Europe/Zurich"},
  {"country_code": "CZ", "operators": [{"name": "Nordic Telecom 5G", "mccmnc": "23006"}, {"name": "Nordic Telecom Regional", "mccmnc": "23004"}, {"name": "T-Mobile", "mccmnc": "23007"}], "dial_code": "+420", "phone_number_length": 9, "timezone": "Europe/Prague"},
  {"country_code": "SK", "operators": [{"name": "Orange", "mccmnc": "23101"}, {"name": "Telekom", "mccmnc": "23104"}, {"name": "O2", "mccmnc": "23106"}], "dial_code": "+421", "phone_number_length": 9, "timezone": "Europe/Bratislava"},
  {"country_code": "AT", "operators": [{"name": "Yesss!", "mccmnc": "23212"}, {"name": "Bob", "mccmnc": "23211"}, {"name": "Lycamobile", "mccmnc": "23208"}], "dial_code": "+43", "phone_number_length": 9, "timezone": "Europe/Vienna"},
  {"country_code": "GB", "operators": [{"name": "Railtrack", "mccmnc": "23413"}, {"name": "Telet", "mccmnc": "23488"}, {"name": "Bluewave Communications", "mccmnc": "23473"}], "dial_code": "+44", "phone_number_length": 10, "timezone": "Europe/Guernsey"},
  {"country_code": "IM", "operators": [{"name": "Bluewave Communications", "mccmnc": "23473"}, {"name": "Sure Mobile", "mccmnc": "23436"}, {"name": "Pronto GSM", "mccmnc": "23458"}], "dial_code": "+44", "phone_number_length": 10, "timezone": "Europe/Guernsey"},
  {"country_code": "GG", "operators": [{"name": "Jt", "mccmnc": "23450"}, {"name": "Airtel-Vodafone", "mccmnc": "23403"}, {"name": "Sure Mobile", "mccmnc": "23455"}], "dial_code": "+44", "phone_number_length": 10, "timezone": "Europe/Guernsey"},
  {"country_code": "JE", "operators": [{"name": "Airtel-Vodafone", "mccmnc": "23403"}, {"name": "Sure Mobile", "mccmnc": "23455"}, {"name": "Jt", "mccmnc": "23450"}], "dial_code": "+44", "phone_number_length": 10, "timezone": "Europe/Guernsey"},
  {"country_code": "DK", "operators": [{"name": "TetraNet", "mccmnc": "23805"}, {"name": "TT-Netv\u00e6rket P/S", "mccmnc": "23866"}, {"name": "Onomondo", "mccmnc": "23873"}, {"name": "Telia", "mccmnc": "23820"}], "dial_code": "+45", "phone_number_length": 8, "timezone": "Europe/Copenhagen"},
  {"country_code": "SE", "operators": [{"name": "Net 1", "mccmnc": "24003"}, {"name": "Sweden", "mccmnc": "24004"}, {"name": "GlobeTouch AB", "mccmnc": "24027"}], "dial_code": "+46", "phone_number_length": 9, "timezone": "Europe/Stockholm"},
  {"country_code": "NO", "operators": [{"name": "eRate Norway AS", "mccmnc": "24215"}, {"name": "TampNet AS", "mccmnc": "24299"}, {"name": "Com4", "mccmnc": "24209"}], "dial_code": "+47", "phone_number_length": 8, "timezone": "Arctic/Longyearbyen"},
  {"country_code": "FI", "operators": [{"name": "Nettia Oy", "mccmnc": "24419"}, {"name": "Elisa", "mccmnc": "24405"}, {"name": "Tismi", "mccmnc": "24437"}], "dial_code": "+358", "phone_number_length": 9, "timezone": "Europe/Helsinki"},
  {"country_code": "LT", "operators": [{"name": "Tele2", "mccmnc": "24603"}, {"name": "Bit\u0117", "mccmnc": "24602"}, {"name": "Telia", "mccmnc": "24601"}, {"name": "LitRail", "mccmnc": "24605"}], "dial_code": "+370", "phone_number_length": 8, "timezone": "Europe/Vilnius"},
  {"country_code": "LV", "operators": [{"name": "Sia \"Megatel\"", "mccmnc": "24707"}, {"name": "Tele2", "mccmnc": "24702"}, {"name": "Triatel", "mccmnc": "24703"}, {"name": "Xomobile", "mccmnc": "24709"}], "dial_code": "+371", "phone_number_length": 8, "timezone": "Europe/Riga"},
  {"country_code": "EE", "operators": [{"name": "Tele2", "mccmnc": "24803"}, {"name": "Dzinga", "mccmnc": "24816"}, {"name": "IT-Decision Telecom O\u00dc", "mccmnc": "24826"}, {"name": "Telia", "mccmnc": "24801"}], "dial_code": "+372", "phone_number_length": 8, "timezone": "Europe/Tallinn"},
  {"country_code": "RU", "operators": [{"name": "Krymtelekom", "mccmnc": "25034"}, {"name": "Volna mobile", "mccmnc": "25060"}, {"name": "Miatel", "mccmnc": "25016"}], "dial_code": "+7", "phone_number_length": 10, "timezone": "Asia/Almaty"},
  {"country_code": "UA", "operators": [{"name": "3Mob; Lycamobile", "mccmnc": "25507"}, {"name": "Vodafone", "mccmnc": "25501"}, {"name": "Intertelecom", "mccmnc": "25504"}], "dial_code": "+380", "phone_number_length": 9, "timezone": "Europe/Kyiv"},
  {"country_code": "MD", "operators": [{"name": "Moldtelecom", "mccmnc": "25903"}, {"name": "Orange", "mccmnc": "25901"}, {"name": "Moldcell", "mccmnc": "25902"}, {"name": "Idc", "mccmnc": "25915"}], "dial_code": "+373", "phone_number_length": 8, "timezone": "Europe/Chisinau"},
  {"country_code": "BY", "operators": [{"name": "A1", "mccmnc": "25701"}, {"name": "Mts", "mccmnc": "25702"}, {"name": "Life:)", "mccmnc": "25704"}], "dial_code": "+375", "phone_number_length": 9, "timezone": "Europe/Minsk"},
  {"country_code": "PL", "operators": [{"name": "Play", "mccmnc": "26006"}, {"name": "Orange", "mccmnc": "26003"}, {"name": "Truphone", "mccmnc": "26033"}, {"name": "TeleCube.PL", "mccmnc": "26025"}], "dial_code": "+48", "phone_number_length": 9, "timezone": "Europe/Warsaw"},
  {"country_code": "DE", "operators": [{"name": "NetCologne", "mccmnc": "26218"}, {"name": "Telekom", "mccmnc": "26201"}, {"name": "Airdata", "mccmnc": "26215"}, {"name": "O2", "mccmnc": "26203"}], "dial_code": "+49", "phone_number_length": 11, "timezone": "Europe/Berlin"},
  {"country_code": "GI", "operators": [{"name": "GibTel", "mccmnc": "26601"}], "dial_code": "+350", "phone_number_length": 8, "timezone": "Europe/Gibraltar"},
  {"country_code": "PT", "operators": [{"name": "Nos", "mccmnc": "26803"}, {"name": "Vodafone", "mccmnc": "26801"}, {"name": "Meo", "mccmnc": "26806"}, {"name": "LycaMobile", "mccmnc": "26804"}], "dial_code": "+351", "phone_number_length": 9, "timezone": "Atlantic/Azores"},
  {"country_code": "LU", "operators": [{"name": "Post", "mccmnc": "27001"}, {"name": "Orange", "mccmnc": "27099"}, {"name": "Tango", "mccmnc": "27077"}], "dial_code": "+352", "phone_number_length": 9, "timezone": "Europe/Luxembourg"},
  {"country_code": "IE", "operators": [{"name": "Eir", "mccmnc": "27203"}, {"name": "Net Feasa Limited", "mccmnc": "27221"}, {"name": "Carphone Warehouse", "mccmnc": "27216"}], "dial_code": "+353", "phone_number_length": 9, "timezone": "Europe/Guernsey"},
  {"country_code": "IS", "operators": [{"name": "Vodafone", "mccmnc": "27402"}, {"name": "Nova", "mccmnc": "27411"}, {"name": "On-waves", "mccmnc": "27408"}, {"name": "Tal", "mccmnc": "27412"}], "dial_code": "+354", "phone_number_length": 7, "timezone": "Atlantic/Reykjavik"},
  {"country_code": "AL", "operators": [{"name": "Vodafone", "mccmnc": "27602"}, {"name": "One", "mccmnc": "27601"}, {"name": "ALBtelecom", "mccmnc": "27603"}], "dial_code": "+355", "phone_number_length": 9, "timezone": "Europe/Tirane"},
  {"country_code": "MT", "operators": [{"name": "Go", "mccmnc": "27821"}, {"name": "Epic", "mccmnc": "27801"}, {"name": "Melita", "mccmnc": "27877"}], "dial_code": "+356", "phone_number_length": 8, "timezone": "Europe/Malta"},
  {"country_code": "CY", "operators": [{"name": "Cytamobile-Vodafone", "mccmnc": "28001"}, {"name": "PrimeTel", "mccmnc": "28020"}, {"name": "Epic", "mccmnc": "28010"}, {"name": "Lemontel", "mccmnc": "28022"}], "dial_code": "+357", "phone_number_length": 8, "timezone": "Asia/Nicosia"},
  {"country_code": "GE", "operators": [{"name": "GlobalCell", "mccmnc": "28207"}, {"name": "Magti", "mccmnc": "28202"}, {"name": "S1", "mccmnc": "28205"}, {"name": "Silk LTE", "mccmnc": "28208"}], "dial_code": "+995", "phone_number_length": 9, "timezone": "Asia/Tbilisi"},
  {"country_code": "AM", "operators": [{"name": "Beeline", "mccmnc": "28301"}, {"name": "VivaCell-MTS", "mccmnc": "28305"}, {"name": "Ucom", "mccmnc": "28310"}, {"name": "Karabakh Telecom", "mccmnc": "28304"}], "dial_code": "+374", "phone_number_length": 8, "timezone": "Asia/Yerevan"},
  {"country_code": "BG", "operators": [{"name": "Bulsatcom", "mccmnc": "28411"}, {"name": "\u041d\u043a\u0436\u0438", "mccmnc": "28407"}, {"name": "\u0422\u0438.\u043a\u043e\u043c", "mccmnc": "28413"}], "dial_code": "+359", "phone_number_length": 8, "timezone": "Europe/Sofia"},
  {"country_code": "TR", "operators": [{"name": "T\u00fcrk Telekom", "mccmnc": "28603"}, {"name": "Turkcell", "mccmnc": "28601"}, {"name": "Vodafone", "mccmnc": "28602"}], "dial_code": "+90", "phone_number_length": 10, "timezone": "Europe/Istanbul"},
  {"country_code": "FO", "operators": [{"name": "Tosa Sp/F", "mccmnc": "28803"}, {"name": "Nema", "mccmnc": "28802"}, {"name": "F\u00f8roya Tele", "mccmnc": "28801"}], "dial_code": "+298", "phone_number_length": 6, "timezone": "Atlantic/Faeroe"},
  {"country_code": "GL", "operators": [{"name": "Nanoq Media", "mccmnc": "29002"}, {"name": "Tusass", "mccmnc": "29001"}], "dial_code": "+299", "phone_number_length": 6, "timezone": "America/Godthab"},
  {"country_code": "SM", "operators": [{"name": "Prima", "mccmnc": "29201"}], "dial_code": "+378", "phone_number_length": 8, "timezone": "Europe/San_Marino"},
  {"country_code": "SI", "operators": [{"name": "Mobitel", "mccmnc": "29341"}, {"name": "S\u017d", "mccmnc": "29310"}, {"name": "A1 Si", "mccmnc": "29340"}, {"name": "Telemach", "mccmnc": "29370"}], "dial_code": "+386", "phone_number_length": 8, "timezone": "Europe/Ljubljana"},
  {"country_code": "MK", "operators": [{"name": "Lycamobile", "mccmnc": "29404"}, {"name": "Telekom.mk", "mccmnc": "29401"}, {"name": "A1 Mk", "mccmnc": "29403"}], "dial_code": "+389", "phone_number_length": 8, "timezone": "Europe/Skopje"},
  {"country_code": "LI", "operators": [{"name": "7Acht", "mccmnc": "29502"}, {"name": "Fl1", "mccmnc": "29505"}, {"name": "Swisscom", "mccmnc": "29501"}], "dial_code": "+423", "phone_number_length": 9, "timezone": "Europe/Vaduz"},
  {"country_code": "ME", "operators": [{"name": "Telekom.Me", "mccmnc": "29702"}, {"name": "M:Tel", "mccmnc": "29703"}, {"name": "One", "mccmnc": "29701"}], "dial_code": "+382", "phone_number_length": 8, "timezone": "Europe/Podgorica"},
  {"country_code": "CA", "operators": [{"name": "Xplore", "mccmnc": "302131"}, {"name": "Bell / Telus / SaskTel", "mccmnc": "302880"}, {"name": "Rogers (Vid\u00e9otron MOCN)", "mccmnc": "302520"}], "dial_code": "+1", "phone_number_length": 10, "timezone": "America/Halifax"},
  {"country_code": "PM", "operators": [{"name": "Ameris", "mccmnc": "30801"}, {"name": "Globaltel", "mccmnc": "30802"}], "dial_code": "+508", "phone_number_length": 6, "timezone": "America/Miquelon"},
  {"country_code": "US", "operators": [{"name": "Carolina West Wireless", "mccmnc": "310130"}, {"name": "Aeris", "mccmnc": "310850"}, {"name": "Redzone Wireless", "mccmnc": "312780"}], "dial_code": "+1", "phone_number_length": 10, "timezone": "America/New_York"},
  {"country_code": "GU", "operators": [{"name": "IT&E Wireless", "mccmnc": "311250"}, {"name": "Docomo", "mccmnc": "310370"}, {"name": "GTA Wireless", "mccmnc": "310140"}], "dial_code": "+1", "phone_number_length": 10, "timezone": "Pacific/Guam"},
  {"country_code": "BM", "operators": [{"name": "Cellular One", "mccmnc": "31059"}, {"name": "One", "mccmnc": "35000"}, {"name": "Digicel Bermuda", "mccmnc": "338050"}], "dial_code": "+1", "phone_number_length": 10, "timezone": "America/Adak"},
  {"country_code": "MP", "operators": [{"name": "IT&E Wireless", "mccmnc": "310110"}, {"name": "Docomo", "mccmnc": "310370"}], "dial_code": "+1", "phone_number_length": 10, "timezone": "Pacific/Saipan"},
  {"country_code": "AS", "operators": [{"name": "Bluesky", "mccmnc": "54411"}, {"name": "Astca", "mccmnc": "311780"}], "dial_code": "+1", "phone_number_length": 10, "timezone": "America/Adak"},
  {"country_code": "PR", "operators": [{"name": "Liberty", "mccmnc": "313790"}, {"name": "Open Mobile", "mccmnc": "330120"}, {"name": "T-Mobile", "mccmnc": "310260"}, {"name": "Claro Puerto Rico", "mccmnc": "330110"}], "dial_code": "+1", "phone_number_length": 10, "timezone": "America/Puerto_Rico"},
  {"country_code": "MX", "operators": [{"name": "Telcel", "mccmnc": "334020"}, {"name": "FreedomPop", "mccmnc": "334180"}, {"name": "Movistar", "mccmnc": "334030"}], "dial_code": "+52", "phone_number_length": 10, "timezone": "America/Mexico_City"},
  {"country_code": "JM", "operators": [{"name": "Flow", "mccmnc": "338110"}, {"name": "Digicel", "mccmnc": "33805"}], "dial_code": "+1", "phone_number_length": 10, "timezone": "America/Adak"},
  {"country_code": "LC", "operators": [{"name": "Flow", "mccmnc": "358110"}, {"name": "Digicel", "mccmnc": "338050"}], "dial_code": "+1", "phone_number_length": 10, "timezone": "America/Adak"},
  {"country_code": "BL", "operators": [{"name": "SFR Cara\u00efbe", "mccmnc": "34002"}, {"name": "Orange", "mccmnc": "34001"}, {"name": "Dauphin", "mccmnc": "34008"}], "dial_code": "+590", "phone_number_length": 9, "timezone": "America/Guadeloupe"},
  {"country_code": "BB", "operators": [{"name": "Sunbeach Communications", "mccmnc": "342820"}, {"name": "Digicel", "mccmnc": "342750"}, {"name": "Flow", "mccmnc": "342600"}], "dial_code": "+1", "phone_number_length": 10, "timezone": "America/Adak"},
  {"country_code": "AG", "operators": [{"name": "Digicel", "mccmnc": "344050"}, {"name": "Apua", "mccmnc": "344030"}, {"name": "Flow", "mccmnc": "344920"}], "dial_code": "+1", "phone_number_length": 10, "timezone": "America/Adak"},
  {"country_code": "KY", "operators": [{"name": "Logic", "mccmnc": "346001"}, {"name": "Digicel", "mccmnc": "33805"}, {"name": "Flow", "mccmnc": "346140"}], "dial_code": "+1", "phone_number_length": 10, "timezone": "America/Adak"},
  {"country_code": "VG", "operators": [{"name": "CCT Boatphone", "mccmnc": "348570"}, {"name": "Digicel", "mccmnc": "348770"}, {"name": "Flow", "mccmnc": "348170"}], "dial_code": "+1", "phone_number_length": 10, "timezone": "America/Adak"},
  {"country_code": "GD", "operators": [{"name": "Flow", "mccmnc": "352110"}, {"name": "Digicel", "mccmnc": "352030"}], "dial_code": "+1", "phone_number_length": 10, "timezone": "America/Adak"},
  {"country_code": "MS", "operators": [{"name": "Flow", "mccmnc": "354860"}, {"name": "Digicel", "mccmnc": "33805"}], "dial_code": "+1", "phone_number_length": 10, "timezone": "America/Adak"},
  {"country_code": "KN", "operators": [{"name": "Flow", "mccmnc": "356110"}, {"name": "Digicel", "mccmnc": "356050"}], "dial_code": "+1", "phone_number_length": 10, "timezone": "America/Adak"},
  {"country_code": "VC", "operators": [{"name": "Flow", "mccmnc": "360110"}, {"name": "Cable & Wireless", "mccmnc": "360100"}, {"name": "Digicel", "mccmnc": "360050"}], "dial_code": "+1", "phone_number_length": 10, "timezone": "America/Adak"},
  {"country_code": "BQ", "operators": [{"name": "Bay\u00f2s", "mccmnc": "36294"}, {"name": "Ecc", "mccmnc": "36254"}, {"name": "Flow", "mccmnc": "36291"}, {"name": "Telcell", "mccmnc": "36251"}], "dial_code": "+599", "phone_number_length": 7, "timezone": "America/Curacao"},
  {"country_code": "AW", "operators": [{"name": "Digicel", "mccmnc": "36302"}, {"name": "Setar", "mccmnc": "36301"}], "dial_code": "+297", "phone_number_length": 7, "timezone": "America/Aruba"},
  {"country_code": "BS", "operators": [{"name": "Btc", "mccmnc": "36439"}, {"name": "Aliv", "mccmnc": "36449"}], "dial_code": "+1", "phone_number_length": 10, "timezone": "America/Adak"},
  {"country_code": "AI", "operators": [{"name": "Digicel", "mccmnc": "365010"}, {"name": "Flow", "mccmnc": "365840"}], "dial_code": "+1", "phone_number_length": 10, "timezone": "America/Adak"},
  {"country_code": "DM", "operators": [{"name": "Flow", "mccmnc": "366110"}, {"name": "Digicel", "mccmnc": "366020"}], "dial_code": "+1", "phone_number_length": 10, "timezone": "America/Adak"},
  {"country_code": "CU", "operators": [{"name": "Cubacel", "mccmnc": "36801"}], "dial_code": "+53", "phone_number_length": 8, "timezone": "America/Havana"},
  {"country_code": "DO", "operators": [{"name": "Viva", "mccmnc": "37004"}, {"name": "Altice", "mccmnc": "37001"}, {"name": "Wind", "mccmnc": "37005"}, {"name": "Claro", "mccmnc": "37002"}], "dial_code": "+1", "phone_number_length": 10, "timezone": "America/Santo_Domingo"},
  {"country_code": "HT", "operators": [{"name": "Natcom", "mccmnc": "37203"}, {"name": "Digicel", "mccmnc": "37202"}], "dial_code": "+509", "phone_number_length": 8, "timezone": "America/Port-au-Prince"},
  {"country_code": "TT", "operators": [{"name": "Digicel", "mccmnc": "374130"}, {"name": "Bmobile", "mccmnc": "37412"}], "dial_code": "+1", "phone_number_length": 10, "timezone": "America/Adak"},
  {"country_code": "TC", "operators": [{"name": "Flow", "mccmnc": "376350"}, {"name": "Digicel (Turks & Caicos) Limited", "mccmnc": "376351"}, {"name": "Digicel", "mccmnc": "338050"}], "dial_code": "+1", "phone_number_length": 10, "timezone": "America/Adak"},
  {"country_code": "AZ", "operators": [{"name": "Fonex", "mccmnc": "40003"}, {"name": "Naxtel", "mccmnc": "40006"}, {"name": "Nar Mobile", "mccmnc": "40004"}], "dial_code": "+994", "phone_number_length": 9, "timezone": "Asia/Baku"},
  {"country_code": "KZ", "operators": [{"name": "Kazakhtelecom", "mccmnc": "40108"}, {"name": "Tele2.kz", "mccmnc": "40177"}, {"name": "Beeline", "mccmnc": "40101"}], "dial_code": "+7", "phone_number_length": 10, "timezone": "Asia/Almaty"},
  {"country_code": "BT", "operators": [{"name": "TashiCell", "mccmnc": "40277"}, {"name": "B-Mobile", "mccmnc": "40211"}], "dial_code": "+975", "phone_number_length": 8, "timezone": "Asia/Thimphu"},
  {"country_code": "IN", "operators": [{"name": "AirTel", "mccmnc": "40431"}, {"name": "Jio", "mccmnc": "405869"}, {"name": "BSNL Mobile", "mccmnc": "40476"}, {"name": "Reliance", "mccmnc": "40507"}], "dial_code": "+91", "phone_number_length": 10, "timezone": "Asia/Kolkata"},
  {"country_code": "PK", "operators": [{"name": "3G EVO / CharJi 4G", "mccmnc": "41002"}, {"name": "Jazz", "mccmnc": "41001"}, {"name": "Zong", "mccmnc": "41004"}, {"name": "SCO Mobile", "mccmnc": "41008"}], "dial_code": "+92", "phone_number_length": 10, "timezone": "Asia/Karachi"},
  {"country_code": "AF", "operators": [{"name": "Roshan", "mccmnc": "41220"}, {"name": "Etisalat", "mccmnc": "41250"}, {"name": "Mtn", "mccmnc": "41240"}], "dial_code": "+93", "phone_number_length": 9, "timezone": "Asia/Kabul"},
  {"country_code": "LK", "operators": [{"name": "Dialog", "mccmnc": "41311"}, {"name": "Airtel", "mccmnc": "41305"}, {"name": "Lanka Bell", "mccmnc": "41304"}], "dial_code": "+94", "phone_number_length": 9, "timezone": "Asia/Colombo"},
  {"country_code": "MM", "operators": [{"name": "Telenor", "mccmnc": "41406"}, {"name": "Mpt", "mccmnc": "41401"}, {"name": "Acs", "mccmnc": "41421"}, {"name": "Mytel", "mccmnc": "41409"}], "dial_code": "+95", "phone_number_length": 8, "timezone": "Asia/Yangon"},
  {"country_code": "LB", "operators": [{"name": "Touch", "mccmnc": "41503"}, {"name": "Ogero Telecom", "mccmnc": "41505"}, {"name": "Alfa", "mccmnc": "41501"}], "dial_code": "+961", "phone_number_length": 8, "timezone": "Asia/Beirut"},
  {"country_code": "JO", "operators": [{"name": "Umniah", "mccmnc": "41603"}, {"name": "zain JO", "mccmnc": "41601"}, {"name": "Orange", "mccmnc": "41677"}], "dial_code": "+962", "phone_number_length": 9, "timezone": "Asia/Amman"},
  {"country_code": "SY", "operators": [{"name": "Mtn", "mccmnc": "41702"}, {"name": "Syriatel", "mccmnc": "41701"}], "dial_code": "+963", "phone_number_length": 9, "timezone": "Asia/Damascus"},
  {"country_code": "IQ", "operators": [{"name": "SanaTel", "mccmnc": "41808"}, {"name": "Asia Cell", "mccmnc": "41800"}, {"name": "Mobitel", "mccmnc": "41845"}], "dial_code": "+964", "phone_number_length": 10, "timezone": "Asia/Baghdad"},
  {"country_code": "KW", "operators": [{"name": "zain KW", "mccmnc": "41902"}, {"name": "Ooredoo", "mccmnc": "41903"}, {"name": "Stc", "mccmnc": "41904"}], "dial_code": "+965", "phone_number_length": 8, "timezone": "Asia/Kuwait"},
  {"country_code": "SA", "operators": [{"name": "Al Jawal (STC )", "mccmnc": "42001"}, {"name": "Lebara Mobile", "mccmnc": "42006"}, {"name": "Mobily", "mccmnc": "42003"}, {"name": "Virgin Mobile", "mccmnc": "42005"}], "dial_code": "+966", "phone_number_length": 9, "timezone": "Asia/Riyadh"},
  {"country_code": "YE", "operators": [{"name": "Yemen Mobile", "mccmnc": "42103"}, {"name": "You", "mccmnc": "42102"}, {"name": "Yemen-4G", "mccmnc": "42110"}, {"name": "SabaFon", "mccmnc": "42101"}], "dial_code": "+967", "phone_number_length": 9, "timezone": "Asia/Aden"},
  {"country_code": "OM", "operators": [{"name": "Ooredoo", "mccmnc": "42203"}, {"name": "Vodafone", "mccmnc": "42206"}, {"name": "Omantel", "mccmnc": "42202"}], "dial_code": "+968", "phone_number_length": 8, "timezone": "Asia/Muscat"},
  {"country_code": "AE", "operators": [{"name": "Du", "mccmnc": "42403"}, {"name": "Etisalat", "mccmnc": "42402"}], "dial_code": "+971", "phone_number_length": 9, "timezone": "Asia/Dubai"},
  {"country_code": "IL", "operators": [{"name": "Wataniya Mobile", "mccmnc": "42506"}, {"name": "Jawwal", "mccmnc": "42505"}, {"name": "Cellcom", "mccmnc": "42502"}], "dial_code": "+972", "phone_number_length": 9, "timezone": "Asia/Jerusalem"},
  {"country_code": "BH", "operators": [{"name": "Stc", "mccmnc": "42604"}, {"name": "Batelco", "mccmnc": "42605"}, {"name": "zain BH", "mccmnc": "42602"}], "dial_code": "+973", "phone_number_length": 8, "timezone": "Asia/Bahrain"},
  {"country_code": "QA", "operators": [{"name": "Vodafone", "mccmnc": "42702"}, {"name": "Ministry of Interior", "mccmnc": "42705"}, {"name": "Ooredoo", "mccmnc": "42701"}], "dial_code": "+974", "phone_number_length": 8, "timezone": "Asia/Qatar"},
  {"country_code": "MN", "operators": [{"name": "G-Mobile", "mccmnc": "42898"}, {"name": "Mobicom", "mccmnc": "42899"}, {"name": "Unitel", "mccmnc": "42888"}, {"name": "Skytel", "mccmnc": "42891"}], "dial_code": "+976", "phone_number_length": 8, "timezone": "Asia/Choibalsan"},
  {"country_code": "NP", "operators": [{"name": "SmartCell", "mccmnc": "42904"}, {"name": "Namaste / NT Mobile / Sky Phone", "mccmnc": "42901"}, {"name": "Ncell", "mccmnc": "42902"}], "dial_code": "+977", "phone_number_length": 10, "timezone": "Asia/Kathmandu"},
  {"country_code": "IR", "operators": [{"name": "Mobinnet", "mccmnc": "43244"}, {"name": "Kish Cell Pars", "mccmnc": "43201"}, {"name": "IR-TCI (Hamrah-e-Avval)", "mccmnc": "43211"}], "dial_code": "+98", "phone_number_length": 10, "timezone": "Asia/Tehran"},
  {"country_code": "UZ", "operators": [{"name": "Perfectum Mobile", "mccmnc": "43406"}, {"name": "Mobiuz", "mccmnc": "43407"}, {"name": "Evo", "mccmnc": "43409"}], "dial_code": "+998", "phone_number_length": 9, "timezone": "Asia/Tashkent"},
  {"country_code": "TJ", "operators": [{"name": "Babilon-M", "mccmnc": "43604"}, {"name": "MegaFon", "mccmnc": "43603"}, {"name": "Babilon-T", "mccmnc": "43610"}, {"name": "ZET-Mobile", "mccmnc": "43605"}], "dial_code": "+992", "phone_number_length": 9, "timezone": "Asia/Dushanbe"},
  {"country_code": "KG", "operators": [{"name": "Beeline", "mccmnc": "43701"}, {"name": "MegaCom", "mccmnc": "43705"}, {"name": "O!", "mccmnc": "43709"}, {"name": "Saima Telecom", "mccmnc": "43710"}], "dial_code": "+996", "phone_number_length": 9, "timezone": "Asia/Bishkek"},
  {"country_code": "TM", "operators": [{"name": "Agts Cdma", "mccmnc": "43803"}, {"name": "TM-Cell", "mccmnc": "43802"}], "dial_code": "+993", "phone_number_length": 8, "timezone": "Asia/Ashgabat"},
  {"country_code": "JP", "operators": [{"name": "KDDI Corporation", "mccmnc": "44001"}, {"name": "Wireless City Planning Inc.", "mccmnc": "44005"}, {"name": "SoftBank", "mccmnc": "44021"}, {"name": "Marubeni Network Solutions Inc.", "mccmnc": "44009"}], "dial_code": "+81", "phone_number_length": 10, "timezone": "Asia/Tokyo"},
  {"country_code": "KR", "operators": [{"name": "Kt", "mccmnc": "45004"}, {"name": "Tplus", "mccmnc": "45011"}, {"name": "Olleh", "mccmnc": "45008"}, {"name": "SKTelecom", "mccmnc": "45005"}], "dial_code": "+82", "phone_number_length": 10, "timezone": "Asia/Seoul"},
  {"country_code": "VN", "operators": [{"name": "Vinaphone", "mccmnc": "45202"}, {"name": "MobiFone", "mccmnc": "45201"}, {"name": "I-Telecom", "mccmnc": "45208"}], "dial_code": "+84", "phone_number_length": 9, "timezone": "Asia/Ho_Chi_Minh"},
  {"country_code": "HK", "operators": [{"name": "Hong Kong Broadband Network", "mccmnc": "45432"}, {"name": "PCCW Mobile (4G)", "mccmnc": "45420"}, {"name": "PCCW Mobile (CDMA)", "mccmnc": "45429"}], "dial_code": "+852", "phone_number_length": 8, "timezone": "Asia/Hong_Kong"},
  {"country_code": "MO", "operators": [{"name": "Ctm", "mccmnc": "45504"}, {"name": "China Telecom", "mccmnc": "45507"}, {"name": "SmarTone", "mccmnc": "45506"}], "dial_code": "+853", "phone_number_length": 8, "timezone": "Asia/Shanghai"},
  {"country_code": "KH", "operators": [{"name": "Metfone", "mccmnc": "45609"}, {"name": "Cellcard", "mccmnc": "45618"}, {"name": "Smart", "mccmnc": "45606"}], "dial_code": "+855", "phone_number_length": 8, "timezone": "Asia/Phnom_Penh"},
  {"country_code": "LA", "operators": [{"name": "LaoTel", "mccmnc": "45701"}, {"name": "Tplus", "mccmnc": "45708"}, {"name": "Etl", "mccmnc": "45702"}, {"name": "Unitel", "mccmnc": "45703"}], "dial_code": "+856", "phone_number_length": 10, "timezone": "Asia/Vientiane"},
  {"country_code": "CN", "operators": [{"name": "China Mobile", "mccmnc": "46000"}, {"name": "China Broadnet", "mccmnc": "46015"}, {"name": "China Tietong", "mccmnc": "46020"}], "dial_code": "+86", "phone_number_length": 11, "timezone": "Asia/Shanghai"},
  {"country_code": "TW", "operators": [{"name": "T Star", "mccmnc": "46689"}, {"name": "Vmax", "mccmnc": "46609"}, {"name": "Chunghwa", "mccmnc": "46692"}, {"name": "G1", "mccmnc": "46610"}], "dial_code": "+886", "phone_number_length": 9, "timezone": "Asia/Taipei"},
  {"country_code": "KP", "operators": [{"name": "Koryolink", "mccmnc": "46705"}, {"name": "Kang Song NET", "mccmnc": "46706"}], "dial_code": "+850", "phone_number_length": 10, "timezone": "Asia/Pyongyang"},
  {"country_code": "BD", "operators": [{"name": "Airtel", "mccmnc": "47007"}, {"name": "Robi", "mccmnc": "47002"}, {"name": "Grameenphone", "mccmnc": "47001"}], "dial_code": "+880", "phone_number_length": 10, "timezone": "Asia/Dhaka"},
  {"country_code": "MV", "operators": [{"name": "Dhiraagu", "mccmnc": "47201"}, {"name": "Ooredoo", "mccmnc": "47202"}], "dial_code": "+960", "phone_number_length": 7, "timezone": "Indian/Maldives"},
  {"country_code": "MY", "operators": [{"name": "Celcom", "mccmnc": "50219"}, {"name": "TM Homeline", "mccmnc": "50211"}, {"name": "Telin", "mccmnc": "502157"}], "dial_code": "+60", "phone_number_length": 9, "timezone": "Asia/Kuching"},
  {"country_code": "AU", "operators": [{"name": "Challenge Networks Pty", "mccmnc": "50523"}, {"name": "Aapt", "mccmnc": "50514"}, {"name": "RailCorp", "mccmnc": "50513"}], "dial_code": "+61", "phone_number_length": 9, "timezone": "Australia/Adelaide"},
  {"country_code": "ID", "operators": [{"name": "Psn", "mccmnc": "51000"}, {"name": "Telkomsel", "mccmnc": "51010"}, {"name": "Smartfren", "mccmnc": "51009"}], "dial_code": "+62", "phone_number_length": 9, "timezone": "Asia/Jakarta"},
  {"country_code": "TL", "operators": [{"name": "Telemor", "mccmnc": "51403"}, {"name": "Telkomcel", "mccmnc": "51401"}, {"name": "Tt", "mccmnc": "51402"}], "dial_code": "+670", "phone_number_length": 8, "timezone": "Asia/Dili"},
  {"country_code": "PH", "operators": [{"name": "Globe", "mccmnc": "51502"}, {"name": "Dito", "mccmnc": "51566"}, {"name": "Next Mobile Inc.", "mccmnc": "51588"}, {"name": "ABS-CBN Mobile", "mccmnc": "51524"}], "dial_code": "+63", "phone_number_length": 10, "timezone": "Asia/Manila"},
  {"country_code": "TH", "operators": [{"name": "Dtac", "mccmnc": "52018"}, {"name": "TrueMove H", "mccmnc": "52004"}, {"name": "dtac-T", "mccmnc": "52047"}, {"name": "AIS-T / NT Mobile", "mccmnc": "52015"}], "dial_code": "+66", "phone_number_length": 9, "timezone": "Asia/Bangkok"},
  {"country_code": "SG", "operators": [{"name": "SingTel", "mccmnc": "52501"}, {"name": "M1", "mccmnc": "52503"}, {"name": "StarHub", "mccmnc": "52505"}, {"name": "Grid", "mccmnc": "52512"}], "dial_code": "+65", "phone_number_length": 8, "timezone": "Asia/Singapore"},
  {"country_code": "BN", "operators": [{"name": "Dst", "mccmnc": "52811"}, {"name": "Telekom Brunei Berhad", "mccmnc": "52801"}, {"name": "Pcsb", "mccmnc": "52802"}], "dial_code": "+673", "phone_number_length": 7, "timezone": "Asia/Brunei"},
  {"country_code": "NZ", "operators": [{"name": "Spark", "mccmnc": "53005"}, {"name": "2Degrees", "mccmnc": "53024"}, {"name": "Vodafone", "mccmnc": "53001"}], "dial_code": "+64", "phone_number_length": 9, "timezone": "Pacific/Auckland"},
  {"country_code": "NR", "operators": [{"name": "Digicel", "mccmnc": "53602"}], "dial_code": "+674", "phone_number_length": 7, "timezone": "Pacific/Nauru"},
  {"country_code": "PG", "operators": [{"name": "Digicel", "mccmnc": "53703"}, {"name": "Bmobile", "mccmnc": "53701"}, {"name": "Citifon", "mccmnc": "53702"}], "dial_code": "+675", "phone_number_length": 8, "timezone": "Pacific/Port_Moresby"},
  {"country_code": "TO", "operators": [{"name": "Shoreline Communication", "mccmnc": "53943"}, {"name": "Digicel", "mccmnc": "53988"}, {"name": "U-Call", "mccmnc": "53901"}], "dial_code": "+676", "phone_number_length": 7, "timezone": "Pacific/Tongatapu"},
  {"country_code": "SB", "operators": [{"name": "Breeze", "mccmnc": "54001"}, {"name": "BeMobile", "mccmnc": "54002"}], "dial_code": "+677", "phone_number_length": 7, "timezone": "Pacific/Guadalcanal"},
  {"country_code": "VU", "operators": [{"name": "WanTok", "mccmnc": "54107"}, {"name": "Ail", "mccmnc": "54100"}, {"name": "Smile", "mccmnc": "54101"}], "dial_code": "+678", "phone_number_length": 7, "timezone": "Pacific/Efate"},
  {"country_code": "FJ", "operators": [{"name": "Tfl", "mccmnc": "54203"}, {"name": "Digicel", "mccmnc": "54202"}, {"name": "Vodafone", "mccmnc": "54201"}], "dial_code": "+679", "phone_number_length": 7, "timezone": "Pacific/Fiji"},
  {"country_code": "WF", "operators": [{"name": "Manuia", "mccmnc": "54301"}], "dial_code": "+681", "phone_number_length": 6, "timezone": "Pacific/Wallis"},
  {"country_code": "KI", "operators": [{"name": "OceanLink", "mccmnc": "54502"}, {"name": "Kiribati", "mccmnc": "54509"}], "dial_code": "+686", "phone_number_length": 8, "timezone": "Pacific/Enderbury"},
  {"country_code": "NC", "operators": [{"name": "Mobilis", "mccmnc": "54601"}], "dial_code": "+687", "phone_number_length": 6, "timezone": "Pacific/Noumea"},
  {"country_code": "PF", "operators": [{"name": "Vodafone", "mccmnc": "54715"}, {"name": "Ora", "mccmnc": "54705"}, {"name": "Vini", "mccmnc": "54720"}], "dial_code": "+689", "phone_number_length": 8, "timezone": "Pacific/Gambier"},
  {"country_code": "CK", "operators": [{"name": "Vodafone", "mccmnc": "54801"}], "dial_code": "+682", "phone_number_length": 5, "timezone": "Pacific/Rarotonga"},
  {"country_code": "WS", "operators": [{"name": "Digicel", "mccmnc": "54901"}, {"name": "Vodafone", "mccmnc": "54927"}], "dial_code": "+685", "phone_number_length": 7, "timezone": "Pacific/Apia"},
  {"country_code": "FM", "operators": [{"name": "Fsmtc", "mccmnc": "55001"}], "dial_code": "+691", "phone_number_length": 7, "timezone": "Pacific/Truk"},
  {"country_code": "MH", "operators": [{"name": "Marshall Islands National Telecommunications Authority (MINTA)", "mccmnc": "55101"}], "dial_code": "+692", "phone_number_length": 7, "timezone": "Pacific/Majuro"},
  {"country_code": "PW", "operators": [{"name": "PT Waves", "mccmnc": "55202"}, {"name": "Pncc", "mccmnc": "55201"}, {"name": "Pmci", "mccmnc": "55299"}], "dial_code": "+680", "phone_number_length": 7, "timezone": "Pacific/Palau"},
  {"country_code": "TV", "operators": [{"name": "Ttc", "mccmnc": "55301"}], "dial_code": "+688", "phone_number_length": 6, "timezone": "Pacific/Funafuti"},
  {"country_code": "TK", "operators": [{"name": "Teletok", "mccmnc": "55401"}], "dial_code": "+690", "phone_number_length": 4, "timezone": "Pacific/Fakaofo"},
  {"country_code": "NU", "operators": [{"name": "Telecom Niue", "mccmnc": "55501"}], "dial_code": "+683", "phone_number_length": 7, "timezone": "Pacific/Niue"},
  {"country_code": "EG", "operators": [{"name": "We", "mccmnc": "60204"}, {"name": "Etisalat", "mccmnc": "60203"}, {"name": "Orange", "mccmnc": "60201"}, {"name": "Vodafone", "mccmnc": "60202"}], "dial_code": "+20", "phone_number_length": 10, "timezone": "Africa/Cairo"},
  {"country_code": "DZ", "operators": [{"name": "Ooredoo", "mccmnc": "60303"}, {"name": "At", "mccmnc": "60307"}, {"name": "Djezzy", "mccmnc": "60302"}], "dial_code": "+213", "phone_number_length": 9, "timezone": "Africa/Algiers"},
  {"country_code": "MA", "operators": [{"name": "Iam", "mccmnc": "60401"}, {"name": "Orange Morocco", "mccmnc": "60400"}, {"name": "Inwi", "mccmnc": "60402"}], "dial_code": "+212", "phone_number_length": 9, "timezone": "Africa/Casablanca"},
  {"country_code": "TN", "operators": [{"name": "Tunicell", "mccmnc": "60502"}, {"name": "Orange", "mccmnc": "60501"}, {"name": "Ooredoo", "mccmnc": "60503"}], "dial_code": "+216", "phone_number_length": 8, "timezone": "Africa/Tunis"},
  {"country_code": "LY", "operators": [{"name": "Al-Jeel Phone", "mccmnc": "60602"}, {"name": "Hatef Libya", "mccmnc": "60606"}, {"name": "Madar", "mccmnc": "60601"}, {"name": "Libyana", "mccmnc": "60600"}], "dial_code": "+218", "phone_number_length": 9, "timezone": "Africa/Tripoli"},
  {"country_code": "GM", "operators": [{"name": "QCell", "mccmnc": "60704"}, {"name": "Comium", "mccmnc": "60703"}, {"name": "Gamcel", "mccmnc": "60701"}], "dial_code": "+220", "phone_number_length": 7, "timezone": "Africa/Banjul"},
  {"country_code": "SN", "operators": [{"name": "Free", "mccmnc": "60802"}, {"name": "Expresso", "mccmnc": "60803"}, {"name": "Orange", "mccmnc": "60801"}], "dial_code": "+221", "phone_number_length": 9, "timezone": "Africa/Dakar"},
  {"country_code": "MR", "operators": [{"name": "Moov", "mccmnc": "60910"}, {"name": "Chinguitel", "mccmnc": "60902"}, {"name": "Mattel", "mccmnc": "60901"}], "dial_code": "+222", "phone_number_length": 8, "timezone": "Africa/Nouakchott"},
  {"country_code": "ML", "operators": [{"name": "Malitel", "mccmnc": "61001"}, {"name": "Orange", "mccmnc": "61002"}, {"name": "Telecel", "mccmnc": "61003"}], "dial_code": "+223", "phone_number_length": 8, "timezone": "Africa/Bamako"},
  {"country_code": "GN", "operators": [{"name": "Orange", "mccmnc": "61101"}, {"name": "Cellcom", "mccmnc": "61105"}, {"name": "Mtn", "mccmnc": "61104"}], "dial_code": "+224", "phone_number_length": 9, "timezone": "Africa/Conakry"},
  {"country_code": "CI", "operators": [{"name": "Caf\u00e9", "mccmnc": "61207"}, {"name": "Orange", "mccmnc": "61203"}, {"name": "Mtn", "mccmnc": "61205"}, {"name": "KoZ", "mccmnc": "61204"}], "dial_code": "+225", "phone_number_length": 9, "timezone": "Africa/Abidjan"},
  {"country_code": "BF", "operators": [{"name": "Telecel Faso", "mccmnc": "61303"}, {"name": "Telmob", "mccmnc": "61301"}, {"name": "Orange", "mccmnc": "61302"}], "dial_code": "+226", "phone_number_length": 8, "timezone": "Africa/Ouagadougou"},
  {"country_code": "NE", "operators": [{"name": "Moov", "mccmnc": "61403"}, {"name": "SahelCom", "mccmnc": "61401"}, {"name": "Airtel", "mccmnc": "61402"}], "dial_code": "+227", "phone_number_length": 8, "timezone": "Africa/Niamey"},
  {"country_code": "TG", "operators": [{"name": "Moov", "mccmnc": "61503"}, {"name": "Togo Cell", "mccmnc": "61501"}], "dial_code": "+228", "phone_number_length": 8, "timezone": "Africa/Lome"},
  {"country_code": "BJ", "operators": [{"name": "Moov", "mccmnc": "61602"}, {"name": "Benin Telecoms Mobile", "mccmnc": "61601"}, {"name": "Bbcom", "mccmnc": "61604"}, {"name": "Mtn", "mccmnc": "61603"}], "dial_code": "+229", "phone_number_length": 9, "timezone": "Africa/Porto-Novo"},
  {"country_code": "MU", "operators": [{"name": "Mokoze / Azu", "mccmnc": "61702"}, {"name": "Chili", "mccmnc": "61703"}, {"name": "My.T", "mccmnc": "61701"}, {"name": "Emtel", "mccmnc": "61710"}], "dial_code": "+230", "phone_number_length": 8, "timezone": "Indian/Mauritius"},
  {"country_code": "LR", "operators": [{"name": "Orange LBR", "mccmnc": "61807"}, {"name": "Lonestar Cell MTN", "mccmnc": "61801"}, {"name": "Libtelco", "mccmnc": "61820"}, {"name": "Novafone", "mccmnc": "61804"}], "dial_code": "+231", "phone_number_length": 9, "timezone": "Africa/Monrovia"},
  {"country_code": "SL", "operators": [{"name": "SierraTel", "mccmnc": "61906"}, {"name": "Africell", "mccmnc": "61905"}, {"name": "Smart Mobile", "mccmnc": "61909"}], "dial_code": "+232", "phone_number_length": 8, "timezone": "Africa/Freetown"},
  {"country_code": "GH", "operators": [{"name": "Lebara", "mccmnc": "62015"}, {"name": "Busy", "mccmnc": "62014"}, {"name": "Expresso", "mccmnc": "62004"}], "dial_code": "+233", "phone_number_length": 9, "timezone": "Africa/Accra"},
  {"country_code": "NG", "operators": [{"name": "Mtn", "mccmnc": "62130"}, {"name": "Spectranet", "mccmnc": "62124"}, {"name": "InterC", "mccmnc": "62122"}, {"name": "Swift", "mccmnc": "62126"}], "dial_code": "+234", "phone_number_length": 10, "timezone": "Africa/Lagos"},
  {"country_code": "TD", "operators": [{"name": "Tawali", "mccmnc": "62202"}, {"name": "Salam", "mccmnc": "62207"}, {"name": "Tigo", "mccmnc": "62203"}], "dial_code": "+235", "phone_number_length": 8, "timezone": "Africa/Ndjamena"},
  {"country_code": "CF", "operators": [{"name": "Orange", "mccmnc": "62303"}, {"name": "Tc", "mccmnc": "62302"}, {"name": "Azur", "mccmnc": "62304"}], "dial_code": "+236", "phone_number_length": 8, "timezone": "Africa/Bangui"},
  {"country_code": "CM", "operators": [{"name": "Orange", "mccmnc": "62402"}, {"name": "Camtel", "mccmnc": "62403"}, {"name": "MTN Cameroon", "mccmnc": "62401"}], "dial_code": "+237", "phone_number_length": 9, "timezone": "Africa/Douala"},
  {"country_code": "CV", "operators": [{"name": "T+", "mccmnc": "62502"}, {"name": "Cvmovel", "mccmnc": "62501"}], "dial_code": "+238", "phone_number_length": 7, "timezone": "Atlantic/Cape_Verde"},
  {"country_code": "ST", "operators": [{"name": "CSTmovel", "mccmnc": "62601"}, {"name": "Unitel STP", "mccmnc": "62602"}], "dial_code": "+239", "phone_number_length": 7, "timezone": "Africa/Sao_Tome"},
  {"country_code": "GQ", "operators": [{"name": "Muni", "mccmnc": "62703"}, {"name": "Orange GQ", "mccmnc": "62701"}], "dial_code": "+240", "phone_number_length": 9, "timezone": "Africa/Malabo"},
  {"country_code": "GA", "operators": [{"name": "Moov", "mccmnc": "62802"}, {"name": "Libertis", "mccmnc": "62801"}, {"name": "Airtel", "mccmnc": "62803"}], "dial_code": "+241", "phone_number_length": 7, "timezone": "Africa/Libreville"},
  {"country_code": "CG", "operators": [{"name": "Libertis Telecom", "mccmnc": "62910"}, {"name": "Airtel", "mccmnc": "62901"}], "dial_code": "+242", "phone_number_length": 8, "timezone": "Africa/Brazzaville"},
  {"country_code": "CD", "operators": [{"name": "Africell", "mccmnc": "63090"}, {"name": "Vodacom", "mccmnc": "63001"}, {"name": "Supercell", "mccmnc": "63005"}, {"name": "Airtel", "mccmnc": "63002"}], "dial_code": "+243", "phone_number_length": 9, "timezone": "Africa/Kinshasa"},
  {"country_code": "AO", "operators": [{"name": "Unitel", "mccmnc": "63102"}, {"name": "Movicel", "mccmnc": "63104"}, {"name": "Africell", "mccmnc": "63105"}], "dial_code": "+244", "phone_number_length": 9, "timezone": "Africa/Luanda"},
  {"country_code": "GW", "operators": [{"name": "Orange", "mccmnc": "63203"}, {"name": "Guinetel", "mccmnc": "63201"}, {"name": "MTN Areeba", "mccmnc": "63202"}], "dial_code": "+245", "phone_number_length": 9, "timezone": "Africa/Bissau"},
  {"country_code": "SC", "operators": [{"name": "Cable & Wireless", "mccmnc": "63301"}, {"name": "Airtel", "mccmnc": "63310"}, {"name": "Mediatech International", "mccmnc": "63302"}], "dial_code": "+248", "phone_number_length": 7, "timezone": "Indian/Mahe"},
  {"country_code": "SD", "operators": [{"name": "Canar", "mccmnc": "63405"}, {"name": "Zain SD", "mccmnc": "63401"}, {"name": "khartoum INC", "mccmnc": "63409"}, {"name": "Sudani One", "mccmnc": "63407"}], "dial_code": "+249", "phone_number_length": 9, "timezone": "Africa/Khartoum"},
  {"country_code": "RW", "operators": [{"name": "Olleh", "mccmnc": "63517"}, {"name": "Mtn", "mccmnc": "63510"}, {"name": "Airtel", "mccmnc": "63513"}], "dial_code": "+250", "phone_number_length": 9, "timezone": "Africa/Kigali"},
  {"country_code": "ET", "operators": [{"name": "Mtn", "mccmnc": "63601"}], "dial_code": "+251", "phone_number_length": 9, "timezone": "Africa/Addis_Ababa"},
  {"country_code": "SO", "operators": [{"name": "Hormuud", "mccmnc": "63750"}, {"name": "Nationlink", "mccmnc": "63710"}, {"name": "Somtel", "mccmnc": "63771"}], "dial_code": "+252", "phone_number_length": 8, "timezone": "Africa/Mogadishu"},
  {"country_code": "DJ", "operators": [{"name": "Evatis", "mccmnc": "63801"}], "dial_code": "+253", "phone_number_length": 8, "timezone": "Africa/Djibouti"},
  {"country_code": "KE", "operators": [{"name": "Safaricom", "mccmnc": "63902"}, {"name": "Airtel", "mccmnc": "63903"}, {"name": "Faiba 4G", "mccmnc": "63910"}], "dial_code": "+254", "phone_number_length": 9, "timezone": "Africa/Nairobi"},
  {"country_code": "TZ", "operators": [{"name": "TTCL Mobile", "mccmnc": "64007"}, {"name": "Airtel", "mccmnc": "64005"}, {"name": "Halotel", "mccmnc": "64009"}], "dial_code": "+255", "phone_number_length": 9, "timezone": "Africa/Dar_es_Salaam"},
  {"country_code": "UG", "operators": [{"name": "Airtel", "mccmnc": "64122"}, {"name": "K2", "mccmnc": "64144"}, {"name": "Smile", "mccmnc": "64133"}, {"name": "Mtn", "mccmnc": "64110"}], "dial_code": "+256", "phone_number_length": 9, "timezone": "Africa/Kampala"},
  {"country_code": "BI", "operators": [{"name": "Onatel", "mccmnc": "64203"}, {"name": "Lumitel", "mccmnc": "64208"}, {"name": "econet Leo", "mccmnc": "64201"}], "dial_code": "+257", "phone_number_length": 8, "timezone": "Africa/Bujumbura"},
  {"country_code": "MZ", "operators": [{"name": "Movitel", "mccmnc": "64303"}, {"name": "Vodacom", "mccmnc": "64304"}, {"name": "mCel", "mccmnc": "64301"}], "dial_code": "+258", "phone_number_length": 9, "timezone": "Africa/Maputo"},
  {"country_code": "ZM", "operators": [{"name": "Zamtel", "mccmnc": "64503"}, {"name": "Mtn", "mccmnc": "64502"}, {"name": "Airtel", "mccmnc": "64501"}], "dial_code": "+260", "phone_number_length": 9, "timezone": "Africa/Lusaka"},
  {"country_code": "MG", "operators": [{"name": "Telma", "mccmnc": "64604"}, {"name": "Orange", "mccmnc": "64602"}, {"name": "BIP / blueline", "mccmnc": "64605"}], "dial_code": "+261", "phone_number_length": 9, "timezone": "Indian/Antananarivo"},
  {"country_code": "YT", "operators": [{"name": "Orange", "mccmnc": "64700"}, {"name": "Free", "mccmnc": "64703"}, {"name": "Maor\u00e9 Mobile", "mccmnc": "64701"}, {"name": "Only", "mccmnc": "64702"}], "dial_code": "+262", "phone_number_length": 9, "timezone": "Indian/Mayotte"},
  {"country_code": "ZW", "operators": [{"name": "Telecel", "mccmnc": "64803"}, {"name": "Net*One", "mccmnc": "64801"}, {"name": "Econet", "mccmnc": "64804"}], "dial_code": "+263", "phone_number_length": 9, "timezone": "Africa/Harare"},
  {"country_code": "NA", "operators": [{"name": "Mtc", "mccmnc": "64901"}, {"name": "Paratus Telecommunications (Pty)", "mccmnc": "64904"}, {"name": "Switch", "mccmnc": "64902"}], "dial_code": "+264", "phone_number_length": 9, "timezone": "Africa/Windhoek"},
  {"country_code": "MW", "operators": [{"name": "Mtl", "mccmnc": "65003"}, {"name": "Tnm", "mccmnc": "65001"}, {"name": "Airtel", "mccmnc": "65010"}], "dial_code": "+265", "phone_number_length": 9, "timezone": "Africa/Blantyre"},
  {"country_code": "LS", "operators": [{"name": "Econet Telecom", "mccmnc": "65102"}, {"name": "Vodacom", "mccmnc": "65101"}], "dial_code": "+266", "phone_number_length": 8, "timezone": "Africa/Maseru"},
  {"country_code": "BW", "operators": [{"name": "Orange", "mccmnc": "65202"}, {"name": "Mascom", "mccmnc": "65201"}, {"name": "beMobile", "mccmnc": "65204"}], "dial_code": "+267", "phone_number_length": 8, "timezone": "Africa/Gaborone"},
  {"country_code": "SZ", "operators": [{"name": "Eswatini Mobile Limited", "mccmnc": "65302"}, {"name": "Sptc", "mccmnc": "65301"}, {"name": "MTN Eswatini", "mccmnc": "65310"}], "dial_code": "+268", "phone_number_length": 8, "timezone": "Africa/Mbabane"},
  {"country_code": "KM", "operators": [{"name": "Huri", "mccmnc": "65401"}, {"name": "Telco Sa", "mccmnc": "65402"}], "dial_code": "+269", "phone_number_length": 7, "timezone": "Indian/Comoro"},
  {"country_code": "ZA", "operators": [{"name": "Ilizwi Telecommunications", "mccmnc": "65532"}, {"name": "SMS Cellular Services (Pty)", "mccmnc": "65546"}, {"name": "Neotel", "mccmnc": "65514"}, {"name": "Cell C", "mccmnc": "65507"}], "dial_code": "+27", "phone_number_length": 9, "timezone": "Africa/Johannesburg"},
  {"country_code": "ER", "operators": [{"name": "Eritel", "mccmnc": "65701"}], "dial_code": "+291", "phone_number_length": 7, "timezone": "Africa/Asmara"},
  {"country_code": "SS", "operators": [{"name": "Zain", "mccmnc": "65906"}, {"name": "Sudani", "mccmnc": "65907"}, {"name": "Gemtel", "mccmnc": "65903"}], "dial_code": "+211", "phone_number_length": 9, "timezone": "Africa/Nairobi"},
  {"country_code": "BZ", "operators": [{"name": "Smart", "mccmnc": "70269"}, {"name": "DigiCell", "mccmnc": "70267"}], "dial_code": "+501", "phone_number_length": 7, "timezone": "America/Belize"},
  {"country_code": "GT", "operators": [{"name": "Claro", "mccmnc": "70403"}, {"name": "Tigo", "mccmnc": "70402"}], "dial_code": "+502", "phone_number_length": 8, "timezone": "America/Guatemala"},
  {"country_code": "SV", "operators": [{"name": "Tigo", "mccmnc": "70603"}, {"name": "Claro", "mccmnc": "70601"}, {"name": "Digicel", "mccmnc": "70602"}, {"name": "Movistar", "mccmnc": "70604"}], "dial_code": "+503", "phone_number_length": 8, "timezone": "America/El_Salvador"},
  {"country_code": "HN", "operators": [{"name": "Hondutel", "mccmnc": "708030"}, {"name": "Claro", "mccmnc": "708001"}, {"name": "Tigo", "mccmnc": "708002"}], "dial_code": "+504", "phone_number_length": 8, "timezone": "America/Tegucigalpa"},
  {"country_code": "NI", "operators": [{"name": "Tigo", "mccmnc": "710300"}, {"name": "Claro", "mccmnc": "71073"}], "dial_code": "+505", "phone_number_length": 8, "timezone": "America/Managua"},
  {"country_code": "CR", "operators": [{"name": "K\u00f6lbi ICE", "mccmnc": "71202"}, {"name": "Claro", "mccmnc": "71203"}, {"name": "Liberty", "mccmnc": "71204"}], "dial_code": "+506", "phone_number_length": 8, "timezone": "America/Costa_Rica"},
  {"country_code": "PA", "operators": [{"name": "Digicel", "mccmnc": "71404"}, {"name": "Claro", "mccmnc": "71403"}, {"name": "Cable & Wireless", "mccmnc": "71401"}], "dial_code": "+507", "phone_number_length": 8, "timezone": "America/Panama"},
  {"country_code": "PE", "operators": [{"name": "Movistar", "mccmnc": "71606"}, {"name": "Claro", "mccmnc": "71610"}, {"name": "Bitel", "mccmnc": "71615"}], "dial_code": "+51", "phone_number_length": 9, "timezone": "America/Lima"},
  {"country_code": "AR", "operators": [{"name": "Movistar", "mccmnc": "722010"}, {"name": "Personal", "mccmnc": "722034"}, {"name": "Claro", "mccmnc": "722310"}], "dial_code": "+54", "phone_number_length": 11, "timezone": "America/Buenos_Aires"},
  {"country_code": "BR", "operators": [{"name": "Ligue", "mccmnc": "72421"}, {"name": "Conecta", "mccmnc": "72454"}, {"name": "Surf Telecom", "mccmnc": "72417"}], "dial_code": "+55", "phone_number_length": 11, "timezone": "America/Sao_Paulo"},
  {"country_code": "CL", "operators": [{"name": "Will", "mccmnc": "73099"}, {"name": "Wom", "mccmnc": "73004"}, {"name": "Entel", "mccmnc": "73001"}], "dial_code": "+56", "phone_number_length": 9, "timezone": "America/Santiago"},
  {"country_code": "CO", "operators": [{"name": "Virgin Mobile", "mccmnc": "732154"}, {"name": "eTb", "mccmnc": "732187"}, {"name": "Logistica Flash Colombia SAS", "mccmnc": "732240"}, {"name": "Wom", "mccmnc": "732360"}], "dial_code": "+57", "phone_number_length": 10, "timezone": "America/Bogota"},
  {"country_code": "VE", "operators": [{"name": "Movilnet", "mccmnc": "73406"}, {"name": "Movistar", "mccmnc": "73404"}, {"name": "Digitel GSM", "mccmnc": "73402"}], "dial_code": "+58", "phone_number_length": 10, "timezone": "America/Caracas"},
  {"country_code": "BO", "operators": [{"name": "Tigo", "mccmnc": "73603"}, {"name": "Viva", "mccmnc": "73601"}, {"name": "Entel", "mccmnc": "73602"}], "dial_code": "+591", "phone_number_length": 8, "timezone": "America/La_Paz"},
  {"country_code": "GY", "operators": [{"name": "Quark Communications Inc.", "mccmnc": "738003"}, {"name": "GT&T Cellink Plus", "mccmnc": "738002"}, {"name": "Digicel", "mccmnc": "73801"}], "dial_code": "+592", "phone_number_length": 7, "timezone": "America/Guyana"},
  {"country_code": "EC", "operators": [{"name": "Claro", "mccmnc": "74001"}, {"name": "CNT Mobile", "mccmnc": "74002"}, {"name": "Tuenti", "mccmnc": "74003"}], "dial_code": "+593", "phone_number_length": 9, "timezone": "America/Guayaquil"},
  {"country_code": "PY", "operators": [{"name": "Tigo", "mccmnc": "74404"}, {"name": "Copaco", "mccmnc": "74406"}, {"name": "Vox", "mccmnc": "74401"}], "dial_code": "+595", "phone_number_length": 9, "timezone": "America/Asuncion"},
  {"country_code": "SR", "operators": [{"name": "Telesur", "mccmnc": "74602"}, {"name": "Digicel Group Limited", "mccmnc": "74604"}, {"name": "Digicel", "mccmnc": "74603"}], "dial_code": "+597", "phone_number_length": 7, "timezone": "America/Paramaribo"},
  {"country_code": "UY", "operators": [{"name": "Antel", "mccmnc": "74801"}, {"name": "Movistar", "mccmnc": "74807"}, {"name": "Claro", "mccmnc": "74810"}], "dial_code": "+598", "phone_number_length": 8, "timezone": "America/Montevideo"},
  {"country_code": "FK", "operators": [{"name": "Sure", "mccmnc": "750001"}], "dial_code": "+500", "phone_number_length": 5, "timezone": "Atlantic/Stanley"},
  {"country_code": "IO", "operators": [{"name": "Sure (Diego Garcia)", "mccmnc": "99501"}], "dial_code": "+246", "phone_number_length": 7, "timezone": "Indian/Chagos"},
];
var PHONE_NUMBER = "";
const SENSOR_LISTENERS = [];
const SENSOR_OBJECTS = [];



const deviceProfiles = [
    {
        brand: "samsung", manufacturer: "samsung", model: "SM-S948B", product: "titansultra", device: "titans",
        board: "s5e9955", hardware: "s5e9955", api: "36",
        fingerprint: "samsung/titansultrax/titans:16/B1A1.260201.001/S948BXXU1AXBA:user/release-keys",
        ua: "Mozilla/5.0 (Linux; Android 16; SM-S948B) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.7727.102 Mobile Safari/537.36",
        bootloader: "S948BXXU1AXBA"
    },
    {
        brand: "samsung", manufacturer: "samsung", model: "SM-S941B", product: "titans", device: "titans",
        board: "s5e9955", hardware: "s5e9955", api: "36",
        fingerprint: "samsung/titansx/titans:16/B1A1.260201.005/S941BXXU1AXBA:user/release-keys",
        ua: "Mozilla/5.0 (Linux; Android 16; SM-S941B) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.7727.80 Mobile Safari/537.36",
        bootloader: "S941BXXU1AXBA"
    },
    {
        brand: "samsung", manufacturer: "samsung", model: "SM-F966B", product: "q6q", device: "q6q",
        board: "kalama", hardware: "qcom", api: "35",
        fingerprint: "samsung/q6qxxx/q6q:15/AP1A.250805.001/F966BXXU1BXGA:user/release-keys",
        ua: "Mozilla/5.0 (Linux; Android 15; SM-F966B) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.6261.120 Mobile Safari/537.36",
        bootloader: "F966BXXU1BXGA"
    },
    {
        brand: "samsung", manufacturer: "samsung", model: "SM-A566B", product: "a56x", device: "a56",
        board: "s5e8845", hardware: "s5e8845", api: "36",
        fingerprint: "samsung/a56xxx/a56:16/B1A1.260301.012/A566BXXU1AXCA:user/release-keys",
        ua: "Mozilla/5.0 (Linux; Android 16; SM-A566B) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.7727.92 Mobile Safari/537.36",
        bootloader: "A566BXXU1AXCA"
    },
    {
        brand: "google", manufacturer: "Google", model: "Pixel 10 Pro", product: "komodo", device: "komodo",
        board: "laguna", hardware: "laguna", api: "36",
        fingerprint: "google/komodo/komodo:16/B1A1.251205.001/12845678:user/release-keys",
        ua: "Mozilla/5.0 (Linux; Android 16; Pixel 10 Pro) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.7727.102 Mobile Safari/537.36",
        bootloader: "komodo-16.0-12845678"
    },
    {
        brand: "google", manufacturer: "Google", model: "Pixel 10", product: "caiman", device: "caiman",
        board: "laguna", hardware: "laguna", api: "36",
        fingerprint: "google/caiman/caiman:16/B1A1.251205.001/12845611:user/release-keys",
        ua: "Mozilla/5.0 (Linux; Android 16; Pixel 10) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.7727.102 Mobile Safari/537.36",
        bootloader: "caiman-16.0-12845611"
    },
    {
        brand: "google", manufacturer: "Google", model: "Pixel 9 Pro XL", product: "komodo_old", device: "komodo",
        board: "zumapro", hardware: "zumapro", api: "35",
        fingerprint: "google/komodo/komodo:15/AP1A.241105.007/11567890:user/release-keys",
        ua: "Mozilla/5.0 (Linux; Android 15; Pixel 9 Pro XL) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.6100.0 Mobile Safari/537.36",
        bootloader: "komodo-15.0-11567890"
    },
    {
        brand: "OnePlus", manufacturer: "OnePlus", model: "CPH2681", product: "CPH2681", device: "OP592DL1",
        board: "sun", hardware: "qcom", api: "36",
        fingerprint: "OnePlus/CPH2681/OP592DL1:16/BKQ1.251215.001/R.202602151002:user/release-keys",
        ua: "Mozilla/5.0 (Linux; Android 16; CPH2681) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.7727.102 Mobile Safari/537.36",
        bootloader: "CPH2681_16_A.01"
    },
    {
        brand: "OnePlus", manufacturer: "OnePlus", model: "CPH2581", product: "CPH2581", device: "OP591L1",
        board: "kalama", hardware: "qcom", api: "34",
        fingerprint: "OnePlus/CPH2581/OP591L1:14/UKQ1.230924.001/R.202401151402:user/release-keys",
        ua: "Mozilla/5.0 (Linux; Android 14; CPH2581) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.6167.164 Mobile Safari/537.36",
        bootloader: "CPH2581_11_A.01"
    },
    {
        brand: "Xiaomi", manufacturer: "Xiaomi", model: "26011PN54C", product: "shennong", device: "shennong",
        board: "sun", hardware: "qcom", api: "36",
        fingerprint: "Xiaomi/shennong/shennong:16/B1A1.260110.001/V16.0.1.0.UNLCNXM:user/release-keys",
        ua: "Mozilla/5.0 (Linux; Android 16; 26011PN54C) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.7727.102 Mobile Safari/537.36",
        bootloader: "MW_K9_16.0"
    },
    {
        brand: "Xiaomi", manufacturer: "Xiaomi", model: "24129PN74G", product: "houji", device: "houji",
        board: "aurora", hardware: "qcom", api: "35",
        fingerprint: "Xiaomi/houji/houji:15/AP1A.250105.002/V15.0.5.0.UNLMIXM:user/release-keys",
        ua: "Mozilla/5.0 (Linux; Android 15; 24129PN74G) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/144.0.0.0 Mobile Safari/537.36",
        bootloader: "MW_K9_15.5"
    },
    {
        brand: "motorola", manufacturer: "motorola", model: "moto g(100) 5G", product: "pstar", device: "pstar",
        board: "pstar", hardware: "qcom", api: "34",
        fingerprint: "motorola/pstar_retail/pstar:14/U1RT34.22-11-2/54a10:user/release-keys",
        ua: "Mozilla/5.0 (Linux; Android 14; moto g(100) 5G) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.6099.210 Mobile Safari/537.36",
        bootloader: "0x0001"
    },
    {
        brand: "motorola", manufacturer: "motorola", model: "Edge 60 Pro", product: "hiphi", device: "hiphi",
        board: "sun", hardware: "qcom", api: "36",
        fingerprint: "motorola/hiphi_retail/hiphi:16/B1A1.260405.001/99a12:user/release-keys",
        ua: "Mozilla/5.0 (Linux; Android 16; Edge 60 Pro) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.7727.102 Mobile Safari/537.36",
        bootloader: "0x0004"
    },
    {
        brand: "Sony", manufacturer: "Sony", model: "XQ-DQ72", product: "XQ-DQ72", device: "XQ-DQ72",
        board: "sun", hardware: "qcom", api: "36",
        fingerprint: "Sony/XQ-DQ72/XQ-DQ72:16/B1A1.260305.001/1:user/release-keys",
        ua: "Mozilla/5.0 (Linux; Android 16; XQ-DQ72) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.7727.102 Mobile Safari/537.36",
        bootloader: "SONY-16.0-A1"
    },
    {
        brand: "asus", manufacturer: "asus", model: "ASUS_AI2501", product: "ROG8", device: "ROG8",
        board: "sun", hardware: "qcom", api: "36",
        fingerprint: "asus/ww_ai2501/ai2501:16/B1A1.260105.001/34.1010.1010.1:user/release-keys",
        ua: "Mozilla/5.0 (Linux; Android 16; ASUS_AI2501) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.7727.102 Mobile Safari/537.36",
        bootloader: "ASUS-16.0-G1"
    },
    {
        brand: "Nothing", manufacturer: "Nothing", model: "A065", product: "Pong", device: "Pong",
        board: "kalama", hardware: "qcom", api: "35",
        fingerprint: "Nothing/Pong/Pong:15/AP1A.250205.001/2401011200:user/release-keys",
        ua: "Mozilla/5.0 (Linux; Android 15; A065) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/144.0.6367.82 Mobile Safari/537.36",
        bootloader: "NOTHING-15.0-B1"
    },
    {
        brand: "Nothing", manufacturer: "Nothing", model: "A142", product: "Pacman", device: "Pacman",
        board: "mt6877", hardware: "mt6877", api: "35",
        fingerprint: "Nothing/Pacman/Pacman:15/AP1A.250405.001/2501011000:user/release-keys",
        ua: "Mozilla/5.0 (Linux; Android 15; A142) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/145.0.0.0 Mobile Safari/537.36",
        bootloader: "NOTHING-15.0-P1"
    },
    {
        brand: "vivo", manufacturer: "vivo", model: "V2403", product: "V2403", device: "V2403",
        board: "v2", hardware: "qcom", api: "36",
        fingerprint: "vivo/V2403/V2403:16/B1A1.260210.001/12345:user/release-keys",
        ua: "Mozilla/5.0 (Linux; Android 16; V2403) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Mobile Safari/537.36",
        bootloader: "VIVO-16.0"
    },
    {
        brand: "realme", manufacturer: "realme", model: "RMX3991", product: "RMX3991", device: "RMX3991",
        board: "sun", hardware: "qcom", api: "36",
        fingerprint: "realme/RMX3991/RMX3991:16/B1A1.260401.001/16.0.1:user/release-keys",
        ua: "Mozilla/5.0 (Linux; Android 16; RMX3991) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Mobile Safari/537.36",
        bootloader: "REALME-16.0"
    },
    {
        brand: "oppo", manufacturer: "oppo", model: "CPH2701", product: "CPH2701", device: "CPH2701",
        board: "sun", hardware: "qcom", api: "36",
        fingerprint: "oppo/CPH2701/CPH2701:16/B1A1.260105.001/16.0.0:user/release-keys",
        ua: "Mozilla/5.0 (Linux; Android 16; CPH2701) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Mobile Safari/537.36",
        bootloader: "OPPO-16.0"
    }
];

const activeProfile = deviceProfiles[Math.floor(Math.random() * deviceProfiles.length)];

const cachedMockData = {};

function getMockData() {
  const locale = Java.use("java.util.Locale");
  const localeCountry = locale.getDefault().getCountry().toUpperCase();
  if (cachedMockData[localeCountry]) {
    return cachedMockData[localeCountry];
  }

  var data = mockData.find(item => item.country_code === localeCountry);
  if(data == null) {
    // Country specific data not found, use BR data
    data = mockData.find(item => item.country_code === "BR");
  }
  const randomOperator = data.operators[Math.floor(Math.random() * data.operators.length)];
  const selectedData = {
    country_code: data.country_code,
    operator: randomOperator.name,
    MCCMNC: randomOperator.mccmnc,
    dial_code: data.dial_code,
    phone_number_length: data.phone_number_length,
    timezone: data.timezone
  };

  cachedMockData[localeCountry] = selectedData;
  return selectedData;
}
/** Hooks TelephonyManager methods to return fake values based on country for selected JW device locale.
*/
function mockDevice() {
  const telManager = Java.use('android.telephony.TelephonyManager');
  // Modify operator name.
  telManager.getNetworkOperatorName.overload().implementation = function() {
    var data = getMockData();
    logFridaRecord("FridaCloaking.getNetworkOperatorName", {}, data.operator);
    log('[*] CLOAKING DETECTED: getNetworkOperatorName. Returning: ' + data.operator);
    return data.operator;
  };
  // Modify operator name.
  telManager.getSimOperatorName.overload().implementation = function() {
    var data = getMockData();
    logFridaRecord("FridaCloaking.getSimOperatorName", {}, data.operator);
    log('[*] CLOAKING DETECTED: getSimOperatorName Returning: ' + data.operator);
    return data.operator;
  };
  // Modify SIM State
  telManager.getSimState.overload().implementation = function() {
    const retValue = 5; // SIM_STATE_READY
    logFridaRecord("FridaCloaking.getSimState", {}, retValue);
    log('[*] CLOAKING DETECTED: getSimState Returning: ' + retValue);
    return retValue;
  };
  telManager.getSimState.overload('int').implementation = function() {
    const retValue = 5; // SIM_STATE_READY
    logFridaRecord("FridaCloaking.getSimState", {}, retValue);
    log('[*] CLOAKING DETECTED: getSimState Returning: ' + retValue);
    return retValue;
  };
  // Modify operator.
  telManager.getNetworkOperator.overload().implementation = function() {
    var data = getMockData();
    logFridaRecord("FridaCloaking.getNetworkOperator", {}, data.MCCMNC);
    log('[*] CLOAKING DETECTED: getNetworkOperator. Returning: ' + data.MCCMNC);
    return data.MCCMNC;
  };
  // Modify operator.
  telManager.getSimOperator.overload().implementation = function() {
    var data = getMockData();
    logFridaRecord("FridaCloaking.getSimOperator", {}, data.MCCMNC);
    log('[*] CLOAKING DETECTED: getNetworkOperator. Returning: ' + data.MCCMNC);
    return data.MCCMNC;
  };
  // Modify SIM country.
  telManager.getSimCountryIso.overload().implementation = function() {
    const locale = Java.use("java.util.Locale");
    const COUNTRY = locale.getDefault().getCountry();
    logFridaRecord("FridaCloaking.getSimCountryIso", {}, COUNTRY);
    log('[*] CLOAKING DETECTED: getSimCountryIso. Returning: ' + COUNTRY);
    return COUNTRY;
  };
  // Modify Network Country ISO.
  telManager.getNetworkCountryIso.overload().implementation = function() {
    const locale = Java.use("java.util.Locale");
    const COUNTRY = locale.getDefault().getCountry();
    logFridaRecord("FridaCloaking.getNetworkCountryIso", {}, COUNTRY);
    log('[*] CLOAKING DETECTED: getNetworkCountryIso. Returning: ' + COUNTRY);
    return COUNTRY;
  };
  // Modify subscriber Id.
  telManager.getSubscriberId.overload().implementation = function() {
    var data = getMockData();
    var SUBSCRIBER_ID = data.MCCMNC + randomStr(15 - data.MCCMNC.length)
    logFridaRecord("FridaCloaking.getSubscriberId", {}, SUBSCRIBER_ID);
    log('[*] CLOAKING DETECTED: getSubscriberId: ' + SUBSCRIBER_ID);
    return SUBSCRIBER_ID;
  };
  // Phone number check
  telManager.getLine1Number.overload().implementation = function() {
    var data = getMockData();
    // Update the phone number if the locale has been changed to a different country
    if(!PHONE_NUMBER.startsWith(data.dial_code)) {
      PHONE_NUMBER = data.dial_code + randomStr(data.phone_number_length);
    }
    logFridaRecord("FridaCloaking.getLine1Number", {}, PHONE_NUMBER);
    log('[+] Reading phone number: ' + PHONE_NUMBER);
    return PHONE_NUMBER;
  };

  telManager.getDataState.implementation = function () {
    logFridaRecord("FridaCloaking.getDataState config.mnc.value", {}, 'DATA_CONNECTED');
    return 2; // DATA_CONNECTED
  };

  // Hook getDataNetworkType (LTE = 13)
  try {
    telManager.getDataNetworkType.overload().implementation = function() {
      const ret = 13;
      logFridaRecord("FridaCloaking.getDataNetworkType", {}, String(ret));
      log('[*] CLOAKING DETECTED: getDataNetworkType. Returning: ' + ret);
      return ret;
    };
  } catch(err) {
    log("[-] ERROR hooking getDataNetworkType: " + err.message);
  }

  try {
    telManager.getDataNetworkType.overload('int').implementation = function(subId) {
      const ret = 13;
      logFridaRecord("FridaCloaking.getDataNetworkType", {}, String(ret));
      log('[*] CLOAKING DETECTED: getDataNetworkType(int). Returning: ' + ret);
      return ret;
    };
  } catch(err) {}

  try {
    telManager.getNetworkType.overload().implementation = function() {
      const ret = 13;
      logFridaRecord("FridaCloaking.getNetworkType", {}, String(ret));
      log('[*] CLOAKING DETECTED: getNetworkType. Returning: ' + ret);
      return ret;
    };
  } catch(err) {
    log("[-] ERROR hooking getNetworkType: " + err.message);
  }

  try {
    telManager.getNetworkType.overload('int').implementation = function(subId) {
      const ret = 13;
      logFridaRecord("FridaCloaking.getNetworkType", {}, String(ret));
      log('[*] CLOAKING DETECTED: getNetworkType(int). Returning: ' + ret);
      return ret;
    };
  } catch(err) {}

  Java.use("android.net.ConnectivityManager").isActiveNetworkMetered.implementation = function () {
    logFridaRecord("FridaCloaking.isActiveNetworkMetered", {}, 'True');
    log("[+] isActiveNetworkMetered invoked");
    return true;
  };

  // Modify MCC and MNC in android.content.res.Configuration class
  const contextThemeWrapper = Java.use('android.view.ContextThemeWrapper');
  contextThemeWrapper.getResources.overload().implementation = function () {
    var data = getMockData();
    const res = this.getResources();
    const config = res.getConfiguration();
    config.mcc.value = parseInt(data.MCCMNC.substring(0,3));
    config.mnc.value = parseInt(data.MCCMNC.substring(3));

//    logFridaRecord("FridaCloaking.getResources config.mcc.value", {}, config.mcc.value);
//    logFridaRecord("FridaCloaking.getResources config.mnc.value", {}, config.mnc.value);
//    log('[+] Updating android.content.res.Configuration MCC ' + config.mcc.value + ' MNC: '+ config.mnc.value);
    return res;
  };

   Java.use('android.net.NetworkRequest$Builder').addTransportType.overload('int').implementation = function (transportType) {
       console.log("[+] addTransportType called");
       return this.addTransportType(1);
   };
}

function mockTimezone() {
  Java.use("java.util.TimeZone").getID.implementation = function () {
    var data = getMockData();
    return data.timezone;
  };
  Java.use('java.util.TimeZone').getDisplayName.overload().implementation = function () {
    var ret = this.getDisplayName();
    var data = getMockData();
    var tz = Java.use('java.util.TimeZone').getTimeZone(data.timezone);
    var result = tz.getDisplayName(false, 1, Java.use('java.util.Locale').getDefault());
    logFridaRecord("FridaCloaking.Timezone.getDisplayName", {}, result);
    log('[*] CLOAKING DETECTED: getDisplayName: ' + ret + ' Returning: ' + result);
    return result;
  };

  Java.use('java.util.TimeZone').getDisplayName.overload('boolean','int').implementation = function (p1, p2) {
    var ret = this.getDisplayName(p1, p2);
    var data = getMockData();
    var tz = Java.use('java.util.TimeZone').getTimeZone(data.timezone);
    var result = tz.getDisplayName(p1, p2, Java.use('java.util.Locale').getDefault());
    logFridaRecord("FridaCloaking.Timezone.getDisplayName", {}, result);
    log('[*] CLOAKING DETECTED: getDisplayName(b,i): ' + ret + ' Returning: ' + data.timezone);
    return result;
  };
}

/**
 * returns Context
 * @return {?Context}
 */
function getContext() {
  return Java.use('android.app.ActivityThread')
      .currentApplication().getApplicationContext();
}

let classSet = new Set();
let hooked = false;
/**
 * Returns a field
 * @param {string} className
 * @param {string} fieldName
 * @return {?Field}
 */
function getField(className, fieldName) {
  return Java.use(className).class.getDeclaredField(fieldName);
}

/**
 * Returns dexElemenets from a class loader
 * @return  {?Elements}
 *           List of dex/resource (class path) elements.
 */
function getDexElements() {
  let classLoader = Java.classFactory.loader;

  let pathListField = getField('dalvik.system.BaseDexClassLoader', 'pathList');
  pathListField.setAccessible(true);
  let pathList = pathListField.get(classLoader);
  let dexElementsField = getField('dalvik.system.DexPathList', 'dexElements');
  dexElementsField.setAccessible(true);
  let dexElemenets = dexElementsField.get(pathList);

  return dexElemenets;
}

/**
 * Returns dexFile field from Element
 * @param  {!Element} dexElement Element of the dex/resource path.
 * @return {!DexFile}
 */
function getDexFile(dexElement) {
  let field = getField('dalvik.system.DexPathList$Element', 'dexFile');
  field.setAccessible(true);
  return field.get(dexElement);
}

/**
 * Returns a Method object
 * @param {string} className
 * @param {string} methodName
 * @return {?Method}
 */
function getMethod(className, methodName) {
  return Java.use(className).class.getDeclaredMethod(methodName, null);
}

/**
 * creates a list of classes that implements AppsFlyerConversionListener
 * clases are saved into classSet
 */
function findClasses() {
  let dexElements = getDexElements();
  let jArray = Java.use('java.lang.reflect.Array');
  let arrayLen = jArray.getLength(dexElements);
  let nextElement = getMethod('java.util.Enumeration', 'nextElement');
  let hasMoreElementsMethod =
      getMethod('java.util.Enumeration', 'hasMoreElements');
  let entriedMethod = getMethod('dalvik.system.DexFile', 'entries');
  log('[*] #dex_elemenets: ' + arrayLen);
  for (let i = 0; i < arrayLen; i++) {
    let dexElem = jArray.get(dexElements, i);
    let dexFile = getDexFile(dexElem);
    try {
      let field = getField('dalvik.system.DexFile', 'mCookie');
      field.setAccessible(true);
      let mCookie = field.get(dexFile);
      if (mCookie == null) {
        log('[-] Get null cookie');
        continue;
      }
    } catch (err) {
      continue;
    }
    let enumerations = entriedMethod.invoke(dexFile, null);
    while (true) {
      let flag = hasMoreElementsMethod.invoke(enumerations, null);
      if (flag.toString() === 'false') {
        break;
      }
      let className = nextElement.invoke(enumerations, null).toString();
      try {
        if (className.includes('ai.advance') || className.includes('kotlin') ||
            className.includes('com.airbnb.lottie') || className.includes('android.view') || className.includes('android.support')) {
          continue;
        }
        let classObj = Java.classFactory.loader.loadClass(className);
        let found = false;
        let interfaces = classObj.getInterfaces();
        for (let index = 0; index < interfaces.length; index ++) {
          if (interfaces[index].toString().includes('AppsFlyerConversionListener')) {
            found = true;
          }
        }
        if (found) {
          log("[*] Found: " + className);
          classSet.add(className);
        }
      } catch (err) {
      }
    }
  }
}

/**
 * Find and hook methods names in AppsFlyerConversionListener classes
 * @param {string} method
 */
function findAndHookMethods(method) {
  try {
    classSet.forEach(classname => hookMethod(classname, method));
  } catch (err) {
    //log(err.message);
  }
}

/**
 * Get Class from getClass();
 * @param {!Java.lang.Class} cls
 * @return {!Class}
 */
function getClassFromJavaClass(cls) {
  const name = cls.getName();
  return Java.ClassFactory.get(cls.getClassLoader()).use(name);
}

/**
 * Enumerate all the classloaders and search the class.
 * @param {string} classname
 * @return {?Class}
 */
function searchAndFindClass(classname) {
  try {
    const loaders = Java.enumerateClassLoadersSync();
    for (const loader of loaders) {
      try {
        if (loader.loadClass(classname)) {
          const factory = Java.ClassFactory.get(loader);
          const cls = factory.use(classname);
          // log(loader.toString());
          return cls;
        }
        return cls;
      } catch (notFound) {
      }
    }
  } catch (err) {
  }
  return null;
}
/**
 * Hooks methods in Appsflyer SDK.
 */
function hookAppsFlyer() {
  try {
    const clsAppsFlyerLib = searchAndFindClass('com.appsflyer.AppsFlyerLib');
    if (clsAppsFlyerLib) {
      log("[*] AppsFlyberLib Found: " + clsAppsFlyerLib.toString());
      const instance = clsAppsFlyerLib.getInstance();
      const cls = getClassFromJavaClass(instance.getClass());
      const init = cls.init.overload(
          'java.lang.String', 'com.appsflyer.AppsFlyerConversionListener',
          'android.content.Context');
      init.implementation = function(p1, p2, p3) {
        try {
          const javaCls = Java.use('java.lang.Object');
          const object = Java.cast(p2, javaCls);
          try {
            hookMethod(object.getClass().getName(), 'onConversionDataSuccess');
          } catch (err2) {
          }
          try {
            hookMethod(
                object.getClass().getName(), 'onInstallConversionDataLoaded');
          } catch (err2) {
          }
          try {
            hookMethod(object.getClass().getName(), 'onAppOpenAttribution');
          } catch (err2) {
          }
          try {
            logFridaRecord("FridaCloaking.AppsFlyerLib.init", {"devkey": p1}, null);
          } catch (err2) {
          }
        } catch (err1) {
          log("[-] ERROR: " + err1.message);
        }
        return init.call(instance, p1, p2, p3);
      };
      log('[+] AppsFlyer hook init');
    } else {
      log('[-] ERROR: AppsFlyerLib not found');
    }
  } catch (err) {
    log("[-] ERROR: " + err.message);
  }
}
/**
 * Hook methods from classes and modify parameters to add fake campaign details
 * @param {string} classname
 * @param {string} methodname
 */
function hookMethod(classname, methodname) {
  logFridaRecord("FridaCloaking." + methodname, {}, "Non-organic");
  let clazzMap = Java.use('java.util.Map');
  log("[+] HookMethod: " + classname + ':' + methodname);
  eval('Java.use("' + classname + '").' + methodname)
    .overload('java.util.Map')
    .implementation = function() {
      let arg_map = Java.cast(arguments[0], clazzMap);
      arg_map.remove('af_status');
      arg_map.put('af_status', 'Non-organic');
      arg_map.put('af_deeplink', 'true');
      arg_map.remove('af_message');
      arg_map.put('campaign', 'test');

      arguments[0] = arg_map;
      let retval;
      try {
        retval = eval('this.' + methodname + '.apply(this, arguments)');
        log('[+] HookMethod: in ' + methodname);
      } catch (err) {
        retval = null;
        log('Exception - cannot compute retval..' + String(err));
      }
      return retval;
    };
  log('[+] Hooked ' + classname + ':' + methodname);
}

/**
 * Change Android.os.Build field values to bypass cloaking checks.
 */
function setAndroidBuildFields() {
  const b = Java.use('android.os.Build');

  let model = b.MODEL;
  model.value = activeProfile.model;

  let manufacturer = b.MANUFACTURER;
  manufacturer.value = activeProfile.manufacturer;

  let brand = b.BRAND;
  brand.value = activeProfile.brand;

  let device = b.DEVICE;
  device.value = activeProfile.device;

  let fingerprint = b.FINGERPRINT;
  fingerprint.value = activeProfile.fingerprint;

  let hardware = b.HARDWARE;
  hardware.value = activeProfile.hardware;

  let product = b.PRODUCT;
  product.value = activeProfile.product;

  let cpu_abi = b.CPU_ABI;
  cpu_abi.value = 'arm64-v8a';

  let cpu_abi2 = b.CPU_ABI2;
  cpu_abi2.value = 'arm64-v8a';

  let supported_abis = b.SUPPORTED_ABIS;
  supported_abis.value = ['arm64-v8a'];

  let supported_abis32 = b.SUPPORTED_32_BIT_ABIS;
  supported_abis32.value = ['armeabi-v7a,', 'armeabi'];

  let supported_abis64 = b.SUPPORTED_64_BIT_ABIS;
  supported_abis64.value = ['arm64-v8a'];

  let tags = b.TAGS;
  tags.value = 'release-keys';

  let type = b.TYPE;
  type.value = 'user';

  let display = b.DISPLAY;
  display.value = activeProfile.fingerprint.split('/')[4].split(':')[0];
}

var found_signature = false;
function bypassUnitySSLPinning(module) {
  var signature_arm64 = "f? ?? ?c ?? f7 5b 01 a9 f5 53 02 a9 f3 7b 03 a9 ?? ?? 40 f9 f3 03 02 aa f4 03 01 aa ?? ?? 40 f9";
  var signature_arm32 = "2d e9 f0 4? 8? b0 8? 68 9? 46 ?? 46 ?? 69 ?? f?";
  var signatures = Process.pointerSize === 4 ? [signature_arm32] : [signature_arm64];

  var signature = signatures.pop();
  if(!signature || found_signature) {
    return;
  }
  Memory.scan(module.base, module.size, signature, {
    onMatch(address, size) {
      log('[*] Memory.scan() found match at offset ' + address.sub(module.base) + ' with size '+ size);
      log("[+] Hooking Unity SSL pinning");

      if (Process.pointerSize === 0x8) {
        Interceptor.attach(address,{
          onLeave: function(retval){
            Java.perform(function() {
              logFridaRecord("FridaCloaking.bypassUnitySSLPinning", {}, "return 0");
            });
            retval.replace(0);
          }
        });
      }
      else if (Process.pointerSize === 0x4) {
        Memory.patchCode(address, Process.pageSize, code => {
          const cw = new ArmWriter(code);
          // Interceptor attach/replace will crash the app in arm32 so we need to do in this scuffed way...
          cw.putBytes([0x00,0x00,0x00,0xb5]); // push {lr}
          cw.putBytes([0x00,0x00,0x00,0x20]); // movs r0,0
          cw.putBytes([0x5d,0xf8,0x04,0xfb]); // pop.w {pc}
          cw.flush();
          Java.perform(function() {
            logFridaRecord("FridaCloaking.bypassUnitySSLPinning", {}, "instructions patched");
          });
        });
      }

      found_signature = true;
      return 'stop';
    },
    onComplete() {
      log('[+] Memory.scan() ' + signature +' completed');
      bypassUnitySSLPinning(module);
    }
  });
}

// Entry point general Interceptor
try {
  const libc = Module.findExportByName("libc.so", "__system_property_get");
  if (libc) {
    Interceptor.attach(libc, {
      onEnter: function(args) {
        this.property = args[0].readCString();
        this.outPtr = args[1];
      },
      onLeave: function(retval) {
        const ret_value = getPropertyValue(this.property);
        if (ret_value !== null) {
          var p = Memory.allocUtf8String(ret_value);
          Memory.copy(this.outPtr, p, ret_value.length + 1);
          retval.replace(ret_value.length);
        }
      }
    });
  }
} catch (err) {
  log("[-] ERROR: " + err.message);
}

// Entry Point Unity SSL Unpinning
try {
  var do_dlopen = null;
  var call_ctor = null;
  var isUnitySSLPinningHooked = false;
  Process.findModuleByName(Process.pointerSize === 4 ? 'linker' : 'linker64').enumerateSymbols().forEach(function (sym) {
    if (sym.name.indexOf('do_dlopen') >= 0) {
      do_dlopen = sym.address;
    } else if (sym.name.indexOf('call_constructor') >= 0) {
      call_ctor = sym.address;
    }
  });

  Interceptor.attach(do_dlopen,{
    onEnter: function(args){
      var soName = args[0].readCString();
      var temp = soName.split("/").pop();
      this.libname = temp;

      if (temp.indexOf("libunity.so") > -1) {
        Interceptor.attach(call_ctor, function () {
          if(isUnitySSLPinningHooked == false) {
            isUnitySSLPinningHooked = true;
            var module = Process.findModuleByName("libunity.so");
            bypassUnitySSLPinning(module);
          }
        });
      }
    }
  });
} catch (err) {
  log("[-] ERROR: " + err.message);
}

function createSensorEvent(sensor) {
  const SensorEvent = Java.use("android.hardware.SensorEvent");
  const SystemClock = Java.use("android.os.SystemClock");
  const values = Java.array("float", [Math.random(), Math.random(), Math.random() * 10]);
  const obj = SensorEvent.$new(3);
  obj.values.value = values;
  obj.timestamp.value = SystemClock.elapsedRealtimeNanos();
  obj.sensor.value = sensor;
  obj.accuracy.value = 3;
  return obj;
}

function getBelievableSensorDetails(type, originalName, originalVendor) {
  const sensorPool = {
    1: { // TYPE_ACCELEROMETER
      vendors: ["STMicroelectronics", "Bosch", "TDK-Invensense"],
      names: {
        "STMicroelectronics": "LSM6DSO Accelerometer",
        "Bosch": "BMI260 Accelerometer",
        "TDK-Invensense": "ICM42688 Accelerometer"
      }
    },
    4: { // TYPE_GYROSCOPE
      vendors: ["STMicroelectronics", "Bosch", "TDK-Invensense"],
      names: {
        "STMicroelectronics": "LSM6DSO Gyroscope",
        "Bosch": "BMI260 Gyroscope",
        "TDK-Invensense": "ICM42688 Gyroscope"
      }
    },
    2: { // TYPE_MAGNETIC_FIELD
      vendors: ["Asahi Kasei Microdevices", "Bosch", "STMicroelectronics"],
      names: {
        "Asahi Kasei Microdevices": "AK09918 Magnetometer",
        "Bosch": "BMM150 Magnetometer",
        "STMicroelectronics": "LIS2MDL Magnetometer"
      }
    },
    5: { // TYPE_LIGHT
      vendors: ["ams-OSRAM", "Avago Technologies"],
      names: {
        "ams-OSRAM": "TCS3407 Ambient Light Sensor",
        "Avago Technologies": "APDS9960 Light Sensor"
      }
    },
    8: { // TYPE_PROXIMITY
      vendors: ["ams-OSRAM", "Avago Technologies"],
      names: {
        "ams-OSRAM": "TCS3407 Proximity Sensor",
        "Avago Technologies": "APDS9960 Proximity Sensor"
      }
    },
    6: { // TYPE_PRESSURE
      vendors: ["STMicroelectronics", "Bosch"],
      names: {
        "STMicroelectronics": "LPS22HH Barometer",
        "Bosch": "BMP390 Pressure Sensor"
      }
    }
  };

  const selectedPool = sensorPool[type] || {
    vendors: ["STMicroelectronics"],
    names: { "STMicroelectronics": "LSM6DSO Multi-Sensor" }
  };

  let hash = 0;
  const seedStr = (originalName || "") + (originalVendor || "") + type;
  for (let i = 0; i < seedStr.length; i++) {
    hash = (hash << 5) - hash + seedStr.charCodeAt(i);
    hash |= 0;
  }
  const index = Math.abs(hash) % selectedPool.vendors.length;
  const vendor = selectedPool.vendors[index];
  const name = selectedPool.names[vendor];

  return { vendor, name };
}

function sensorHook() {
  const SensorManager = Java.use("android.hardware.SensorManager");

  try {
    const sensorClass = Java.use('android.hardware.Sensor');

    sensorClass.getVendor.implementation = function() {
      const originalVendor = this.getVendor();
      const type = this.getType();

      if (originalVendor && originalVendor.toLowerCase().match(/google|aosp|goldfish|emulator|open|source|sdk/g)) {
        const believable = getBelievableSensorDetails(type, "", originalVendor);
        log(`[*] CLOAKING DETECTED: Sensor check (Vendor). Replacing suspicious "${originalVendor}" with believable: "${believable.vendor}"`);
        logFridaRecord("FridaCloaking.Sensor.getVendor", { original: originalVendor }, believable.vendor);
        return believable.vendor;
      }

      return originalVendor;
    };

    sensorClass.getName.implementation = function() {
      const originalName = this.getName();
      const type = this.getType();

      if (originalName && originalName.toLowerCase().match(/google|aosp|goldfish|emulator|open|source|sdk/g)) {
        const believable = getBelievableSensorDetails(type, originalName, "");
        log(`[*] CLOAKING DETECTED: Sensor check (Name). Replacing suspicious "${originalName}" with believable: "${believable.name}"`);
        logFridaRecord("FridaCloaking.Sensor.getName", { original: originalName }, believable.name);
        return believable.name;
      }

      return originalName;
    };
  } catch (err) {
    log("[-] ERROR hooking android.hardware.Sensor: " + err.message);
  }

  const maxIterations = 1000;
  let currentIteration = 0;
  // Send a SensorEvent every 50ms, up to 1000 times
  const intervalID = setInterval(async function () {
    currentIteration++;
    if (currentIteration >= maxIterations) {
      clearInterval(intervalID);
    }
    log("[+] Current Interval Iteration " + currentIteration + " with " + SENSOR_LISTENERS.length + " sensor listeners");
    for (var i = 0; i < SENSOR_LISTENERS.length; i++) {
      Java.performNow(function() {
        try {
            log("[+] Sending new Sensor Event");
            const sensorEventObj = createSensorEvent(SENSOR_OBJECTS[i]);
            SENSOR_LISTENERS[i].onSensorChanged(sensorEventObj);
        } catch(err) {
            log("[-] ERROR: " + err.message);
        }
      });
    }
  }, 50);
  SensorManager.registerListener.overload("android.hardware.SensorEventListener", "android.hardware.Sensor", "int", "android.os.Handler").implementation = function(listener, sensor, sampling, handler) {
    logFridaRecord("FridaCloaking.sensorManager.registerListener", {}, "register sensor listener");
    const value = this.registerListener(listener, sensor, sampling, handler);
    // Accelerometer for now only
    if (sensor !== null && sensor.getType() === 1 && listener !== null) {
      // Save listener and Sensor objects for later use
      log("[+] Saving SensorManager related objects");
      SENSOR_LISTENERS.push(Java.retain(listener));
      SENSOR_OBJECTS.push(Java.retain(sensor));
    }
    return value;
  }
  SensorManager.unregisterListener.overload("android.hardware.SensorEventListener").implementation = function(listener) {
    logFridaRecord("FridaCloaking.sensorManager.unregisterListener", {}, "unregister sensor listener");
    const index = SENSOR_LISTENERS.indexOf(listener);
    if (index > -1) {
      // Clean up
      SENSOR_LISTENERS.splice(index, 1);
      SENSOR_OBJECTS.splice(index, 1);
    }
    return this.unregisterListener(listener);
  }
}

const PROPERTY_MAP = {
  "gsm.sim.state": "LOADED",
  "gsm.version.baseband": "g5300q-241205-250127-B-12973597",
  "init.svc.adbd": "",
  "init.svc_debug_pid.adbd": "",
  "ro.adb.secure": "1",
  "ro.bootloader": activeProfile.bootloader,
  "ro.boot.flash.locked": "1",
  "ro.boot.vbmeta.device_state": "",
  "ro.boot.verifiedbootstate": "green",
  "ro.boot.warranty_bit": "",
  "ro.boottime.adbd": "",
  "ro.build.characteristics": "nosdcard",
  "ro.build.display.id": "VOG-L29 10.1.0.150(C432E19R2P5)",
  "ro.build.fingerprint": activeProfile.fingerprint,
  "ro.build.host": "r-b420135cd668c625-lj1n",
  "ro.build.product": activeProfile.product,
  "ro.build.selinux": "1",
  "ro.build.tags": "release-keys",
  "ro.build.type": "user",
  "ro.build.user": "android-build",
  "ro.crypto.state": "encrypted",
  "ro.debuggable": "0",
  "ro.product.board": activeProfile.board,
  "ro.product.brand": activeProfile.brand,
  "ro.product.device": activeProfile.device,
  "ro.product.manufacturer": activeProfile.manufacturer,
  "ro.product.model": activeProfile.model,
  "ro.secure": "1",
  "persist.adb.wifi.guid": "",
  "persist.sys.usb.config": "",
  "service.adb.root": "0",
  "sys.usb.config": "",
  "ro.board.platform": activeProfile.board,
  "ro.hardware": activeProfile.hardware,
  "ro.build.flavor": activeProfile.product + "-user",
  "ro.kernel.qemu": "0",
  "ro.hardware.audio.primary": activeProfile.board
};


function getPropertyValue(arg) {
  var ret_value = null;
  if (arg in PROPERTY_MAP) {
    ret_value = PROPERTY_MAP[arg];
  } else if (arg === "gsm.operator.numeric" && Java.available) {
    Java.perform(function() {
      var data = getMockData();
      ret_value = data.MCCMNC;
    });

  } else if (arg === "gsm.operator.iso-country" && Java.available) {
    Java.perform(function() {
      var data = getMockData();
      ret_value = data.country_code.toLowerCase();
    });
  }
  if (ret_value !== null) {
    logFridaRecord("FridaCloaking.SystemProperty", {}, arg);
  }
  return ret_value;
}

function createResolveInfo(package_name) {
  var ActivityInfo = Java.use("android.content.pm.ActivityInfo");
  var ApplicationInfo = Java.use("android.content.pm.ApplicationInfo");
  var ResolveInfo = Java.use("android.content.pm.ResolveInfo");
  const appInfo = ApplicationInfo.$new();
  appInfo.packageName.value = package_name;
  const actInfo = ActivityInfo.$new();
  actInfo.packageName.value = package_name;
  actInfo.applicationInfo.value = appInfo;
  var rInfo = ResolveInfo.$new();
  rInfo.activityInfo.value = actInfo;
  return rInfo;
}

function systemPropertiesHook() {
  try {
    const systemProperties = Java.use("android.os.SystemProperties");
    systemProperties.get.overload("java.lang.String", "java.lang.String").implementation = function (arg1, arg2) {
      const ret_value = getPropertyValue(arg1);
      if (ret_value === null) {
        return this.get(arg1, arg2);
      }
      return ret_value;
    };

    systemProperties.get.overload("java.lang.String").implementation = function (arg) {
      const ret_value = getPropertyValue(arg);
      if (ret_value === null) {
        return this.get(arg);
      }
      return ret_value;
    }
  } catch (err) {
    log("[-] ERROR: " + err.message);
  }
}

function mockInstalledApps() {
  try {
    const PackageManager = Java.use("android.app.ApplicationPackageManager");
    const PackageInfo = Java.use("android.content.pm.PackageInfo");
    const ApplicationInfo = Java.use("android.content.pm.ApplicationInfo");
    const ArrayList = Java.use("java.util.ArrayList");
    const Apps = ["com.whatsapp", "com.facebook.katana", "com.viber.voip", "ua.gov.diia.app"];

    // PackageInfo technique
    PackageManager.getPackageInfo.overload('java.lang.String', 'int').implementation = function (pname, flags) {
      try {
        return this.getPackageInfo(pname, flags);
      } catch (err) {
        // whatever package they check for, let's return something
        var pInfo = PackageInfo.$new();
        pInfo.packageName.value = pname;
        logFridaRecord("FridaCloaking.packageManager.getPackageInfo", {}, pname);
        return pInfo;
      }
    };

    try {
      PackageManager.getPackageInfo.overload('java.lang.String', 'android.content.pm.PackageManager$PackageInfoFlags').implementation = function (pname, flags) {
        try {
          return this.getPackageInfo(pname, flags);
        } catch (err) {
          // whatever package they check for, let's return something
          var pInfo = PackageInfo.$new();
          pInfo.packageName.value = pname;
          logFridaRecord("FridaCloaking.packageManager.getPackageInfo", {}, pname);
          return pInfo;
        }
      };
    } catch (err) {
      // not found, API 33+
    }

    // getInstalledApplication technique
    PackageManager.getInstalledApplications.overload('int').implementation = function (flags) {
      var originList = this.getInstalledApplications(flags);
      var newList = ArrayList.$new(originList);
      for (var i = 0; i < Apps.length; i++) {
        var fakeApp = ApplicationInfo.$new();
        fakeApp.packageName.value = Apps[i];
        newList.add(fakeApp);
      }
      logFridaRecord("FridaCloaking.packageManager.getInstalledApplications", {}, null);
      return newList;
    };

    // queryIntentActivities technique
    PackageManager.queryIntentActivities.overload('android.content.Intent', 'int').implementation = function (intent, flags) {
      var result = this.queryIntentActivities(intent, flags);
      for (var i = 0; i < Apps.length; i++) {
        result.add(createResolveInfo(Apps[i]));
      }
      logFridaRecord("FridaCloaking.packageManager.queryIntentActivities", {}, null);
      return result;
    };
    try {
      PackageManager.queryIntentActivities.overload('android.content.Intent', 'android.content.pm.PackageManager$ResolveInfoFlags').implementation = function (intent, flags) {
        var result = this.queryIntentActivities(intent, flags);
        for (var i = 0; i < Apps.length; i++) {
          result.add(createResolveInfo(Apps[i]));
        }
        logFridaRecord("FridaCloaking.packageManager.queryIntentActivities", {}, null);
        return result;
      };
    } catch (err) {
      // not found, API 33+
    }
  } catch (err) {
    log("[-] ERROR: " + err.message);
  }
}

function mockWifiAndNetwork() {
  try {
    const ssids = ["HomeWiFi", "Linksys", "NETGEAR", "ASUS_Guest", "TP-Link_AP", "Starbucks WiFi", "Guest_WiFi", "Direct-WiFi"];
    const selectedSSID = `"${ssids[Math.floor(Math.random() * ssids.length)]}"`;

    const hex = '0123456789abcdef';
    let selectedBSSID = '00';
    for (let i = 0; i < 5; i++) {
      selectedBSSID += ':' + hex.charAt(Math.floor(Math.random() * 16)) + hex.charAt(Math.floor(Math.random() * 16));
    }

    const selectedRSSI = -Math.floor(Math.random() * 35) - 40; // between -40 and -75

    log(`[+] Wifi Mocking initialized: SSID=${selectedSSID}, BSSID=${selectedBSSID}, RSSI=${selectedRSSI}`);

    const WifiInfo = Java.use("android.net.wifi.WifiInfo");
    WifiInfo.getRssi.implementation = function() {
      logFridaRecord("FridaCloaking.WifiInfo.getRssi", {}, String(selectedRSSI));
      return selectedRSSI;
    };
    WifiInfo.getSSID.implementation = function() {
      return selectedSSID;
    };
    WifiInfo.getBSSID.implementation = function() {
      return selectedBSSID;
    };

    const WifiManager = Java.use("android.net.wifi.WifiManager");
    WifiManager.getWifiState.implementation = function() {
      return 3; // WIFI_STATE_ENABLED
    };
    WifiManager.isWifiEnabled.implementation = function() {
      return true;
    };

    const ConnectivityManager = Java.use("android.net.ConnectivityManager");
    const NetworkInfo = Java.use("android.net.NetworkInfo");

    NetworkInfo.isConnected.implementation = function() {
      return true;
    };
    NetworkInfo.isConnectedOrConnecting.implementation = function() {
      return true;
    };
    NetworkInfo.getType.implementation = function() {
      return 1; // TYPE_WIFI
    };
    log("[+] Wifi and Network mocking initialized");
  } catch (err) {
    log("[-] ERROR in mockWifiAndNetwork: " + err.message);
  }
}

const statusFDs = new Set();
function libcHooks() {
  // TracerPid bypass using open/read/close tracking
  const openPtr = Module.findExportByName("libc.so", "open");
  if (openPtr) {
        Interceptor.attach(openPtr, {
            onEnter: function(args) {
                this.path = args[0].readUtf8String();
            },
            onLeave: function(retval) {
                const fd = retval.toInt32();
                if (fd !== -1 && this.path && this.path.includes("/proc/self/status")) {
                    log(`[*] Opening ${this.path} -> Assigned FD: ${fd}`);
                    statusFDs.add(fd);
                }
            }
        });
    }
    const readPtr = Module.findExportByName("libc.so", "read");
    if (readPtr) {
        Interceptor.attach(readPtr, {
            onEnter: function(args) {
                this.fd = args[0].toInt32();
                this.buf = args[1];
            },
            onLeave: function(retval) {
                const bytesRead = retval.toInt32();
                if (bytesRead > 0 && statusFDs.has(this.fd)) {
                    try {
                        const content = this.buf.readUtf8String(bytesRead);
                        if (content.includes("TracerPid:")) {
                          var tracerPid = "none";
                          const match = content.match(/TracerPid:\s+\d+/g);
                          if (match) {
                            tracerPid = match[0];
                          }
                          logFridaRecord("FridaCloaking.read.TracerPid", {}, tracerPid);
                          const patched = content.replace(/TracerPid:\s+\d+/g, "TracerPid:\t0");
                          this.buf.writeUtf8String(patched);
                        }
                    } catch (err) {
                        log("[-] ERROR: " + err.message);
                    }
                }
            }
        });
    }
    const closePtr = Module.findExportByName("libc.so", "close");
    if (closePtr) {
        Interceptor.attach(closePtr, {
            onEnter: function(args) {
                const fd = args[0].toInt32();
                if (statusFDs.has(fd)) {
                    log(`[*] Closing FD: ${fd}`);
                    statusFDs.delete(fd);
                }
            }
        });
    }
}

function getRealisticUA(baseUA) {
  const major = Math.floor(Math.random() * (188 - 140 + 1)) + 140;
  const build = Math.floor(Math.random() * (7000 - 6000 + 1)) + 6000;
  const patch = Math.floor(Math.random() * 200);
  const fullChrome = `${major}.0.${build}.${patch}`;
  return baseUA.replace(/Chrome\/[\d\.]+/, `Chrome/${fullChrome}`);
}

function initGlMocking() {
  const glProfiles = [
    {
      vendor: "Qualcomm",
      renderer: "Adreno (TM) 730",
      version: "OpenGL ES 3.2 V@0502.0 (GIT@6fa6c40, I6ad88224ad)"
    },
    {
      vendor: "ARM",
      renderer: "Mali-G78",
      version: "OpenGL ES 3.2 v1.r26p0-01rel0.9ed024c8be320ef23889e310422186ea"
    },
    {
      vendor: "Qualcomm",
      renderer: "Adreno (TM) 640",
      version: "OpenGL ES 3.2 V@490.0 (GIT@8092528, I68807b643d)"
    },
    {
      vendor: "ARM",
      renderer: "Mali-G710",
      version: "OpenGL ES 3.2 v1.r38p0-01rel0.cc8234d3a68290200d015e6ccdc3d02e"
    },
    {
      vendor: "Qualcomm",
      renderer: "Adreno (TM) 740",
      version: "OpenGL ES 3.2 V@0615.0 (GIT@ef04e5a, I3b2c4c9bb0)"
    },
    {
      vendor: "ARM",
      renderer: "Mali-G57 MC3",
      version: "OpenGL ES 3.2 v1.r24p0-01rel0.84d73ca3f3157010bc11b272b12c87fa"
    },
    {
      vendor: "Imagination Technologies",
      renderer: "PowerVR Rogue GE8320",
      version: "OpenGL ES 3.2 build 1.13@5776728"
    }
  ];

  const glProfile = glProfiles[Math.floor(Math.random() * glProfiles.length)];
  log(`[+] Selected randomized GL Profile: Vendor=${glProfile.vendor}, Renderer=${glProfile.renderer}, Version=${glProfile.version}`);

  const GL_VENDOR = 0x1F00;
  const GL_RENDERER = 0x1F01;
  const GL_VERSION = 0x1F02;

  function getFakeGlString(name) {
    if (name === GL_VENDOR) {
      return glProfile.vendor;
    } else if (name === GL_RENDERER) {
      return glProfile.renderer;
    } else if (name === GL_VERSION) {
      return glProfile.version;
    }
    return null;
  }

  // Java Hooks
  const classesToHook = [
    'android.opengl.GLES20',
    'android.opengl.GLES30',
    'com.google.android.gles_jni.GLImpl'
  ];

  classesToHook.forEach(function(clsName) {
    try {
      const cls = Java.use(clsName);
      if (cls && cls.glGetString) {
        cls.glGetString.implementation = function(name) {
          const fakeVal = getFakeGlString(name);
          if (fakeVal !== null) {
            log(`[*] CLOAKING DETECTED: Java ${clsName}.glGetString(${name}) -> returning believable: ${fakeVal}`);
            if (typeof logFridaRecord !== 'undefined') {
              try {
                logFridaRecord(`FridaCloaking.${clsName}.glGetString`, { name: String(name) }, fakeVal);
              } catch (e) {}
            }
            return fakeVal;
          }
          return this.glGetString(name);
        };
        log(`[+] Hooked Java ${clsName}.glGetString successfully`);
      }
    } catch (err) {
      // Ignore if specific class does not exist
    }
  });
}


function hookSystemFeatures() {
  const forcedFeatures = [
    "android.hardware.camera",
    "android.hardware.camera.front",
    "android.hardware.camera.flash",
    "android.hardware.bluetooth",
    "android.hardware.bluetooth.le",
    "android.hardware.bluetooth_le",
    "android.hardware.nfc",
    "android.hardware.location",
    "android.hardware.location.gps",
    "android.hardware.location.network",
    "android.hardware.microphone",
    "android.hardware.wifi",
    "android.hardware.sensor.accelerometer",
    "android.hardware.sensor.barometer",
    "android.hardware.sensor.compass",
    "android.hardware.sensor.gyroscope",
    "android.hardware.sensor.light",
    "android.hardware.sensor.proximity",
    "android.hardware.sensor.stepcounter",
    "android.hardware.sensor.stepdetector",
    "android.hardware.telephony",
    "android.hardware.touchscreen",
    "android.hardware.fingerprint",
    "android.hardware.biometrics.face",
    "android.hardware.sensor.face",
    "android.hardware.biometrics.iris",
    "android.hardware.sensor.iris"
  ];

  const mockHasSystemFeature = function(featureStr, ver = -1) {
    if (featureStr && forcedFeatures.includes(featureStr)) {
      log(`[*] CLOAKING DETECTED: hasSystemFeature(${featureStr}${ver !== -1 ? ', ' + ver : ''}) matched forced feature -> returning true`);
      logFridaRecord("FridaCloaking.packageManager.hasSystemFeature", { feature: featureStr }, "true");
      return true;
    }
    let result = ver !== -1 ? this.hasSystemFeature(featureStr, ver) : this.hasSystemFeature(featureStr);
    return result;
  };

  const classesToHook = [
    'android.app.ApplicationPackageManager',
    'android.content.pm.PackageManager'
  ];

  classesToHook.forEach(function(clsName) {
    try {
      const cls = Java.use(clsName);
      if (cls && cls.hasSystemFeature) {
        cls.hasSystemFeature.overload('java.lang.String').implementation = mockHasSystemFeature;
        try {
          cls.hasSystemFeature.overload('java.lang.String', 'int').implementation = mockHasSystemFeature;
        } catch (e) {}
        log(`[+] Hooked ${clsName}.hasSystemFeature successfully`);
      }
    } catch (err) {
      log(`[-] Failed to hook ${clsName}.hasSystemFeature: ` + err.message);
    }
  });
}


try {
  libcHooks();
} catch (err) {
  log("[-] ERROR: " + err.message);
}

Java.perform(function() {
  log('[+] Start hook');
  setAndroidBuildFields();
  systemPropertiesHook();
  mockDevice();
  mockTimezone();
  mockInstalledApps();
  mockWifiAndNetwork();
  try {
    initGlMocking();
  } catch(err) {
    log("[-] ERROR in initGlMocking: " + err.message);
  }
  try {
    hookSystemFeatures();
  } catch(err) {
    log("[-] ERROR in hookSystemFeatures: " + err.message);
  }
  try {
    sensorHook();
  } catch(err) {
    log("[-] ERROR: " + err.message);
  }

  const UA = getRealisticUA(activeProfile.ua);
  const webView = Java.use('android.webkit.WebView');
  let javaNetUrl = Java.use("java.net.URL");
  let httpURLConnection = Java.use("java.net.HttpURLConnection");

  let date = Java.use('java.util.Date');
  let dateNow = date.$new();
  let t = dateNow.getTime();
  let s = Math.floor(t/1000);

  const enforceUA = function(instance, url, headers) {
    const settings = instance.getSettings();
    settings.setUserAgentString(UA);
    log(`[+] WebView Loading: ${url} with Custom UA`);
    logFridaRecord("FridaCloaking.webview.loadUrl", {}, url);
    if (headers) {
        const Map = Java.use('java.util.Map');
        const headerMap = Java.cast(headers, Map);
        headerMap.put('User-Agent', UA);
        return instance.loadUrl(url, headerMap);
    }
    return instance.loadUrl(url);
  };

  webView.loadUrl.overload('java.lang.String').implementation = function (url) {
    enforceUA(this, url, null);
  }

  webView.loadUrl.overload('java.lang.String', 'java.util.Map').implementation = function (url, headers) {
    enforceUA(this, url, headers);
  }

  Java.use("android.os.BatteryManager").getIntProperty.overload("int").implementation = function(battery_property_value) {
    if (battery_property_value == 4) { //BATTERY_PROPERTY_CAPACITY
      log('[*] BATTERY_PROPERTY_CAPACITY queried, returing value 83');
      logFridaRecord("FridaCloaking.BatteryManager.BATTERY_PROPERTY_CAPACITY", {}, "83");
      return 83;
    } else if (battery_property_value == 6) { //BATTERY_PROPERTY_STATUS
      log('[*] BATTERY_PROPERTY_STATUS queried, returning 3');
      logFridaRecord("FridaCloaking.BatteryManager.BATTERY_PROPERTY_STATUS", {}, "3");
      return 3; //BATTERY_STATUS_DISCHARGING
    }
    return battery_property_value;
  };

  Java.use('android.content.Intent').getIntExtra.overload("java.lang.String", "int").implementation = function (arg, arg1) {
    var ret = this.getIntExtra(arg, arg1);
    if (arg == 'plugged') {
      logFridaRecord("FridaCloaking.Intent.plugged", {}, "0");
      return 0;
    }
    else {
      return ret;
    }
  };

  const httpConnection = Java.use('com.android.okhttp.internal.huc.HttpURLConnectionImpl');
  httpConnection.initHttpEngine.implementation = function() {
    try {
      this.setRequestProperty("User-Agent", UA);
    } catch (err) {
      log("[-] ERROR: " + err.message);
    }
    this.initHttpEngine();
  };

  javaNetUrl.openConnection.overload().implementation = function () {
       var conn = this.openConnection();
       try {
           var httpConn = Java.cast(conn, HttpURLConnection);
           httpConn.setRequestProperty("User-Agent", UA);
       } catch (err) {
       }
       return conn;
  };

  javaNetUrl.openConnection.overload("java.net.Proxy").implementation = function (proxy) {
      var conn = this.openConnection(proxy);
      try {
          var httpConn = Java.cast(conn, HttpURLConnection);
          httpConn.setRequestProperty("User-Agent", UA);
      } catch (err) {
      }
      return conn;
  };

  hookAppsFlyer();

  // from bread_tf_cloaking.js
  // time cloaking commonly used by Bread
  Java.use("java.util.Date").after.overload('java.util.Date')
      .implementation = function(date) {
    logFridaRecord("FridaCloaking.Date.after", {}, "True");
    log("[*] CLOAKING DETECTED: Client Side Time Cloaking");
    log("[+] Call to 'java.util.Date->after' intercepted. "
        + "Returning 'true' to check if date is after '"
        + date.toString() + "'");
    return true;
  };

  // from bread_tf_cloaking.js
  // Play availability check commonly used by Bread
  let playUrl = "https://play.google.com/store/apps/details?id="
    + "com.google.android.gm";
  javaNetUrl.$init.overload("java.lang.String")
      .implementation = function(url) {
    if ( url != null
        && url.includes('://play.google.com/store/apps/details?id=') ) {
      logFridaRecord("FridaCloaking.PlayStorePublished", {}, "New url");
      log("[*] CLOAKING DETECTED: PlayStore Cloaking");
      return this.$init(playUrl);
    }
    return this.$init(url);
  };
  // I1454: Check adb_enabled value to detect adb
  //deprecated in API level 17
  let settSecure = Java.use("android.provider.Settings$Secure");
  let overloadGetInt = settSecure["getInt"].overloads.length;
  for (let i = 0; i < overloadGetInt; i++) {
    settSecure["getInt"].overloads[i].implementation = function () {
      let retval = this["getInt"].apply(this, arguments);
      let param = arguments[1];
      log("[+] Inside $SECURE with " + param);
      if (param === "development_settings_enabled" || param == "adb_enabled")
      {
        logFridaRecord("FridaCloaking.Settings.Secure.getInt", {}, "0");
        log('[*] CLOAKING DETECTED: Anti-debug detected $SECURE in adb_enabled_int: ', param);
        return 0;
      }
      return retval;
    };
  }

  let overloadGetString = settSecure["getString"].overloads.length;
  for (let i = 0; i < overloadGetString; i++) {
    settSecure["getString"].overloads[i].implementation = function () {
      let retval = this["getString"].apply(this, arguments);
      let param = arguments[1];
      if (param === "development_settings_enabled" || param == "adb_enabled") {
        logFridaRecord("FridaCloaking.Settings.Secure.getString", {}, "0");
        log('[*] CLOAKING DETECTED: Anti-debug detected $SECURE in adb_enabled_string', param);
        return '0';
      }
      return retval;
    };
  }

  let settGlobal = Java.use("android.provider.Settings$Global");
  let overloadGetInt1 = settGlobal["getInt"].overloads.length;
  for (let i = 0; i < overloadGetInt1; i++) {
    settGlobal["getInt"].overloads[i].implementation = function () {
      let retval = this["getInt"].apply(this, arguments);
      let param = arguments[1];
      log("[+] Inside $SECURE " + param);
      if (param === "development_settings_enabled" || param == "adb_enabled")
      {
        logFridaRecord("FridaCloaking.Settings.Global.getInt", {}, "0");
        log('[*] CLOAKING DETECTED: Anti-debug detected $GLOBAL in adb_enabled_int:', param);
        return 0;
      }
      return retval;
    };
  }

  var overloadGetString1 = settGlobal["getString"].overloads.length;
  for (var i = 0; i < overloadGetString1; i++) {
    settGlobal["getString"].overloads[i].implementation = function () {
      var retval = this["getString"].apply(this, arguments);
      var param = arguments[1];
      if (param === "development_settings_enabled" || param == "adb_enabled") {
        logFridaRecord("FridaCloaking.Settings.Global.getString", {}, "0");
        log('[*] CLOAKING DETECTED: Anti-debug detected $GLOBAL in adb_enabled_string:', param);
        return '0';
      }
      return retval;
    };
  }

  // I0597: Checking if rooting related application exists: "/sbin/su"
  // I0598: Checking if rooting related application exists: "/system/bin/su"
  // I0599: Checking if rooting related application exists: "/system/xbin/su"
  // I0600: Checking if rooting related application exists: "/data/local/bin/su"
  // I0601: Checking if rooting related application exists: "/data/local/xbin/su"
  // I0602: Checking if rooting related application exists: "/system/sd/xbin/su"
  // I0605: Checking if rooting related application exists: "/su/bin/su"
  // I0606: Checking if rooting related application exists: "/su/xbin/su"
  let javaIoFile =Java.use('java.io.File');
  javaIoFile.exists.implementation = function() {
    let path = this.getPath();
    if (path.endsWith("bin/su") || path.endsWith("failsafe/su") || path.endsWith("local/su")) {
      log("[*] CLOAKING DETECTED: SU binary Cloaking");
      logFridaRecord("FridaCloaking.RootCloaking.File.exists", {}, "False");
      return false;
    }
    return this.exists();
  };

  const partitionCache = {};

  function getBelievableSpaces(path) {
    let partition = "unknown";
    if (!path) {
      path = "";
    }
    if (path.startsWith("/system") || path.startsWith("/vendor") || path.startsWith("/apex") || path.startsWith("/odm") || path.startsWith("/product") || path.startsWith("/system_ext")) {
      partition = "system";
    } else if (path.startsWith("/data") || path.startsWith("/cache")) {
      partition = "data";
    } else if (path.startsWith("/storage") || path.startsWith("/sdcard") || path.indexOf("shared") !== -1 || path.indexOf("emulated") !== -1) {
      partition = "storage";
    } else if (path === "/" || path === "") {
      partition = "system";
    }

    if (partitionCache[partition]) {
      return partitionCache[partition];
    }

    let total = 0;
    let usable = 0;

    if (partition === "system") {
      // system space ~ 2.8 GB - 3.9 GB
      let baseTotal = 2.8 * 1024 * 1024 * 1024;
      total = Math.floor(baseTotal + Math.random() * 1.1 * 1024 * 1024 * 1024);
      // usable space ~ 40 MB - 180 MB (nearly full)
      usable = Math.floor(40 * 1024 * 1024 + Math.random() * 140 * 1024 * 1024);
    } else if (partition === "data") {
      // data space ~ 64 GB, 128 GB, or 256 GB
      let tiers = [64, 128, 256];
      let gigabytes = tiers[Math.floor(Math.random() * tiers.length)];
      total = gigabytes * 1024 * 1024 * 1024;
      total = Math.floor(total * (0.88 + Math.random() * 0.04));
      usable = Math.floor(total * (0.25 + Math.random() * 0.40));
    } else if (partition === "storage") {
      // storage/sdcard space ~ 64 GB or 128 GB
      let tiers = [64, 128];
      let gigabytes = tiers[Math.floor(Math.random() * tiers.length)];
      total = gigabytes * 1024 * 1024 * 1024;
      total = Math.floor(total * (0.92 + Math.random() * 0.03));
      usable = Math.floor(total * (0.30 + Math.random() * 0.40));
    } else {
      // fallback general path space
      total = Math.floor((24 + Math.random() * 16) * 1024 * 1024 * 1024);
      usable = Math.floor(total * (0.35 + Math.random() * 0.30));
    }

    partitionCache[partition] = { total: total, usable: usable };
    return partitionCache[partition];
  }

  javaIoFile.getTotalSpace.implementation = function() {
    let path = this.getAbsolutePath();
    let spaces = getBelievableSpaces(path);
    log("[*] CLOAKING DETECTED: java.io.File.getTotalSpace() queried for: " + path + ", returning fake believable size: " + spaces.total);
    logFridaRecord("FridaCloaking.File.getTotalSpace", { path: path }, String(spaces.total));
    return spaces.total;
  };

  javaIoFile.getUsableSpace.implementation = function() {
    let path = this.getAbsolutePath();
    let spaces = getBelievableSpaces(path);
    log("[*] CLOAKING DETECTED: java.io.File.getUsableSpace() queried for: " + path + ", returning fake believable size: " + spaces.usable);
    logFridaRecord("FridaCloaking.File.getUsableSpace", { path: path }, String(spaces.usable));
    return spaces.usable;
  };

  javaIoFile.getFreeSpace.implementation = function() {
    let path = this.getAbsolutePath();
    let spaces = getBelievableSpaces(path);
    log("[*] CLOAKING DETECTED: java.io.File.getFreeSpace() queried for: " + path + ", returning fake believable size: " + spaces.usable);
    logFridaRecord("FridaCloaking.File.getFreeSpace", { path: path }, String(spaces.usable));
    return spaces.usable;
  };

  //I0529: Detect analysis environment by checking installation attribution
  //I1172 Get installation attribution through Google Play Stores Install Referrer API
  // from b/284968838
  try {
    const rDetails = Java.use('com.android.installreferrer.api.ReferrerDetails');
    rDetails.getInstallReferrer.implementation = function() {
      log("[*] CLOAKING DETECTED: getInstallReferrer");
      let facebook_app_id = "";
      try {
        let string_id = getContext().getResources().getIdentifier("facebook_app_id", "string", getContext().getPackageName());
        facebook_app_id = getContext().getString(string_id);
        if(facebook_app_id != ''){
            log('[+] getInstallReferrer facebook_app_id found');
        }
      }
      catch (err) {
        log('[-] ERROR: getInstallReferrer - ' + err.message);
      }
      let refferal = "gclid=123456789&utm_medium=referral&utm_source=apps."
          + "facebook.com&utm_campaign=fb4a&utm_content=bytedanceglobal_E.C.P.C"
          + "&facebook_app_id=" + facebook_app_id;
      logFridaRecord("FridaCloaking.getInstallReferrer", {}, refferal);
      return refferal;
    };
    rDetails.getInstallBeginTimestampSeconds.implementation = function() {
      let ret = s - 5 - getRand(30);
      log("[*] CLOAKING DETECTED: getInstallBeginTimestampSeconds - " + String(ret));
      logFridaRecord("FridaCloaking.getInstallBeginTimestampSeconds", {}, String(ret));
      return ret;
    };
    rDetails.getReferrerClickTimestampSeconds.implementation = function() {
      let ret = s - 15 - getRand(60);
      log("[*] CLOAKING DETECTED: getReferrerClickTimestampSeconds - " + String(ret));
      logFridaRecord("FridaCloaking.getReferrerClickTimestampSeconds", {}, String(ret));
      return ret;
    };
  } catch(err) {
    log("[-] ERROR: " + err.message);
  }

  log('[+] Before BaseBundle');
  // in some cases they obfuscate Referral API so we cant hook methods
  // to bypass it we can hook android.os.Bundle.getString('install_referrer');
  // or  android.os.Bundle.getLong('referrer_click_timestamp_seconds');
  // or  android.os.Bundle.getLong('install_begin_timestamp_seconds');
  let bundleClass = Java.use("android.os.BaseBundle");
  try {

    let sMethod1= bundleClass.getString.overload('java.lang.String');
    sMethod1.implementation = function(link) {
      log("[+] BaseBundle.String1: " + link);
      let ret = sMethod1.call(this, link);
      if (link == "install_referrer") {
        log("in method: " + link);
        let referral2 = "gclid=123456789&utm_source=apps.facebook.com&"
           + "utm_campaign=fb4a&utm_medium=referral";
        logFridaRecord("FridaCloaking.BaseBundle.install_referrer", {},
            referral2);
        log('[*] CLOAKING DETECTED: bundle install_referrer.');
        return referral2;
      }
      return ret;
    };

    let sMethod2= bundleClass.getString.overload('java.lang.String','java.lang.String');
    sMethod2.implementation = function(link, defaultValue) {
      log("[+] BaseBundle.String2: " + link);
      let ret = sMethod2.call(this, link, defaultValue);
      if (link == "install_referrer") {
        log("[+] in method: " + link);
        let referral2 = "gclid=123456789&utm_source=apps.facebook.com&"
           + "utm_campaign=fb4a&utm_medium=referral";
        logFridaRecord("FridaCloaking.BaseBundle.install_referrer", {},
            referral2);
        log('[*] CLOAKING DETECTED: bundle install_referrer with defaultValue.');
        return referral2;
      }
      return ret;
    };

    let sMethodL2 = bundleClass.getLong.overload('java.lang.String', 'long');
    sMethodL2.implementation = function(link, defaultValue) {
      log("[+] in BaseBundle.getLong2: " + link);
      let ret = sMethodL2.call(this, link, defaultValue);
      if (link == "referrer_click_timestamp_seconds") {
        log("in method: " + link);
        let ret2 = s - 5 - getRand(30);
        logFridaRecord(
            "FridaCloaking.BaseBundle.referrer_click_timestamp_seconds", {},
            String(ret2));
        log('[*] CLOAKING DETECTED: bundle referrer_click_timestamp_seconds with defaultValue.');
        return ret2;
      }
      if (link == "install_begin_timestamp_seconds") {
        log("[+] in method: " + link);
        let ret2 = s - 15 - getRand(60);
        logFridaRecord(
            "FridaCloaking.BaseBundle.install_begin_timestamp_seconds", {},
            String(ret2));
        log('[*] CLOAKING DETECTED: bundle install_begin_timestamp_seconds.');
        return ret2;
      }
      return ret;
    };
  } catch(err) {
    log("[-] ERROR: " + err.message);
  }

  // from bread_tf_cloaking.js
  // Play version check commonly used by Bread
  const Activity = Java.use('android.app.Activity');
  let manifestVersionName = '1.0';
  // the currentApplication() in getContext() might return a null object
  try {
    manifestVersionName =
      getContext()
          .getPackageManager()
          .getPackageInfo(getContext().getPackageName(), 0)
          .versionName.value;
  } catch (err) {
    log("[-] ERROR: " + err.message);
  }
  //const packageName = getContext().getPackageName();

  Activity.onResume.implementation = function () {
    if (!hooked) {
      hooked = true;
      let stringClass = Java.use('java.lang.String');
      stringClass.contains.implementation = function(st) {
        if (st == manifestVersionName) {
          log("[*] CLOAKING DETECTED: PlayStore Version Name Cloaking");
          logFridaRecord("FridaCloaking.PlayStore.version", {}, "True");
          return true;
        }
       //I0952: Search for case-insensitive "intel" string in /proc/cpuinfo file
       //to detect x86 emulator
        if (st == "intel") {
          log("[*] CLOAKING DETECTED: Processor Type Cloaking");
          logFridaRecord("FridaCloaking.CPU.intel", {}, "False");
          return false;
        }
        // b/270362069 some bread apps check if play response contains pkg name
        // b/327609555 - TF devs started using it against us.
        // They are not using it for claokign anymore, instead they use package
        // name check to preven the app from being properly executed
        //if(st == packageName){
        //  log("[*] CLOAKING DETECTED: PlayStore Package Name Cloaking");
        //  return true;
        //}
        return this.contains(st);
      };
    }
    this.onResume();
  };
  log('[+] Finish hook');
});