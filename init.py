from flask import Flask,jsonify
from flask_cors import CORS
import os

app = Flask(__name__)
CORS(app) 

@app.route('/', defaults = {'path': 'c:/'})
@app.route('/<string:path>')
def getRoot(path):
	# path = 'C:/cmder'

	path = path.replace('-', '/')

	folders = []
	files = []
	context = []

	for entry in os.scandir(path):
		if entry.is_dir():
			folders.append(entry.name)
		else:
			files.append(entry.name)

	context.append({
		'path': path,
		'files': files,
		'directories': folders
	})
	
	return jsonify(context)

if __name__ == '__main__':
	app.run(debug=True, host = '0.0.0.0')