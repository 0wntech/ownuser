import rdf from "rdflib";
import ns from "solid-namespace";

class User {
    constructor(webId){
        this.webId = webId;
    }

    getName(){
        const store = rdf.graph();
        const fetcher = rdf.Fetcher();

        fetcher.load(this.webId).then(() => {
            return store.any(rdf.sym(this.webId), ns.vcard("fn")) || store.any(rdf.sym(this.webId), ns.foaf("name"));
        });
    }
}

export default User;