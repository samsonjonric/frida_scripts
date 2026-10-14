// FG SCRIPT.
// Start frida-server on device using `adb shell /data/local/tmp/frida-server &`
//
// To run this script under a given package name, run:
//    frida -U --no-pause -l mfa_lqa.js -f com.example.package.app

let ad_sdk_prefixes =
    [
      'com.tappx.sdk.android',
      'com.snap.adkit',
      'com.adcolony',
      'com.kakao.adfit',
      'com.applovin',
      'com.appnext.sdk',
      'com.appodeal.ads',
      'com.facebook.ads',
      'tv.superawesome.sdk.publisher',
      'io.bidmachine',
      'com.chartboost',
      'com.criteo.publisher',
      'com.facebook.android',
      'com.fyber',
      'com.hyprmx.android',
      'com.inmobi.monetization',
      'com.kidoz.sdk',
      'net.kidoz.sdk',
      'com.mbridge.msdk.oversea',
      'com.mopub',
      'co.ogury',
      'com.pangle.global',
      'com.pollfish',
      'com.pubmatic.sdk',
      'com.smaato.android.sdk',
      'com.smartadserver.android',
      'com.startapp',
      'com.taboola',
      'com.tapjoy',
      'com.unity3d.ads',
      'com.verizon.ads',
      'net.pubnative',
      'com.vungle',
      'com.yandex.android',
      'com.brightcove.player',
      'com.maio',
      'com.ironsource.sdk',
      'com.ironsource',
      'com.my.target',
      'net.nend.android'
    ]

    let ad_sdk_prefixes_extra = [
      'MobWin.AD',
      'MobWin.ResClickAD',
      'com.waps',
      'cn.waps.AppConnect',
      'cn.appmedia.ad',
      'cn.domob.android.ads',
      'com.google.ads.mediation.Domob',
      'cn.smartmad.ads',
      'com.IQzone.postitial',
      'com.WDA',
      'com.aarki',
      'com.ad_stir',
      'com.adchina',
      'com.adeven.adjustio',
      'com.adfonic.android',
      'com.adjust.sdk',
      'com.admarvel',
      'com.adobe.mediacore.timeline.advertising',
      'com.adsmogo',
      'com.adtech',
      'com.adview',
      'com.adwhirl',
      'com.adwo',
      'com.airpush',
      'com.alimama.mobile',
      'com.amazon.device.ads',
      'com.amobee.adsdk',
      'com.androidwasabi.ads',
      'com.anvato.androidsdk',
      'com.appbrain.a.ad',
      'com.appbrain.Ad',
      'com.appbrain.AppBrain',
      'com.appenda',
      'com.apperhand',
      'com.appia',
      'com.applifier',
      'com.applovin',
      'com.appnext.appnextsdk',
      'com.appnexus.opensdk',
      'com.apprupt',
      'com.appsfire.ad',
      'com.google.ads.mediation.Appsfire',
      'com.appsponsor.appsponsorsdk',
      'com.avocarrot.sdk',
      'com.baidu.mobads',
      'com.bee7',
      'com.brightroll',
      'com.google.ads.mediation.BrightRoll',
      'com.calldorado',
      'com.casee.adsdk',
      'com.cauly',
      'com.chartboost.sdk',
      'com.directtap',
      'com.duapps.ad',
      'com.energysource.sjz',
      'com.facebook.ads',
      'com.liverail.library',
      'com.google.ads.mediation.facebook',
      'com.fiksu',
      'com.flurry.android',
      'com.google.ads.mediation.flurry',
      'com.fractalist.android.ads',
      'com.fractionalmedia.sdk',
      'com.fusepowered.adrally',
      'com.getjar.sdk',
      'com.google.ads',
      'com.google.android.gms.ads',
      'com.google.ads.mediation.AppFlood',
      'com.appflood',
      'com.google.ads.mediation.nend',
      'net.nend.android',
      'com.greystripe',
      'com.greystripe.android.sdk',
      'com.growmobile',
      'com.heyzap',
      'com.huntmads.admobadaptor',
      'com.hypermx.android',
      'com.ibm.icu.d.ad',
      'com.igaworks',
      'com.ignitevision.android.ads',
      'com.inmobi.commons.ads',
      'com.inmobi.androidsdk',
      'com.google.ads.mediation.inmobi',
      'com.inneractive.api.ads',
      'com.integralads.avid',
      'com.intentsoftware.addapptr',
      'com.ironsource.mobilcore',
      'com.jirbo.adcolony',
      'com.jm.co.shallwead',
      'com.jumptap.adtag',
      'com.kenshoo.mobile',
      'com.kidoz.sdk',
      'com.kuguo',
      'com.l.adlib_android',
      'com.leadbolt',
      'com.liverail.library',
      'com.madhouse.android.ads',
      'com.mdotm.android',
      'com.medialets',
      'com.medialets',
      'com.microsoft.advertising.android',
      'com.millennialmedia',
      'com.minimob.android',
      'com.mintegral.msdk',
      'com.moat.analytics.mobile.ogury',
      'com.mobclix.android.sdk',
      'com.mobfox',
      'com.mobileapptracker',
      'com.mobisage',
      'com.mobpartner',
      'com.mobvista.msdk',
      'com.moceanmobile',
      'com.mocoplex.adlib',
      'com.mologiq',
      'com.moolah',
      'com.mopub.common.MoPubBrowser',
      'com.mopub.mobileads',
      'com.motilityads',
      'com.mt.airad',
      'com.namomedia.android',
      'com.nativex',
      'com.nbpcorp.mobilead.sdk',
      'com.nielsen.app.sdk',
      'com.noqoush.adfalcon',
      'com.offercast.android.sdk',
      'com.onelouder.adlib',
      'com.oneriot',
      'com.ooyala.android',
      'com.openx.ad',
      'com.outbrain',
      'com.pinsightmediaplus.advertising',
      'com.pinterest.api.a.ad',
      'com.playhaven.src.publishersdk',
      'com.pocketchange.android',
      'com.pocketchange.android',
      'com.pollfish',
      'com.purplebrain.adbuddiz',
      'com.qeapi.adclient',
      'com.quantcast',
      'com.radiumone.emitter',
      'com.reporo.android.ads',
      'com.revmob.ads',
      'com.rhythmnewmedia.sdk',
      'com.rovio',
      'com.samsung.sdraw.ad',
      'com.sas',
      'com.searchboxsdk.android',
      'com.sellaring',
      'com.senddroid',
      'com.sessionm',
      'com.skplanet.tad',
      'com.sktelecom.tad',
      'com.smaato.soma',
      'com.smartadserver.android',
      'com.sponsorpay',
      'com.plugin.ad.fyber',
      'com.startapp.android.publish',
      'com.suizong.mobplate',
      'com.supersonicads.sdk',
      'com.supersonicads.sdk',
      'com.taboola.android',
      'com.tapcontext',
      'com.tapcore',
      'com.tapdaq',
      'com.tapfortap.Ad',
      'com.tapit.adview',
      'com.tapjoy',
      'com.tappx',
      'com.tapsense.android.publisher',
      'com.tapstream.sdk',
      'com.tencent.mobwin',
      'com.tenjin.android',
      'com.tnkfactory.ad',
      'com.trademob.tracking',
      'com.tremorvideo.sdk.android',
      'com.trialpay.android',
      'com.umengAd',
      'com.unity3d.ads',
      'com.vervewireless.advert',
      'com.voxel.sdk.ad',
      'com.vpon.adon.android',
      'com.vserv.android.ads.network',
      'com.vungle.publisher',
      'com.vungle.warren',
      'com.w3i.advertiser',
      'com.winad',
      'com.wiyun',
      'com.wooboo',
      'com.wqmobile',
      'com.youapi.sdk',
      'com.yume.android.sdk',
      'com.zestadz.android',
      'de.madvertise',
      'io.display.sdk',
      'jp.Adlantis',
      'jp.appAdForce',
      'jp.co.careward',
      'jp.co.careward',
      'jp.co.cyberagent.amoadview',
      'jp.co.cyberz.fox',
      'jp.co.imobile.android.ad',
      'jp.co.septani',
      'jp.gmotech.smaad',
      'kr.co.appdisco',
      'kr.co.cashslide',
      'me.kiip',
      'mediba.ad.sdk.android',
      'com.mediba.jp',
      'mediba.ad.sdk.android',
      'com.mediba.jp',
      'net.adcrops',
      'net.adways',
      'net.avazu.ads.android',
      'net.daum',
      'net.gree',
      'net.metaps.sdk',
      'net.metaps.sdk',
      'net.pubnative.lite',
      'net.youmi',
      'org.nexage',
      'com.nexage',
      'tv.freewheel.ad',
      'vn.adflex'
    ]


