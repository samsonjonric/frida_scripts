Java.perform(function () {
    console.log("[*] Starting Nested Binary Asset Decryption Script...");

    // Full nested paths discovered from the asset scan
    var binaryAssets = [
        "gvqvf/vsjqbmnlu/vbxufsxpcfgkz",
        "imsjrveh/jjfllzj/ympijkfvjw",
        "iycajslu/akrhoy/sjsczblsa",
        "kmnxqtu/qpechija/vwyylxdvol",
        "mrhslmi/whqetbn/iylyvvsccyo",
        "pitnktr/ryoihn/nptoifakvgs",
        "quaver/silted/vault_profile.cfg",
        "tangle/fallow/dust_index.ini"
    ];

    try {
        var currentApp = Java.use("android.app.ActivityThread").currentApplication();
        if (currentApp == null) {
            console.log("[-] Application context not available.");
            return;
        }
        var context = currentApp.getApplicationContext();
        var assetManager = context.getAssets();
        
        var I7c = Java.use("I7.c");
        var StringClass = Java.use("java.lang.String");

        binaryAssets.forEach(function (filepath) {
            console.log("\n========================================");
            console.log("[*] Reading path: " + filepath);
            
            try {
                // 1. Read raw bytes from AssetManager using full path
                var inputStream = assetManager.open(filepath);
                var ByteArrayOutputStream = Java.use("java.io.ByteArrayOutputStream");
                var buffer = ByteArrayOutputStream.$new();
                var data = Java.array('byte', [1024]);
                var nRead;
                
                while ((nRead = inputStream.read(data, 0, data.length)) != -1) {
                    buffer.write(data, 0, nRead);
                }
                inputStream.close();
                var fileBytes = buffer.toByteArray();
                console.log("    [+] Read " + fileBytes.length + " bytes.");

                // 2. Parse header using I7.c.s
                var pair = I7c.s(fileBytes);
                var v0_3 = pair.component1().intValue();
                var v9_6 = pair.component2().intValue();

                var v1_2 = v0_3 + 32;
                var v2_2 = fileBytes.length - v9_6;
                var v3_0 = v2_2 - 12;

                // 3. Extract segments
                var v4_2 = Java.use("java.util.Arrays").copyOfRange(fileBytes, 0, v0_3);
                var v5_1 = Java.use("java.util.Arrays").copyOfRange(fileBytes, v0_3, v1_2);
                var v1_3 = Java.use("java.util.Arrays").copyOfRange(fileBytes, v1_2, v3_0);
                var v3_1 = Java.use("java.util.Arrays").copyOfRange(fileBytes, v3_0, v2_2);
                var tagBytes = Java.use("java.util.Arrays").copyOfRange(fileBytes, v2_2, fileBytes.length);

                // 4. Derive key via I7.c.t
                var derivedKey = I7c.t(v5_1, v4_2, tagBytes);

                // 5. Initialize AES-GCM Cipher and Decrypt
                var Cipher = Java.use("javax.crypto.Cipher");
                var SecretKeySpec = Java.use("javax.crypto.spec.SecretKeySpec");
                var GCMParameterSpec = Java.use("javax.crypto.spec.GCMParameterSpec");

                var cipher = Cipher.getInstance("AES/GCM/NoPadding");
                cipher.init(2, SecretKeySpec.$new(derivedKey, "AES"), GCMParameterSpec.$new(128, v3_1));
                cipher.updateAAD(I7c.e(v0_3, v9_6));

                var decryptedBytes = cipher.doFinal(v1_3);
                var resultStr = StringClass.$new(decryptedBytes, "UTF-8");
                
                console.log("    [SUCCESS] Decrypted Content:\n" + resultStr);

            } catch (err) {
                console.log("    [-] Decryption failed for " + filepath + ": " + err.message);
            }
        });

    } catch (e) {
        console.error("[-] Error: " + e.message);
    }
});
