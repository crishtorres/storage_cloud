'use strict'

const base = 'http://localhost:5000/';
let error = false;
let dropZone;
let current_path;
let _token;

const form = document.getElementById('form_login');

// Chequear que soporte File API
if (window.File && window.FileReader && window.FileList && window.Blob) {
	//Correcto !
} else {
	alert('File API no es soportado por el navegador!.');
}

form.addEventListener('submit', login);

dropZone = document.getElementById("drop_zone");
dropZone.addEventListener("dragenter", dragenter, false);
dropZone.addEventListener("dragover", dragover, false);
dropZone.addEventListener("drop", drop, false);

let fileList = [];

function dragenter(e) {
	e.stopPropagation();
	e.preventDefault();
}

function dragover(e) {
	e.stopPropagation();
	e.preventDefault();
} 

function drop(e) {
	e.stopPropagation();
	e.preventDefault();

	var dt = e.dataTransfer;
	var files = dt.files;

	handleFiles(files);
}


function login(e){
	e.preventDefault();
	let user = document.getElementById('user_lg').value;
	let pass = document.getElementById('pass_lg').value;

	const myHeaders = new Headers();
	myHeaders.append("Authorization", "Basic " + btoa(user + ":" + pass));
	myHeaders.append("Access-Control-Allow-Origin", "*");


	const url = base+'login';
	fetch(url, {
		method: 'POST',
		headers: myHeaders,
		mode: 'cors'
	})
	.then((resp) => resp.json())
	.then(function(data){
		_token = data.token;
		getFiles();
	})
	.catch(function(error){
		console.log(error);
	});
}

function handleFiles(files) {

	let preview = document.getElementById("list");
	let name = '';

	for (let i = 0; i < files.length; i++) {
		let file = files[i];
		fileList.push(file);
		let imageType = /image.*/;

		var div = document.createElement("div");
		div.className = 'thumb_container';

		var img = document.createElement("img");
		img.classList.add("obj");
		img.file = file;
		img.className = 'thumb';

		var span = document.createElement("span");

		name = file.name;
		if (name.length > 15){
			name = name.substring(0,12) +"...";
		}

		span.innerHTML = name;
		span.className = 'name_thumb';

		div.appendChild(img);
		div.appendChild(span);

		preview.appendChild(div);

		var reader = new FileReader();
		if (file.type.match(imageType)) {
			reader.onload = (function(aImg) { return function(e) { aImg.src = e.target.result; }; })(img);
		}else{
			reader.onload = (function(aImg) { return function(e) { aImg.src = 'icons/file.svg'; }; })(img);
		}
		reader.readAsDataURL(file);
	}
}

function createNode(element) {
	return document.createElement(element);
}

function append(parent, el) {
	return parent.appendChild(el);
}

document.addEventListener('click', function(e){
	if(e.target){
		if(e.target.className == 'folder'){
			getFiles(e.target.id);
		}
	}
});

function getImgIcon(ext){
	for(var x of db_img){
		if(x.ext != ''){
			if(ext == x.ext){
				return 'icons/' + x.image;
			}
		}
	}

	return 'icons/file.svg';
}

function getFileExtension(filename) {
	return (/[.]/.exec(filename)) ? /[^.]+$/.exec(filename)[0] : 'any';
}

