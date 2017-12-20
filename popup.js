// Copyright (c) 2014 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.
let settings = {};
const DEFAULT_SETTINGS = {
  domain: 'http://localhost:8080',
};
function showMessage(success = true) {
  if (success) {
    $('#msg-success').removeClass('hidden');
    setTimeout(() => {
      $('#msg-success').addClass('hidden');
    }, 3000);
    return;
  }
  $('#msg-error').removeClass('hidden');
  setTimeout(() => {
    $('#msg-error').addClass('hidden');
  }, 3000);
}
function loadToServer(result) {
  const POST_DATA_URL = '/api/rent-comparables/upload/extension';

  $.ajax({
    type: "POST",
    url: settings.domain + POST_DATA_URL,
    data: result,
  })
    .done((data, status) => {
      console.log("Status", status);
      if (data.error) {
        console.log('Error occured, mesage:');
        console.log(data.message);
        showMessage(false);
      } else {
        console.log('Data was saved, saved item:');
        console.log(data.saved);
        showMessage(true);
      }
    })
    .fail((jqXHR, status, errorThrown) => {
      console.error('Error:', status);
      console.error('Thrown:', errorThrown);
      showMessage(false);
    });
}

function generateAmenities(amenities) {
  const amenitiesTable = $('#amenities');
  for (let i = 0; i < amenities.length; i++) {
    amenitiesTable.append(`
    <li>${amenities[i]}</li>`);
  }
}

function generatePhotos(photos) {
  const $photos = $('#photos');
  for (let i = 0; i < photos.length; i++) {
    $photos.append(`
    <li><img src="${photos[i]}"/></li>`);
  }
}

function fillForm(data) {
  $('#btn-get-data').addClass('hidden');
  $('#edit-data').removeClass('hidden');
  Object.keys(data).forEach((key) => {
    if (key === 'amenities') {
      generateAmenities(data[key]);
    } else if (key === 'photos') {
      generatePhotos(data[key]);
    } else if (key === 'coords') {
      $(`#${key}`).text(`Lat: ${data.coords.latitude}; Lng: ${data.coords.longitude}.`);
    } else {
      const item = data[key];
      $(`#${key}`).val(item);
    }
  });

  $('#btn-send-data').on('click', (e) => {
    e.preventDefault();
    const editedData = Object.assign({}, data, {
      listingAgentNames: $('#agent').val(),
      unit: $('#unit').val(),
      address: $('#address').val(),
      borough: $('#borough').val(),
      zip: Number($('#zip').val()),
      neighborhood: $('#neighborhood').val(),
      unitType: $('#unit-type').val(),
      rent: Number($('#rent').val()),
      sqft: Number($('#sqft').val()),
      rooms: Number($('#rooms').val()),
      bedrooms: Number($('#bedrooms').val()),
      bathrooms: Number($('#bathrooms').val()),
    });

    console.log(editedData);
    loadToServer(editedData);
    $('#btn-get-data').removeClass('hidden');
    $('#edit-data').addClass('hidden');
  });
}

function executeContentScript() {
  chrome.extension.onRequest.addListener(function (parsedData) {
    fillForm(parsedData);
  });
  chrome.tabs.executeScript(null, {
    file: 'jquery.min.js',
  }, () => {
    chrome.tabs.executeScript(null, {
      file: 'parse-data.js',
    });
  });

}

function loginApplication() {
  const LOGIN_URL = '/#!/login-extension';
  const loginPageWidth = 470;
  const loginPageHeight = 624;
  const loginPageType = 'popup';

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
      console.log('Opened window with id', createdWindow.id);
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
