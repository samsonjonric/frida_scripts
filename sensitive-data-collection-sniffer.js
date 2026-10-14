/* FG SCRIPT. Please keep this line. */

/**
 * Description: This Frida script hooks into various Android APIs to log access attempts to sensitive data.
 * Version: 1.3
 * This script detects and logs:
 *
 * Device Identifiers:
 *
 * - Advertising ID Access (com.google.android.gms.ads.identifier.AdvertisingIdClient)
 * - Android ID Access (android.provider.Settings$Secure)
 * - Device Identifiers Access (android.telephony.TelephonyManager)
 * - IMEI Access
 * - MEID Access
 * - IMSI Access
 * - GSF ID Access Attempt (content://com.google.android.gsf.gservices)
 * - MAC Address Access (java.net.NetworkInterface, android.net.wifi.WifiManager, android.bluetooth.BluetoothAdapter)
 * - SIM Card Details Access (android.telephony.TelephonyManager)
 * - SIM Serial Number Access
 * - SIM Operator Name Access
 * - Widevine ID Access (android.media.MediaDrm)
 *
 * Personal Information:
 *
 * - Calendar Data Access (android.content.ContentResolver)
 * - Contacts Access (android.content.ContentResolver, android.database.Cursor, androidx.core.content.ContextCompat)
 * - Email Accounts Access (android.accounts.AccountManager)
 * - Google Account Information Access (android.accounts.AccountManager)
 * - Phone Number Access (android.telephony.TelephonyManager)
 * - SMS Messages Access (android.content.ContentResolver)
 *
 * Location and Network:
 *
 * - Bluetooth MAC Address Access (android.bluetooth.BluetoothAdapter)
 * - Fused Location Access (com.google.android.gms.location.FusedLocationProviderClient)
 * - IP Address Access (android.net.wifi.WifiManager)
 * - Location Data Access (android.location.LocationManager)
 * - Nearby Wi-Fi Networks Access (android.net.wifi.WifiManager)
 * - Network State Access (android.net.ConnectivityManager)
 * - Wi-Fi MAC Address Access (android.net.wifi.WifiManager)
 * - Wi-Fi State Access (android.net.wifi.WifiManager)
 *
 * System and App Data:
 *
 * - Call Log Access (android.content.ContentResolver)
 * - Clipboard Data Access (android.content.ClipboardManager, android.content.ClipData)
 * - Installed Apps Access (android.content.pm.PackageManager, android.content.pm.ApplicationInfo)
 * - SharedPreferences Access (android.content.ContextWrapper, android.app.SharedPreferencesImpl, android.app.SharedPreferencesImpl$EditorImpl)
 * - String, Boolean, Float, Int Access
 * - Encrypted SharedPreferences Access (androidx.security.crypto.EncryptedSharedPreferences$Editor)
 * - SQLite Database Operations (android.database.sqlite.SQLiteDatabase)
 *
 * Web and Network Operations:
 *
 * - HttpURLConnection Calls (java.net.HttpURLConnection, com.android.okhttp.internal.huc.HttpsURLConnectionImpl)
 * - OkHttp Calls (okhttp3.OkHttpClient, okhttp3.Request$Builder, okhttp3.Call)
 *
 * Security and Encryption:
 *
 * - General Encryption and Decryption Methods (javax.crypto.Cipher, javax.crypto.KeyGenerator, java.security.KeyPairGenerator)
 * - RSA, AES Key Generation and Operations
 * - Bouncy Castle Encryption (org.bouncycastle.crypto.engines.AESEngine, org.bouncycastle.jcajce.provider.asymmetric.rsa.KeyPairGeneratorSpi)
 * - Apache Commons Codec (org.apache.commons.codec.digest.DigestUtils)
 * - Base64 Operations (android.util.Base64, java.util.Base64, org.apache.commons.codec.binary.Base64, org.bouncycastle.util.encoders.Base64Encoder/Base64Decoder, com.google.common.io.BaseEncoding, sun.misc.BASE64Encoder/BASE64Decoder, android.util.Base64InputStream/Base64OutputStream)
 * - Root Detection Prevention
 *
 * Data Processing and Libraries:
 *
 * - Compression Libraries (java.util.zip.GZIPOutputStream, java.util.zip.DeflaterOutputStream, java.util.zip.ZipOutputStream)
 * - Gson and JSON Libraries (com.google.gson.Gson, com.google.gson.GsonBuilder, com.fasterxml.jackson.databind.ObjectMapper, org.json.JSONObject)
 * - Gson, Jackson, org.json, Alibaba Fastjson, Moshi, LoganSquare, Igson, Kotlinx.serialization, Flexjson, JSON.simple, JSON-B (Jakarta EE)
 */

/** Support console.log with Frida Gadget*/
function logJWConsole() {
 try {
      let msg = '';
      if (arguments.length == 1) {
        msg = String(arguments[0]);
      } else {
        msg = JSON.stringify(arguments);
      }
      const androidLog = Java.use('android.util.Log');
      androidLog.e('FG', msg);
    } catch(err) {}
}

if (typeof logFridaRecord !== "undefined") {
  if (typeof _ifLogcatLog === "undefined") {
    console.log = logJWConsole;
  }
}

var idTracker = {
  ids: {}
};
let report = {
  sensitiveIds: {},
  permissionChecks: [],
  networkRequests: [],
  logs: [],
  errors: [],
  unknownEvents: []
};
var callStackFilter = null;
var targetAppName = null;
var LOG_FILTER = "";

function logException(e) {
  var truncatedMessage = e.message.substring(0, 250); //prevents junk text in JW
  safeLog("[!] Exception: " + truncatedMessage);
}

function safeTryDecode(data) {
  try {
      var result = [];
      // Limit the data size to prevent excessive processing
      var truncatedData = data.length > 100 ? data.slice(0, 100) : data;

      // UTF-8 decoding
      try {
          result.push("UTF-8: " + Java.use('java.lang.String').$new(truncatedData, "UTF-8"));
      } catch (e) {
      }

      // Base64 encoding
      try {
          var encoded = Base64.encodeToString(truncatedData, 0);
          result.push("To Base64: " + encoded);
      } catch (e) {
      }

      // Hexadecimal representation
      var hex = '';
      for (var i = 0; i < truncatedData.length; i++) {
          hex += ('0' + (truncatedData[i] & 0xFF).toString(16)).slice(-2);
      }
      // result.push("Hex: " + hex);

      return result.join("\n");
  } catch (e) {
      return "Error in decoding: " + e.message;
  }
}

function safeUse(className) {
  try {
      return Java.use(className);
  } catch (e) {
      logException(e);
      return null;
  }
}

function safeLog(message) {
  try {
      // Extract information based on message patterns
      if (message.startsWith("[ROOT DETECTION PREVENTION TRIGGERED]")) {
          report.rootDetectionPreventionTriggered = true;
      } else if (message.startsWith("[+] Permission Check: ")) {
          const permission = message.split(": ")[1];
          trackData("permissionCheck", permission, message);
      } else if (message.startsWith("[NETWORK] URL: ")) {
          const url = message.split(": ")[1];
          trackData("networkRequest", url, "GET");
      } else if (message.startsWith("[PAYLOAD] OutputStream closed for URL: ")) {
          trackData("networkRequest", message, "POST");
      } else if (message.startsWith("[SENSITIVE ID DETECTED | STEP ")) {
          trackData("sensitiveId", null, message);
      }

      console.log(message);
  } catch (e) {
      // Handle logging errors
      console.error("Error in safeLog:", e);
  }
}

function truncate(str, maxLength = 100) {
  return str.length > maxLength ? str.substring(0, maxLength) + "..." : str;
}

function isTargetApp(callStack) {
  return callStack.includes("*TARGET APP*");
}

function preventRootCheck() {
  var RootPackages = ["com.noshufou.android.su", "com.noshufou.android.su.elite", "eu.chainfire.supersu",
      "com.koushikdutta.superuser", "com.thirdparty.superuser", "com.yellowes.su", "com.koushikdutta.rommanager",
      "com.koushikdutta.rommanager.license", "com.dimonvideo.luckypatcher", "com.chelpus.lackypatch",
      "com.ramdroid.appquarantine", "com.ramdroid.appquarantinepro", "com.devadvance.rootcloak", "com.devadvance.rootcloakplus",
      "de.robv.android.xposed.installer", "com.saurik.substrate", "com.zachspong.temprootremovejb", "com.amphoras.hidemyroot",
      "com.amphoras.hidemyrootadfree", "com.formyhm.hiderootPremium", "com.formyhm.hideroot", "me.phh.superuser",
      "eu.chainfire.supersu.pro", "com.kingouser.com", "com.topjohnwu.magisk"
  ];

  var RootBinaries = ["su", "busybox", "supersu", "Superuser.apk", "KingoUser.apk", "SuperSu.apk", "magisk"];

  var RootProperties = {
      "ro.build.selinux": "1",
      "ro.debuggable": "0",
      "service.adb.root": "0",
      "ro.secure": "1"
  };

  var RootPropertiesKeys = Object.keys(RootProperties);

  try {
      var PackageManager = Java.use("android.app.ApplicationPackageManager");
      var Runtime = Java.use('java.lang.Runtime');
      var NativeFile = Java.use('java.io.File');
      var String = Java.use('java.lang.String');
      var SystemProperties = Java.use('android.os.SystemProperties');
      var BufferedReader = Java.use('java.io.BufferedReader');
      var ProcessBuilder = Java.use('java.lang.ProcessBuilder');
      var StringBuffer = Java.use('java.lang.StringBuffer');
      var loaded_classes = Java.enumerateLoadedClassesSync();
  } catch (err) {
      safeLog("[ROOT DETECTION PREVENTION TRIGGERED] Failed to load some classes: " + err);
  }

  try {
      // Hook PackageManager
      PackageManager.getPackageInfo.overload('java.lang.String', 'int').implementation = function (pname, flags) {
          var shouldFakePackage = (RootPackages.indexOf(pname) > -1);
          if (shouldFakePackage) {
              safeLog("[ROOT DETECTION PREVENTION TRIGGERED] Bypass root check for package: " + pname);
              pname = "set.package.name.to.a.fake.one.so.we.can.bypass.it";
          }
          return this.getPackageInfo.overload('java.lang.String', 'int').call(this, pname, flags);
      };
      safeLog("[ROOT DETECTION PREVENTION TRIGGERED] Hooked PackageManager.getPackageInfo");
  } catch (err) {
      safeLog("[ROOT DETECTION PREVENTION TRIGGERED] Failed to hook PackageManager.getPackageInfo: " + err);
  }

  try {
      // Hook NativeFile
      NativeFile.exists.implementation = function () {
          var name = NativeFile.getName.call(this);
          var shouldFakeReturn = (RootBinaries.indexOf(name) > -1);
          if (shouldFakeReturn) {
              safeLog("[ROOT DETECTION PREVENTION TRIGGERED] Bypass return value for binary: " + name);
              return false;
          } else {
              return this.exists.call(this);
          }
      };
      safeLog("[ROOT DETECTION PREVENTION TRIGGERED] Hooked NativeFile.exists");
  } catch (err) {
      safeLog("[ROOT DETECTION PREVENTION TRIGGERED] Failed to hook NativeFile.exists: " + err);
  }

  try {
      // Hook Runtime.exec
      var exec = Runtime.exec.overload('[Ljava.lang.String;');
      var exec1 = Runtime.exec.overload('java.lang.String');
      var exec2 = Runtime.exec.overload('java.lang.String', '[Ljava.lang.String;');
      var exec3 = Runtime.exec.overload('[Ljava.lang.String;', '[Ljava.lang.String;');
      var exec4 = Runtime.exec.overload('[Ljava.lang.String;', '[Ljava.lang.String;', 'java.io.File');
      var exec5 = Runtime.exec.overload('java.lang.String', '[Ljava.lang.String;', 'java.io.File');

      exec5.implementation = function (cmd, env, dir) {
          if (cmd.indexOf("getprop") != -1 || cmd == "mount" || cmd.indexOf("build.prop") != -1 || cmd == "id" || cmd == "sh") {
              var fakeCmd = "grep";
              safeLog("[ROOT DETECTION PREVENTION TRIGGERED] Bypass " + cmd + " command");
              return exec1.call(this, fakeCmd);
          }
          if (cmd == "su") {
              var fakeCmd = "justafakecommandthatcannotexistsusingthisshouldthowanexceptionwheneversuiscalled";
              safeLog("[ROOT DETECTION PREVENTION TRIGGERED] Bypass " + cmd + " command");
              return exec1.call(this, fakeCmd);
          }
          return exec5.call(this, cmd, env, dir);
      };

      exec4.implementation = function (cmdarr, env, file) {
          for (var i = 0; i < cmdarr.length; i = i + 1) {
              var tmp_cmd = cmdarr[i];
              if (tmp_cmd.indexOf("getprop") != -1 || tmp_cmd == "mount" || tmp_cmd.indexOf("build.prop") != -1 || tmp_cmd == "id" || tmp_cmd == "sh") {
                  var fakeCmd = "grep";
                  safeLog("[ROOT DETECTION PREVENTION TRIGGERED] Bypass " + cmdarr + " command");
                  return exec1.call(this, fakeCmd);
              }

              if (tmp_cmd == "su") {
                  var fakeCmd = "justafakecommandthatcannotexistsusingthisshouldthowanexceptionwheneversuiscalled";
                  safeLog("[ROOT DETECTION PREVENTION TRIGGERED] Bypass " + cmdarr + " command");
                  return exec1.call(this, fakeCmd);
              }
          }
          return exec4.call(this, cmdarr, env, file);
      };

      exec3.implementation = function (cmdarr, envp) {
          for (var i = 0; i < cmdarr.length; i = i + 1) {
              var tmp_cmd = cmdarr[i];
              if (tmp_cmd.indexOf("getprop") != -1 || tmp_cmd == "mount" || tmp_cmd.indexOf("build.prop") != -1 || tmp_cmd == "id" || tmp_cmd == "sh") {
                  var fakeCmd = "grep";
                  safeLog("[ROOT DETECTION PREVENTION TRIGGERED] Bypass " + cmdarr + " command");
                  return exec1.call(this, fakeCmd);
              }

              if (tmp_cmd == "su") {
                  var fakeCmd = "justafakecommandthatcannotexistsusingthisshouldthowanexceptionwheneversuiscalled";
                  safeLog("[ROOT DETECTION PREVENTION TRIGGERED] Bypass " + cmdarr + " command");
                  return exec1.call(this, fakeCmd);
              }
          }
          return exec3.call(this, cmdarr, envp);
      };

      exec2.implementation = function (cmd, env) {
          if (cmd.indexOf("getprop") != -1 || cmd == "mount" || cmd.indexOf("build.prop") != -1 || cmd == "id" || cmd == "sh") {
              var fakeCmd = "grep";
              safeLog("[ROOT DETECTION PREVENTION TRIGGERED] Bypass " + cmd + " command");
              return exec1.call(this, fakeCmd);
          }
          if (cmd == "su") {
              var fakeCmd = "justafakecommandthatcannotexistsusingthisshouldthowanexceptionwheneversuiscalled";
              safeLog("[ROOT DETECTION PREVENTION TRIGGERED] Bypass " + cmd + " command");
              return exec1.call(this, fakeCmd);
          }
          return exec2.call(this, cmd, env);
      };

      exec.implementation = function (cmd) {
          for (var i = 0; i < cmd.length; i = i + 1) {
              var tmp_cmd = cmd[i];
              if (tmp_cmd.indexOf("getprop") != -1 || tmp_cmd == "mount" || tmp_cmd.indexOf("build.prop") != -1 || tmp_cmd == "id" || tmp_cmd == "sh") {
                  var fakeCmd = "grep";
                  safeLog("[ROOT DETECTION PREVENTION TRIGGERED] Bypass " + cmd + " command");
                  return exec1.call(this, fakeCmd);
              }

              if (tmp_cmd == "su") {
                  var fakeCmd = "justafakecommandthatcannotexistsusingthisshouldthowanexceptionwheneversuiscalled";
                  safeLog("[ROOT DETECTION PREVENTION TRIGGERED] Bypass " + cmd + " command");
                  return exec1.call(this, fakeCmd);
              }
          }

          return exec.call(this, cmd);
      };

      exec1.implementation = function (cmd) {
          if (cmd.indexOf("getprop") != -1 || cmd == "mount" || cmd.indexOf("build.prop") != -1 || cmd == "id" || cmd == "sh") {
              var fakeCmd = "grep";
              safeLog("[ROOT DETECTION PREVENTION TRIGGERED] Bypass " + cmd + " command");
              return exec1.call(this, fakeCmd);
          }
          if (cmd == "su") {
              var fakeCmd = "justafakecommandthatcannotexistsusingthisshouldthowanexceptionwheneversuiscalled";
              safeLog("[ROOT DETECTION PREVENTION TRIGGERED] Bypass " + cmd + " command");
              return exec1.call(this, fakeCmd);
          }
          return exec1.call(this, cmd);
      };
      safeLog("[ROOT DETECTION PREVENTION TRIGGERED] Hooked Runtime.exec");
  } catch (err) {
      safeLog("[ROOT DETECTION PREVENTION TRIGGERED] Failed to hook Runtime.exec: " + err);
  }

  try {
      // Hook String.contains
      String.contains.implementation = function (name) {
          if (name == "test-keys") {
              safeLog("[ROOT DETECTION PREVENTION TRIGGERED] Bypass test-keys check");
              return false;
          }
          return this.contains.call(this, name);
      };
      safeLog("[ROOT DETECTION PREVENTION TRIGGERED] Hooked String.contains");
  } catch (err) {
      safeLog("[ROOT DETECTION PREVENTION TRIGGERED] Failed to hook String.contains: " + err);
  }

  try {
      // Hook SystemProperties.get
      var get = SystemProperties.get.overload('java.lang.String');
      get.implementation = function (name) {
          if (RootPropertiesKeys.indexOf(name) != -1) {
              safeLog("[ROOT DETECTION PREVENTION TRIGGERED] Bypass " + name);
              return RootProperties[name];
          }
          return this.get.call(this, name);
      };
      safeLog("[ROOT DETECTION PREVENTION TRIGGERED] Hooked SystemProperties.get");
  } catch (err) {
      safeLog("[ROOT DETECTION PREVENTION TRIGGERED] Failed to hook SystemProperties.get: " + err);
  }

  try {
      // Hook ProcessBuilder
      ProcessBuilder.start.implementation = function () {
          var cmd = this.command.call(this);
          var shouldModifyCommand = false;
          for (var i = 0; i < cmd.size(); i++) {
              var tmp_cmd = cmd.get(i).toString();
              if (tmp_cmd.indexOf("getprop") != -1 || tmp_cmd.indexOf("mount") != -1 || tmp_cmd.indexOf("build.prop") != -1 || tmp_cmd.indexOf("id") != -1) {
                  shouldModifyCommand = true;
              }
          }
          if (shouldModifyCommand) {
              safeLog("[ROOT DETECTION PREVENTION TRIGGERED] Bypass ProcessBuilder " + cmd);
              this.command.call(this, ["grep"]);
              return this.start.call(this);
          }
          if (cmd.indexOf("su") != -1) {
              safeLog("[ROOT DETECTION PREVENTION TRIGGERED] Bypass ProcessBuilder " + cmd);
              this.command.call(this, ["justafakecommandthatcannotexistsusingthisshouldthowanexceptionwheneversuiscalled"]);
              return this.start.call(this);
          }

          return this.start.call(this);
      };
      safeLog("[ROOT DETECTION PREVENTION TRIGGERED] Hooked ProcessBuilder");
  } catch (err) {
      safeLog("[ROOT DETECTION PREVENTION TRIGGERED] Failed to hook ProcessBuilder: " + err);
  }

  try {
      // Hook BufferedReader.readLine
      BufferedReader.readLine.overload('boolean').implementation = function () {
          var text = this.readLine.overload('boolean').call(this);
          if (text !== null) {
              var shouldFakeRead = (text.indexOf("ro.build.tags=test-keys") > -1);
              if (shouldFakeRead) {
                  safeLog("[ROOT DETECTION PREVENTION TRIGGERED] Bypass build.prop file read");
                  text = text.replace("ro.build.tags=test-keys", "ro.build.tags=release-keys");
              }
          }
          return text;
      };
      safeLog("[ROOT DETECTION PREVENTION TRIGGERED] Hooked BufferedReader.readLine");
  } catch (err) {
      safeLog("[ROOT DETECTION PREVENTION TRIGGERED] Failed to hook BufferedReader.readLine: " + err);
  }
  try {
      // Hook native library calls
      Interceptor.attach(Module.findExportByName("libc.so", "fopen"), {
          onEnter: function (args) {
              var path = Memory.readCString(args[0]);
              path = path.split("/");
              var executable = path[path.length - 1];
              var shouldFakeReturn = (RootBinaries.indexOf(executable) > -1)
              if (shouldFakeReturn) {
                  Memory.writeUtf8String(args[0], "/notexists");
                  safeLog("[ROOT DETECTION PREVENTION TRIGGERED] Bypass native fopen");
              }
          },
          onLeave: function (retval) {
          }
      });

      Interceptor.attach(Module.findExportByName("libc.so", "system"), {
          onEnter: function (args) {
              var cmd = Memory.readCString(args[0]);
              safeLog("[ROOT DETECTION PREVENTION TRIGGERED] SYSTEM CMD: " + cmd);
              if (cmd.indexOf("getprop") != -1 || cmd == "mount" || cmd.indexOf("build.prop") != -1 || cmd == "id") {
                  safeLog("[ROOT DETECTION PREVENTION TRIGGERED] Bypass native system: " + cmd);
                  Memory.writeUtf8String(args[0], "grep");
              }
              if (cmd == "su") {
                  safeLog("[ROOT DETECTION PREVENTION TRIGGERED] Bypass native system: " + cmd);
                  Memory.writeUtf8String(args[0], "justafakecommandthatcannotexistsusingthisshouldthowanexceptionwheneversuiscalled");
              }
          },
          onLeave: function (retval) {
          }
      });
      safeLog("[ROOT DETECTION PREVENTION TRIGGERED] Hooked native library calls");
  } catch (err) {
      safeLog("[ROOT DETECTION PREVENTION TRIGGERED] Failed to hook native library calls: " + err);
  }

  try {
      // Hook developer options detection
      var Settings = Java.use('android.provider.Settings');
      var SettingsGlobal = Java.use('android.provider.Settings$Global');
      var SettingsSecure = Java.use('android.provider.Settings$Secure');

      SettingsGlobal.getInt.overload('android.content.ContentResolver', 'java.lang.String', 'int').implementation = function (resolver, name, def) {
          if (name === "development_settings_enabled" || name === "adb_enabled") {
              safeLog("[ROOT DETECTION PREVENTION TRIGGERED] Bypassing Settings.Global.getInt for " + name);
              return 0;
          }
          return this.getInt.call(this, resolver, name, def);
      };

      SettingsSecure.getInt.overload('android.content.ContentResolver', 'java.lang.String', 'int').implementation = function (resolver, name, def) {
          if (name === "development_settings_enabled") {
              safeLog("[ROOT DETECTION PREVENTION TRIGGERED] Bypassing Settings.Secure.getInt for " + name);
              return 0;
          }
          return this.getInt.call(this, resolver, name, def);
      };

      SettingsGlobal.getString.overload('android.content.ContentResolver', 'java.lang.String').implementation = function (resolver, name) {
          if (name === "development_settings_enabled" || name === "adb_enabled") {
              safeLog("[ROOT DETECTION PREVENTION TRIGGERED] Bypassing Settings.Global.getString for " + name);
              return "0";
          }
          return this.getString.call(this, resolver, name);
      };

      SettingsSecure.getString.overload('android.content.ContentResolver', 'java.lang.String').implementation = function (resolver, name) {
          if (name === "development_settings_enabled") {
              safeLog("[ROOT DETECTION PREVENTION TRIGGERED] Bypassing Settings.Secure.getString for " + name);
              return "0";
          }
          return this.getString.call(this, resolver, name);
      };

      SystemProperties.get.overload('java.lang.String').implementation = function (key) {
          if (key === "ro.debuggable" || key === "persist.sys.usb.config") {
              safeLog("[ROOT DETECTION PREVENTION TRIGGERED] Bypassing SystemProperties.get for " + key);
              return "";
          }
          return this.get.call(this, key);
      };

      safeLog("[ROOT DETECTION PREVENTION TRIGGERED] Hooked developer options detection");
  } catch (err) {
      safeLog("[ROOT DETECTION PREVENTION TRIGGERED] Failed to hook developer options detection: " + err);
  }

  safeLog("[ROOT DETECTION PREVENTION TRIGGERED] Installed all hooks for root and developer options detection bypass");
}

