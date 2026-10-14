/**
Frida JNI Logger Script
Recreates detailed JNI trace logs matching JNIEnv method calls.
*/
(function () {
    const TAG = "FridaLogs: ";
    
    // Map to cache resolved method names and signatures by jmethodID pointer
    const methodMap = new Map();

    // Utility functions to handle C-strings safely
    function readCString(ptr) {
        if (ptr.isNull()) return "(null)";
        try {
            return ptr.readUtf8String();
        } catch (e) {
            return ptr.toString();
        }
    }

    function logHeader(name) {
        console.log(`${TAG}[+] JNIEnv->${name}`);
    }

    function logArg(label, value) {
        const paddedLabel = (label + "*").padEnd(12, ' ');
        console.log(`${TAG}|- ${paddedLabel}: ${value}`);
    }

    function logValue(value) {
        console.log(`${TAG}|: ${value}`);
    }

    function logReturn(value) {
        console.log(`${TAG}-> ${value}`);
    }

    function logFooter() {
        console.log(TAG);
    }

    // Get JNIEnv address
    Java.perform(function () {
        const env = Java.vm.getEnv();
        const jniEnvPtr = env.handle;

        // Trace FindClass
        const FindClass = env.handle.readPointer().add(6 * Process.pointerSize).readPointer();
        Interceptor.attach(FindClass, {
            onEnter: function (args) {
                this.env = args[0];
                this.namePtr = args[1];
                this.nameStr = readCString(this.namePtr);
                logHeader("FindClass");
                logArg("JNIEnv", this.env);
                logArg("char", this.namePtr);
                logValue(this.nameStr);
            },
            onLeave: function (retval) {
                logArg("jclass", retval);
                logReturn(retval);
                logFooter();
            }
        });

        // Trace GetMethodID & GetStaticMethodID
        function hookGetMethodID(offset, isStatic) {
            const funcPtr = env.handle.readPointer().add(offset * Process.pointerSize).readPointer();
            const funcName = isStatic ? "GetStaticMethodID" : "GetMethodID";
            Interceptor.attach(funcPtr, {
                onEnter: function (args) {
                    this.env = args[0];
                    this.clazz = args[1];
                    this.namePtr = args[2];
                    this.sigPtr = args[3];
                    this.nameStr = readCString(this.namePtr);
                    this.sigStr = readCString(this.sigPtr);
                    logHeader(funcName);
                    logArg("JNIEnv", this.env);
                    logArg("jclass", this.clazz);
                    logArg("char", this.namePtr);
                    logValue(this.nameStr);
                    logArg("char", this.sigPtr);
                    logValue(this.sigStr);
                },
                onLeave: function (retval) {
                    const fullSig = `${this.nameStr} ${this.sigStr}`;
                    methodMap.set(retval.toString(), fullSig);
                    logArg("jmethodID", `${retval} { ${fullSig} }`);
                    logReturn(retval);
                    logFooter();
                }
            });
        }

        // Offsets in JNIEnv struct: GetMethodID = 33, GetStaticMethodID = 113
        hookGetMethodID(33, false);
        hookGetMethodID(113, true);

        // Trace NewStringUTF
        const NewStringUTF = env.handle.readPointer().add(167 * Process.pointerSize).readPointer();
        Interceptor.attach(NewStringUTF, {
            onEnter: function (args) {
                this.env = args[0];
                this.bytes = args[1];
                this.str = readCString(this.bytes);
                logHeader("NewStringUTF");
                logArg("JNIEnv", this.env);
                logArg("char", this.bytes);
                logValue(this.str);
            },
            onLeave: function (retval) {
                logArg("jstring", retval);
                logReturn(retval);
                logFooter();
            }
        });

        // Trace GetStringUTFChars
        const GetStringUTFChars = env.handle.readPointer().add(169 * Process.pointerSize).readPointer();
        Interceptor.attach(GetStringUTFChars, {
            onEnter: function (args) {
                this.env = args[0];
                this.jstr = args[1];
                logHeader("GetStringUTFChars");
                logArg("JNIEnv", this.env);
                logArg("jstring", this.jstr);
            },
            onLeave: function (retval) {
                const strVal = readCString(retval);
                logArg("char", `${retval} { ${strVal} }`);
                logReturn(retval);
                logFooter();
            }
        });

        // Trace CallStaticVoidMethodV / CallObjectMethodV Generic Handler
        function hookCallMethod(offset, methodName, isObject) {
            const funcPtr = env.handle.readPointer().add(offset * Process.pointerSize).readPointer();
            Interceptor.attach(funcPtr, {
                onEnter: function (args) {
                    this.env = args[0];
                    this.target = args[1]; // jobject or jclass
                    this.methodID = args[2];
                    this.vaList = args[3];
                    const resolvedSig = methodMap.get(this.methodID.toString()) || "unknown()V";
                    logHeader(methodName);
                    logArg("JNIEnv", this.env);
                    logArg(isObject ? "jobject" : "jclass", this.target);
                    logArg("jmethodID", this.methodID);
                    logValue(resolvedSig);
                    logArg("va_list", this.vaList);
                },
                onLeave: function (retval) {
                    if (isObject) {
                        logArg("jobject", retval);
                    } else {
                        logValue("void");
                    }
                    logReturn(retval);
                    logFooter();
                }
            });
        }

        // Offsets in JNIEnv: CallObjectMethodV = 35, CallStaticVoidMethodV = 143
        hookCallMethod(35, "CallObjectMethodV", true);
        hookCallMethod(143, "CallStaticVoidMethodV", false);

        // Trace standard C libc strlen calls
        const strlenPtr = Module.findExportByName(null, "strlen");
        if (strlenPtr) {
            Interceptor.attach(strlenPtr, {
                onEnter: function (args) {
                    this.str = readCString(args[0]);
                },
                onLeave: function (retval) {
                    // Filter out short or empty logs to keep output clean
                    if (this.str && this.str.length > 5 && this.str.includes("/")) {
                        logHeader("strlen");
                        console.log(`${TAG}|- /${this.str}`);
                        console.log(`${TAG}|=${retval}`);
                        logReturn(retval);
                        logFooter();
                    }
                }
            });
        }
    });
})();
