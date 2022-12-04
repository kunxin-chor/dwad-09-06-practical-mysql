const express = require('express');
const cors = require('cors');
const mysql2 = require('mysql2/promise');
const dotenv = require('dotenv');
dotenv.config();

let app = express();
app.use(express.json());
app.use(cors());

async function main() {

    const connection = await mysql2.createConnection({
        'host': process.env.DB_HOST,  // host -> ip address of the database server
        'user': process.env.DB_USER,
        'database': process.env.DB_DATABASE,
        'password': process.env.DB_PASSWORD
    })

    app.get('/artists', async function(req,res){
        const [artists] = await connection.execute("SELECT * FROM Artist");
        res.json(artists);        
    })

    app.get('/albums', async function(req,res){
        const [albums] = await connection.execute("SELECT Album.*, Artist.Name FROM Album JOIN Artist on Artist.ArtistId = AlbumId");
        res.json(albums)
    })

    app.get('/employees', async function(req,res){
        // always true query
        let query = "SELECT * FROM Employee WHERE 1";

        if (req.query.title) {
            query += ` AND Title LIKE '${req.query.title}'`;
        }

        if (req.query.name) {
            query += ` AND (FirstName LIKE '%${req.query.name}%' OR LastName LIKE '%${req.query.name}%')`;
        }    

        if (req.query.start_hire_date && req.query.end_hire_date) {
            query += ` AND HireDate BETWEEN '${req.query.start_hire_date}' AND '${req.query.end_hire_date}'`;
        }

        // for testing
        console.log("query=", query)
        const [employees] = await connection.execute(query);
        res.json(employees);
    })

    app.post('/artists', async function(req,res){
        const query = `INSERT INTO Artist (Name) VALUES ("${req.body.name}")`;
        const [results] = await connection.execute(query);
        res.json(results);        
    })

    app.post('/albums', async function(req,res){
        const title = req.body.title;
        const artistId = req.body.artist_id;

        // ensure that the artist exists
        const [artist] = await connection.execute(`SELECT * FROM Artist WHERE ArtistId = '${artistId}'`);

        if (artist.length > 0) {
            const query = `INSERT INTO Album (Title, ArtistId) VALUES ("${title}", ${artistId})`;
            const [results] = await connection.execute(query);
            res.json(results);
        } else {
            res.status(400);
            res.json({
                'error':'Invalid Artist ID'
            })            
        }

       
    })

}
main()

app.listen(3000, ()=>{
    console.log("server has started")
})