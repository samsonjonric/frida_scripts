/* FG SCRIPT. Please keep this line. Required by Marmot-Frida. */
/**
 * @fileoverview SSL unpinning Frida script for Java libraries.
 *
 * The script will hook Java methods and try to bypass SSL pinning.
 *
 * The script can't handle the ssl pinning implemented in native code, like
 * Flutter and Unity.
 */

/** @type {string}. Tag for logcat. */
const LOG_TAG = 'FG';
/** @type {string}. Path of the certificate file. */
const CERT_PATH = '/system/etc/security/cacerts/74a85f70.0';

/**
 * Logs messages
 * @param {string} msg
 */
function logMessage(msg) {
  const androidLog = Java.use('android.util.Log');
  androidLog.e('FG', msg);
  console.log(msg);
}

/**
 * Bypass standard SSLPinning libraries
 */
function sslstrip() {
  Java.perform(() => {
    logMessage('[.] Android Cert Pinning Bypass');
    const CertificateFactory =
        Java.use('java.security.cert.CertificateFactory');
    const FileInputStream = Java.use('java.io.FileInputStream');
    const BufferedInputStream = Java.use('java.io.BufferedInputStream');
    const KeyStore = Java.use('java.security.KeyStore');
    const TrustManagerFactory = Java.use('javax.net.ssl.TrustManagerFactory');
    const SSLContext = Java.use('javax.net.ssl.SSLContext');
    const tmfAlgorithm = TrustManagerFactory.getDefaultAlgorithm();
    const tmf = TrustManagerFactory.getInstance(tmfAlgorithm);

    try {
      const TrustManagerImpl =
          Java.use('com.android.org.conscrypt.TrustManagerImpl');

      logMessage('[+] TrustManagerImpl Found');
      TrustManagerImpl.verifyChain.implementation = function(
          untrustedChain, trustAnchorChain, host, clientAuth, ocspData,
          tlsSctData) {
        logMessage('[o] App invoked TrustManagerImpl.verifyChain...');
        return untrustedChain;
      };
    } catch (err) {
      logMessage('[-] TrustManagerImpl Not Found');
    }

    const cf = CertificateFactory.getInstance('X.509');

    try {
      const fileInputStream = FileInputStream.$new(CERT_PATH);
      const bufferedInputStream = BufferedInputStream.$new(fileInputStream);
      const ca = cf.generateCertificate(bufferedInputStream);
      bufferedInputStream.close();
      // const X509Certificate = Java.use('java.security.cert.X509Certificate');
      // const certInfo = Java.cast(ca, X509Certificate);
      // logMessage('[o] Our CA Info: ' + certInfo.getSubjectDN());
      // Create a KeyStore containing our trusted CAs
      // logMessage("[+] Creating a KeyStore for our CA...");
      const keyStoreType = KeyStore.getDefaultType();
      const keyStore = KeyStore.getInstance(keyStoreType);
      keyStore.load(/* stream= */ null, /* password= */ null);
      keyStore.setCertificateEntry('ca', ca);

      // Create a TrustManager that trusts the CAs in our KeyStore
      // logMessage("[+] Creating a TrustManager that trusts the CA in our
      // KeyStore...");
      tmf.init(keyStore);
      logMessage('[+] Our TrustManager is ready...');

      // logMessage("[+] Hijacking SSLContext methods now...")
      // logMessage("[-] Waiting for the app to invoke SSLContext.init()...")
      SSLContext.init
          .overload(
              '[Ljavax.net.ssl.KeyManager;', '[Ljavax.net.ssl.TrustManager;',
              'java.security.SecureRandom')
          .implementation = function(a, b, c) {
        logMessage('[o] App invoked javax.net.ssl.SSLContext.init...');
        SSLContext.init
            .overload(
                '[Ljavax.net.ssl.KeyManager;', '[Ljavax.net.ssl.TrustManager;',
                'java.security.SecureRandom')
            .call(this, a, tmf.getTrustManagers(), c);
        // logMessage("[+] SSLContext initialized with our custom
        // TrustManager!");
      };
    } catch (err) {
      logMessage('[o] ' + err);
    }

    //-------
    // OkHTTP v3.x
    // Wrap the logic in a try/catch as not all applications will have
    // okhttp as part of the app.

    try {
      const CertificatePinner = Java.use('okhttp3.CertificatePinner');
      logMessage('[+] OkHTTP 3.x Found');
      CertificatePinner.check.overload('java.lang.String', 'java.util.List')
          .implementation = function() {
        logMessage('[+] OkHTTP 3.x check() called. Not throwing an exception.');
      };
    } catch (err) {
      // If we don't have a ClassNotFoundException exception, raise the
      // problem encountered.
      logMessage('[-] OkHTTP 3.x Not Found');
    }

    //--------
    // logMessage("[.] Appcelerator Titanium detection...");
    // Appcelerator Titanium PinningTrustManager
    // Wrap the logic in a try/catch as not all applications will have
    // appcelerator as part of the app.
    try {
      const PinningTrustManager =
          Java.use('appcelerator.https.PinningTrustManager');
      logMessage('[+] Appcelerator Titanium Found');
      PinningTrustManager.checkServerTrusted.implementation = function() {
        logMessage(
            '[+] Appcelerator checkServerTrusted() called. ' +
            'Not throwing an exception.');
      };

    } catch (err) {
      // If we don't have a ClassNotFoundException exception, raise the
      // problem encountered.
      logMessage('[-] Appcelerator Titanium Not Found');
    }
  });
}

sslstrip();