function printBanner() {
  var banner = `
\`-:-.   ,-;"\`-:-.   ,-;"\`-:-.   ,-;"\`-:-.   ,-;"
 \`=\`,'=/     \`=\`,'=/     \`=\`,'=/     \`=\`,'=/
   y==/        y==/        y==/        y==/
 ,=,-<=\`.    ,=,-<=\`.    ,=,-<=\`.    ,=,-<=\`.
,-'-'   \`-=_,-'-'   \`-=_,-'-'   \`-=_,-'-'   \`-=_
`;
  safeLog(banner);
}

function setTargetAppName(appName) {
  targetAppName = appName;
}

function checkAndLogUriAccess(uri) {
  try {
      var uriString = uri.toString();
      if (uriString.startsWith("content://sms/")) {
          logPermissionCheck("SMS Messages Access");
          logCallStack();
          safeLog("[+] COLLECTION | Accessed SMS URI: " + uriString);
      } else if (uriString.startsWith("content://com.google.android.gsf.gservices")) {
          logPermissionCheck("GSF ID Access Attempt");
          logCallStack();
          safeLog("[+] COLLECTION | Attempted to access GSF ID URI: " + uriString);
      }
      // Add more conditions as needed for other sensitive URIs
  } catch (e) {
      logException(e);
  }
}

function trackData(dataType, data, description) {
  const timestamp = new Date().toISOString();
  console.log(`[DEBUG] trackData called at ${timestamp} with dataType: ${dataType}, description: ${description}`);

  const callStack = logCallStack();

  const trackingData = {
      timestamp: timestamp,
      dataType: dataType,
      description: description,
      data: data,
      callStack: callStack ? callStack.split("\n") : [],
      callFromApp: callStack ? isTargetApp(callStack) : false
  };

  switch (dataType) {
      case "sensitiveId":
          if (!report.sensitiveIds) {
              report.sensitiveIds = {};
          }

          let id, type, value, step;

          // Try to parse the description for ID, Type, and Value
          const idMatch = description.match(/ID:\s*(.*?)\s*Type/);
          const typeMatch = description.match(/Type:\s*(.*?)\s*Value/);
          const valueMatch = description.match(/Value:\s*(.*?)\s*(?:Type|$)/); // Capture value precisely
          const eventTypeMatch = description.match(/\[SENSITIVE ID DETECTED.*?]\s*(.*?)\s*for/);

          if (idMatch) {
              id = idMatch[1];
          } else {
              id = "UNKNOWN";
              console.log("[WARNING] Could not determine ID from description:", description);
          }

          if (typeMatch) {
              type = typeMatch[1];
          } else {
              type = "UNKNOWN";
              console.log("[WARNING] Could not determine Type from description:", description);
          }

          if (valueMatch) {
              value = valueMatch[1].trim();
          } else {
              value = "UNKNOWN";
              console.log("[WARNING] Could not determine Value from description:", description);
          }

          // Extract the event type (e.g., "Original Android ID captured")
          let eventType = "Unknown Event";
          if (eventTypeMatch) {
              eventType = eventTypeMatch[1].trim();
          }

          if (!report.sensitiveIds[id]) {
              report.sensitiveIds[id] = {
                  originalId: id,
                  type: type,
                  eventType: eventType,
                  transformations: []
              };
          }

          step = report.sensitiveIds[id].transformations.length + 1;

          report.sensitiveIds[id].transformations.push({
              timestamp: timestamp,
              step: step,
              description: description,
              value: value,
              callStack: trackingData.callStack,
              targetApp: trackingData.targetApp
          });

          console.log(`[INFO] Sensitive ID tracked: ${id}, Step: ${step}, Type: ${type}, Value: ${value}, EventType: ${eventType}`);
          break;

      case "permissionCheck":
          if (!report.permissionChecks) {
              report.permissionChecks = [];
          }
          report.permissionChecks.push(trackingData);
          break;

      case "networkRequest":
          if (!report.networkRequests) {
              report.networkRequests = [];
          }
          report.networkRequests.push(trackingData);
          break;

      case "log":
          if (!report.logs) {
              report.logs = [];
          }
          report.logs.push(trackingData);
          break;

      case "error":
          if (!report.errors) {
              report.errors = [];
          }
          report.errors.push(trackingData);
          break;

      default:
          console.log(`[WARNING] Unknown data type: ${dataType}`);
          if (!report.unknownEvents) {
              report.unknownEvents = [];
          }
          report.unknownEvents.push(trackingData);
  }
}

function printReportSummary() {
  try {
      const summary = {
          sensitiveIdsCount: Object.keys(report.sensitiveIds || {}).length,
          permissionChecksCount: (report.permissionChecks || []).length,
          networkRequestsCount: (report.networkRequests || []).length,
          logsCount: (report.logs || []).length,
          errorsCount: (report.errors || []).length,
          unknownEventsCount: (report.unknownEvents || []).length,
          fullReport: {
              sensitiveIds: {},
              permissionChecks: report.permissionChecks || [],
              networkRequests: report.networkRequests || [],
              logs: report.logs || [],
              errors: report.errors || [],
              unknownEvents: report.unknownEvents || []
          }
      };

      function cleanCallStack(callStack) {
          return callStack.map(line => {
              line = line.trim().replace(/^-*>\s*/, '');
              line = line.replace(/^\[(?:JAVA|ANDROID|GOOGLE|LIBRARY|JSON|GSON|\*TARGET APP*\s*[\w.]+)\]\s*at\s*/, '');
              return line;
          }).filter(Boolean);
      }

      // Process sensitive IDs to include timestamps and clean call stacks
      if (report.sensitiveIds) {
          for (const [id, data] of Object.entries(report.sensitiveIds)) {
              summary.fullReport.sensitiveIds[id] = {
                  originalId: data.originalId,
                  type: data.type,
                  transformations: (data.transformations || []).map(t => ({
                      timestamp: t.timestamp,
                      step: t.step,
                      description: t.description,
                      value: t.value,
                      callStack: cleanCallStack(t.callStack || []),
                      targetApp: t.targetApp
                  }))
              };
          }
      }

      // Clean call stacks in other report sections
      ['permissionChecks', 'networkRequests', 'logs', 'errors', 'unknownEvents'].forEach(section => {
          summary.fullReport[section] = summary.fullReport[section].map(item => ({
              ...item,
              callStack: cleanCallStack(item.callStack || [])
          }));
      });

      console.log("Report Summary:");
      console.log(JSON.stringify(summary, null, 2));
  } catch (error) {
      console.error("Error in printReportSummary:", error);
      console.error("Current report state:", JSON.stringify(report, null, 2));
  }
}

function logPermissionCheck(permission) {
  safeLog("[+] Permission Check: " + permission);
  trackData("permissionCheck", permission, "[+] Permission Check: " + permission);
}

function logCallStack() {
  try {
      const Log = safeUse("android.util.Log");
      const Exception = safeUse("java.lang.Exception");

      if (Log && Exception) {
          const callStack = Log.getStackTraceString(Exception.$new());

          if (callStack) {
              const callStackLines = callStack.split("\n");
              if (callStackLines.length > 1) {
                  let filteredCallStack = callStackLines.slice(1); // Remove the first line

                  if (callStackFilter) {
                      filteredCallStack = filteredCallStack.filter(line =>
                          line.includes(callStackFilter)
                      );
                  }

                  const reversedCallStack = filteredCallStack.reverse();

                  // Format call stack with app name, Java, Android, and other common package highlighting
                  const formattedCallStack = reversedCallStack.map(line => {
                      if (targetAppName && line.includes(targetAppName)) {
                          return `\n      ---> [*TARGET APP* ${targetAppName}] ${line.trim()}`;
                      } else if (line.includes(" java.")) {
                          return `\n  ---> [JAVA] ${line.trim()}`;
                      } else if (line.includes(" android.")) {
                          return `\n  ---> [ANDROID] ${line.trim()}`;
                      } else if (line.includes(" javax.")) {
                          return `\n  ---> [JAVAX] ${line.trim()}`;
                      } else if (line.includes(" org.json.")) {
                          return `\n  ---> [JSON] ${line.trim()}`;
                      } else if (line.includes(" com.google.")) {
                          return `\n  ---> [GOOGLE] ${line.trim()}`;
                      } else if (line.includes(" okhttp3.")) {
                          return `\n  ---> [OKHTTP] ${line.trim()}`;
                      } else if (line.includes(" retrofit2.")) {
                          return `\n  ---> [RETROFIT] ${line.trim()}`;
                      } else {
                          // Only add [LIBRARY] if a category is found
                          return line.trim() ? `\n    ---> [LIBRARY] ${line.trim()}` : "";
                      }
                  }).filter(line => line !== "").join(''); // Remove any empty lines
                  return "\n" + formattedCallStack;
              } else {
                  return "[!] Error: Call stack lines are less than expected.";
              }
          } else {
              return "[!] Error: Unable to retrieve the call stack.";
          }
      } else {
          return "[!] Error: Log or Exception classes are not available.";
      }
  } catch (e) {
      return "[!] Exception in logCallStack: " + e.message;
  }
}

