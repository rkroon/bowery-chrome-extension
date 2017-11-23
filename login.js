(() => {
  const LOGIN_URL = 'http://localhost:8080/#!/login-extension';
  const loginPageWidth = 470;
  const loginPageHeight = 624;
  const loginPageType = "popup";

  let loginPageTop = (window.screen.height - loginPageHeight) / 2;
  let loginPageLeft = (window.screen.width - loginPageWidth) / 2;

  loginPageTop = (!isNaN(loginPageTop) && (loginPageTop > 0)) ? parseInt(loginPageTop) : 0;
  loginPageLeft = (!isNaN(loginPageLeft) && (loginPageLeft > 0)) ? parseInt(loginPageLeft) : 0;

  let openedWindowId = 0;

  const chromeWindowsCreateNewPopup = () => {
    chrome.windows.create({
      url: [LOGIN_URL],
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
})();
