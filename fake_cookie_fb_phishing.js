/* FG SCRIPT. Please keep this line. */

/**
 * This script will hook CookieManager and generate fake cookie for facebook and
 * instagram.
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

log('loading');

const cookieManager = Java.use('android.webkit.CookieManagerWrapper');
const COOKIE_DATA = 'fgphcookiedata';
const UID_DATA = 'fgphuiddata';

/**
 * Hook CookieManager and generate fake cookie for facebook and instagram.
 */
function hookCookieManager() {
  try {
    cookieManager.getCookie.overload('java.lang.String').implementation =
        function(url) {
      let ret = this.getCookie(url);
      // Fake cookie for Facebook.
      if (url.indexOf('facebook.com') > -1) {
        if (ret === null) {
          return 'c_user=' + UID_DATA + ';xs=' + COOKIE_DATA;
        } else {
          return ret.concat(';c_user=' + UID_DATA + ';xs=' + COOKIE_DATA);
        }
        // Fake cookie for Instragram
      } else if (url.indexOf('instagram.com') > -1) {
        if (ret === null) {
          return 'ds_user_id=' + UID_DATA + ';sessionid=' + COOKIE_DATA + ';csrftoken=token';
        } else {
          return ret.concat(';ds_user_id=' + UID_DATA + ';sessionid=' + COOKIE_DATA + ';csrftoken=token');
        }
      } else {
        return ret;
      }
    };
  } catch (e) {
    log(e.message);
  }
}

// Entry Point
Java.perform(function() {
  hookCookieManager();
});