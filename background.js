function openURLInTab(loginPageUrl) {
  const loginPageWidth = 470;
  const loginPageHeight = 624;
  const loginPageType = "popup";

  let loginPageTop = (window.screen.height - loginPageHeight) / 2;
  let loginPageLeft = (window.screen.width - loginPageWidth) / 2;

  loginPageTop = (!isNaN(loginPageTop) && (loginPageTop > 0)) ? parseInt(loginPageTop) : 0;
  loginPageLeft = (!isNaN(loginPageLeft) && (loginPageLeft > 0)) ? parseInt(loginPageLeft) : 0;

  let openedWindowId = 0;

  var chromeWindowsCreateNewPopup = function () {
    chrome.windows.create({
      url: [loginPageUrl],
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
  };

  chromeWindowsCreateNewPopup();
}

chrome.runtime.onMessage.addListener((request, sender, sendRespone) => {
  const POST_DATA_URL = 'http://localhost:8080/api/extension/import';
  const url = request.url;
  if (typeof url === 'string') {
    openURLInTab(url);
    sendResponse({ parsedUrl: request.url });
  }

  const data = request.data;
  if (data) {
    $.ajax({
      type: "POST",
      url: POST_DATA_URL,
      data: data,
    })
      .done((data, status) => {
        console.log("Data", data);
        console.log("Status", status);
        sendRespone({ data: data, status: status });
      })
      .fail((jqXHR, status, errorThrown) => {
        console.error('Error:', status);
        console.error('Thrown:', errorThrown);
        sendRespone({error: status, message: errorThrown});
      });
  }

  return true;
});