// Copyright (c) 2014 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.

/**
 * Get the current URL.
 *
 * @param {function(string)} callback called when the URL of the current tab
 *   is found.
 */
function getCurrentTabUrl(callback) {
  // Query filter to be passed to chrome.tabs.query - see
  // https://developer.chrome.com/extensions/tabs#method-query
  var queryInfo = {
    active: true,
    currentWindow: true
  };

  chrome.tabs.query(queryInfo, (tabs) => {
    // chrome.tabs.query invokes the callback with a list of tabs that match the
    // query. When the popup is opened, there is certainly a window and at least
    // one tab, so we can safely assume that |tabs| is a non-empty array.
    // A window can only have one active tab at a time, so the array consists of
    // exactly one tab.
    var tab = tabs[0];

    // A tab is a plain object that provides information about the tab.
    // See https://developer.chrome.com/extensions/tabs#type-Tab
    var url = tab.url;

    // tab.url is only available if the "activeTab" permission is declared.
    // If you want to see the URL of other tabs (e.g. after removing active:true
    // from |queryInfo|), then the "tabs" permission is required to see their
    // "url" properties.
    console.assert(typeof url == 'string', 'tab.url should be a string');

    callback(url);
  });

  // Most methods of the Chrome extension APIs are asynchronous. This means that
  // you CANNOT do something like this:
  //
  // var url;
  // chrome.tabs.query(queryInfo, (tabs) => {
  //   url = tabs[0].url;
  // });
  // alert(url); // Shows "undefined", because chrome.tabs.query is async.
}

function executeContentScript() {
  chrome.tabs.executeScript(null, {
    file: 'parse-data.js',
  });
}

function logintoApplication() {
  const loginUrl = 'http://localhost:8080/#!/login-extension';
  chrome.runtime.sendMessage({url: loginUrl }, function (response) {
    $('#log').text(JSON.stringify(response));
  });
    // chrome.identity.launchWebAuthFlow(
    //   { 'url': 'http://localhost:8080/#!/login', 'interactive': true },
    //   function (redirect_url) {
    //     /* Extract token from redirect_url */
    //     alert(redirect_url);
    //   });
}

function sendDataToApi() {
  const testData = {
    Address: "Dumbo Lofts 65 Washington Street Brooklyn, NY 11201",
    Baths:    2,
    Bedrooms: 2,
    Neighborhood: "DUMBO",
    Price: 4510,
    Sqft: 909,
    "Total Rooms": 4,
    URI: "https://streeteasy.com/building/dumbo-lofts/5d?featured=1",
    Unit: "",
    "Unit Type": "Rental Unit",
    imageUrl: "https://cdn-img-feed.streeteasy.com/nyc/image/43/288252243.jpg",
  };

  chrome.runtime.sendMessage({data: testData}, function(response) {
    $('#log').first().text(JSON.stringify(response));
  });
}

document.addEventListener('DOMContentLoaded', () => {
  var btnGetData = document.getElementById('btn-get-data');
  btnGetData.addEventListener('click', () => {
    executeContentScript();
  });

  const btnLogin = document.getElementById('btn-login');
  btnLogin.addEventListener('click', () => {
    logintoApplication();
  });

  const btnSendData = document.getElementById('btn-send-data');
  btnSendData.addEventListener('click', () => {
    sendDataToApi();
  })
});
