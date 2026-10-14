// Accepts target library from CLI via `frida -U -f com.example.test -l memory_dump.js -e "var TARGET_LIB='libname.so'"`
// Or defaults to a generic regex matcher if not specified.
var TARGET_LIB = typeof TARGET_LIB !== 'undefined' ? TARGET_LIB : null;
var isDumped = false;

// Retrieves the package name of the currently running app dynamically
function getPackageName() {
    try {
        var cmdline = File.readAllText("/proc/self/cmdline");
        var pkg = cmdline.split('\0')[0].trim();
        if (pkg && pkg.length > 0) {
            return pkg;
        }
    } catch(e) {
        // Fallback using Java API if available
    }

    try {
        // Android Java runtime fallback for package name
        var currentApplication = Java.use("android.app.ActivityThread").currentApplication();
        if (currentApplication !== null) {
            return currentApplication.getPackageName();
        }
    } catch (e) {}

    return "unknown_app";
}

function dumpModule(moduleName) {
    if (isDumped) return;
    isDumped = true;

    var mod = null;
    try {
        mod = Process.getModuleByName(moduleName);
    } catch (e) {
        console.log(">>>> Error: Cannot find module " + moduleName);
        return;
    }

    var base = mod.base;
    var size = mod.size;

    console.log("\n>>>> Starting dump for: " + moduleName);
    console.log(">>>> ELF base: " + base);
    console.log(">>>> ELF size: " + size);

    var pkgName = getPackageName();
    var fileName = "dumped_" + base + "_" + moduleName;
    var dumpPath = "";
    var f = null;

    // List of reliable target directories with write permissions
    var pathsToTry = [
        "/data/user/0/" + pkgName + "/",
        "/data/data/" + pkgName + "/",
        "/data/user/0/" + pkgName + "/cache/",
        "/data/data/" + pkgName + "/cache/",
        "/sdcard/Download/",
        "/data/local/tmp/"
    ];

    // Find the first directory that allows writing
    for (var p = 0; p < pathsToTry.length; p++) {
        var testPath = pathsToTry[p] + fileName;
        try {
            f = new File(testPath, "wb");
            dumpPath = testPath;
            console.log(">>>> Success opening: " + testPath);
            break;
        } catch (e) {
            // Try next path
        }
    }

    if (!f) {
        console.log(">>>> " + moduleName + " Error: Permission denied in all target directories.");
        console.log(">>>> fin\n");
        return;
    }

    try {
        var pageSize = Process.pageSize;
        var numPages = Math.ceil(size / pageSize);

        // Read page by page to avoid access violation crashes on unreadable segments
        for (var i = 0; i < numPages; i++) {
            var pageBase = base.add(i * pageSize);
            try {
                var buffer = pageBase.readByteArray(pageSize);
                f.write(buffer);
            } catch (e) {
                // Pad unreadable pages with zeros to preserve ELF offsets
                var zeros = new ArrayBuffer(pageSize);
                f.write(zeros);
            }
        }
        f.close();
        console.log(">>>> Success! Dumped to: " + dumpPath);
    } catch (e) {
        console.log(">>>> " + moduleName + " Error during writing: " + e);
        if (f) f.close();
    }
    console.log(">>>> fin\n");
}

// If a specific library was provided, poll for it
if (TARGET_LIB) {
    console.log("[*] Waiting for target library: " + TARGET_LIB);
    var timer = setInterval(function() {
        try {
            var mod = Process.getModuleByName(TARGET_LIB);
            if (mod) {
                clearInterval(timer);
                console.log("\n[*] " + TARGET_LIB + " detected in memory!");
                console.log("[*] Waiting 2 seconds for self-decryption routines to finish...");
                setTimeout(function() {
                    dumpModule(TARGET_LIB);
                }, 2000);
            }
        } catch (e) {}
    }, 500);
} else {
    // Generic approach: Monitor all loaded modules dynamically using Module.ensureInitialized or Process.enumerateModules
    console.log("[*] No specific TARGET_LIB defined. Monitoring loaded modules...");
    
    var loadedModules = Process.enumerateModules();
    for (var i = 0; i < loadedModules.length; i++) {
        var m = loadedModules[i];
        // Example: Automatically target non-system custom libraries if desired, 
        // or you can hook android_dlopen_ext to catch libraries as they load.
    }

    // Hook native linker to catch any library loaded at runtime generically
    var dlopenRef = Module.findExportByName(null, "android_dlopen_ext") || Module.findExportByName(null, "dlopen");
    if (dlopenRef) {
        Interceptor.attach(dlopenRef, {
            onEnter: function(args) {
                try {
                    var libPath = args[0].readUtf8String();
                    if (libPath) {
                        var parts = libPath.split("/");
                        var libName = parts[parts.length - 1];
                        
                        // Filter out standard system libraries to focus on app-specific native libs
                        if (libName && !libName.startsWith("libandroid") && !libName.startsWith("libc.") && !libName.startsWith("libstdc++") && !libName.startsWith("libm.")) {
                            console.log("[*] Dynamically loaded library detected: " + libName);
                            
                            // Automatically dump after a short delay for decryption
                            setTimeout(function() {
                                dumpModule(libName);
                            }, 2000);
                        }
                    }
                } catch (e) {}
            }
        });
    }
}