console.log = function(s) {
  const androidLog = Java.use('android.util.Log')
  if (s != '') {
    androidLog.d('FG', s)
    // Sends results to Interactive Frida
    send(s)
  }
}

function removeDuplicates(value, index, self) {
  return self.indexOf(value) === index
}

// This class is strictly for logging Marmot Frida Records to the marmot.evaluation table using the MojitoLogger
class MFAFridaLogger {
  static #unity_enabled = false
  static #opengl_enabled = false
  static #mojitoMessage = null
  static #mojitoLogger = null

  static set unity_enabled(unity_enabled) {
    MFAFridaLogger.#unity_enabled = unity_enabled
  }
  static get unity_enabled() {
    return MFAFridaLogger.#unity_enabled
  }

  static set opengl_enabled(opengl_enabled) {
    MFAFridaLogger.#opengl_enabled = opengl_enabled
  }
  static get opengl_enabled() {
    return MFAFridaLogger.#opengl_enabled
  }

  static set mojitoMessage(mojitoMessage) {
    MFAFridaLogger.#mojitoMessage = mojitoMessage
  }
  static get mojitoMessage() {
    return MFAFridaLogger.#mojitoMessage
  }

  static initialize() {
    // Patches the Mojito Logger
    try {
      MFAFridaLogger.mojitoMessage =
          Java.use('com.mojito.utility.MojitoMessage')
      MFAFridaLogger.mojitoLogger = Java.use('com.mojito.utility.MojitoLogger')
      // Makes sure the class can be referenced correctly.
      let message = MFAFridaLogger.mojitoMessage.$new('abc')
      console.log(message.toString())

    } catch (err) {
      console.log(err.message)
    }
  }

  // Checks if Marmot is being used
  static isFridaLogEnabled() {
    if (MFAFridaLogger.unity_enabled || MFAFridaLogger.opengl_enabled) {
      return false
    }
    return typeof (MFAFridaLogger.logMFASignal) == 'function'
  }

  static logMFASignal(methodName, argsMap, returnValue) {
    try {
      let message = MFAFridaLogger.mojitoMessage.$new(methodName)
      message.setFromFrida(true)
      const addArg = MFAFridaLogger.mojitoMessage.addArg.overload(
          'java.lang.String', 'java.lang.Object')
      for (const [key, value] of Object.entries(argsMap)) {
        addArg.call(message, String(key), String(value))
      }
      const setReturn =
          MFAFridaLogger.mojitoMessage.setReturn.overload('java.lang.Object')
      if (returnValue != null) {
        setReturn.call(message, returnValue)
      }
      MFAFridaLogger.mojitoLogger.logMessage(message)

    } catch (err) {
      logAndroidErrForHeader(err.message)
    }
    MFAFridaLogger.logMFASignalToDroppedFile(
        methodName, argsMap, returnValue, '/data/local/tmp/fgout/')
  }

  static logMFASignalToDroppedFile(method_name, argsMap, ret, save_directory) {
    const SAVE_DIRECTORY = save_directory
    var foutstream = Java.use('java.io.FileOutputStream')
    var filePath = SAVE_DIRECTORY + 'mfa_lqa.txt'
    var fos = foutstream.$new(filePath, true)
    var string = Java.use('java.lang.String')
    var msgString = string.$new(method_name)
    var contentBytes = msgString.getBytes()
    fos.write(contentBytes, 0, contentBytes.length)
    msgString = string.$new('\n')
    contentBytes = msgString.getBytes()
    fos.write(contentBytes, 0, contentBytes.length)
    for (const [key, value] of Object.entries(argsMap)) {
      msgString = string.$new(String(key) + ':' + String(value))
      contentBytes = msgString.getBytes()
      fos.write(contentBytes, 0, contentBytes.length)
      msgString = string.$new('\n')
      contentBytes = msgString.getBytes()
      fos.write(contentBytes, 0, contentBytes.length)
    }
    fos.close()
  }
}

// This class helps with find Java classes, figuring out whether an object is an
// ad, printing stack traces and other debug related functions
class MFAUtil {
  static isAd(ad) {
    if (ad == null) { return false }
    return ad_sdk_prefixes.find(v => ad.$className.includes(v)) ||
           ad.$className.includes('AdView')
  }

  static isGoogleAd(ad) {
    if (ad == null) { return false }
    return ad.$className.includes('com.google.android.gms.ads')
  }

  static isGoogleInterstitialAd(activity) {
    if (activity == null) { return false }
    return activity.$className == 'com.google.android.gms.ads.AdActivity'
  }

  // Enumerates class loaders to classes that loaded using non-default ClassLoaders
  // @param {string} className Class name
  // @return {android.app.Activity|null} Class
  static findClassByEnumeratingClassLoaders(className) {
    let clz = null
    Java.enumerateClassLoaders({
      onMatch: function(loader) {
        Java.classFactory.loader = loader
        var testClass
        if (clz == null) {
          try {
            testClass = Java.use(className)
            clz = testClass
          } catch (error) {
            if (error.message.includes('ClassNotFoundException')) {
            }
          }
        }
      },
      onComplete: function() {

      }
    })
    return clz
  }

  // Finds an AdMob class using the class enumerator in Frida
  //
  // Unused on devices that:
  //   1. Don't use dynamite class loading
  //   2. Android 6.0 Marmot images
  //
  // @param {string} className Class name
  // @return {android.app.Activity|null} Class
  static findAdMobClass(className) {
    if (!className.includes('ads') && !className.includes('gms') &&
        !className.includes('google')) {
        return null
    }
    return MFAUtil.findClassByEnumeratingClassLoaders(className)
  }

  // Traverses class and prints all methods
  // @param {string} className Class name
  static printMethodsOfClass(className) {
    var clazz = findClassByEnumeratingClassLoaders(className)
    var methods = clazz.class.getDeclaredMethods()
    for (let i = 0; i < methods.length; i++) {
      console.log(methods[i])
    }
  }

  // Getting stack traces for the current thread
  // @return {string} Stack trace string
  static getStackTraceString() {
    return Java.use('android.util.Log')
        .getStackTraceString(Java.use('java.lang.Exception').$new())
  }

  // Getting stack traces for all threads
  // @return {string} Stack trace string
  static getAllStackTracesString() {
    let stackTracesString = ''
    let threads = Java.use('java.lang.Thread').getAllStackTraces().keySet()
    threads = Java.cast(threads, Java.use('java.util.Set'))
    let iterator = threads.iterator()
    while (iterator.hasNext()) {
      let thread = iterator.next()
      thread = Java.cast(thread, Java.use('java.lang.Thread'))
      stackTracesString += 'Thread Name = ' + thread.getName() + '\n'
      stackTracesString += 'Thread State = ' + thread.getState() + '\n'
      let stackTraces = thread.getStackTrace()
      for (let i = 0; i < stackTraces.length; i++) {
        let stackTrace = stackTraces[i]
        stackTracesString += '\t' + stackTrace.toString() + '\n'
      }
    }
    return stackTracesString
  }

  static printStackTrace() {
    console.log(getStackTraceString())
  }

  static printAllStackTraces() {
    console.log(getAllStackTracesString())
  }
}

// This class is responsible for traversing the view hierarchy and finding all
// relevant views in the view hierarchy, including ads
class MFAViewHierarchy {
  // Returns the base context of a view, which is either an Activity or an
  // Application
  //
  // Uses Java.cast() to cast to the appropriate type, view.getContext() and then
  // contextWrapper.getBaseContext() until we get to either an Activity or
  // Application
  //
  // @param {android.view.View} instance View instance
  // @return {android.app.Activity|android.app.Application|null} Base context
  static getBaseContextFromView(instance) {
    let context = instance.getContext()
    while (context != null) {
      try {
        let activity = Java.cast(context, Java.use('android.app.Activity'))
        if (activity != null) {
          return activity
        }
      } catch (error) {
      }
      try {
        let app = Java.cast(context, Java.use('android.app.Application'))
        if (app != null) {
          return app
        }
      } catch (error) {
      }
      try {
        let contextWrapper =
            Java.cast(context, Java.use('android.content.ContextWrapper'))
        if (contextWrapper != null) {
          context = contextWrapper.getBaseContext()
        }
      } catch (error) {
        context = null
      }
    }
    return null
  }

