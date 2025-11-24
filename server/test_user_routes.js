const http = require('http');

const loginData = JSON.stringify({
    email: 'admin@veriscan.com',
    password: 'Admin@123'
});

const loginOptions = {
    hostname: 'localhost',
    port: 5000,
    path: '/api/auth/login',
    method: 'POST',
    headers: {
        'Content-Type': 'application/json',
        'Content-Length': loginData.length
    }
};

const req = http.request(loginOptions, (res) => {
    let data = '';
    res.on('data', (chunk) => { data += chunk; });
    res.on('end', () => {
        if (res.statusCode === 200) {
            const token = JSON.parse(data).token;
            console.log('Login successful, token received.');
            fetchUsers(token);
        } else {
            console.log('Login failed:', res.statusCode, data);
        }
    });
});

req.on('error', (error) => {
    console.error('Login request error:', error);
});

req.write(loginData);
req.end();

function fetchUsers(token) {
    const options = {
        hostname: 'localhost',
        port: 5000,
        path: '/api/users',
        method: 'GET',
        headers: {
            'Authorization': `Bearer ${token}`
        }
    };

    const req = http.request(options, (res) => {
        let data = '';
        res.on('data', (chunk) => { data += chunk; });
        res.on('end', () => {
            console.log('Fetch Users Status:', res.statusCode);
            console.log('Fetch Users Response:', data);
        });
    });

    req.on('error', (error) => {
        console.error('Fetch users request error:', error);
    });

    req.end();
}
