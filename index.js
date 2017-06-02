const {default:XPress} = require('@meteor-it/xpress');
const {addSupport:addPotatoSupport} = require('@meteor-it/xpress-support-potato');

const server = new XPress('ayzekcommitter');
addPotatoSupport(server);

server.on('ALL /receiver/*',(req,res,next)=>{
    let body=[];
    req.on('data',data=>{
        body.push(data);
    });
    req.on('end',()=>{
        req.body=Buffer.concat(body);
        next();
    });
});
const sockets={};
server.on('ALL /receiver/github',(req,res,next)=>{
    Object.values(sockets).forEach(potato=>{
        potato.emit('commit',{
            json:req.body.toString()
        });
    });
    res.status(200).send('OK');
});
server.on('POTATO /',(req,potato,next)=>{
    console.log(potato.id);
    potato.addPacket('commit',{json:'string'});
    potato.finishDeclaration();
    sockets[potato.id]=potato;
    potato.on('close',()=>{
        delete sockets[potato.id];
    });
});

server.listenHttp(process.env.HOST||'0.0.0.0',+process.env.PORT||8080);