function logMessage(msg) {
  // If LOG_FILTER is empty or the message includes the filter, log the message
  if (LOG_FILTER === "" || msg.includes(LOG_FILTER)) {
      safeLog(msg);
  }
}

function bytesToString(bytes) {
  return Java.use('java.lang.String').$new(bytes);
}

function bytesToHex(bytes) {
  return Java.use('java.util.HexFormat').of().formatHex(bytes);
}

function setCallStackFilter(filter) {
  callStackFilter = filter;
}

function printReportSummary() {
  try {
      const summary = {
          sensitiveIdsCount: Object.keys(report.sensitiveIds || {}).length,
          permissionChecksCount: (report.permissionChecks || []).length,
          networkRequestsCount: (report.networkRequests || []).length,
          logsCount: (report.logs || []).length,
          errorsCount: (report.errors || []).length,
          unknownEventsCount: (report.unknownEvents || []).length,
          fullReport: {
              sensitiveIds: {},
              permissionChecks: report.permissionChecks || [],
              networkRequests: report.networkRequests || [],
              logs: report.logs || [],
              errors: report.errors || [],
              unknownEvents: report.unknownEvents || []
          }
      };

      function cleanCallStack(callStack) {
          return callStack.map(line => {
              // Remove leading/trailing whitespace and '---> '
              line = line.trim().replace(/^-*>\s*/, '');
              // Remove [JAVA], [ANDROID], etc. prefixes
              line = line.replace(/^\[(?:JAVA|LIBRARY|ANDROID|GOOGLE|\*TARGET APP\*\s*[\w.]+)\]\s*at\s*/, '');
              return line;
          }).filter(Boolean); // Remove any empty lines
      }

      // Process sensitive IDs to include timestamps and clean call stacks
      if (report.sensitiveIds) {
          for (const [id, data] of Object.entries(report.sensitiveIds)) {
              summary.fullReport.sensitiveIds[id] = {
                  originalId: data.originalId,
                  type: data.type,
                  transformations: (data.transformations || []).map(t => ({
                      timestamp: t.timestamp,
                      step: t.step,
                      targetApp: t.targetApp,
                      description: t.description,
                      value: t.value,
                      callStack: cleanCallStack(t.callStack || [])
                  }))
              };
          }
      }

      // Clean call stacks in other report sections
      ['permissionChecks', 'networkRequests', 'logs', 'errors', 'unknownEvents'].forEach(section => {
          summary.fullReport[section] = summary.fullReport[section].map(item => ({
              ...item,
              callStack: cleanCallStack(item.callStack || [])
          }));
      });

      console.log("Report Summary:");
      console.log(JSON.stringify(summary, null, 2));
  } catch (error) {
      console.error("Error in printReportSummary:", error);
      console.error("Current report state:", JSON.stringify(report, null, 2));
  }
}

function printLibrariesAndPermissions() {
  safeLog("Libraries present in the app:\n");

  safeLog("LAYER 1 | COLLECTION");
  safeLog("------------------");
  printLibrariesForCategory("Device Identifiers", [
      "android.provider.Settings$Secure",
      "com.google.android.gms.ads.identifier.AdvertisingIdClient",
      "android.telephony.TelephonyManager",
      "android.media.MediaDrm",
      "java.net.NetworkInterface",
      "android.net.wifi.WifiManager",
      "android.bluetooth.BluetoothAdapter",
      "android.content.ContentResolver"
  ]);

  printLibrariesForCategory("Personal Information", [
      "android.accounts.AccountManager",
      "android.content.ContentResolver",
      "android.database.Cursor",
      "androidx.core.content.ContextCompat"
  ]);

  printLibrariesForCategory("Location and Network", [
      "android.location.LocationManager",
      "com.google.android.gms.location.FusedLocationProviderClient",
      "android.net.wifi.WifiManager",
      "android.net.ConnectivityManager"
  ]);

  printLibrariesForCategory("System and App Data", [
      "android.content.pm.PackageManager",
      "android.content.pm.ApplicationInfo",
      "android.content.ContextWrapper",
      "android.app.SharedPreferencesImpl",
      "android.app.SharedPreferencesImpl$EditorImpl",
      "androidx.security.crypto.EncryptedSharedPreferences$Editor",
      "android.database.sqlite.SQLiteDatabase"
  ]);

  safeLog("\nLAYER 2 | TRANSFORMATIONS");
  safeLog("-------------------------");

  printLibrariesForCategory("JSON Libraries", [
      "com.google.gson.Gson", "com.google.gson.GsonBuilder",
      "com.fasterxml.jackson.databind.ObjectMapper",
      "org.json.JSONObject",
      "com.alibaba.fastjson.JSON",
      "com.squareup.moshi.Moshi",
      "com.bluelinelabs.logansquare.LoganSquare",
      "com.ig.igson.Igson",
      "kotlinx.serialization.json.Json",
      "flexjson.JSONSerializer",
      "org.json.simple.JSONObject",
      "javax.json.bind.Jsonb"
  ]);

  printLibrariesForCategory("Compression", [
      "java.util.zip.GZIPOutputStream",
      "java.util.zip.DeflaterOutputStream",
      "java.util.zip.ZipOutputStream"
  ]);

  printLibrariesForCategory("Encryption", [
      "javax.crypto.Cipher",
      "javax.crypto.KeyGenerator",
      "java.security.KeyPairGenerator",
      "org.bouncycastle.crypto.engines.AESEngine",
      "org.bouncycastle.jcajce.provider.asymmetric.rsa.KeyPairGeneratorSpi",
      "org.apache.commons.codec.digest.DigestUtils",
      "android.util.Base64",
      "java.util.Base64",
      "org.apache.commons.codec.binary.Base64",
      "org.bouncycastle.util.encoders.Base64Encoder",
      "org.bouncycastle.util.encoders.Base64Decoder",
      "com.google.common.io.BaseEncoding",
      "sun.misc.BASE64Encoder",
      "sun.misc.BASE64Decoder",
      "android.util.Base64InputStream",
      "android.util.Base64OutputStream"
  ]);

  safeLog("\nLAYER 3 | NETWORK");
  safeLog("-----------------");
  printLibrariesForCategory("Web and Network", [
      "okhttp3.OkHttpClient",
      "okhttp3.Request$Builder",
      "okhttp3.Call",
      "java.net.HttpURLConnection",
      "com.android.okhttp.internal.huc.HttpsURLConnectionImpl"
  ]);

  function printLibrariesForCategory(category, librariesArray) {
      var foundLibraries = [];

      Java.perform(function () {
          librariesArray.forEach(library => {
              try {
                  var classHandle = Java.use(library);
                  if (classHandle) {
                      foundLibraries.push(library);
                  }
              } catch (e) {
                  // Library not found, skip
              }
          });
      });

      if (foundLibraries.length > 0) {
          safeLog(`\n${category}:`);
          foundLibraries.forEach(library => {
              safeLog(`  - ${library}`);
          });
      } else {
          safeLog(`\n${category}:`);
          safeLog(`  WARNING: No libraries found for this layer.`);
      }
  }
}

function fuzzyMatch(str, pattern) {
  if (!pattern) return false;
  const regex = new RegExp(pattern.split('').join('.*'), 'i');
  return regex.test(str);
}

function resetIdStage(id) {
  if (!idTracker.ids[id]) {
      idTracker.ids[id] = {
          originalId: id,
          transformations: [],
          stages: 0
      };
  } else {
      idTracker.ids[id].stages = 0;
  }
}

function determineIdType(id, providerType) {
  const phoneNumberRegex = /^\+?[1-9]\d{1,14}$/; // International phone numbers
  const androidIdRegex = /^[a-f0-9]{16}$/i; // 16-character hex string
  const adIdRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i; // UUID format for Ad ID
  const widevineIdRegex = /^edef8ba9-79d6-4ace-a3c8-27dcd51d21ed$/i; // Exact match for Widevine ID
  const gpsRegex = /^gps,\d{4,6},\d{1,3}$/; // GPS location update format: "gps,5000,10"
  const networkRegex = /^network,\d{4,6},\d{1,3}$/; // Network location update format: "network,5000,10"

  if (phoneNumberRegex.test(id)) {
      return "Phone Number";
  } else if (androidIdRegex.test(id)) {
      return "Android ID";
  } else if (widevineIdRegex.test(id)) {
      return "Widevine ID";
  } else if (adIdRegex.test(id)) {
      return "Ad ID";
  } else if (gpsRegex.test(providerType)) {
      return "GPS Location Update";
  } else if (networkRegex.test(providerType)) {
      return "Network Location Update";
  } else {
      return "Unknown ID Type";
  }
}

function hookADID() {
  try {
      var AdvertisingIdClient = Java.use(
          "com.google.android.gms.ads.identifier.AdvertisingIdClient"
      );
      var VERSION = Java.use("android.os.Build$VERSION");

      AdvertisingIdClient.getAdvertisingIdInfo.implementation = function (context) {
          try {
              var logMessageContent = `[+] COLLECTION | App is attempting to access the Advertising ID | Call Chain: ` + logCallStack();

              if (targetAppName && logMessageContent.includes(targetAppName)) {
                  safeLog(`[TARGET APP ${targetAppName}] ${logMessageContent}`);
              } else {
                  safeLog(logMessageContent);
              }

              var result = this.getAdvertisingIdInfo.apply(this, arguments);
              var adId = result.getId();
              var limitAdTracking = null;

              if (VERSION.SDK_INT.value >= 29) {
                  try {
                      limitAdTracking = result.isLimitAdTrackingEnabled();
                      if (VERSION.SDK_INT.value >= 31 && limitAdTracking) {
                          adId = "00000000-0000-0000-0000-000000000000";
                      }
                      safeLog("[+] Limit Ad Tracking enabled: " + limitAdTracking);
                  } catch (e) {
                      safeLog("[*] Error accessing Limit Ad Tracking information.");
                  }
              } else {
                  safeLog(
                      "[*] Limit Ad Tracking information is not available below API level 29."
                  );
              }

              safeLog("[+] Advertising ID: " + adId);

              // Track using trackData
              if (!idTracker.ids[adId]) {
                  resetIdStage(adId);
                  trackData("sensitiveId", null, `[SENSITIVE ID DETECTED | STEP 1] Original Advertising ID captured for ID: ${adId} Type: String Value: ${adId}`);
              } else {
                  resetIdStage(adId);
                  trackData("sensitiveId", null, `[SENSITIVE ID DETECTED | STEP ${idTracker.ids[adId].stages + 1}] Advertising ID accessed again for ID: ${adId} Type: String Value: ${adId}`);
              }

              return result;
          } catch (error) {
              safeLog(
                  "[-] Error occurred while retrieving Advertising ID: \n" +
                  logCallStack()
              );
              safeLog(error.toString());
              return null;
          }
      };
  } catch (err) {
      safeLog(
          "[-] Error occurred while setting up the hook: \n" + logCallStack()
      );
      safeLog(err.toString());
  }
}

function hookPhoneNumber() {
  // Local function to generate a random phone number
  function generateRandomPhoneNumber() {
      return '555' + Math.floor(Math.random() * 10000000).toString().padStart(4, '0');
  }

  // Hook functions related to phone number access
  var TelephonyManager = Java.use("android.telephony.TelephonyManager");
  if (TelephonyManager) {
      TelephonyManager.getLine1Number.overload().implementation = function () {
          var phoneNumber = this.getLine1Number() || generateRandomPhoneNumber();
          safeLog(`[${targetAppName} TARGET APP] [+] COLLECTION | Phone Number Access (getLine1Number): ${phoneNumber} | Call Chain: ` + logCallStack());
          trackData("sensitiveId", null, `[SENSITIVE ID DETECTED | STEP 1] Phone number accessed for ID: ${phoneNumber} Type: String Value: ${phoneNumber}`);
          return phoneNumber;
      };

      TelephonyManager.getMsisdn.overload().implementation = function () {
          var msisdn = this.getMsisdn() || generateRandomPhoneNumber();
          safeLog(`[${targetAppName} TARGET APP] [+] COLLECTION | MSISDN Access (getMsisdn): ${msisdn} | Call Chain: ` + logCallStack());
          trackData("sensitiveId", null, `[SENSITIVE ID DETECTED | STEP 1] MSISDN accessed for ID: ${msisdn} Type: String Value: ${msisdn}`);
          return msisdn;
      };
  }
}

function scheduleReportSummary() {
  Java.perform(function() {
      try {
          var Handler = Java.use('android.os.Handler');
          var Looper = Java.use('android.os.Looper');
          var Runnable = Java.use('java.lang.Runnable');

          // Create a new Handler on the main thread
          var handler = Handler.$new(Looper.getMainLooper());

          // Create a Runnable
          var runnable = Java.registerClass({
              name: 'com.example.ReportRunnable',
              implements: [Runnable],
              methods: {
                  run: function() {
                      Java.perform(function() {
                          try {
                              printReportSummary();
                          } catch (e) {
                              console.error("Error in scheduled printReportSummary:", e);
                          }
                          // Schedule the next execution
                          handler.postDelayed(runnable, 2 * 60 * 1000); // 2 minutes in milliseconds
                      });
                  }
              }
          }).$new();

          // Start the initial execution
          handler.postDelayed(runnable, 2 * 60 * 1000);

          console.log("[Debug] Dumping JSON report summary every 2 minutes");
      } catch (e) {
          console.error("Error in scheduleReportSummary:", e);
      }
  });
}

function hookAndroidId() {
  try {
      var Settings = Java.use("android.provider.Settings$Secure");
      Settings.getString.overload('android.content.ContentResolver', 'java.lang.String').implementation = function (cr, name) {
          try {
              var ret = this.getString(cr, name);
              if (name === "android_id") {
                  resetIdStage(ret);
                  trackData("sensitiveId", null, `[SENSITIVE ID DETECTED | STEP 1] Original Android ID captured for ID: ${ret} Type: String Value: ${ret}`);
                  safeLog(`[${targetAppName} TARGET APP} [+] COLLECTION | Captured Android ID: ${ret} | Call Chain: ` + logCallStack());
              }
              return ret;
          } catch (e) {
              logException(e);
          }
      };
  } catch (e) {
      logException(e);
  }
}

