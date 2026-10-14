/* FG SCRIPT. Please keep this line. Required by Marmot-Frida. */
/**
 * Mock device info to Xiaomi Redmi Note 4 (mido).
 *
 */

const MANUFACTURER = 'Xiaomi';
const MODEL = 'Redmi Note 4';
const BRAND = 'Xiaomi';
const DEVICE = 'mido';
const FINGERPRINT = 'xiaomi/mido/mido:7.0/NRD90M/V11.0.2.0.NCFMIXM:user/release-keys';
const HARDWARE = 'qcom';
const PRODUCT = 'mido';
const BOARD = 'qcom';
const ID = 'NRD90M';

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