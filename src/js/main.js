import fs   from 'fs';
import path from 'path';
var remote   = require('electron').remote;
var remoteFS = remote.require('fs');

const HOME_PAGE_CONTENT   = path.join(__dirname + '/components/home/home.html');
const DETECT_PAGE_CONTENT = path.join(__dirname + '/components/detect/detect.html'); 
const scriptFilename      = __dirname + '/darkflow/predictUploaded.py';


let getPageFromPath = (path)=>{
	return fs.readFileSync(path,'utf-8').toString();
}

(()=>{
	document.getElementById('pageContentWrapper').innerHTML = getPageFromPath(HOME_PAGE_CONTENT);
})();

let navigateToPages = (page)=>{
	switch(page){
		case 'detection-page':
			document.getElementById('pageContentWrapper').innerHTML            = getPageFromPath(DETECT_PAGE_CONTENT);
			document.getElementById('homeMenuWrapper').style.border            = 'none';
			document.getElementById('detectionMenuWrapper').style.borderBottom = 'solid';
			document.getElementById('detectionMenuWrapper').style.borderWidth  = '2px';
			document.getElementById('detectionMenuWrapper').style.borderColor  = '#ea7312';
			return;
		case 'home-page':
			document.getElementById('pageContentWrapper').innerHTML       = getPageFromPath(HOME_PAGE_CONTENT);
			document.getElementById('detectionMenuWrapper').style.border  = 'none';
			document.getElementById('homeMenuWrapper').style.borderBottom = 'solid';
			document.getElementById('homeMenuWrapper').style.borderWidth  = '2px';
			document.getElementById('homeMenuWrapper').style.borderColor  = '#ea7312';
			return;
	}
}

let uploadPhoto = ()=>{
	remote.dialog.showOpenDialog(remote.getCurrentWindow(),
		{
			filters: [
	      		{name: 'Images', extensions: ['png','jpg']}
	    	]
		},
		(filepaths,bookmarks)=>{
			if(filepaths);
			else return;
			document.getElementById('detectContentWrapper').innerHTML = '';
			let _img = remoteFS.readFileSync(filepaths[0]);
			_img     = _img.toString('base64');
			let _out = '<img style="height:100%;width:100%;object-fit:contain;"'
				+ 'src="data:image/png;base64,' + _img + '" />';
			let _target = document.getElementById('detectContentWrapper');
			_target.insertAdjacentHTML('beforeend', _out);
			document.getElementById('loadingScreenWrapper').style.display = 'block';
			detectFunction(filepaths[0]);
			return;
	});
}

let detectFunction = (filepath)=>{
	let python   = require('child_process').spawn('python', [scriptFilename,String(filepath)]);
	document.getElementById('statusImageWrapper').innerHTML    = '';
	document.getElementById('detectResultWrapper').innerHTML   = '';
	document.getElementById('statusDescription').innerHTML     = '';
	document.getElementById('statisticsDescription').innerHTML = '';
	python.stdout.on('data',function(data){

	    let final_results = JSON.parse(fs.readFileSync(__dirname+'/darkflow/result/result_file.json','utf8'));
	    if(String(final_results.label) == 'null' ){
	    	let _out = '<img style="height:100%;width:100%;object-fit:contain;"'
				+ 'src="./icons/detect/nonfound.png"/>';
			let _target = document.getElementById('statusImageWrapper');
			_target.insertAdjacentHTML('beforeend', _out);
			document.getElementById('loadingScreenWrapper').style.display = 'none';
			document.getElementById('statusDescription').innerHTML = 'No Entamoeba Found!';
	    }
	    else{
	    	document.getElementById('statusDescription').innerHTML     = 'Entamoeba Found!';
	    	document.getElementById('statisticsDescription').innerHTML = String(Math.floor(Number(final_results.confidence)*100)) +
	    		'% ' + ( final_results.label == 'pathogenic' ? 'pathogenic ' : 'non-pathogenic ') + 'confidence' 
	    	let _out = '<img style="height:100%;width:100%;object-fit:contain;"'
				+ 'src="./icons/detect/found.png"/>';
			let _target = document.getElementById('statusImageWrapper');
			_target.insertAdjacentHTML('beforeend', _out);
	    	displayResultImage();
	    }
	    
	});
}
	
let displayResultImage = ()=>{
	let _img = remoteFS.readFileSync(__dirname + '/darkflow/result/result.png').toString('base64');
	let _out = '<img style="height:100%;width:100%;object-fit:contain;"'
				+ 'src="data:image/png;base64,' + _img + '" />';
	let _target = document.getElementById('detectResultWrapper');
	_target.insertAdjacentHTML('beforeend', _out);
	document.getElementById('loadingScreenWrapper').style.display = 'none';
}



