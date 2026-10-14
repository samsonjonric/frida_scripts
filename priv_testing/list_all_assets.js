Java.perform(function () {
    console.log("[*] Scanning AssetManager tree...");

    try {
        var currentApp = Java.use("android.app.ActivityThread").currentApplication();
        if (currentApp == null) {
            console.log("[-] Application context not available.");
            return;
        }
        var assetManager = currentApp.getApplicationContext().getAssets();

        function exploreAssets(path) {
            try {
                var files = assetManager.list(path);
                for (var i = 0; i < files.length; i++) {
                    var fileName = files[i];
                    var fullPath = (path === "") ? fileName : path + "/" + fileName;
                    
                    // Check if it's a directory or file by trying to list its contents
                    var subFiles = assetManager.list(fullPath);
                    if (subFiles && subFiles.length > 0) {
                        exploreAssets(fullPath); // It's a directory, recurse deeper
                    } else {
                        console.log("    [Asset File] -> " + fullPath);
                    }
                }
            } catch (err) {
                // If it throws, it's a file, not a directory
                console.log("    [Asset File] -> " + path);
            }
        }

        exploreAssets("");
        console.log("[*] Asset scan complete.");

    } catch (e) {
        console.error("[-] Error scanning assets: " + e.message);
    }
});
