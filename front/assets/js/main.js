'use strict'

const base = 'http://localhost:5000/';
const gifLoader = './assets/img/loader.gif';
let error = false;
let dropZone;
let current_path;

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

	let dt = e.dataTransfer;
	let files = dt.files;

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
		localStorage.setItem('personal_cloud_token', data.token) //CAMBIAR!
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

		let div = document.createElement("div");
		div.className = 'thumb_container';

		let img = document.createElement("img");
		img.classList.add("obj");
		img.file = file;
		img.className = 'thumb';

		let span = document.createElement("span");

		name = file.name;
		if (name.length > 15){
			name = name.substring(0,12) +"...";
		}

		span.innerHTML = name;
		span.className = 'name_thumb';

		div.appendChild(img);
		div.appendChild(span);

		preview.appendChild(div);

		let reader = new FileReader();
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
		}else if (e.target.className == 'file') {
			//getContentFile(e.target.id);
		}else if (e.target.parentElement.className == 'btn_download'){
			e.preventDefault(e)
			getDownloadFile(e.target.parentElement.id, e.target.parentElement.name);
		}
	}
});

function getImgIcon(ext){
	for(let x of db_img){
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

	div.className = 'col-md-2 col-xs-6 recuadro';
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
  		a_download.href = "#"; //base+'download_file/'+linkPath;
  		a_download.id = linkPath
  		a_download.target = '_blank';
  		a_download.name = element;
  	}
  	a_download.innerHTML = '<img style="width:14px;" src="assets/img/download.svg">';


  	a_del.className = 'btn_rmdir';
  	a_download.className = 'btn_download';
  	
  	let name = element;

  	if (name.length > 15){
  		name = name.substring(0,12) +"...";
  	}

  	if(isFolder){
  		img.src = 'assets/img/folder.svg';

  		/*if (name.length > 15){
  			name = name.substring(0,12) +"...";
  		}*/
  		span.innerHTML = "<a class='folder' id='"+linkPath+"' href='#'>"+`${name}`+"</a>";
  	}else{
  		img.src = getImgIcon(getFileExtension(element));

  		span.innerHTML = "<a class='file' id='"+linkPath+"' href='#'>"+`${name}`+"</a>";
	    //span.innerHTML = `${name}`;
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

function getContentFile(path){

	let modalFile_body = document.getElementById('modalFile_body')
	modalFile_body.innerHTML = ""

	const myHeaders = new Headers();

	myHeaders.append('Content-Type', 'application/json');
	myHeaders.append('x-access-tokens', localStorage.getItem('personal_cloud_token'));

	const url = base+'get_file/'+encodeURIComponent(path);
	fetch(url,{method: 'GET',headers: myHeaders})
	.then((resp) => resp.json())
	.then(function(data){
		modalFile_body.innerHTML = data.content;
		$('#modalFile').modal('show');
	})
	.catch(function(error){
		console.log(error);
	});
}

function make_breadcrumb(path = ''){
	//let pathf = path.replaceAll('*', '/')

	let paths = path.split('*')
	let html = ""
	let backFolder = ""

	for (let i = 0; i < paths.length; i++){
		if(paths[i]!= ''){
			backFolder+="*"+paths[i]
		}else{
			backFolder = ""
		}

		if(i == (paths.length - 1)){ 
			html+=`<li class='active'>${paths[i]}</li>`
		}else{
			html+=`<li><a class='folder' id='${backFolder}' href='#'>${paths[i]}</a></li>`
		}
			
	}

	document.getElementById('list_breadcrumb').innerHTML = html
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
		//console.log(path.substring(0, lastBar));
		return path.substring(0, lastBar).replaceAll('*', '/');
	}else{
		return '/';
	}
}

function getFiles(path = ''){
	const container = document.getElementById('container');
	container.innerHTML = "<img style='margin:auto' class='img-responsive' src='" + gifLoader + "' >";

	const myHeaders = new Headers();

	myHeaders.append('Content-Type', 'application/json');
	myHeaders.append('x-access-tokens', localStorage.getItem('personal_cloud_token'));

	const url = base+'list/'+encodeURIComponent(path);
	fetch(url,{method: 'GET',headers: myHeaders})
	.then((resp) => resp.json())
	.then(function(data){

		let ath = data.authorized
		/*
		if(ath != 'ok'){
			showLoginForm(true);			
			return;
		}else{
			showLoginForm(false);
			//$("#modalLogin").modal('hide');
		}*/
		if(!tokenIsValid(ath)){
			return;
		}

		make_breadcrumb(path);
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
		
		current_path = mainPathTmp;

		if(mainPathTmp.substring(mainPathTmp.length - 1, mainPathTmp.length) == '/'){
			mainPath = mainPathTmp.replaceAll('/','');
		}else{
			mainPath = mainPathTmp;
		}

		container.innerHTML = "";

		if(prev_path == '..'){
			let div1 = createNode('div'),
			img1 = createNode('img'),
			span1 = createNode('span');				

			div1.className = 'col-md-2 col-xs-6 recuadro';
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

const btnMkDir = document.getElementById('btnMkDir');

if(btnMkDir){
	btnMkDir.addEventListener('click', function(e){
		//const txtPath = document.getElementById('path');
		let dir_name = '';
		dir_name = prompt("Ingrese el nombre de la carpeta", "");

		if(dir_name){

			const data = new FormData();
			data.append('dir_name', dir_name);
			data.append('parent_dir', current_path);// txtPath.value);

			const myHeaders = new Headers();
			myHeaders.append('x-access-tokens', localStorage.getItem('personal_cloud_token'));

			const url = base+'mkdir';
			fetch(url, {
				method: 'POST',
				body: data,
				headers: myHeaders
			})
			.then((resp) => resp.json())
			.then(function(res){
				if(res.status == 200){
					let linkPath = current_path; //txtPath.value;
					linkPath = linkPath.replaceAll('/', '*');
					getFiles(linkPath)
					showFlashMessage(res.msg);
				}else{
					if(!tokenIsValid(res.authorized)){
						return
					}else{
						showFlashMessage(res.msg, true);
					}
				}			
			});
		}
	});
}

function fn_rmdir(path, isFolder){
	let option = '';

	if(isFolder){
		option = ' la carpeta ';	
	}else{
		option = ' el archivo ';
		//let del = confirm("Esta seguro que desea eliminar el archivo seleccionada?");
	}

	let del = confirm("Esta seguro que desea eliminar " + option + " seleccionada?");

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

		const myHeaders = new Headers();

		myHeaders.append('x-access-tokens', localStorage.getItem('personal_cloud_token'));

		const url = base+'rmelement';
		fetch(url, {
			method: 'POST',
			body: data,
			headers: myHeaders
		})
		.then((resp) => resp.json())
		.then(function(res){
			if(res.status == 200){
				let linkPath = current_path; //txtPath.value;
				linkPath = linkPath.replaceAll('/', '*');
				getFiles(linkPath)
				showFlashMessage(res.msg);
			}else{
				if(!tokenIsValid(res.authorized)){
					return;
				}else{
					showFlashMessage(res.msg, true);
				}
			}			
		});
	}
}

function showFlashMessage(msg, error = false){
	
	let flash_message = document.getElementById('flash_message');
	let flash_message_msg = document.getElementById('flash_message_msg');
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

let close_flash = document.getElementById('close_flash');
if(close_flash){
	close_flash.addEventListener('click', function(){
		let flash_message = document.getElementById('flash_message');
		flash_message.style.display = 'none';
	});
}

window.onload=function() { 
	document.getElementById('formUpload').onsubmit=function(e) { 
		e.preventDefault();
		upload();
	} 
} 

let btn_upDesktop = document.getElementById('btn_upDesktop');
if(btn_upDesktop){
	btn_upDesktop.addEventListener('click', () => {
		upload();
	});
}

async function upload(){
	await uploadFiles()
}

async function uploadFiles(){
	
    //Reviso si no cargaron archivos manualmente
    let file_upload = document.getElementById('file_upload')

    for (let i = 0; i < file_upload.files.length; i++) {
    	fileList.push(file_upload.files[i]);
    }

    let tot = 0;
    let path = current_path.replaceAll('*', '');

    await Promise.all(fileList.map(async (file) => {
    	let data = new FormData();
    	data.append('file', file);
    	data.append('path', path);

    	const myHeaders = new Headers();

    	myHeaders.append('x-access-tokens', localStorage.getItem('personal_cloud_token'));

    	const url = base+'upload';
    	fetch(url, {
    		method: 'POST',
    		body: data,
    		headers: myHeaders
    	})
    	.then((resp) => resp.json())
    	.then(function(res){
    		tot++;
    		if(res.status == 200){

    		}else{
    			error = true;
    			showFlashMessage(res.msg, true);

    		}

    		if(tot >= fileList.length){
    			if(!error){
    				let linkPath = current_path;
    				linkPath = linkPath.replaceAll('/', '*');

    				getFiles(linkPath)
    				showFlashMessage('Archivo(s) subido(s) correctamente!');	
    				document.getElementById('list').innerHTML= '';
    			}
    		}			
    	});
    }));
}

let btnInitDir = document.getElementById('btnInitDir')
if(btnInitDir){
	btnInitDir.addEventListener('click', () => {
		getFiles();
	});
}

function tokenIsValid(auth){
	if(auth == 'ok'){
		showLoginForm(false);
		return true;		
	}else{
		showLoginForm(true);
		return false;
	}
}

function showLoginForm(show = true){
	if(show){
		let frm = document.getElementById('form_login');
		frm.setAttribute('action', base+'/login');
		$("#modalLogin").modal('show');
	}else{
		$("#modalLogin").modal('hide');
	}
}

function getDownloadFile(path, name){

	const myHeaders = new Headers();

	myHeaders.append('x-access-tokens', localStorage.getItem('personal_cloud_token'));

	const url = base+'download_file/'+encodeURIComponent(path);
	fetch(url,{method: 'GET',headers: myHeaders})
	.then(function(resp){
		return resp.blob();
	})
	.then(function(blob){
		let url = window.URL.createObjectURL(blob); 
		let a = document.createElement('a'); 
		a.href = url; 
		a.download = name; 
		a.click();   
	});
}