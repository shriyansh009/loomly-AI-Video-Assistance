import requests

base = 'http://127.0.0.1:8000'

payload = {'email': 'test@example.com', 'full_name': 'Test User', 'password': '123456'}
try:
    r = requests.post(base + '/signup', json=payload, timeout=10)
    print('signup', r.status_code, r.text)
except Exception as e:
    print('signup ERR', e)

login_payload = {'email': 'test@example.com', 'password': '123456'}
try:
    r = requests.post(base + '/login', json=login_payload, timeout=10)
    print('login', r.status_code, r.text)
except Exception as e:
    print('login ERR', e)
