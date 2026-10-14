/* FG SCRIPT. Please keep this line. Required by Marmot-Frida. */
/**
 * Bypass Anti-Analysis checks with Frida.
 *
 */

const mockedProps = {
  'ro.bootimage.build.fingerprint':
      'oneplus/bacon/A0001:10.0.1/MHC19Q/ZNH2KAS1KN:user/release-keys',
  'ro.build.fingerprint':
      'oneplus/bacon/A0001:10.0.1/MHC19Q/ZNH2KAS1KN:user/release-keys',
  'ro.odm.build.fingerprint':
      'oneplus/bacon/A0001:10.0.1/MHC19Q/ZNH2KAS1KN:user/release-keys',
  'ro.system.build.fingerprint':
      'oneplus/bacon/A0001:10.0.1/MHC19Q/ZNH2KAS1KN:user/release-keys',
  'ro.vendor.build.fingerprint':
      'oneplus/bacon/A0001:10.0.1/MHC19Q/ZNH2KAS1KN:user/release-keys',

  'ro.product.name': 'bacon',
  'ro.product.odm.name': 'bacon',
  'ro.product.system.name': 'bacon',
  'ro.product.vendor.name': 'bacon',
  'ro.product.board': 'msm8998',

  // A recent build date means it's an Emulator
  'ro.bootimage.build.date': 'Wed Jan 10 14:28:05 BST 2020',
  'ro.build.date': 'Wed Jan 10 14:28:05 BST 2020',
  'ro.odm.build.date': 'Wed Jan 10 14:28:05 BST 2020',
  'ro.system.build.date': 'Wed Jan 10 14:28:05 BST 2020',
  'ro.vendor.build.date': 'Wed Jan 10 14:28:05 BST 2020',

  'ro.bootimage.build.date.utc': '1578666485',
  'ro.build.date.utc': '1578666485',
  'ro.odm.build.date.utc': '1578666485',
  'ro.system.build.date.utc': '1578666485',
  'ro.vendor.build.date.utc': '1578666485',

  'ro.build.id': 'R34L1D',
  'ro.odm.build.id': 'R34L1D',
  'ro.system.build.id': 'R34L1D',
  'ro.vendor.build.id': 'R34L1D',

  // Emulators use value 'test-keys'
  'ro.build.tags': 'release-keys',
  'ro.odm.build.tags': 'release-keys',
  'ro.system.build.tags': 'release-keys',
  'ro.vendor.build.tags': 'release-keys',

  // Emulators use value 'userdebug'
  'ro.build.type': 'user',
  'ro.odm.build.type': 'user',
  'ro.system.build.type': 'user',
  'ro.vendor.build.type': 'user',

  // Emulators use value 'Android'
  'ro.product.brand': 'oneplus',
  'ro.product.odm.brand': 'oneplus',
  'ro.product.system.brand': 'oneplus',
  'ro.product.vendor.brand': 'oneplus',

  // Emulators use value 'generic_*'
  'ro.product.device': 'A0001',
  'ro.product.odm.device': 'A0001',
  'ro.product.system.device': 'A0001',
  'ro.product.vendor.device': 'A0001',

  'ro.product.manufacturer': 'OnePlus',
  'ro.product.odm.manufacturer': 'OnePlus',
  'ro.product.system.manufacturer': 'OnePlus',
  'ro.product.vendor.manufacturer': 'OnePlus',

  // Emulators use value 'Android SDK *'
  'ro.product.model': 'A0001',
  'ro.product.odm.model': 'A0001',
  'ro.product.system.model': 'A0001',
  'ro.product.vendor.model': 'A0001',

  // Emulators support x86 and x64_x86
  'ro.product.cpu.abi': 'arm64-v8a',
  'ro.odm.product.cpu.abi': 'arm64-v8a',
  'ro.system.product.cpu.abi': 'arm64-v8a',
  'ro.vendor.product.cpu.abi': 'arm64-v8a',

  'ro.product.cpu.abilist': 'arm64-v8a,armeabi-v7a,armeabi',
  'ro.odm.product.cpu.abilist': 'arm64-v8a,armeabi-v7a,armeabi',
  'ro.system.product.cpu.abilist': 'arm64-v8a,armeabi-v7a,armeabi',
  'ro.vendor.product.cpu.abilist': 'arm64-v8a,armeabi-v7a,armeabi',

  'ro.product.cpu.abilist32': 'armeabi-v7a,armeabi',
  'ro.odm.product.cpu.abilist32': 'armeabi-v7a,armeabi',
  'ro.system.product.cpu.abilist32': 'armeabi-v7a,armeabi',
  'ro.vendor.product.cpu.abilist32': 'armeabi-v7a,armeabi',

  'ro.product.cpu.abilist64': 'arm64-v8a',
  'ro.odm.product.cpu.abilist64': 'arm64-v8a',
  'ro.system.product.cpu.abilist64': 'arm64-v8a',
  'ro.vendor.product.cpu.abilist64': 'arm64-v8a',

  'ro.build.flavor': 'R3ALFL',
  'ro.build.display.id': 'R34LX.9734F42U1ARXX',
  'ro.build.user': 'jenkins',
  'ro.build.product': 'b4c0n',
  'ro.build.description': 'bacon 10.0.0 R16NW 9734F42U1ARXX release-keys',
  'ro.build.characteristics': 'real_device',
  'ro.build.host': 'ubuntu-21',

  // Emulators use value 'unknown'
  'ro.bootloader': 'L3g1tB00tl04d3r',
  'ro.bootmode': 'l3g1tm0d3',
  // Emulator contains string 'EMULATOR'
  'ro.serialno': 'C228070F2CFBE5A',
  'ro.kernel.androidboot.serialno': 'C228070F2CFBE5A',

  'ro.debuggable': '0',
  'ro.build.selinux': '',
  'service.adb.root': '0',
  'ro.secure': '1',

  'ro.kernel.androidboot.hardware': 'real_one',
  'ro.hardware': 'real_one',
  'ro.hardware.audio.primary': 's0meth1ng',
  'ro.hardware.virtual_device': '',
  'ro.boot.hardware': 'real_one',

  'ro.kernel.android.checkjni': '0',
  'ro.kernel.checkjni': '0',

  'gsm.version.baseband': '2.5.0.0',
  'ro.board.platform': 'msm8998',
  'sys.usb.config': '',
  'sys.usb.state': '',
  'init.svc.adbd': '',
  'ro.rf.vmname': '',
  'qemu.sf.fake_camera': '',
};

