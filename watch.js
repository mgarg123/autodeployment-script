const fs = require('fs')
const cron = require('node-cron');
const path = require('path');
const { exec } = require('child_process');


cron.schedule("*/10 * * * * *", async function() {
    console.log("Script Running, Waiting for the changes...")
    fs.readdir(__dirname + "/deployment-files", function(err, files) {
        if (err) {
            console.log(err.message)
            throw err;
        }

        let isFilePresent = files.length === 0 ? false : true

        if (isFilePresent) {
            let fileName = ""
            let exposedPort = 0
            let fileNameExec = ""
            let dockerFileName = ""
            let lastModifiedTime = ""
            let lastModifiedDate = ""

            files.forEach(file => {
                if (path.extname(file.toString()) === ".jar") {
                    fileName = file
                    fileNameExec = file.split(".")[0]
                    fs.stat("deployment-files/" + file, function(err, stat) {
                        if (err) {
                            console.log(err.message)
                            throw err;
                        }

                        lastModifiedDate = stat.mtime.toLocaleDateString() + ""
                        lastModifiedTime = stat.mtime.toLocaleTimeString() + ""

                        // console.log("last modified date: " + lastModifiedDate)
                        // console.log("last modified time: " + lastModifiedTime)
                    });

                }

                if (file.toString() === "Dockerfile")
                    dockerFileName = file.toString()
            });

            //Reading docker file to get the port exposed
            fs.readFile("deployment-files/" + dockerFileName, function(err, data) {
                let portLineText = data.toString().match(/^EXPOSE.+/gm)
                exposedPort = parseInt(portLineText.toString().split(" ")[1])
                    // console.log(port);
            });

            let isDataPresentInDb = false
            let lastModifiedDateFromDb = ""
            let lastModifiedTimeFromDb = ""
            fs.readFile("db.txt", function(err, data) {
                if (err) {
                    console.log(err.message)
                    throw err;
                }

                isDataPresentInDb = data.length != 0 ? true : false
                    // console.log("Data is Present? " + isDataPresentInDb)

                let writeData = fileName + " " + lastModifiedDate + " " + lastModifiedTime
                if (!isDataPresentInDb) {
                    console.log("Writing file name, timestamp to the db.txt file...")



                    fs.writeFile("db.txt", writeData, function() {
                        console.log("Write to Db.txt Success!")
                    });
                } else {
                    lastModifiedDateFromDb = data.toString().split(" ")[1]
                    lastModifiedTimeFromDb = data.toString().split(" ")[2]

                    // console.log(lastModifiedDateFromDb + " " + lastModifiedTimeFromDb)

                    let lastModTime = lastModifiedTime.split(" ")[0]
                    if (lastModifiedDate !== lastModifiedDateFromDb || lastModTime !== lastModifiedTimeFromDb) {
                        fs.writeFile("db.txt", writeData, function() {
                            console.log("Write to Db.txt Success!")
                        });
                        console.log("Timestamp Differs...")
                        console.log("Executing Command...")
                        exec(`"deploy.bat" ${fileName} ${dockerFileName} ${fileNameExec} ${exposedPort}`, function(err, stdout, stderr) {
                            if (err) {
                                console.log(err.message)
                                throw err;
                            }

                            console.log(stdout)
                        });

                    }
                }
            });
        } else {
            console.log("Waiting for the files...")
        }
    });
});