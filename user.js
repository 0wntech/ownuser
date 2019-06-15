const rdf = require("rdflib");
const ns = require("solid-namespace");

const FOAF = rdf.Namespace("http://xmlns.com/foaf/0.1/");

function User(webId) {
    this.webId = webId;

    this.getName = function(){
        const store = rdf.graph();
        const fetcher = new rdf.Fetcher(store);
    
        return fetcher.load(this.webId).then(() => {
            const nameNode = store.any(rdf.sym(this.webId), FOAF("name"));
            return nameNode.value
        });
    }
}

module.exports = User;