  // Finds the Activity that a View in the view hierarchy corresponds to
  //
  // Uses Java.cast() to cast to Activity and then contextWrapper.getBaseContext()
  //
  // @param {android.view.View} instance View instance
  // @return {android.app.Activity|null} Activity
  static getActivityFromView(instance) {
    let context = instance.getContext()
    while (context != null) {
      try {
        let activity = Java.cast(context, Java.use('android.app.Activity'))
        if (activity != null) {
          return activity
        }
      } catch (error) {
      }
      try {
        let contextWrapper =
            Java.cast(context, Java.use('android.content.ContextWrapper'))
        if (contextWrapper != null) {
          context = contextWrapper.getBaseContext()
        }
      } catch (error) {
        context = null
      }
    }
    return null
  }

  // Clears out any views that aren't children/leaf nodes in view hierarchy
  //
  // This is to remove any views that are parents of other views in the view
  // hierarchy, such as a LinearLayout that contains multiple ads.
  //
  // @param {Array<android.view.View>} views List of views
  // @return {Array<android.view.View>} List of views
  static removeParentViews(views) {
    let remove = []
    for (let i = views.length - 1; i >= 0; i--) {
      let found = false
      let instance = views[i]
      let parent = instance.getParent()
      let parentClassName = null
      if (parent) {
        parentClassName = parent.$className
      }
      else {
        parentClassName = null
      }
      while (parentClassName) {
        for (let j = views.length - 1; j >= 0; j--) {
          let view = views[j]
          if (i != j && view.$className == parentClassName) {
            found = true
          }
        }
        parent = parent.getParent()
        if (parent) {
          parentClassName = parent.$className
        }
        else {
          parentClassName = null
        }
      }
      if (found) {
        remove.push(i)
      }
    }
    for (let i = 0; i < remove.length; i++) {
      views.splice(remove[i], 1)
    }
    return views
  }

  // Gets all ads from a given root view
  //
  // @param {android.app.Activity} activity Activity instance
  // @param {android.view.View} rootView Root view instance
  // @return {Array<android.view.View>} List of ads
  static findAdsFromRootView(act, rootView) {
    let viewGroup = null
    if (rootView == null) { return null }
    // Checks for AdMob ads first and then look through the list of other ad sdks
    // to determine whether rootView is an ad we're interested in
    if (MFAUtil.isGoogleAd(rootView) || MFAUtil.isAd(rootView)) {
      // For AdMob, com.google.android.gms.ads is the prefix for all relevant on
      // screen ads
      let baseContext = MFAViewHierarchy.getBaseContextFromView(rootView)
      let views = []
      let contexts = []
      if (baseContext.$className == act.getApplicationContext().$className ||
          baseContext.$className == act.$className) {
        if (rootView.getVisibility() == 0 && rootView.isShown()) {
          views.push(rootView)
          contexts.push(baseContext)
          return [views, contexts]
        }
      }
      return null
    }
    try {
      viewGroup = Java.cast(rootView, Java.use('android.view.ViewGroup'))
    } catch (error) {
      viewGroup = null
    }
    if (viewGroup != null) {
      let views = []
      let contexts = []
      let childCount = viewGroup.getChildCount()
      for (let i = 0; i < childCount; i++) {
        let child = viewGroup.getChildAt(i)
        if (child != null) {
          let childResults = MFAViewHierarchy.findAdsFromRootView(act, child)
          if (childResults != null) {
            views = views.concat(childResults[0])

            contexts = contexts.concat(childResults[1])
          }
        }
      }
      return [views, contexts]
    }
    return null
  }

  // Finds ads given a view in the view hierarchy, if its class name is prefixed
  // with the gms identifier and subclasses View we found it
  //
  // @param {android.app.Activity} activity Activity instance
  // @param {android.view.View} rootView Root view instance
  // @return {Array<android.view.View>} List of ads
  static findAdsInActivityFromRootView(act, rootView) {
    let viewGroup = null
    if (rootView == null) { return null }
    // Checks for AdMob ads first and then look through the list of other ad sdks
    // to determine whether rootView is an ad we're interested in
    if (MFAUtil.isGoogleAd(rootView) || MFAUtil.isAd(rootView)) {
      // For AdMob, com.google.android.gms.ads is the prefix for all relevant on
      // screen ads
      let baseContext = MFAViewHierarchy.getBaseContextFromView(rootView)
      let views = []
      let contexts = []
      if (baseContext.$className == act.getApplicationContext().$className ||
          baseContext.$className == act.$className) {
        if (rootView.getVisibility() == 0 && rootView.isShown()) {
          views.push(rootView)
          contexts.push(baseContext)
          return [views, contexts]
        }
      }
      return null
    }
    try {
      viewGroup = Java.cast(rootView, Java.use('android.view.ViewGroup'))

    } catch (error) {
      viewGroup = null
    }
    if (viewGroup != null) {
      let views = []
      let contexts = []
      let childCount = viewGroup.getChildCount()
      for (let i = 0; i < childCount; i++) {
        let child = viewGroup.getChildAt(i)
        if (child != null) {
          let childResults = MFAViewHierarchy.findAdsFromRootView(act, child)
          if (childResults != null) {
            views = views.concat(childResults[0])
            contexts = contexts.concat(childResults[1])
          }
        }
      }
      return [views, contexts]
    }
    return null
  }

  // Prunes ads based on the Activity Class name, the Ad Class Name, the size
  // (width and height) and x and y position
  //
  // If between two ads, all of these characteristics are the same, then prunes
  // them out if there are duplicates
  //
  // Situations where this could pop up is
  //   1. When apps use AdLoadFailure callbacks to load the same kind of ad
  //      multiple times and keep ads for some reason in the view hierarchy
  //   2. When apps use TabLayouts and each tab corresponds to the same kind
  //      of ad in the same place
  //
  // @param {Array<android.view.View>} ads List of ads
  // @return {Array<android.view.View>} List of ads
  static pruneAds(ads_list) {
    let ads = ads_list[0]
    let activities = ads_list[1]
    if (ads == null || activities == null) {
        return []
    }
    let pruned_ads = []
    let pruned_activities = []
    for (let i = 0; i < ads.length; i++) {
      let ad = ads[i]
      let activity = activities[i]
      let found = false
      for (let j = 0; j < pruned_ads.length; j++) {
        let pruned_ad = pruned_ads[j]
        let pruned_activity = pruned_activities[j]
        if (ad.$className == pruned_ad.$className &&
            activity.$className == pruned_activity.$className &&
            ad.getX() == pruned_ad.getX() &&
            ad.getY() == pruned_ad.getY() &&
            ad.getWidth() == pruned_ad.getWidth() &&
            ad.getHeight() == pruned_ad.getHeight()) {
          found = true
        }
      }
      if (!found) {
        pruned_ads.push(ad)
        pruned_activities.push(activity)
      }
    }
    return [pruned_ads, activities]
  }

  // Starts at an activity and traverse the view hierarchy to find the ad
  // Makes sure the view's context or base context is the Activity itself
  //
  // @param {android.app.Activity} activity Activity instance
  // @return {Array<android.view.View>} List of ads
  static findAdsInsideActivity(activity) {
    let window = Java.cast(activity.getWindow(), Java.use('android.view.Window'))
    if (window == null) {
        return []
    }
    return MFAViewHierarchy.findAds(window, activity)
  }

  // Finds ads given a window and activity
  //
  // @param {android.view.Window} window Window instance
  // @param {android.app.Activity} activity Activity instance
  // @return {Array<android.view.View>} List of ads
  static findAds(window, activity) {
    let views = null
    let view = window.getDecorView()
    let results = MFAViewHierarchy.findAdsInActivityFromRootView(activity, view)
    results = MFAViewHierarchy.pruneAds(results)
    if (results != null) {
      views = results[0]
    }
    views = MFAViewHierarchy.removeParentViews(views)
    for (let i = views.length - 1; i >= 0; i--) {
      let ad = views[i]
      if (ad.getWidth() > 0 && ad.getHeight() > 0) {
        console.log(
            'ad ' + i + ': ' + views[i] +
            ' activity: ' + MFAViewHierarchy.getActivityFromView(views[i]))
      }
      else {
        views.splice(ad, 1)
      }
    }
    return views
  }

