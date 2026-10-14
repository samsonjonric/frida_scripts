# Frida Dynamic Instrumentation Scripts 🚀

A curated repository of specialized Frida scripts designed for Android application security assessments, malware analysis, reverse engineering, and behavior mocking.

## 📌 Key Capabilities Included

### 🔒 Cryptography & Security Bypass
* **SSL Unpinning**: Bypass certificate verification in Java and custom network clients (`ssl_unpining_java.js`, `X509_verify_cert.js`, `X509_verify_certv2.1.js`).
* **Decryption**: Intercept and hook cryptographic operations to capture plain-text payloads (`decrypto.js`).

### 📦 Memory Dumping & Deobfuscation
* **DEX Dumping**: Extract and dump packed or dynamically loaded DEX files from memory (`unpacking_dex_dump.js`, `memory_dump.js`, `memory_dump_dex_deepsearch.js`, `memory_dump_dex_default_option.js`).
* **Native Deobfuscation**: Analyze obfuscated native libraries in memory (`native_deobfuscation.js`).

### 📱 Device Mocking & Anti-Analysis
* **Device Characteristics**: Spoof device configurations and fingerprints for multiple brands like Oppo, Xiaomi, Samsung, and Vivo to bypass device-locked restrictions.
* **Anti-Cloaking**: Defeat server-side or client-side evasion techniques (`rivera_anti_cloaking.js`, `bread_tf_cloaking.js`).

### 🛡️ Fraud & Sniffing Analysis
* **Toll Fraud Sniffer**: Hook and analyze Premium SMS/WAP billing vectors (`toll_fraud_jw.js`, `toll_fraud_ua.js`).
* **Sensitive Data Collection**: Monitor runtime behavior of apps collecting user credentials, cookies, or other telemetry data (`sensitive-data-collection-sniffer.js`, `fake_cookie_fb_phishing.js`).

---

## 🛠️ Usage Instructions

### 1. Prerequisites
Ensure you have the matching version of `frida-server` running on your target Android device (root or emulator) and the client installed locally:
```bash
pip install frida-tools
