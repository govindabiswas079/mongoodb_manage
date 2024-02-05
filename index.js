import express from 'express';
import bodyParser from 'body-parser';
import cors from 'cors';
import http from 'http';
import { DATABASE } from './detabase.js';
import mongoose from 'mongoose';

const app = express();
const server = http.createServer(app);
app.use(bodyParser.json({ limit: '100mb' }));
app.use(bodyParser.urlencoded({ extended: true }));

app.use(cors({ origin: true, credentials: true }));
app.options("*", cors({ optionsSuccessStatus: 200 }));


app.use("*", (req, res) => {
    res.status(405).json({
        message: "Method Not Allowed",
    });
});

const db = mongoose.connection;

const collectioninfo = async () => {
    const units = ['bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];
    function niceBytes(x) {
        let l = 0, n = parseInt(x, 10) || 0;
        while (n >= 1024 && ++l) {
            n = n / 1024;
        }
        return (n.toFixed(n < 10 && l > 0 ? 1 : 0) + ' ' + units[l]);
    }

    // db.once('open', async () => {
    // let summary = []
    // const collections = await db.db.listCollections().toArray();
    // for (let collection of collections) {
    // const collectionName = collection.name;
    // const cursor = db.db.collection(collectionName).find({});
    // const count = await db.db.collection(collectionName).estimatedDocumentCount();
    // let totalSize = 0;
    // 
    // await cursor.forEach(doc => {
    // const docSize = Buffer.byteLength(JSON.stringify(doc), 'utf8');
    // totalSize += docSize;
    // });
    // const sizeUnit = niceBytes(totalSize);
    // console.log({ Collection: collectionName, Size: collectionSizeMB, Document: count })
    // summary.push({ Collection: collectionName, Size: sizeUnit, Document: count })
    // }
    // 
    // console.log(summary)
    // 
    // db.close();
    // });

    db.once('open', async () => {
        let summary = []
        try {
            const collections = await db.db.listCollections().toArray();

            for (let collection of collections) {
                const collName = collection.name;

                const collStats = await db.db.command({ collStats: collName });

                const cursor = db.db.collection(collName).find({});
                let totalSize = 0;
                await cursor.forEach(doc => {
                    const docSize = Buffer.byteLength(JSON.stringify(doc), 'utf8');
                    totalSize += docSize;
                });
                const sizeUnit = niceBytes(totalSize);
                summary.push({
                    // Documents: collStats.count,
                    // Size: niceBytes(collStats.size),
                    // StorageSize: niceBytes(collStats.storageSize),
                    // LogicalDataSize: (collStats.size + collStats.totalIndexSize),
                    // AvgDocumentSize: niceBytes(collStats.avgObjSize),
                    // Indexes: collStats.nindexes,
                    // IndexSize: niceBytes(collStats.totalIndexSize),
                    // AvgIndexSize: niceBytes(collStats.totalIndexSize / collStats.nindexes),

                    Collection: collName,
                    ns: collStats?.ns,
                    nindexes: collStats?.nindexes,
                    Documents: collStats?.count,
                    LogicalDataSize: niceBytes(collStats?.size),
                    avgObjSize: niceBytes(collStats?.avgObjSize),
                    storageSize: niceBytes(collStats?.storageSize),
                    freeStorageSize: niceBytes(collStats?.freeStorageSize),
                    totalIndexSize: niceBytes(collStats?.totalIndexSize),
                    totalSize: niceBytes(collStats?.totalSize),
                    AvgIndexSize: niceBytes(collStats.totalIndexSize / collStats.nindexes),
                    sizeUnit: sizeUnit
                })
            }
            console.log(summary)
        } catch (error) {
            console.error('Error:', error);
        }
        db.close();
    });
}

// collectioninfo()


const databaseinfo = () => {
    const units = ['bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];
    function niceBytes(x) {
        let l = 0, n = parseInt(x, 10) || 0;
        while (n >= 1024 && ++l) {
            n = n / 1024;
        }
        return (n.toFixed(n < 10 && l > 0 ? 1 : 0) + ' ' + units[l]);
    }

    db.once('open', async () => {
        try {
            // Get database stats
            const stats = await db.db.stats();

            console.log(stats)
            // Calculate available space and used space
            const availableSpaceMB = (stats.storageSize - stats.dataSize)/*  / (1024 * 1024) */;
            const usedSpaceMB = stats.dataSize/*  / (1024 * 1024) */;
            const totalSpaceMB = stats.storageSize/*  / (1024 * 1024) */;


            // console.log(niceBytes(availableSpaceMB), niceBytes(usedSpaceMB), niceBytes(totalSpaceMB))
            // Log space information
            // console.log(`Available space: ${availableSpaceMB.toFixed(2)} MB`);
            // console.log(`Used space: ${usedSpaceMB.toFixed(2)} MB`);
            // console.log(`Total space: ${totalSpaceMB.toFixed(2)} MB`);

            console.log({
                db: stats?.db,
                collections: stats?.collections,
                views: stats?.views,
                objects: stats?.objects,
                avgObjSize: stats?.avgObjSize,
                dataSize: niceBytes(stats?.dataSize),
                storageSize: niceBytes(stats?.storageSize),
                totalFreeStorageSize: niceBytes(stats?.totalFreeStorageSize),
                numExtents: stats?.numExtents,
                indexes: stats?.indexes,
                indexSize: niceBytes(stats?.indexSize),
                indexFreeStorageSize: niceBytes(stats?.indexFreeStorageSize),
                fileSize: stats?.fileSize,
                nsSizeMB: stats?.nsSizeMB,
                ok: stats?.ok,
            })

        } catch (error) {
            console.error('Error:', error);
        }

        // Close the connection
        db.close();
    });
}

databaseinfo()





















DATABASE()
    .then(() => {
        try {
            server.listen(process.env?.PORT, process.env.PUBLIC_IP, () => {
                console.log(`Server connected to http://localhost:${process.env?.PORT} http://${process?.env?.PUBLIC_IP}:${process.env?.PORT}`)
            })
            // SocketServer(server)
        } catch (error) {
            console.log('Cannot connect to the server', error)
        }
    })
    .catch((error) => {
        console.log("Invalid database connection...!", error);
    })