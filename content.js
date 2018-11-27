import Simmer from 'simmerjs';
import React from 'react';
import ReactDOM from 'react-dom';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import DragDropContainer from './DNDContainer';


let currentTarget = null;
let outputJsonArr = [];
window.outputData = {
  "name": 'Created Elements',
  "description": 'Description of Scenes',
  "createDate": '',
  "modifyDate": '',
  "version": '1.0.0',
  "allowContinue": true,
  "scenes": {}
};

const simmerObj = new Simmer(window,{
                        specificityThreshold: 100,
                        depth: 5,
                        errorHandling: true
                      });

(function(win, dom, chrome, simmer, reactDOM){

    const initializeTextFields= (event) => {
      let nameElement = dom.getElementById('eleName');
      let titleElement = dom.getElementById('eleTitle');

      nameElement.value = event.target.getAttribute('name');
      titleElement.value = event.target.getAttribute('title');

      updateSelectorOptions(event.target);
    }

    dom.addEventListener("contextmenu", function(event) {
      let divEle = dom.getElementById('eleBoxCont');
        //logic for saving the element
      initializeTextFields(event);
      divEle.style.left = event.pageX+'px';
      divEle.style.top = event.pageY+'px';
      divEle.style.visibility = 'hidden';
      currentTarget = event.target;

      $('.focusCls').removeClass('focusCls');

    });

    chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
        if(request == "getClickedEl") {
          let elem = dom.getElementById('eleBoxCont');
          elem.style.visibility = 'visible';
          currentTarget?$(currentTarget).addClass('focusCls'):null;
        } else if (request == "downloadJson") {
            downloadOutput(outputData, 'elements.json');
        } else if (request == "configureJSON") {
           OpenConfigureEditor();
        }
        else {
          var elements = JSON.parse(request);
          if (elements["name"] && elements["description"] && elements["createDate"] && elements["modifyDate"] && elements["version"] && elements["allowContinue"] && elements["scenes"]) {
            outputData = {
              "name": elements["name"],
              "description": elements["description"],
              "createDate": elements["createDate"],
              "modifyDate": elements["modifyDate"],
              "version": elements["version"],
              "allowContinue": elements["allowContinue"],
              "scenes": elements["scenes"]
            };
          }
          else
            alert("Please upload a valid JSON file.");
        }
    });

    const resetAndCloseBox = ()=>{
      let ele = dom.getElementById('eleBoxCont');
      ele.style.visibility = 'hidden';
      $('.focusCls').removeClass('focusCls');
    }

    const saveInJson = ()=>{
      const name = dom.getElementById('eleName').value, selector = $('#selectorSelect').find(":selected").text(),
        keys = Object.keys(outputData.scenes), title = dom.getElementById('eleTitle').value;
      if(!outputData.startAt) {
        outputData.startAt = name;
        outputData.createDate = Math.round((new Date()).getTime() / 1000);
      }
      if(keys.length) {
        outputData.scenes[keys.pop()].next = name;
      }
      outputData.modifyDate = Math.round((new Date()).getTime() / 1000);
      outputData.scenes[name] = {
        "selector": selector,
        "text": title,
        "next": ""
      };
      reactDOM.render(<DragDropContainer data={outputData} />, dom.getElementById("st-configure-list"));
      resetAndCloseBox();
    }

    const downloadOutput = (arr, filename) => {
      let a = dom.createElement('a'), blob = new Blob([JSON.stringify(arr)], {type: "application/json"}); ;

      a.href = win.URL.createObjectURL(blob);
      a.download = filename;
      a.style.display = 'none';
      dom.body.appendChild(a);
      a.click();
      dom.body.remove(a);
    }

    const OpenConfigureEditor = () => {
      let elem = dom.getElementById('st-configure-list');
      elem.style.display = 'block';
      reactDOM.render(<DragDropContainer data={outputData} />, dom.getElementById("st-configure-list"));
    }

    function updateCurrentTarget() {

      dom.querySelector('.focusCls').classList.remove('focusCls');
      currentTarget.hasAttribute('class')?currentTarget.setAttribute('class',currentTarget.getAttribute('class')+' focusCls'):currentTarget.setAttribute('class','focusCls');
    }

    const selectUp = ()=>{
      if(currentTarget.parentNode.tagName != "BODY"){
        currentTarget = currentTarget.parentNode;
        updateCurrentTarget(currentTarget);
        updateSelectorOptions(currentTarget);
      }
    }

    const selectDown = ()=>{
      if(currentTarget.hasChildNodes() ){
        const validChildNodes = [];
        currentTarget.childNodes.forEach((node)=>{
          if(node.childNodes.length){
            validChildNodes.push(node);
          }
        });
        if(validChildNodes.length) {
           currentTarget = validChildNodes[0];
           updateCurrentTarget();
           updateSelectorOptions(currentTarget);
        }
      }
    }

    const updateSelectorOptions = (currentTarget) => {
      const selectorPath  = simmer(currentTarget);

      $('#selectorSelect').empty();
      var selectBoxOptions = dom.getElementById('selectorSelect').options;

      const siblingNodes = currentTarget.parentNode.children;
      for(let i=0; i< siblingNodes.length; i++) {
        let siblingSelector = simmer(siblingNodes[i])?simmer(siblingNodes[i]): "";
        selectBoxOptions.add(new Option(siblingSelector, siblingSelector, false, siblingSelector==selectorPath));
      }
    }

    const handleSelectorChange = () => {
      const selectorPath = $('#selectorSelect').find(":selected").text();
      currentTarget = dom.querySelector(selectorPath);
      updateCurrentTarget(currentTarget);
    }

    const popupTemplate = ()=>(
        `<div id="__balloon__"></div><div id="eleBoxCont" class="set-initial content-box direction-column spaceBetween">
              <div class="direction-row spaceBetween control-group">
                <span class="text-node">Title</span> <input type="text" id="eleTitle"/>
              </div>
              <div class="direction-row spaceBetween control-group">
                <span class="text-node">Name</span> <input type="text" id="eleName" />
              </div>
              <div class="direction-row spaceBetween control-group">
                <div class="direction-row spaceBetween">
                 <span class="text-node">Selector</span> <select id="selectorSelect"></select>
                </div>
                <div class="direction-column action-div">
                    <div class="text-node" id="st-selector-up">Up</div> <div class="text-node" id="st-selector-down">Down</div>
                </div>
              </div>

              <div class="direction-row centerPosition flex-margin3 flex-marginTop10">
                  <button id="st-btn-cancel" class="flex-margin3 cancel-style" value="CANCEL"><span>CANCEL</span></button>
                  <button id="st-btn-save"  class="flex-margin3 submit-style" value="SUBMIT"><span>SUBMIT</span></button>
              </div>
          </div>`
      );

    dom.body.insertAdjacentHTML('beforeend',popupTemplate());
    dom.body.insertAdjacentHTML('beforeend','<div id="st-configure-list" style="display:none"></div>');

    dom.querySelector('#st-btn-cancel').addEventListener('click', resetAndCloseBox);
    dom.querySelector('#st-btn-save').addEventListener('click', saveInJson);
    dom.querySelector('#st-selector-up').addEventListener('click', selectUp);
    dom.querySelector('#st-selector-down').addEventListener('click', selectDown);
    dom.querySelector('#selectorSelect').addEventListener('change', handleSelectorChange);



})(window, document, chrome, simmerObj, ReactDOM)
