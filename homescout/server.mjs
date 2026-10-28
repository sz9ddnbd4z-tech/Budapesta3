// Railway/Node adapter for the existing Notion Worker API; no dependencies.
import {createServer} from 'node:http';
import worker from './worker.js';
const env={...process.env};
if(!env.ALLOWED_ORIGIN)env.ALLOWED_ORIGIN='https://sz9ddnbd4z-tech.github.io';
const port=Number(env.PORT||3000);
if(!Number.isInteger(port)||port<1||port>65535)throw new Error('Invalid PORT');
createServer(async(req,res)=>{try{
 const chunks=[];let size=0;
 for await(const chunk of req){size+=chunk.length;if(size>25000){res.writeHead(413);res.end('Payload too large');return;}chunks.push(chunk)}
 const method=req.method||'GET';
 const request=new Request('https://homescout-api.internal'+(req.url||'/'),{method,headers:req.headers,...(!['GET','HEAD'].includes(method)?{body:Buffer.concat(chunks)}:{})});
 const response=await worker.fetch(request,env);
 res.writeHead(response.status,Object.fromEntries(response.headers.entries()));
 res.end(Buffer.from(await response.arrayBuffer()));
 }catch(e){res.writeHead(500,{'Content-Type':'application/json'});res.end(JSON.stringify({error:'Internal server error'}));}
}).listen(port,'0.0.0.0',()=>console.log('HomeScout API on port '+port));
