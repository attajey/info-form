var http = require('http');
var url1 = require('url');
var fs = require('fs');
var MongoClient = require('mongodb').MongoClient;
var url = "mongodb://localhost:27017/mydb";

http.createServer(function (req, res) {
    // res.writeHead(200, {'Content-Type': 'text/html'});
    var q = url1.parse(req.url, true);
    var location_address = q.pathname;
    if (location_address == "/") {
        fs.readFile('index.html', function (err, data) {
            res.writeHead(200, {'Content-Type': 'text/html'});
            res.write(data);
            res.end();
        });
    } else {
        if (location_address == "/form") {
            if ((/([^\s])/.test(q.query.name)) && (/([^\s])/.test(q.query.address)) && (/([^\s])/.test(q.query.date)) && /^(\d{4}\/(0[1-9]|1[012])\/(0[1-9]|[12][0-9]|3[01]))/.test(q.query.date)) {
                MongoClient.connect(url, function (err, db) {
                    if (err) throw err;
                    console.log("Database created!");
                    db.close();
                });

                MongoClient.connect(url, function (err, db) {
                    if (err) throw err;
                    var dbo = db.db("mydb");
                    dbo.createCollection("atta", function (err, res) {
                        if (err) throw err;
                        console.log("Collection created!");
                        db.close();
                    });
                });
                MongoClient.connect(url, function (err, db) {
                    if (err) throw err;
                    var dbo = db.db("mydb");
                    var myobj = {name: q.query.name, address: q.query.address, date: q.query.date};
                    dbo.collection("atta").insertOne(myobj, function (err, res) {
                        if (err) throw err;
                        console.log("1 document inserted");
                    });

                });
                res.writeHead(200, {'Content-Type': 'text/html'});
                res.write("content added");
                res.end();
            }

        } else if (location_address == "/show") {
            MongoClient.connect(url ,function (err, db) {
                if (err) throw err;
                var dbo = db.db("mydb");
                dbo.collection("atta").find().toArray(function (err, result) {
                    if (err) throw err;
                    console.log(result);
                    var page = "<html>\n" +
                        "<head>\n" +
                        "<style>\n" +
                        "table {\n" +
                            "border-collapse: collapse;\n" +
                        "}\n" +
                        "\n" +
                        "table, td, th {\n" +
                            "border: 5px solid black;\n" +
                            "background-color: gray;\n" +
                        "}\n" +
                        "</style>\n" +
                        "</head>\n" +
                        "<body>\n" +
                        "\n" +
                        "<table>\n" +
                            "<tr>" +
                            "<th style='color: #9c0414'>" + "Name" + "</th>" +
                            "<th style='color: #9c0414'>" + "Date" +"</th>" +
                            "<th style='color: #9c0414'>" + "Address" + "</th>" +
                            "</tr>";

                    for (var i = 0; i < result.length; i += 1) {
                        var field =
                            "<tr>" +
                            "<td style='text-align: center'>" + result[i].name + "</td>"
                            + "<td style='text-align: center'>" + result[i].date + "</td>"
                            + "<td style='text-align: center'>" + result[i].address + "</td>" +
                            "</tr>";
                        page = page + field;
                    }
                    page =  page + "</table>\n" +
                        "\n" +
                        "\n" +
                        "</body>\n" +
                        "</html>";

                    db.close();
                    res.writeHead(200, {'Content-Type': 'text/html'});
                    res.write(page);
                    res.end();
                });
            });
        }else if (location_address=="/check"){
            fs.readFile('check.html', function (err, data) {
                res.writeHead(200, {'Content-Type': 'text/html'});
                res.write(data);
                res.end();
            });
        }
        else if(location_address=="/what_you_want"){
            MongoClient.connect(url, function (err, db) {
                if (err) throw err;
                var dbo = db.db("mydb");
                var search = {name: q.query.q};
                dbo.collection("atta").find(search).toArray(function (err, result) {
                    if (err) throw err;
                    var page = "<table>";
                    for (var i = 0; i < result.length; i += 1) {
                        var field = "<tr>" + "<th>" + result[i].name + "</th>"
                            + "<th>" + result[i].date + "</th>"
                            + "<th>" + result[i].address + "</th>" + "</tr>";
                        page = page + field;
                    }
                    page = page + "</table>";
                    db.close();
                    res.writeHead(200, {'Content-Type': 'text/html'});
                    res.write(page);
                    res.end();
                });
            });
        }
    }

}).listen(8080);