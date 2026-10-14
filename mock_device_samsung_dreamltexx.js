/* FG SCRIPT. Please keep this line. Required by Marmot-Frida. */
/**
 * Mock device info to Samsung Galaxy S8 (dreamltexx).
 *
 */

const MANUFACTURER = 'Samsung';
const MODEL = 'Galaxy S8';
const BRAND = 'Samsung';
const DEVICE = 'dreamlte';
const FINGERPRINT = 'samsung/dreamltexx/dreamlte:9/PPR1.180610.011/G950FXXUCDUD1:user/release-keys';
const HARDWARE = 'samsungexynos8895';
const PRODUCT = 'dreamltexx';
const BOARD = 'samsungexynos8895';
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