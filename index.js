const express = require('express') /* importei o express*/ 
const app = express() /*chamei ele como uma funcao*/
const bodyParser = require('body-parser') /*FORMULARIO BODYPARSER*/

const sqlite = require('sqlite') /* Banco de dados sqlite*/
const dbConnection = sqlite.open('banco.sqlite', { Promise })

const port = process.env.PORT || 3000

app.set('view engine', 'ejs') /*como view engine vamos utilizar o ejs (npm)*/
app.use(express.static('public')) /*se nao encontrar '/' ele busca oque tiver na pasta public */
app.use(bodyParser.urlencoded({extended: true})) /*FORMULARIO BODYPARSER*/

/*-----HOME------*/
app.get('/', async(request, response) => { 
    const db = await dbConnection

    const categoriasDb = await db.all('select * from categorias')
    const vagas = await db.all('select * from vagas')
    const categorias = categoriasDb.map(cat => {
        return {
            ...cat,
            vagas: vagas.filter(vaga => vaga.categoria === cat.id)
        }
    })
    response.render ('home',  {
        categorias
    })    

})


app.get('/vaga/:id', async(request, response) => { /*funcao callback*/
    const db = await dbConnection
    const vaga = await db.get('select * from vagas where id = '+request.params.id)
    response.render('vaga', {
        vaga
    })       
})

/*------PAINEL ADM------*/
app.get('/admin', (req, res) => {
    res.render('admin/home')

})


app.get('/admin/vagas/', async(req, res) => {  
    const db = await dbConnection 
    const vagas = await db.all('select * from vagas')
    res.render('admin/vagas', {vagas})

})

/*DELETE VAGAS FROM DATABASE*/
app.get('/admin/vagas/delete/:id', async(req, res) => {
    const db = await dbConnection
    await db.run('delete from vagas where id = '+req.params.id)
    res.redirect('/admin/vagas')
})

/*ADD NEW ROLES*/
app.get('/admin/vagas/nova', async(req, res) => {
    const db = await dbConnection
    const categorias = await db.all('select * from categorias')
    res.render('admin/nova-vaga', {categorias})
})

/*FORMULARIO BODYPARSER*/
app.post('/admin/vagas/nova', async(req, res) => {
    const {titulo, descricao, categoria} = req.body
    const db = await dbConnection
    await db.run(`insert into vagas(categoria, titulo, descricao) values(${categoria}, '${titulo}', '${descricao}')`)
    res.redirect('/admin/vagas')
})


/*EDIT ROLES*/

app.get('/admin/vagas/editar/:id', async(req, res) => {
    const db = await dbConnection
    const categorias = await db.all('select * from categorias')
    const vaga = await db.get('select * from vagas where id ='+req.params.id)
    res.render('admin/editar-vaga', {categorias, vaga})
})

app.post('/admin/vagas/editar/:id', async(req, res) => {
    const { titulo, descricao, categoria } = req.body
    const { id } = req.params
    const db = await dbConnection
    await db.run(`update vagas set categoria = ${categoria}, titulo ='${titulo}', descricao ='${descricao}' where id = ${id}`)
    res.redirect('/admin/vagas')
})



const init = async() => {
    const db = await dbConnection
    await db.run('create table if not exists categorias (id INTEGER PRIMARY KEY, categoria TEXT);')
    await db.run('create table if not exists vagas (id INTEGER PRIMARY KEY, categoria INTEGER, titulo TEXT, descricao TEXT);')
    //const categoria = 'Marketing team'
    //await db.run(`insert into categorias(categoria) values('${categoria}')`)
    //const vaga = 'Social Media (Sao Paulo)'
    //const descricao = 'Vaga para social media que fez o Fullstack Lab'
    //await db.run(`insert into vagas(categoria, titulo, descricao) values(2, '${vaga}', '${descricao}')`)

}

init()


app.listen(port, (err) => {
    if (err){
        console.log('Nao foi possivel iniciar o Servidor do Jobify.')
    }else{
        console.log('Servidor do Jobify rodando...')
    }
    
})