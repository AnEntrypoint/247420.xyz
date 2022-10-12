import('@geckos.io/server').then((geckos) => {
    const { iceServers } = geckos;
    var _ammo = require('@enable3d/ammo-on-nodejs/ammo/ammo.js')
    const { Physics, ServerClock } = require('@enable3d/ammo-on-nodejs')
    const io1 = geckos.geckos({ iceServers, url: 'https://sock.lan.247420.xyz' });
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
            this.physics.setGravity(0, -9.81 * 2, 0);
            // add ground
            this.physics.add.ground({
                y: -0.5,
                collisionFlags: 1,
                mass: 0,
                width: 20,
                height: 20,
            });
            // add box
            this.entities = [];
            const box = this.physics.add.box({ y: 20 });
            this.entities.push(box);
            setInterval(() => {
                for (ent of this.entities) {
                    const x = (Math.random() - 0.5) * 8;
                    const y = (Math.random() - 0.5) * 8;
                    const z = (Math.random() - 0.5) * 8;
                    ent.body.applyForce(x, 10, z);
                    ent.body.applyTorque(x * 4, y * 4, z * 4);
                }
            }, 2000);
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
                        y: fixed(pos.y, 2),
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
                this.physics.update(delta * 1000);
            }
        }
    }
    _ammo().then(ammo => {
        globalThis.Ammo = ammo

        // start server scene
        new ServerScene()
    })

});
