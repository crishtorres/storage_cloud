from flask import request, jsonify
import jwt
from functools import wraps
from .models import Users
from . import SECRET_KEY

def token_required(f):
	@wraps(f)
	def decorator(*args, **kwargs):
		token = None

		if 'x-access-tokens' in request.headers:
			token = request.headers['x-access-tokens']

		if not token:
			return jsonify({'authorized': 'Error', 'msg': 'A valid token is missing'})
		try:
			token = token.encode('UTF-8')			
			data = jwt.decode(token, SECRET_KEY)
			current_user = Users.query.filter_by(public_id=data['public_id']).first()
		except:
			return jsonify({'authorized': 'Error', 'msg': 'Token is invalid'})

		return f(current_user, *args, **kwargs)
	return decorator