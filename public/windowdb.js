const request = window.indexedDB.open("BudgetDB", 1);

let db;

request.onupgradeneeded = function (event)
{
    db = event.target.result;

    const budgetStore = db.createObjectStore("budgetStore", {
        autoIncrement: true
    });

    budgetStore.createIndex("budgetIndex", "budgetIndex");
};

request.onsuccess = function (event) 
{
    db = event.target.result;

    if (navigator.onLine) {
        checkDatabase();
    }
};

request.onerror = function (event) 
{
    const msg = event.target.result
    
    console.log(msg.errorCode);
};

function saveRecord(record) {
    db = request.result;
    const transaction = db.transaction(["budgetStore"], "readWrite");
    const budgetStore = transaction.objectStore("budgetStore");

    budgetStore.add(record);
};

function checkDatabase() 
{
    db = request.result;

    const transaction = db.transaction(["budgetStore"], "readwrite");
    const budgetStore = transaction.objectStore("budgetStore");
    const allRecords = budgetStore.getAll();
    console.log(allRecords);

    allRecords.onsuccess = function() 
    {
        if (allRecords.result.length > 0) 
        {
            fetch('/api/transaction/bulk',
            {
                method: 'POST',
                body: JSON.stringify(allRecords.result),
                headers: {
                    Accept: 'application/json, text/plain, */*',
                    'Content-Type': 'application/json',
                },
            })
            .then((response) => response.json())
            .then(() => 
            {
                db = request.result;

                const transaction = db.transaction(["budgetStore"], "readwrite");
                const budgetStore = transaction.objectStore("budgetStore");

                budgetStore.clear();
                window.location.reload();
            });
        }
    };
};