var contextMenuItem = {
  "title": "Story-Teller Inspect",
  "contexts": ["all"],
  "onclick": getInfo
};

var currTab;

chrome.contextMenus.create(contextMenuItem);

chrome.tabs.onActivated.addListener(function(info) {currTab = info.tabId;});

function getInfo(info, tab) {
  chrome.tabs.sendMessage(tab.id, "getClickedEl");
}

chrome.runtime.onMessage.addListener(
    function(request, sender, sendResponse) {
        switch (request.directive) {
        case "popup-click":
            // execute the content script
            chrome.tabs.sendMessage(currTab, "downloadJson");
            break;
        case "popup-click-upload":
            if (request.content)
            {
                chrome.tabs.sendMessage(currTab, request.content);
            }
           
            else
                alert("The uploaded file is empty.");
            break;
        case "configure-click": 
            // configure the output data
            chrome.tabs.sendMessage(currTab, "configureJSON");
            break;
        default:
            // helps debug when request directive doesn't match
            alert("Unmatched request of '" + request + "' from script to background.js from " + sender);
        }
    }
);
