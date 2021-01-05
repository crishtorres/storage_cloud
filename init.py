from flask import Flask, jsonify, flash, request, redirect, url_for, send_file, current_app, send_from_directory
from werkzeug.utils import secure_filename
from flask_cors import CORS
import os

# UPLOAD_FOLDER = '/home/cristian/Documents/storage_cloud/storage/'
# Directorio que será la raiz de la nube
UPLOAD_FOLDER = 'C:/Recibir/'
ALLOWED_EXTENSIONS = {'txt', 'pdf', 'png', 'jpg', 'jpeg', 'gif'}

# PATH_DEFAULT = '/home/cristian/Documents/storage_cloud/storage'
PATH_DEFAULT = UPLOAD_FOLDER #'C:/Recibir'

app = Flask(__name__)
CORS(app) 

app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER
app.secret_key = 'ASF412341S@'


def getFullPath(path):
	if UPLOAD_FOLDER[-1:] == '\'' or UPLOAD_FOLDER[-1:] == '/':
		return UPLOAD_FOLDER[0:-1] + "" + path
	else:
		return UPLOAD_FOLDER + "" + path

@app.route('/list/', defaults = {'path': PATH_DEFAULT})
@app.route('/list/<string:path>')
def getRoot(path):

	path = path.replace('*', '/') 
	tmpPath = path;
	folders = []
	files = []
	context = []

	if path != UPLOAD_FOLDER:
		#path = UPLOAD_FOLDER + "" + path
		path = getFullPath(path)

	for entry in os.scandir(path):
		if entry.is_dir():
			folders.append(entry.name)
		else:
			files.append(entry.name)

	if path == PATH_DEFAULT or path == PATH_DEFAULT+"/":
		prev_path = ''
		path = '/'
	else:
		path = tmpPath
		tmp_path = os.path.abspath(path)

		if tmp_path == PATH_DEFAULT:
			prev_path = ''
		else:
			prev_path = '..'

	context.append({
		'path': path,
		'files': files,
		'directories': folders,
		'prev_path': prev_path
	})
	
	return jsonify(context) 

@app.route('/upload', methods = ['GET', 'POST'])
def upload_file():
	if request.method == 'POST':
		dest = request.form['path']
		res = []

		if dest == '':
			dest = UPLOAD_FOLDER
		else:
			dest = getFullPath(dest) #UPLOAD_FOLDER + "" + dest

		f = request.files['file']
		filename = secure_filename(f.filename)
		
		try:
			f.save(os.path.join(dest, filename))
		
			res.append({
				'msg': 'Archivo subido correctamente!', 'status': 200 
			})
		except OSError as error:
			res.append({
				'msg': 'Error al subir el archivo : ' + error.strerror, 'status': 404
			})
		return jsonify(res)
		

@app.route('/mkdir', methods = ['GET', 'POST'])
def fn_mkdir():
	if request.method == 'POST':
		res = []

		d_name = secure_filename(request.form['dir_name'])
		parent_dir = request.form['parent_dir']

		path = os.path.join(parent_dir, d_name)
		path = getFullPath(path) #UPLOAD_FOLDER + "" + path
		print("MKDIR : " +path)
		
		if os.path.isdir(path):
			res.append({
				'msg': 'El directorio ya existe!',
				'status': 404
			})
		else:
			try:
				os.mkdir(path)
				res.append({
					'msg': 'Directorio creado correctamente!',
					'status': 200
				})
			except OSError as error:
				print(error)
				res.append({
					'msg': 'Error al crear directorio : ' + error.strerror, 'status': 404
				})

		return jsonify(res)

@app.route('/rmelement', methods = ['GET', 'POST'])
def fn_rmelement():
	if request.method == 'POST':
		res = []

		d_name = request.form['dir_name']
		parent_dir = request.form['parent_dir']
		type_in = request.form['type']

		path = os.path.join(parent_dir, d_name)
		path = getFullPath(path) #UPLOAD_FOLDER + "" + path
		
		if type_in == 'file':
			if not os.path.isfile(path):
				res.append({'msg': 'El archivo no existe!', 'status': 404})
			else:
				try:
					os.remove(path)
					res.append({'msg': 'Archivo eliminado correctamente!', 'status': 200})
				except OSError as error:
					print(error)
					res.append({'msg': 'Error al eliminar el archivo : ' + error.strerror, 'status': 404})
		else:
			if not os.path.isdir(path):
				res.append({'msg': 'El directorio no existe!', 'status': 404})
			else:
				try:
					os.rmdir(path)
					res.append({'msg': 'Directorio eliminado correctamente!', 'status': 200})
				except OSError as error:
					print(error)
					res.append({'msg': 'Error al eliminar directorio : ' + error.strerror, 'status': 404})

		return jsonify(res)

@app.route('/download_file/<string:filename>', methods = ['GET', 'POST'])
def download_file(filename):

	filename = filename.replace('*', '/')

	download = getFullPath(os.path.split(filename)[0])# UPLOAD_FOLDER+""+os.path.split(filename)[0]#filename#os.path.dirname(os.path.abspath(filename)) 
	file = os.path.split(filename)[1]
	return send_from_directory(directory=download, filename=file, as_attachment=True)

if __name__ == '__main__':
	app.run(debug=True, host = '0.0.0.0')