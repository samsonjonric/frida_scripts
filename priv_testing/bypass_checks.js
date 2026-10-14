Java.perform(function () {
    console.log("[*] Starting Anti-Emulator & Environment Bypass...");

    // 1. Mask android.os.Build properties to look like a real device (e.g., Google Pixel)
    try {
        var Build = Java.use("android.os.Build");
        Build.FINGERPRINT.value = "google/redfin/redfin:11/RQ3A.211001.001/7641976:release-keys";
        Build.MODEL.value = "Pixel 5";
        Build.MANUFACTURER.value = "Google";
        Build.BRAND.value = "google";
        Build.DEVICE.value = "redfin";
        Build.PRODUCT.value = "redfin";
        Build.HARDWARE.value = "redfin";
        console.log("[+] Build properties spoofed successfully.");
    } catch (e) {
        console.log("[-] Failed to spoof Build properties: " + e.message);
    }

    // 2. Bypass Debugger.isDebuggerConnected()
    try {
        var Debug = Java.use("android.os.Debug");
        Debug.isDebuggerConnected.implementation = function () {
            return false;
        };
        console.log("[+] Hooked Debug.isDebuggerConnected -> returning false.");
    } catch (e) {}

    // 3. Bypass simple PackageManager queries for root binaries (su, magisk, etc.)
    try {
        var ApplicationPackageManager = Java.use("android.app.ApplicationPackageManager");
        ApplicationPackageManager.getPackageInfo.overload('java.lang.String', 'int').implementation = function (packageName, flags) {
            if (packageName.includes("supersu") || packageName.includes("magisk") || packageName.includes("noshufou")) {
                var PackageManager = Java.use("android.content.pm.PackageManager");
                var NameNotFoundException = Java.use("android.content.pm.PackageManager$NameNotFoundException");
                throw NameNotFoundException.$new("Package not found");
            }
            return this.getPackageInfo(packageName, flags);
        };
    } catch (e) {}

    // 4. Hook SystemProperties to hide emulator flags if queried
    try {
        var SystemProperties = Java.use("android.os.SystemProperties");
        SystemProperties.get.overload('java.lang.String').implementation = function (key) {
            var val = this.get(key);
            if (key.includes("ro.kernel.qemu") || key.includes("ro.bootloader")) {
                return "";
            }
            return val;
        };
    } catch (e) {}

    console.log("[*] Anti-detection hooks applied. Restarting app flow...");
});