function createElement(isFolder = false, element, mainPath = ''){

	let div = createNode('div'),
  	img = createNode('img'),
  	span = createNode('span'),
  	a_del = createNode('a'),
  	a_download = createNode('a');

  	div.className = 'col-md-2 recuadro';
  	img.style.width = '30px';

  	a_del.href = 'javascript:void(0);';
  	a_del.innerHTML = '<img style="width:10px;" src="assets/img/clear.svg" >';

  	//const tmp = mainPath+'/'+element;
  	let tmp = '';

  	if(mainPath.substring(mainPath.length-1,1) != '/'){
  		tmp = mainPath+'/'+element;
  	}else{
  		tmp = mainPath+element;
  	}

  	const linkPath = tmp.replaceAll('/', '*');

  	if(!isFolder){
  		a_download.href = base+'download_file/'+linkPath;
  		a_download.target = '_blank';
  	}
  	a_download.innerHTML = '<img style="width:14px;" src="assets/img/download.svg">';


  	a_del.className = 'btn_rmdir';
  	a_download.className = 'btn_download';

  	if(isFolder){
  		img.src = 'assets/img/folder.svg';

  		let name = element;

  		if (name.length > 15){
  			name = name.substring(0,12) +"...";
  		}
        span.innerHTML = "<a class='folder' id='"+linkPath+"' href='#'>"+`${name}`+"</a>";
    }else{
    	img.src = getImgIcon(getFileExtension(element));
	    let name = element;

	    if (name.length > 15){
	    	name = name.substring(0,12) +"...";
	    }

	    //span.innerHTML = "<a class='folder' id='"+linkPath+"' href='#'>"+`${name}`+"</a>";
	    span.innerHTML = `${name}`;
	}

	a_del.onclick = function() {
		fn_rmdir(linkPath, isFolder);
	}

	append(div, img);
	append(div, span);
	append(div, a_del);
	if(!isFolder){
		append(div, a_download);
	}
	append(container, div);

}

function backdir(path = ''){
	let pathf = path.replaceAll('*', '/');
	let lastBar = 0;

	for (let i = 0; i <= pathf.length; i++) {
		//console.log(pathf.charAt(i));
		if(pathf.charAt(i) == '/' || pathf.charAt(i) == '\''){
			lastBar = i;
		}
	}

	if(lastBar > 0){
		console.log(path.substring(0, lastBar));
		return path.substring(0, lastBar).replaceAll('*', '/');
	}else{
		return '/';
		//return path.replaceAll('*', '/');
	}
}

function getFiles(path = ''){
	const container = document.getElementById('container');
	container.innerHTML = "";

	const myHeaders = new Headers();

	myHeaders.append('Content-Type', 'application/json');
	myHeaders.append('x-access-tokens', _token);

	const url = base+'list/'+encodeURIComponent(path);
	fetch(url,{method: 'GET',headers: myHeaders})
	.then((resp) => resp.json())
	.then(function(data){

		let ath = data.authorized

		if(ath != 'ok'){
			let frm = document.getElementById('form_login');
			frm.setAttribute('action', base+'/login');
			$("#modalLogin").modal('show');
			//document.getElementById('modalLogin').style.display = 'block';
			return;
		}else{
			$("#modalLogin").modal('hide');
		}

		/*
		let files = data[0]["files"]
		let directories = data[0]["directories"]
		let mainPathTmp = data[0]["path"]
		let prev_path = data[0]["prev_path"]
		*/
		let files = data.files
		let directories = data.directories
		let mainPathTmp = data.path
		let prev_path = data.prev_path
		let mainPath = ''
		
		//const txtPath = document.getElementById('path');
		//txtPath.value = mainPathTmp;
		current_path = mainPathTmp;

		//const txtCurrenPath = document.getElementById('current_path');
		//txtCurrenPath.value = mainPathTmp;
		//current_path = mainPathTmp;

		if(mainPathTmp.substring(mainPathTmp.length - 1, mainPathTmp.length) == '/'){
			mainPath = mainPathTmp.replaceAll('/','');
		}else{
			mainPath = mainPathTmp;
		}

		if(prev_path == '..'){
			let div1 = createNode('div'),
			img1 = createNode('img'),
			span1 = createNode('span');				

			div1.className = 'col-md-2 recuadro';
			img1.src = 'assets/img/up-arrows.svg';
			img1.style.width = '30px';

			let name1 = "..";

	        const tmp1 = backdir(path); //mainPath+'/'+name1;
	        const linkPath = tmp1.replaceAll('/', '*');

	        span1.innerHTML = "<a class='folder' id='"+linkPath+"' href='#'>..</a>";

	        append(div1, img1);
	        append(div1, span1);		    
	        append(container, div1);
	    }

	    const folders = directories.map(function(folder) {
	    	createElement(true, folder, mainPathTmp);
		})

	    const archs = files.map(function(file) {
	    	createElement(false, file, mainPathTmp);
		})

	})
	.catch(function(error){
		console.log(error);
	});
}

