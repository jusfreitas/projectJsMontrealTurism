var http = require("http");
var formidable = require("formidable");
var fs = require("fs");
var mysql = require("mysql");
var page;
var page2;

var activityList;
var hotelList;
var roomList;
//teste de commit

http
  .createServer(function (req, res) {
    var form = new formidable.IncomingForm();

    if (req.url == "/mtData" && page != undefined) {
      form.parse(req, function (err, fields, files) {
        var con = mysql.createConnection({
          host: "localhost",
          user: "root",
          password: "root",
          database: "mtdb1",
          multipleStatements: true, // to allow multiple statements in a query
        });
        con.connect(function (err) {
          if (err) throw err;
          console.log("Connected");
          console.log("Connected");

          var sql = "SET AUTOCOMMIT = OFF ;";
          // sql+= "INSERT INTO visitors (fam_name, giv_name) VALUES ('" + fields.user_sname + "', '" + fields.user_gname + "') ;";
          sql +=
            "INSERT INTO visitors (fam_name, giv_name, sex, num_perso, num_days, hotel_type, room_type) VALUES (?, ?, ?, ?, ?, ?, ?) ;";

          activityList.forEach((ligne) => {
            if (fields["c_" + ligne.id_act]) {
              sql +=
                "INSERT INTO enrollments(id_v, id_act) VALUES (LAST_INSERT_ID(), '" +
                ligne.id_act +
                "') ;";
            }
          });
          sql += "COMMIT ;"; // mandando para a BD

          // con.query(sql, function (err, result) {
          con.query(
            sql,
            [
              fields.user_sname,
              fields.user_gname,
              fields.user_sex,
              fields.s_box_number,
              fields.s_box_duration,
              fields.s_box_hotel,
              fields.s_box_rtype,
            ],
            function (err, result) {
              if (err) throw err;
              con.end(function (err) {
                if (err) {
                  return console.log("error:" + err.message);
                }
                console.log("Database connection closed.");
                console.log(
                  fields.user_gname + " " + fields.user_sname + " data saved"
                );
                res.writeHead(200, { "Content-Type": "text/html" });
                res.write(page);
                res.write(page2);
                res.write(
                  '<script> document.getElementById("rp").innerHTML = "Data successfully saved  at <br> "+Date(); </script>'
                );
                res.end();
              });
            }
          );
        });
      });
    }

    if (req.url == "/" || page == undefined) {
      fs.readFile("MontrealTourism.html", function (err, data) {
        if (err) {
          res.writeHead(404, { "Content-Type": "text/html" });
          return res.end("404 Not Found");
        }
        page = data;
        page2 = "<script> ";
        var con1 = mysql.createConnection({
          host: "localhost",
          user: "root",
          password: "root",
          database: "mtdb1",
        });
        con1.connect(function (err) {
          if (err) throw err;
          console.log("Connected");
          var sql1 = "SELECT * FROM hotel";
          var sql2 = "SELECT * FROM room";
          var sql3 = "SELECT * FROM activities";

          con1.query(sql1, function (err, result, fields) {
            // if (err) throw err;
            console.log(result);
            hotelList = result;
            //con1.end(function (err) {
            if (err) {
              return console.log("error:" + err.message);
            }
            //console.log("Database connection closed.");
            hotelList.forEach((ligne) => {
              page2 +=
                ' add_Hotel_type("' +
                ligne.id_ht +
                '", "' +
                ligne.desc_ht +
                '"); ';
            });

            con1.query(sql2, function (err, result, fields) {
              // if (err) throw err;
              console.log(result);
              roomList = result;
              //con1.end(function (err) {
              if (err) {
                return console.log("error:" + err.message);
              }
              //console.log("Database connection closed.");
              roomList.forEach((ligne) => {
                page2 +=
                  ' add_Room_type("' +
                  ligne.id_rt +
                  '", "' +
                  ligne.desc_rt +
                  '"); ';
              });

              //}); // end con1.end
            }); // end con1.query

            con1.query(sql3, function (err, result, fields) {
              // if (err) throw err;
              console.log(result);
              activityList = result;
              con1.end(function (err) {
                if (err) {
                  return console.log("error:" + err.message);
                }

                activityList.forEach((ligne) => {
                  page2 +=
                    ' add_Activity("' +
                    ligne.id_act +
                    '", "' +
                    ligne.desc_act +
                    '", "' +
                    ligne.price +
                    '"); ';
                });

                page2 += " </script>";
                console.log("Database connection closed.");
                res.writeHead(200, { "Content-Type": "text/html" });
                res.write(page);
                res.write(page2);
                return res.end();
              }); // end con1.end
            }); // end con1.query
          }); // end con1.query
        }); // end con1.connect
      });
    }

    if (req.url == "/css/reset.css") {
      fs.readFile("css/reset.css", function (err, data) {
        if (err) {
          res.writeHead(404, { "Content-Type": "text/css" });
          return res.end("404 Not Found");
        }
        res.writeHead(200, { "Content-Type": "text/css" });
        res.write(data);
        return res.end();
      });
    }

    if (req.url == "/css/mt.css") {
      fs.readFile("css/mt.css", function (err, data) {
        if (err) {
          res.writeHead(404, { "Content-Type": "text/css" });
          return res.end("404 Not Found");
        }
        res.writeHead(200, { "Content-Type": "text/css" });
        res.write(data);
        return res.end();
      });
    }
  })
  .listen(8080);