function hookEncryption() {
  try {
      var Cipher = Java.use("javax.crypto.Cipher");
      var KeyGenerator = Java.use("javax.crypto.KeyGenerator");
      var KeyPairGenerator = Java.use("java.security.KeyPairGenerator");

      KeyPairGenerator.getInstance.overload('java.lang.String').implementation = function (algorithm) {
          try {
              return this.getInstance(algorithm);
          } catch (e) {
              safeLog(`[${targetAppName} TARGET APP] [-] Error in KeyPairGenerator.getInstance: ${e}`);
              return this.getInstance(algorithm);
          }
      };

      KeyGenerator.getInstance.overload('java.lang.String').implementation = function (algorithm) {
          try {
              return this.getInstance(algorithm);
          } catch (e) {
              safeLog(`[${targetAppName} TARGET APP] [-] Error in KeyGenerator.getInstance: ${e}`);
              return this.getInstance(algorithm);
          }
      };

      Cipher.getInstance.overload('java.lang.String').implementation = function (transformation) {
          try {
              return this.getInstance(transformation);
          } catch (e) {
              safeLog(`[${targetAppName} TARGET APP] [-] Error in Cipher.getInstance: ${e}`);
              return this.getInstance(transformation);
          }
      };

      Cipher.init.overload('int', 'java.security.Key').implementation = function (opmode, key) {
          try {
              return this.init(opmode, key);
          } catch (e) {
              safeLog(`[${targetAppName} TARGET APP] [-] Error in Cipher.init: ${e}`);
              return this.init(opmode, key);
          }
      };

      Cipher.doFinal.overload('[B').implementation = function (input) {
          try {
              var inputDecoded = safeTryDecode(input);
              for (var id in idTracker.ids) {
                  if (fuzzyMatch(inputDecoded, idTracker.ids[id].originalId)) {
                      safeLog(`[${targetAppName} TARGET APP] [!] ALERT | Sensitive ID ${id} detected in Cipher.doFinal input`);
                      trackData("sensitiveId", null, `[SENSITIVE ID DETECTED | STEP ${idTracker.ids[id].stages + 1}] ID processed with Cipher.doFinal for ID: ${id} Type: Encrypted/Decrypted Data Value: ${inputDecoded}`);
                  }
              }

              var result = this.doFinal(input);
              var resultDecoded = safeTryDecode(result);

              for (var id in idTracker.ids) {
                  if (fuzzyMatch(resultDecoded, idTracker.ids[id].originalId)) {
                      safeLog(`[${targetAppName} TARGET APP] [!] ALERT | Sensitive ID ${id} detected in Cipher.doFinal output`);
                      trackData("sensitiveId", null, `[SENSITIVE ID DETECTED | STEP ${idTracker.ids[id].stages + 1}] ID output by Cipher.doFinal for ID: ${id} Type: Encrypted/Decrypted Data Value: ${resultDecoded}`);
                  }
              }

              return result;
          } catch (e) {
              safeLog(`[${targetAppName} TARGET APP] [-] Error in Cipher.doFinal: ${e}`);
              return this.doFinal(input);
          }
      };

      try {
          var BCCipher = Java.use("org.bouncycastle.crypto.engines.AESEngine");

          BCCipher.init.overload('boolean', 'org.bouncycastle.crypto.params.CipherParameters').implementation = function (forEncryption, params) {
              try {
                  return this.init(forEncryption, params);
              } catch (e) {
                  safeLog(`[${targetAppName} TARGET APP] [-] Error in BCCipher.init: ${e}`);
                  return this.init(forEncryption, params);
              }
          };

          BCCipher.processBlock.overload('[B', 'int', '[B', 'int').implementation = function (inBuf, inOff, outBuf, outOff) {
              try {
                  var inputDecoded = safeTryDecode(inBuf);
                  var result = this.processBlock(inBuf, inOff, outBuf, outOff);
                  var resultDecoded = safeTryDecode(outBuf);

                  for (var id in idTracker.ids) {
                      if (fuzzyMatch(inputDecoded, idTracker.ids[id].originalId)) {
                          safeLog(`[${targetAppName} TARGET APP] [!] ALERT | Sensitive ID ${id} detected in BCCipher.processBlock input`);
                          trackData("sensitiveId", null, `[SENSITIVE ID DETECTED | STEP ${idTracker.ids[id].stages + 1}] ID processed with BCCipher.processBlock for ID: ${id} Type: Encrypted/Decrypted Data Value: ${inputDecoded}`);
                      }
                      if (fuzzyMatch(resultDecoded, idTracker.ids[id].originalId)) {
                          safeLog(`[${targetAppName} TARGET APP] [!] ALERT | Sensitive ID ${id} detected in BCCipher.processBlock output`);
                          trackData("sensitiveId", null, `[SENSITIVE ID DETECTED | STEP ${idTracker.ids[id].stages + 1}] ID output by BCCipher.processBlock for ID: ${id} Type: Encrypted/Decrypted Data Value: ${resultDecoded}`);
                      }
                  }

                  return result;
              } catch (e) {
                  safeLog(`[${targetAppName} TARGET APP] [-] Error in BCCipher.processBlock: ${e}`);
                  return this.processBlock(inBuf, inOff, outBuf, outOff);
              }
          };
      } catch (e) {
          safeLog(`[${targetAppName} TARGET APP] [-] Error hooking BCCipher: ${e}`);
      }

      try {
          var BCKeyPairGenerator = Java.use("org.bouncycastle.jcajce.provider.asymmetric.rsa.KeyPairGeneratorSpi");

          BCKeyPairGenerator.generateKeyPair.overload().implementation = function () {
              try {
                  var keyPair = this.generateKeyPair();
                  safeLog(`[${targetAppName} TARGET APP] [*] Bouncy Castle RSA KeyPair generated.`);
                  return keyPair;
              } catch (e) {
                  safeLog(`[${targetAppName} TARGET APP] [-] Error in BCKeyPairGenerator.generateKeyPair: ${e}`);
                  return this.generateKeyPair();
              }
          };
      } catch (e) {
          safeLog(`[${targetAppName} TARGET APP] [-] Error hooking BCKeyPairGenerator: ${e}`);
      }

      try {
          var DigestUtils = Java.use("org.apache.commons.codec.digest.DigestUtils");

          DigestUtils.md5.overload('[B').implementation = function (data) {
              try {
                  var result = this.md5(data);
                  safeLog(`[${targetAppName} TARGET APP] [*] Apache Commons Codec MD5 called.`);
                  return result;
              } catch (e) {
                  safeLog(`[${targetAppName} TARGET APP] [-] Error in DigestUtils.md5: ${e}`);
                  return this.md5(data);
              }
          };

          DigestUtils.sha256.overload('[B').implementation = function (data) {
              try {
                  var result = this.sha256(data);
                  safeLog(`[${targetAppName} TARGET APP] [*] Apache Commons Codec SHA-256 called.`);
                  return result;
              } catch (e) {
                  safeLog(`[${targetAppName} TARGET APP] [-] Error in DigestUtils.sha256: ${e}`);
                  return this.sha256(data);
              }
          };
      } catch (e) {
          safeLog(`[${targetAppName} TARGET APP] [-] Error hooking DigestUtils: ${e}`);
      }

      safeLog(`[Debug] Encryption hooks installed successfully`);
  } catch (e) {
      safeLog(`[${targetAppName} TARGET APP] [-] Error setting up encryption hooks: ${e}`);
  }
}

function hookCompression() {
  function trackIfMatch(buf, stageDescription, source) {
      var inputStr = Java.use('java.lang.String').$new(buf);
      for (var id in idTracker.ids) {
          if (fuzzyMatch(inputStr, idTracker.ids[id].originalId)) {
              trackData("sensitiveId", null, `[SENSITIVE ID DETECTED | STEP ${idTracker.ids[id].stages + 1}] ${stageDescription} for ID: ${id} Type: Compressed String Value: ${inputStr}`);
              const callStack = logCallStack();
              const logMessage = `[+] SECURITY | ${source}: Attempt to compress data that may contain an ID: ${inputStr} | Call Chain: ${callStack}`;

              if (targetAppName && logMessage.includes(targetAppName)) {
                  safeLog(`[${targetAppName} TARGET APP} ${logMessage}`);
              } else {
                  safeLog(logMessage);
              }
          }
      }
  }

  try {
      var GZIPOutputStream = Java.use("java.util.zip.GZIPOutputStream");
      GZIPOutputStream.write.overload('[B', 'int', 'int').implementation = function (buf, off, len) {
          try {
              trackIfMatch(buf, "ID compressed with GZIP", "GZIPOutputStream");
          } catch (e) {
              logException(e);
          }
          return this.write(buf, off, len);
      };
  } catch (e) {
      safeLog("[-] Error hooking GZIPOutputStream: " + e);
  }

  try {
      var DeflaterOutputStream = Java.use("java.util.zip.DeflaterOutputStream");
      DeflaterOutputStream.write.overload('[B', 'int', 'int').implementation = function (buf, off, len) {
          try {
              trackIfMatch(buf, "ID compressed with ZLIB (DeflaterOutputStream)", "DeflaterOutputStream");
          } catch (e) {
              logException(e);
          }
          return this.write(buf, off, len);
      };
  } catch (e) {
      safeLog("[-] Error hooking DeflaterOutputStream: " + e);
  }

  try {
      var ZipOutputStream = Java.use("java.util.zip.ZipOutputStream");
      ZipOutputStream.write.overload('[B', 'int', 'int').implementation = function (buf, off, len) {
          try {
              trackIfMatch(buf, "ID compressed with ZipOutputStream", "ZipOutputStream");
          } catch (e) {
              logException(e);
          }
          return this.write(buf, off, len);
      };
  } catch (e) {
      safeLog("[-] Error hooking ZipOutputStream: " + e);
  }
}

function hookBase64Encoding() {
  const WIDEVINE_UUID = "edef8ba9-79d6-4ace-a3c8-27dcd51d21ed";

  function trackIds(decodedData, encodedData, isEncoding) {
      for (const id in idTracker.ids) {
          if (fuzzyMatch(decodedData, idTracker.ids[id].originalId)) {
              trackData("sensitiveId", null, `[SENSITIVE ID DETECTED] ID Base64 ${isEncoding ? 'encoded' : 'decoded'} for ID: ${id} Type: ${isEncoding ? 'Base64' : 'Original Base64'} String Value: ${encodedData}`);
              trackData("log", `[+] SECURITY | ID Base64 ${isEncoding ? 'encoded' : 'decoded'}: ${encodedData} | Call Chain: ${logCallStack()}`, `[${targetAppName} TARGET APP}`);
          }
      }

      if (decodedData.includes(WIDEVINE_UUID) || (!isEncoding && encodedData.length > 20)) {
          trackData("sensitiveId", null, `[SENSITIVE ID DETECTED] Widevine ID Base64 ${isEncoding ? 'encoded' : 'decoded'} for ID: ${WIDEVINE_UUID} Type: ${isEncoding ? 'Base64' : 'Original Base64'} String Value: ${encodedData}`);
          trackData("log", `[+] SECURITY | Widevine ID Base64 ${isEncoding ? 'encoded' : 'decoded'}: ${encodedData} | Call Chain: ${logCallStack()}`, `[${targetAppName} TARGET APP}`);
      }
  }

  try {
      const Base64 = Java.use("android.util.Base64");

      Base64.encodeToString.overload('[B', 'int').implementation = function (input, flags) {
          try {
              const result = this.encodeToString(input, flags);
              const decodedInput = safeTryDecode(input);
              trackIds(decodedInput, result, true);
              return result;
          } catch (e) {
              trackData("error", e.toString(), "Error in Base64.encodeToString");
              return null;
          }
      };

      Base64.decode.overload('java.lang.String', 'int').implementation = function (str, flags) {
          try {
              const result = this.decode(str, flags);
              const decodedResult = safeTryDecode(result);
              trackIds(decodedResult, str, false);
              return result;
          } catch (e) {
              trackData("error", e.toString(), "Error in Base64.decode");
              return null;
          }
      };

      // Java 8 Base64
      try {
          const Java8Base64 = Java.use("java.util.Base64");

          Java8Base64.getEncoder.implementation = function () {
              const encoder = this.getEncoder();
              encoder.encodeToString.implementation = function (input) {
                  try {
                      const result = this.encodeToString(input);
                      const decodedInput = safeTryDecode(input);
                      trackIds(decodedInput, result, true);
                      return result;
                  } catch (e) {
                      trackData("error", e.toString(), "Error in Java8Base64.Encoder.encodeToString");
                      return null;
                  }
              };
              return encoder;
          };

          Java8Base64.getDecoder.implementation = function () {
              const decoder = this.getDecoder();
              decoder.decode.overload('java.lang.String').implementation = function (str) {
                  try {
                      const result = this.decode(str);
                      const decodedResult = safeTryDecode(result);
                      trackIds(decodedResult, str, false);
                      return result;
                  } catch (e) {
                      trackData("error", e.toString(), "Error in Java8Base64.Decoder.decode");
                      return null;
                  }
              };
              return decoder;
          };
      } catch (e) {
          // Java 8 Base64 not found, silently continue
      }

      // Apache Commons Codec
      try {
          const Base64Codec = Java.use("org.apache.commons.codec.binary.Base64");

          Base64Codec.encodeBase64String.overload('[B').implementation = function (input) {
              try {
                  const result = this.encodeBase64String(input);
                  const decodedInput = safeTryDecode(input);
                  trackIds(decodedInput, result, true);
                  return result;
              } catch (e) {
                  trackData("error", e.toString(), "Error in Base64Codec.encodeBase64String");
                  return null;
              }
          };

          Base64Codec.decodeBase64.overload('java.lang.String').implementation = function (str) {
              try {
                  const result = this.decodeBase64(str);
                  const decodedResult = safeTryDecode(result);
                  trackIds(decodedResult, str, false);
                  return result;
              } catch (e) {
                  trackData("error", e.toString(), "Error in Base64Codec.decodeBase64");
                  return null;
              }
          };
      } catch (e) {
          // Apache Commons Codec not found, silently continue
      }

      // Bouncy Castle
      try {
          const Base64Encoder = Java.use("org.bouncycastle.util.encoders.Base64Encoder");

          Base64Encoder.encode.overload('[B', 'int', 'int', '[B', 'int').implementation = function (input, offset, length, output, outOffset) {
              try {
                  const result = this.encode(input, offset, length, output, outOffset);
                  const decodedInput = safeTryDecode(input);
                  const encodedOutput = Java.array('byte', output);
                  const encodedString = safeTryDecode(encodedOutput);
                  trackIds(decodedInput, encodedString, true);
                  return result;
              } catch (e) {
                  trackData("error", e.toString(), "Error in Base64Encoder.encode");
                  return null;
              }
          };

          const Base64Decoder = Java.use("org.bouncycastle.util.encoders.Base64Decoder");

          Base64Decoder.decode.overload('[B', 'int', 'int', '[B', 'int').implementation = function (input, offset, length, output, outOffset) {
              try {
                  const result = this.decode(input, offset, length, output, outOffset);
                  const decodedInput = safeTryDecode(input);
                  const decodedOutput = Java.array('byte', output);
                  const decodedString = safeTryDecode(decodedOutput);
                  trackIds(decodedString, decodedInput, false);
                  return result;
              } catch (e) {
                  trackData("error", e.toString(), "Error in Base64Decoder.decode");
                  return null;
              }
          };
      } catch (e) {
          // Bouncy Castle not found, silently continue
      }

      // Guava Base64
      try {
          const BaseEncoding = Java.use("com.google.common.io.BaseEncoding");

          BaseEncoding.encode.overload('[B').implementation = function (input) {
              try {
                  const result = this.encode(input);
                  const decodedInput = safeTryDecode(input);
                  trackIds(decodedInput, result, true);
                  return result;
              } catch (e) {
                  trackData("error", e.toString(), "Error in Guava BaseEncoding.encode");
                  return null;
              }
          };

          BaseEncoding.decode.overload('java.lang.String').implementation = function (str) {
              try {
                  const result = this.decode(str);
                  const decodedResult = safeTryDecode(result);
                  trackIds(decodedResult, str, false);
                  return result;
              } catch (e) {
                  trackData("error", e.toString(), "Error in Guava BaseEncoding.decode");
                  return null;
              }
          };
      } catch (e) {
          // Guava not found, silently continue
      }

      // sun.misc.BASE64Encoder/Decoder (Old Java versions)
      try {
          const Base64EncoderOld = Java.use("sun.misc.BASE64Encoder");

          Base64EncoderOld.encode.overload('[B').implementation = function (input) {
              try {
                  const result = this.encode(input);
                  const decodedInput = safeTryDecode(input);
                  trackIds(decodedInput, result, true);
                  return result;
              } catch (e) {
                  trackData("error", e.toString(), "Error in sun.misc.BASE64Encoder.encode");
                  return null;
              }
          };

          const Base64DecoderOld = Java.use("sun.misc.BASE64Decoder");

          Base64DecoderOld.decodeBuffer.overload('java.lang.String').implementation = function (str) {
              try {
                  const result = this.decodeBuffer(str);
                  const decodedResult = safeTryDecode(result);
                  trackIds(decodedResult, str, false);
                  return result;
              } catch (e) {
                  trackData("error", e.toString(), "Error in sun.misc.BASE64Decoder.decodeBuffer");
                  return null;
              }
          };
      } catch (e) {
          // sun.misc.Base64Encoder/Decoder not found, silently continue
      }

      // Android Base64InputStream and Base64OutputStream
      try {
          const Base64InputStream = Java.use("android.util.Base64InputStream");

          Base64InputStream.read.overload('[B').implementation = function (b) {
              try {
                  const result = this.read(b);
                  const decodedResult = safeTryDecode(result);
                  const str = safeTryDecode(b);
                  trackIds(decodedResult, str, false);
                  return result;
              } catch (e) {
                  trackData("error", e.toString(), "Error in Base64InputStream.read");
                  return null;
              }
          };
      } catch (e) {
          // Base64InputStream not found, silently continue
      }

      try {
          const Base64OutputStream = Java.use("android.util.Base64OutputStream");

          Base64OutputStream.write.overload('[B').implementation = function (b) {
              try {
                  const decodedInput = safeTryDecode(b);
                  this.write(b);
                  trackIds(decodedInput, b, true);
              } catch (e) {
                  trackData("error", e.toString(), "Error in Base64OutputStream.write");
              }
          };
      } catch (e) {
          // Base64OutputStream not found, silently continue
      }
  } catch (e) {
      trackData("error", e.toString(), "Error setting up Base64 encoding hooks");
  }
}