  // Finds a parent view of view whose class name is className
  //
  // @param {string} className Class name
  // @param {android.view.View} view View instance
  // @return {android.view.View|null} Parent view
  static findParentViewWithClassName(className, view) {
    let parent = view.getParent()
    let v = null
    let parentClassName = null
    if (parent) {
      parentClassName = parent.$className
    }
    else {
      parentClassName = null
    }
    while (parentClassName) {
      parent = parent.getParent()
      if (parent) {
        parentClassName = parent.$className
        if (parentClassName == className) {
          v = parent
        }
      }
      else {
        parentClassName = null
      }
    }
    if (v) {
      return v
    }
    return null
  }

  // Gets all views in the view hierarchy that aren't ads recursively
  //
  // We want all the children in the view hierarchy so we can coalesce all of
  // them if the conditions for coalescing are met
  //
  // Conditions for coalescing are the following
  //      1. If the parent of the current view is less than 40% of the screen
  // size or the parent isClickable()
  //      2. If multiple views in the children list share the same parent
  //
  // @param {android.view.View} rootView Root view instance
  // @return {Array<android.view.View>} List of views
  static getViews(rootView) {
    let viewGroup = null
    try {
      viewGroup = Java.cast(rootView, Java.use('android.view.ViewGroup'))
    } catch (error) {
      viewGroup = null
    }
    if (rootView.$className == 'android.opengl.GLSurfaceView') {
      MFAFridaLogger.opengl_enabled = true
      return []
    }
    if (rootView.$className == 'com.unity3d.player.UnityPlayer') {
      MFAFridaLogger.unity_enabled = true
      return []
    }
    if (viewGroup != null) {
      let childCount = viewGroup.getChildCount()
      let children = []
      for (let i = 0; i < childCount; i++) {
        let child = viewGroup.getChildAt(i)
        if (child != null) {
          let viewGroupChild = null
          try {
            viewGroupChild = Java.cast(child, Java.use('android.view.ViewGroup'))
          } catch (error) {
            viewGroupChild = null
          }
          let width = child.getMeasuredWidth()
          let height = child.getMeasuredHeight()
          if (width * height > 0) {
            if (viewGroupChild) {
              if (viewGroupChild.getChildCount() > 0) {
                if (!MFAUtil.isGoogleAd(child) && !MFAUtil.isAd(child)) {
                  children = children.concat(MFAViewHierarchy.getViews(child))
                }
              }
            } else {
              children.push(child)
            }
          }
        }
      }
      return children
    }
    return []
  }

  static coalesceViews(views, ads, activitySize) {
    let coalesced_views = []
    let iterations = 0
    for (let i = views.length - 1; i >= 0; i--) {
        let view = views[i]
        let parent = Java.cast(view.getParent(), Java.use('android.view.ViewGroup'))
        let parentWidth = parent.getMeasuredWidth()
        let parentHeight = parent.getMeasuredHeight()
        let found = []
        for (let j = 0; j < views.length; j++) {
            let otherView = views[j]
            let otherParent = Java.cast(otherView.getParent(), Java.use('android.view.ViewGroup'))
            let viewParent = view
            let otherViewParent = otherView
            if (i != j) {
                continue
            }
            while (viewParent && otherViewParent) {
                let parentViewWidth = viewParent.getMeasuredWidth()
                let parentViewHeight = viewParent.getMeasuredHeight()
                if (viewParent.equals(otherViewParent) &&
                    ((parentViewWidth * parentViewHeight) < (activitySize * 0.4))) {
                    if (!found.includes(j)) {
                        found.push(j)
                    }
                    parent = viewParent
                    if (viewParent.isClickable()) {
                        break
                    }
                }
                try {
                    viewParent = Java.cast(
                        viewParent.getParent(), Java.use('android.view.ViewGroup'))
                    otherViewParent = Java.cast(
                        otherViewParent.getParent(), Java.use('android.view.ViewGroup'))
                } catch (error) {
                    viewParent = null
                    otherViewParent = null
                }
            }
        }
        if (found.length > 0) {
            let coalesced_view_exists = false
            for (let p = 0; p < coalesced_views.length; p++) {
                let v = coalesced_views[p]
                if (v.equals(parent)) {
                    coalesced_view_exists = true
                }
            }
            if (!coalesced_view_exists) {
                coalesced_views.push(parent)
            }
            views.splice(i, 1)
            for (let p = 0; p < found.length; p++) {
                let index = found[p]
                views.splice(index, 1)
            }
            i = i - (found.length - 1)
        } else {
            coalesced_views.push(view)
        }
        iterations++
    }
    return coalesced_views
  }
}

class MFASignals {
  #consecutive_clicks = 0

  #interstitials_count = 0
  #interstitials_clicks_count = 0

  #ads_count = 0
  #clicks_count = 0

  #ads_count_holistic = 0
  #clicks_count_holistic = 0

  #ads_to_content_ratio = 0
  #ads_to_content_ratio_holistic = 0

  #ads_to_clicks = 0
  #ads_to_clicks_holistic = 0

  #interstitials_to_clicks = 0

  #ads_to_views = 0

  #ads_per_activity = 0
  #views_per_activity = 0

  #adsclicks_activities = []
  #adsclicks_holistic_activities = []

  #adscontent_activities = []
  #adscontent_holistic_activities = []

  #adsviews_activities = []
  #viewsperactivity_activities = []

  #pesonal = false
  #hydra = false

  #views_per_activity_signal_noisy = false

  constructor() {}

  set consecutive_clicks(consecutive_clicks) {
    return this.#consecutive_clicks = consecutive_clicks
  }
  get consecutive_clicks() {
    return this.#consecutive_clicks
  }

  set interstitials_to_clicks(interstitials_to_clicks) {
    return this.#interstitials_to_clicks = interstitials_to_clicks
  }
  get interstitials_to_clicks() {
    return this.#interstitials_to_clicks
  }

  set interstitials_count(interstitials_count) {
    return this.#interstitials_count = interstitials_count
  }
  get interstitials_count() {
    return this.#interstitials_count
  }

  set interstitials_clicks_count(interstitials_clicks_count) {
    return this.#interstitials_clicks_count = interstitials_clicks_count
  }
  get interstitials_clicks_count() {
    return this.#interstitials_clicks_count
  }

  set ads_count(ads_count) {
    return this.#ads_count = ads_count
  }
  get ads_count() {
    return this.#ads_count
  }

  set clicks_count(clicks_count) {
    return this.#clicks_count = clicks_count
  }
  get clicks_count() {
    return this.#clicks_count
  }

  set ads_count_holistic(ads_count_holistic) {
    return this.#ads_count_holistic = ads_count_holistic
  }
  get ads_count_holistic() {
    return this.#ads_count_holistic
  }

  set clicks_count_holistic(clicks_count_holistic) {
    return this.#clicks_count_holistic = clicks_count_holistic
  }
  get clicks_count_holistic() {
    return this.#clicks_count_holistic
  }

  set ads_to_content_ratio(ads_to_content_ratio) {
    this.#ads_to_content_ratio = ads_to_content_ratio
  }
  get ads_to_content_ratio() {
    return this.#ads_to_content_ratio
  }

  set ads_to_content_ratio_holistic(ads_to_content_ratio_holistic) {
    this.#ads_to_content_ratio_holistic = ads_to_content_ratio_holistic
  }
  get ads_to_content_ratio_holistic() {
    return this.#ads_to_content_ratio_holistic
  }

  set ads_to_clicks(ads_to_clicks) {
    this.#ads_to_clicks = ads_to_clicks
  }
  get ads_to_clicks() {
    return this.#ads_to_clicks
  }

  set ads_to_clicks_holistic(ads_to_clicks_holistic) {
    this.#ads_to_clicks_holistic = ads_to_clicks_holistic
  }
  get ads_to_clicks_holistic() {
    return this.#ads_to_clicks_holistic
  }

