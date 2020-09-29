from flask import Flask, jsonify, flash, request, redirect, url_for
from werkzeug.utils import secure_filename
from flask_cors import CORS
import os

UPLOAD_FOLDER = '/home/cristian/Documents/storage_cloud/storage/'
ALLOWED_EXTENSIONS = {'txt', 'pdf', 'png', 'jpg', 'jpeg', 'gif'}

PATH_DEFAULT = '/home/cristian/Documents/storage_cloud/storage'

app = Flask(__name__)
CORS(app) 
app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER
app.secret_key = 'ASF412341S@'

@app.route('/', defaults = {'path': PATH_DEFAULT})
@app.route('/<string:path>')
def getRoot(path):

	path = path.replace('-', '/')

	folders = []
	files = []
	context = []

	for entry in os.scandir(path):
		if entry.is_dir():
			folders.append(entry.name)
		else:
			files.append(entry.name)

	if path == PATH_DEFAULT:
		prev_path = ''
	else:
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
		if dest == '':
			dest = UPLOAD_FOLDER
			
		f = request.files['file']
		filename = secure_filename(f.filename)
		f.save(os.path.join(dest, filename))
		# f.save(secure_filename(f.filename))
		return 'file uploaded successfully'

if __name__ == '__main__':
	app.run(debug=True, host = '0.0.0.0')