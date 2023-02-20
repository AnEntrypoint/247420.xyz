const fs = require("fs");
const path = require('path');
const NodeCache = require("node-cache");
const cache = new NodeCache();
const express = require('express');
var router = express.Router();

exports.default = (app) => {
    app.get('/random-png', (req, res) => {
        const directory = 'public/schwepes-transparent';
        fs.readdir(directory, (err, files) => {
            if (err) {
                res.status(500).end(err);
            } else {
                const pngFiles = files.filter(file => file.endsWith('.png'));
                const randomFile = pngFiles[Math.floor(Math.random() * pngFiles.length)];

                fs.readFile(path.join(directory, randomFile), (err, data) => {
                    if (err) {
                        res.status(500).end(err);
                    } else {
                        res.set('Content-Type', 'image/png');
                        res.end(data);
                    }
                });
            }
        });
    });

    app.use("/schwepes", (req, res) => {
        const files = fs.readdirSync('./public/schwepes-transparent');
        let htmls = [];
        const cached = cache.get('schwepes');
        if (cached) {
            console.log('cached schwepes');
            res.setHeader('Content-Type', 'text/html');
            res.end(cached);
            return;
        }
        try {
            for (const file of files) {
                htmls.push(`<img alt="genesisbaby" width="200" loading="lazy" style="border-radius: 1em;" src="schwepes-transparent/${file}">`);
            }
            const out = htmls.join('');
            cache.set('schwepes', out, 999999999);
            res.setHeader('Content-Type', 'text/html');
            res.end(out);
        } catch (e) {
            console.error(e);
            res.setHeader('Content-Type', 'text/html');
            res.end('err');
        }
    });
}