const http = require('http')
const url = require('url')

const onRequest = async(request, response) => {
    let pathName = url.parse(request.url).pathname
    console.log('onRequest:pathname: ' + pathName);

    switch (pathName) {
        case '/':
            // draw the main page with invoices and hpm
            response.writeHead(200, {'Content-Type': 'text/html'})
            response.write('<h1>Hello!</h1>');
            response.end();
            break;
        default:
            response.writeHead(404, {'Content-Type': 'text/html'})
            response.write('404 Page not found');
            response.end();
            break;
    }
}

http.createServer(onRequest).listen(8080);
console.log('Server has started');