const targetModuleName = "libaaa.so"; 
const functionOffset = 0x68d304; 

// Function to apply your Hook once the library is available
function hookTargetFunction(libraryBase) {
    const verifyCertPtr = libraryBase.add(functionOffset);
    
    Interceptor.replace(verifyCertPtr, new NativeCallback(function (ctx) {
        console.log("[*] Bypassed X509_verify_cert via offset. Forcing return value to 1 (true).");
        return 1;
    }, 'int', ['pointer']));
    
    console.log("[+] Successfully replaced function at " + verifyCertPtr);
}

// Check if the module is already loaded (fallback)
const alreadyLoaded = Process.findModuleByName(targetModuleName);
if (alreadyLoaded !== null) {
    console.log("[*] " + targetModuleName + " was already loaded. Hooking immediately...");
    hookTargetFunction(alreadyLoaded.base);
} else {
    console.log("[*] " + targetModuleName + " not loaded yet. Setting up linker interceptors...");
    
    // Frida 17+: Use findGlobalExportByName instead of findExportByName
    const dlopenRef = Module.findGlobalExportByName("android_dlopen_ext") || Module.findGlobalExportByName("dlopen");
    
    if (dlopenRef) {
        Interceptor.attach(dlopenRef, {
            onEnter: function (args) {
                // Frida 17+: Wrap raw args with ptr() before calling readCString()
                this.libraryPath = ptr(args[0]).readCString();
            },
            onLeave: function (retval) {
                if (this.libraryPath && this.libraryPath.indexOf(targetModuleName) !== -1) {
                    console.log("[+] " + targetModuleName + " loaded! Base address: " + retval);
                    
                    const targetModule = Process.findModuleByName(targetModuleName);
                    if (targetModule) {
                        hookTargetFunction(targetModule.base);
                    } else {
                        hookTargetFunction(retval);
                    }
                }
            }
        });
    } else {
        console.log("[-] Error: Unable to locate dlopen / android_dlopen_ext export.");
    }
}

