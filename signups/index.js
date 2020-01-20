const { CosmosClient } = require("@azure/cosmos");
const databaseName = "thrivesccdb";
const containerName = "signups";
let client;

module.exports = async (context, req) => {
    client = new CosmosClient(process.env.CosmoConnection);
    context.log(req);
    switch (req.method){
    case "GET":
        context.res = await handleGet(req);
        break;
    case "PUT":
        context.res = await handlePut(req);
        break;
    case "POST":
        context.res = await handlePost(req);
        break;
    default:
        context.log("unexpected request: " + req);  //shouldn't happen, Azure is keeping bad verbs out because of function.json
    }
};

/**
 * handleGet processes all get requests.
 * @returns an Azure response object.
 * @param {*} req - the request object.
 */
async function handleGet(req){
    let result;
    if ( req.params.signupId ){
        result = await getSignup(req.params.signupId);
        if (result){
            return { body: result };
        } else {
            return { status: 404 };
        }
    }

    //if no id, list the signups
    return {
        body: await getAllSignups()
    };
}

/**
 * handlePost processes all post requests.
 * @returns an Azure response object.
 * @param {*} req - the request object.
 */
async function handlePost(req){
    if (req.params.signupId){
        const existingSignup = await getSignup (req.params.signupId);
        if (existingSignup) {
            const updatedSignup = await updateSignup(existingSignup.id, req.body);
            if (updatedSignup){
                return { body: updatedSignup };
            } else {
                return {
                    status: 500, //Server Error
                    body: "POST failed. Please try again later."
                };
            }
        } else {
            return {
                status: 404, //Post = update, if there is no existing signup, use PUT
            };
        }
    } else {
        return {
            status: 406, //Not Accepted
            body: "sign up ID required."
        };
    }
}

/**
 * handlePut processes all put requests.
 * @returns an Azure response object.
 * @param {*} req - the request object.
 */
async function handlePut(req){
    createSignup(signup);
    return {
        status: 200
    };
}

async function getAllSignups(){
    const {resources} = await client.database(databaseName).container(containerName).items.readAll().fetchAll();
    return resources;
}

async function getSignup(signupId){
    const querySpec = {
        query: "SELECT * FROM c WHERE c.id = @signupId ORDER BY c._ts DESC",
        parameters:[
            {
                name: "@signupId",
                value: signupId
            }
        ]
    };
    const {resources} = await client.database(databaseName).container(containerName).items.query(querySpec).fetchAll();
    return resources[0];
}

async function createSignup (signup){

}

async function updateSignup (signupId, updatedSignup){

}