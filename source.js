let mysql = require("mysql");
const readline = require('readline');

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

let con = mysql.createConnection({
    host: process.env.HOST,
    port: process.env.PORT,
    user: process.env.USER,
    password: process.env.PASSWORD,
    database: "QA_Assignment2_Jonah"
});

function askQuestion(query) {
    return new Promise(resolve => {
        rl.question(query, resolve);
    });
}

function isValidDate(date) {
    // Is it formatted properly?
    if (!date.match(/^(\d{4})-(\d{2})-(\d{2})$/)) {
        return false;
    }
    
    // Split up the year month and day
    const year = Number(date.substring(0, 4));
    const month = Number(date.substring(5, 7));
    const day = Number(date.substring(8, 10));

    // Is it a valid day and month?
    switch (month) {
        case 1:
        case 3:
        case 5:
        case 7:
        case 8:
        case 10:
        case 12:
            if (day > 31) {
                return false;
            }
            break;
        case 4:
        case 6:
        case 9:
        case 11:
            if (day > 30) {
                return false;
            }
            break;
        case 2:
            // Is it a leap year?
            if (year % 4 === 0) {
                if (day > 29) {
                    return false;
                }
            } else {
                if (day > 28) {
                    return false;
                }
            }
            break;
        default:
            return false;
    }

    // Fully validated!
    return true;
}

function isValidEmail(email) {
    if (email.match(/^[a-zA-Z0-9]+@[a-zA-Z0-9]+\.[a-z-A-Z]{2,}$/)) {
        return true;
    } else {
        return false;
    }
}

