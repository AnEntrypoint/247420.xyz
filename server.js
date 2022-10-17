"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// import other libraries as CJS
const express = require('express');
const http = require('http');
const app = express();
const server = http.createServer(app);
const port = 8082;
const cors = require('cors');

app.use(cors({
    origin: ['https://app.lan.247420.xyz', 'https://rtc.lan.247420.xyz/']
}));
const main = async () => {
    // import geckos as ESM
    const geckos = await import('@geckos.io/server');
    const { iceServers } = geckos;
    var _ammo = require('@enable3d/ammo-on-nodejs/ammo/ammo.js')
    const { Physics, ServerClock, Loaders, ExtendedObject3D  } = require('@enable3d/ammo-on-nodejs')
    const { MeshoptDecoder } = await import('three/addons/libs/meshopt_decoder.module.js');

    const io1 = geckos.geckos({ iceServers, url: 'https://rtc.lan.247420.xyz' });
    io1.onConnection((channel) => { });
    io1.listen();
    const teleport = (box) => {
        box.body.setCollisionFlags(2);
        box.position.set(0, 2, 0);
        box.body.needUpdate = true;
        box.body.once.update(() => {
            box.body.setCollisionFlags(0);
            box.body.setVelocity(0, 0, 0);
            box.body.setAngularVelocity(0, 0, 0);
        });
    };
    class ServerScene {
        constructor() {
            this.physics = new Physics();
            this.physics.setGravity(0, -9.81 * 4, 0);

            const GLTFLoader = new Loaders.GLTFLoader()
            console.log(MeshoptDecoder);
            GLTFLoader.loader.setMeshoptDecoder(MeshoptDecoder);

            // add ground
            this.physics.add.ground({
                y: -0.5,
                collisionFlags: 1,
                mass: 0,
                width: 40,
                height: 40,
                friction: 1
            });
            // add box
            this.entities = [];
            const sphere = this.physics.add.sphere({ y: 10 });
            sphere.body.setFriction(0.4);
            sphere.body.setBounciness(0);
            sphere.body.setDamping(0.7, 0);
            sphere.body.setRestitution(0.1);
            sphere.body.setLinearFactor(0.7, 0.7, 0.7);
            sphere.body.setAngularFactor( 0.00, 0.0, 0.00 );
            this.entities.push(sphere);
            setInterval(() => {
                for (let ent of this.entities) {
                    const x = (Math.random() - 0.5) * 5;
                    const y = (Math.random() - 0.5) * 5;
                    const z = (Math.random() - 0.5) * 5;
                    ent.body.applyForce(x, 10, z);
                    ent.body.applyTorque(x * 4, y * 4, z * 4);
                }
            }, 1000);
            // clock
            const clock = new ServerClock();
            clock.disableHighAccuracy();
            clock.onTick((delta) => this.update(delta));
            setInterval(() => this.send(), 1000 / 30);
        }
        create() {
        }
        send() {
            const updates = [];
            for (let ent of this.entities) {
                const { uuid, position: pos, quaternion: quat } = ent;
                const fixed = (n, f) => {
                    return parseFloat(n.toFixed(f));
                };
                updates.push({
                    uuid,
                    pos: {
                        x: fixed(pos.x, 2),
                        y: fixed(pos.y-0.8, 2),
                        z: fixed(pos.z, 2),
                    },
                    quat: {
                        x: fixed(quat.x, 3),
                        y: fixed(quat.y, 3),
                        z: fixed(quat.z, 3),
                        w: fixed(quat.w, 3),
                    },
                });
            }
            io1.emit('updates', updates);
        }
        update(delta) {
            for (let ent of this.entities) {
                const { position: pos } = ent;
                if (pos.y < -10)
                    teleport(ent);
                    //console.log(getMethods(ent.body));
                ent.body.applyForce(0,0,0)
                this.physics.update(delta * 1000);
            }
        }
    }
    _ammo().then(ammo => {
        globalThis.Ammo = ammo

        // start server scene
        new ServerScene()
    })
    app.use(express.static('www'));
    server.listen(port, () => {
        console.log(`Example app listening at http://localhost:${port}`);
    });
};

global.getMethods = (obj) => {
    let properties = new Set()
    let currentObj = obj
    do {
      Object.getOwnPropertyNames(currentObj).map(item => properties.add(item))
    } while ((currentObj = Object.getPrototypeOf(currentObj)))
    return [...properties.keys()].filter(item => typeof obj[item] === 'function')
  }
main();