function hookInstalledApps() {
  try {
      var PackageManager = Java.use('android.content.pm.PackageManager');
      var ApplicationInfo = Java.use('android.content.pm.ApplicationInfo');

      PackageManager.getInstalledPackages.overload('int').implementation = function (flags) {
          logPermissionCheck("Installed Apps Access");
          try {
              var originalResult = this.getInstalledPackages(flags);
              var filteredResult = [];

              var packageInfoList = originalResult.toArray();
              for (var i = 0; i < packageInfoList.length; i++) {
                  var packageInfo = packageInfoList[i];
                  var packageName = packageInfo.packageName.value;

                  if (!targetAppName || packageName !== targetAppName) {
                      filteredResult.push(packageInfo);
                  }
              }

              const callStack = logCallStack();
              const logMessage = `[+] COLLECTION | PackageManager.getInstalledPackages called | Flags: ${flags} | Packages: ${filteredResult.length} | Call Chain: ${callStack}`;

              if (targetAppName && logMessage.includes(targetAppName)) {
                  safeLog(`[${targetAppName} TARGET APP} ${logMessage}`);
              } else {
                  safeLog(logMessage);
              }

              // Track installed apps access
              trackData("permissionCheck", "Installed Apps Access", logMessage);

              // Log individual package names (consider limiting this for performance)
              filteredResult.forEach(function (packageInfo) {
                  var packageName = packageInfo.packageName.value;
                  safeLog(`    - Package: ${packageName}`);
              });

              return originalResult;
          } catch (e) {
              logException(e);
              return Java.use('java.util.ArrayList').$new();
          }
      };

      ApplicationInfo.loadLabel.implementation = function (pm) {
          try {
              var label = this.loadLabel(pm);
              if (!targetAppName || this.packageName.value !== targetAppName) {
                  const callStack = logCallStack();
                  const logMessage = `[+] COLLECTION | ApplicationInfo.loadLabel called | Package: ${this.packageName.value} | Label: ${label} | Call Chain: ${callStack}`;

                  if (targetAppName && logMessage.includes(targetAppName)) {
                      safeLog(`[${targetAppName} TARGET APP} ${logMessage}`);
                  } else {
                      safeLog(logMessage);
                  }

                  // Track app label access
                  trackData("permissionCheck", "App Label Access", logMessage);
              }
              return label;
          } catch (e) {
              logException(e);
              return "Unknown App";
          }
      };
  } catch (e) {
      logException(e);
  }
}

function hookSharedPreferences() {
  try {
      var contextWrapper = Java.use("android.content.ContextWrapper");
      contextWrapper.getSharedPreferences.overload('java.lang.String', 'int').implementation = function (var0, var1) {
          // No logging here, just return the original result
          return this.getSharedPreferences(var0, var1);
      };
  } catch (e) {
      safeLog(`[${targetAppName} APP] [-] Error hooking getSharedPreferences: ${e}`);
  }

  var sharedPreferencesEditor = Java.use("android.app.SharedPreferencesImpl$EditorImpl");

  try {
      sharedPreferencesEditor.putString.overload('java.lang.String', 'java.lang.String').implementation = function (key, value) {
          if (value !== null) {
              for (var identifier in idTracker.ids) {
                  if (fuzzyMatch(value, idTracker.ids[identifier].originalId)) {
                      const message = `[${targetAppName} APP] [Debug] COLLECTION | Sensitive String in SharedPreferences: stored | Key: ${key} | Value: ${value}`;
                      safeLog(message);
                      safeLog(logCallStack());
                      trackData("sensitiveId", null, `[SENSITIVE ID DETECTED | STEP ${idTracker.ids[identifier].stages + 1}] String stored in SharedPreferences for ID: ${identifier} Type: SharedPreferences Value: ${value}`);
                  }
              }
          }
          return this.putString(key, value);
      };
  } catch (e) {
      safeLog(`[Debug] Error hooking putString: ${e}`);
  }

  try {
      var sharedPreferences = Java.use("android.app.SharedPreferencesImpl");
      sharedPreferences.getString.overload('java.lang.String', 'java.lang.String').implementation = function (var0, var1) {
          var stringVal = this.getString(var0, var1);
          if (stringVal !== null) {
              for (var identifier in idTracker.ids) {
                  if (fuzzyMatch(stringVal, idTracker.ids[identifier].originalId)) {
                      const message = `[${targetAppName} APP] [Debug] COLLECTION | Sensitive String in SharedPreferences: read | Key: ${var0} | Value: ${stringVal}`;
                      safeLog(message);
                      safeLog(logCallStack());
                      trackData("sensitiveId", null, `[SENSITIVE ID DETECTED | STEP ${idTracker.ids[identifier].stages + 1}] String read from SharedPreferences for ID: ${identifier} Type: SharedPreferences Value: ${stringVal}`);
                  }
              }
          }
          return stringVal;
      };
  } catch (e) {
      safeLog(`[Debug] Error hooking getString: ${e}`);
  }

  safeLog(`[Debug] SharedPreferences hooks for sensitive IDs installed`);
}

function hookOkhttpCalls() {
  try {
      safeLog("[Debug] Hooking OkHttp Calls");

      // Hook OkHttpClient.newCall
      var OkHttpClient = Java.use("okhttp3.OkHttpClient");

      OkHttpClient.newCall.implementation = function (request) {
          try {
              var call = this.newCall.call(this, request);

              // Log the request details
              safeLog(`[Debug] OkHttpClient.newCall() invoked`);
              safeLog(`    Method: ${request.method()}`);
              safeLog(`    URL: ${request.url()}`);
              safeLog(`    Headers: ${request.headers().toString()}`);

              // Track IDs in the request URL or headers
              trackData("networkRequest", request.url().toString(), "GET");

              // Hook the Call.enqueue method to intercept async requests
              var Call = Java.use("okhttp3.Call");
              Call.enqueue.implementation = function (callback) {
                  try {
                      safeLog(`[Debug] OkHttp Call.enqueue() invoked`);
                      return this.enqueue.call(this, callback);
                  } catch (e) {
                      console.error(`[-] Error in Call.enqueue: ${e}`);
                  }
              };

              // Hook the Call.execute method to intercept synchronous requests
              Call.execute.implementation = function () {
                  try {
                      safeLog(`[Debug] OkHttp Call.execute() invoked`);
                      var response = this.execute.call(this);

                      // Log the response details
                      safeLog(`[Debug] Response Code: ${response.code()}`);
                      safeLog(`    Response Headers: ${response.headers().toString()}`);

                      var body = response.body();
                      if (body !== null) {
                          var buffer = body.bytes();
                          var responseBody = Java.use("java.lang.String").$new(buffer).toString();
                          safeLog(`    Response Body: ${responseBody}`);

                          // Track IDs in the response body
                          for (var id in idTracker.ids) {
                              if (fuzzyMatch(responseBody, idTracker.ids[id].originalId)) {
                                  trackData("sensitiveId", null, `[SENSITIVE ID DETECTED | STEP ${idTracker.ids[id].stages + 1}] ID found in HTTP response for ID: ${id} Type: String Value: ${responseBody}`);
                              }
                          }
                      }

                      return response;
                  } catch (e) {
                      console.error(`[-] Error in Call.execute: ${e}`);
                  }
              };

              return call;
          } catch (e) {
              console.error(`[-] Error in OkHttpClient.newCall: ${e}`);
          }
      };

      safeLog("[Debug] OkHttpClient.newCall() hook installed");

      // Hook Request.Builder.post to log the request body and track IDs
      var RequestBuilder = Java.use("okhttp3.Request$Builder");

      RequestBuilder.post.overload("okhttp3.RequestBody").implementation = function (requestBody) {
          try {
              safeLog(`[Debug] Request.Builder.post() invoked`);
              var contentLength = requestBody.contentLength();
              safeLog(`    Request Body Content-Length: ${contentLength}`);

              // Log the request body
              var buffer = Java.use("okio.Buffer").$new();
              requestBody.writeTo(buffer);
              var bodyString = buffer.readUtf8();
              safeLog(`    Request Body: ${bodyString}`);

              // Track IDs in the request body
              for (var id in idTracker.ids) {
                  if (fuzzyMatch(bodyString, idTracker.ids[id].originalId)) {
                      trackData("sensitiveId", null, `[SENSITIVE ID DETECTED | STEP ${idTracker.ids[id].stages + 1}] ID found in HTTP request for ID: ${id} Type: String Value: ${bodyString}`);
                  }
              }

              return this.post.call(this, requestBody);
          } catch (e) {
              console.error(`[-] Error in Request.Builder.post: ${e}`);
          }
      };

      safeLog("[Debug] Request.Builder.post() hook installed");

  } catch (e) {
      console.error(`[Debug] Error in hookOkhttpCalls: ${e}`);
  }
}

function hookHttpsUrlCalls() {
  try {
      var HttpURLConnection = Java.use("java.net.HttpURLConnection");
      logMessage("[+] HttpURLConnection class found");

      HttpURLConnection.getOutputStream.implementation = function () {
          try {
              var outputStream = this.getOutputStream.call(this);

              Interceptor.attach(outputStream, {
                  onSend: function (buffer, args) {
                      try {
                          logMessage("[+] HttpURLConnection request body sent");
                          var dataString = Memory.readUtf8String(buffer);
                          logMessage(dataString);

                          // Track all tracked IDs, including placeholders
                          for (var id in idTracker.ids) {
                              if (fuzzyMatch(dataString, idTracker.ids[id].originalId)) {
                                  trackData("sensitiveId", null, `[SENSITIVE ID DETECTED | STEP ${idTracker.ids[id].stages + 1}] ID found in HTTP request for ID: ${id} Type: String Value: ${dataString}`);
                              }
                          }
                      } catch (e) {
                          logException(e);
                      }
                  }
              });

              return outputStream;
          } catch (e) {
              logException(e);
          }
      };

      logMessage("[+] HttpURLConnection.getOutputStream() hook installed");

      HttpURLConnection.connect.implementation = function () {
          try {
              var result = this.connect.call(this);
              var url = this.getURL().toString();
              logMessage("[+] HttpURLConnection connected to: " + url);
              trackData("networkRequest", url, "GET");
              return result;
          } catch (e) {
              logException(e);
          }
      };

      logMessage("[+] HttpURLConnection.connect() hook installed");

      HttpURLConnection.getRequestMethod.implementation = function () {
          try {
              return this.getRequestMethod.call(this);
          } catch (e) {
              logException(e);
          }
      };

      HttpURLConnection.getURL.implementation = function () {
          try {
              var url = this.getURL.call(this);
              logMessage("[+] HttpURLConnection URL accessed: " + url);
              return url;
          } catch (e) {
              logException(e);
          }
      };

      logMessage("[+] HttpURLConnection.getURL() hook installed");

      HttpURLConnection.getResponseCode.implementation = function () {
          try {
              var responseCode = this.getResponseCode.call(this);
              logMessage("[+] HttpURLConnection response code: " + responseCode);
              return responseCode;
          } catch (e) {
              logException(e);
          }
      };

      logMessage("[+] HttpURLConnection.getResponseCode() hook installed");

      HttpURLConnection.getInputStream.implementation = function () {
          try {
              var inputStream = this.getInputStream.call(this);

              Interceptor.attach(inputStream, {
                  onRead: function (buffer, args) {
                      try {
                          logMessage("[+] HttpURLConnection response body received");
                          var responseBody = Memory.readUtf8String(buffer);
                          logMessage(responseBody);

                          // Track IDs in the response body
                          for (var id in idTracker.ids) {
                              if (fuzzyMatch(responseBody, idTracker.ids[id].originalId)) {
                                  trackData("sensitiveId", null, `[SENSITIVE ID DETECTED | STEP ${idTracker.ids[id].stages + 1}] ID found in HTTP response for ID: ${id} Type: String Value: ${responseBody}`);
                              }
                          }
                      } catch (e) {
                          logException(e);
                      }
                  }
              });

              return inputStream;
          } catch (e) {
              logException(e);
          }
      };

      logMessage("[+] HttpURLConnection.getInputStream() hook installed");

      HttpURLConnection.disconnect.implementation = function () {
          try {
              var result = this.disconnect.call(this);
              logMessage("[+] HttpURLConnection disconnected");
              return result;
          } catch (e) {
              logException(e);
          }
      };

      logMessage("[+] HttpURLConnection.disconnect() hook installed");

      HttpURLConnection.setRequestProperty.overload("java.lang.String", "java.lang.String").implementation = function (key, value) {
          try {
              logMessage("[+] HttpURLConnection.setRequestProperty() called: " + key + " = " + value);
              return this.setRequestProperty(key, value);
          } catch (e) {
              logException(e);
          }
      };

      logMessage("[+] HttpURLConnection.setRequestProperty() hook installed");

  } catch (e) {
      logException(e);
  }
}

function hookClipboardManager() {
  try {
      var ClipboardManager = Java.use('android.content.ClipboardManager');

      ClipboardManager.setPrimaryClip.overload('android.content.ClipData').implementation = function (clip) {
          try {
              var clipText = clip.getItemAt(0).getText().toString();

              // Track Clipboard Data
              trackData("sensitiveId", null, `[SENSITIVE ID DETECTED | STEP 1] Clipboard content written for ID: CLIPBOARD Type: String Value: ${clipText}`);

              var logMessageContent = `[+] COLLECTION | Clipboard content written: ${clipText} | Call Chain: ` + logCallStack();
              if (targetAppName && logMessageContent.includes(targetAppName)) {
                  safeLog(`[${targetAppName} TARGET APP} ${logMessageContent}`);
              } else {
                  logMessage(logMessageContent);
              }

              return this.setPrimaryClip(clip);
          } catch (e) {
              logException(e);
          }
      };

      ClipboardManager.getPrimaryClip.overload().implementation = function () {
          try {
              var clip = this.getPrimaryClip();
              if (clip !== null && clip.getItemCount() > 0) {
                  var clipText = clip.getItemAt(0).getText().toString();
                  var logMessageContent = `[+] COLLECTION | Clipboard content accessed: ${clipText} | Call Chain: ` + logCallStack();

                  // Track all tracked IDs, including placeholders
                  for (var id in idTracker.ids) {
                      if (fuzzyMatch(clipText, idTracker.ids[id].originalId)) {
                          let currentStep = idTracker.ids[id].stages + 1; // Get the next step
                          trackData("sensitiveId", null, `[SENSITIVE ID DETECTED | STEP ${currentStep}] ID accessed from clipboard for ID: ${id} Type: String Value: ${clipText}`);
                      }
                  }

                  if (targetAppName && logMessageContent.includes(targetAppName)) {
                      safeLog(`[${targetAppName} TARGET APP} ${logMessageContent}`);
                  } else {
                      logMessage(logMessageContent);
                  }
              }
              return clip;
          } catch (e) {
              logException(e);
              return null;
          }
      };

  } catch (e) {
      logException(e);
  }
}

function setupPayloadHooks() {
  try {
      var OutputStream = Java.use('java.io.OutputStream');
      var FileOutputStream = Java.use('java.io.FileOutputStream');
      var ByteArrayOutputStream = Java.use('java.io.ByteArrayOutputStream');
      var BufferedOutputStream = Java.use('java.io.BufferedOutputStream');
      var DataOutputStream = Java.use('java.io.DataOutputStream');
      var PrintStream = Java.use('java.io.PrintStream');
      var String = Java.use('java.lang.String');

      var outputStreams = [OutputStream, FileOutputStream, ByteArrayOutputStream, BufferedOutputStream, DataOutputStream, PrintStream];

      outputStreams.forEach(function (stream) {
          ['write', 'print', 'println'].forEach(function (methodName) {
              if (stream[methodName]) {
                  stream[methodName].overloads.forEach(function (overload) {
                      overload.implementation = function () {
                          try {
                              var args = [].slice.call(arguments);

                              if (args[0] instanceof Array) {
                                  var data = args[0];
                                  var offset = args.length > 2 ? args[1] : 0;
                                  var length = args.length > 2 ? args[2] : data.length;
                                  try {
                                      var str = String.$new(Java.array('byte', data.slice(offset, offset + length)));
                                      //logMessage(`[Payload] ${stream.$className}.${methodName} called with string data:`, str);
                                  } catch (e) {
                                      //logMessage(`[Payload] ${stream.$className}.${methodName} called`, data.slice(offset, offset + length));
                                  }
                              } else if (typeof args[0] === 'string') {
                                  //logMessage(`[Payload] ${stream.$className}.${methodName} called`, '');
                              } else {
                                  //logMessage(`[Payload] ${stream.$className}.${methodName} called`, '');
                              }

                              return this[methodName].apply(this, arguments);
                          } catch (e) {
                              logException(e);
                          }
                      };
                  });
              }
          });
      });

      // Hook URL.openConnection
      var URL = Java.use('java.net.URL');
      URL.openConnection.overloads.forEach(function (overload) {
          overload.implementation = function () {
              try {
                  logMessage('[Network] URL.openConnection called for:', this.toString());
                  return overload.apply(this, arguments);
              } catch (e) {
                  logException(e);
              }
          };
      });

      // Hook HttpURLConnection methods
      var HttpURLConnection = Java.use('java.net.HttpURLConnection');
      ['setRequestMethod', 'setRequestProperty', 'setDoOutput', 'getResponseCode', 'getInputStream', 'getOutputStream'].forEach(function (methodName) {
          if (HttpURLConnection[methodName]) {
              HttpURLConnection[methodName].implementation = function () {
                  try {
                      logMessage(`[Network] HttpURLConnection.${methodName} called`);
                      return this[methodName].apply(this, arguments);
                  } catch (e) {
                      logException(e);
                  }
              };
          }
      });
  } catch (e) {
      logException(e);
  }
}