// Need to hide all system properties which contain these strings
const needToHidePropStrs = [
  'qemu',
  'goldfish',
  'noxd',
  'vbox',
  'windroye',
  'generic_x86',
  'cuttlefish',
  'genymotion',
  'microvirtd',
  'droid4x',
  '.ttVM',
  'tiantianVM',
  'bstfolderd',
  'bstsvcmgrtest',
];

// List of an emulator specific file names or parts of names
const needToReplaceFilePaths = [
  '/qemu',
  '/vbox',
  '/goldfish',
  'bluestacks',
  'genymotion',
  'cuttlefish',
  '/bstsensor',
  'genyd',
  'magisk',
  'xposed',
  'busybox',
  '/proc/devices',
  '/androVM',  // Virtualbox
  'vboxsf',
  'libGLES_emulation.so',
  'libGLESv1_CM_emulation.so',
  'libGLESv2_emulation.so',
  '/qemud',
  '/microvirtd',
  '/microvirt-prop',
  '/nox',
  'droid4x',
  '/ttVM',
  'tiantianVM.so',
  '/bstcmd_shim',  // bluestacks
  '/bstfolderd',
  '/bstsyncfs',
  '.bluestacks.prop',
  'libGLES_bst.so',
  'libGLES_bst.so-arm',
  'data/dexname',
  '/data/local/tmp/unpacker.config',
  '/data/fart',
  '/data/local/tmp/libFupk3.so',
];

// List of directories which may not exist in an Emulator
const alwaysExistsDirs = [
  '/sys/class/thermal/thermal_zone0',
];

// Root binary names
const rootBinaries = [
  'su',
  '.su',
  'supersu',
  '_daemonsu_',  // RootSwitch 1.3
  '_su_',
  'giefroot',  // giefroot IoC
  'mu',
  'chown',
  'chmod',
  'busybox',
  'supersu',
  'magisk',
  'daemonsu',
  'freeroot',
  'sugote',
  'superuser.apk',
  'kingouser.apk',
  'supersu.apk',
  'cufsdosck',
  'cufsmgr',
  'cufaevdd',
  'conbb',
];

// Strings which we want to hide from everywhere
const suspiciousStrings = [
  'busybox',
  'supersu',
  'magisk',
  'frida-agent',
  'frida',
  'test-keys',
  'userdebug',
  'linjector',
  '_xposed',
  'xposed_',
  'goldfish',
  'sdk_google',
  'google_sdk',
  'emulator',
  'simulator',
  'gum-js-loop',
  'jdwp',
  'adbd',
];

// Names of root app package names
const rootPackages = [
  'com.noshufou.android.su',
  'com.noshufou.android.su.elite',
  'eu.chainfire.supersu',
  'com.koushikdutta.superuser',
  'com.thirdparty.superuser',
  'com.yellowes.su',
  'com.koushikdutta.rommanager',
  'com.koushikdutta.rommanager.license',
  'com.dimonvideo.luckypatcher',
  'com.chelpus.lackypatch',
  'com.ramdroid.appquarantine',
  'com.ramdroid.appquarantinepro',
  'com.devadvance.rootcloak',
  'com.devadvance.rootcloakplus',
  'de.robv.android.xposed.installer',
  'com.saurik.substrate',
  'com.zachspong.temprootremovejb',
  'com.amphoras.hidemyroot',
  'com.amphoras.hidemyrootadfree',
  'com.formyhm.hiderootPremium',
  'com.formyhm.hideroot',
  'me.phh.superuser',
  'eu.chainfire.supersu.pro',
  'com.kingouser.com',
  'com.kingroot.kinguser',
  'com.kingo.root',
  'com.topjohnwu.magisk',
  'com.smedialink.oneclickroot',
  'com.zhiqupk.root.global',
  'com.alephzain.framaroot',
  'com.droi.adocker',
  'com.bly.dkplat',
  'com.by.chaose',
  'com.lbe.parallel',
  'com.excelliance.dualaid',
  'dkplugin.owm.jlk',
  'com.lody.virtual',
  'com.qihoo.magic',
];

// System features which don't exists of Emulators and can be used to detect
// them.
const systemFeatures = [
  'android.hardware.camera.flash',
  'android.hardware.nfc',
];

const PTRACE_TYPES = {
  0: 'PTRACE_TRACEME',
  1: 'PTRACE_PEEKTEXT',
  2: 'PTRACE_PEEKDATA',
  3: 'PTRACE_PEEKUSER',
  4: 'PTRACE_POKETEXT',
  5: 'PTRACE_POKEDATA',
  6: 'PTRACE_POKEUSER',
  7: 'PTRACE_CONT',
  8: 'PTRACE_KILL',
  9: 'PTRACE_SINGLESTEP',
  12: 'PTRACE_GETREGS',
  13: 'PTRACE_SETREGS',
  14: 'PTRACE_GETFPREGS',
  15: 'PTRACE_SETFPREGS',
  16: 'PTRACE_ATTACH',
  17: 'PTRACE_DETACH',
  18: 'PTRACE_GETFPXREGS',
  19: 'PTRACE_SETFPXREGS',
  24: 'PTRACE_SYSCALL',
  25: 'PTRACE_GET_THREAD_AREA',
  26: 'PTRACE_SET_THREAD_AREA',
  31: 'PTRACE_SYSEMU',
  32: 'PTRACE_SYSEMU_SINGLESTEP',
  33: 'PTRACE_SINGLEBLOCK',
  0x4200: 'PTRACE_SETOPTIONS',
  0x4201: 'PTRACE_GETEVENTMSG',
  0x4202: 'PTRACE_GETSIGINFO',
  0x4203: 'PTRACE_SETSIGINFO',
  0x4204: 'PTRACE_GETREGSET',
  0x4205: 'PTRACE_SETREGSET',
  0x4206: 'PTRACE_SEIZE',
  0x4207: 'PTRACE_INTERRUPT',
  0x4208: 'PTRACE_LISTEN',
  0x4209: 'PTRACE_PEEKSIGINFO',
  0x420a: 'PTRACE_GETSIGMASK',
  0x420b: 'PTRACE_SETSIGMASK',
  0x420c: 'PTRACE_SECCOMP_GET_FILTER',
  0x420d: 'PTRACE_SECCOMP_GET_METADATA',
  0x420e: 'PTRACE_GET_SYSCALL_INFO',
};