async function StartApp() {
    try {
        while(true) {
        console.log("1 - Create New Event\n2 - Register To Event\n3 - Check-In To Event\n4 - Generate Attendance Report For Event\n5 - Exit");
        let option = await askQuestion(`Select an option: `);
        option = Number(option);

        switch(option) {
        case 1:
            // New Event
            let event_name = await askQuestion('Input event name: ');
            while (true) {
                let event_date = await askQuestion('Input event date (YYYY-MM-DD): ');

                if (isValidDate(event_date)){
                    con.query("INSERT INTO events (event_name, event_date) VALUES ('"
                        + event_name + "', '"
                        + event_date + "')",
                        function (err, result) {
                            if (err) throw err;
                        }
                    )
                    break;
                } else {
                    console.log("Invalid date. Try again...");
                }
            }
            break;
        case 2:
            // Registration
            let event_id, attendee_name, email;
            while (true) {
                let name = await askQuestion('Input event name: ');
                
                // This query I originally wanted to make its own function so I could include it in unit tests, but it just would not work
                // I have zero clue why, it would get the id properly, but would either return 0 or undefined every single time
                // I know this is messy code, but I have to do it like this for it to work for now
                con.query("SELECT * FROM events WHERE event_name = '" + name + "'", async function (err, result) {
                    if (err) throw err;
                    if (result[0]) {
                        try {
                            event_id = result[0].event_id;
                        } catch (error) {
                            console.error(error);
                        }
                    } else {
                        event_id = 0;
                    }
                });

                if (event_id === 0) {
                    console.log("No event found");
                } else {
                    break;
                }
            }

            attendee_name = await askQuestion('Input attendee name: ');

            while (true) {
                email = await askQuestion('Input email: ');

                if (!isValidEmail(email)) {
                    console.log("Invalid email. Try again...");
                } else {
                    break;
                }
            }
            // This query (not including the inner query) I also wanted to make its own function, but it refused to work, too
            // It practically just checks to see if they are already registered or not
            con.query("SELECT * FROM registrations WHERE event_id = "
                + event_id
                + " AND attendee_name = '"
                + attendee_name + "'",
                function (err, result) {
                    if (err) throw err;
                    if (typeof result[0] === 'undefined') {
                        con.query("INSERT INTO registrations (event_id, email, attendee_name) VALUES ('"
                        + event_id + "', '"
                        + email + "', '"
                        + attendee_name + "')",
                        function (err, result) {
                            if (err) throw err;
                        })
                    } else {
                        console.log("This person is already attending this event!");
                    }
            });
            break;
        case 3:
            // Check-In
            let event, attendee;
            while (true) {
                let name = await askQuestion('Input event name: ');
                
                // This query I originally wanted to make its own function so I could include it in unit tests, but it just would not work
                // I have zero clue why, it would get the id properly, but would either return 0 or undefined every single time
                // I know this is messy code, but I have to do it like this for it to work for now
                con.query("SELECT * FROM events WHERE event_name = '" + name + "'", async function (err, result) {
                    if (err) throw err;
                    if (result[0]) {
                        try {
                            event = result[0].event_id;
                        } catch (error) {
                            console.error(error);
                        }
                    } else {
                        event = 0;
                    }
                });

                if (event === 0) {
                    console.log("No event found");
                } else {
                    break;
                }
            }
            attendee = await askQuestion('Input attendee name: ');

            // This query (not including the inner query) I also wanted to make its own function, but it refused to work, too
            // It practically just checks to see if they are already registered or not
            con.query("SELECT * FROM registrations WHERE event_id = "
                + event
                + " AND attendee_name = '"
                + attendee + "'",
                function (err, result) {
                    if (err) throw err;
                    if (typeof result[0] !== 'undefined') {
                        con.query("UPDATE registrations SET checked_in = 1 WHERE event_id = "
                            + event
                            + " AND attendee_name = '"
                            + attendee + "'",
                            function (err) {
                                if (err) throw (err);
                            })
                    } else {
                        console.log("This person is not in attendance!");
                    }
            });
            break;
        case 4:
            // Generate Report
            let inputtedEvent;
            let name = await askQuestion('Input event name: ');    
            // This query I originally wanted to make its own function so I could include it in unit tests, but it just would not work
            // I have zero clue why, it would get the id properly, but would either return 0 or undefined every single time
            // I know this is messy code, but I have to do it like this for it to work for now
            con.query("SELECT * FROM events WHERE event_name = '" + name + "'", async function (err, result) {
                if (err) throw err;
                if (result[0]) {
                    inputtedEvent = result[0].event_id;
                } else {
                    inputtedEvent = 0;
                }

                if (inputtedEvent !== 0)
                {
                    con.query("SELECT * FROM registrations WHERE event_id = "
                    + inputtedEvent,
                    function(err, result) {
                    if (err) throw err;
                    for (let i = 0; i < result.length; i++) {
                        console.log("Name: " + result[i].attendee_name);
                        console.log("Email: " + result[i].email);
                        if (result[i].checked_in === 1) {
                            console.log("Status: Checked In");
                        } else {
                            console.log("Status: Not Checked In");
                        }
                    }
                    });
                } else {
                    console.log("No Event found...");
                }
            });
            break;
        case 5:
            rl.close();
            break;
        default:
            console.log("Invalid input. Try again...");
        }
    }
    } catch (error) {
        console.error(error)
    }
}

con.connect(function(err) {
    if (err) throw err;
    console.log("Connected Successfully!");
    /*
    Use this command in MySQL if connection fails with error "client does not support authentication"
    Replace your_username and your_password with the correct fields

    ALTER USER 'your_username'@'localhost' IDENTIFIED WITH mysql_native_password BY 'your_password';
    FLUSH PRIVILEGES;
    */

    // Setting up Tables
    con.query("CREATE TABLE IF NOT EXISTS events (event_id INT AUTO_INCREMENT PRIMARY KEY, event_name VARCHAR(50), event_date DATE)", function (err, result){
        if (err) throw err;
    });

    con.query("CREATE TABLE IF NOT EXISTS registrations (registration_id INT AUTO_INCREMENT PRIMARY KEY, event_id INT, email VARCHAR(50), attendee_name VARCHAR(50), checked_in TINYINT DEFAULT 0)", function (err, result){
        if (err) throw err;
    });

    console.log("Tables created!");

    StartApp();
});

rl.on('close', () => {
    console.log("Exiting...");
    process.exit(0);
});

module.exports = {isValidDate, isValidEmail};