  set ads_to_views(ads_to_views) {
    this.#ads_to_views = ads_to_views
  }
  get ads_to_views() {
    return this.#ads_to_views
  }

  set ads_per_activity(ads_per_activity) {
    this.#ads_per_activity = ads_per_activity
  }
  get ads_per_activity() {
    return this.#ads_per_activity
  }

  set views_per_activity(views_per_activity) {
    this.#views_per_activity = views_per_activity
  }
  get views_per_activity() {
    return this.#views_per_activity
  }

  set views_per_activity_signal_noisy(noisy) {
    this.#views_per_activity_signal_noisy = noisy
  }
  get views_per_activity_signal_noisy() {
    return this.#views_per_activity_signal_noisy
  }

  set adsclicks_activities(adsclicks_activities) {
    this.#adsclicks_activities = adsclicks_activities
  }
  get adsclicks_activities() {
    return this.#adsclicks_activities
  }

  set adsclicks_holistic_activities(adsclicks_holistic_activities) {
    this.#adsclicks_holistic_activities = adsclicks_holistic_activities
  }
  get adsclicks_holistic_activities() {
    return this.#adsclicks_holistic_activities
  }

  set adscontent_activities(adscontent_activities) {
    this.#adscontent_activities = adscontent_activities
  }
  get adscontent_activities() {
    return this.#adscontent_activities
  }

  set adscontent_holistic_activities(adscontent_holistic_activities) {
    this.#adscontent_holistic_activities = adscontent_holistic_activities
  }
  get adscontent_holistic_activities() {
    return this.#adscontent_holistic_activities
  }

  set adsviews_activities(adsviews_activities) {
    this.#adsviews_activities = adsviews_activities
  }
  get adsviews_activities() {
    return this.#adsviews_activities
  }

  set viewsperactivity_activities(viewsperactivity_activities) {
    this.#viewsperactivity_activities = viewsperactivity_activities
  }
  get viewsperactivity_activities() {
    return this.#viewsperactivity_activities
  }

  set pesonal(pesonal) {
    this.#pesonal = true
  }
  get pesonal() {
    return this.#pesonal
  }

  set hydra(hydra) {
    this.#hydra = true
  }
  get hydra() {
    return this.#hydra
  }

  // Calculates the interstitials to clicks ratio and log the signal if it meets
  // the threshold for marking as MFA/LQA
  //
  // @param {string} func Function name
  calculateInterstitialsToClicksRatio(func) {
    if (this.interstitials_clicks_count) {
      this.interstitials_to_clicks = this.interstitials_count / this.interstitials_clicks_count
    } else {
        this.interstitials_to_clicks = 0
    }
    console.log(
      'interstitials = ' + this.interstitials_count +
      ' clicks = ' + this.interstitials_clicks_count)
    console.log(
    func + ' interstitials_to_clicks = ' + this.interstitials_to_clicks)
    if (this.adsclicks_activities.length > 5 ||
      this.interstitials_clicks_count >= 7) {
        if (this.interstitials_to_clicks >= .666) {
          if (MFAFridaLogger.isFridaLogEnabled()) {
            console.log(
                'mfa.lqa interstitials_to_clicks = ' +
                this.interstitials_to_clicks + ' is_mfa = true')
            MFAFridaLogger.logMFASignal(
                'mfa.lqa.interstitials.to.clicks', {
                  'interstitials_to_clicks': this.interstitials_to_clicks,
                  'is_mfa': true
                },
                null)
            MFAFridaLogger.logMFASignal(
                'mfa.lqa.interstitials.and.clicks', {
                  'interstitials': this.interstitials_count,
                  'clicks': this.interstitials_clicks_count,
                  'is_mfa': true
                },
                null)
          }
        }
        if (this.interstitials_to_clicks >= 0.50 &&
            this.interstitials_clicks_count >= 25) {
            if (MFAFridaLogger.isFridaLogEnabled()) {
                console.log(
                    'mfa.lqa interstitials_to_clicks = ' +
                    this.interstitials_to_clicks + ' is_mfa = true')
                MFAFridaLogger.logMFASignal(
                    'mfa.lqa.interstitials.to.clicks', {
                      'interstitials_to_clicks': this.interstitials_to_clicks,
                      'is_mfa': true
                    },
                    null)
                MFAFridaLogger.logMFASignal(
                    'mfa.lqa.interstitials.and.clicks', {
                      'interstitials': this.interstitials_count,
                      'clicks': this.interstitials_clicks_count,
                      'is_mfa': true
                    },
                    null)
            }
        }
    }
  }

  // Given an activity, finds all the ads inside the Activity, calculate the ads
  // to clicks ratio and check if the threshold has been reached for logging
  //
  // @param {string} func Function name
  // @param {android.app.Activity} activity Activity instance
  // @param {Array<android.view.View>} ads List of ads inside the activity
  // @param {boolean} holistic Whether to use holistic signals
  calculateAdsToClicksRatio(func, activity, ads, holistic) {
    let activityClassName = activity.$className
    if (holistic) {
      this.adsclicks_holistic_activities.push(activityClassName)
      this.ads_count_holistic += ads.length
      this.clicks_count_holistic++
      console
          .log(
              func + ' in activity ' + activityClassName +
              ' ads_count_holistic = ' + this.ads_count_holistic +
              ' clicks_count_holistic = ' +
              this.clicks_count_holistic)
      this.ads_to_clicks_holistic = this.ads_count_holistic / this.clicks_count_holistic
      console.log(JSON.stringify(this.adsclicks_holistic_activities))
      if (this.adsclicks_holistic_activities.length > 5 &&
          this.ads_count_holistic / this.clicks_count_holistic > 1.65) {
        console.log(
            'ads/clicks holistic = ' +
            this.ads_count_holistic / this.clicks_count_holistic +
            ' detects MFA!')
        if (MFAFridaLogger.isFridaLogEnabled()) {
          console.log(
              'mfa.lqa ads_to_clicks.holistic = ' +
              this.ads_to_clicks_holistic + ' is_mfa = true')
          MFAFridaLogger.logMFASignal(
              'mfa.lqa.ads.to.clicks.holistic',
              {'ads_to_clicks': this.ads_to_clicks_holistic, 'is_mfa': true},
              null)
          MFAFridaLogger.logMFASignal(
              'mfa.lqa.ads.and.clicks.holistic', {
                'ads': this.ads_count_holistic,
                'clicks': this.clicks_count_holistic,
                'is_mfa': true
              },
              null)
        }
      }
    } else {
      if (!this.adsclicks_activities.includes(activityClassName)) {
        this.adsclicks_activities.push(activityClassName)
        this.ads_count += ads.length
        this.clicks_count++
        console
            .log(
                func + ' in activity ' + activityClassName +
                ' ads_count = ' + this.ads_count +
                ' clicks_count = ' + this.clicks_count)
        this.ads_to_clicks = this.ads_count / this.clicks_count
        console.log(JSON.stringify(this.adsclicks_activities))
        if (this.adsclicks_activities.length >= 4 &&
            this.ads_count / this.clicks_count > 1.75) {
          console.log(
              'ads/clicks = ' + this.ads_count / this.clicks_count +
              ' detects MFA!')
          if (MFAFridaLogger.isFridaLogEnabled()) {
            console.log(
                'mfa.lqa ads_to_clicks = ' + this.ads_to_clicks +
                ' is_mfa = true')
            MFAFridaLogger.logMFASignal(
                'mfa.lqa.ads.to.clicks',
                {'ads_to_clicks': this.ads_to_clicks, 'is_mfa': true}, null)
            MFAFridaLogger.logMFASignal(
                'mfa.lqa.ads.and.clicks', {
                  'ads': this.ads_count,
                  'clicks': this.clicks_count,
                  'is_mfa': true
                },
                null)
          }
        }
      }
    }
  }

