const targetModuleName = "libaaa.so";

// Safe configuration: unused offsets set to null
const OFFSETS = {
    X509_verify_cert: 0x68d304,          // Your verified working offset
    session_verify_cert_chain: null,     // Set to null until found in disassembler
    SSL_CTX_set_custom_verify: null      // Set to null until found in disassembler
};

function hookNativeSSL(libraryBase) {
    // 1. Hook the primary verification offset
    if (OFFSETS.X509_verify_cert) {
        const verifyCertPtr = libraryBase.add(OFFSETS.X509_verify_cert);
        Interceptor.replace(verifyCertPtr, new NativeCallback(function (ctx) {
            console.log("[*] Hook triggered: X509_verify_cert -> Forcing Success (1)");
            return 1; 
        }, 'int', ['pointer']));
        console.log("[+] Successfully replaced X509_verify_cert at " + verifyCertPtr);
    }

    // 2. Hook session_verify_cert_chain (Safe null check)
    if (OFFSETS.session_verify_cert_chain) {
        const sessionVerifyPtr = libraryBase.add(OFFSETS.session_verify_cert_chain);
        Interceptor.replace(sessionVerifyPtr, new NativeCallback(function (a, b, c, d, e, f) {
            console.log("[*] Hook triggered: session_verify_cert_chain -> Forcing ssl_verify_ok (0)");
            return 0; 
        }, 'int', ['pointer', 'pointer', 'pointer', 'pointer', 'pointer', 'pointer']));
        console.log("[+] Successfully replaced session_verify_cert_chain at " + sessionVerifyPtr);
    }
}

// Linker hook setup
const alreadyLoaded = Process.findModuleByName(targetModuleName);
if (alreadyLoaded !== null) {
    hookNativeSSL(alreadyLoaded.base);
} else {
    const dlopenRef = Module.findGlobalExportByName("android_dlopen_ext") || Module.findGlobalExportByName("dlopen");
    if (dlopenRef) {
        Interceptor.attach(dlopenRef, {
            onEnter: function (args) {
                this.libraryPath = ptr(args[0]).readCString();
            },
            onLeave: function (retval) {
                if (this.libraryPath && this.libraryPath.indexOf(targetModuleName) !== -1) {
                    const targetModule = Process.findModuleByName(targetModuleName);
                    if (targetModule) {
                        hookNativeSSL(targetModule.base);
                    }
                }
            }
        });
    }
}

