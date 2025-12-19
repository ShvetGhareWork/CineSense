# Add project specific ProGuard rules here.
# By default, the flags in this file are appended to flags specified
# in /usr/local/Cellar/android-sdk/24.3.3/tools/proguard/proguard-android.txt
# You can edit the include path and order by changing the proguardFiles
# directive in build.gradle.
#
# For more details, see
#   http://developer.android.com/guide/developing/tools/proguard.html

# react-native-reanimated
-keep class com.swmansion.reanimated.** { *; }
-keep class com.facebook.react.turbomodule.** { *; }

# Add any project specific keep options here:

# ===== RELEASE BUILD FIXES =====

# Axios - HTTP client library
-keep class axios.** { *; }
-keepclassmembers class axios.** { *; }

# React Native Config - Environment variables
-keep class com.lugg.ReactNativeConfig.** { *; }
-keepclassmembers class com.lugg.ReactNativeConfig.** { *; }

# AsyncStorage
-keep class com.reactnativecommunity.asyncstorage.** { *; }
-keepclassmembers class com.reactnativecommunity.asyncstorage.** { *; }

# MMKV - Fast storage
-keep class com.tencent.mmkv.** { *; }
-keepclassmembers class com.tencent.mmkv.** { *; }

# OkHttp - Used by Axios
-dontwarn okhttp3.**
-dontwarn okio.**
-keep class okhttp3.** { *; }
-keep interface okhttp3.** { *; }
-keep class okio.** { *; }

# Retrofit (if used)
-dontwarn retrofit2.**
-keep class retrofit2.** { *; }
-keepattributes Signature
-keepattributes Exceptions

# JSON serialization
-keepattributes *Annotation*
-keepclassmembers class * {
    @com.google.gson.annotations.SerializedName <fields>;
}
-keep class com.google.gson.** { *; }

# Keep native methods
-keepclasseswithmembernames class * {
    native <methods>;
}

# Keep JavaScript interface for WebView
-keepclassmembers class * {
    @android.webkit.JavascriptInterface <methods>;
}

# React Native
-keep,allowobfuscation @interface com.facebook.proguard.annotations.DoNotStrip
-keep,allowobfuscation @interface com.facebook.proguard.annotations.KeepGettersAndSetters
-keep,allowobfuscation @interface com.facebook.common.internal.DoNotStrip

-keep @com.facebook.proguard.annotations.DoNotStrip class *
-keep @com.facebook.common.internal.DoNotStrip class *
-keepclassmembers class * {
    @com.facebook.proguard.annotations.DoNotStrip *;
    @com.facebook.common.internal.DoNotStrip *;
}

-keepclassmembers @com.facebook.proguard.annotations.KeepGettersAndSetters class * {
  void set*(***);
  *** get*();
}

# Hermes
-keep class com.facebook.hermes.unicode.** { *; }
-keep class com.facebook.jni.** { *; }

# Expo
-keep class expo.modules.** { *; }
-keepclassmembers class expo.modules.** { *; }

# Network security - don't obfuscate SSL/TLS classes
-keep class javax.net.ssl.** { *; }
-keep class org.apache.http.** { *; }
-dontwarn org.apache.http.**
-dontwarn javax.net.ssl.**

# Keep BuildConfig
-keep class **.BuildConfig { *; }

# Crashlytics (if you add it later)
-keepattributes SourceFile,LineNumberTable
-keep public class * extends java.lang.Exception

