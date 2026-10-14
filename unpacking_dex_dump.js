/* FG SCRIPT. Please keep this line. Required by Marmot-Frida. */
/**
 * Frida dex dump script for interactive frida (Android 11).
 *
 * This is a customizable and simplified version of Marmot Frida unpacking.
 *
 * In some situations, loading a class can crash the app. If you find the app
 * crashed, you can skip the class, skip dumping all dexes or skip initializing
 * all classes.
 *
 * Dumped dex files are saved in /data/local/tmp/fgout. And the files will be
 * automatically collected by Marmot.
 *
 * To check the log, run `logcat -d | grep FG`.
 *
 * Configuration:
 *  1. To dump dex files from target classes: Add class names in the
 * TARGET_CLASSES. You can use the components defined in the
 * AndroidManifest.xml.
 *  2. To disable dumping all possible dex files: Set DUMP_ALL_DEXES to false.
 *  3. To disable initializing all the classes: Set INIT_ALL_CLASSES to false.
 *  4. To skip initializing some classes: Add (partial) class names to the
 * SKIP_CLASS.
 *  5. To show the loaded classes for debugging purpose: Set
 * DEBUG_LOG_LOADED_CLASS to true.
 *
 * The original scripts working for Android 6 and Android 10 are developed by
 * khasaia@, lmontebello@, allansep@ and inouye@.
 */

// Configurations:

/*
The classes whose dex files will be dumped. In some situations, some classes
will be hidden in the classloader. E.g., ['com.activity1', 'com.activity2'];
*/
const /** !Array<string> */ TARGET_CLASSES = [];
// Whether you want to load and initialize all the classes. If it's false, the
// script will not dump all possible dex files.
const INIT_ALL_CLASSES = true;
// Whether to dump all possible dex files.
const DUMP_ALL_DEXES = true;
// The (partial) path of the classes that we don't want to initialize. In some
// situations, loading the class can cause app crash.
const SKIP_CLASS = ['ai.advance', 'kotlin', 'com.airbnb.lottie'];
// Whether to show loaded clases for debugging purpose
const DEBUG_LOG_LOADED_CLASS = false;

// Will wait for 10s before dumping.
const DELAY_SEC = 10000;
// We will check the dex location and skip system dex files.
const /** !Array<string> */ SKIP_DEX_LOCATION = ['/system/framework', '/apex/'];
// Output directory. It's world-writable.
const SAVE_DIRECTORY = '/data/local/tmp/fgout/';
// Tag for logcat
const LOG_TAG = 'FG';

/**
 * Logs messages
 * @param {string} msg
 */
function logMessage(msg) {
  const androidLog = Java.use('android.util.Log');
  androidLog.e('FG', msg);
}


/**
 * Dumps DEX files.
 * @param {!ArrayBuffer} contentBytes
 * @param {string} fileName
 */
function dumpDexBytes(contentBytes, fileName) {
  const filePath = SAVE_DIRECTORY + fileName;
  const file = new File(filePath, 'wb');
  file.write(contentBytes);
  file.flush();
  file.close();
}

/**
 * Loads all clases and return dex files for Android 11.
 * @return {!Array<!ArrayBuffer>}
 */
function loadAndGetDex() {
  let loadClasses = [...TARGET_CLASSES];
  let dumpClasses = [...TARGET_CLASSES];


  if (INIT_ALL_CLASSES) {
    const classes = Java.enumerateLoadedClassesSync();
    for (const aClass of classes) {
      try {
        const className = aClass.replace(/\//g, '.');
        loadClasses.push(className);
        if (DUMP_ALL_DEXES) {
          dumpClasses.push(className);
        }
      } catch (err) {
      }
    }
  }

  // Load all the classes.
  for (const className of loadClasses) {
    try {
      for (const skipClass of SKIP_CLASS) {
        if (className.includes(skipClass)) {
          continue;
        }
      }
      if (DEBUG_LOG_LOADED_CLASS) {
        logMessage('Loading: ' + className);
      }
      Java.classFactory.loader.loadClass(className);
    } catch (err) {
      // Skip class not found error.
    }
  }

  const /** !Array<!ArrayBuffer<!bytes>> */ dex = [];
  const /** !Array<string> */ dexList = [];
  // Dump dex files from classes
  for (const className of dumpClasses) {
    try {
      const classObj = Java.classFactory.loader.loadClass(className);
      const dexCache =
          Java.cast(classObj.dexCache.value, Java.use('java.lang.DexCache'));
      const dexPPtr = ptr(dexCache.dexFile.value).add(72);
      const dexPtr = Memory.readPointer(dexPPtr);
      const dexSize = dexPtr.add(0x20).readUInt();
      const location = dexCache.location.value?.toString() ?? '';
      if (!dexList.includes(dexPtr.toString())) {
        logMessage(
            'Adding dex: ' + dexPtr.toString() +
            '; from class: ' + className.toString());
        dexList.push(dexPtr.toString());
        if (location.startsWith('/apex') ||
            location.startsWith('/system/framework/')) {
          logMessage('Skip dex: ' + location);
        } else {
          dex.push(Memory.readByteArray(dexPtr, dexSize));
        }
      }
    } catch (err) {
    }
  }
  return dex;
}

/**
 * Checks if a DEX file starts with DEX_FILE_MAGIC (0x64 0x65 0x78 0x0a)
 * @param {!ArrayBuffer} dexBytes DEX file content
 * @return {boolean}
 */
function isDexMagic(dexBytes) {
  if (dexBytes.byteLength > 4) {
    const bytes = new Uint8Array(dexBytes.slice(0, 4));
    return bytes[0] === 0x64 && bytes[1] === 0x65 && bytes[2] === 0x78 &&
        bytes[3] == 0x0a;
  }
  return false;
}

/**
 * The unpack function.
 */
function unpack() {
  const dexes = loadAndGetDex();
  for (const [index, dexBytes] of Object.entries(dexes)) {
    const dumpDexName = 'classes_dynamic_unpacked_' + index + '.dex';
    const isMagic = isDexMagic(dexBytes);
    if (!isMagic) {
      logMessage(
          'UNPACK' +
          '[' + dumpDexName + '] DEX_FILE_MAGIC is removed from this file, ' +
          'consider adding the magic manually');
    }
    dumpDexBytes(dexBytes, dumpDexName);
  }
}

/**
 * The entrypoint function.
 */
function main() {
  setTimeout(() => {
    Java.performNow(() => {
      logMessage('start unpacking');
      try {
        unpack();
      } catch (err) {
        logMessage('failed to unpack:' + err.message);
        return;
      }
      logMessage('finish unpacking');
    });
  }, DELAY_SEC);
}

main();