// Environment variables we want to hide
const badEnvVars = [
  'TANGBOX',         // IoC for VMOS emulator.
  'REDIRECT_SRC1',   // IoC for ParallelSpace
  'REDIRECT_DST1',   // ...
  'FORBID_SRC1',     // ...
  'WHITELIST_SRC1',  // ...
  // google3/ccc/abuse/droidguard/signals/ld_preload_signal.cc
  'LD_PRELOAD',
  'LD_LIBRARY_PATH',
];

// Mock some battery related values
const mockBatteryDetails = new Map([
  ['level', 55],
  ['temperature', 300],
  ['voltage', 4500],
]);

const DEFAULT_FRIDA_PORT = 27042;

// OpenGL constants
const GL_VENDOR = 0x1f00;
const GL_RENDERER = 0x1f01;

const RIVERA_MAGIC = 'r1v3r4';
const REPLACED_SUSPICIOUS_COMMAND = 'replaced_suspicious_command';

const REGEX_MAPS = new RegExp('^/proc(/.+)?/maps$', 'i');
const REGEX_SMAPS = new RegExp('^/proc(/.+)?/smaps$', 'i');
const REGEX_UNIX = new RegExp('^/proc(/.+)?/net/unix$', 'i');
const REGEX_PROC_STATUS = new RegExp('^/proc(/.+)?/status$', 'i');

// According to [Frida best practices](https://frida.re/docs/best-practices/)
// `allocUtf8String` is a recommended way to keep memory allocations alive.
const FAKE_PATH = Memory.allocUtf8String('/proc/self/n0tar34lp4th');
// hide properties from "getprop" command
// getprop | sed -e '/^\[xxx\]/s/.*/abc/g' - if starts with [xxx] replace line
// using magic value in order to prevent recursive changes.
let HIDE_FROM_GETPROP =
    `getprop | sed -e \'s/${RIVERA_MAGIC}/${RIVERA_MAGIC}/g`;
// props pattern: [wlan.driver.status]: [ok]
for (let [key, value] of Object.entries(mockedProps)) {
  const startsWith = `\[${key}\]:`;
  const replaceCmd = ` /^${startsWith}/s/.*/\[${key}\]: \[${value}\]}`;
  HIDE_FROM_GETPROP += replaceCmd;
}
HIDE_FROM_GETPROP += '\'';

const HIDE_FROM_READING_STR = /frida-agent|frida|gmain|linjector|emulator/gi;

// This is the default path for Marmot. In a non-Marmot environment, we should
// change it to another directory.
let scriptDir = '/data/local/tmp/r1v3ra/';

let androidApiVersion = 0;

/**
 * Creates the mock file.
 *
 * If generating mock file failed, return the original file path.
 *
 * @param {string} targetFile
 * @param {string} destDir
 * @param {string} destFileName
 *
 * @return {string} mock file path.
 */
function mockFile(targetFile, destDir, destFileName) {
  log(`mock file ${targetFile}`);
  const runtime = Java.use('java.lang.Runtime');
  const cmd = `sh ${scriptDir}${Process.id}.sh ${targetFile} ${destDir} ${
      destFileName}`;
  log('Running ' + cmd);
  runtime.getRuntime().exec(cmd).waitFor();
  const fileClass = Java.use('java.io.File');
  const redirectedPath = `${destDir}/${destFileName}`;
  const redirectedFile = fileClass.$new(redirectedPath);
  if (!redirectedFile.exists()) {
    log(`Failed to mock file: ${redirectedPath}`);
    return targetFile;
  } else {
    return redirectedPath;
  }
}

/**
 * Modifies a Java list object, removing all elements where predicate returns
 * true.
 * @param {!java.util.List<T>} jList Java list object
 * @param {function(T): boolean} predicate A predicate function
 * @return {!java.util.List<T>} modified jList
 * @template T
 */
function filterJavaList(jList, predicate) {
  for (let i = jList.size() - 1; i >= 0; i--) {
    if (predicate(jList.get(i))) {
      jList.remove(i);
    }
  }
  return jList;
}

/**
 * Returns a string with random numbers.
 * NOTE: if Math.random() generated number is not large enough
 * it will append with zeros.
 *
 * @param {number} stringLength length of a generated string
 * @param {number=} radix Specifies a radix for converting numeric values to
 *     strings.
 * @return {string} Random string which contain 'num' numbers
 */
function getRandomNumberString(stringLength, radix = 10) {
  return (Math.random().toString(radix).padEnd(stringLength, '0'))
      .slice(2, stringLength + 2);
}

/**
 * Checks if the string is suspicious.
 * @param {string} targetString
 * @return {boolean} Returns true if the string is suspicious
 */
function isSuspiciousString(targetString) {
  targetString = targetString.toLowerCase();
  for (const str of suspiciousStrings) {
    if (targetString.includes(str)) {
      return true;
    }
  }

  return false;
}

/**
 * Checks if the file/dir must exist.
 * @param {string} originalPath file or directory path
 * @return {string} Returns replaced string for a specific path
 */
function changeIfMandatoryPath(originalPath) {
  const pathLower = originalPath.toLowerCase();
  if (alwaysExistsDirs.includes(pathLower)) {
    return '/proc/self';
  }

  return originalPath;
}

/**
 * Interceptor onEnter callback, whose parameters are an array of the
 * intercepted method call's parameters, cast to strings
 * @typedef {function(Array<string>)} onEnterHandler
 */

/**
 * Interceptor onLeave callback,
 * whose parameter is the return value after the call
 * has been returned and intercepted.
 * @typedef {function(*): unknown} onLeaveHandler
 */


/**
 * Intercepts specified method and registers corresponding callbacks
 * for OnEnter and onLeave events.
 * @param {string} moduleName name of a module
 * @param {string} methodName name fo a method we want to intercept
 * @param {!onEnterHandler} onEnter callback to handle onEnter event
 * @param {!onLeaveHandler=} onLeave callback to handle onLeave event
 */