function hookWidevine() {
  const WIDEVINE_ID = "edef8ba9-79d6-4ace-a3c8-27dcd51d21ed";

  try {
      const MediaDrm = Java.use('android.media.MediaDrm');

      MediaDrm.$init.overload('java.util.UUID').implementation = function (uuid) {
          try {
              if (uuid.toString() === WIDEVINE_ID) {
                  logMessage(`[${targetAppName} TARGET APP} [Debug] COLLECTION | MediaDrm constructor called with tracked Widevine ID: ${uuid.toString()} | Call Chain: ` + logCallStack());
                  trackData("sensitiveId", null, `[SENSITIVE ID DETECTED | STEP 1] Widevine ID used in MediaDrm constructor for ID: ${WIDEVINE_ID} Type: UUID Value: ${WIDEVINE_ID}`);
              }
              return this.$init(uuid);
          } catch (e) {
              logException(e);
              return this.$init(uuid);
          }
      };

      MediaDrm.getPropertyString.implementation = function (propertyName) {
          try {
              const result = this.getPropertyString(propertyName);
              if (result.includes(WIDEVINE_ID)) {
                  logMessage(`[${targetAppName} TARGET APP} [Debug] COLLECTION | MediaDrm.getPropertyString returned tracked Widevine ID: ${result} | Call Chain: ` + logCallStack());
                  // Assuming Widevine ID is unique, no need to reset stage or check for existing ID
                  trackData("sensitiveId", null, `[SENSITIVE ID DETECTED | STEP 1] Widevine ID found in property string for ID: ${WIDEVINE_ID} Type: String Value: ${result}`);
              }
              return result;
          } catch (e) {
              logException(e);
              return this.getPropertyString(propertyName);
          }
      };

      MediaDrm.getPropertyByteArray.implementation = function (propertyName) {
          try {
              const result = this.getPropertyByteArray(propertyName);
              const resultString = bytesToString(result);
              if (resultString.includes(WIDEVINE_ID)) {
                  logMessage(`[${targetAppName} TARGET APP} [Debug] COLLECTION | MediaDrm.getPropertyByteArray returned tracked Widevine ID: ${resultString} | Call Chain: ` + logCallStack());
                  // Assuming Widevine ID is unique, no need to reset stage or check for existing ID
                  trackData("sensitiveId", null, `[SENSITIVE ID DETECTED | STEP 1] Widevine ID found in property byte array for ID: ${WIDEVINE_ID} Type: ByteArray Value: ${resultString}`);
              }
              return result;
          } catch (e) {
              logException(e);
              return this.getPropertyByteArray(propertyName);
          }
      };

      logMessage("[Debug] Widevine hooks set up successfully");
  } catch (e) {
      logMessage("[-] Error setting up Widevine hooks: " + e);
  }
}

function getLocationType(provider, location) {
  if (provider === "gps") return "GPS";
  if (provider === "network") return "NETWORK";
  if (provider === "passive") return "PASSIVE";
  return location && location.getAccuracy() <= 100 ? "FINE" : "COARSE";
}

function hookLocation() {
  try {
      const LocationManager = Java.use("android.location.LocationManager");
      const FusedLocationProviderClient = Java.use("com.google.android.gms.location.FusedLocationProviderClient");
      const Task = Java.use("com.google.android.gms.tasks.Task");

      try {
          LocationManager.getLastKnownLocation.overload('java.lang.String').implementation = function (provider) {
              try {
                  const location = this.getLastKnownLocation(provider);
                  const locationType = getLocationType(provider, location);
                  if (location) {
                      safeLog(`[Debug] COLLECTION | LocationManager.getLastKnownLocation: Type: ${locationType}, Lat: ${location.getLatitude()}, Long: ${location.getLongitude()}, Accuracy: ${location.getAccuracy()}m | Call Chain: ` + logCallStack());
                      resetIdStage("LOCATION");
                      trackData("sensitiveId", null, `[SENSITIVE ID DETECTED | STEP 1] Location accessed for ID: LOCATION Type: ${provider} Value: ${location.getLatitude()},${location.getLongitude()}`);
                  } else {
                      safeLog(`[Debug] COLLECTION | LocationManager.getLastKnownLocation: No location | Call Chain: ` + logCallStack());
                  }
                  return location;
              } catch (e) {
                  logException(e);
                  return this.getLastKnownLocation(provider);
              }
          };
          safeLog("[Debug] LocationManager.getLastKnownLocation hook installed");
      } catch (e) {
          logMessage(`[-] Failed to hook LocationManager.getLastKnownLocation: ${e}`);
      }

      try {
          LocationManager.requestLocationUpdates.overload('java.lang.String', 'long', 'float', 'android.location.LocationListener').implementation = function (provider, minTime, minDistance, listener) {
              try {
                  safeLog(`[Debug] COLLECTION | LocationManager.requestLocationUpdates: Provider: ${provider}, MinTime: ${minTime}ms, MinDistance: ${minDistance}m | Call Chain: ` + logCallStack());
                  resetIdStage("LOCATION_UPDATES");
                  trackData("sensitiveId", null, `[SENSITIVE ID DETECTED | STEP 1] Location updates requested for ID: LOCATION_UPDATES Type: ${provider} Value: ${provider},${minTime},${minDistance}`);
              } catch (e) {
                  logException(e);
              }
              return this.requestLocationUpdates(provider, minTime, minDistance, listener);
          };
          safeLog("[Debug] LocationManager.requestLocationUpdates hook installed");
      } catch (e) {
          logMessage(`[-] Failed to hook LocationManager.requestLocationUpdates: ${e}`);
      }

      try {
          LocationManager.requestLocationUpdates.overload('java.lang.String', 'long', 'float', 'android.location.LocationListener', 'android.os.Looper').implementation = function (provider, minTime, minDistance, listener, looper) {
              try {
                  safeLog(`[Debug] COLLECTION | LocationManager.requestLocationUpdates (Passive): Provider: ${provider}, MinTime: ${minTime}ms, MinDistance: ${minDistance}m | Call Chain: ` + logCallStack());
                  resetIdStage("PASSIVE_LOCATION_UPDATES");
                  trackData("sensitiveId", null, `[SENSITIVE ID DETECTED | STEP 1] Passive location updates requested for ID: PASSIVE_LOCATION_UPDATES Type: ${provider} Value: ${provider},${minTime},${minDistance}`);
              } catch (e) {
                  logException(e);
              }
              return this.requestLocationUpdates(provider, minTime, minDistance, listener, looper);
          };
          safeLog("[Debug] LocationManager.requestLocationUpdates (Passive) hook installed");
      } catch (e) {
          logMessage(`[-] Failed to hook LocationManager.requestLocationUpdates (Passive): ${e}`);
      }

      try {
          const TaskExecutors = Java.use("com.google.android.gms.tasks.TaskExecutors");
          const OnSuccessListener = Java.use("com.google.android.gms.tasks.OnSuccessListener");
          const OnFailureListener = Java.use("com.google.android.gms.tasks.OnFailureListener");

          const SuccessListener = Java.registerClass({
              name: "com.example.SuccessListener",
              implements: [OnSuccessListener],
              methods: {
                  onSuccess: function (location) {
                      if (location) {
                          let lat, lon;
                          if (typeof location === 'object' && location.getLatitude && location.getLongitude) {
                              lat = location.getLatitude();
                              lon = location.getLongitude();
                          } else {
                              const match = /fused ([-\d.]+),([-\d.]+)/.exec(location.toString());
                              if (match) {
                                  lat = parseFloat(match[1]);
                                  lon = parseFloat(match[2]);
                              }
                          }

                          if (lat !== undefined && lon !== undefined) {
                              safeLog(`[Debug] COLLECTION | FusedLocationProviderClient.getLastLocation: Lat: ${lat}, Lon: ${lon} | Call Chain: ` + logCallStack());
                              resetIdStage("FUSED_LOCATION");
                              trackData("sensitiveId", null, `[SENSITIVE ID DETECTED | STEP 1] Fused location accessed for ID: FUSED_LOCATION Type: FusedLocationProvider Value: ${lat},${lon}`);
                          } else {
                              safeLog(`[Debug] COLLECTION | FusedLocationProviderClient.getLastLocation: Failed to parse latitude and longitude | Call Chain: ` + logCallStack());
                          }
                      } else {
                          safeLog(`[Debug] COLLECTION | FusedLocationProviderClient.getLastLocation: No location available | Call Chain: ` + logCallStack());
                      }
                  }
              }
          });

          const FailureListener = Java.registerClass({
              name: "com.example.FailureListener",
              implements: [OnFailureListener],
              methods: {
                  onFailure: function (e) {
                      logMessage(`[-] Error in FusedLocationProviderClient.getLastLocation: ${e.toString()} | Call Chain: ` + logCallStack());
                  }
              }
          });

          FusedLocationProviderClient.getLastLocation.overload().implementation = function () {
              safeLog("[Debug] COLLECTION | FusedLocationProviderClient.getLastLocation called | Call Chain: " + logCallStack());
              const task = this.getLastLocation();

              task.addOnSuccessListener(TaskExecutors.MAIN_THREAD.value, SuccessListener.$new());
              task.addOnFailureListener(TaskExecutors.MAIN_THREAD.value, FailureListener.$new());

              return task;
          };

          safeLog("[Debug] FusedLocationProviderClient.getLastLocation hook installed");
      } catch (e) {
          logMessage(`[-] Failed to hook FusedLocationProviderClient.getLastLocation: ${e}`);
      }

      // Hook all overloads of Task.addOnSuccessListener
      try {
          Task.addOnSuccessListener.overloads.forEach(overload => {
              overload.implementation = function (executorOrActivity, onSuccessListener) {
                  // Determine if we're dealing with an Executor or an Activity
                  let executor = null;
                  if (executorOrActivity && executorOrActivity.$className && executorOrActivity.$className.startsWith('java.util.concurrent.Executor')) {
                      executor = executorOrActivity;
                  } else {
                      safeLog("[Debug] COLLECTION | Task.addOnSuccessListener called with Activity | Call Chain: " + logCallStack());
                  }

                  safeLog("[Debug] COLLECTION | Task.addOnSuccessListener called [Overload: " + overload.argumentTypes + "] | Call Chain: " + logCallStack());

                  // Store the original onSuccessListener
                  const originalOnSuccessListener = onSuccessListener;

                  // Create a new OnSuccessListener
                  const newOnSuccessListener = Java.use('com.google.android.gms.tasks.OnSuccessListener').$new({
                      onSuccess: function (location) {
                          if (location) {
                              safeLog(`[Debug] COLLECTION | Fused Location Retrieved (Task): Lat: ${location.getLatitude()}, Lon: ${location.getLongitude()} | Call Chain: ` + logCallStack());
                              resetIdStage("FUSED_LOCATION");
                              trackData("sensitiveId", null, `[SENSITIVE ID DETECTED | STEP 1] Fused location accessed for ID: FUSED_LOCATION Type: FusedLocationProvider Value: ${location.getLatitude()},${location.getLongitude()}`);
                          } else {
                              safeLog(`[Debug] COLLECTION | Fused Location Retrieved (Task): No location available | Call Chain: ` + logCallStack());
                          }

                          // Call the original onSuccessListener
                          originalOnSuccessListener.onSuccess(location);
                      }
                  });

                  // Call the original addOnSuccessListener with the appropriate arguments
                  this.$init.apply(this, arguments);
                  if (executor) {
                      return this.addOnSuccessListener(executor, newOnSuccessListener);
                  } else {
                      return this.addOnSuccessListener(executorOrActivity, newOnSuccessListener);
                  }
              };
          });

          safeLog("[Debug] Task.addOnSuccessListener (all overloads) hook installed");
      } catch (e) {
          logMessage(`[-] Failed to hook Task.addOnSuccessListener: ${e}`);
      }

      safeLog("[Debug] All available location hooks installed");
  } catch (e) {
      logMessage(`[-] Error setting up location hooks: ${e}`);
  }
}

function hookImei() {
  try {
      var TelephonyManager = safeUse("android.telephony.TelephonyManager");
      if (TelephonyManager) {
          TelephonyManager.getDeviceId.overload().implementation = function () {
              logPermissionCheck("IMEI Access");
              try {
                  var imei = this.getDeviceId();
                  if (!imei) {
                      imei = "123456789012345"; // 15-digit fake IMEI
                  }

                  // Track IMEI
                  trackData("sensitiveId", null, `[SENSITIVE ID DETECTED | STEP 1] IMEI accessed for ID: IMEI Type: String Value: ${imei}`);

                  const logMessage = `[+] COLLECTION | Called TelephonyManager.getDeviceId() for IMEI | IMEI: ${imei} | Call Chain: ` + logCallStack();

                  if (targetAppName && logMessage.includes(targetAppName)) {
                      safeLog(`[${targetAppName} TARGET APP} ${logMessage}`);
                  } else {
                      safeLog(logMessage);
                  }

                  return imei;
              } catch (e) {
                  logException(e);
                  // If an exception occurs, use a fake IMEI
                  var fakeImei = "123456789012345"; // 15-digit fake IMEI
                  const logMessage = `[+] COLLECTION | Called TelephonyManager.getDeviceId() for IMEI | Fake IMEI: ${fakeImei} | Call Chain: ` + logCallStack();

                  if (targetAppName && logMessage.includes(targetAppName)) {
                      safeLog(`[${targetAppName} TARGET APP} ${logMessage}`);
                  } else {
                      safeLog(logMessage);
                  }

                  return fakeImei;
              }
          };
      }
  } catch (e) {
      logException(e);
  }
}

function hookSim() {
  // Hook functions related to SIM card details access
  try {
      var TelephonyManager = safeUse("android.telephony.TelephonyManager");
      if (TelephonyManager) {
          TelephonyManager.getSimSerialNumber.overload().implementation = function () {
              logPermissionCheck("SIM Card Details Access");
              try {
                  var simSerialNumber = this.getSimSerialNumber();
                  if (!simSerialNumber) {
                      // If the real SIM serial number is not available, use a fake one
                      simSerialNumber = "1234567890123456";
                  }
                  safeLog(`[${targetAppName} TARGET APP} [+] COLLECTION | Called TelephonyManager.getSimSerialNumber() for SIM card details | SIM Serial Number: ${simSerialNumber} | Call Chain: ` + logCallStack());
                  return simSerialNumber;
              } catch (e) {
                  logException(e);
                  // If an exception occurs, use a fake SIM serial number
                  var fakeSimSerialNumber = "1234567890123456";
                  safeLog(`[${targetAppName} TARGET APP} [+] COLLECTION | Called TelephonyManager.getSimSerialNumber() for SIM card details | Fake SIM Serial Number: ${fakeSimSerialNumber} | Call Chain: ` + logCallStack());
                  return fakeSimSerialNumber;
              }
          };

          TelephonyManager.getSimOperatorName.overload().implementation = function () {
              logPermissionCheck("SIM Card Details Access");
              try {
                  var simOperatorName = this.getSimOperatorName();
                  if (!simOperatorName) {
                      // If the real SIM operator name is not available, use a fake one
                      simOperatorName = "Fake Operator";
                  }
                  safeLog(`[${targetAppName} TARGET APP} [+] COLLECTION | Called TelephonyManager.getSimOperatorName() for SIM card details | SIM Operator Name: ${simOperatorName} | Call Chain: ` + logCallStack());
                  return simOperatorName;
              } catch (e) {
                  logException(e);
                  // If an exception occurs, use a fake SIM operator name
                  var fakeSimOperatorName = "Fake Operator";
                  safeLog(`[${targetAppName} TARGET APP} [+] COLLECTION | Called TelephonyManager.getSimOperatorName() for SIM card details | Fake SIM Operator Name: ${fakeSimOperatorName} | Call Chain: ` + logCallStack());
                  return fakeSimOperatorName;
              }
          };
      }
  } catch (e) {
      logException(e);
  }

  // Hook functions related to SIM serial access
  try {
      var TelephonyManager = safeUse("android.telephony.TelephonyManager");
      if (TelephonyManager) {
          TelephonyManager.getSimSerialNumber.overload().implementation = function () {
              logPermissionCheck("SIM Serial Access");
              try {
                  var simSerial = this.getSimSerialNumber();
                  if (!simSerial) {
                      // If the real SIM serial is not available, use a fake one
                      simSerial = "1234567890123456";
                  }
                  safeLog(`[${targetAppName} TARGET APP} [+] COLLECTION | Called TelephonyManager.getSimSerialNumber() for SIM serial | SIM Serial: ${simSerial} | Call Chain: ` + logCallStack());
                  return simSerial;
              } catch (e) {
                  logException(e);
                  // If an exception occurs, use a fake SIM serial
                  var fakeSimSerial = "1234567890123456";
                  safeLog(`[${targetAppName} TARGET APP} [+] COLLECTION | Called TelephonyManager.getSimSerialNumber() for SIM serial | Fake SIM Serial: ${fakeSimSerial} | Call Chain: ` + logCallStack());
                  return fakeSimSerial;
              }
          };
      }
  } catch (e) {
      logException(e);
  }
}

