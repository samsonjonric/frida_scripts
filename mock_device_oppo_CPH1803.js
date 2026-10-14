/* FG SCRIPT. Please keep this line. Required by Marmot-Frida. */
/**
 * Mock device info to OPPO A3s(CPH1803)
 *
 */

 const MANUFACTURER = 'OPPO';
 const MODEL = 'A3s';
 const BRAND = 'OPPO';
 const DEVICE = 'CPH1803';
 const FINGERPRINT = 'OPPO/CPH1803/CPH1803:8.1.0/OPM1.171019.026/1595220200:user/release-keys';
 const HARDWARE = 'qcom';
 const PRODUCT = 'CPH1803';
 const BOARD = 'qcom';
 const ID = 'OPM1.171019.026';

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