/* FG SCRIPT. Please keep this line. Required by Marmot-Frida. */
/**
 * Mock device info to Samsung A52 (a51nsxx).
 *
 */

const MANUFACTURER = 'Samsung';
const MODEL = 'A51';
const BRAND = 'Samsung';
const DEVICE = 'a51';
const FINGERPRINT = 'samsung/a51nsxx/a51:12/SP1A.210812.016/A515FXXU5FVE2:user/release-keys';
const HARDWARE = 'exynos9611';
const PRODUCT = 'a51nsxx';
const BOARD = 'exynos9611';
const ID = 'SP1A.210812.016';

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