/* FG SCRIPT. Please keep this line. Required by Marmot-Frida. */
/**
 * Mock device info to Xiaomi Redmi Note 8 (ginkgo).
 *
 */

const MANUFACTURER = 'Xiaomi';
const MODEL = 'Redmi Note 8';
const BRAND = 'Xiaomi';
const DEVICE = 'ginkgo';
const FINGERPRINT = 'xiaomi/ginkgo/ginkgo:11/RKQ1.201004.002/V12.5.2.0.RCOMIXM:user/release-keys';
const HARDWARE = 'qcom';
const PRODUCT = 'ginkgo';
const BOARD = 'qcom';
const ID = 'RKQ1.201004.002';

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