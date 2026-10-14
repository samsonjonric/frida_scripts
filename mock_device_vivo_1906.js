/* FG SCRIPT. Please keep this line. Required by Marmot-Frida. */
/**
 * Mock device info to Vivo Y11 (1906)
 *
 */

const MANUFACTURER = 'VivO';
const MODEL = 'Y11';
const BRAND = 'VivO';
const DEVICE = '1906';
const FINGERPRINT = 'vivo/1906/1906:11/RP1A.200720.012/compiler0316164337:user/release-keys';
const HARDWARE = 'qcom';
const PRODUCT = '1906';
const BOARD = 'qcom';
const ID = 'RP1A.200720.012';

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