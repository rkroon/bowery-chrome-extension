// Saves options to chrome.storage
function save_options(event) {
  event.preventDefault();

  var loginUrl = document.getElementById('login-url').value;
  var apiUrl = document.getElementById('api-url').value;
  chrome.storage.sync.set({
    loginUrl: loginUrl,
    apiUrl: apiUrl
  }, function() {
    // Update status to let user know options were saved.
    var status = document.getElementById('status');
    status.textContent = 'Settings saved.';
    setTimeout(function() {
      status.textContent = '';
    }, 2000);
  });
}

// Restores extension settings
// stored in chrome.storage.
function restore_options() {
  // Use default values localhost settings
  chrome.storage.sync.get({
    loginUrl: 'http://localhost:8080/#!/login-extension',
    apiUrl: 'http://localhost:8080/api/extension/import'
  }, function(items) {
    $('#login-url').val(items.loginUrl);
    $('#api-url').val(items.apiUrl);
  });

  $('#settingsForm').submit(save_options);
}

document.addEventListener('DOMContentLoaded', restore_options);