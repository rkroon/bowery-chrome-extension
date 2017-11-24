// Copyright (c) 2014 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.
let settings = {};
const DEFAULT_SETTINGS = {
  domain: 'http://localhost:8080',
};

function executeContentScript() {
  chrome.tabs.executeScript(null, {
    file: 'parse-data.js',
  });
}

function loginApplication() {
  const LOGIN_URL = '/#!/login-extension';
  const loginPageWidth = 470;
  const loginPageHeight = 624;
  const loginPageType = "popup";

  let loginPageTop = (window.screen.height - loginPageHeight) / 2;
  let loginPageLeft = (window.screen.width - loginPageWidth) / 2;

  loginPageTop = (!isNaN(loginPageTop) && (loginPageTop > 0)) ? parseInt(loginPageTop) : 0;
  loginPageLeft = (!isNaN(loginPageLeft) && (loginPageLeft > 0)) ? parseInt(loginPageLeft) : 0;

  let openedWindowId = 0;
  chrome.windows.create({
    url: [settings.domain + LOGIN_URL],
    type: loginPageType,
    width: loginPageWidth,
    height: loginPageHeight,
    left: loginPageLeft,
    top: loginPageTop
  }, function (createdWindow) {
    if (createdWindow) {
      console.log("Opened window with id", createdWindow.id);
      openedWindowId = createdWindow.id;
      chrome.windows.onRemoved.addListener(function (removedId) {
        if (removedId === openedWindowId) {
          openedWindowId = 0;
        }
      });
    }
  });

}

document.addEventListener('DOMContentLoaded', () => {
  const btnGetData = document.getElementById('btn-get-data');
  btnGetData.addEventListener('click', () => {
    executeContentScript();
  });

  const btnLogin = document.getElementById('btn-login');
  btnLogin.addEventListener('click', () => {
    loginApplication();
  });
  loadSettings();
});

function loadSettings() {
  // Use default values blank strings
  chrome.storage.sync.get({
    domain: DEFAULT_SETTINGS.domain,
  }, function (items) {
    settings = items;
  });
}
