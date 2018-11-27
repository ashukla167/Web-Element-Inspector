document.addEventListener('DOMContentLoaded', function() {
  function downloadJson(info, tab) {
    chrome.runtime.sendMessage({directive: "popup-click"}, function(response) {
      this.close();
    });
  }

  function uploadJson(info, tab) {
    var file = document.getElementById("uploadBtn").files[0];
    var reader = new FileReader();
    reader.readAsText(file, "UTF-8");
    reader.onload = function(evt)
    {
      chrome.runtime.sendMessage({directive: "popup-click-upload", content: evt.target.result}, function(response) {
        this.close();
      });
    }
  }
  
  function configureBtn(info, tab) {
    chrome.runtime.sendMessage({directive: "configure-click"}, function(response) {
      this.close();
    });
  }


  document.getElementById("downloadBtn").addEventListener("click", downloadJson);
  document.getElementById("uploadBtn").addEventListener("change", uploadJson);
  document.getElementById("configureBtn").addEventListener("click", configureBtn);
});
