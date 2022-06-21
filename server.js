const chromeLauncher = require('chrome-launcher');
const port = process.env.PORT || 369;
const { uuid } = require('uuidv4');
const express = require('express');
const fileUpload = require('express-fileupload');
const cors = require('cors');
const bodyParser = require('body-parser');
const morgan = require('morgan');
const _ = require('lodash');

const app = express();

// enable files upload
app.use(fileUpload({
    createParentPath: true
}));

//add other middleware

app.use(express.static('public'));
app.set('view engine', 'ejs');
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));
app.use(morgan('dev'));

//start app

app.listen(port, () =>
  console.log(`App is listening on port ${port}.`)
);

app.get('/start', async (req, res) => {
  chromeLauncher.launch({
    chromePath:'/usr/bin/chromium',
    startingUrl: 'public/index.html'
  }).then(chrome => {
    console.log(`Chrome debugging port running on ${chrome.port}`);
    setTimeout(() => {
      chrome.kill()
      res.send(200);
    }, 30000);
  });
})

app.post('/upload', async (req, res) => {
    try {
        if(!req.files) {
            res.send({
                status: false,
                message: 'No file uploaded'
            });
        } else {
            let file = req.files.file;
            const rng = uuid()
            file.mv(`./public/images/${rng}.png`);
            res.send({
                status: true,
                message: 'File is uploaded',
                data: {
                    name: rng,
                    mimetype: file.mimetype,
                    size: file.size
                }
            });
        }
    } catch (err) {
        res.status(500).send(err);
    }
});