function interceptCall(
    moduleName, methodName, onEnter, onLeave = (retValue) => {}) {
  Interceptor.attach(Module.findExportByName(moduleName, methodName), {
    onEnter,
    onLeave,
  });
}


/** Forces 'strstr' to return 0, if the string is suspicious. */
const interceptStrstr = () => {
  const strstrOnEnter = (args) => {
    const needle = Memory.readCString(args[1]).toLowerCase();
    this.bypass = isSuspiciousString(needle);

    if (this.bypass) {
      const haystack = Memory.readCString(args[0]).toLowerCase();
      log(`strstr string: ${haystack}:${needle}`);
    }
  };
  const strstrOnExit = (returnValue) => {
    if (this.bypass === true) {
      returnValue.replace(0);
    }
  };
  interceptCall(/* moduleName= */ null, 'strstr', strstrOnEnter, strstrOnExit);
};


/**
 * Intercepts 'contains' to hide existence of Frida.
 * Forces 'contains' to return 'false', if the string is suspicious.
 */
function interceptJavaContains() {
  const javaLang = Java.use('java.lang.String');
  javaLang.contains.implementation = function(chrs) {
    // Bypass Frida string checks
    const targetStr = chrs.toString();
    if (isSuspiciousString(targetStr)) {
      return false;
    }

    return this.contains.call(this, chrs);
  };
}

/**
 * Intercepts 'TelephonyManager' class to bypass Anti-Emulator check.
 */
function interceptTelephonyManager() {
  const telManager = Java.use('android.telephony.TelephonyManager');
  // Operator name check
  telManager.getNetworkOperatorName.overload().implementation = function() {
    log('Checking operator name.');
    return 'Real Mobile';
  };
  // Phone number check
  telManager.getLine1Number.overload().implementation = function() {
    log('Checking the current phone number');
    return getRandomNumberString();
  };

  // SIM card related checks
  telManager.getSimCountryIso.overload().implementation = function() {
    log('Checking SimCountryIso');
    return 'us';
  };
  telManager.getSimOperator.overload().implementation = function() {
    log('Checking SimOperator');
    return '310261';  // MCC+MNC (mobile country code + mobile network code)
  };
  telManager.getSimOperatorName.overload().implementation = function() {
    log('Checking SimOperatorName');
    return 'T-Mobile';
  };
  telManager.getSimState.overload().implementation = function() {
    log('Checking SimState');
    return 5;  // SIM_STATE_READY
  };
}

/**
 * Bypasses checks if default Frida port is used.
 */
function bypassPortCheck() {
  const netAddr = Java.use('java.net.InetSocketAddress');
  netAddr.getPort.overload().implementation = function() {
    const port = this.getPort.call(this);
    // default frida port: 27042
    return (port == DEFAULT_FRIDA_PORT) ? port + 1 : port;
  };
}


/**
 * Change Android.os.Build field values to bypass Emulator checks.
 */
function setAndroidBuildFields() {
  const andBuild = Java.use('android.os.Build');

  andBuild.BOARD.value = 'real_board';
  andBuild.BRAND.value = 'real_brand';
  andBuild.DEVICE.value = 'real_device';
  andBuild.HARDWARE.value = 'real_hardware';
  andBuild.PRODUCT.value = 'real_product';
  andBuild.FINGERPRINT.value =
      'oneplus/bacon/A0001:10.0.1/MHC19Q/ZNH2KAS1KN:user/release-keys';
  andBuild.MODEL.value = 'A0001';
  andBuild.MANUFACTURER.value = 'OnePlus';
  andBuild.TAGS.value = 'release-keys';
  andBuild.TYPE.value = 'user';
  andBuild.USER.value = 'jenkins';
  andBuild.DISPLAY.value = 'R34LX.9734F42U1ARXX';
}

/**
 * Bypass system property checks (JAVA).
 */
function interceptSystemPropChecks() {
  const sysProp = Java.use('android.os.SystemProperties');
  sysProp.get.overload('java.lang.String').implementation = function(propName) {
    const propNameLower = propName.toLowerCase();
    const mockedValue = mockedProps[propNameLower];
    if (mockedValue !== undefined) {
      log(`Checking system property: ${propName} => "${mockedValue}"`);
      return mockedValue;
    }
    // Bypass Qemu checks
    const isQemuCheck = propNameLower.toString().includes('qemu');
    if (isQemuCheck) {
      log(`Checking system property: ${propName}`);
      return this.get.call(this, 'there.is.n0.such.pr0p');
    }

    // Hide values
    let shouldHide = false;
    needToHidePropStrs.forEach(function(prop) {
      if (propNameLower.includes(prop)) {
        log(`Checking system property: ${propName}`);
        shouldHide = true;
        return;
      }
    });
    if (shouldHide) {
      return this.get.call(this, 'there.is.n0.such.pr0p');
    }

    return this.get.call(this, propName);
  };
}

/**
 * Checks if the path should be redirected, if so returns a new path
 * @param {string} pathName file path to check
 * @return {string} Returns redirected path or ''
 */
function getRedirectedPath(pathName) {
  pathName = pathName.toLowerCase();
  const targetDir = `${scriptDir}${Process.id}`;
  if (REGEX_MAPS.test(pathName)) {
    return mockFile(`/proc/${Process.id}/maps`, targetDir, 'maps');
  } else if (REGEX_SMAPS.test(pathName)) {
    return mockFile(`/proc/${Process.id}/smaps`, targetDir, 'smaps');
  } else if (pathName.toLowerCase() === '/proc/cpuinfo') {
    return mockFile('/proc/cpuinfo', targetDir, 'cpuinfo');
  } else if (pathName.toLowerCase() === '/proc/net/unix') {
    return mockFile(`/proc/net/unix`, targetDir, 'unix');
  } else if (REGEX_UNIX.test(pathName)) {
    return mockFile(`/proc/${Process.id}/net/unix`, targetDir, 'net_unix');
  } else if (pathName.toLowerCase() === '/system/build.prop') {
    return mockFile('/system/build.prop', targetDir, 'build.prop');
  }

  return '';
}

/**
 * Checks if the path should be hidden.
 * @param {string} pathName file path to check
 * @return {boolean} Returns true if the file path should be hidden
 */
