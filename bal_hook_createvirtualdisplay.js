/* FG SCRIPT. Please keep this line. */

/**
 * script to hook DisplayManager.createVirtualDisplay and print the stack trace.
 */

/**
 * Log messages to logcat and console.
 * @param {string} logStr: The log message
 */
function log(logStr) {
  try {
    console.log(logStr);
    const androidLog = Java.use('android.util.Log');
    androidLog.e('FG', logStr);
  } catch (err) {
  }
}


/** Patch the Mojito Logger */
let mojitoMessage = null;
let mojitoLogger = null;
try {
  mojitoMessage = Java.use('com.mojito.utility.MojitoMessage');
  mojitoLogger = Java.use('com.mojito.utility.MojitoLogger');
  // This is to make sure the class can be referenced correctly.
  let message = mojitoMessage.$new('abc');
  log(message.toString());
} catch (err) {
  log(err.message);
}

/**
 * Patch the original logFridaRecord.
 * Logs Frida messages.
 * @param {?string} methodName Name of the instrumented method. If
 *     the methodName is null, 'undefined_frida_method' will be recorded.
 * @param {!Object<string, string>} argsMap A map for the argument,
 *     e.g., {'key1':'val1', 'key2':'value2'}. The type of keys and values is
 *     string.
 * @param {?string} returnValue, nullable. Return value of the instrumented
 *     method.
 */
function logFridaRecord(methodName, argsMap, returnValue) {
  try {
    let message = mojitoMessage.$new(methodName);
    message.setFromFrida(true);
    message.setLogStackTrace(true);
    const addArg =
        mojitoMessage.addArg.overload('java.lang.String', 'java.lang.Object');
    for (const [key, value] of Object.entries(argsMap)) {
      addArg.call(message, String(key), String(value));
    }
    const setReturn = mojitoMessage.setReturn.overload('java.lang.Object');
    if (returnValue != null) {
      setReturn.call(message, returnValue);
    }
    mojitoLogger.logMessage(message);
  } catch (err) {
    log(err.message);
  }
}

let clazz_Thread = null;

function miniLog(methodname, arg_type, arg_dump, ret_type, retvar) {
  console.log('[+]' + methodname + '(' + arg_type + ')');
  console.log('Return: (' + ret_type + ')' + retvar);
  console.log(arg_dump);
}

function findClassLoader(cl_path) {
  let allClassLoaders = [];
  let classLoaders = Java.enumerateClassLoadersSync();
  let active_classloader = null;

  classLoaders.forEach(function(cl) {
    if (String(cl).includes(cl_path)) {
      active_classloader = cl;
    }
  });
  return active_classloader;
}

setTimeout(function() {
  Java.perform(function() {
    clazz_Thread = Java.use('java.lang.Thread');
    log('In da house..hook_tpl_mini.js\n');

    /* Begin: android.hardware.display.DisplayManager.createVirtualDisplay */

    const c_DisplayManager_hook =
        Java.use('android.hardware.display.DisplayManager');

    const ovl_count_DisplayManager_hook =
        eval('c_DisplayManager_hook.createVirtualDisplay.overloads.length');
    for (let i = 0; i < ovl_count_DisplayManager_hook; i++) {
      const c_DisplayManager_hook_createVirtualDisplay_hook =
          eval('c_DisplayManager_hook.createVirtualDisplay.overloads[i]');
      c_DisplayManager_hook_createVirtualDisplay_hook.implementation =
          function() {
        let arg_dump = '';
        let arg_type = '';
        let ret_type = String(c_DisplayManager_hook_createVirtualDisplay_hook
                                  .returnType['className']);
        let retval = null;
        for (let index = 0; index < arguments.length; index++) {
          arg_type +=
              ('argType' + index.toString() + ' : ' +
               String(typeof (arguments[index])) + ' ');
          arg_dump +=
              ('arg' + index.toString() + ': ' + String(arguments[index]) +
               '\n');
        }

        try {
          retval = eval('this.createVirtualDisplay.apply(this, arguments)');
        } catch (err) {
          retval = null;
          console.log('Exception - cannot compute retval..' + String(err));
        }
        miniLog(
            'android.hardware.display.DisplayManager.createVirtualDisplay',
            String(arg_type), String(arg_dump), String(ret_type),
            String(retval));

        logFridaRecord(
            'android.hardware.display.DisplayManager.createVirtualDisplay',
            arguments, retval);
        return retval;
      };
    }

    /* End: android.hardware.display.DisplayManager.createVirtualDisplay */
    // dyloadscript
  });
}, 0);