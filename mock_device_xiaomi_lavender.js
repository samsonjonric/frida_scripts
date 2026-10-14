/* FG SCRIPT. Please keep this line. Required by Marmot-Frida. */
/**
 * Mock device info to Xiaomi Redmi Note 7 (lavender).
 *
 */

const MANUFACTURER = 'Xiaomi';
const MODEL = 'Redmi Note 7';
const BRAND = 'Xiaomi';
const DEVICE = 'lavender';
const FINGERPRINT = 'xiaomi/lavender/lavender:10/QKQ1.190910.002/V12.5.3.0.QFGMIXM:user/release-keys';
const HARDWARE = 'qcom';
const PRODUCT = 'lavender';
const BOARD = 'qcom';
const ID = 'QKQ1.190910.002';

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