  // Given an activity, finds all the ads inside the Activity, calculate the size
  // of the ads using getHeight() and getWidth()
  //
  // Add up the values, and then compare it to the screen size
  // This is the local Activity's ads to content ratio
  //
  // The new ads to content ratio is ads_content =
  // ((ads_content * activities.length) + (adSize/activitySize)) / (activities.length + 1)
  //
  // RecyclerViews and ScrollViews are now included our calculations
  //
  // @param {string} func Function name
  // @param {android.app.Activity} activity Activity instance
  // @param {Array<android.view.View>} ads List of ads inside the activity
  // @param {boolean} holistic Whether to use holistic signals
  calculateAdsToContentRatio(func, activity, ads, holistic) {
    let displayMetrics = Java.use('android.util.DisplayMetrics').$new()
    let activityClassName = activity.$className
    activity.getWindowManager().getDefaultDisplay().getMetrics(displayMetrics)
    let activityWidth = displayMetrics.widthPixels.value
    let activityHeight = displayMetrics.heightPixels.value
    let activitySize = activityWidth * activityHeight
    let adSize = 0.0
    let recyclerView = null
    let shouldLookForScrollableViews = ads.length >= 2
    for (let i = 0; i < ads.length; i++) {
      let ad = ads[i]
      let width = 0
      let height = 0
      if (shouldLookForScrollableViews) {
        recyclerView = MFAViewHierarchy.findParentViewWithClassName(
            'androidx.recyclerview.widget.RecyclerView', ad)
        if (recyclerView) {
          let viewGroup = Java.cast(recyclerView, Java.use('android.view.View'))
          recyclerView = Java.cast(
              viewGroup,
              MFAUtil.findClassByEnumeratingClassLoaders(
                  recyclerView.$className))
          let recyclerViewHorizontalScrollRange =
              recyclerView.computeHorizontalScrollRange()
          let recyclerViewVerticalScrollRange =
              recyclerView.computeVerticalScrollRange()
          let recyclerViewWidth = recyclerViewHorizontalScrollRange
          let recyclerViewHeight = recyclerViewVerticalScrollRange
          if (!recyclerViewHorizontalScrollRange) {
            recyclerViewWidth = recyclerView.getWidth()
          }
          if (!recyclerViewVerticalScrollRange) {
            recyclerViewHeight = recyclerView.getHeight()
          }
          let recyclerViewSize = recyclerViewWidth * recyclerViewHeight
          if (recyclerViewSize > activitySize) {
            activitySize = recyclerViewSize
          }
        }
      }
      width = ad.getMeasuredWidth()
      height = ad.getMeasuredHeight()
      adSize += width * height
    }
    if (holistic) {
      this.ads_to_content_ratio_holistic = (
          ((this.adscontent_holistic_activities.length *
            this.ads_to_content_ratio_holistic) +
           (adSize / activitySize)) /
          (this.adscontent_holistic_activities.length +
           1))
      this.adscontent_holistic_activities.push(activity.$className)
      console.log(
          func + ' ads_to_content_ratio_holistic = ' +
          this.ads_to_content_ratio_holistic)
      if (this.adscontent_holistic_activities.filter(removeDuplicates).length >
              5 &&
          this.ads_to_content_ratio_holistic >= 0.35) {
        console.log('ads_to_content_ratio signal detects MFA!\n')
        if (MFAFridaLogger.isFridaLogEnabled()) {
          console.log(
              'mfa.lqa ads_to_content_holistic = ' +
              this.ads_to_content_ratio_holistic + ' is_mfa = true')
          MFAFridaLogger.logMFASignal(
              'mfa.lqa.ads.to.content.holistic', {
                'ads_to_content_holistic': this.ads_to_content_ratio_holistic,
                'is_mfa': true
              },
              null)
        }
      }
    } else {
      if (!this.adscontent_activities.includes(activityClassName)) {
        this.ads_to_content_ratio = (
            ((this.adscontent_activities.length * this.ads_to_content_ratio) +
             (adSize / activitySize)) /
            (this.adscontent_activities.length +
             1))
        this.adscontent_activities.push(activity.$className)
        console.log(
            func + ' ads_to_content_ratio = ' + this.ads_to_content_ratio)
        if (this.adscontent_activities.length > 5 &&
            this.ads_to_content_ratio >= 0.35) {
          console.log('ads_to_content_ratio signal detects MFA!\n')
          if (MFAFridaLogger.isFridaLogEnabled()) {
            console.log(
                'mfa.lqa ads_to_content = ' + this.ads_to_content_ratio +
                ' is_mfa = true')
            MFAFridaLogger.logMFASignal(
                'mfa.lqa.ads.to.content',
                {'ads_to_content': this.ads_to_content_ratio, 'is_mfa': true},
                null)
          }
        }
      }
    }
  }

  // Given an activity, calculate the ratio of ads to and views per activity
  //
  // The new ads to views ratio is ads_to_views =
  // ((ads_to_views * activities.length) + (ads.length / (ads.length + views.length))) / (activities.length + 1)
  //
  // The new views per activity ratio is views_per_activity =
  // ((views_per_activity * activities.length) + (ads.length + views.length)) / (activities.length + 1)
  //
  // @param {string} func Function name
  // @param {android.app.Activity} activity Activity instance
  // @param {Array<android.view.View>} ads List of ads inside the activity
  calculateAdsToViewsAndViewsPerActivity(func, activity, ads) {
    if (this.views_per_activity_signal_noisy) {
      return
    }
    let displayMetrics = Java.use('android.util.DisplayMetrics').$new()
    activity.getWindowManager().getDefaultDisplay().getMetrics(displayMetrics)
    let activityWidth = displayMetrics.widthPixels.value
    let activityHeight = displayMetrics.heightPixels.value
    let activitySize = activityWidth * activityHeight
    let window = Java.cast(activity.getWindow(), Java.use('android.view.Window'))
    let rootView = window.getDecorView()
    let views = MFAViewHierarchy.getViews(rootView)
    views = MFAViewHierarchy.coalesceViews(views, ads, activitySize)
    if (views.length > 50) {
        this.views_per_activity_signal_noisy = true
    }
    let numViews = views.length
    this.ads_to_views = (
        ((this.adsviews_activities.length * this.ads_to_views) +
         (ads.length / (ads.length + views.length))) /
        (this.adsviews_activities.length + 1))
    console.log('mfa.lqa ads_to_views = ' + this.ads_to_views)
    this.views_per_activity = (
        ((this.viewsperactivity_activities.length * this.views_per_activity) +
         (ads.length + views.length)) /
        (this.viewsperactivity_activities.length + 1))
    console.log('mfa.lqa views_per_activity = ' + this.views_per_activity)
    this.ads_per_activity = (
        ((this.viewsperactivity_activities.length * this.ads_per_activity) +
         (ads.length)) /
        (this.viewsperactivity_activities.length + 1))
    console.log('mfa.lqa ads_per_activity = ' + this.ads_per_activity)
    this.adsviews_activities.push(activity.$className)
    this.viewsperactivity_activities.push(activity.$className)
    if (this.viewsperactivity_activities.length > 5 &&
        this.ads_to_views > 0.25 && this.views_per_activity < 10) {
      if (MFAFridaLogger.isFridaLogEnabled()) {
        console.log(
            'mfa.lqa ads_to_views = ' + this.ads_to_views + ' is_mfa = true')
        MFAFridaLogger.logMFASignal(
            'mfa.lqa.ads.to.views+views.per_activity', {
              'ads_to_views': this.ads_to_views,
              'views_per_activity': this.views_per_activity,
              'is_mfa': true
            },
            null)
      }
    }
  }
}

MFAFridaLogger.initialize()
let mfa_signals = new MFASignals()
let did_click = false
let on_back_pressed = false
let on_back_pressed_ads_detected = false
// Android UI hooks
Java.perform(function() {
  var clazz = Java.use('android.view.View')
  // Hook for View.performClick()
  //
  // Increases the clicks count and ads_count if it meets the criteria for
  // calculating our ads to content ratio
  //
  // Increases the intersitial clicks count if the current activity is not
  // AdActivity
  clazz.performClick.implementation = function() {
    let activity = MFAViewHierarchy.getActivityFromView(this)
    let activityClassName = activity ? activity.$className : null
    let stackTrace = MFAUtil.getStackTraceString()
    let ads = []
    if (activity != null && !MFAUtil.isGoogleInterstitialAd(activity)) {
      ads = MFAViewHierarchy.findAdsInsideActivity(activity)
      // non holistic
      mfa_signals.calculateAdsToContentRatio(
          this.$className + '.performClick()', activity, ads, false)
      // holistic
      mfa_signals.calculateAdsToContentRatio(
          this.$className + '.performClick()', activity, ads, true)
      // non holistic
      mfa_signals.calculateAdsToClicksRatio(
          this.$className + '.performClick()', activity, ads, false)
      // holistic
      mfa_signals.calculateAdsToClicksRatio(
          this.$className + '.performClick()', activity, ads, true)
      mfa_signals.calculateAdsToViewsAndViewsPerActivity(
          this.$className + '.performClick()', activity, ads)
      mfa_signals
          .interstitials_clicks_count++
      if (mfa_signals.interstitials_clicks_count) {
        mfa_signals.interstitials_to_clicks = mfa_signals.interstitials_count /
            mfa_signals.interstitials_clicks_count
      } else {
        mfa_signals.interstitials_to_clicks = 0
      }
    }
    return clazz.performClick.apply(this, arguments)
  }
})

