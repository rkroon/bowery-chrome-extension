// Copyright (c) 2014 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.
let settings = {};
const DEFAULT_SETTINGS = {
  loginUrl: 'http://localhost:8080/#!/login-extension',
  apiUrl: 'http://localhost:8080/api/extension/import',
}

function executeContentScript() {
  chrome.tabs.executeScript(null, {
    file: 'parse-data.js',
  });
}

function logintoApplication() {
  chrome.tabs.executeScript(null, {
    file: 'login.js',
  });
}

document.addEventListener('DOMContentLoaded', () => {
  const btnGetData = document.getElementById('btn-get-data');
  btnGetData.addEventListener('click', () => {
    executeContentScript();
  });

  const btnLogin = document.getElementById('btn-login');
  btnLogin.addEventListener('click', () => {
    logintoApplication();
  });
});

function loadSettings() {
  // Use default values blank strings
  chrome.storage.sync.get({
    loginUrl: DEFAULT_SETTINGS.loginUrl,
    apiUrl: DEFAULT_SETTINGS.apiUrl,
  }, function(items) {
    settings = items;
  });
}
