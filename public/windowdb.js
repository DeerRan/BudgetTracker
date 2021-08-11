const request = window.indexedDB.open("BudgetDB", 2);

let db;

request.onupgradeneeded = function (event){
    console.log("Upgrade Success")
    db = event.target.result;
    db.createObjectStore("budgetCollection", {
        keyPath: '_id',
        autoIncrement: true
    });
};

request.onsuccess = function (event) 
{
    console.log("Request Success")
    db = event.target.result;
    if (navigator.onLine) {
        bulkPost();
    }
};

request.onerror = function (event) 
{
    const error = event.target.result
    console.log(error.errorCode);
};

//global variable

var add;

function populateIndex() {
    console.log("Initial population func success \n")
    db = request.result;

    fetch("/api/transaction")
        .then(response => {
            return response.json();
        })
        .then(data => {
            data.forEach(element => {
                const transaction = db.transaction(["budgetCollection"], "readwrite");
                transaction.oncomplete = (e) => {
                    console.log(e);
                };
                transaction.onerror = (err) => {
                    console.warn(err)
                };

                let store = transaction.objectStore('budgetCollection');
                add = store.add(element);
                add.onsuccess = e => {
                    console.log("Added data successfully")
                }
                add.onerror = err => {
                    console.log("Couldn't add data\n" + err);
                }
            });
        });
};

function bulkPost() {
    db = request.result;

    const transaction = db.transaction(["budgetCollection"], "readwrite");
    const store = transaction.objectStore("budgetCollection");
    const indexValues = store.getAll();
    console.log(indexValues);

    indexValues.onsuccess = function() {
        if (indexValues.result.length > 0) {
            fetch("/api/transaction/bulk", {
                method: 'POST',
                body: JSON.stringify(indexValues.result),
                headers: {
                    Accept: 'application/json, text/plain, */*',
                    'Content-Type': 'application/json',
                },
            })
            .then((response) => 
            response.json()
            )
            .then(() => 
            {
                db = request.result;

                const transaction = db.transaction(["budgetCollection"], "readwrite");
                const store = transaction.objectStore("budgetCollection");

                store.clear();
                window.location.reload();
            });
        }
    };
};