Java.perform(function() {
    var clazz = MFAUtil.findClassByEnumeratingClassLoaders(
        'io.flutter.embedding.android.FlutterView')
    if (clazz == null) {
        return
    }
    // Hook for FlutterView.performClick()
    //
    // FlutterView.performClick() does not handle touch events
    //
    // Flutter uses FlutterView.onTouchEvent() instead and checks for ACTION_DOWN in
    // MotionEvent class
    // https://github.com/flutter/flutter/issues/29686
    //
    // Increases the clicks count and ads_count if it meets the criteria for
    // calculating our ads to content ratio
    //
    // Increases the intersitial clicks count if the current activity is not
    // AdActivity
    clazz.onTouchEvent.implementation = function(event) {
        if (event.getAction() != 0) {
            return clazz.onTouchEvent.apply(this, arguments)
        }
        let activity = MFAViewHierarchy.getActivityFromView(this)
        let activityClassName = activity ? activity.$className : null
        let stackTrace = MFAUtil.getStackTraceString()
        let ads = []
        if (activity != null && !MFAUtil.isGoogleInterstitialAd(activity)) {
            ads = MFAViewHierarchy.findAdsInsideActivity(activity)
            // non holistic
            mfa_signals.calculateAdsToContentRatio(
                this.$className + '.performClick()', activity, ads, false)
            // holistic
            mfa_signals.calculateAdsToContentRatio(
                this.$className + '.performClick()', activity, ads, true)
            // non holistic
            mfa_signals.calculateAdsToClicksRatio(
                this.$className + '.performClick()', activity, ads, false)
            // holistic
            mfa_signals.calculateAdsToClicksRatio(
                this.$className + '.performClick()', activity, ads, true)
            // Does not calculate ads to views and views per activity in
            // FlutterView's
            /* mfa_signals.calculateAdsToViewsAndViewsPerActivity(this.$className
            // + '.performClick()', activity, ads) */
            mfa_signals.interstitials_clicks_count++
            if (mfa_signals.interstitials_clicks_count) {
                mfa_signals.interstitials_to_clicks =
                    mfa_signals.interstitials_count /
                    mfa_signals.interstitials_clicks_count
            } else {
                mfa_signals.interstitials_to_clicks = 0
            }
        }
        return clazz.onTouchEvent.apply(this, arguments)
    }
})