function shouldHidePath(pathName) {
  pathName = pathName.toLowerCase();
  for (const rootBin of rootBinaries) {
    if (pathName.endsWith(`/${rootBin}`)) {
      log(`root binary check: ${pathName}`);
      return true;
    }
  }

  if (pathName.includes('frida')) {
    log(`frida check: ${pathName}`);
    return true;
  }

  if (pathName.includes('qemu')) {
    log(`qemu check: ${pathName}`);
    return true;
  }

  // This is the file written by tachikomadroid.
  if (new RegExp('^/storage/emulated/\\d+/results$').test(pathName)) {
    return false;
  }

  const DRIVERS_PATH = '/proc/tty/drivers';
  if (pathName === DRIVERS_PATH) {
    log(`Trying to open a file: ${pathName}`);
    return true;
  } else if (REGEX_PROC_STATUS.test(pathName)) {
    // /proc/self/status is used to check TracerPid
    // TracerPid is set when the process is ptrace-debugged
    log(`Open file: ${pathName}`);
  }

  // Hide a path if it includes strings from 'needToReplaceFilePaths'
  for (const filePathStr of needToReplaceFilePaths) {
    if (pathName.includes(filePathStr)) {
      log(`Checking suspicious file path: ${pathName}`);
      return true;
    }
  }

  return false;
}

/**
 * Hides a suspicious file path for *stat functions.
 * @param {!Array<*>} args arguments of *stat function
 */
const hideFilePathStatOnEnter = (args) => {
  const filePath = Memory.readCString(ptr(args[0]));
  if (shouldHidePath(filePath)) {
    args[0] = FAKE_PATH;
  }
};

/** Intercept 'readlinkat' to hide Frida presence. */
const interceptReadlinkat = () => {
  const handleReadlinkatOnEnter = (args) => {
    this.bufPtr = args[2];
  };
  const handleReadlinkatOnLeave = (returnValue) => {
    // On error, -1 is returned
    if (returnValue !== -1) {
      const filePath = Memory.readCString(ptr(this.bufPtr));
      if (shouldHidePath(filePath)) {
        log(`[readlinkat] path: ${filePath}`);
        returnValue.replace(-1);
      }
    }
  };
  interceptCall(
      null, 'readlinkat', handleReadlinkatOnEnter, handleReadlinkatOnLeave);
};


/**
 * Hides from file path related checks.
 * @param {!Array<string>} args arguments of open function
 * @param {!int} index index of arguments we need to process
 */
const handleOpenInternal = (args, index) => {
  const pathName = Memory.readCString(ptr(args[index]));
  // Avoid intercepting mocked files
  if (pathName.includes(RIVERA_MAGIC)) return;

  // Feed the app with modifed files if necessary.
  const redirectedPath = getRedirectedPath(pathName);
  if (redirectedPath !== '') {
    log(`[open] redirect to: ${redirectedPath}`);
    // Recommended way to prevent GC of the newly allocated memory (using
    // this)
    const newPath = Memory.allocUtf8String(redirectedPath);
    this.newPath = newPath;
    args[index] = newPath;
    return;
  }

  const mandatoryPath = changeIfMandatoryPath(pathName);
  if (mandatoryPath !== pathName) {
    const newPath = Memory.allocUtf8String(mandatoryPath);
    this.newPath = newPath;
    args[index] = newPath;
    return;
  }

  if (shouldHidePath(pathName)) {
    args[index] = FAKE_PATH;
  }
};

/**
 * Hides paths when calling open
 * @param {!Array<string>} args arguments of open call
 */
const handleOpenOnEnter = (args) => handleOpenInternal(args, 0);

/**
 * Hides paths when calling openat
 * @param {!Array<string>} args arguments of openat call
 */
const handleOpenAtOnEnter = (args) => {
  handleOpenInternal(args, 1);
};

/**
 * Hides paths when calling faccessat
 * @param {!Array<string>} args arguments of faccessat call
 */
const handleFaccessAtOnEnter = (args) => {
  handleOpenInternal(args, 1);
};

/**
 * Intercepts UsageStatsManager to hide presence of Emulator related packages.
 * @return {!List<!UsageStats>} Returns application usage stats (Java object)
 */
function interceptUsageStatsManager() {
  const usageMgr = Java.use('android.app.usage.UsageStatsManager');
  usageMgr.queryUsageStats.implementation = function(
      intervalType, beginTime, endTime) {
    const appList =
        this.queryUsageStats.call(this, intervalType, beginTime, endTime);
    return filterJavaList(appList, (appObj) => {
      const app = Java.cast(appObj, Java.use('android.app.usage.UsageStats'));
      return app.getPackageName().toLowerCase().includes('emulat');
    });
  };
}

/**
 * ApplicationPackageManager - can be used to get details about apps.
 */