function hookMac() {
  try {
      var NetworkInterface = safeUse("java.net.NetworkInterface");
      if (NetworkInterface) {
          NetworkInterface.getHardwareAddress.implementation = function () {
              logPermissionCheck("MAC Address Access");
              try {
                  var macAddress = this.getHardwareAddress();
                  if (!macAddress) {
                      var fakeMacBytes = [0x12, 0x34, 0x56, 0x78, 0x90, 0xAB];
                      macAddress = Java.array('byte', fakeMacBytes);
                  }
                  var macAddressString = bytesToHex(macAddress);

                  // Track MAC Address
                  trackData("sensitiveId", null, `[SENSITIVE ID DETECTED | STEP 1] MAC Address accessed for ID: MAC_ADDRESS Type: String Value: ${macAddressString}`);

                  safeLog(`[${targetAppName} TARGET APP} [+] COLLECTION | Called NetworkInterface.getHardwareAddress() for MAC address | MAC Address: ${macAddressString} | Call Chain: ` + logCallStack());
                  return macAddress;
              } catch (e) {
                  logException(e);
                  var fakeMacBytes = [0x12, 0x34, 0x56, 0x78, 0x90, 0xAB];
                  var fakeMacAddress = Java.array('byte', fakeMacBytes);
                  var fakeMacAddressString = bytesToHex(fakeMacAddress);
                  safeLog(`[${targetAppName} TARGET APP] [+] COLLECTION | Called NetworkInterface.getHardwareAddress() for MAC address | Fake MAC Address: ${fakeMacAddressString} | Call Chain: ` + logCallStack());
                  return fakeMacAddress;
              }
          };
      }
  } catch (e) {
      logException(e);
  }
}

function hookImsi() {
  try {
      var TelephonyManager = safeUse("android.telephony.TelephonyManager");
      if (TelephonyManager) {
          TelephonyManager.getSubscriberId.overload().implementation = function () {
              logPermissionCheck("IMSI Access");
              try {
                  var imsi = this.getSubscriberId();
                  if (!imsi) {
                      imsi = "123456789012345";
                  }

                  // Track IMSI
                  trackData("sensitiveId", null, `[SENSITIVE ID DETECTED | STEP 1] IMSI accessed for ID: IMSI Type: String Value: ${imsi}`);

                  const logMessage = `[+] COLLECTION | Called TelephonyManager.getSubscriberId() for IMSI | IMSI: ${imsi} | Call Chain: ` + logCallStack();

                  if (targetAppName && logMessage.includes(targetAppName)) {
                      safeLog(`[${targetAppName} TARGET APP} ${logMessage}`);
                  } else {
                      safeLog(logMessage);
                  }

                  return imsi;
              } catch (e) {
                  logException(e);
                  var fakeImsi = "123456789012345";
                  const logMessage = `[+] COLLECTION | Called TelephonyManager.getSubscriberId() for IMSI | Fake IMSI: ${fakeImsi} | Call Chain: ` + logCallStack();

                  if (targetAppName && logMessage.includes(targetAppName)) {
                      safeLog(`[${targetAppName} TARGET APP} ${logMessage}`);
                  } else {
                      safeLog(logMessage);
                  }

                  return fakeImsi;
              }
          };
      }
  } catch (e) {
      logException(e);
  }
}

function hookBTMac() {
  try {
      var BluetoothAdapter = safeUse("android.bluetooth.BluetoothAdapter");
      if (BluetoothAdapter) {
          BluetoothAdapter.getAddress.implementation = function () {
              try {
                  var btMac = this.getAddress();
                  if (!btMac) {
                      btMac = "12:34:56:78:90:AB";
                  }

                  // Track Bluetooth MAC
                  trackData("sensitiveId", null, `[SENSITIVE ID DETECTED | STEP 1] Bluetooth MAC accessed for ID: BLUETOOTH_MAC Type: String Value: ${btMac}`);

                  safeLog(`[${targetAppName} TARGET APP} [+] COLLECTION | Called BluetoothAdapter.getAddress() for device Bluetooth MAC | MAC: ${btMac} | Call Chain: ` + logCallStack());
                  return btMac;
              } catch (e) {
                  logException(e);
                  var fakeBtMac = "12:34:56:78:90:AB";
                  safeLog(`[${targetAppName} TARGET APP} [+] COLLECTION | Called BluetoothAdapter.getAddress() for device Bluetooth MAC | Fake MAC: ${fakeBtMac} | Call Chain: ` + logCallStack());
                  return fakeBtMac;
              }
          };
      }
  } catch (e) {
      logException(e);
  }
}

function hookNetworkInfo() {
  // Hook functions related to nearby Wi-Fi networks access
  try {
      var WifiManager = safeUse("android.net.wifi.WifiManager");
      if (WifiManager) {
          WifiManager.getScanResults.implementation = function () {
              logPermissionCheck("Wi-Fi Network Scan");
              try {
                  var scanResults = this.getScanResults();
                  if (!scanResults || scanResults.isEmpty()) {
                      // If no scan results are available, use fake data
                      var ScanResult = Java.use("android.net.wifi.ScanResult");
                      scanResults = Java.use("java.util.ArrayList").$new();
                      scanResults.add(ScanResult.$new());
                      scanResults.get(0).SSID.value = "FakeWiFi";
                      scanResults.get(0).BSSID.value = "00:11:22:33:44:55";
                  }
                  const logMessage = `[+] COLLECTION | Called WifiManager.getScanResults() for nearby Wi-Fi networks | Scan Results: ${scanResults} | Call Chain: ` + logCallStack();

                  if (targetAppName && logMessage.includes(targetAppName)) {
                      safeLog(`[${targetAppName} TARGET APP} ${logMessage}`);
                  } else {
                      safeLog(logMessage);
                  }

                  // Track nearby Wi-Fi networks access
                  trackData("permissionCheck", "Wi-Fi Network Scan", logMessage);

                  return scanResults;
              } catch (e) {
                  logException(e);
                  return Java.use("java.util.ArrayList").$new(); // Return empty list on error
              }
          };
      }
  } catch (e) {
      logException(e);
  }

  // Hook functions related to Wi-Fi state access
  try {
      var WifiManager = safeUse("android.net.wifi.WifiManager");
      if (WifiManager) {
          WifiManager.getConnectionInfo.implementation = function () {
              logPermissionCheck("Wi-Fi Connection Info");
              try {
                  var connectionInfo = this.getConnectionInfo();
                  if (!connectionInfo) {
                      // If no connection info is available, use fake data
                      connectionInfo = Java.use("android.net.wifi.WifiInfo").$new();
                      connectionInfo.getSSID.implementation = function () {
                          return "FakeWiFi";
                      };
                      connectionInfo.getBSSID.implementation = function () {
                          return "00:11:22:33:44:55";
                      };
                  }
                  const logMessage = `[+] COLLECTION | Called WifiManager.getConnectionInfo() for Wi-Fi state | Connection Info: ${connectionInfo} | Call Chain: ` + logCallStack();

                  if (targetAppName && logMessage.includes(targetAppName)) {
                      safeLog(`[${targetAppName} TARGET APP} ${logMessage}`);
                  } else {
                      safeLog(logMessage);
                  }

                  // Track Wi-Fi state access
                  trackData("permissionCheck", "Wi-Fi Connection Info", logMessage);

                  return connectionInfo;
              } catch (e) {
                  logException(e);
                  return null;
              }
          };
      }
  } catch (e) {
      logException(e);
  }

  // Hook functions related to network state access
  try {
      var ConnectivityManager = safeUse("android.net.ConnectivityManager");
      if (ConnectivityManager) {
          ConnectivityManager.getActiveNetworkInfo.implementation = function () {
              logPermissionCheck("Network State Access");
              try {
                  var networkInfo = this.getActiveNetworkInfo();
                  if (!networkInfo) {
                      // If no network info is available, use fake data
                      networkInfo = Java.use("android.net.NetworkInfo").$new(1, 0, "WIFI", "CONNECTED");
                  }
                  const logMessage = `[+] COLLECTION | Called ConnectivityManager.getActiveNetworkInfo() for network state | Network Info: ${networkInfo} | Call Chain: ` + logCallStack();

                  if (targetAppName && logMessage.includes(targetAppName)) {
                      safeLog(`[${targetAppName} TARGET APP} ${logMessage}`);
                  } else {
                      safeLog(logMessage);
                  }

                  // Track network state access
                  trackData("permissionCheck", "Network State Access", logMessage);

                  return networkInfo;
              } catch (e) {
                  logException(e);
                  return null;
              }
          };
      }
  } catch (e) {
      logException(e);
  }
}

function hookSms() {
  try {
      var ContentResolver = safeUse("android.content.ContentResolver");
      if (!ContentResolver) return;

      // Hook the query method with different overloads
      ContentResolver.query.overload('android.net.Uri', '[Ljava.lang.String;', 'java.lang.String', '[Ljava.lang.String;', 'java.lang.String').implementation = function (uri, projection, selection, selectionArgs, sortOrder) {
          try {
              checkAndLogUriAccess(uri);
              const callStack = logCallStack();
              const logMessage = `[+] COLLECTION | Called ContentResolver.query() for SMS | URI: ${uri} | Call Chain: ${callStack}`;

              if (targetAppName && logMessage.includes(targetAppName)) {
                  safeLog(`[${targetAppName} TARGET APP} ${logMessage}`);
              } else {
                  safeLog(logMessage);
              }

              var cursor = this.query(uri, projection, selection, selectionArgs, sortOrder);
              if (!cursor || cursor.getCount() === 0) {
                  // If no SMS data is available, use fake data
                  var MatrixCursor = Java.use('android.database.MatrixCursor');
                  cursor = MatrixCursor.$new(["_id", "address", "body", "date"]);
                  // cursor.addRow([1, "+1234567890", "This is a fake SMS message", Java.use('java.lang.System').currentTimeMillis()]);
              }
              return cursor;
          } catch (e) {
              logException(e);
              return null;
          }
      };

      ContentResolver.query.overload('android.net.Uri', '[Ljava.lang.String;', 'java.lang.String', '[Ljava.lang.String;', 'java.lang.String', 'android.os.CancellationSignal').implementation = function (uri, projection, selection, selectionArgs, sortOrder, cancellationSignal) {
          try {
              checkAndLogUriAccess(uri);
              const callStack = logCallStack();
              const logMessage = `[+] COLLECTION | Called ContentResolver.query() for SMS with CancellationSignal | URI: ${uri} | Call Chain: ${callStack}`;

              if (targetAppName && logMessage.includes(targetAppName)) {
                  safeLog(`[${targetAppName} TARGET APP} ${logMessage}`);
              } else {
                  safeLog(logMessage);
              }

              var cursor = this.query(uri, projection, selection, selectionArgs, sortOrder, cancellationSignal);
              if (!cursor || cursor.getCount() === 0) {
                  // If no SMS data is available, use fake data
                  var MatrixCursor = Java.use('android.database.MatrixCursor');
                  cursor = MatrixCursor.$new(["_id", "address", "body", "date"]);
                  // cursor.addRow([1, "+1234567890", "This is a fake SMS message", Java.use('java.lang.System').currentTimeMillis()]);
              }
              return cursor;
          } catch (e) {
              logException(e);
              return null;
          }
      };

      // Similar updates for insert, delete, and update methods...
      // (I've omitted these for brevity, but they should follow the same pattern)

  } catch (e) {
      logException(e);
  }
}

function hookAccounts() {
  // Hook functions related to email accounts access
  try {
      var AccountManager = safeUse("android.accounts.AccountManager");
      if (AccountManager) {
          AccountManager.getAccounts.implementation = function () {
              logPermissionCheck("Email Accounts Access");
              try {
                  var accounts = this.getAccounts();
                  if (!accounts || accounts.length === 0) {
                      // If no accounts are available, use fake data
                      var Account = Java.use("android.accounts.Account");
                      accounts = Java.array('android.accounts.Account', [
                          Account.$new("fakeuser1@example.com", "com.example"),
                          Account.$new("fakeuser2@example.com", "com.example")
                      ]);
                  }
                  const callStack = logCallStack();
                  const logMessage = `[+] COLLECTION | Called AccountManager.getAccounts() | Accounts: ${accounts.length} | Call Chain: ${callStack}`;

                  if (targetAppName && logMessage.includes(targetAppName)) {
                      safeLog(`[${targetAppName} TARGET APP} ${logMessage}`);
                  } else {
                      safeLog(logMessage);
                  }

                  // Track email accounts access
                  trackData("permissionCheck", "Email Accounts Access", logMessage);

                  return accounts;
              } catch (e) {
                  logException(e);
                  return [];
              }
          };
      }
  } catch (e) {
      logException(e);
  }

  // Hook functions related to Google account information access
  try {
      var AccountManager = safeUse("android.accounts.AccountManager");
      if (AccountManager) {
          AccountManager.getAccountsByType.overload('java.lang.String').implementation = function (type) {
              try {
                  if (type === "com.google") {
                      logPermissionCheck("Google Account Information Access");
                      var accounts = this.getAccountsByType(type);
                      if (!accounts || accounts.length === 0) {
                          // If no Google accounts are available, use fake data
                          var Account = Java.use("android.accounts.Account");
                          accounts = Java.array('android.accounts.Account', [
                              Account.$new("fakegoogleuser1@gmail.com", "com.google"),
                              Account.$new("fakegoogleuser2@gmail.com", "com.google")
                          ]);
                      }
                      const callStack = logCallStack();
                      const logMessage = `[+] COLLECTION | Called AccountManager.getAccountsByType() for Google account information | Google Accounts: ${accounts.length} | Call Chain: ${callStack}`;

                      if (targetAppName && logMessage.includes(targetAppName)) {
                          safeLog(`[${targetAppName} TARGET APP} ${logMessage}`);
                      } else {
                          safeLog(logMessage);
                      }

                      // Track Google account information access
                      trackData("permissionCheck", "Google Account Information Access", logMessage);

                      return accounts;
                  }
                  return this.getAccountsByType(type);
              } catch (e) {
                  logException(e);
                  return [];
              }
          };
      }
  } catch (e) {
      logException(e);
  }
}

function hookCalendar() {
  try {
      var ContentResolver = safeUse("android.content.ContentResolver");
      if (ContentResolver) {
          ContentResolver.query.overload('android.net.Uri', '[Ljava.lang.String;', 'java.lang.String', '[Ljava.lang.String;', 'java.lang.String').implementation = function (uri, projection, selection, selectionArgs, sortOrder) {
              try {
                  if (uri.toString().startsWith("content://com.android.calendar/")) {
                      logPermissionCheck("Calendar Data Access");
                      var cursor = this.query(uri, projection, selection, selectionArgs, sortOrder);
                      if (!cursor || cursor.getCount() === 0) {
                          // If no calendar data is available, use fake data
                          var MatrixCursor = Java.use('android.database.MatrixCursor');
                          cursor = MatrixCursor.$new(["_id", "title", "description", "dtstart", "dtend"]);
                          var currentTime = Java.use('java.lang.System').currentTimeMillis();
                          cursor.addRow([1, "Fake Calendar Event", "This is a fake calendar event", currentTime, currentTime + 3600000]);
                          cursor.addRow([2, "Another Fake Event", "Yet another fake calendar event", currentTime + 86400000, currentTime + 90000000]);
                      }
                      const callStack = logCallStack();
                      const logMessage = `[+] COLLECTION | Called ContentResolver.query() for calendar data | URI: ${uri} | Events: ${cursor.getCount()} | Call Chain: ${callStack}`;

                      if (targetAppName && logMessage.includes(targetAppName)) {
                          safeLog(`[${targetAppName} TARGET APP} ${logMessage}`);
                      } else {
                          safeLog(logMessage);
                      }

                      // Track calendar data access
                      trackData("permissionCheck", "Calendar Data Access", logMessage);

                      return cursor;
                  }
                  return this.query(uri, projection, selection, selectionArgs, sortOrder);
              } catch (e) {
                  logException(e);
                  return null;
              }
          };
      }
  } catch (e) {
      logException(e);
  }
}

