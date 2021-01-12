from flask import Flask, request, jsonify, make_response
from flask_sqlalchemy import SQLAlchemy
from flask_cors import CORS
from werkzeug.security import generate_password_hash, check_password_hash
import uuid
import jwt
import datetime

app = Flask(__name__)
CORS(app)

SECRET_KEY = 'ASF412341S@'

app.config['SECRET_KEY'] = SECRET_KEY
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///db.sqlite'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = True

db = SQLAlchemy(app)

from drive import drive as drive_blueprint
app.register_blueprint(drive_blueprint)

from users import users as users_blueprint
app.register_blueprint(users_blueprint)

if __name__ == '__main__':
	app.run()