function interceptPM() {
  const mockGetPackageInfo = function(packageName, flags) {
    let currentName = packageName;
    if (currentName === null) {
      // sometimes $packageName under Frida is null and causes to crash an app
      currentName = '';
    }
    if (typeof currentName !== 'string' || currentName.length === 0) {
      return this.getPackageInfo.call(this, currentName, flags);
    }
    if (rootPackages.indexOf(currentName.toLowerCase()) > -1) {
      log(`root check for package: ${currentName}`);
      currentName = 'f4ke.package.name.to.byp4ss.check';
    }
    return this.getPackageInfo.call(this, currentName, flags);
  };

  const mockInstallerPackage = function(packageName) {
    log('Bypassing check for getInstallerPackageName');

    // Throws an exception if a package doesn't exist,
    // helps to don't return 'vending' string when there is no the app
    // installed.
    this.getInstallerPackageName.call(this, packageName);

    return 'com.android.vending';
  };

  const mockInstalledApplications = function(flag) {
    const installedApps = this.getInstalledApplications.call(this, flag);

    // Interact JAVA classes from JS
    // Hide apps with 'emulat' in their names/packagenames
    return filterJavaList(
        installedApps,
        (app) => app.toString().toLowerCase().includes('emulat'));
  };

  const mockInstalledPackages = function(flag) {
    const installedApps = this.getInstalledPackages.call(this, flag);

    // Interact JAVA classes from JS
    // Hide apps with 'emulat' in their names/packagenames
    return filterJavaList(
        installedApps,
        (app) => app.toString().toLowerCase().includes('emulat'));
  };

  const mockHasSystemFeature = function(featureStr, ver = -1) {
    let result = ver !== -1 ? this.hasSystemFeature(featureStr, ver) :
                              this.hasSystemFeature(featureStr);

    if (systemFeatures.includes(featureStr)) {
      log(`hasSystemFeature called: ${featureStr}`);
      return true;
    }

    return result;
  };

  const mockQueryIntentActivities = function(intent, flags) {
    log('PackageManager.queryIntentActivities is called');
    const infoList = this.queryIntentActivities.call(this, intent, flags);
    // We can hide activities by removing them from the `infoList`
    // In current environment of Google Emulators/Marmot we have nothing to
    // hide. We may need to exclude some activities in the future.

    return infoList;
  };

  // ApplicationPackageManager
  const appPackageManager = Java.use('android.app.ApplicationPackageManager');
  appPackageManager.getPackageInfo.overload('java.lang.String', 'int')
      .implementation = mockGetPackageInfo;
  appPackageManager.getInstallerPackageName.implementation =
      mockInstallerPackage;
  appPackageManager.getInstalledApplications.implementation =
      mockInstalledApplications;
  appPackageManager.getInstalledPackages.overload('int').implementation =
      mockInstalledPackages;
  appPackageManager.hasSystemFeature.overload('java.lang.String')
      .implementation = mockHasSystemFeature;
  // Android 6 (SDK 23) doesn't have the API.
  if (androidApiVersion > 23) {
    appPackageManager.hasSystemFeature.overload('java.lang.String', 'int')
        .implementation = mockHasSystemFeature;
  }
  appPackageManager.queryIntentActivities.implementation =
      mockQueryIntentActivities;

  // PackageManager
  const packageManager = Java.use('android.content.pm.PackageManager');
  packageManager.getPackageInfo.overload('java.lang.String', 'int')
      .implementation = mockGetPackageInfo;
  packageManager.getInstallerPackageName.implementation = mockInstallerPackage;
  packageManager.getInstalledApplications.implementation =
      mockInstalledApplications;
  packageManager.getInstalledPackages.overload('int').implementation =
      mockInstalledPackages;
  packageManager.hasSystemFeature.overload('java.lang.String').implementation =
      mockHasSystemFeature;
  if (androidApiVersion > 23) {
    packageManager.hasSystemFeature.overload('java.lang.String', 'int')
        .implementation = mockHasSystemFeature;
  }
  packageManager.queryIntentActivities.implementation =
      mockQueryIntentActivities;
}


/**
 * Changes a command if it's suspicious.
 * @param {string} cmd Command
 * @return {string} modified command
 */
function replaceCmd(cmd) {
  let newCmd = cmd;
  // We don't replace the command if the command is used to generate mock files.
  if (cmd.includes(scriptDir)) {
    log(`Allow command: ${cmd}`);
    return cmd;
  }
  // All processed commands should contain magic value
  if (cmd.includes(RIVERA_MAGIC)) return cmd;

  // Hide applications from PS
  // r1v3r4 - magic value to prevent recursive change.
  newCmd = newCmd.replace(
      'ps', `ps -A | grep -Ev 'adbd|logcat|grep|google.corp|${RIVERA_MAGIC}'`);


  newCmd = newCmd.replace(/mount|build.prop|id|sh/gi, function() {
    log(`Replace suspicious command: ${cmd}`);
    return 'grep';
  });


  const rmSuRegex = new RegExp('\\s?(rm|su)($|\\s)', 'i');
  if (rmSuRegex.test(cmd)) {
    log(`Replace suspicious command: ${cmd}`);
    return REPLACED_SUSPICIOUS_COMMAND;
  }

  if (cmd.includes('getprop')) {
    log(`Hide system properties: ${cmd}`);
    // HIDE_FROM_GETPROP contains magic value to prevent recursive changes.
    newCmd = newCmd.replace('getprop', HIDE_FROM_GETPROP);
  }

  return newCmd;
}

/**
 * Handles and modifies commands which can be used to detect analysis
 * environment.
 * @param {!Array<string>} args arguments of a target function
 */
const checkCommandOnEnter = (args) => {
  const cmd = args[0].readUtf8String();
  const newCmd = replaceCmd(cmd);
  // Some apps crash when we use alloc* functions, write* rewrites memory in
  // place, hence we may cause a buffer overflow. seems like write* work with
  // all problematic apps.
  // TODO(b/228936942): This is a temporary fix
  args[0].writeUtf8String(newCmd);
};

/**
 * Intercepts libs!ptrace function to log details about ptrace usage
 * as an anti-debug trick.
 * Currently, bypassing such trick is not implemented due to different expected
 * behavior by different apps.
 * @param {!Array<string>} args arguments of ptrace call
 */
const ptraceOnEnter = (args) => {
  const requestType = PTRACE_TYPES[parseInt(args[0])];
  const pidHex = args[1];
  const pidDec = parseInt(pidHex, 16);
  log(`ptrace called: PID: ${pidHex} (${pidDec}) with request: ${
      requestType ? requestType : args[0]}`);
};

/**
 * Intercepts dlsym call and bypasses trick used by Bernhard Mueller
 * in this post:
 * https://web.archive.org/web/20190215201511/http://www.vantagepoint.sg/blog/88-anti-debugging-fun-with-android-art
 *
 * @param {!Array<string>} args arguments of dlsym function
 */
const dlsymOnEnter = (args) => {
  const funcName = args[1].readUtf8String();
  if (funcName.toLowerCase().includes('jdwpadbstate')) {
    log('hide jdwpadbstate function');
    args[1].writeUtf8String('n0tFunct10n');
  }
};

/**
 * Intercepts OpenGL functions to bypass or change Emulator detection tricks.
 * In this case I prefer to include handlers inside the interceptGL function,
 * since we need to access this.bypass field for both handlers.
 */
const interceptGL = () => {
  const glGetStringOnEnter = (args) => {
    const enumVal = parseInt(args[0]);
    this.bypass = false;
    if (enumVal === GL_VENDOR || enumVal === GL_RENDERER) {
      log('OpenGL ' + (enumVal === GL_VENDOR ? 'GL_VENDOR' : 'GL_RENDERER') +
          ' checked.');
      this.bypass = true;
    }
  };
  const glGetStringOnLeave = (returnValue) => {
    if (this.bypass === true) {
      const fakeStr = Memory.allocUtf8String('real GPU details');
      returnValue.replace(fakeStr);
    }
  };
  interceptCall(
      /* moduleName= */ null, 'glGetString', glGetStringOnEnter,
      glGetStringOnLeave);
};

