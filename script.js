const express = require("express");
const bodyParser=require('body-parser');
const mysql = require("mysql");

const app = express();

app.use(express.static("/public"));
app.use(express.json());
app.use(bodyParser.json({type: 'application/json'}));
app.use(bodyParser.urlencoded({extended: true}));

const con = mysql.createConnection({
	host:"localhost",
	user:"root",
	password:"Ashu@20",
	database:"shorturls",
	port:"3306"
});
con.connect(function(error){
	if(error){
		console.log(error);
	}
})

app.get("/",function(request,response){
	response.sendFile(__dirname + "/public/index.html");
});

app.post("/api/create-short-url",function(request,response){
	let uniqueID = Math.random().toString(36).replace(/[^a-z0-9]/gi,'').substr(2,10);
	let sql = `INSERT INTO links(longurl,shorturlid) VALUES('${request.body.longurl}','${uniqueID}')`;
	con.query(sql,function(error,result){
		if(error){
			console.log(error);
			response.status(500).json({
				status:"notok",
				message:"Something went wrong"
			});
		} else {
			response.status(200).json({
				status:"ok",
				shorturlid:uniqueID
			});
		}		
	})
});

app.get("/api/get-all-short-urls",function(request,response){
	let sql = `SELECT * FROM links`;
	con.query(sql,function(error,result){
		if(error){
			console.log(error);
			response.status(500).json({
				status:"notok",
				message:"Something went wrong"
			});
		} else {
			response.status(200).json(result);
		}
	})
});

app.get("/:shorturlid",function(request,response){
	let shorturlid = request.params.shorturlid;
	let sql = `SELECT * FROM links WHERE shorturlid='${shorturlid}' LIMIT 1`;
	con.query(sql,function(error,result){
		if(error){
			console.log(error);
			response.status(500).json({
				status:"notok",
				message:"Something went wrong"
			});
		}
		if(result.length>0){
			if(result) {
				sql = `UPDATE links SET count='${result[0].count+1}' WHERE id='${result[0].id}' LIMIT 1`;
				con.query(sql,function(error,result2){
					if(error){
						console.log(error);
						response.status(500).json({
							status:"notok",
							message:"Something went wrong"
						});
					} else {
						response.redirect(result[0].longurl);
					}
				})
			}
		}
	})
});

app.listen(process.env.PORT || 5005);