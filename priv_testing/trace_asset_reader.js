Java.perform(function () {
    console.log("[*] Hooking AssetManager.open to trace file consumption...");

    var AssetManager = Java.use("android.content.res.AssetManager");
    
    // Hook open(String)
    AssetManager.open.overload('java.lang.String').implementation = function (fileName) {
        if (fileName.includes("vbxufsxpcfgkz") || fileName.includes("ympijkfvjw") || fileName.includes("sjsczblsa") || fileName.includes("vault_profile.cfg") || fileName.includes("gvqvf")) {
            console.log("\n[+] TARGET ASSET ACCESSED: " + fileName);
            
            var Exception = Java.use("java.lang.Exception");
            var Log = Java.use("android.util.Log");
            console.log("    [Stack Trace]:\n" + Log.getStackTraceString(Exception.$new()));
        }
        return this.open(fileName);
    };

    // Hook open(String, int) mode overload if it exists
    try {
        AssetManager.open.overload('java.lang.String', 'int').implementation = function (fileName, accessMode) {
            if (fileName.includes("vbxufsxpcfgkz") || fileName.includes("ympijkfvjw") || fileName.includes("sjsczblsa") || fileName.includes("vault_profile.cfg") || fileName.includes("gvqvf")) {
                console.log("\n[+] TARGET ASSET ACCESSED (with mode): " + fileName);
                
                var Exception = Java.use("java.lang.Exception");
                var Log = Java.use("android.util.Log");
                console.log("    [Stack Trace]:\n" + Log.getStackTraceString(Exception.$new()));
            }
            return this.open(fileName, accessMode);
        };
    } catch (e) {}

    console.log("[*] Asset tracker active. Interact with the app now.");
});
