/* FG SCRIPT. Please keep this line. */

/**
 * @fileoverview Resubmitter to patch libflutter.so files to remove SSL pinning.
 * See go/asop-flutter-ssl-unpinning.
 */

// ===== HELPER FUNCTIONS =====

/**
 * Overwrite logcat to logcat log
 * @param {string} s: The log message
 */
function logcat(s) {
    s = "[!] " + s
    console.log(s);
    Java.perform(function () {
        const androidLog = Java.use('android.util.Log');
        //if (s != '') {
          androidLog.d('FG', s);
        //}
    });
}

/**
 * Get the stack trace String
 * @param {!integer} index: The depth of desired stack trace
 * @return {string}: stacktrace string
 */
function getCaller(index){
  return clazz_Thread.currentThread().getStackTrace()[index + 1];
}

/**
 * Get the caller string, and add it into the arguments map. The caller info
 * will be queriable from marmotlogger_data.calls.arg_value_pairs
 * @param {!Object<string, string>} smart_args: the argument map
 * @param {!integer} depth: The stack trace depth
 */
function logCaller(smart_args, depth){
  for (let i = 1; i < depth; i++){
    smart_args["frida_marmot_caller_" + String(i)] = String(getCaller(i+1));
  }
}

// ===== HOOKING FUNCTIONS =====

function onMatch(address, size, arch) {
    logcat('[+] ssl_crypto_x509_session_verify_cert_chain found at: ' + address.toString() + '. Architecture: ' + arch);
    logcat('[+] Setting up hook.... ');

    try {
        logcat('[+] Changing permissions to rwx.... ');
        Memory.protect(address, size, 'rwx');

        logcat('[+] Reading original code...');

        logcat(hexdump(address.readByteArray(10)));

        logcat('[+] Patching code.... ');

        switch (arch) {
          case "32-bit_ARM":
            var payload = [];
            payload.push(...[0x2d, 0xe9, 0xf0, 0x4f]);     // 00: push {r4-r11, lr}
            payload.push(...[0x01, 0x20]);                 // 1c: movs r0, #1
            payload.push(...[0xbd, 0xe8, 0xf0, 0x8f]);     // 20: pop {r4-r11, pc}
            address.writeByteArray(payload);
            break;
          case "64-bit_ARM":
            // mov x0, #1
            // ret
            var payload = [];
            payload.push(...[0x20, 0x00, 0x80, 0xd2]);     // movz x0, #0x1
            payload.push(...[0xc0, 0x03, 0x5f, 0xd6]);     // ret
            address.writeByteArray(payload);
            break;
          case "64-bit_x86":
            // xor rax, rax
            // add rax, 0x1
            // ret
            var payload = [];
            payload.push(...[0x48, 0x31, 0xc0]);           // xor rax, rax
            payload.push(...[0x48, 0x83, 0xc0, 0x01]);     // add rax, 1
            payload.push(...[0xc3]);                       // ret
            address.writeByteArray(payload);
            break;
        }
        logcat('[+] Success?');
        logcat(hexdump(address.readByteArray(100)));
    } catch (err) {
        logcat("[!] Error while setting up hook: " + err);
    }

    return 'stop';
}

