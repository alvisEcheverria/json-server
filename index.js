const http = require('http');
const path = require('path');
const fs = require('fs/promises');

http.createServer(async (req, res) =>{

    const method = req.method;
    const url = req.url;
    const splitUrl = url.split('/');
    const id = Number(splitUrl[splitUrl.length-1]);
    const jsonPath = path.resolve('./data.json');
    const jsonFile = await fs.readFile(jsonPath, 'utf8');
    const body = JSON.parse(jsonFile);
    const index = body.findIndex(item => item.id === id)
    
    if(url === '/apiv1/tasks'){

        if(method === 'GET'){

            res.writeHead(200, {'Content-Type' : 'application/json'});
            res.write(jsonFile);
        }
        else if(method === 'POST'){
            
            req.on('data', data =>{

                    let newTask = JSON.parse(data);
                    const lastIdFiltered = body[body.length -1];
                    newTask.id = lastIdFiltered.id + 1;
                    body.push(newTask)
                    fs.writeFile(jsonPath, JSON.stringify(body))              
            })
            res.writeHead(201); 
        }
    }   
    else if(index !== -1){
        if(url === `/apiv1/tasks/${id}`){
            if(method === 'PUT'){

                req.on('data', newData =>{
                    
                        let found = body.find(item => item.id === id);
                        const statusBody = JSON.parse(newData)
                        found.status = statusBody.status;
                        body.splice(index, 1, found)
                        fs.writeFile(jsonPath, JSON.stringify(body))    
                })
                res.writeHead(200);
            }
            else if(method === 'DELETE'){
    
                const filteredBody = body.filter(item => item.id !== id);
                fs.writeFile(jsonPath, JSON.stringify(filteredBody))
                res.writeHead(200);
            }
        }
            
    }
    else{
        res.writeHead(503);
    }

    res.end();

}).listen(3000);

