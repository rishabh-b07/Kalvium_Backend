const express = require("express");
const app = express();
const port = 3000;
const fs = require('fs');


function evaluateExpression(numbers, operators) {
    const num = [...numbers];
    const op = [...operators];
    const usedIndices = new Set(); // To track used indices

    for (let i = 0; i < op.length; i++) {
        if (op[i] === 'into') {
            num[i + 1] = num[i] * num[i + 1];
            usedIndices.add(i);
        } else if (op[i] === 'by') {
            num[i + 1] = num[i] / num[i + 1];
            usedIndices.add(i);
        }
    }

    let result = 0;
    let currentOperator = 'plus';

    for (let i = 0; i < num.length; i++) {
        if (num[i] !== null && !usedIndices.has(i)) {
            if (currentOperator === 'plus') {
                result += num[i];
            } else if (currentOperator === 'minus') {
                result -= num[i];
            }
            currentOperator = op[i];
        }
    }

    // Check if valid numbers and operators exist before adding to history
    if (numbers.length > 0 && operators.length > 0) {
        const history = loadHistory();
        history.push({ numbers, operators, result });
        saveHistory(history);
    }

    return result;
}



function loadHistory() {
    try {
        const data = fs.readFileSync('history.json', 'utf8');
        return JSON.parse(data);
    } catch (error) {
        return [];
    }
}

function saveHistory(history) {
    fs.writeFileSync('history.json', JSON.stringify(history));
}

function clearHistory() {
    fs.writeFile('history.json', '[]', (err) => {
        if (err) {
            console.error('Error clearing history:', err.message);
        } else {
            console.log('History cleared.');
        }
    });
}



app.get("/", function (req, res) {
  res.send(
    `
    <h2 style="text-align:center;">Insert mathematical operations in the URL</h2> 
    
    <br><h2>Commands</h2>
    <h4>Addition : use 'plus' keyword</h4>
    <h4>Subtraction : use 'minus' keyword</h4>
    <h4>Multiplication : use 'into' keyword</h4>
    <h4>Division : use 'by' keyword</h4>
    <br>
    <h4>Example : localhost:3000/5/plus/3/into/4/by/2/plus/5/plus/3</h4>
    <br>
    <h2>To check operations history : <a href = "/history"><button>Click</button></a></h2>
    `
  );
});

app.get("/history", function (req, res) {
    const history = loadHistory();
    const historyList = history.map((entry, index) => {
        const expression = entry.numbers
            .map((number, i) => `${number} ${entry.operators[i] || ''}`)
            .join(' ')
            .trim();
        return `<li>${expression} = ${entry.result}</li>`;
    });
    const historyHtml = historyList.length > 0 ? `<ul>${historyList.join('')}</ul>` : '<p>No history available.</p>';

    res.send(`
        <h2 style="text-align:center;">History of Operations</h2>
        <a href="/"><button>Home</button></a>
        ${historyHtml}
        <form action="/clear-history" method="post">
            <button type="submit">Clear History</button>
        </form>
    `);
});





app.get("/:operands*", function (req, res) {
    let url = req.params.operands + req.params[0];
    const parts = url.split('/').filter(part => part !== "");

    const numbers = [];
    const operators = [];
    
    for (let i = 0; i < parts.length; i++) {
        const part = parts[i];
        if (!isNaN(part)) {
            numbers.push(Number(part));
        } else if (part === 'plus' || part === 'into' || part === 'by' || part === 'minus') {
            operators.push(part);
        }
    }
    
    const result = evaluateExpression(numbers, operators);
    
    

    res.send(`
    Ans : ${result}
    <br>
    <a href="/">Home</a>
    `);
})

app.post("/clear-history", function (req, res) {
    clearHistory();
    res.redirect('/');
});

app.listen(port, function () {
  console.log(`Example app listening on port ${port}!`);
});