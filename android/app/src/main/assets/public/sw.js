/**
 * Copyright 2018 Google Inc. All Rights Reserved.
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *     http://www.apache.org/licenses/LICENSE-2.0
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

// If the loader is already loaded, just stop.
if (!self.define) {
  let registry = {};

  // Used for `eval` and `importScripts` where we can't get script URL by other means.
  // In both cases, it's safe to use a global var because those functions are synchronous.
  let nextDefineUri;

  const singleRequire = (uri, parentUri) => {
    uri = new URL(uri + ".js", parentUri).href;
    return registry[uri] || (
      
        new Promise(resolve => {
          if ("document" in self) {
            const script = document.createElement("script");
            script.src = uri;
            script.onload = resolve;
            document.head.appendChild(script);
          } else {
            nextDefineUri = uri;
            importScripts(uri);
            resolve();
          }
        })
      
      .then(() => {
        let promise = registry[uri];
        if (!promise) {
          throw new Error(`Module ${uri} didn’t register its module`);
        }
        return promise;
      })
    );
  };

  self.define = (depsNames, factory) => {
    const uri = nextDefineUri || ("document" in self ? document.currentScript.src : "") || location.href;
    if (registry[uri]) {
      // Module is already loading or loaded.
      return;
    }
    let exports = {};
    const require = depUri => singleRequire(depUri, uri);
    const specialDeps = {
      module: { uri },
      exports,
      require
    };
    registry[uri] = Promise.all(depsNames.map(
      depName => specialDeps[depName] || require(depName)
    )).then(deps => {
      factory(...deps);
      return exports;
    });
  };
}
define(['./workbox-b1bafff1'], (function (workbox) { 'use strict';

  self.skipWaiting();
  workbox.clientsClaim();
  /**
   * The precacheAndRoute() method efficiently caches and responds to
   * requests for URLs in the manifest.
   * See https://goo.gl/S9QRab
   */
  workbox.precacheAndRoute([{
    "url": "pwa-icon.svg",
    "revision": "a52e6d51501a4d6e96a11b5a3e34dae4"
  }, {
    "url": "index.html",
    "revision": "b14a9421e43beb2872d18bb614fd3694"
  }, {
    "url": "icon-512.png",
    "revision": "4d4fd4bd3a685b7a3960b7446eed7aae"
  }, {
    "url": "icon-192.png",
    "revision": "7b19f110763b47a687e21082788b5339"
  }, {
    "url": "NotoSansBengali.ttf",
    "revision": "eb309e441bd3dc8379e043e39ff5f440"
  }, {
    "url": "assets/workbox-window.prod.es5-BBnX5xw4.js",
    "revision": null
  }, {
    "url": "assets/trash-DsltASmt.js",
    "revision": null
  }, {
    "url": "assets/tooltipContext-BeuupJTP.js",
    "revision": null
  }, {
    "url": "assets/subMonths-CFGySgHU.js",
    "revision": null
  }, {
    "url": "assets/purify.es-BaNf_EpD.js",
    "revision": null
  }, {
    "url": "assets/pen-ClBDlVfN.js",
    "revision": null
  }, {
    "url": "assets/pdfWorker-CN2pERtO.js",
    "revision": null
  }, {
    "url": "assets/pdfExport-DPRQFTzH.js",
    "revision": null
  }, {
    "url": "assets/index.es-B5Xkpi-z.js",
    "revision": null
  }, {
    "url": "assets/index-q9Eeuppn.js",
    "revision": null
  }, {
    "url": "assets/index-CQmpWuhR.js",
    "revision": null
  }, {
    "url": "assets/index-CHV9aKdQ.css",
    "revision": null
  }, {
    "url": "assets/iconMap-Dv5ORRq6.js",
    "revision": null
  }, {
    "url": "assets/html2canvas.esm-QH1iLAAe.js",
    "revision": null
  }, {
    "url": "assets/Transactions-qrf1r6zZ.js",
    "revision": null
  }, {
    "url": "assets/TransactionModal-2u780YYv.js",
    "revision": null
  }, {
    "url": "assets/Summary-BO6N1ai9.js",
    "revision": null
  }, {
    "url": "assets/SettingsScreen-D2oltEO1.js",
    "revision": null
  }, {
    "url": "assets/SavingsGoalModal-5uYFfK5A.js",
    "revision": null
  }, {
    "url": "assets/Savings-YZjhPPEy.js",
    "revision": null
  }, {
    "url": "assets/ReportsScreen-CJaIa8jL.js",
    "revision": null
  }, {
    "url": "assets/MonthlyOverviewScreen-DRv1INAE.js",
    "revision": null
  }, {
    "url": "assets/Dashboard-CHaDGyZT.js",
    "revision": null
  }, {
    "url": "assets/Categories-BoNEqKrm.js",
    "revision": null
  }, {
    "url": "assets/CategoricalChart-ssEc6Suv.js",
    "revision": null
  }, {
    "url": "assets/CartesianChart-Byqog1Zq.js",
    "revision": null
  }, {
    "url": "assets/Budgets-CVb82X7U.js",
    "revision": null
  }, {
    "url": "assets/AreaChart-BTS_EQ7S.js",
    "revision": null
  }, {
    "url": "assets/AdvancedChartsScreen-DskbhKrJ.js",
    "revision": null
  }, {
    "url": "assets/AdminPinUnlockScreen-Ch8yCsPc.js",
    "revision": null
  }, {
    "url": "icon-192.png",
    "revision": "7b19f110763b47a687e21082788b5339"
  }, {
    "url": "icon-512.png",
    "revision": "4d4fd4bd3a685b7a3960b7446eed7aae"
  }, {
    "url": "pwa-icon.svg",
    "revision": "a52e6d51501a4d6e96a11b5a3e34dae4"
  }, {
    "url": "manifest.webmanifest",
    "revision": "74b5f507800eb53457979a4d7d1086a4"
  }], {});
  workbox.cleanupOutdatedCaches();
  workbox.registerRoute(new workbox.NavigationRoute(workbox.createHandlerBoundToURL("index.html")));
  workbox.registerRoute(/^https:\/\/fonts\.googleapis\.com\/.*/i, new workbox.CacheFirst({
    "cacheName": "google-fonts-cache",
    plugins: [new workbox.ExpirationPlugin({
      maxEntries: 10,
      maxAgeSeconds: 31536000
    }), new workbox.CacheableResponsePlugin({
      statuses: [0, 200]
    })]
  }), 'GET');
  workbox.registerRoute(/^https:\/\/fonts\.gstatic\.com\/.*/i, new workbox.CacheFirst({
    "cacheName": "gstatic-fonts-cache",
    plugins: [new workbox.ExpirationPlugin({
      maxEntries: 10,
      maxAgeSeconds: 31536000
    }), new workbox.CacheableResponsePlugin({
      statuses: [0, 200]
    })]
  }), 'GET');
  workbox.registerRoute(/^https:\/\/firebasestorage\.googleapis\.com\/.*/i, new workbox.StaleWhileRevalidate({
    "cacheName": "firebase-images-cache",
    plugins: [new workbox.ExpirationPlugin({
      maxEntries: 50,
      maxAgeSeconds: 2592000
    }), new workbox.CacheableResponsePlugin({
      statuses: [0, 200]
    })]
  }), 'GET');

}));