Java.perform(function() {
  var clazz = Java.use('android.app.Activity')
  // Hook Activity.onCreate() to find pesonal and Hydra
  clazz.onCreate.overload('android.os.Bundle').implementation = function() {
    let ret = clazz.onCreate.apply(this, arguments)
    let stackTrace = MFAUtil.getStackTraceString()
    if (!MFAUtil.isGoogleInterstitialAd(this)) {
      on_back_pressed = false
    }
    if (this.$className == 'com.unity3d.player.UnityPlayerActivity') {
      MFAFridaLogger.unity_enabled = true
    }
    if (did_click && MFAUtil.isGoogleInterstitialAd(this)) {
      mfa_signals.consecutive_clicks++
      if (mfa_signals.consecutive_clicks >= 4) {
        if (MFAFridaLogger.isFridaLogEnabled()) {
          console.log(
              'mfa.lqa consecutive_clicks = ' + mfa_signals.consecutive_clicks +
              ' is_mfa = true')
          MFAFridaLogger.logMFASignal(
              'mfa.lqa.consecutive.interstitial.clicks', {
                'consecutive_clicks': mfa_signals.consecutive_clicks,
                'is_mfa': true
              },
              null)
          MFAFridaLogger.logMFASignal(
              'mfa.lqa.interstitials.and.clicks', {
                'interstitials': mfa_signals.interstitials_count,
                'clicks': mfa_signals.interstitials_clicks_count,
                'is_mfa': true
              },
              null)
        }
      }
    } else if (did_click) {
      mfa_signals.consecutive_clicks = 0
    }
    console.log(
        this.$className +
        '.onCreate() consecutive clicks = ' + mfa_signals.consecutive_clicks)
    did_click = false
    if (stackTrace.includes('com.pesonal.adsdk')) {
      mfa_signals.pesonal = true
      if (MFAFridaLogger.isFridaLogEnabled()) {
        MFAFridaLogger.logMFASignal(
            'mfa.lqa.pesonal', {'pesonal': true, 'is_mfa': true}, null)
      }
    }
    if (stackTrace.includes('hydra')) {
      mfa_signals.hydra = true
      if (MFAFridaLogger.isFridaLogEnabled()) {
        MFAFridaLogger.logMFASignal(
            'mfa.lqa.hydra', {'hydra': true, 'is_mfa': true}, null)
      }
    }
    return ret
  }
   clazz.onCreate
          .overload('android.os.Bundle', 'android.os.PersistableBundle')
          .implementation = function() {
    let ret = clazz.onCreate.apply(this, arguments)
    return ret
  }

  // Hook for Activity.performResume() to calculate ads to content if
  // Activity.onResume() wasn't overridden properly
  //
  // This occurs often in low quality apps and e.g. Unity apps
  //
  // Checks if ads.length is 0 if some ads may have not loaded yet and
  // we haven't seen this Activity before
  clazz.performResume.overload('boolean', 'java.lang.String')
        .implementation = function(b, s) {
    let ret = clazz.performResume.overload('boolean', 'java.lang.String')
                  .apply(this, arguments)
    let activityClassName = this.$className
    if (!MFAUtil.isGoogleInterstitialAd(this)) {
      on_back_pressed = false
    }
    if (!MFAUtil.isGoogleInterstitialAd(this)) {
      Java.perform(function() {
        var clz = MFAUtil.findClassByEnumeratingClassLoaders(activityClassName)
        if (!clz.hasOwnProperty('onBackPressed')) {
            return
        }
        // Hook Activity.onBackPressed() and calculate ads to content ratio
        // if we haven't calculated it for this activity before
        //
        // Only checks if ads.length is 0 if there's a chance the activity
        // hasn't fully loaded yet
        clz.onBackPressed.implementation = function() {
            if (MFAUtil.isGoogleInterstitialAd(this)) {
            return clz.onBackPressed.apply(this, arguments)
            }
            let stackTrace = MFAUtil.getStackTraceString()

            if (!stackTrace.includes('performClick') &&
                stackTrace.split('onBackPressed').length <= 2) {
            let ads = MFAViewHierarchy.findAdsInsideActivity(this)
            let activity = Java.cast(this, Java.use('android.app.Activity'))
            mfa_signals.calculateAdsToContentRatio(
                this.$className + '.onBackPressed()', activity, ads, false)
            mfa_signals.calculateAdsToContentRatio(
                this.$className + '.onBackPressed()', activity, ads, true)
            mfa_signals.calculateAdsToViewsAndViewsPerActivity(
                this.$className + '.onBackPressed()', activity, ads)
            }
            return clz.onBackPressed.apply(this, arguments)
        }
      })
    }
    if (MFAUtil.isGoogleInterstitialAd(this) ||
        mfa_signals.adscontent_activities.includes(activityClassName)) {
      return ret
    }
    let ads = MFAViewHierarchy.findAdsInsideActivity(this)
    let activity = Java.cast(this, Java.use('android.app.Activity'))
    if (ads.length) {
      mfa_signals.calculateAdsToContentRatio(
          this.$className + '.performResume()', activity, ads, false)
    }
    return ret
  }

  // Hook for Activity.onResume() to calculate ads to content ratios
  //
  // Checks if ads.length is 0 if some ads may have not loaded yet
  // and we haven't seen this Activity before
  //
  // Calculating ads to content multiple times isn't a problem
  // because once it finds ads it records the new ratio
  //
  // If ads.length remains 0 we only calculate ads to content if in
  // a Activity transition away from the current activity. This gets
  // handled in startActivity() and onBackPressed()
  clazz.onResume.overload() .implementation = function() {
    let ret = clazz.onResume.overload().apply(this, arguments)
    let ads = MFAViewHierarchy.findAdsInsideActivity(this)
    let activity = Java.cast(this, Java.use('android.app.Activity'))
    if (MFAUtil.isGoogleInterstitialAd(this) ||
        mfa_signals.adscontent_activities.includes(this.$className)) {
      return ret
    }
    if (ads.length) {
      mfa_signals.calculateAdsToContentRatio(
          this.$className + '.onResume()', activity, ads)
    }
    return ret
  }

  // Hook for Activity.startActivity() to calculate ads to content
  // and consecutive clicks
  //
  // Only increases consecutive clicks if the
  // intentComponentClassName is AdActivity and performClick is
  // in the backtrace
  //
  // Only checks if ads.length is 0 for ads to content if
  // there's a chance the activity hasn't fully loaded yet
  clazz.startActivity.overload('android.content.Intent')
                     .implementation = function(intent) {
    let ads = MFAViewHierarchy.findAdsInsideActivity(this)
    let activity = Java.cast(this, Java.use('android.app.Activity'))
    mfa_signals.calculateAdsToContentRatio(
        this.$className + '.startActivity()', activity, ads, false)
    let stackTrace = MFAUtil.getStackTraceString()
    let intentComponentClassName = ''
    let intentComponent = intent.getComponent()
    if (intentComponent != null) {
        intentComponentClassName = intentComponent.getClassName()
    }
    if (!on_back_pressed_ads_detected && on_back_pressed &&
        intentComponentClassName == 'com.google.android.gms.ads.AdActivity') {
      console.log(
          'mfa.lqa on_back_pressed_ads_activity = ' + this.$className +
          ' is_mfa = true')
      if (MFAFridaLogger.isFridaLogEnabled()) {
        MFAFridaLogger.logMFASignal(
            'mfa.lqa.on_back_pressed_ads',
            {'on_back_pressed_ads_activity': this.$className, 'is_mfa': true},
            null)
      }
      on_back_pressed_ads_detected = true
    }
    let displayMetrics = Java.use('android.util.DisplayMetrics')
                             .$new()
    this.getWindowManager().getDefaultDisplay().getMetrics(displayMetrics)
    let activityWidth = displayMetrics.widthPixels.value
    let activityHeight = displayMetrics.heightPixels.value
    let activitySize = activityWidth * activityHeight
    if (!mfa_signals.views_per_activity_signal_noisy) {
      let window = Java.cast(this.getWindow(), Java.use('android.view.Window'))
      let rootView = window.getDecorView()
      let views = MFAViewHierarchy.getViews(rootView)
      views = MFAViewHierarchy.coalesceViews(views, ads, activitySize)
      for (let i = 0; i < views.length; i++) {
        console.log(
            'view ' + i + ' className = ' + views[i].$className + ' ' +
            views[i])
      }
    }
    let ret = clazz.startActivity.apply(this, arguments)
    if ((stackTrace.includes('performClick') ||
         stackTrace.includes('onClick'))) {
      did_click = true
    } else if (
        !MFAUtil.isGoogleInterstitialAd(this) &&
        !stackTrace.includes('onPause')) {
      did_click = false
      mfa_signals.consecutive_clicks = 0
    }
    stackTrace = MFAUtil.getStackTraceString()
    if (stackTrace.includes('com.pesonal.adsdk')) {
      mfa_signals.pesonal = true
      if (MFAFridaLogger.isFridaLogEnabled()) {
        MFAFridaLogger.logMFASignal(
            'mfa.lqa.pesonal', {'pesonal': true, 'is_mfa': true}, null)
      }
    }
    if (stackTrace.includes('hydra')) {
      mfa_signals.hydra = true
      if (MFAFridaLogger.isFridaLogEnabled()) {
        MFAFridaLogger.logMFASignal(
            'mfa.lqa.hydra', {'hydra': true, 'is_mfa': true}, null)
      }
    }
    // Remove onBackPressed bias for interstitial clicks because of standard
    // navigation
    if (!MFAUtil.isGoogleInterstitialAd(this)) {
      if (mfa_signals.interstitials_clicks_count > 1 &&
          (stackTrace.includes('onBackPressed'))) {
        mfa_signals.interstitials_clicks_count--
        if (mfa_signals.interstitials_clicks_count) {
            mfa_signals.interstitials_to_clicks = (mfa_signals.interstitials_count /
            mfa_signals.interstitials_clicks_count)
        } else {
            mfa_signals.interstitials_to_clicks = 0
        }
      }
    }
    return ret
  }

  // Hook for Activity.startActivity() and calculate ads to
  // content
  //
  // Only checks if ads.length is 0 if there's a chance
  // the activity hasn't fully loaded yet
  clazz.startActivity.overload(
                        'android.content.Intent', 'android.os.Bundle')
                    .implementation = function(intent, bundle) {
    let ads = MFAViewHierarchy.findAdsInsideActivity(this)
    let activity = Java.cast(this, Java.use('android.app.Activity'))
    mfa_signals.calculateAdsToContentRatio(
        this.$className + '.startActivity()', activity, ads, false)
    let stackTrace = MFAUtil.getStackTraceString()
    let intentComponentClassName = ''
    let intentComponent = intent.getComponent()
    if (intentComponent != null) {
        intentComponentClassName = intentComponent.getClassName()
    }
    let ret = clazz.startActivity.apply(this, arguments)
    if (stackTrace.split('Activity.startActivity').length > 2) {
        return ret
    }
    if ((stackTrace.includes('performClick') ||
         stackTrace.includes('onClick'))) {
      did_click = true
    }
    else if (
        !MFAUtil.isGoogleInterstitialAd(this) &&
        !stackTrace.includes('onPause')) {
      did_click = false
      mfa_signals.consecutive_clicks = 0
    }
    stackTrace = MFAUtil.getStackTraceString()
    if (stackTrace.includes('com.pesonal.adsdk')) {
      mfa_signals.pesonal = true
      if (MFAFridaLogger.isFridaLogEnabled()) {
        MFAFridaLogger.logMFASignal(
            'mfa.lqa.pesonal', {'pesonal': true, 'is_mfa': true}, null)
      }
    }
    if (stackTrace.includes('hydra')) {
      mfa_signals.hydra = true
      if (MFAFridaLogger.isFridaLogEnabled()) {
        MFAFridaLogger.logMFASignal(
            'mfa.lqa.hydra', {'hydra': true, 'is_mfa': true}, null)
      }
    }
    // Removes onBackPressed() bias for interstitial clicks because of standard
    // navigation
    //
    // onBackPressed() leading to Activity.startActivity() should not result in
    // interstitials, so don't count clicks here
    if (!MFAUtil.isGoogleInterstitialAd(this)) {
      if (mfa_signals.interstitials_clicks_count > 1 &&
          (stackTrace.includes('onBackPressed'))) {
        mfa_signals.interstitials_clicks_count--
        if (mfa_signals.interstitials_clicks_count) {
            mfa_signals.interstitials_to_clicks = (mfa_signals.interstitials_count /
            mfa_signals.interstitials_clicks_count)
        } else {
            mfa_signals.interstitials_to_clicks = 0
        }
      }
    }
    return ret
  }
})

// Hook for AdActivity.onCreate()
// Calculates an interstitials to clicks ratio if finding consecutive clicks
// isn't always reliable in the app crawler
//
// Increases ads_count just for safe measure if performClick() didn't trigger ads
// and Activity.startActivity() did
Java.perform(function() {
  var clazz = MFAUtil.findAdMobClass('com.google.android.gms.ads.AdActivity')
  clazz.onCreate.implementation = function() {
    let ret = clazz.onCreate.apply(this, arguments)
    mfa_signals.ads_count++
    mfa_signals.interstitials_count++
    mfa_signals.calculateInterstitialsToClicksRatio(
        this.$className + '.onCreate()')
    return ret
  }
})