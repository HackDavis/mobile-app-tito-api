const express = require('express');
const bodyParser = require("body-parser");
const app = express();
const csv = require('csv-parser');
const fs = require('fs');

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

const FILE_NAME = 'tickets.csv'

const booking_ref_map_to_ticket_url = {}

fs.createReadStream(FILE_NAME)
    .pipe(csv())
    .on('data', (row) => {
        const ticket_url = row['Unique Ticket URL']
        const booking_ref = row['Ticket Reference']
        booking_ref_map_to_ticket_url[booking_ref] = ticket_url
    })
    .on('end', () => {
        console.log(`CSV file successfully processed`);
        StartServer();
    });

function StartServer() {
    app.listen(8002);

    app.post('/api/getticket', function(req, res)
    {
        const booking_ref = req.query.booking_ref;
        if (typeof(booking_ref) == 'undefined') {return;}
        const ticket_url = booking_ref_map_to_ticket_url[booking_ref]
        if (ticket_url == null)
        {
            res.end("none");
            return;
        }

        res.end(ticket_url + "/passbook_barcode");
    });

    console.log("Server ready");
}