import rdf from "rdflib";
import ns from "solid-namespace";

function User(webId) {
    this.webId = webId;

    this.getName = function(){
        const store = rdf.graph();
        const fetcher = new rdf.Fetcher(store);
    
        return fetcher.load(this.webId).then(() => {
            const nameNode = store.any(rdf.sym(this.webId), ns(rdf).foaf("name"));
            return nameNode.value
        });
    }
}

export default User;