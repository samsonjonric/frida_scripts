Java.perform(function () {
    console.log("[*] Setting up dynamic catch-all hooks for createVirtualDisplay...");

    var DisplayManager = Java.use("android.hardware.display.DisplayManager");
    var overloads = DisplayManager.createVirtualDisplay.overloads;

    overloads.forEach(function (overload) {
        overload.implementation = function () {
            console.log("\n[+] BINGO! createVirtualDisplay invoked.");
            
            // Print all arguments passed to this overload
            for (var i = 0; i < arguments.length; i++) {
                console.log("    - Arg [" + i + "]: " + arguments[i]);
            }

            // Print stack trace to find the calling class/method
            var Exception = Java.use("java.lang.Exception");
            var Log = Java.use("android.util.Log");
            console.log("    - Stack Trace:\n" + Log.getStackTraceString(Exception.$new()));

            // Call the original method so the app doesn't crash
            return overload.apply(this, arguments);
        };
    });

    console.log("[*] Catch-all hooks active. Ready for app interaction.");
});
