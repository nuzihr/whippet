import async from 'async';

// Imports the Google Cloud client library
import { Firestore } from '@google-cloud/firestore';


// 数分おきに実行
// datastoreにアクセス
// 更新対象のデータを特定
// 10sおきに1人分ずつ
// API呼び出し
// ttu 60~120
// Datastore更新

const firestore = new Firestore({ projectId: 'nuzihr-286314' });
const document = firestore.collection('test').doc('documentpath');

async.waterfall([
    // Enter new data into the document.
    function(callback: () => void) {
        document.set({
            food: 'orange',
            price: 200,
        }).then(() => {
            console.log('Entered new data into the document');
            callback();
        });
    },
    // Update an existing document.
    function(callback: () => void) {
        document.update({
            drink: 'coffee',
        }).then(() => {
            console.log('Updated an existing document');
            callback();
        });
    },
    // Read the document.
    function(callback: () => void) {
        document.get().then((data) => {
            console.log('Read the document');
            console.log(data);
            callback();
        });
    },
    // Delete the document.
    function(callback: () => void) {
        document.delete()
            .then(() => {
                console.log('Deleted the document');
                callback();
            });
    },
], function (err, result) {
    // result now equals 'done'
});