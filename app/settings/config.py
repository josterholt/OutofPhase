db =  {
    'user': 'dbuser',
    'password': 'dbuser',
    'host': 'localhost',
    'database': 'outofphase'
}

pycket = {
    'engine': 'redis',
    'storage': {
        'host': 'localhost',
        'port': 6379,
        'db_sessions': 10,
        'db_notifications': 11,
        'max_connections': 2 ** 31,
    },
    'cookies': {
        'expires_days': 120,
    }
}
