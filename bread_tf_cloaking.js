/* FG SCRIPT. Please keep this line. */

/**
 * script to bypass cloaking techniques commonly used by Bread TF apps
 */

/**
 * Overwrite console.log to logcat log
 * @param {string} logStr The log message
 */
 function log(logStr) {
  console.log(logStr);
  const androidLog = Java.use('android.util.Log');
  androidLog.e('FG', logStr);
}

/**
 * returns Context
 * @return {?Context}
 */
 function getContext() {
  return Java.use('android.app.ActivityThread')
      .currentApplication().getApplicationContext();
}

/**
 * # ------------------
 * # Toll Fraud Flow 1.
 * # ------------------
 *  The below SIM operator makes the script work directly for most Bread
 *  applications of the highest-distributed variants.
 * It activates the else-condition Toll Fraud flow, which is the easiest without
 * no further cloaking.
 */
let inputSimOperator = "46011";
let inputSimCountryIso = "CN"; // some Bread applications validate this
let inputSimOperatorName = "China Telecom";

/**
 * # ------------------
 * # Toll Fraud Flow 2.
 * # ------------------
 * If you want to go through the PlayStore Cloaking flow for some reason, or
 * if the above SIM did not work, you can try to
 * simply uncomment the below line
 * inputSimOperator = "26806"; // SIM operators to test with:
 * 26806 (Portugal - Moche), 51503 (Philippines - SMART), etc.
 * inputSimCountryIso = "PT"; // uncomment this line if you want to change your
 * SIM country
 * inputSimOperatorName = "MOCHE"; // uncomment this line if you want to change
 * your SIM operator name

 * Manual Review:
 * Review the Toll Fraud app as you would normally review it, but be sharp for
 * ".startsWith(" and "getSimOperator(" calls.
 * Please analyze the "SIM Operator Cloaking" that may be occurring and change
 * the inputSimOperator accordingly.
 * in a manual review, start by searching this in Cavy and tracing it back:
 *   - src:".startsWith("46""
 *   - src:"getSimOperator("
 *   - src:".startsWith("
 * FOR MORE DETAILS, you may read the document at
 * https://docs.google.com/document/d/1u4pwtTqG1_mQ14vSQnPjiaLQSJf5ugocojt5hV0AU0E
 */

let hooked = false;

// MAIN
setImmediate(function() {
  Java.performNow(function() {
      log("\nAttempting to bypass Bread cloaking...\n");
      log("[+] STEP: javaPerformNow");

      // 1 - Bypass SIM Operator Cloaking
      let telephonyManager = Java.use('android.telephony.TelephonyManager');

      telephonyManager.getSimOperator.overload().implementation = function () {
          let oldSimOperator = this.getSimOperator();
          let newSimOperator = inputSimOperator; // MCC (3 chrs) + MNC (2 chrs)

          // uncomment the code below for debugging purposes
          log("[+] CLOAKING DETECTED: SIM Operator Cloaking");
          log("[+] Call to getSimOperator intercepted. Changing SIM operator"
              + " from '" + oldSimOperator + "' to '" + newSimOperator + "'");
          return newSimOperator;
      };

      telephonyManager.getSimOperator.overload('int').implementation
          = function (a) {
          let newSimOperator = inputSimOperator;
          return newSimOperator;
      };

      Java.use("android.telephony.TelephonyManager").getSimCountryIso
          .overload().implementation = function() {
          return inputSimCountryIso;
      };

      Java.use("android.telephony.TelephonyManager").getSimOperatorName
          .overload().implementation = function() {
          let oldSimOperatorName = this.getSimOperatorName();
          let newSimOperatorName = inputSimOperatorName;

          log("[+] Call to getSimOperatorName intercepted. Changing"
                      + " SIM operator name from '" + oldSimOperatorName
                      + "' to '" + newSimOperatorName + "'");

          return inputSimOperatorName;
      };

      // 2 - Bypass Client Side Time Cloaking
      Java.use("java.util.Date").after.overload('java.util.Date')
          .implementation = function(date) {
          log("[+] CLOAKING DETECTED: Client Side Time Cloaking");
          log("[+] Call to 'java.util.Date->after' intercepted. "
                      + "Returning 'true' to check if date is after '"
                      + date.toString() + "'");
          return true;
      };

      // 3 - Bypass PlayStore Availability Cloaking
      let javaNetUrl = Java.use("java.net.URL");
      let playUrl = "https://play.google.com/store/apps/details?id="
       + "com.google.android.gm";
      javaNetUrl.$init.overload("java.lang.String")
          .implementation = function(url) {
          if ( url != null
              && url.includes('://play.google.com/store/apps/details?id=') ) {
              log("[+] CLOAKING DETECTED: PlayStore Cloaking");
              log("[+] BYPASS: Request to '" + url
                          + "' replaced with legitimate PlayStore app.");
              return this.$init(playUrl);
          }
          return this.$init(url);
      };

      // 4 - Bypass PlayStore Version Name Cloaking
      const Activity = Java.use('android.app.Activity');
      const manifestVersionName =
      getContext()
          .getPackageManager()
          .getPackageInfo(getContext().getPackageName(), 0)
          .versionName.value;
      const packageName = getContext().getPackageName();

      Activity.onResume.implementation = function () {
        if (!hooked) {
          hooked = true;
          let stringClass = Java.use('java.lang.String');
          stringClass.contains.implementation = function(st) {
            if (st == manifestVersionName) {
              log("[+] CLOAKING DETECTED: PlayStore Version Name"
                + " Cloaking");
              log("[+] BYPASS: Returning 'true' on the relevant"
                + " 'java.lang.String->contains()' call.");
              return true;
            }
            if (st == "amd" || st == "intel") {
              log("[+] CLOAKING DETECTED: Processor Type Cloaking");
              return false;
            }
            //some bread apps check if play response contains pkg name
            if(st == packageName){
              log("[+] CLOAKING DETECTED: PlayStore Package Name Cloaking");
              return true;
            }
            return this.contains(st);
          };
        }
        this.onResume();
      };
  });
});