/**
 * Intercepts android.hardware.Sensor class
 * and bypass functions which can be used to detect an Emulator.
 */
function interceptSensor() {
  const sensorClass = Java.use('android.hardware.Sensor');
  sensorClass.getVendor.implementation = function() {
    let currentVendor = this.getVendor.call(this).toLowerCase();
    currentVendor = currentVendor.replace(
        /open|source|emulator|google|aosp|goldfish/gi, function() {
          log(`Replace a sensor's vendor name: ${currentVendor}`);
          return getRandomNumberString(5, /* radix= */ 36);
        });

    return currentVendor;
  };

  sensorClass.getName.implementation = function() {
    let currentName = this.getName.call(this).toLowerCase();
    currentName = currentName.replace(
        /open|source|emulator|google|aosp|goldfish/gi, function() {
          log(`Replace a sensor name: ${currentName}`);
          return getRandomNumberString(5, /* radix= */ 36);
        });

    return currentName;
  };
}

/**
 * Replaces suspicious strings lines
 * @param {!srting} lineStr string to replace
 * @return {string} string with replaced content
 */
const replaceSuspiciousLines = (lineStr) => {
  return lineStr.trim().toLowerCase().replace(HIDE_FROM_READING_STR, () => {
    log(`getline - Replace suspicious string: ${lineStr}`);
    return getRandomNumberString(5, /* radix= */ 36);
  });
};

/**
 * Intercepts 'getline' to bypass Emulator checks done via reading a
 * file content.
 * Hides existence of suspicious libraries (/proc/self/maps),
 * example: /data/local/tmp/re.frida.server/frida-agent-64.so =>
 * /data/local/tmp/re.2n86x.server/2n86x-agent-64.so
 */
const interceptGetline = () => {
  const getlineOnEnter = (args) => {
    this.currPtr = ptr(Memory.readU64(args[0]));
  };
  const getlineOnLeave = (returnValue) => {
    if (returnValue <= 0) return;
    const lineStr = Memory.readCString(this.currPtr);
    if (lineStr !== null) {
      const currentLine = replaceSuspiciousLines(lineStr);
      Memory.writeUtf8String(this.currPtr, currentLine);
    }
  };

  interceptCall(
      /* moduleName= */ null, 'getline', getlineOnEnter, getlineOnLeave);
};



/**
 * Intercepts 'fgets' to bypass Emulator checks done via reading a
 * file content.
 */
function interceptFgets() {
  // Due to Interceptor.attach somehow fails for fgets we use an alternative way
  // to intercept the call: Interceptor.replace
  const fgetsPtr = Module.findExportByName(/* moduleName= */ null, 'fgets');
  const fgets = new NativeFunction(fgetsPtr, 'pointer', [
    'pointer',
    'int',
    'pointer',
  ]);
  const newFgets = new NativeCallback(function(buffer, size, fp) {
    const returnValue = fgets(buffer, size, fp);
    const bufStr = buffer.readCString();
    const newStr = replaceSuspiciousLines(bufStr);
    buffer.writeUtf8String(newStr);
    return returnValue;
  }, 'pointer', ['pointer', 'int', 'pointer']);

  Interceptor.replace(fgetsPtr, newFgets);
}

/**
 * Intercepts BT.getDefaultAdapter to return fake handle if there is none.
 */
function interceptBtCheck() {
  const btManager = Java.use('android.bluetooth.BluetoothManager');

  btManager.getAdapter.implementation = function() {
    log('BluetoothManager.getAdapter is called');

    const returnValue = this.getAdapter.call(this);

    return returnValue;
  };

  // On JELLY_BEAN_MR1 and below we need to use the static getDefaultAdapter()
  // method instead.
  const androidBT = Java.use('android.bluetooth.BluetoothAdapter');
  androidBT.getDefaultAdapter.implementation = function() {
    log('BluetoothAdapter.getDefaultAdapter is called');

    const returnValue = this.getDefaultAdapter.call(this);
    // It would be better if we could mock BT adapter

    return returnValue;
  };
}

/** Intercepts ActivityManager to hide specific process names. */
function interceptRunningAppProcesses() {
  const activityManager = Java.use('android.app.ActivityManager');

  activityManager.getRunningAppProcesses.implementation = function() {
    log('activityManager.getRunningAppProcesses is called');
    // If necessary, filter out suspicious process details.
    return this.getRunningAppProcesses.call(this);
  };

  // For APIs older than 26
  if (androidApiVersion >= 26) return;
  activityManager.getRunningServices.implementation = function(maxNum) {
    log('activityManager.getRunningServices is called');
    // we can use filterJavaList to remove packages if necessary
    return this.getRunningServices.call(this, maxNum);
  };
}

/** Intercepts ActivityManager.isUserAMonkey to bypass debugging checks. */
function interceptIsUserAMonkey() {
  const activityManager = Java.use('android.app.ActivityManager');
  activityManager.isUserAMonkey.implementation = function() {
    log('activityManager.isUserAMonkey is called');
    return false;
  };
}

/** Intercept functions from Intent in order to hide suspicious details. */
function interceptIntent() {
  const intentClass = Java.use('android.content.Intent');
  // getIntExtra
  intentClass.getIntExtra.implementation = function(name, defaultValue) {
    const actionName = this.getAction();
    const intExtra = this.getIntExtra.call(this, name, defaultValue);
    // intercept BATTERY_CHANGED
    if (actionName === 'android.intent.action.BATTERY_CHANGED') {
      log(`Battery details checked: ${name}`);
      if (mockBatteryDetails.has(name)) return mockBatteryDetails.get(name);
    }
    return intExtra;
  };
  // getBooleanExtra
  intentClass.getBooleanExtra.implementation = function(name, defaultValue) {
    const actionName = this.getAction();
    // Assumtion is that if USB is connected it's under an analysis environment
    if (actionName === 'android.hardware.usb.action.USB_STATE' &&
        name === 'connected') {
      log(`Checked if an USB device is connected`);
      return false;
    }

    return this.getBooleanExtra.call(this, name, defaultValue);
  };
}

