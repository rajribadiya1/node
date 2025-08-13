const http = require('http');
const fs = require('fs');
const port = 8000;

const requestHandler = (req,res)=>{
    let filename = ''
    console.log(req.url);
    switch(req.url){
        case '/' :
            filename='Home.html'
            break;
        case '/about' :
            filename = 'About.html'
            break;
        case '/contact' :
            filename = 'Contact.html'
            break;
        default :
            filename = '404.html'            
    }

    fs.readFile(filename,'utf-8',(err,data)=>{
        if(err){
            console.log("Error : ",err)
            return;
        }
        res.end(data);
    })
}

    const server = http.createServer(requestHandler);

    server.listen(port,(err)=>{
        if(err){
            console.log("Error : ",err);
            return false;
        }
        console.log("Server start on port : ",port)
    })
