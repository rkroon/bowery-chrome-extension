function test() {
  //$('.Container').css('background-color', 'red');
  console.log('tested!!!');
  debugger;
  
  chrome.runtime.sendMessage({ testData: 'test' },(response) => {
      console.log('Respone fired!');
  });

  chrome.storage.sync.set({ testData: 'test' });
  chrome.storage.sync.get(testData, (data) => {
    const result = chrome.runtime.lastError ? null : data[testData];
    debugger;
  });


}


test();
