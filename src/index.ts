import async from 'async';
import axios from "axios";
import { DocumentData, Firestore } from '@google-cloud/firestore';
import { Timestamp } from "@google-cloud/firestore/build/src";

const firestore = new Firestore({ projectId: 'nuzihr-286314' });
const document = firestore.collection('players');
const instance = axios.create({
    baseURL: 'https://api2.r6stats.com/public-api/stats',
});
const secret = process.env.R6STATS_TOKEN;

async.waterfall([

    // 更新対象のプレイヤーを取得
    function(callback: (x: any, arg: DocumentData[]) => void) {
        const now = Timestamp.fromDate(new Date())
        document.where("ttl", "<", now).get()
            .then((querySnapshot) => {
                console.log(`Found ${querySnapshot.size} players`);
                callback(null, querySnapshot.docs);
            })
            .catch((err) => {
                // @ts-ignore
                callback(err);
            });
    },

    // 10秒毎にプレイヤーのデータを更新
    function(documentShanpshot: DocumentData[], callback: (x:any, result: string) => void) {
        async.eachSeries(documentShanpshot, (documentData, done) => {
            updatePlayer(documentData)
                .then(() => setTimeout(done, 10000))
                .catch((err) => {
                    // @ts-ignore
                    done(err);
                });
        }, (err) => {
            if (err) {
                // @ts-ignore
                callback(err);
            } else {
                callback(null, "succeeded");
            }
        });
    },
], function (err, result) {
    if (err) console.log(err);
    else console.log(result);
});

async function updatePlayer(documentData: DocumentData) {
    // create ttl
    const random = Math.floor( Math.random() * 60 ) + 1;
    const date= new Date();
    date.setMinutes(date.getMinutes()+60+random);
    const ttl = Timestamp.fromDate(date);

    const id = documentData.ref.id;
    const { name } = documentData.data();
    const generic = await instance.get(`/${name}/psn/generic`,{
        headers: {
            Authorization: `Bearer ${secret}`,
        }
    });
    const seasonal = await instance.get(`/${name}/psn/seasonal`,{
        headers: {
            Authorization: `Bearer ${secret}`,
        }
    });
    const operators = await instance.get(`/${name}/psn/operators`,{
        headers: {
            Authorization: `Bearer ${secret}`,
        }
    });
    const weapons = await instance.get(`/${name}/psn/weapons`,{
        headers: {
            Authorization: `Bearer ${secret}`,
        }
    });
    await document.doc(id).update({
        name: name,
        generic:generic.data.stats,
        seasonal: seasonal.data.seasons,
        operators: operators.data.operators,
        weapons: weapons.data.weapons,
        ttl: ttl,
    });
}