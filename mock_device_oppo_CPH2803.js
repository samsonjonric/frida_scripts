/* FG SCRIPT. Please keep this line. Required by Marmot-Frida. */
/**
 * Mock device info to OPPO A12(CPH2803)
 *
 */

 const MANUFACTURER = 'OPPO';
 const MODEL = 'A12';
 const BRAND = 'OPPO';
 const DEVICE = 'OP4BFB';
 const FINGERPRINT = 'OPPO/CPH2083/OP4BFB:9/PPR1.180610.011/1642488389:user/release-keys';
 const HARDWARE = 'mt6765';
 const PRODUCT = 'CPH2803';
 const BOARD = 'mt6765';
 const ID = 'PPR1.180610.011';

/**
 * Sets device properties.
 */
function mockDevice() {
  const log = Java.use("android.util.Log");
  log.e('FG', 'Start setting properties');
  const androidBuild = Java.use("android.os.Build");
  androidBuild.MANUFACTURER.value = MANUFACTURER;
  androidBuild.MODEL.value = MODEL;
  androidBuild.BRAND.value = BRAND;
  androidBuild.DEVICE.value = DEVICE;
  androidBuild.FINGERPRINT.value = FINGERPRINT;
  androidBuild.HARDWARE.value = HARDWARE;
  androidBuild.PRODUCT.value = PRODUCT;
  androidBuild.BOARD.value = BOARD;
  androidBuild.ID.value = ID;
  log.e('FG', 'Finish setting properties');
}

// Entry Point
if (Java.available) {
  Java.performNow(mockDevice);
}