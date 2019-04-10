"use strict";

var _fs = _interopRequireDefault(require("fs"));

var _path = _interopRequireDefault(require("path"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

var remote = require('electron').remote;

var remoteFS = remote.require('fs');

var HOME_PAGE_CONTENT = _path["default"].join(__dirname + '/components/home/home.html');

var DETECT_PAGE_CONTENT = _path["default"].join(__dirname + '/components/detect/detect.html');

var scriptFilename = __dirname + '/darkflow/predictUploaded.py';

var getPageFromPath = function getPageFromPath(path) {
  return _fs["default"].readFileSync(path, 'utf-8').toString();
};

(function () {
  document.getElementById('pageContentWrapper').innerHTML = getPageFromPath(HOME_PAGE_CONTENT);
})();

var navigateToPages = function navigateToPages(page) {
  switch (page) {
    case 'detection-page':
      document.getElementById('pageContentWrapper').innerHTML = getPageFromPath(DETECT_PAGE_CONTENT);
      document.getElementById('homeMenuWrapper').style.border = 'none';
      document.getElementById('detectionMenuWrapper').style.borderBottom = 'solid';
      document.getElementById('detectionMenuWrapper').style.borderWidth = '2px';
      document.getElementById('detectionMenuWrapper').style.borderColor = '#ea7312';
      return;

    case 'home-page':
      document.getElementById('pageContentWrapper').innerHTML = getPageFromPath(HOME_PAGE_CONTENT);
      document.getElementById('detectionMenuWrapper').style.border = 'none';
      document.getElementById('homeMenuWrapper').style.borderBottom = 'solid';
      document.getElementById('homeMenuWrapper').style.borderWidth = '2px';
      document.getElementById('homeMenuWrapper').style.borderColor = '#ea7312';
      return;
  }
};

var uploadPhoto = function uploadPhoto() {
  remote.dialog.showOpenDialog(remote.getCurrentWindow(), {
    filters: [{
      name: 'Images',
      extensions: ['png', 'jpg']
    }]
  }, function (filepaths, bookmarks) {
    if (filepaths) ;else return;
    document.getElementById('detectContentWrapper').innerHTML = '';

    var _img = remoteFS.readFileSync(filepaths[0]);

    _img = _img.toString('base64');

    var _out = '<img style="height:100%;width:100%;object-fit:contain;"' + 'src="data:image/png;base64,' + _img + '" />';

    var _target = document.getElementById('detectContentWrapper');

    _target.insertAdjacentHTML('beforeend', _out);

    document.getElementById('loadingScreenWrapper').style.display = 'block';
    detectFunction(filepaths[0]);
    return;
  });
};

var detectFunction = function detectFunction(filepath) {
  var python = require('child_process').spawn('python', [scriptFilename, String(filepath)]);

  document.getElementById('statusImageWrapper').innerHTML = '';
  document.getElementById('detectResultWrapper').innerHTML = '';
  document.getElementById('statusDescription').innerHTML = '';
  document.getElementById('statisticsDescription').innerHTML = '';
  python.stdout.on('data', function (data) {
    var final_results = JSON.parse(_fs["default"].readFileSync(__dirname + '/darkflow/result/result_file.json', 'utf8'));

    if (String(final_results.label) == 'null') {
      var _out = '<img style="height:100%;width:100%;object-fit:contain;"' + 'src="./icons/detect/nonfound.png"/>';

      var _target = document.getElementById('statusImageWrapper');

      _target.insertAdjacentHTML('beforeend', _out);

      document.getElementById('loadingScreenWrapper').style.display = 'none';
      document.getElementById('statusDescription').innerHTML = 'No Entamoeba Found!';
    } else {
      document.getElementById('statusDescription').innerHTML = 'Entamoeba Found!';
      document.getElementById('statisticsDescription').innerHTML = String(Math.floor(Number(final_results.confidence) * 100)) + '% ' + (final_results.label == 'pathogenic' ? 'pathogenic ' : 'non-pathogenic ') + 'confidence';

      var _out2 = '<img style="height:100%;width:100%;object-fit:contain;"' + 'src="./icons/detect/found.png"/>';

      var _target2 = document.getElementById('statusImageWrapper');

      _target2.insertAdjacentHTML('beforeend', _out2);

      displayResultImage();
    }
  });
};

var displayResultImage = function displayResultImage() {
  var _img = remoteFS.readFileSync(__dirname + '/darkflow/result/result.png').toString('base64');

  var _out = '<img style="height:100%;width:100%;object-fit:contain;"' + 'src="data:image/png;base64,' + _img + '" />';

  var _target = document.getElementById('detectResultWrapper');

  _target.insertAdjacentHTML('beforeend', _out);

  document.getElementById('loadingScreenWrapper').style.display = 'none';
};