from flask import request, jsonify
import jwt
from functools import wraps
from .models import Users

def token_required(f):
	@wraps(f)
	def decorator(*args, **kwargs):
		SECRET_KEY = 'ASF412341S@'
		token = None
		if 'x-access-tokens' in request.headers:
			token = request.headers['x-access-tokens']

		if not token:
			return jsonify({'authorized': 'a valid token is missing'})

		try:
			#print("TOKEN : " + token)
			#print('SECRET_KEY : ' + SECRET_KEY)
			token = token.encode('UTF-8')			
			data = jwt.decode(token, SECRET_KEY)
			#print("DATA : " + data['public_id'])
			current_user = Users.query.filter_by(public_id=data['public_id']).first()
			#print(current_user)
		except:
			return jsonify({'authorized': 'token is invalid'})

		return f(current_user, *args, **kwargs)
	return decorator