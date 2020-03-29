
  function loadDB(){

  console.log("load DB Called");

  const client = stitch.Stitch.initializeDefaultAppClient('experimentdesign-clijb');

  const db = client.getServiceClient(stitch.RemoteMongoClient.factory, 'mongodb-atlas').db('BR_internal');

  client.auth.loginWithCredential(new stitch.AnonymousCredential()).then(user =>
    db.collection('Experiments').updateOne({owner_id: client.auth.user.id}, {$set:{number:42}}, {upsert:true})
  ).then(() =>
    db.collection('Experiments').find({owner_id: client.auth.user.id}, { limit: 100}).asArray()
  ).then(docs => {
      console.log("Found docs", docs)
      console.log("[MongoDB Stitch] Connected to Stitch")
  }).catch(err => {
    console.error(err)
  });


}