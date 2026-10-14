/* FG SCRIPT. Please keep this line. */

/**
 * Log the stack traces and values of EditText.getText();
 */

/**
 * Overwrite console.log to logcat log
 * @param {string} s: The log message
 */
 console.log = function(s) {
  const androidLog = Java.use('android.util.Log');
  if (s != '') {
    androidLog.d('FG', s);
    // This will send results to Interactive Frida
    send(s);
  }
};


/* Get the stack trace of current api. */
function stack(){
  const threadef = Java.use('java.lang.Thread');
  const threadinstance = threadef.$new();
  const stack = threadinstance.currentThread().getStackTrace();
  let at = "";
  for(let i = 0; i < stack.length; ++i){
    at += stack[i].toString() + "\n";
  }
  return at;
}

const editText = Java.use("android.widget.EditText");
editText.getText.overload().implementation = function() {
  const ret = editText.getText.overload().call(this);
  try {
    if (ret != null) {
      const object = Java.use('java.lang.Object');
      const output = object.toString.call(ret);
      console.log('getText: ' + output);
    } else {
      console.log('getText: null');
    }
  } catch (err) {
    console.log(err.message);
  }
  try {
    const stackStr = stack();
    // Sometimes the api will be triggered automatically by the framework. Skip these situations.
    // TODO: add more filterings.
    if (stackStr.includes('android.view.View.updateDisplayListIfDirty')) {
      console.log('Skip stack for EditText. Calling from updateDisplayListIfDirty.');
    } else if (stackStr.includes('android.widget.Editor.shouldBlink')) {
      console.log('Skip stack for EditText. Calling from shouldBlink.');
    } else if (stackStr.includes('android.view.ViewGroup.dispatchWindowFocusChanged')) {
      console.log('Skip stack for EditText. Calling from dispatchWindowFocusChanged.');
    } else if (stackStr.includes('android.view.ViewGroup.dispatchTransformedTouchEvent')) {
      console.log('Skip stack for EditText. Calling from dispatchTransformedTouchEvent.');
    } else {
      console.log(stackStr);
    }
  } catch (err) {
    console.log(err.message);
  }
  return ret;
}