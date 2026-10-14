/* FG SCRIPT. Please keep this line. */

/**
 * This script will hook Flutter's MessageChannel to log the access of Platform
 * APIs.
 * The script will also hook Flutter's MethodCall class to log the parsed
 * messages.
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

/**
 * Get the stack trace for current api.
 * @return {string} the stack trace string.
 */
function getStack() {
  const threadef = Java.use('java.lang.Thread');
  const threadinstance = threadef.$new();
  const stack = threadinstance.currentThread().getStackTrace();
  let at = '';
  for (let i = 0; i < stack.length; ++i) {
    at += stack[i].toString() + '\n';
  }
  return at;
}

/**
 * Enumerate all the classloaders and search the class.
 * @param {string} classname the class to be searched.
 * @return {?Class} the class reference.
 */
function searchAndFindClass(classname) {
  try {
    const loaders = Java.enumerateClassLoadersSync();
    for (const loader of loaders) {
      try {
        if (loader.loadClass(classname)) {
          const factory = Java.ClassFactory.get(loader);
          const cls = factory.use(classname);
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
 * Check if the class is the target interface with onMethodCall method.
 * @param {!Class} cls: the class reference.
 * @return {?Class} the MethodCall class.
 */
function isTargetClass(cls) {
  log('Target:' + cls.toString());
  const methods = cls.getDeclaredMethods();
  for (const method of methods) {
    const name = method.getName().toString();
    if (name == 'onMethodCall') {
      const types = method.getParameterTypes();
      if (types.length > 0) {
        log('find class: ' + name + ', method: ' + method +
            ', param:' + types[0].toString());
        return types[0];
      }
    }
  }
  return null;
}

/**
 * Search the classes used in the Class fields.
 * @param {!Array<!Class>} classes: the classes to be analyzed.
 * @return {!Set<!Class>}.
 */
function searchNextLevelClasses(classes) {
  let nextLevelClasses = new Set();
  try {
    for (const cls of classes) {
      const fields = cls.getDeclaredFields();
      for (const field of fields) {
        const type = field.getType().toString();
        if (type.includes('java.lang.String') ||
            type.includes('android.content')) {
          continue;
        }
        nextLevelClasses.add(field.getType());
      }
    }
  } catch (err) {
    log(err.message);
  }
  return nextLevelClasses;
}

/**
 * Find and hook the constructor of MethodCall.
 * @param{!Class} cls the class of FlutterJNI.
 */
function hookMethodCall(cls) {
  try {
    const localizationPlugin = cls.class.getDeclaredField('localizationPlugin');
    const localizationPluginCls = localizationPlugin.getType();
    let onMethodCall = null;
    log('localizationPlugin:' + localizationPluginCls.toString());
    let level0 = new Set();
    level0.add(localizationPluginCls);
    const classesLevel1 = searchNextLevelClasses(level0);
    for (const classType of classesLevel1) {
      log('level 1: ' + classType.toString());
    }
    const classesLevel2 = searchNextLevelClasses(classesLevel1);
    for (const classType of classesLevel2) {
      log('level 2: ' + classType.toString());
      const ret = isTargetClass(classType);
      if (ret) {
        onMethodCall = ret;
        break;
      }
    }
    if (onMethodCall) {
      const factory = Java.ClassFactory.get(onMethodCall.getClassLoader());
      log(onMethodCall.getName().toString());
      const onMethodCallCls = factory.use(onMethodCall.getName());
      onMethodCallCls.$init.overloads[0].implementation = function(arg1, arg2) {
        try {
          logFridaRecord(
              'flutter.MethodCall', {'method': arg1, 'arguments': arg2}, null);
          log('onMethodCall: ' + arg1.toString());
        } catch (err) {
          log(err.message);
        }
        return this.$init(arg1, arg2);
      };
    } else {
      log('can\'t find MethodCall class');
    }
  } catch (err) {
    log(err.message);
  }
}
/**
 * Find and hook FlutterJNI.handlePlatformMessage.
 * @param{!Class} cls the class of FlutterJNI.
 */
function hookHandlePlatformMessage(cls) {
  try {
    const handlePlatformMessage = cls.handlePlatformMessage;
    handlePlatformMessage.implementation = function(
        channel, message, replyId, messageData) {
      try {
        log('channel:' + channel);
        let decodedMsg = 'null';
        if (message) {
          log('message: ' + message.toString());
          const javaStr = Java.use('java.lang.String');
          const byteBuffer = Java.use('java.nio.ByteBuffer');
          const bufferCls = Java.use('java.nio.Buffer');
          const sourceP = bufferCls.position.overload().call(message);
          const sourceL = bufferCls.limit.overload().call(message);
          let buffer = byteBuffer.allocate(message.capacity());
          buffer.put(message);
          buffer.flip();
          buffer.rewind();
          message.position(sourceP);
          message.limit(sourceL);
          let arrayMsg = buffer.array();
          decodedMsg = javaStr.$new.overload('[B').call(javaStr, arrayMsg);
          log('decodedMessage: ' + decodedMsg);
          log('check message: ' + message.toString());
        }
        if (typeof (logFridaRecord) == 'function') {
          logFridaRecord(
              'flutterJNI.handlePlatformMessage',
              {'channel': channel, 'message': decodedMsg}, null);
        } else {
          log('No logFridaRecord');
        }
      } catch (err) {
        log(err.message);
      }
      handlePlatformMessage.call(this, channel, message, replyId, messageData);
    };
  } catch (err) {
    log(err.message);
  }
}

/**
 * Do Fluter instrumentation.
 */
function hookFlutter() {
  const cls = searchAndFindClass('io.flutter.embedding.engine.FlutterJNI');
  log(cls.toString());
  hookHandlePlatformMessage(cls);
  hookMethodCall(cls);
}

log('start hook');
// Entry Point
Java.perform(function() {
  hookFlutter();
});