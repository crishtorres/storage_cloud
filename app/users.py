from flask import Blueprint, jsonify,  request, make_response
from werkzeug.security import generate_password_hash, check_password_hash
from .models import Users
from . import SECRET_KEY
import uuid
import jwt
import datetime
from .resources import token_required

users = Blueprint('users', __name__)

@users.route('/register', methods=['GET', 'POST'])
@token_required
def signup_user(user):  
	data = request.get_json()  

	hashed_password = generate_password_hash(data['password'], method='sha256')

	new_user = Users(public_id=str(uuid.uuid4()), name=data['name'], password=hashed_password, admin=False) 
	db.session.add(new_user)  
	db.session.commit()    

	return jsonify({'message': 'registered successfully'})

@users.route('/login', methods=['GET', 'POST'])  
def login_user(): 
 
	auth = request.authorization   

	if not auth or not auth.username or not auth.password:  
		return make_response('could not verify', 401, {'WWW.Authentication': 'Basic realm: "login required"'})    

	user = Users.query.filter_by(name=auth.username).first()   
	 
	if check_password_hash(user.password, auth.password):  
		token = jwt.encode({'public_id': user.public_id, 'exp' : datetime.datetime.utcnow() + datetime.timedelta(minutes=30)}, SECRET_KEY)		
		return jsonify({'token' : token.decode('UTF-8')}) 

	return make_response('could not verify',  401, {'WWW.Authentication': 'Basic realm: "login required"'})

@users.route('/users', methods=['GET'])
@token_required
def get_all_users(user):  
   
	users = Users.query.all() 

	result = []   

	for user in users:   
		user_data = {}   
		user_data['public_id'] = user.public_id  
		user_data['name'] = user.name 
		user_data['password'] = user.password
		user_data['admin'] = user.admin 

		result.append(user_data)   

	return jsonify({'users': result})