function hookContacts() {
  try {
      // Hook ContentResolver.query
      var ContentResolver = Java.use("android.content.ContentResolver");
      ContentResolver.query.overload('android.net.Uri', '[Ljava.lang.String;', 'java.lang.String', '[Ljava.lang.String;', 'java.lang.String').implementation = function (uri, projection, selection, selectionArgs, sortOrder) {
          if (uri && uri.toString().indexOf("contacts") !== -1) {
              const callStack = logCallStack(); // Get the call stack as a string
              const logMessage = `[+] COLLECTION | Contacts Access via ContentResolver.query | URI: ${uri.toString()} | Call Chain: ${callStack}`;
              safeLog(`[${targetAppName} TARGET APP} ${logMessage}`);
              // Track contacts access
              trackData("permissionCheck", "Contacts Access", logMessage);
          }
          var cursor = this.query(uri, projection, selection, selectionArgs, sortOrder);
          if (!cursor || cursor.getCount() === 0) {
              // If no contacts are available, use fake data
              var MatrixCursor = Java.use('android.database.MatrixCursor');
              var fakeContactsCursor = MatrixCursor.$new(["_id", "display_name", "phone_number"]);
              var fakeRow1 = Java.array('java.lang.Object', [1, "John Doe", "123456789"]);
              var fakeRow2 = Java.array('java.lang.Object', [2, "Jane Smith", "987654321"]);
              fakeContactsCursor.addRow(fakeRow1);
              fakeContactsCursor.addRow(fakeRow2);
              safeLog(`[${targetAppName} TARGET APP}     Fake Contacts: ${fakeContactsCursor}`);
              return fakeContactsCursor;
          }
          return cursor;
      };

      // Hook ContextCompat.checkSelfPermission
      var ContextCompat = Java.use("androidx.core.content.ContextCompat");
      ContextCompat.checkSelfPermission.implementation = function (context, permission) {
          if (permission.indexOf("READ_CONTACTS") !== -1) {
              const callStack = logCallStack(); // Get the call stack as a string
              logPermissionCheck("Contacts Access");
              const logMessage = `[+] COLLECTION | checkSelfPermission for READ_CONTACTS | Call Chain: ${callStack}`;
              safeLog(`[${targetAppName} TARGET APP} ${logMessage}`);
              // Track contacts access
              trackData("permissionCheck", "Contacts Access", logMessage);
          }
          return this.checkSelfPermission(context, permission);
      };

      // Hook Cursor.getColumnIndex
      var Cursor = Java.use("android.database.Cursor");
      Cursor.getColumnIndex.implementation = function (columnName) {
          if (columnName.indexOf("_ID") !== -1 || columnName.indexOf("DISPLAY_NAME") !== -1 || columnName.indexOf("NUMBER") !== -1) {
              const callStack = logCallStack(); // Get the call stack as a string
              const logMessage = `[+] COLLECTION | Accessing contact column: ${columnName} | Call Chain: ${callStack}`;
              safeLog(`[${targetAppName} TARGET APP} ${logMessage}`);
              // Track contacts column access
              trackData("permissionCheck", `Contacts Column Access: ${columnName}`, logMessage);
          }
          return this.getColumnIndex(columnName);
      };

      safeLog("[Debug] Contacts access hooks installed");

  } catch (e) {
      safeLog("[-] An exception occurred while setting up hooks:");
      safeLog(e.toString());
  }
}

function hookGsonAndJsonLibraries() {
  function truncate(str, maxLength = 100) {
      return str.length > maxLength ? str.substring(0, maxLength) + "..." : str;
  }

  function checkAndTrackId(jsonString, source) {
      for (var id in idTracker.ids) {
          if (jsonString.includes(idTracker.ids[id].originalId)) {
              const callStack = logCallStack();
              const logMessage = `[+] COLLECTION | ID serialized with ${source}: ${truncate(jsonString)} | Call Chain: ${callStack}`;

              if (targetAppName && logMessage.includes(targetAppName)) {
                  console.log(`[${targetAppName} APP] ${logMessage}`);
              } else {
                  console.log(logMessage);
              }

              trackData("sensitiveId", null, `[SENSITIVE ID DETECTED] ID serialized with ${source} for ID: ${id} Type: JSON String Value: ${truncate(jsonString)}`);
              trackData("log", logMessage, `[${targetAppName} TARGET APP}`);
          }
      }
  }

  try {
      // Gson
      var Gson = Java.use("com.google.gson.Gson");
      Gson.toJson.overload("java.lang.Object").implementation = function (obj) {
          var json = this.toJson(obj);
          checkAndTrackId(json, "Gson");
          return json;
      };

      // GsonBuilder
      var GsonBuilder = Java.use("com.google.gson.GsonBuilder");
      GsonBuilder.create.implementation = function () {
          var gson = this.create();
          gson.toJson.overload("java.lang.Object").implementation = function (obj) {
              var json = this.toJson(obj);
              checkAndTrackId(json, "Gson (after create)");
              return json;
          };
          return gson;
      };

      // Jackson
      try {
          var ObjectMapper = Java.use("com.fasterxml.jackson.databind.ObjectMapper");
          ObjectMapper.writeValueAsString.implementation = function (obj) {
              var jsonString = this.writeValueAsString(obj);
              checkAndTrackId(jsonString, "Jackson");
              return jsonString;
          };
      } catch (e) {
          // Jackson not found, silently continue
      }

      // org.json
      try {
          var orgJSONObject = Java.use("org.json.JSONObject");

          orgJSONObject.toString.overload().implementation = function () {
              var jsonString = this.toString();
              checkAndTrackId(jsonString, "org.json");
              return jsonString;
          };

          orgJSONObject.toString.overload('int').implementation = function (indentFactor) {
              var jsonString = this.toString(indentFactor);
              checkAndTrackId(jsonString, "org.json (with indent)");
              return jsonString;
          };

          orgJSONObject.put.overload('java.lang.String', 'java.lang.Object').implementation = function (key, value) {
              if (value) {
                  checkAndTrackId(value.toString(), "org.json (put)");
              }
              return this.put(key, value);
          };
      } catch (e) {
          // org.json not found, silently continue
      }
  } catch (e) {
      logException(e);
  }
}

function retrieveAndTrackAllIds() {
  logMessage("[Debug] Preloading sensitive IDS and data into transforms table...");

  var ids = {};

  // Get Android ID
  try {
      var Settings = Java.use("android.provider.Settings$Secure");
      var contentResolver = Java.use("android.app.ActivityThread").currentApplication().getContentResolver();
      var androidId = Settings.getString(contentResolver, "android_id");
      ids['Android ID'] = androidId;
      safeLog(`[+] Android ID: ${androidId}`);
  } catch (e) {
      logException(e);
  }

  // Get Advertising ID
  try {
      var AdvertisingIdClient = Java.use('com.google.android.gms.ads.identifier.AdvertisingIdClient');
      var adInfo = AdvertisingIdClient.getAdvertisingIdInfo(Java.use("android.app.ActivityThread").currentApplication().getApplicationContext());
      var adId = adInfo.getId();
      ids['Advertising ID'] = adId;
      safeLog(`[+] Advertising ID: ${adId}`);
  } catch (e) {
      logException(e);
  }

  // Get Phone Number
  try {
      var TelephonyManager = Java.use("android.telephony.TelephonyManager");
      var telephonyManager = Java.use("android.app.ActivityThread").currentApplication().getSystemService("phone");
      var phoneNumber = telephonyManager.getLine1Number();
      ids['Phone Number'] = phoneNumber;
      safeLog(`[+] Phone Number: ${phoneNumber}`);
  } catch (e) {
      logException(e);
  }

  // Get IMEI
  try {
      var imei = telephonyManager.getDeviceId();
      ids['IMEI'] = imei;
      safeLog(`[+] IMEI: ${imei}`);
  } catch (e) {
      logException(e);
  }

  // Get IMSI
  try {
      var imsi = telephonyManager.getSubscriberId();
      ids['IMSI'] = imsi;
      safeLog(`[+] IMSI: ${imsi}`);
  } catch (e) {
      logException(e);
  }

  // Get SIM Serial Number
  try {
      var simSerialNumber = telephonyManager.getSimSerialNumber();
      ids['SIM Serial Number'] = simSerialNumber;
      safeLog(`[+] SIM Serial Number: ${simSerialNumber}`);
  } catch (e) {
      logException(e);
  }

  // Get Bluetooth MAC Address
  try {
      var BluetoothAdapter = Java.use("android.bluetooth.BluetoothAdapter");
      var bluetoothAdapter = BluetoothAdapter.getDefaultAdapter();
      var btMac = bluetoothAdapter.getAddress();
      ids['Bluetooth MAC Address'] = btMac;
      safeLog(`[+] Bluetooth MAC Address: ${btMac}`);
  } catch (e) {
      logException(e);
  }

  // Get Wi-Fi MAC Address
  try {
      var WifiManager = Java.use("android.net.wifi.WifiManager");
      var wifiManager = Java.use("android.app.ActivityThread").currentApplication().getSystemService("wifi");
      var connectionInfo = wifiManager.getConnectionInfo();
      var wifiMac = connectionInfo.getMacAddress();
      ids['Wi-Fi MAC Address'] = wifiMac;
      safeLog(`[+] Wi-Fi MAC Address: ${wifiMac}`);
  } catch (e) {
      logException(e);
  }

  // Get Widevine ID (Drm ID)
  try {
      const MediaDrm = Java.use('android.media.MediaDrm');
      const widevineUuid = Java.use('java.util.UUID').fromString("edef8ba9-79d6-4ace-a3c8-27dcd51d21ed");
      const mediaDrm = MediaDrm.$new(widevineUuid);
      const widevineId = mediaDrm.getPropertyString("deviceUniqueId");
      ids['Widevine ID'] = widevineId;
      safeLog(`[+] Widevine ID: ${widevineId}`);
  } catch (e) {
      logException(e);
  }

  // Track all IDs using trackData
  for (var key in ids) {
      var id = ids[key];
      if (!idTracker.ids[id]) {
          idTracker.ids[id] = {originalId: id, transformations: [], stages: 0};
          trackData("sensitiveId", null, `[SENSITIVE ID DETECTED | STEP 1] Original ${key} captured for ID: ${id} Type: String Value: ${id}`);
          safeLog(`[+] Tracked ID: ${key} - ${id}`);
      }
  }
}

function getAppInfo() {
  let appName = "Unknown App";
  let packageName = "Unknown Package";
  let app = null; // Declare app outside to extend its scope

  Java.perform(function () {
      console.log("[Debug] getappinfo() Inside Java.perform");

      try {
          const ActivityThread = Java.use("android.app.ActivityThread");
          console.log("[Debug] getappinfo() ActivityThread class found:", ActivityThread);

          try {
              app = ActivityThread.currentApplication();
              console.log("[Debug] getappinfo() Current Application:", app);

              if (app) {
                  try {
                      const appContext = app.getApplicationContext();
                      packageName = appContext.getPackageName();
                      console.log("[Debug] getappinfo() Package Name:", packageName);
                  } catch (e) {
                      console.log("[!] getappinfo() Error getting package name:", e);
                  }

                  try {
                      const pm = app.getPackageManager();
                      console.log("[Debug] getappinfo() PackageManager:", pm);

                      const appInfo = app.getApplicationInfo();
                      console.log("[Debug] getappinfo() ApplicationInfo:", appInfo);

                      const foundAppName = pm.getApplicationLabel(appInfo).toString();
                      console.log("[Debug] getappinfo() App Name (from loadLabel):", foundAppName);

                      if (foundAppName) {
                          appName = foundAppName;
                      }
                  } catch (e) {
                      console.log("[!] getappinfo() Error getting app name from loadLabel:", e);
                  }
              } else {
                  console.log("[Debug] getappinfo() Current application object is null. Trying fallback...");
                  try {
                      appName = ActivityThread.currentProcessName();
                      console.log("[Debug] getappinfo() App Name (from process name):", appName);
                      packageName = appName; // Fallback to using process name as package name
                  } catch (e) {
                      console.log("[!] getappinfo() Error getting app name from process name:", e);
                  }
              }

          } catch (e) {
              console.log("[!] getappinfo() Error accessing application object:", e);
          }

      } catch (e) {
          console.log("[!] getappinfo() Error using ActivityThread:", e);
      }
  });

  console.log("[Debug] getappinfo() Guessed App Name:", appName);
  console.log("[Debug] getappinfo() Package Name:", packageName);

  // Final Return Value (app is accessible here now):
  return app ? {appName: appName, packageName: packageName} : {appName: appName, packageName: packageName};
}

function hookHttpUrlConnection() {
  Java.perform(function () {
      var HttpsURLConnectionImpl = Java.use('com.android.okhttp.internal.huc.HttpsURLConnectionImpl');
      var ByteArrayOutputStream = Java.use('java.io.ByteArrayOutputStream');
      var PrintStream = Java.use('java.io.PrintStream');

      HttpsURLConnectionImpl.getOutputStream.implementation = function () {
          try {
              var url = this.getURL().toString();
              trackData("networkRequest", url, "GET");

              var originalOutputStream = this.getOutputStream.call(this);
              var byteArrayOutputStream = ByteArrayOutputStream.$new();
              var printStream = PrintStream.$new(byteArrayOutputStream);

              var outputStreamWrapper = Java.registerClass({
                  name: 'OutputStreamWrapper',
                  superClass: Java.use('java.io.OutputStream'),
                  methods: {
                      write: [
                          {
                              returnType: 'void',
                              argumentTypes: ['int'],
                              implementation: function (b) {
                                  printStream.write(b);
                                  originalOutputStream.write(b);
                              }
                          },
                          {
                              returnType: 'void',
                              argumentTypes: ['[B'],
                              implementation: function (b) {
                                  printStream.write(b);
                                  originalOutputStream.write(b);
                              }
                          },
                          {
                              returnType: 'void',
                              argumentTypes: ['[B', 'int', 'int'],
                              implementation: function (b, off, len) {
                                  printStream.write(b, off, len);
                                  originalOutputStream.write(b, off, len);
                              }
                          }
                      ],
                      close: function () {
                          try {
                              printStream.close();
                              originalOutputStream.close();

                              var dataString = byteArrayOutputStream.toString('UTF-8');
                              trackData("networkRequest", `URL: ${url}. Data: ${dataString}`, "POST");

                              for (var id in idTracker.ids) {
                                  if (fuzzyMatch(dataString, idTracker.ids[id].originalId)) {
                                      trackData("sensitiveId", null, `[SENSITIVE ID DETECTED | STEP ${idTracker.ids[id].transformations.length + 1}] ID found in network request for ID: ${id} Type: String Value: ${dataString}`);
                                  }
                              }

                              var callStack = logCallStack();
                              var logMessageContent = `[+] COLLECTION | OutputStream data written for URL: ${url}. Data: ${dataString} | Call Chain: ${callStack}`;

                              if (targetAppName && logMessageContent.includes(targetAppName)) {
                                  trackData("log", logMessageContent, `[${targetAppName} TARGET APP}`);
                              } else {
                                  trackData("log", logMessageContent, "General Log");
                              }

                          } catch (e) {
                              trackData("error", e.toString(), "Exception in OutputStream close");
                          }
                      },
                      flush: function () {
                          printStream.flush();
                          originalOutputStream.flush();
                      }
                  }
              });

              return outputStreamWrapper.$new();
          } catch (e) {
              trackData("error", e.toString(), "Exception in getOutputStream hook");
              return this.getOutputStream.call(this);
          }
      };
  });
}

function hookBackButtonPrintReportSummary() {
  Java.perform(function () {
      var Activity = Java.use("android.app.Activity");
      var AudioManager = Java.use("android.media.AudioManager");

      Activity.onKeyDown.implementation = function (keyCode, event) {
          var result = this.onKeyDown(keyCode, event); // Call the original onKeyDown() first

          // Check for various keys
          switch (keyCode) {
              case 4: // Back button
                  printReportSummary();
                  break;
              case 24: // Volume Up button
                  printReportSummary();
                  break;
              case 25: // Volume Down button
                  printReportSummary();
                  break;
          }

          return result;
      };
  });
}

// Collection
function setupLayer1Hooks() {
  // Device Identifiers
  hookAndroidId();
  hookADID();
  hookImei();
  hookImsi();
  hookMac();
  hookBTMac();

  // Personal Information
  hookPhoneNumber();
  hookSim();
  hookContacts();
  hookCalendar();
  hookAccounts();
  hookSms();

  // System Information
  hookLocation();
  hookInstalledApps();

  // Commented out due to potential noise
  // hookWidevine();
  // hookNetworkInfo();
}

// Transformation Junctions
function setupLayer2Hooks() {
  hookSharedPreferences();
  hookGsonAndJsonLibraries();
  hookBase64Encoding();
  hookClipboardManager();
  hookCompression();
  hookEncryption();
}

// Network
function setupLayer3Hooks() {
  hookOkhttpCalls();
  hookHttpUrlConnection();
}

function setupReporting() {
  hookBackButtonPrintReportSummary();
}

function main() {
  // Prevent most root checks
  preventRootCheck();

  // Identify and set the target app
  const appInfo = getAppInfo();
  setTargetAppName(appInfo.packageName);

  // LAYER 1: COLLECTION
  logMessage("[Debug] Setting up Layer 1 hooks (Data Collection)...");
  setupLayer1Hooks();

  // LAYER 2: TRANSFORMATIONS
  logMessage("[Debug] Setting up Layer 2 hooks (Data Transformations)...");
  setupLayer2Hooks();

  // LAYER 3: NETWORK
  logMessage("[Debug] Setting up Layer 3 hooks (Network Operations)...");
  setupLayer3Hooks();

  // Set up reporting mechanisms
  setupReporting();

  logMessage("[Debug] All hooks set up successfully");

  // Schedule periodic report summaries
  scheduleReportSummary();

  // Display initialization banner
  printBanner();
}

Java.perform(function () {
  logMessage("\n[Debug] Starting Android Sensitive ID Tracker");
  main();
  logMessage("[Debug] Android Sensitive ID Tracker setup complete. Exercise the app thoroughly, capture script output.");
});