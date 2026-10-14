/* FG SCRIPT. Please keep this line. Required by Marmot-Frida. */
/**
 * Mock device info to OPPO A5s(CPH1909)
 *
 */

const MANUFACTURER = 'OPPO';
const MODEL = 'A5s';
const BRAND = 'OPPO';
const DEVICE = 'CPH1909';
const FINGERPRINT = 'OPPO/CPH1909/CPH1909:8.1.0/O11019/2021030000:user/release-keys';
const HARDWARE = 'mt6765';
const PRODUCT = 'CPH1909';
const BOARD = 'mt6765';
const ID = 'O11019';

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