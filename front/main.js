'use strict'

const base = 'http://localhost:5000/';

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

function getFiles(path = ''){

	const container = document.getElementById('container');
	container.innerHTML = "";

	const url = base+encodeURIComponent(path);
	fetch(url)
	.then((resp) => resp.json())
	.then(function(data){
		let files = data[0]["files"]
		let directories = data[0]["directories"]
		let mainPathTmp = data[0]["path"]
		let prev_path = data[0]["prev_path"]
		let mainPath = ''
		
		const txtPath = document.getElementById('path');
		txtPath.value = mainPathTmp;

		const txtCurrenPath = document.getElementById('current_path');
		txtCurrenPath.value = mainPathTmp;
		
		if(prev_path == '..'){
			let div1 = createNode('div'),
				img1 = createNode('img'),
				span1 = createNode('span');
		    
		    div1.className = 'col-md-2 recuadro';
		    img1.src = 'up-arrows.svg';
		    img1.style.width = '30px';

		    let name1 = "..";

	        if(mainPathTmp.substring(mainPathTmp.length - 1, mainPathTmp.length) == '/'){
	        	mainPath = mainPathTmp.replace('/','');
	        }else{
	        	mainPath = mainPathTmp;
	        }

	        const tmp1 = mainPath+'/'+name1;
	        const linkPath = tmp1.replaceAll('/', '-');
		
		    span1.innerHTML = "<a class='folder' id='"+linkPath+"' href='#'>..</a>";
		    append(div1, img1);
		    append(div1, span1);
		    append(container, div1);
		}

		const folders = directories.map(function(folder) {
	    let div = createNode('div'),
	        img = createNode('img'),
	        span = createNode('span');
		    
		    div.className = 'col-md-2 recuadro';
		    img.src = 'folder.svg';
		    img.style.width = '30px';

		    let name = folder;

		    if (name.length > 20){
	          name = name.substring(0,17) +"...";
	        }

	        if(mainPathTmp.substring(mainPathTmp.length - 1, mainPathTmp.length) == '/'){
	        	mainPath = mainPathTmp.replace('/','');
	        }else{
	        	mainPath = mainPathTmp;
	        }

	        const tmp = mainPath+'/'+name;
	        const linkPath = tmp.replaceAll('/', '-');

		    span.innerHTML = "<a class='folder' id='"+linkPath+"' href='#'>"+`${name}`+"</a>";
		    append(div, img);
		    append(div, span);
		    append(container, div);
	  	})


	  	const archs = files.map(function(file) {
	    let div = createNode('div'),
	        img = createNode('img'),
	        span = createNode('span');
		    
		    div.className = 'col-md-2 recuadro file';
		    img.src = 'file.svg';
		    img.style.width = '30px';

		    let name = file;

		    if (name.length > 15){
	          name = name.substring(0,12) +"...";
	        }

		    span.innerHTML = `${name}`;
		    append(div, img);
		    append(div, span);
		    append(container, div);
	  	})

	})
	.catch(function(error){
		console.log(error);
	});
}

getFiles();