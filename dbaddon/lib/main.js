var { indexedDB, IDBKeyRange } = require('sdk/indexed-db');

var database = {};

database.onerror = function(e) {
  console.error(e.value)
}

function open(version) {
  var request = indexedDB.open("stuff", version);

  request.onupgradeneeded = function(e) {
    var db = e.target.result;
    e.target.transaction.onerror = database.onerror;

    if(db.objectStoreNames.contains("items")) {
      db.deleteObjectStore("items");
    }

    var store = db.createObjectStore("items",
      {keyPath: "time"});
  };

  request.onsuccess = function(e) {
    database.db = e.target.result;
  };

  request.onerror = database.onerror;
};

function addItem(name) {
  var db = database.db;
  var trans = db.transaction(["items"], "readwrite");
  var store = trans.objectStore("items");
  var time = new Date().getTime();
  var request = store.put({
    "name": name,
    "time": time
  });

  request.onerror = database.onerror;
};

function getItems(callback) {
  var cb = callback;
  var db = database.db;
  var trans = db.transaction(["items"], "readwrite");
  var store = trans.objectStore("items");
  var items = new Array();

  trans.oncomplete = function() {
    cb(items);
  }

  var keyRange = IDBKeyRange.lowerBound(0);
  var cursorRequest = store.openCursor(keyRange);

  cursorRequest.onsuccess = function(e) {
    var result = e.target.result;
    if(!!result == false)
      return;

    items.push(result.value.name);
    result.continue();
  };

  cursorRequest.onerror = database.onerror;
};

function listItems(itemList) {
  console.log(itemList);
}

open("1");

var add = require("sdk/ui/button/action").ActionButton({
  id: "add",
  label: "Add",
  icon: "./add.png",
  onClick: function() {
    addItem(require("sdk/tabs").activeTab.title);
  }
});

var list = require("sdk/ui/button/action").ActionButton({
  id: "list",
  label: "List",
  icon: "./list.png",
  onClick: function() {
    getItems(listItems);
  }
})
