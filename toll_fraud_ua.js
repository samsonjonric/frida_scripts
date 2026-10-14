/* FG SCRIPT. Please keep this line. */

/**
 * Script to bypass common TF cloaking techiques:
 *   - User agent based cloaking
 *   - Battery based cloaking
 *   - AppsFlyer based cloaking
 */

/**
 * Overwrite console.log to logcat log
 * @param {...*} args The log message parts
 */
function log(...args) {
  const logStr = args.join(' ');
  console.log(logStr);
  Java.perform(function() {
    try {
      const androidLog = Java.use('android.util.Log');
      androidLog.e('FG', logStr);
    } catch (e) {}
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

/**
 * returns Context
 * @return {?Context}
 */
 function getContext() {
  return Java.use('android.app.ActivityThread')
      .currentApplication().getApplicationContext();
}

let classSet = new Set();
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
  log('#dex_elemenets: ' + arrayLen);
  for (let i = 0; i < arrayLen; i++) {
    let dexElem = jArray.get(dexElements, i);
    let dexFile = getDexFile(dexElem);
    try {
      let field = getField('dalvik.system.DexFile', 'mCookie');
      field.setAccessible(true);
      let mCookie = field.get(dexFile);
      if (mCookie == null) {
        log('get null cookie');
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
          log(className);
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
      log(clsAppsFlyerLib.toString());
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
          logFridaRecord("FridaCloaking.AppsFlyerLib.init", {"devkey": p1}, null);
        } catch (err1) {
          log(err1.message);
        }
        return init.call(instance, p1, p2, p3);
      };
      log('hook init');
    } else {
      log('AppsFlyerLib not found');
    }
  } catch (err) {
    log(err.message);
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
  log(classname + ':' + methodname);
  const targetClass = Java.use(classname);
  targetClass[methodname]
    .overload('java.util.Map')
    .implementation = function(arg0) {
      let arg_map = Java.cast(arg0, clazzMap);
      arg_map.remove('af_status');
      arg_map.put('af_status', 'Non-organic');
      arg_map.put('af_deeplink', 'true');
      arg_map.remove('af_message');
      arg_map.put('campaign', 'test');

      let retval;
      try {
        retval = this[methodname](arg_map);
        log('in ' + methodname);
      } catch (err) {
        retval = null;
        log('Exception - cannot compute retval: ' + String(err));
      }
      return retval;
    };
  log('hooked ' + classname + ':' + methodname);
}

/**
 * Change Android.os.Build field values to bypass cloaking checks.
 */
function setAndroidBuildFields() {
  const b = Java.use('android.os.Build');

  let model = b.MODEL;
  model.value = 'HRY-LX1T';

  let manufacturer = b.MANUFACTURER;
  manufacturer.value = 'HUAWEI';

  let brand = b.BRAND;
  brand.value = 'HONOR';

  let device = b.DEVICE;
  device.value = 'HWHRY-HF';

  let fingerprint = b.FINGERPRINT;
  fingerprint.value =
      'HONOR/HRY-LX1TRU/HWHRY-HF:10/HONORHRY-LX1T/10.0.0.212C10:user/release-keys';

  let hardware = b.HARDWARE;
  hardware.value = 'kirin710';

  let product = b.PRODUCT;
  product.value = 'HRY-LX1TRU';

  let cpu_abi = b.CPU_ABI;
  cpu_abi.value = 'arm64-v8a';

  let cpu_abi2 = b.CPU_ABI2;
  cpu_abi2.value = 'arm64-v8a';

  let supported_abis = b.SUPPORTED_ABIS;
  supported_abis.value = ['arm64-v8a'];

  let supported_abis32 = b.SUPPORTED_32_BIT_ABIS;
  supported_abis32.value = ['armeabi-v7a', 'armeabi'];

  let supported_abis64 = b.SUPPORTED_64_BIT_ABIS;
  supported_abis64.value = ['arm64-v8a'];
}

const SENSOR_LISTENERS = [];
const SENSOR_OBJECTS = [];

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

   const maxIterations = 600 + getRand(900);
  let currentIteration = 0;
  let isTimerRunning = false;

  function triggerSensorEvent() {
    if (SENSOR_LISTENERS.length === 0) {
      log("[+] No active sensor listeners. Pausing sensor events.");
      isTimerRunning = false;
      return;
    }

    if (currentIteration >= maxIterations) {
      log("[+] Reached max iterations (" + maxIterations + "). Stopping sensor events.");
      isTimerRunning = false;
      return;
    }

    currentIteration++;
    log("[+] Current Interval Iteration " + currentIteration + " with " + SENSOR_LISTENERS.length + " sensor listeners");

    const listeners = SENSOR_LISTENERS.slice();
    const objects = SENSOR_OBJECTS.slice();

    for (let i = 0; i < listeners.length; i++) {
      Java.performNow(function() {
        try {
          log("[+] Sending new Sensor Event");
          const sensorEventObj = createSensorEvent(objects[i]);
          listeners[i].onSensorChanged(sensorEventObj);
        } catch(err) {
          log("[-] ERROR: " + err.message);
        }
      });
    }

    setTimeout(triggerSensorEvent, 50);
  }

  function startSensorLoopIfNeeded() {
    if (!isTimerRunning && currentIteration < maxIterations && SENSOR_LISTENERS.length > 0) {
      isTimerRunning = true;
      setTimeout(triggerSensorEvent, 50);
    }
  }

  SensorManager.registerListener.overload("android.hardware.SensorEventListener", "android.hardware.Sensor", "int", "android.os.Handler").implementation = function(listener, sensor, sampling, handler) {
    logFridaRecord("FridaCloaking.sensorManager.registerListener", {}, "register sensor listener");
    const value = this.registerListener(listener, sensor, sampling, handler);
    if (sensor !== null && sensor.getType() === 1 && listener !== null) {
      log("[+] Saving SensorManager related objects");
      SENSOR_LISTENERS.push(Java.retain(listener));
      SENSOR_OBJECTS.push(Java.retain(sensor));
      startSensorLoopIfNeeded();
    }
    return value;
  }

  SensorManager.unregisterListener.overload("android.hardware.SensorEventListener").implementation = function(listener) {
    logFridaRecord("FridaCloaking.sensorManager.unregisterListener", {}, "unregister sensor listener");
    const index = SENSOR_LISTENERS.indexOf(listener);
    if (index > -1) {
      SENSOR_LISTENERS.splice(index, 1);
      SENSOR_OBJECTS.splice(index, 1);
    }
    return this.unregisterListener(listener);
  };
}

function createResolveInfo(package_name) {
  var ActivityInfo = Java.use("android.content.pm.ActivityInfo");
  var ApplicationInfo = Java.use("android.content.pm.ApplicationInfo");
  var ResolveInfo = Java.use("android.content.pm.ResolveInfo");
  const appInfo = ApplicationInfo.$new();
  appInfo.packageName.value = package_name;
  appInfo.name.value = package_name;
  const actInfo = ActivityInfo.$new();
  actInfo.packageName.value = package_name;
  actInfo.name.value = package_name + ".MainActivity";
  actInfo.applicationInfo.value = appInfo;
  var rInfo = ResolveInfo.$new();
  rInfo.activityInfo.value = actInfo;
  return rInfo;
}

function mockInstalledApps() {
  try {
    const PackageManager = Java.use("android.app.ApplicationPackageManager");
    const PackageInfo = Java.use("android.content.pm.PackageInfo");
    const ApplicationInfo = Java.use("android.content.pm.ApplicationInfo");
    const ArrayList = Java.use("java.util.ArrayList");
    const Apps = ["com.whatsapp", "com.facebook.katana", "com.viber.voip", "ua.gov.diia.app"];

    function createMockPackageInfo(pname) {
      var pInfo = PackageInfo.$new();
      pInfo.packageName.value = pname;
      pInfo.versionName.value = "1.0.0";
      pInfo.versionCode.value = 1;
      var appInfo = ApplicationInfo.$new();
      appInfo.packageName.value = pname;
      appInfo.name.value = pname;
      pInfo.applicationInfo.value = appInfo;
      return pInfo;
    }

    function addMockResolveInfos(intent, resultList) {
      if (!resultList) return;
      var targetPkg = null;
      try {
        targetPkg = intent.getPackage();
      } catch (e) {}
      if (targetPkg) {
        if (Apps.includes(targetPkg)) {
          var found = false;
          for (var j = 0; j < resultList.size(); j++) {
            var ri = resultList.get(j);
            if (ri && ri.activityInfo && ri.activityInfo.value && ri.activityInfo.value.packageName && ri.activityInfo.value.packageName.value === targetPkg) {
              found = true;
              break;
            }
          }
          if (!found) {
            resultList.add(createResolveInfo(targetPkg));
          }
        }
      } else {
        for (var i = 0; i < Apps.length; i++) {
          var found = false;
          for (var j = 0; j < resultList.size(); j++) {
            var ri = resultList.get(j);
            if (ri && ri.activityInfo && ri.activityInfo.value && ri.activityInfo.value.packageName && ri.activityInfo.value.packageName.value === Apps[i]) {
              found = true;
              break;
            }
          }
          if (!found) {
            resultList.add(createResolveInfo(Apps[i]));
          }
        }
      }
    }

    // PackageInfo technique
    PackageManager.getPackageInfo.overload('java.lang.String', 'int').implementation = function (pname, flags) {
      try {
        return this.getPackageInfo(pname, flags);
      } catch (err) {
        if (Apps.includes(pname)) {
          logFridaRecord("FridaCloaking.packageManager.getPackageInfo", {}, pname);
          return createMockPackageInfo(pname);
        }
        throw err;
      }
    };

    try {
      PackageManager.getPackageInfo.overload('java.lang.String', 'android.content.pm.PackageManager$PackageInfoFlags').implementation = function (pname, flags) {
        try {
          return this.getPackageInfo(pname, flags);
        } catch (err) {
          if (Apps.includes(pname)) {
            logFridaRecord("FridaCloaking.packageManager.getPackageInfo", {}, pname);
            return createMockPackageInfo(pname);
          }
          throw err;
        }
      };
    } catch (err) {
      // not found, API 33+
    }

    // getInstalledApplication technique
    PackageManager.getInstalledApplications.overload('int').implementation = function (flags) {
      var originList = this.getInstalledApplications(flags);
      if (!originList) {
        originList = ArrayList.$new();
      }
      var newList = ArrayList.$new(originList);
      for (var i = 0; i < Apps.length; i++) {
        var found = false;
        for (var j = 0; j < originList.size(); j++) {
          var ai = originList.get(j);
          if (ai && ai.packageName && ai.packageName.value === Apps[i]) {
            found = true;
            break;
          }
        }
        if (!found) {
          var fakeApp = ApplicationInfo.$new();
          fakeApp.packageName.value = Apps[i];
          fakeApp.name.value = Apps[i];
          newList.add(fakeApp);
        }
      }
      logFridaRecord("FridaCloaking.packageManager.getInstalledApplications", {}, null);
      return newList;
    };

    // queryIntentActivities technique
    PackageManager.queryIntentActivities.overload('android.content.Intent', 'int').implementation = function (intent, flags) {
      var result = this.queryIntentActivities(intent, flags);
      addMockResolveInfos(intent, result);
      logFridaRecord("FridaCloaking.packageManager.queryIntentActivities", {}, null);
      return result;
    };
    try {
      PackageManager.queryIntentActivities.overload('android.content.Intent', 'android.content.pm.PackageManager$ResolveInfoFlags').implementation = function (intent, flags) {
        var result = this.queryIntentActivities(intent, flags);
        addMockResolveInfos(intent, result);
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
  function trackOpen(path, fd) {
    if (fd >= 0 && path && path.includes("/proc/self/status")) {
      log(`[*] Opening ${path} -> Assigned FD: ${fd}`);
      statusFDs.add(fd);
    }
  }
  // Hook open & openat
  ["open", "openat"].forEach(funcName => {
    const ptr = Module.findExportByName("libc.so", funcName);
    if (ptr) {
      Interceptor.attach(ptr, {
        onEnter: function(args) {
          try {
            const pathPtr = funcName === "openat" ? args[1] : args[0];
            this.path = (pathPtr && !pathPtr.isNull()) ? pathPtr.readCString() : null;
          } catch (e) {
            this.path = null;
          }
        },
        onLeave: function(retval) {
          trackOpen(this.path, retval.toInt32());
        }
      });
    }
  });
  // Hook read
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
            // readCString reads up to null byte without throwing UTF-8 decode errors
            const content = this.buf.readCString(bytesRead);
            if (content && content.includes("TracerPid:")) {
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
  // Hook close
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

const safe = [];
const GL_VENDOR = 0x1F00;
const GL_RENDERER = 0x1F01;
const GL_VERSION = 0x1F02;

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

function safeInterceptorAttach(module, fun_name, callback) {
  if (!module) {
    return;
  }
  const modName = typeof module === 'string' ? module : module.name;
  var lib = Process.findModuleByName(modName);
  if (lib == null) {
    log(`Module ${modName} was not open!`);
    return;
  }
  const fun_ptr = Module.findExportByName(modName, fun_name);
  if (fun_ptr == null) {
    log(`${fun_name} was not found!`);
  } else {
    Interceptor.attach(fun_ptr, callback);
  }
}

function initGlMocking() {

  log(`[+] Selected randomized GL Profile: Vendor=${glProfile.vendor}, Renderer=${glProfile.renderer}, Version=${glProfile.version}`);

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
            logFridaRecord(`FridaCloaking.${clsName}.glGetString`, { name: String(name) }, fakeVal);
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

function opengl_hooks () {
  // Native
  const enums = {
    0x1f00: 'GL_VENDOR',
    0x1f01: 'GL_RENDERER',
    0x1f02: 'GL_VERSION',
    0x1f03: 'GL_EXTENSIONS',
    0x8b8c: 'GL_SHADING_LANGUAGE_VERSION'
  }

  var opengl_libs = [
    Process.findModuleByName('libGLESv2.so'),
    Process.findModuleByName('libGLESv3.so')
  ]
  for (var i = 0; i < opengl_libs.length; i++) {
    if (!opengl_libs[i]) {
      continue;
    }
    safeInterceptorAttach(opengl_libs[i], 'glGetString', {
      onEnter (args) {
        this.pname = args[0].toInt32()
        this.enumName = enums[this.pname] || `0x${this.pname.toString(16)}`
      },
      onLeave (retval) {
        log('glGetString ' + this.enumName)
        if (this.pname === GL_VENDOR) {
          let safePtr = Memory.allocUtf8String(glProfile.vendor)
          safe.push(safePtr)
          retval.replace(safePtr)
        } else if (this.pname === GL_RENDERER) {
          let safePtr = Memory.allocUtf8String(glProfile.renderer)
          safe.push(safePtr)
          retval.replace(safePtr)
        } else if (this.pname === GL_VERSION) {
          let safePtr = Memory.allocUtf8String(glProfile.version)
          safe.push(safePtr)
          retval.replace(safePtr)
        }
      }
    })
  }
}

function vulkan_hooks () {
  var libvulkan = Process.findModuleByName('libvulkan.so')

  if (!libvulkan) {
    log('[-] libvulkan.so not loaded. Game is likely using OpenGL.')
    return
  }

  if (libvulkan) {
    // Intercepts calls from SystemInfo from Unity for vulkan
    let isPropertiesHooked = false
    safeInterceptorAttach(libvulkan, 'vkGetInstanceProcAddr', {
      onEnter: function (args) {
        this.funcName = args[1].readCString()
      },
      onLeave: function (retval) {
        if (
          this.funcName === 'vkGetPhysicalDeviceProperties' &&
          !retval.isNull()
        ) {
          if (!isPropertiesHooked) {
            isPropertiesHooked = true
            Interceptor.attach(retval, {
              onEnter: function (args) {
                this.pProperties = args[1]
              },
              onLeave: function (retval) {
                this.pProperties.add(20).writeUtf8String(glProfile.renderer)
                this.pProperties.add(0x8).writeU32(0x5143) // QUALCOMM OFFSET AND ID
              }
            })
          }
        }
      }
    })
  }
}

function libAndroidHooks() {
  let android = Process.findModuleByName('libandroid.so');
  if (android) {
    safeInterceptorAttach(android, 'ASensorEventQueue_getEvents', {
      onEnter: function (args) {
        this.eventsBuffer = args[1];
        this.maxCount = args[2].toInt32();
      },
      onLeave: function (retval) {
        // retval is the actual number of events returned by the hardware queue
        const numEvents = retval.toInt32();
        if (numEvents > 0) {
          // An ASensorEvent struct is exactly 104 bytes long on standard Android platforms
          const structSize = 104;
          for (let i = 0; i < numEvents; i++) {
            // Calculate the memory address of the current event in the array
            const eventPtr = this.eventsBuffer.add(i * structSize);
            // Offset 8: Sensor Type (int32_t)
            const sensorType = eventPtr.add(8).readInt();

            // ASENSOR_TYPE_ACCELEROMETER is defined as 1 in android/sensor.h
            if (sensorType === 1) {
              // Offset 16: Timestamp (int64_t)
              const timestamp = eventPtr.add(16).readS64();

              // 1. GENERATE BASE VECTORS (Mimicking holding phone upright in Portrait)
              let rawX = (Math.random() - 0.5) * 0.5; // Slight left/right hand wobble
              let rawY = 9.81 + (Math.random() - 0.5) * 1.5; // Primary gravity axis (Upward normal force)
              let rawZ = 2.0 + (Math.random() - 0.5) * 1.5; // Natural backward tilt of the phone in hand

              // 2. GENERATE "ALIVE" MAGNITUDE
              const timeSec = Number(timestamp) / 1000000000.0;
              const pulse = Math.sin(timeSec * 2.0) * 0.4;
              const targetMag = 9.80665 + pulse + (Math.random() - 0.5) * 0.2;

              // 3. SCALE VECTOR TO MATCH TARGET MAGNITUDE
              const currentMag = Math.sqrt(
                rawX * rawX + rawY * rawY + rawZ * rawZ
              );
              const scale = targetMag / currentMag;

              // 4. APPLY JITTER AND SCALE
              let finalX = rawX * scale;
              let finalY = rawY * scale;
              let finalZ = rawZ * scale;

              // 5. WRITE TO MEMORY
              eventPtr.add(24).writeFloat(finalX);
              eventPtr.add(28).writeFloat(finalY);
              eventPtr.add(32).writeFloat(finalZ);
            }
            // ASENSOR_TYPE_GYROSCOPE
            else if (sensorType === 4) {
              const timestamp = eventPtr.add(16).readS64();
              const timeSec = Number(timestamp) / 1000000000.0;
              const swayAmplitude = 0.5;
              let gyroX = Math.sin(timeSec) * swayAmplitude;
              let gyroY = Math.cos(timeSec * 0.8) * swayAmplitude;
              let gyroZ = Math.sin(timeSec * 1.2) * swayAmplitude;

              eventPtr.add(24).writeFloat(gyroX);
              eventPtr.add(28).writeFloat(gyroY);
              eventPtr.add(32).writeFloat(gyroZ);
            }
          }
        }
      }
    });
  }
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
  libAndroidHooks();
} catch (err) {
  log("[-] ERROR: " + err.message);
}



// Entry Point
Java.perform(function() {
  log('start hook');
  setAndroidBuildFields();
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
    log("[-] ERROR in sensorHook: " + err.message);
  }

  try {
    opengl_hooks()
  } catch(err) {
    log("[-] ERROR in opengl_hooks: " + err.message);
  }

  try {
    vulkan_hooks()
  } catch(err) {
    log("[-] ERROR in vulkan_hooks: " + err.message);
  }

  let UA = 'Mozilla/5.0 (Linux; Android 12; SM-S928B Build/UP1A.231005.007.S928BXXS3AXI1) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.6778.200 Mobile Safari/537.36';
  const wv = Java.use('android.webkit.WebView');
  const getSettings = wv.getSettings;
  const javaNetUrl = Java.use("java.net.URL");

  let date = Java.use('java.util.Date');
  let dateNow = date.$new();
  let t = dateNow.getTime();
  let s = Math.floor(t/1000);

  getSettings.implementation =
    function() {
      log('inside getSettings');
      const ret = getSettings.call(this);
      log('Value is: \'' + ret.getUserAgentString());
      ret.setUserAgentString(UA);
      return ret;
    };

  Java.use("android.os.BatteryManager").getIntProperty.overload("int")
      .implementation = function(battery_property_value) {
    if (battery_property_value == 4) { //BATTERY_PROPERTY_CAPACITY
      log('BATTERY_PROPERTY_CAPACITY new value is 83');
      logFridaRecord("FridaCloaking.BatteryManager.BATTERY_PROPERTY_CAPACITY",
            {}, "83");
      return 83;
    } else if (battery_property_value == 6) { //BATTERY_PROPERTY_STATUS
      logFridaRecord("FridaCloaking.BatteryManager.BATTERY_PROPERTY_STATUS",
            {}, "3");
      return 3; //BATTERY_STATUS_DISCHARGING
    }
    return this.getIntProperty(battery_property_value);
  };

  // 1. Hook HttpURLConnection.setRequestProperty to intercept any custom User-Agent set by the app
  const HttpURLConnection = Java.use('java.net.HttpURLConnection');
  HttpURLConnection.setRequestProperty.implementation = function(key, value) {
    if (key && String(key).toLowerCase() === "user-agent") {
      value = UA;
    }
    this.setRequestProperty(key, value);
  };

  // 2. Safely inject User-Agent in HttpURLConnectionImpl.initHttpEngine
  const httpConnection = Java.use('com.android.okhttp.internal.huc.HttpURLConnectionImpl');
  httpConnection.initHttpEngine.implementation = function() {
    try {
      if (this.getRequestProperty("User-Agent") === null) {
        if (this.connected && this.connected.value) {
          // Bypass connected check by writing directly to requestHeaders field
          const headers = this.requestHeaders.value;
          if (headers) {
            headers.set("User-Agent", UA);
          }
        } else {
          this.setRequestProperty("User-Agent", UA);
        }
      }
    } catch (err) {
      log("[-] ERROR in initHttpEngine: " + err.message);
    }
    this.initHttpEngine();
  };

  // 3. Set User-Agent upon opening connection (before connection is made)
  javaNetUrl.openConnection.overload().implementation = function () {
    const conn = this.openConnection();
    try {
      const httpConn = Java.cast(conn, HttpURLConnection);
      if (httpConn.getRequestProperty("User-Agent") === null) {
        httpConn.setRequestProperty("User-Agent", UA);
      }
    } catch (err) {
      log("[-] ERROR in openConnection: " + err.message);
    }
    return conn;
  };

  javaNetUrl.openConnection.overload("java.net.Proxy").implementation = function (proxy) {
    const conn = this.openConnection(proxy);
    try {
      const httpConn = Java.cast(conn, HttpURLConnection);
      if (httpConn.getRequestProperty("User-Agent") === null) {
        httpConn.setRequestProperty("User-Agent", UA);
      }
    } catch (err) {
      log("[-] ERROR in openConnection with proxy: " + err.message);
    }
    return conn;
  };

  log('hooked webview');
  hookAppsFlyer();

  // from bread_tf_cloaking.js
  // time cloaking commonly used by Bread
  Java.use("java.util.Date").after.overload('java.util.Date')
      .implementation = function(date) {
    logFridaRecord("FridaCloaking.Date.after", {}, "True");
    log("[+] CLOAKING DETECTED: Client Side Time Cloaking");
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
      log("[+] CLOAKING DETECTED: PlayStore Cloaking");
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
        log("[*] CLOAKING DETECTED: Anti-debug detected $SECURE in adb_enabled_int: " + param);
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
        log("[*] CLOAKING DETECTED: Anti-debug detected $SECURE in adb_enabled_string: " + param);
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
      log("[+] Inside $GLOBAL " + param);
      if (param === "development_settings_enabled" || param == "adb_enabled")
      {
        logFridaRecord("FridaCloaking.Settings.Global.getInt", {}, "0");
        log("[*] CLOAKING DETECTED: Anti-debug detected $GLOBAL in adb_enabled_int: " + param);
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
        log("[*] CLOAKING DETECTED: Anti-debug detected $GLOBAL in adb_enabled_string: " + param);
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
    if (path.endsWith("bin/su")){
      log("[+] CLOAKING DETECTED: SU binary Cloaking");
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
      log("inside getInstallReferrer");
      let facebook_app_id = "";
      try {
        let string_id = getContext().getResources()
            .getIdentifier("facebook_app_id", "string",
                           getContext().getPackageName());
        facebook_app_id = getContext().getString(string_id);
      }
      catch (err) {
        log(err.message);
      }
      let refferal = "gclid=123456789&utm_medium=referral&utm_source=apps."
          + "facebook.com&utm_campaign=fb4a&utm_content=bytedanceglobal_E.C.P.C"
          + "&facebook_app_id=" + facebook_app_id;
      logFridaRecord("FridaCloaking.getInstallReferrer", {}, refferal);
      return refferal;
    };
    rDetails.getInstallBeginTimestampSeconds.implementation = function() {
      log("inside getInstallBeginTimestampSeconds");
      let ret = s - 5 - getRand(30);
      log(String(ret));
      logFridaRecord("FridaCloaking.getInstallBeginTimestampSeconds", {},
          String(ret));
      return ret;
    };
    rDetails.getReferrerClickTimestampSeconds.implementation = function() {
      log("inside getReferrerClickTimestampSeconds");
      let ret = s - 15 - getRand(60);
      log(String(ret));
      logFridaRecord("FridaCloaking.getReferrerClickTimestampSeconds", {},
          String(ret));
      return ret;
    };
  } catch(err) {
    log(err.message);
  }

  log('before BaseBundle');
  // in some cases they obfuscate Referral API so we cant hook methods
  // to bypass it we can hook android.os.Bundle.getString('install_referrer');
  // or  android.os.Bundle.getLong('referrer_click_timestamp_seconds');
  // or  android.os.Bundle.getLong('install_begin_timestamp_seconds');
  let bundleClass = Java.use("android.os.BaseBundle");
  try {

    let sMethod1= bundleClass.getString.overload('java.lang.String');
    sMethod1.implementation = function(link) {
      let ret = sMethod1.call(this, link);
      if (link == "install_referrer") {
        log("in method: " + link);
        let referral2 = "gclid=123456789&utm_source=apps.facebook.com&"
           + "utm_campaign=fb4a&utm_medium=referral";
        logFridaRecord("FridaCloaking.BaseBundle.install_referrer", {},
              referral2);
        return referral2;
      }
      return ret;
    };

    let sMethod2= bundleClass.getString.overload('java.lang.String','java.lang.String');
    sMethod2.implementation = function(link, defaultValue) {
      let ret = sMethod2.call(this, link, defaultValue);
      if (link == "install_referrer") {
        log("in method: " + link);
        let referral2 = "gclid=123456789&utm_source=apps.facebook.com&"
           + "utm_campaign=fb4a&utm_medium=referral";
        logFridaRecord("FridaCloaking.BaseBundle.install_referrer", {},
              referral2);
        return referral2;
      }
      return ret;
    };

    let sMethodL2 = bundleClass.getLong.overload('java.lang.String', 'long');
    sMethodL2.implementation = function(link, defaultValue) {
      let ret = sMethodL2.call(this, link, defaultValue);
      if (link == "referrer_click_timestamp_seconds") {
        log("in method: " + link);
        let ret2 = s - 5 - getRand(30);
        logFridaRecord(
              "FridaCloaking.BaseBundle.referrer_click_timestamp_seconds", {},
              String(ret2));
        return ret2;
      }
      if (link == "install_begin_timestamp_seconds") {
        log("in method: " + link);
        let ret2 = s - 15 - getRand(60);
          logFridaRecord(
              "FridaCloaking.BaseBundle.install_begin_timestamp_seconds", {},
              String(ret2));
        return ret2;
      }
      return ret;
    };
  } catch(err) {
    log(err.message);
  }

  // from bread_tf_cloaking.js
  // Play version check commonly used by Bread
  const Activity = Java.use('android.app.Activity');

  try {
    var MotionEvent = Java.use('android.view.MotionEvent');
    var PointerCoords = Java.use('android.view.MotionEvent$PointerCoords');

    Activity.dispatchTouchEvent.implementation = function (event) {
      if (event.getAction() === 2 || event.getAction() === 0) {
        // ACTION_MOVE || ACTION_DOWN

        // 1. Create a container for the new coordinates
        var newCoords = PointerCoords.$new();
        event.getPointerCoords(0, newCoords);

        // 2. Modify the pressure
        newCoords.pressure.value = 0.7 + Math.random() * 0.1;

        // 3. Reconstruct the event with modified data
        var pointerCoordsArray = [newCoords];
        var pointerPropertiesArray = [
          Java.use('android.view.MotionEvent$PointerProperties').$new()
        ];
        event.getPointerProperties(0, pointerPropertiesArray[0]);
        var newEvent = MotionEvent.obtain(
          event.getDownTime(),
          event.getEventTime(),
          event.getAction(),
          1, // pointer count
          pointerPropertiesArray,
          pointerCoordsArray,
          event.getMetaState(),
          event.getButtonState(),
          event.getXPrecision(),
          event.getYPrecision(),
          event.getDeviceId(),
          event.getEdgeFlags(),
          event.getSource(),
          event.getFlags()
        );
        return this.dispatchTouchEvent(newEvent);
      }
      return this.dispatchTouchEvent(event);
    };
  } catch(err) {
    log("[-] ERROR Activity.dispatchTouchEvent: " + err.message);
  }

  log('finish hook');
});