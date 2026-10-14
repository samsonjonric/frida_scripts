/* FG SCRIPT. Please keep this line. */
/**
 * Log to logcat.
 * @param {*} logStr - the log snippet
 */
function logToLogcat(logStr) {
  const androidLog = Java.use('android.util.Log');
  androidLog.i('FG', logStr);
}

/**
 * Log a failure to disk.
 * @param {*} message - the failure message
 */
function logFailureToDisk(message) {
  const SAVE_DIRECTORY = '/data/local/tmp/fgout/';
  const ERROR_LOG = 'widevine_errors.log';
  let foutstream = Java.use('java.io.FileOutputStream');
  let filePath = SAVE_DIRECTORY + ERROR_LOG;
  let fos = foutstream.$new(filePath, true);
  let string = Java.use('java.lang.String');
  let msgString =string.$new(message + "\n");
  let contentBytes = msgString.getBytes();
  fos.write(contentBytes, 0, contentBytes.length);
  fos.close();
}

/**
 * Hook the native function
 * @param {*} modname - module name
 * @param {*} fname - function name
 */
function hookGetPropertyByteArray(modname, fname) {
  let e = Module.findExportByName(modname, fname);
  if (!e) {
    let message =
        'getPropertyByteArray function is no longer at the same address!';
    logToLogcat(message);
    logFailureToDisk(message);
    return;
  }

  logToLogcat(`found ${fname} at ${e}`);
  Interceptor.attach(e, {
    onEnter(args) {
      try {
        let property = Memory.readCString(convertFromString8(args[1]));
        if (property == 'deviceUniqueId') {
          logToLogcat(`App trying to access the [${property}] property`);
        }
      } catch (e) {
        let message = 'Exception when hooking getPropertyByteArray: ' + e;
        logToLogcat(message);
        logFailureToDisk(message);
        return;
      }
    }
  });
}

/**
 * the DRM APIs use the deprecated android::String8 intsead of std::string or
 * char* and String8 has no public functionality to convert it to a char* so we
 * made a change to the image in libutils.so to expose this function to convert
 * from String8 to something readable by Frida
 *
 * @param {*} string8Arg
 * @return {!NativePointer} to a char*
 */
function convertFromString8(string8Arg) {
  let address = Module.findExportByName(
      'libutils.so',
      '_ZN7android12String8Utils30string8UtilsConvertFromString8EPKNS_7String8E');
  if (!address) {
    let message =
        'string8UtilsConvertFromString8 function is no longer at the same address!';
    logToLogcat(message);
    logFailureToDisk(message);
    return;
  }

  let convertFunc = new NativeFunction(address, 'pointer', ['pointer']);
  let ret = convertFunc(ptr(string8Arg));
  return ptr(ret);
}

// After looking through all the native libs in /system/lib for
// .*getPropertyByteArray.*, this func seemed like the best candidate that was
// hookable. Note that we cannot hook the top level JNI functions called by
// MediaDrm.java because Frida Gadget initializes after they are already
// registered in ART.
//
// https://cs.android.com/android/platform/superproject/+/master:frameworks/av/drm/libmediadrm/DrmHal.cpp;bpv=1;bpt=1;l=193?q=file:libmediadrm%20getPropertyByteArray%20file:Hal&ss=android%2Fplatform%2Fsuperproject&gsn=getPropertyByteArray&gs=KYTHE%3A%2F%2Fkythe%3A%2F%2Fandroid.googlesource.com%2Fplatform%2Fsuperproject%3Flang%3Dc%252B%252B%3Fpath%3Dframeworks%2Fav%2Fdrm%2Flibmediadrm%2FDrmHal.cpp%23G3YcRoiqyPSxInqQmE5mlBnJLUV4aQeWLhwFZSv5H2Q
// c++filt
// _ZNK7android6DrmHal20getPropertyByteArrayERKNS_7String8ERNS_6VectorIhEE
// android::DrmHal::getPropertyByteArray(android::String8 const&,
// android::Vector<unsigned char>&) const To get the mangled export name: adb
// pull libmediadrm.so && objdump -T | grep getPropertyByteArray
hookGetPropertyByteArray(
    'libmediadrm.so',
    '_ZNK7android6DrmHal20getPropertyByteArrayERKNS_7String8ERNS_6VectorIhEE');