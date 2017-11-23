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

  // if (openedWindowId) {
  //   chrome.windows.update(openedWindowId, { "focused": true });
  // } else if (loginPageUrl) {
  //   var loginPageTab = formTabQueryInfo(loginPageUrl, true);
  //   chrome.tabs.query(loginPageTab, function (tabsArray) {
  //     if (tabsArray && tabsArray[0]) {
  //       tabsArray.forEach(function (tab) {
  //         chrome.windows.remove(tab.windowId, function () {
  //         });
  //       });
  //     }
      chromeWindowsCreateNewPopup();
  //   });
  // }
}

chrome.runtime.onMessage.addListener((request, sender, sendRespone) => {
  console.log(sender.tab ?
    "from a content script:" + sender.tab.url :
    "from the extension");
    const url = request.url;
  if (typeof url === 'string') {
    openURLInTab(url);
    sendResponse({ parsedUrl: request.url });
  }
});