getFiles();
//download();

const btnMkDir = document.getElementById('btnMkDir');

if(btnMkDir){
	btnMkDir.addEventListener('click', function(e){
		//const txtPath = document.getElementById('path');
		var dir_name = prompt("Ingrese el nombre de la carpeta", "");

		if(dir_name.trim()!=''){

			const data = new FormData();
			data.append('dir_name', dir_name);
			data.append('parent_dir', current_path);// txtPath.value);

			const url = base+'mkdir';
			fetch(url, {
				method: 'POST',
				body: data
			})
			.then((resp) => resp.json())
			.then(function(res){
				if(res[0]['status'] == 200){
					var linkPath = current_path; //txtPath.value;
					linkPath = linkPath.replaceAll('/', '*');
					getFiles(linkPath)
					showFlashMessage(res[0]['msg']);
				}else{
					showFlashMessage(res[0]['msg'], true);
				}			
			});
		}
	});
}

function fn_rmdir(path, isFolder){
	if(isFolder){
		var del = confirm("Esta seguro que desea eliminar la carpeta seleccionada?");
	}else{
		var del = confirm("Esta seguro que desea eliminar el archivo seleccionada?");
	}

	if (del){
		//const txtPath = document.getElementById('path');
		const data = new FormData();

		path = path.replaceAll('*', '/');

		data.append('dir_name', path);
		data.append('parent_dir', current_path); //txtPath.value);

		if(isFolder){
			data.append('type', 'folder');
		}else{
			data.append('type', 'file');
		}

		const url = base+'rmelement';
		fetch(url, {
			method: 'POST',
			body: data
		})
		.then((resp) => resp.json())
		.then(function(res){
			if(res[0]['status'] == 200){
				var linkPath = current_path; //txtPath.value;
				linkPath = linkPath.replaceAll('/', '*');
				getFiles(linkPath)
				showFlashMessage(res[0]['msg']);
			}else{
				showFlashMessage(res[0]['msg'], true);
			}			
		});
	}
}

function showFlashMessage(msg, error = false){
	
	var flash_message = document.getElementById('flash_message');
	var flash_message_msg = document.getElementById('flash_message_msg');
	flash_message_msg.innerHTML = msg;

	flash_message.classList.remove('bg-success')
	flash_message.classList.remove('bg-danger')

	if(error){

		flash_message.classList.add('bg-danger');
	}else{
		
		flash_message.classList.add('bg-success');
	}

	flash_message.style.display = 'block';
	setTimeout("document.getElementById('flash_message').style.display='none'",3000);

}

var close_flash = document.getElementById('close_flash');
if(close_flash){
	close_flash.addEventListener('click', function(){
		var flash_message = document.getElementById('flash_message');
		flash_message.style.display = 'none';
	});
}

window.onload=function() { 
	document.getElementById('formUpload').onsubmit=function(e) { 
		e.preventDefault();
		upload();
	} 
} 

async function upload(){
	await uploadFiles()
}

async function uploadFiles(){
	
	var tot = 0;
	//const txtPath = document.getElementById('path');
	var path = current_path.replaceAll('*', '');// txtPath.value.replaceAll('*', '/');

	await Promise.all(fileList.map(async (file) => {
		var data = new FormData();
		data.append('file', file);
		data.append('path', path);

		const url = base+'upload';
		fetch(url, {
			method: 'POST',
			body: data
		})
		.then((resp) => resp.json())
		.then(function(res){
			tot++;
			if(res[0]['status'] == 200){

			}else{
				error = true;
				showFlashMessage(res[0]['msg'], true);
			}

			if(tot >= fileList.length){
				if(!error){
					//const txtPath = document.getElementById('path');
					var linkPath = current_path;//txtPath.value;
					linkPath = linkPath.replaceAll('/', '*');

					getFiles(linkPath)
					showFlashMessage('Archivo(s) subido(s) correctamente!');	
					document.getElementById('list').innerHTML= '';
				}
			}			
		});
	}));
}