function hook(range){
    var ALL_HOOKS = {"64-bit_x86": ["55 41 57 41 56 41 55 41 54 53 ?? ?? ?? ?? ?? ?? ?? c6 02 50", "55 41 57 41 56 41 55 41 54 53 ?? ?? ?? ?? c6 02 50"], "64-bit_ARM": ["ff c3 01 d1 ?? ?? 01 a9 ?? ?? 02 a9 ?? ?? 03 a9 ?? ?? 04 a9 ?? ?? 05 a9 ?? ?? 06 a9 08 0a 80 52 48 00 00 39 ?? 54 40 f9", "ff 03 05 d1 ?? ?? 0f a9 ?? ?? 10 a9 ?? ?? 11 a9 ?? ?? 12 a9 ?? ?? 13 a9 08 0a 80 52 48 00 00 39 ?? 54 40 f9", "ff 03 05 d1 ?? ?? 00 f9 ?? ?? 10 a9 ?? ?? 11 a9 ?? ?? 12 a9 ?? ?? 13 a9 08 0a 80 52 48 00 00 39 ?? 54 40 f9", "ff 03 05 d1 fd 7b 0f a9 ?? ?? ?? ?? 08 0a 80 52 48 00 00 39 ?? 54 40 f9", "ff 43 05 d1 ?? ?? 0f a9 ?? ?? 00 f9 ?? ?? 11 a9 ?? ?? 12 a9 ?? ?? 13 a9 ?? ?? 14 a9 fd c3 03 91 08 0a 80 52 48 00 00 39 ?? 54 40 f9", "ff c3 01 d1 fe 0b 00 f9 fc 6f 02 a9 fa 67 03 a9 f8 5f 04 a9 f6 57 05 a9 f4 4f 06 a9 08 0a 80 52 48 00 00 39"], "32-bit_ARM": ["2d e9 f0 4f ?? b0 ?? 46 50 20 10 70 ?? f8 98", "f0 b5 03 af 2d e9 00 0f ?? b0 ?? 46 50 20 10 70 ?? f8 98"]};

    for (var arch in ALL_HOOKS) {
      var patterns = ALL_HOOKS[arch];
      patterns.forEach(function(pattern) {
        //logcat("Attempting " + pattern);
        var results = Memory.scanSync(range.base, range.size, pattern);
        results.forEach(function (m) {
          logcat("Match at offset: " + m.address.sub(range.base));
          onMatch(m.address, m.size, arch);
        });
      });
    }
}

// ===== LIBRARY LOADING FUNCTIONS =====

function loadLibrary(libname, classLoader = null) {
  Java.perform(function () {
    const Runtime = Java.use('java.lang.Runtime');
    const String_ = Java.use('java.lang.String');
    const ClassLoader = Java.use('java.lang.ClassLoader');
    const VMStack = Java.use('dalvik.system.VMStack');

    if (classLoader == null) {
      classLoader = VMStack.getCallingClassLoader();
    }

    // Load library
    var androidVersion = parseInt(Java.androidVersion.split(".")[0])
    if (androidVersion > 7) {
      // Above Android N
      logcat("Android Version > 7");
      var loadLibraryMethod = Runtime.class.getDeclaredMethod("loadLibrary0", [ClassLoader.class, String_.class]);
      loadLibraryMethod.setAccessible(true);
      return loadLibraryMethod.invoke(Runtime.getRuntime(), classLoader, libname)
    } else {
      // Android N and below
      logcat("Android Version <= 7");
      return Runtime.getRuntime().loadLibrary(libname, classLoader);
    }
  });
}

// ===== INITIALIZATION =====

logcat("==============");
logcat("[+] marmot_flutter_sslunpinner.js (r2)");

