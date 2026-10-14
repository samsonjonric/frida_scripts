/* FG SCRIPT. Please keep this line. */
/*
 * This script finds and hook the `getFetchResponseBody` method (including)
 * minimized versions, to collect Firebase Config responses in dynamic
 * evaluations.
 */

let clazzThread = null;
const linebreak = 'h0us3l1nebr3ak';



/**
 * Overwrite console.log to logcat log
 * @param {string} message The log message
 */
console.log = function(message) {
  if (message == '') return;
  const androidLog = Java.use('android.util.Log');
  androidLog.d('FG', message);
};

/**
 * Gets the stack trace String
 * @param {!integer} index The depth of desired stack trace
 * @return {string} stacktrace string
 */
function getCaller(index) {
  return clazzThread.currentThread().getStackTrace()[index + 1];
}

/**
 * Gets the caller string, and add it into the arguments map. The caller info
 * will be queriable from marmotlogger_data.calls.arg_value_pairs
 * @param {!Object<string, string>} smart_args: the argument map
 * @param {!integer} depth: The stack trace depth
 */
function logCaller(smart_args, depth) {
  for (let i = 1; i < depth; i++) {
    smart_args['frida_marmot_caller_' + String(i)] = String(getCaller(i + 1));
  }
}


/**
 * Gets the timestamp info for method calls
 * @return {string} timestamp string
 */
function getTime() {
  const date = new Date();
  return date.getHours().toString() + ':' + date.getMinutes().toString() + ':' +
      date.getSeconds().toString() + ':' + date.getMilliseconds();
}

/**
 * The getCaller method used in hooks template, by default it find caller #2 to
 * #5 in the call stack
 * @return {string} stacktrace string
 */
function getCaller() {
  return clazzThread.currentThread()
      .getStackTrace()
      .slice(2, 5)
      .reverse()
      .toString()
      .replace(/,/g, linebreak);
}

/**
 * The miniLog method used in hooks with is_mini set to true. It only logs via
 * console.log and does not send information back to Frida server via the send()
 * API.
 * @param{string} methodname: Method name string.
 * @param{string} arg_type: Argument's type.
 * @param{string} arg_dump: Argument's name and value dump.
 * @param{string} ret_type: Return value's type.
 * @param{string} retvar: Return value.
 */
function miniLog(methodname, arg_type, arg_dump, ret_type, retvar) {
  console.log('[+]' + methodname + '(' + arg_type + ')');
  console.log('Return: (' + ret_type + ')' + retvar);
  console.log(arg_dump);
}

/**
 * Method for finding the classLoader, by searching the dex/jar module's path.
 * @param{string} cl_path dex/jar module's path.
 * @return{?Object} active_classloader: The classLoader object.
 */
function findClassLoader(cl_path) {
  return Java.enumerateClassLoadersSync().filter(cl => cl.includes(CL_PATH));
}


/**
 * Finds the `getFetchResponseBody` method using the method's signature.
 * @param{string} method The method reference for enumeration
 */
function find_getFetchResponseBody(method) {
  if (method.getParameterTypes().toString() == 'class java.net.URLConnection' &&
      method.getReturnType().getName() == 'org.json.JSONObject') {
    hookMethod(
        'com.google.firebase.remoteconfig.internal.ConfigFetchHttpClient',
        method.getName().toString());
  }
}


/**
 * Hooks the classname:methodname using Frida.
 * @param{string} className The classname to look for.
 * @param{string} methodName The methodname to look for.
 * Note: the usage of `eval()` isn't unsafe here, as (1) the script is not
 * for web page rendering and (2) the classname and methodnames are gurranteed
 * to be legitmate strings because of they are the output of enumerations. And
 * we have to use `eval()` here because we need to concatenate the
 * dynamically resolved classname:methodname value.
 */
function hookMethod(className, methodName) {
  eval('Java.use("' + className + '").' + methodName)
      .overload('java.net.URLConnection')
      .implementation = function() {
    let returnValue;
    try {
      returnValue = eval('this.' + methodName + '.apply(this, arguments)');
    } catch (err) {
      returnValue = null;
      console.log('Exception - cannot compute returnValue..' + String(err));
    }

    logFridaRecord(
        'com.google.firebase.remoteconfig.internal.ConfigFetchHttpClient.getFetchResponseBody',
        arguments, String(returnValue));

    return returnValue;
  };
}

setTimeout(()=> {
  Java.perform(()=> {
    clazzThread = Java.use('java.lang.Thread');
    /* Begin: smart_hook:
     * com.google.firebase.remoteconfig.internal.ConfigFetchHttpClient.getFetchResponseBody
     */

    let c_ConfigFetchHttpClient_hook = Java.use(
        'com.google.firebase.remoteconfig.internal.ConfigFetchHttpClient');

    if (c_ConfigFetchHttpClient_hook.getFetchResponseBody) {
      let c_ConfigFetchHttpClient_hook_getFetchResponseBody_hook =
          c_ConfigFetchHttpClient_hook.getFetchResponseBody.overloads[0];
      c_ConfigFetchHttpClient_hook_getFetchResponseBody_hook.implementation =
          function() {
        let smart_args = arguments;
        let retval = null;

        for (let index = 0; index < smart_args.length; index++) {
          arg_type +=
              ('argType' + index.toString() + ' : ' +
               String(typeof (smart_args[index])) + ' ');
          arg_dump +=
              ('arg' + index.toString() + ': ' + String(smart_args[index]) +
               linebreak);
        }
        method_info += 'Reverse Call Stack: ' + linebreak + getCaller() +
            linebreak + linebreak +
            c_ConfigFetchHttpClient_hook_getFetchResponseBody_hook.methodName +
            '( ' + arg_type + ') ';


        try {
          retval = this.getFetchResponseBody.apply(this, smart_args);
        } catch (err) {
          retval = null;
          console.log('Exception - cannot compute retval..' + String(err));
        }

        logFridaRecord(
            'com.google.firebase.remoteconfig.internal.ConfigFetchHttpClient.getFetchResponseBody',
            smart_args, String(retval));

        return retval;
      };
    } else {
      let methods = c_ConfigFetchHttpClient_hook.class.getDeclaredMethods();
      methods.forEach(find_getFetchResponseBody);
    }

    /* End:
     * com.google.firebase.remoteconfig.internal.ConfigFetchHttpClient.getFetchResponseBody
     */
  });
}, 0);