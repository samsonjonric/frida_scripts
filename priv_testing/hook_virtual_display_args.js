Java.perform(function () {
    console.log("[*] Hooking DisplayManager.createVirtualDisplay overloads...");

    var DisplayManager = Java.use("android.hardware.display.DisplayManager");

    // 1. Hook: createVirtualDisplay(String name, int width, int height, int densityDpi, Surface surface)
    try {
        DisplayManager.createVirtualDisplay.overload(
            'java.lang.String', 'int', 'int', 'int', 'android.view.Surface'
        ).implementation = function (name, width, height, densityDpi, surface) {
            console.log("\n[+] createVirtualDisplay (Basic 5-arg) called:");
            console.log("    - Name: " + name);
            console.log("    - Resolution: " + width + "x" + height);
            console.log("    - Density: " + densityDpi);
            console.log("    - Surface: " + surface);
            return this.createVirtualDisplay(name, width, height, densityDpi, surface);
        };
    } catch (e) {}

    // 2. Hook: createVirtualDisplay(String name, int width, int height, int densityDpi, Surface surface, int flags)
    try {
        DisplayManager.createVirtualDisplay.overload(
            'java.lang.String', 'int', 'int', 'int', 'android.view.Surface', 'int'
        ).implementation = function (name, width, height, densityDpi, surface, flags) {
            console.log("\n[+] createVirtualDisplay (6-arg with flags) called:");
            console.log("    - Name: " + name);
            console.log("    - Resolution: " + width + "x" + height);
            console.log("    - Density: " + densityDpi);
            console.log("    - Surface: " + surface);
            console.log("    - Flags: " + flags + " (Hex: 0x" + flags.toString(16) + ")");
            return this.createVirtualDisplay(name, width, height, densityDpi, surface, flags);
        };
    } catch (e) {}

    // 3. Hook: createVirtualDisplay with MediaProjection (Android 14+ / modern APIs)
    try {
        DisplayManager.createVirtualDisplay.overload(
            'android.media.projection.MediaProjection', 
            'java.lang.String', 'int', 'int', 'int', 
            'android.view.Surface', 'int', 
            'android.hardware.display.VirtualDisplay$Callback', 
            'android.os.Handler', 'java.lang.String'
        ).implementation = function (projection, name, width, height, densityDpi, surface, flags, callback, handler, uniqueId) {
            console.log("\n[+] createVirtualDisplay (MediaProjection 10-arg) called:");
            console.log("    - MediaProjection active: " + (projection != null));
            console.log("    - Name: " + name);
            console.log("    - Resolution: " + width + "x" + height);
            console.log("    - Flags: 0x" + flags.toString(16));
            console.log("    - Surface: " + surface);
            return this.createVirtualDisplay(projection, name, width, height, densityDpi, surface, flags, callback, handler, uniqueId);
        };
    } catch (e) {}

    // 4. Hook: createVirtualDisplay using VirtualDisplayConfig
    try {
        DisplayManager.createVirtualDisplay.overload('android.hardware.display.VirtualDisplayConfig').implementation = function (config) {
            console.log("\n[+] createVirtualDisplay (VirtualDisplayConfig) called:");
            if (config != null) {
                console.log("    - Config object intercepted.");
            }
            return this.createVirtualDisplay(config);
        };
    } catch (e) {}

    console.log("[*] Hooks active. Interact with the app to trigger virtual displays.");
});
