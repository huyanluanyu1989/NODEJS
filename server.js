const express = require("express");
const static = require("express-static");
const cookieParser = require("cookie-parser");
const cookieSession = require("cookie-session");
const multer = require("multer");
const bodyParser = require("body-parser");
const consolidate = require("consolidate");
const mysql = require("mysql");
const common = require("./libs/common");


var db = mysql.createPool({ host: "fengss.com", port: 3307, user: "fsplat", password:"SDFwwErHsf0nAli#",database:"blog"});

var server = express();


//1.解析cookie
server.use(cookieParser("jhiouyeiqwuhkldnldckjlg"));

//2.使用session
var arr = [];
for(var i = 0;i<100000;i++){
    arr.push("keys_"+Math.random);
}
server.use(cookieSession({name:"blog_sess",keys:arr, maxAge:20*3600*1000}));

//post
server.use(bodyParser.urlencoded({extended:false}));
server.use(multer({dest:"./www/upload"}).any());

//4.配置模板引擎
//输出什么东西
server.set('view engine', 'html');
//模板文件放在哪儿
server.set('views', './template');
//哪种模板引擎
server.engine('html', consolidate.ejs);
server.get("/", (req, res, next) => {
    db.query("SELECT * from banner_table", (err, data)=>{
        if(err){
            res.status(500).send("database error").end();
        }else{
            res.banners = data;
            next();
        }
    })
})

server.get("/", (req, res, next) => {
    db.query("SELECT ID, title, summary from article_table", (err, data)=>{
        if(err){
            res.status(500).send("database error").end();
        }else{
            res.articles = data;
            next();
        }
    })
})

server.get("/", (req, res)=>{
    res.render("index.ejs",{banners: res.banners, articles: res.articles});
})

server.get("/article", (req, res)=>{
    if(req.query.id){
        if (req.query.act == "like"){
            //增加一个赞
            db.query(`UPDATE article_table SET n_like=n_like+1 WHERE ID=${req.query.id}`, (err, data) => {
                if (err) {
                    res.status(500).send('数据库有小问题').end();
                    console.error(err);
                } else {
                    //显示文章
                    db.query(`SELECT * FROM article_table WHERE ID=${req.query.id}`, (err, data) => {
                        if (err) {
                            res.status(500).send('数据有问题').end();
                        } else {
                            if (data.length == 0) {
                                res.status(404).send('您请求的文章找不到').end();
                            } else {
                                var articleData = data[0];
                                articleData.sDate = common.time2Date(articleData.post_time);
                                articleData.content = articleData.content.replace(/^/gm, '<p>').replace(/$/gm, '</p>');

                                res.render('conText.ejs', {
                                    article_data: articleData
                                });
                            }
                        }
                    });
                }
            });
        }else{
            db.query(`SELECT * from article_table WHERE id = ${req.query.id}`, (err, data) => {
                if (err) {
                    res.status(500).send("database error").end();
                } else {
                    if (data.length == 0) {
                        res.status(404).send("address error").end();
                    } else {
                        var articleData = data[0];
                        articleData.sDate = common.time2Date(articleData.post_time);
                        articleData.content = articleData.content.replace(/^/gm, "<p>").replace(/$/gm, "</p>");
                        res.render("conText.ejs", { article_data: articleData });
                        console.log(data[0]);
                    }
                }
            })
        }
        
    }else{
        res.status(404).send("您请求的文章找不到").end();
    }
})

server.use(static('./www'));
server.listen(8080);

