// Saves options to chrome.storage
function save_options(event) {
  event.preventDefault();

  const domain = $('#domain-url').val();
  chrome.storage.sync.set({
    domain,
  }, function () {
    // Update status to let user know options were saved.
    $('#status').text('Settings saved.');

    setTimeout(function () {
      $('#status').text('');
    }, 2000);
  });
}

// Restores extension settings
// stored in chrome.storage.
function restore_options() {
  // Use default values localhost settings
  chrome.storage.sync.get({
    domain: 'http://localhost:8080',
  }, function (items) {
    $('#domain-url').val(items.domain);
  });

  $('#settingsForm').submit(save_options);
}
$(document).ready(restore_options);