Java.perform(function() {
    const String_ = Java.use('java.lang.String');
    const ClassLoader = Java.use('java.lang.ClassLoader');
    const System = Java.use('java.lang.System');
    const Runtime = Java.use('java.lang.Runtime');
    const SystemLoad_2 = System.loadLibrary.overload('java.lang.String');
    const VMStack = Java.use('dalvik.system.VMStack');
    const VMRuntime = Java.use('dalvik.system.VMRuntime');
    const Method = Java.use('java.lang.reflect.Method');
    const ActivityThread = Java.use("android.app.ActivityThread");

    SystemLoad_2.implementation = function(library) {
        if (library != "flutter") {
          logcat("Skipping library: " + library);
          return loadLibrary(library);
        }

        var classLoader = VMStack.getCallingClassLoader();
        var filename = classLoader.findLibrary(library);
        if (filename == null) {
            filename = System.mapLibraryName(library);
        }

        var cacheDir = ActivityThread.currentApplication().getApplicationContext().getCacheDir();
        var filesDir = ActivityThread.currentApplication().getApplicationContext().getFilesDir();
        logcat("Library path");
        logcat(filename);
        logcat("New library path");
        //var filename2 = filename.substring(0, filename.length - 3) + "2.so";
        //var filename2 = Java.classFactory.cacheDir + "/libflutter2.so";
        var filename2 = cacheDir + "/libflutter2.so";
        logcat(filename2);
        logcat(filesDir);

        // Open and map libflutter.so into memory

        const getuidPtr = Module.getExportByName('libc.so', 'getuid');
        const getuid = new NativeFunction(getuidPtr, 'int', []);

        const openPtr = Module.getExportByName('libc.so', 'open');
        const open = new NativeFunction(openPtr, 'int', ['pointer', 'int']);

        const chmodPtr = Module.getExportByName('libc.so', 'chmod');
        const chmod = new NativeFunction(chmodPtr, 'int', ['pointer', 'int']);

        const lseekPtr = Module.getExportByName('libc.so', 'lseek');
        const lseek = new NativeFunction(lseekPtr, 'int', ['int', 'int', 'int']);

        const creatPtr = Module.getExportByName('libc.so', 'creat');
        const creat = new NativeFunction(creatPtr, 'int', ['pointer', 'int']);

        const closePtr = Module.getExportByName('libc.so', 'close');
        const close = new NativeFunction(closePtr, 'int', ['int']);

        const mmapPtr = Module.getExportByName('libc.so', 'mmap');
        const mmap = new NativeFunction(mmapPtr, 'pointer', ['pointer', 'int', 'int', 'int', 'int', 'int']);

        const mprotectPtr = Module.getExportByName('libc.so', 'mprotect');
        const mprotect = new NativeFunction(mprotectPtr, 'int', ['pointer', 'int', 'int']);

        const memcpyPtr = Module.getExportByName('libc.so', 'memcpy');
        const memcpy = new NativeFunction(memcpyPtr, 'pointer', ['pointer', 'pointer', 'int']);

        const ftruncatePtr = Module.getExportByName('libc.so', 'ftruncate');
        const ftruncate = new NativeFunction(ftruncatePtr, 'int', ['int', 'int']);

        const munmapPtr = Module.getExportByName('libc.so', 'munmap');
        const munmap = new NativeFunction(munmapPtr, 'int', ['pointer', 'int']);

        const msyncPtr = Module.getExportByName('libc.so', 'msync');
        const msync = new NativeFunction(msyncPtr, 'int', ['pointer', 'int', 'int']);

        const errnoPtr = Module.getExportByName('libc.so', '__errno');
        const errno = new NativeFunction(errnoPtr, 'pointer', []);

        const strerrorPtr = Module.getExportByName('libc.so', 'strerror');
        const strerror = new NativeFunction(strerrorPtr, 'pointer', ['int']);

        function printError() {
            logcat("Error: " + strerror(errno().readInt()).readUtf8String());
        }

        logcat("Running as uid:");
        logcat(getuid());

        // Allocate filenames to heap
        var fp = Memory.allocUtf8String(filename);
        var fp2 = Memory.allocUtf8String(filename2);

        var O_RDONLY = 0;
        var O_WRONLY = 1;
        var O_RDWR = 2;
        var O_CREAT = 0x200;
        var O_APPEND = 8;

        logcat("Opening 1");
        logcat("open(" + fp + ", O_RDONLY");
        try {
          var fd = open(fp, O_RDONLY);
          if (fd == -1) {
            printError();
          }
        } catch(err) {
          logcat(err);
        }
        logcat(fd);

        logcat("Getting size 1");
        logcat("lseek(" + fd + ", 0, 2)");
        try {
          var MAX_SIZE = lseek(fd, 0, 2);
          logcat("Size: " + MAX_SIZE);
        } catch(err) {
          logcat(err);
        }
        logcat(fd);

        logcat("Creating 2");
        logcat("creat(" + fp2 + ", 644)");
        try {
          var fd_ = creat(fp2, parseInt("644", 8));
          if (fd_ == -1) {
            printError();
          }
          close(fd_);
        } catch (err) {
          logcat(err);
        }
        logcat(fd_);

        logcat("Opening 2");
        logcat("open(" + fp2 + ", O_RDWR)");
        try {
          var fd2 = open(fp2, O_RDWR);
          if (fd2 == -1) {
            printError();
          }
        } catch (err) {
          logcat(err);
        }
        logcat(fd2);

        logcat("Resizing 2");
        logcat("ftruncate(" + fd2 + ", MAX_SIZE)");
        try {
          var res = ftruncate(fd2, MAX_SIZE);
          if (res == -1) {
            printError();
          }
        } catch (err) {
          logcat(err);
        }

        logcat("Mapping files");
        var PROT_READ = 1;
        var PROT_WRITE = 2;
        var PROT_EXECUTE = 4;
        var MAP_SHARED = 1;
        var MAP_PRIVATE = 2;
        logcat("Mapping 1");
        logcat("mmap(ptr(0, MAX_SIZE, PROT_READ | PROT_WRITE, MAP_PRIVATE, " + fd + ", 0)");
        try {
          var addr = mmap(ptr(0), MAX_SIZE, PROT_READ | PROT_WRITE, MAP_PRIVATE, fd, 0);
          logcat(addr);
          if (addr == 0xffffffff) {
            printError();
          }
        } catch (err) {
          logcat(err);
        }

        logcat("Mapping 2");
        logcat("mmap(ptr(0, MAX_SIZE, PROT_READ | PROT_WRITE, MAP_SHARED, " + fd2 + ", 0)");
        try {
          var addr2 = mmap(ptr(0), MAX_SIZE, PROT_READ | PROT_WRITE, MAP_SHARED, fd2, 0);
          logcat(addr2);
          if (addr2 == 0xffffffff) {
            printError();
          }
        } catch (err) {
          logcat(err);
        }

        logcat("Copying files");
        logcat("Memory.copy(" + ptr(addr2) + ", " + ptr(addr) + ", MAX_SIZE-1");
        try {
          Memory.copy(ptr(addr2), ptr(addr), MAX_SIZE-1);
        } catch(err) {
          logcat(err);
        }

        logcat("Running hook+patch");
        var range = {
            base: ptr(addr2),
            size: MAX_SIZE
        }

        hook(range);

        logcat("Syncing files");
        var MS_SYNC = 2;
        try {
          var success = msync(ptr(addr), MAX_SIZE - 1, MS_SYNC);
          logcat(success);
        } catch (err) {
          logcat(err);
        }

        logcat("Munmapping 1");
        munmap(addr, MAX_SIZE);

        logcat("Munmapping 2");
        munmap(addr2, MAX_SIZE);

        logcat("Closing 1");
        close(fd);

        logcat("Closing 2");
        close(fd2);

        var Object_ = Java.use("java.lang.Object");
        var File = Java.use("java.io.File");
        var ArrayList = Java.use("java.util.ArrayList");
        var Arrays = Java.use("java.util.Arrays");
        var List = Java.use("java.util.List");
        var Field = Java.use("java.lang.reflect.Field");
        var Modifier = Java.use("java.lang.reflect.Modifier");
        var DexPathList = Java.use("dalvik.system.DexPathList");
        var PathClassLoader = Java.use("dalvik.system.PathClassLoader");
        var BaseDexClassLoader = Java.use("dalvik.system.BaseDexClassLoader");
        logcat("Loading library");
        try {
          // Define fields/methods from reflection
          var pathListField = BaseDexClassLoader.class.getDeclaredField("pathList");
          pathListField.setAccessible(true);
          var definingContextField = DexPathList.class.getDeclaredField("definingContext");
          definingContextField.setAccessible(true);
          var dexElementsField = DexPathList.class.getDeclaredField("dexElements");
          dexElementsField.setAccessible(true);
          var nativeLibraryDirectoriesField = DexPathList.class.getDeclaredField("nativeLibraryDirectories");
          nativeLibraryDirectoriesField.setAccessible(true);

          // Get original path list
          var pathList = pathListField.get(classLoader);

          // Reconstruct `definingContext`
          var definingContext = definingContextField.get(pathList);

          // Reconstruct `dexPath`
          // (We actually just get `dexElements` here, see above)
          var dexPath = "";  // We assign dexElements directly later
          var dexElements = dexElementsField.get(pathList);

          // Reconstruct `libraryPath`
          // We also add our `cacheDir` here
          var nativeLibraryDirectories = Java.cast(nativeLibraryDirectoriesField.get(pathList), List);
          var libraryPath = "";
          for (var i = 0; i < nativeLibraryDirectories.size(); i+=1) {
            var f = Java.cast(nativeLibraryDirectories.get(i), File).getPath();
            libraryPath += f + ":";
          }
          libraryPath += cacheDir;

          // Reconstruct `optimizedDirectory`
          // We set this to null. Unsure if there are scenarios where this
          // breaks.
          var optimizedDirectory = null;

          // Construct new DexPathList and patch it into our ClassLoader
          var newPathList = DexPathList.$new(definingContext, dexPath, libraryPath, optimizedDirectory);
          dexElementsField.set(newPathList, dexElements);  // See `dexPath` hack above
          pathListField.set(classLoader, newPathList);

          // Load library
          return loadLibrary("flutter2", classLoader);
        } catch (err) {
          logcat("OH NO!!!");
          logcat(err);
        }
        logcat("ALL DONE");
        logcat(output);
        return output;
    };
});