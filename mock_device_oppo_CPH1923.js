/* FG SCRIPT. Please keep this line. Required by Marmot-Frida. */
/**
 * Mock device info to OPPO A1k(CPH1923)
 *
 */

const MANUFACTURER = 'OPPO';
const MODEL = 'A1k';
const BRAND = 'OPPO';
const DEVICE = 'OP486C';
const FINGERPRINT = 'OPPO/CPH1923/OP486C:9/PPR1.180610.011/2021030000:user/release-keys';
const HARDWARE = 'mt6765';
const PRODUCT = 'CPH1923';
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