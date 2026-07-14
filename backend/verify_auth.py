import json
import urllib.request

base = 'http://127.0.0.1:8000'

signup_data = json.dumps({'email': 'test@example.com', 'full_name': 'Test User', 'password': '123456'}).encode()
signup_req = urllib.request.Request(base + '/signup', data=signup_data, headers={'Content-Type': 'application/json'}, method='POST')
try:
    with urllib.request.urlopen(signup_req, timeout=20) as response:
        print('signup', response.status, response.read().decode())
except Exception as exc:
    print('signup ERR', exc)

login_data = json.dumps({'email': 'test@example.com', 'password': '123456'}).encode()
login_req = urllib.request.Request(base + '/login', data=login_data, headers={'Content-Type': 'application/json'}, method='POST')
try:
    with urllib.request.urlopen(login_req, timeout=20) as response:
        print('login', response.status, response.read().decode())
except Exception as exc:
    print('login ERR', exc)