/**
 * Intercept functions from LocationManager in order to hide suspicious
 * details.
 */
function interceptLocationManager() {
  const locationManager = Java.use('android.location.LocationManager');

  if (androidApiVersion < 28) return;

  locationManager.getGnssHardwareModelName.implementation = function() {
    log(`LocationManager.getGnssHardwareModelName called`);
    // Under an Android Emulator the value is
    // "Android Studio Emulator GPS"
    const hardwareModelName = this.getGnssHardwareModelName.call(this);
    return hardwareModelName.includes('mulator') ? 'Model Name Unknown' :
                                                   hardwareModelName;
  };
}

/**
 * Hides an Emulator related environment variables.
 * @param {!Array<string>} args arguments of getenv function
 */
const getenvOnEnter = (args) => {
  const varName = Memory.readCString(ptr(args[0]));
  if (badEnvVars.includes(varName)) {
    log(`Checking environment variable: ${varName}`);
    args[0] = FAKE_PATH;
  }
};

/**
 *  Starts functions to bypass anti-analysis checks.
 */
function rivera() {
  log('Rivera - Bypass Anti-Analysis Checks');

  setAndroidBuildFields();

  interceptStrstr();
  interceptJavaContains();

  // Bypass anti-Emulator checks
  interceptTelephonyManager();
  interceptSystemPropChecks();

  // Frida default port check
  bypassPortCheck();

  interceptUsageStatsManager();

  // Intercept file open syscalls to bypass checks
  interceptCall(/* moduleName= */ null, 'open', handleOpenOnEnter);
  interceptCall(/* moduleName= */ null, 'openat', handleOpenAtOnEnter);
  interceptCall(/* moduleName= */ null, 'faccessat', handleFaccessAtOnEnter);

  interceptReadlinkat();

  // Intercept *stat syscalls to bypass checks
  interceptCall(/* moduleName= */ null, 'lstat', hideFilePathStatOnEnter);
  interceptCall(/* moduleName= */ null, 'stat', hideFilePathStatOnEnter);

  // Intercept ApplicationPackageManager
  interceptPM();

  // Intercept system call
  // https://man7.org/linux/man-pages/man3/system.3.html
  interceptCall(/* moduleName= */ null, 'system', checkCommandOnEnter);

  // Intercept execve
  // Other variants of exec are layered on top of execve
  // https://www.man7.org/linux/man-pages/man2/execve.2.html
  interceptCall(/* moduleName= */ null, 'execve', checkCommandOnEnter);

  // Intercept ptrace
  interceptCall(/* moduleName= */ null, 'ptrace', ptraceOnEnter);

  // Intercept dlsym
  interceptCall(/* moduleName= */ null, 'dlsym', dlsymOnEnter);

  // Intercept OpenGL
  interceptGL();

  // Intercept Sensor data
  interceptSensor();

  // Intercept reading operations
  interceptFgets();
  interceptGetline();

  // intercept getenv call
  interceptCall(/* moduleName= */ null, 'getenv', getenvOnEnter);

  // Mock Bluetooth adapter
  interceptBtCheck();

  interceptRunningAppProcesses();

  interceptIsUserAMonkey();

  interceptIntent();

  interceptLocationManager();
}

/**
 * Sends a log string to logcat.
 *
 * We log all messages as error, the highest log level, to improve the chances
 * of the message being in the output.
 * @see https://developer.android.com/reference/android/util/Log.
 *
 * @param {string} logStr
 */
function log(logStr) {
  const androidLog = Java.use('android.util.Log');
  androidLog.e('rivera', logStr);
}

/**
 * Chooses a dir to save the bash script.
 *
 * Default path is "scriptDir". If the script fails to use the default path, or
 * if the script is launched by load.py, it will be replaced with application's
 * local folder: /data/data/package.name/r1v3ra.
 */
 function initScriptDir() {
  const fileClass = Java.use('java.io.File');
  const folder = fileClass.$new(scriptDir);
  if (folder.exists() || folder.mkdir()) {
    return;
  }
  const activityThreadClass = Java.use('android.app.ActivityThread');
  const pkgName = activityThreadClass.currentPackageName();
  scriptDir = `/data/data/${pkgName}/r1v3ra/`;
  fileClass.$new(scriptDir).mkdir();
}
/**
 * Prepare shell script for generating mock files.
 *
 * To generate mocked files, we have to read the target files first. But we have
 * instrumented file reading operations. Reading target files will invoke the
 * operation to mock files, causing recursion.
 *
 * In the original script, we send the file names to the python code and ask
 * python code to prepare the mocked files. To decouple from python code, we use
 * a bash script to generate the mocked files. Reading target files will happen
 * in a child process, which is not instrumented.
 *
 */
function initBashScript() {
  initScriptDir();
  // The 'sed' is buggy in Android M. Only use 'sed' for deleting lines.
  const script = `
mkdir -p $2
cp $1 $2/$3.tmp
sed "/frida/d;/virtual/d;/adbd/d;/jdwp/d;/debug/d" $2/$3.tmp > $2/$3.tmp.2
rm $2/$3
while read -r line; do
    line=\${line/userdebug/user}
    line=\${line/test-keys/release-keys}
    line=\${line/sdk_google/R34LX.9734F42U1ARXX}
    line=\${line/emulator/real_device}
    line=\${line/generic/r3al}
    line=\${line/google/oneplus}
    line=\${line/Android SDK/A0001}
    line=\${line/vme/A0001}
    echo "$line" >> $2/$3
done < "$2/$3.tmp.2"
`;
  const foutstream = Java.use('java.io.FileOutputStream');
  const filePath = scriptDir + Process.id + '.sh';
  const fos = foutstream.$new(filePath);
  const string = Java.use('java.lang.String');
  const msgString = string.$new(script);
  const contentBytes = msgString.getBytes();
  fos.write(contentBytes, 0, contentBytes.length);
  fos.close();
}

/**
 * Prints details about a process and calls the main function('rivera').
 */
function start() {
  log(`PID: ${Process.id}`);
  androidApiVersion = Java.use('android.os.Build$VERSION').SDK_INT.value;

  try {
    initBashScript();
    rivera();
  } catch (err) {
    log(`Script failed: ${err.message}`);
  }
}

// Entry Point
if (Java.available) {
  Java.performNow(start);
}