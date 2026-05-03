// Pre-authored lesson content for all language fundamentals courses.
// 12 languages × 5 levels = 60 lessons, guaranteed to always load correctly.

export interface StaticLesson {
  explanation: string;
  codeExample: string;
  task: string;
  hint: string;
}

// Key format: language id (e.g. "python")  →  level (1–5)  →  lesson data
export const FUNDAMENTALS_LESSONS: Record<string, Record<number, StaticLesson>> = {

  // ──────────────────────────────────────────────────────────
  // PYTHON
  // ──────────────────────────────────────────────────────────
  python: {
    1: {
      explanation: "Python is a beginner-friendly language that reads almost like plain English.\n\n- **Variables** store a value — create one with `name = value` (no type declaration needed)\n- **`print()`** outputs text to the screen and is your most-used debugging tool\n- **Types are inferred** — Python figures out whether a value is a number, text, etc. automatically\n- **Statements** execute one at a time, top to bottom\n- **No semicolons** — Python uses indentation and newlines to separate code",
      codeExample: `# Your first Python program
name = "Alice"
age = 25

print("Hello,", name)
print("You are", age, "years old")`,
      task: "Create two variables: one for your name and one for your favourite number. Then print a sentence that includes both, for example: 'My name is Bob and my favourite number is 7.'",
      hint: "You can combine text and variables inside print() by separating them with commas, like: print('Hello', name).",
    },
    2: {
      explanation: "Python has four core data types you will use in every program.\n\n- **`int`** — whole numbers like `42`; **`float`** — decimals like `3.14`\n- **`str`** — text in quotes: `\"hello\"` or `'hello'`; join strings with `+`\n- **`bool`** — either `True` or `False` (capital first letter)\n- **f-strings** — embed variables directly in text: `` f\"Hello, {name}!\" ``\n- **Arithmetic** — `+`, `-`, `*`, `/`, `//` (integer division), `%` (remainder), `**` (power)\n- **`type()`** — tells you what data type any value is",
      codeExample: `# Numbers
price = 9.99
quantity = 3
total = price * quantity
print("Total:", total)          # 29.97

# Strings and f-strings
language = "Python"
version = 3
print(f"{language} version {version} is great!")

# Boolean
is_on_sale = True
print("On sale?", is_on_sale)
print(type(is_on_sale))         # <class 'bool'>`,
      task: "Write a mini receipt: create variables for an item name, its price, and a quantity. Calculate the total cost and print a formatted receipt line using an f-string, like: 'Apple x 3 = $2.97'.",
      hint: "An f-string looks like f'text {variable} more text'. You can even do arithmetic inside the braces: f'{price * qty:.2f}' rounds to 2 decimal places.",
    },
    3: {
      explanation: "Conditionals and loops let your program make decisions and repeat actions.\n\n- **`if` / `elif` / `else`** — runs the first block whose condition is `True`\n- **Indentation** (4 spaces) defines what belongs inside a block — it is required, not optional\n- **`for i in range(n)`** — repeats `n` times; `range(1, 6)` produces 1, 2, 3, 4, 5\n- **`for item in list`** — iterates over every element in a sequence\n- **`while condition:`** — repeats as long as the condition stays `True`\n- **`%` (modulo)** — returns the remainder: `10 % 3` is `1`",
      codeExample: `# if / elif / else
score = 72

if score >= 90:
    print("Grade: A")
elif score >= 70:
    print("Grade: B")
else:
    print("Grade: C or below")

# for loop with range
print("\\nCounting:")
for i in range(1, 6):
    print(i)

# while loop
countdown = 3
while countdown > 0:
    print(countdown)
    countdown -= 1
print("Go!")`,
      task: "Write a program that loops through the numbers 1 to 20. For each number: print 'Fizz' if it is divisible by 3, print 'Buzz' if it is divisible by 5, print 'FizzBuzz' if divisible by both, and print the number otherwise.",
      hint: "Use the modulo operator `%` to check divisibility — `n % 3 == 0` is True when n divides evenly by 3. Check the FizzBuzz case (divisible by both) first.",
    },
    4: {
      explanation: "Functions and data structures are the core building blocks of every Python program.\n\n- **`def name(params):`** — defines a reusable function; `return` sends a value back\n- **Default parameters** — `def greet(name, greeting=\"Hello\"):` uses `\"Hello\"` if none is passed\n- **Scope** — variables inside a function only exist there (local scope)\n- **Lists** `[]` — ordered, changeable collections; key methods: `.append()`, `.pop()`, `.sort()`\n- **Dictionaries** `{}` — key-value pairs; loop over with `.items()`\n- **List comprehensions** — `[x*2 for x in nums]` is a concise way to transform a list",
      codeExample: `# Function with parameters and return value
def greet(name, greeting="Hello"):
    return f"{greeting}, {name}!"

print(greet("Alice"))
print(greet("Bob", "Hi"))

# List operations
fruits = ["apple", "banana", "cherry"]
fruits.append("date")
fruits.sort()
print(fruits)

# Dictionary
person = {"name": "Alice", "age": 25, "city": "NYC"}
for key, value in person.items():
    print(f"{key}: {value}")`,
      task: "Write a function called `describe_list(items)` that takes a list of numbers and returns a dictionary with keys 'count', 'total', 'min', and 'max'. Test it with the list [4, 7, 2, 9, 1, 5].",
      hint: "Python has built-in functions `len()`, `sum()`, `min()`, and `max()` that work directly on lists — you don't need to write those yourself.",
    },
    5: {
      explanation: "You now know all the Python fundamentals — time to combine everything in a real project.\n\n- **`import random`** — access the standard library; `random.randint(1, 100)` picks a random integer\n- **`input()`** — reads text from the user; wrap in `int()` to convert it to a number\n- **`while True:` + `break`** — the classic \"keep going until done\" loop pattern\n- **Counter variables** — track how many times something has happened\n- **Nested logic** — combining loops, conditionals, and functions in one program is real Python\n- **`if __name__ == \"__main__\":`** — a best-practice wrapper for runnable scripts",
      codeExample: `import random

def number_guessing_game():
    secret = random.randint(1, 100)
    attempts = 0
    print("I'm thinking of a number between 1 and 100.")

    while True:
        guess = int(input("Your guess: "))
        attempts += 1

        if guess < secret:
            print("Too low! Try higher.")
        elif guess > secret:
            print("Too high! Try lower.")
        else:
            print(f"Correct! You got it in {attempts} attempts.")
            break

number_guessing_game()`,
      task: "Build the number guessing game above, then extend it: (1) add a maximum of 7 attempts — if the player runs out, reveal the secret number; (2) after the game ends, ask if they want to play again (y/n) and restart if they say yes.",
      hint: "Track attempts with a counter variable. Use a `while attempts < 7` condition for the guess loop. For play-again, wrap the whole game in an outer `while True` loop and break it when the player types 'n'.",
    },
  },

  // ──────────────────────────────────────────────────────────
  // JAVASCRIPT
  // ──────────────────────────────────────────────────────────
  javascript: {
    1: {
      explanation: "JavaScript runs in every web browser and is the language of interactivity on the web.\n\n- **`console.log()`** — prints output to the browser console; your primary debugging tool\n- **`const`** — declares a variable that cannot be reassigned; use this by default\n- **`let`** — declares a variable that can be reassigned; use when the value will change\n- **`var`** — the old keyword with quirky scoping; avoid in modern code\n- **Dynamically typed** — no need to declare types; JavaScript figures them out at runtime\n- **Statements** execute top to bottom; open the browser console with **F12** to run code",
      codeExample: `// Declaring variables
const name = "Alice";
let age = 25;

console.log("Hello,", name);
console.log("Age:", age);

// Reassigning let is fine
age = 26;
console.log("Next year:", age);

// const cannot be reassigned
// name = "Bob";  // ← This would throw a TypeError`,
      task: "Declare a `const` for your city name and a `let` for the current temperature. Log a sentence like: 'It is 22°C in London today.' Then change the temperature variable to a new value and log the updated sentence.",
      hint: "Use template literals (backtick strings) to embed variables: `It is ${temp}°C in ${city} today.`",
    },
    2: {
      explanation: "JavaScript has six primitive types — and understanding them prevents many common bugs.\n\n- **`number`** — all numbers (integers and decimals share one type): `42`, `3.14`\n- **`string`** — text in quotes: `\"hello\"`, `'hello'`, or template literals `` `Hello, ${name}!` ``\n- **`boolean`** — `true` or `false` (lowercase)\n- **`null`** — intentionally empty; **`undefined`** — declared but not yet assigned a value\n- **Template literals** — use backtick strings to embed expressions: `` `${price * qty}` ``\n- **String methods** — `.length`, `.toUpperCase()`, `.includes()`, `.slice()`, `.trim()`\n- **`typeof`** — returns a string describing a value's type: `typeof 42` → `\"number\"`",
      codeExample: `// Numbers and arithmetic
const price = 19.99;
const qty = 4;
console.log("Total:", price * qty);       // 79.96
console.log("Rounded:", Math.round(price * qty)); // 80

// Template literals
const item = "Laptop";
console.log(\`\${item} costs \$\${price} each\`);

// String methods
const greeting = "  Hello, World!  ";
console.log(greeting.trim());             // "Hello, World!"
console.log(greeting.trim().toUpperCase()); // "HELLO, WORLD!"
console.log(greeting.includes("World"));  // true
console.log(typeof 42);                   // "number"
console.log(typeof "hi");                 // "string"`,
      task: "Create a string variable with extra whitespace around a sentence. Use `.trim()` to remove it, `.split(' ')` to break it into an array of words, and log the number of words. Then log the sentence reversed word-by-word (hint: arrays have a `.reverse()` method).",
      hint: "`.split(' ')` returns an array. Arrays have `.reverse()` and `.join(' ')` methods — chain them to rebuild the string with words in reverse order.",
    },
    3: {
      explanation: "Conditionals and arrays are where JavaScript starts to get powerful.\n\n- **`===`** — checks both value AND type; always prefer it over the loose `==`\n- **`if` / `else if` / `else`** — runs the first block whose condition is `true`\n- **`for (let i = 0; i < n; i++)`** — classic loop with a counter\n- **`for...of`** — cleanly iterates every item in an array: `for (const item of items)`\n- **Arrays** `[]` — ordered lists; key methods: `.push()`, `.pop()`, `.map()`, `.filter()`, `.find()`\n- **`.map(fn)`** — returns a new array with each element transformed\n- **`.filter(fn)`** — returns a new array with only elements that pass the test",
      codeExample: `// Conditionals
const hour = new Date().getHours();
let greeting;
if (hour < 12) {
    greeting = "Good morning";
} else if (hour < 18) {
    greeting = "Good afternoon";
} else {
    greeting = "Good evening";
}
console.log(greeting);

// Array methods
const numbers = [1, 2, 3, 4, 5, 6];
const evens = numbers.filter(n => n % 2 === 0);
const doubled = evens.map(n => n * 2);
console.log(doubled);   // [4, 8, 12]

// for...of
for (const n of doubled) {
    console.log(n);
}`,
      task: "Create an array of at least 8 numbers. Use `.filter()` to get only numbers greater than 5, then use `.map()` to square each of those, then use `.reduce((sum, n) => sum + n, 0)` to add them all up. Log each step's result.",
      hint: "You can chain these methods: `numbers.filter(...).map(...).reduce(...)`. Each method returns a new array (or value for reduce), so chaining works cleanly.",
    },
    4: {
      explanation: "Functions are first-class citizens in JavaScript — they can be stored, passed, and returned.\n\n- **Arrow functions** `=>` — concise syntax: `const double = n => n * 2`\n- **Object literals** — group related data: `{ name: \"Alice\", age: 25 }`\n- **Dot notation** vs **bracket notation** — `obj.key` or `obj[\"key\"]` both access properties\n- **Destructuring** — unpack values: `const { name, age } = person`\n- **Spread operator** `...` — copy/merge: `const updated = { ...person, age: 26 }`\n- **Array destructuring** — `const [first, second] = myArray`\n- **Short-circuit evaluation** — `a || b` returns `b` if `a` is falsy; `a && b` returns `b` if `a` is truthy",
      codeExample: `// Arrow functions
const square = n => n * n;
const add = (a, b) => a + b;
console.log(square(5));     // 25
console.log(add(3, 4));     // 7

// Object literal and methods
const person = {
    name: "Alice",
    age: 25,
    greet() {
        return \`Hi, I'm \${this.name}\`;
    }
};
console.log(person.greet());

// Destructuring
const { name, age } = person;
console.log(name, age);

// Spread to copy/merge
const updated = { ...person, age: 26, city: "NYC" };
console.log(updated);`,
      task: "Write a function `summarise(students)` that takes an array of student objects (each with `name` and `grade` properties) and returns an object with `count`, `average`, `highest`, and `lowest` grade. Test it with at least 5 students.",
      hint: "Use `students.reduce()` to accumulate totals, and `Math.max(...students.map(s => s.grade))` to find the highest grade. Spread into Math.max using the array spread syntax.",
    },
    5: {
      explanation: "You have covered all the JavaScript fundamentals — now combine them in a real project.\n\n- **Data modelling** — represent a to-do as an object: `{ id, text, done }`\n- **Array methods** — `.push()` to add, `.filter()` to remove, `.find()` to look up\n- **`.map()` for rendering** — transform data objects into display strings\n- **Immutable updates** — never mutate arrays directly; use `.filter()` and spread to create new ones\n- **Incrementing IDs** — a simple `let nextId = 1; nextId++` pattern keeps items unique\n- **Separation of concerns** — keep data logic (functions) separate from display logic",
      codeExample: `// To-do list manager
const todos = [];
let nextId = 1;

function addTodo(text) {
    todos.push({ id: nextId++, text, done: false });
}

function completeTodo(id) {
    const todo = todos.find(t => t.id === id);
    if (todo) todo.done = true;
    else console.log("Todo not found");
}

function removeTodo(id) {
    const index = todos.findIndex(t => t.id === id);
    if (index !== -1) todos.splice(index, 1);
}

function listTodos() {
    todos.forEach(t => {
        const status = t.done ? "✓" : "○";
        console.log(\`[\${status}] \${t.id}. \${t.text}\`);
    });
}

addTodo("Learn JavaScript");
addTodo("Build a project");
addTodo("Read MDN docs");
completeTodo(1);
listTodos();
removeTodo(2);
console.log("\\nAfter removing #2:");
listTodos();`,
      task: "Extend the to-do manager: (1) add an `editTodo(id, newText)` function; (2) add a `filterTodos(done)` function that returns only completed or only pending todos; (3) add a `clearCompleted()` function that removes all done todos. Test all the new functions.",
      hint: "For `filterTodos(done)`, use `todos.filter(t => t.done === done)`. For `clearCompleted()`, reassign the `todos` array won't work since it's const — instead use `todos.splice(0)` to empty it in-place, then push back the non-done items.",
    },
  },

  // ──────────────────────────────────────────────────────────
  // HTML
  // ──────────────────────────────────────────────────────────
  html: {
    1: {
      explanation: "HTML is the skeleton of every webpage — it describes structure using elements made of tags.\n\n- **Elements** — an opening tag `<h1>` + content + closing tag `</h1>`\n- **`<!DOCTYPE html>`** — tells the browser this is modern HTML5; must be the very first line\n- **`<head>`** — metadata the user does not see: title, charset, linked stylesheets\n- **`<body>`** — all the visible content goes here\n- **Headings** — `<h1>` (most important) through `<h6>` (least important)\n- **Paragraphs** — `<p>text</p>`; the browser adds spacing above and below automatically\n- **`<meta charset=\"UTF-8\">`** — ensures special characters display correctly",
      codeExample: `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>My First Page</title>
</head>
<body>
    <h1>Welcome to My Website</h1>
    <h2>About Me</h2>
    <p>My name is Alice. I am learning HTML.</p>
    <p>HTML is fun and easy to get started with.</p>
</body>
</html>`,
      task: "Create an HTML file for a personal profile page. Include: a `<title>` in the head, an `<h1>` with your name, an `<h2>` saying 'About Me', and two `<p>` paragraphs describing yourself. Save it as profile.html and open it in a browser.",
      hint: "Save the file with a .html extension, then just double-click it in your file browser to open it in your default browser — no server needed for basic HTML.",
    },
    2: {
      explanation: "Links and images are the two elements that make the web a web.\n\n- **`<a href=\"url\">`** — creates a hyperlink; `target=\"_blank\"` opens it in a new tab\n- **`<img src=\"url\" alt=\"description\">`** — embeds an image; self-closing (no `</img>`)\n- **`alt` attribute** — describes the image for screen readers and shows if the image fails to load\n- **`<strong>`** — bold text that signals importance; **`<em>`** — italic text for emphasis\n- **Attributes** — extra information inside the opening tag: `<tag attribute=\"value\">`\n- **Relative vs absolute URLs** — `images/photo.jpg` (relative) vs `https://example.com/photo.jpg` (absolute)\n- Always add `rel=\"noopener noreferrer\"` on links with `target=\"_blank\"` for security",
      codeExample: `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>Links and Images</title>
</head>
<body>
    <h1>My Favourite Things</h1>

    <p>I really enjoy <strong>programming</strong> and
    <em>problem solving</em>.</p>

    <p>Visit the
    <a href="https://developer.mozilla.org" target="_blank">
        MDN Web Docs
    </a>
    to learn more about HTML.</p>

    <h2>A Photo</h2>
    <img
        src="https://picsum.photos/400/200"
        alt="A random placeholder photo"
        width="400"
    >
</body>
</html>`,
      task: "Build a 'Bookmarks' page. Add at least 4 links to your favourite websites, each in its own paragraph with a brief description. Make each link open in a new tab using `target='_blank'`. Include at least one image with a descriptive alt attribute.",
      hint: "Add `target='_blank'` and `rel='noopener noreferrer'` to links that open new tabs — the rel attribute is a security best practice when using target='_blank'.",
    },
    3: {
      explanation: "Lists, tables, and forms are the workhorses of HTML content.\n\n- **`<ul>`** — unordered (bullet) list; **`<ol>`** — ordered (numbered) list; items use **`<li>`**\n- **Nested lists** — put a `<ul>` or `<ol>` inside an `<li>` to create sub-items\n- **Tables** — `<table>` > `<tr>` (row) > `<th>` (header cell) or `<td>` (data cell)\n- **`<form>`** — wraps all form controls; `method=\"POST\"` or `\"GET\"` controls how data is sent\n- **`<input type=\"...\">`** — text, email, password, checkbox, radio, number, date, submit\n- **`<label for=\"id\">`** — links a label to its input by matching `id`; essential for accessibility\n- **`<textarea>`** — multi-line text; **`<select>` + `<option>`** — dropdown menu",
      codeExample: `<!DOCTYPE html>
<html lang="en">
<head><meta charset="UTF-8"><title>Lists, Tables, Forms</title></head>
<body>
    <h2>Shopping List</h2>
    <ul>
        <li>Apples</li>
        <li>Bread
            <ul><li>Sourdough</li><li>Rye</li></ul>
        </li>
    </ul>

    <h2>Top 3 Languages</h2>
    <ol>
        <li>JavaScript</li>
        <li>Python</li>
        <li>HTML/CSS</li>
    </ol>

    <h2>Contact Form</h2>
    <form>
        <label for="email">Email:</label>
        <input type="email" id="email" name="email" required>
        <br><br>
        <label for="msg">Message:</label><br>
        <textarea id="msg" name="msg" rows="4" cols="40"></textarea>
        <br><br>
        <button type="submit">Send</button>
    </form>
</body>
</html>`,
      task: "Create a menu page for a restaurant. Include: an ordered list of 3 starters, an unordered list of 5 main courses, and a table with columns 'Dish', 'Price', and 'Vegetarian?' showing at least 4 rows of data. Add a simple booking form with name, email, date, and party-size fields.",
      hint: "For the table, use `<thead>` and `<th>` elements for the header row, and `<tbody>` with `<tr>` and `<td>` for data rows — this also helps with accessibility.",
    },
    4: {
      explanation: "Semantic HTML tells browsers and screen readers what your content *means*, not just how it looks.\n\n- **`<header>`** — top of the page or section; **`<footer>`** — bottom\n- **`<nav>`** — navigation links; **`<main>`** — the page's primary content (use once per page)\n- **`<article>`** — self-contained content (a blog post, a product card)\n- **`<section>`** — groups related content with a heading; **`<aside>`** — supplementary sidebar\n- **`id`** — unique identifier for one element: `<section id=\"about\">`\n- **`class`** — reusable label shared by many elements, used by CSS and JavaScript\n- **Anchor links** — link to a section with `<a href=\"#about\">` pointing to `id=\"about\"`",
      codeExample: `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="description" content="A blog about web development">
    <title>Dev Blog</title>
</head>
<body>
    <header>
        <h1>Dev Blog</h1>
        <nav>
            <a href="/">Home</a> |
            <a href="/about">About</a> |
            <a href="/contact">Contact</a>
        </nav>
    </header>

    <main>
        <article>
            <h2>Getting Started with HTML</h2>
            <p>Published: <time datetime="2024-01-15">Jan 15, 2024</time></p>
            <p>HTML is the foundation of the web...</p>
        </article>
        <aside>
            <h3>Related Posts</h3>
            <ul>
                <li><a href="#">CSS Basics</a></li>
            </ul>
        </aside>
    </main>

    <footer>
        <p>&copy; 2024 Dev Blog</p>
    </footer>
</body>
</html>`,
      task: "Rebuild your profile page from Level 1 using proper semantic HTML. Use `<header>`, `<main>`, `<section>` (create at least two sections: 'About Me' and 'My Skills'), and `<footer>`. Add a `<nav>` with anchor links that jump to each section using `href='#id'`.",
      hint: "To make in-page anchor links work, give each section an `id` attribute like `<section id='about'>`, then link to it with `<a href='#about'>About</a>`.",
    },
    5: {
      explanation: "You now know the complete HTML toolkit — time to build something real.\n\n- **Portfolio structure** — header, nav, main (with sections), footer\n- **In-page navigation** — `<a href=\"#skills\">` jumps to `<section id=\"skills\">`\n- **`<meta name=\"description\">`** — a one-line page summary used by search engines\n- **`<time datetime=\"2024-01-15\">`** — machine-readable dates for accessibility and SEO\n- **Validate your HTML** — paste it into [validator.w3.org](https://validator.w3.org) to catch mistakes\n- **Structure before style** — get the semantic HTML right first, then add CSS\n- A well-structured HTML document makes CSS layout dramatically easier",
      codeExample: `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta name="description" content="Alice Smith — Web Developer Portfolio">
    <title>Alice Smith | Portfolio</title>
</head>
<body>
    <header>
        <h1>Alice Smith</h1>
        <p>Junior Web Developer</p>
        <nav>
            <a href="#about">About</a> |
            <a href="#skills">Skills</a> |
            <a href="#projects">Projects</a> |
            <a href="#contact">Contact</a>
        </nav>
    </header>

    <main>
        <section id="about">
            <h2>About Me</h2>
            <img src="https://picsum.photos/120/120" alt="Profile photo">
            <p>I am a passionate web developer based in London.</p>
        </section>

        <section id="skills">
            <h2>Skills</h2>
            <ul>
                <li><strong>HTML</strong> — Semantic markup</li>
                <li><strong>CSS</strong> — Flexbox, Grid</li>
                <li><strong>JavaScript</strong> — ES6+</li>
            </ul>
        </section>

        <section id="projects">
            <h2>Projects</h2>
            <table border="1">
                <thead>
                    <tr><th>Project</th><th>Tech</th><th>Link</th></tr>
                </thead>
                <tbody>
                    <tr>
                        <td>Portfolio Site</td>
                        <td>HTML, CSS</td>
                        <td><a href="#">View</a></td>
                    </tr>
                </tbody>
            </table>
        </section>

        <section id="contact">
            <h2>Contact Me</h2>
            <form>
                <label for="name">Name:</label>
                <input type="text" id="name" name="name" required><br><br>
                <label for="email">Email:</label>
                <input type="email" id="email" name="email" required><br><br>
                <button type="submit">Send Message</button>
            </form>
        </section>
    </main>

    <footer><p>&copy; 2024 Alice Smith</p></footer>
</body>
</html>`,
      task: "Build your own complete portfolio page. It must include: (1) a `<header>` with your name and a `<nav>`; (2) an About section with an image; (3) a Skills section using a list; (4) a Projects section with a table of at least 3 projects; (5) a Contact section with a form; (6) a `<footer>`. Use semantic elements throughout.",
      hint: "Work section by section — get the structure right before worrying about content. Validate your HTML at validator.w3.org to catch any mistakes.",
    },
  },

  // ──────────────────────────────────────────────────────────
  // CSS
  // ──────────────────────────────────────────────────────────
  css: {
    1: {
      explanation: "CSS controls how HTML elements look — using rules made of a selector and a block of declarations.\n\n- **Tag selector** — `p { color: red; }` styles all `<p>` elements\n- **Class selector** — `.highlight { background: yellow; }` styles elements with `class=\"highlight\"`\n- **ID selector** — `#title { font-size: 2rem; }` styles the one element with `id=\"title\"`\n- **Multiple selectors** — `h1, h2, h3 { font-family: Arial; }` applies to all three\n- **External stylesheet** — link with `<link rel=\"stylesheet\" href=\"styles.css\">` in `<head>`; the professional approach\n- **`<style>` tag** — CSS inside the HTML file; fine for small experiments\n- **Inline style** — `style=\"color: red\"` on an element; avoid for maintainability",
      codeExample: `/* styles.css */

/* Tag selector — affects ALL paragraphs */
p {
    color: #333333;
    font-size: 16px;
}

/* Class selector — only elements with class="highlight" */
.highlight {
    background-color: yellow;
    font-weight: bold;
}

/* ID selector — only the one element with id="title" */
#title {
    color: #0066cc;
    text-align: center;
}

/* Multiple selectors at once */
h1, h2, h3 {
    font-family: Arial, sans-serif;
}`,
      task: "Create an HTML file with a heading, two paragraphs (one with class='highlight'), and a link. Write a linked external CSS file that: sets the page background to a light grey, colours the heading blue, makes '.highlight' text bold with a yellow background, and removes the underline from links.",
      hint: "To remove link underlines use `text-decoration: none;`. To link the CSS file add `<link rel='stylesheet' href='styles.css'>` inside the `<head>` of your HTML.",
    },
    2: {
      explanation: "Typography and colour are the quickest ways to make a page look professional.\n\n- **Colours** — named (`coral`), hex (`#ff6b6b`), `rgb(255, 107, 107)`, or `hsl(0, 100%, 66%)`\n- **`font-family`** — always provide a stack: `'Inter', sans-serif` (fallback if Inter isn't available)\n- **`font-size`** — use `rem` for accessibility: `1rem` = 16px by default\n- **`font-weight`** — `400` is normal, `700` is bold; values go from 100 to 900\n- **`line-height`** — `1.5` to `1.7` is ideal for body text readability\n- **`text-align`** — `left`, `center`, `right`, or `justify`\n- **Hover states** — `a:hover { color: darkblue; }` changes style when the mouse is over an element\n- **Google Fonts** — add their `<link>` tag before your stylesheet in `<head>`",
      codeExample: `/* Importing a Google Font */
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;700&display=swap');

body {
    font-family: 'Inter', sans-serif;
    font-size: 16px;
    line-height: 1.6;
    color: #222;
    background-color: #f9f9f9;
}

h1 {
    font-size: 2.5rem;
    font-weight: 700;
    color: #1a1a2e;
    letter-spacing: -0.02em;
}

.subtitle {
    font-size: 1.1rem;
    color: #666;
    font-style: italic;
}

a {
    color: #0066cc;
    text-decoration: none;
}
a:hover {
    text-decoration: underline;
    color: #004499;
}`,
      task: "Style a simple blog post page. The page should have: a readable body font at 16-18px with 1.5 line-height; a heading in a larger, bolder style; the author's name in a different colour; and hover effects on any links. Aim for good contrast — the text should be easy to read.",
      hint: "A good rule for readability: body text should be around 16-18px, line-height 1.5-1.7, and contrast ratio at least 4.5:1 between text and background. Dark grey on white (#333 on #fff) is safer than pure black on white.",
    },
    3: {
      explanation: "The box model is the foundation of all CSS layout — every element is a rectangular box.\n\n- **Content** → **Padding** → **Border** → **Margin** — four layers from inside to outside\n- **`padding`** — space *inside* the border (between content and edge)\n- **`margin`** — space *outside* the border (pushes neighbouring elements away)\n- **`border`** — a line around the element: `border: 1px solid #ddd`\n- **`box-sizing: border-box`** — makes `width` include padding and border; add to every project's reset\n- **`display: block`** — stacks vertically, takes full width; **`display: inline`** — flows with text\n- **`display: inline-block`** — flows with text but respects width/height/padding\n- **`margin: 0 auto`** — centres a block element horizontally",
      codeExample: `/* Universal box-sizing reset — put this at the top of every CSS file */
*, *::before, *::after {
    box-sizing: border-box;
    margin: 0;
    padding: 0;
}

.card {
    width: 300px;
    padding: 24px;
    margin: 16px auto;
    border: 1px solid #ddd;
    border-radius: 8px;
    background-color: white;
    /* box-shadow for depth */
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.card h2 {
    margin-bottom: 12px;
    font-size: 1.25rem;
}

.card p {
    margin-bottom: 16px;
    color: #555;
    line-height: 1.6;
}

.btn {
    display: inline-block;
    padding: 10px 20px;
    background-color: #0066cc;
    color: white;
    border-radius: 4px;
    text-decoration: none;
    font-weight: bold;
}`,
      task: "Create three product cards side-by-side. Each card should have: an image at the top, a product name, a short description, a price, and a 'Buy' button. Use padding, margin, border-radius, and box-shadow to make them look polished. Centre the group on the page using `margin: 0 auto`.",
      hint: "To place cards side-by-side without Flexbox, set each card to `display: inline-block` and wrap them in a container with `text-align: center`. The vertical spacing quirk of inline-block can be fixed by setting `vertical-align: top`.",
    },
    4: {
      explanation: "Flexbox is the most practical CSS layout tool — it arranges items in a row or column.\n\n- **`display: flex`** — turns a container into a flex container; its children become flex items\n- **`flex-direction`** — `row` (default, horizontal) or `column` (vertical)\n- **`justify-content`** — spacing along the main axis: `flex-start`, `center`, `space-between`, `space-around`\n- **`align-items`** — alignment on the cross axis: `stretch`, `center`, `flex-start`, `flex-end`\n- **`flex-wrap: wrap`** — items wrap to the next line instead of overflowing\n- **`flex: 1`** on a child — makes it grow to fill remaining space\n- **`gap: 16px`** — adds space between flex items without margin hacks\n- **Vertical centring** — `display: flex; align-items: center; justify-content: center`",
      codeExample: `/* Navigation bar */
.navbar {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 0 24px;
    height: 60px;
    background-color: #1a1a2e;
    color: white;
}

.navbar .logo {
    font-size: 1.25rem;
    font-weight: bold;
}

.navbar nav {
    display: flex;
    gap: 24px;
}

.navbar a {
    color: white;
    text-decoration: none;
    opacity: 0.8;
}

.navbar a:hover { opacity: 1; }

/* Centred hero section */
.hero {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    min-height: 60vh;
    text-align: center;
    gap: 16px;
    background: linear-gradient(135deg, #667eea, #764ba2);
    color: white;
}`,
      task: "Build a page with: (1) a sticky navigation bar using flexbox with logo on the left and links on the right; (2) a full-width hero section that centres its text vertically and horizontally; (3) a row of three feature cards using flexbox with equal width and a gap between them. Use `flex-wrap: wrap` so cards stack on smaller screens.",
      hint: "Use `position: sticky; top: 0;` on the navbar to keep it fixed at the top while scrolling. For equal-width flex children, set `flex: 1` on each card. Add `min-width: 250px` to prevent them getting too narrow before wrapping.",
    },
    5: {
      explanation: "You now know the full CSS toolkit — combine it into a professional, responsive design system.\n\n- **CSS custom properties** — define in `:root { --primary: #0066cc; }`, use with `var(--primary)`\n- **`@media (max-width: 600px)`** — applies styles only below 600px wide (mobile screens)\n- **Mobile-first approach** — write styles for small screens first, then use `min-width` media queries for larger ones\n- **Design tokens** — store spacing, colours, and font sizes as variables for consistency\n- **`position: sticky; top: 0;`** — keeps the navbar visible as you scroll\n- **Responsive typography** — use `clamp(1rem, 2.5vw, 1.5rem)` for fluid font sizes\n- A stylesheet with variables + Flexbox + one media query handles 90% of real layouts",
      codeExample: `/* CSS Variables for a consistent design system */
:root {
    --primary: #0066cc;
    --primary-dark: #004499;
    --text: #222;
    --text-muted: #666;
    --surface: #fff;
    --border: #ddd;
    --radius: 8px;
    --shadow: 0 2px 8px rgba(0,0,0,0.1);
    --spacing-sm: 8px;
    --spacing-md: 16px;
    --spacing-lg: 32px;
}

.card-grid {
    display: flex;
    gap: var(--spacing-md);
    flex-wrap: wrap;
}

.card {
    flex: 1;
    min-width: 240px;
    padding: var(--spacing-md);
    background: var(--surface);
    border: 1px solid var(--border);
    border-radius: var(--radius);
    box-shadow: var(--shadow);
}

/* Responsive: stack on mobile */
@media (max-width: 600px) {
    .card-grid { flex-direction: column; }
    .card { min-width: unset; }
}`,
      task: "Style the HTML portfolio page you built in the HTML challenge (or create a new one). Requirements: define at least 6 CSS custom properties for colours and spacing; build a sticky navbar using Flexbox; use Flexbox for a card grid in the projects section; add a media query so the layout stacks to a single column on screens narrower than 600px; add hover effects on buttons and links.",
      hint: "Work mobile-first: style for small screens first, then add media queries for larger ones using `@media (min-width: 600px)`. This is the approach used by most professional front-end developers.",
    },
  },

  // ──────────────────────────────────────────────────────────
  // JAVA
  // ──────────────────────────────────────────────────────────
  java: {
    1: {
      explanation: "Java is a statically typed, compiled language — you declare types, then compile before running.\n\n- **Every program lives inside a class** — the class name must match the filename\n- **`main` method** — `public static void main(String[] args)` is where execution starts\n- **`System.out.println()`** — prints with a newline; `System.out.print()` — without a newline\n- **Primitive types** — `int` (integers), `double` (decimals), `boolean` (`true`/`false`), `char` (one character)\n- **`String`** — text in double quotes; it is an object, not a primitive type\n- **Strong typing** — `int age = 25;` — the type is declared once and cannot change\n- Compile with `javac MyClass.java` and run with `java MyClass`",
      codeExample: `public class HelloJava {
    public static void main(String[] args) {
        // Variables — type must be declared
        String name = "Alice";
        int age = 25;
        double height = 1.72;
        boolean isStudent = true;

        System.out.println("Name: " + name);
        System.out.println("Age: " + age);
        System.out.println("Height: " + height + "m");
        System.out.println("Student: " + isStudent);

        // String concatenation with +
        System.out.println("Hello, " + name + "! You are " + age + " years old.");
    }
}`,
      task: "Create a Java class called `PersonInfo`. Declare variables for a person's first name, last name, age, and annual salary (use `double`). Print a formatted summary: 'Full name: [first] [last], Age: [age], Salary: $[salary]'. Compile with `javac PersonInfo.java` and run with `java PersonInfo`.",
      hint: "The file name must exactly match the public class name — if your class is `PersonInfo`, save it as `PersonInfo.java`. Java is case-sensitive.",
    },
    2: {
      explanation: "Java's type system has a few important quirks to watch out for.\n\n- **Integer division** — `7 / 2` gives `3`; cast to get a decimal: `(double) 7 / 2` → `3.5`\n- **String comparison** — always use `.equals()` not `==`; `\"hi\" == \"hi\"` may be `false`\n- **Strings are immutable** — methods like `.toUpperCase()` return a *new* string\n- **Key String methods** — `.length()`, `.toUpperCase()`, `.trim()`, `.contains()`, `.substring(start, end)`\n- **`System.out.printf()`** — formatted output: `%s` for strings, `%d` for ints, `%.2f` for 2 decimal floats\n- **`Math` class** — `Math.max()`, `Math.min()`, `Math.abs()`, `Math.sqrt()`, `Math.round()`",
      codeExample: `public class StringsAndMath {
    public static void main(String[] args) {
        // Integer vs double division
        int a = 7, b = 2;
        System.out.println(a / b);          // 3 (integer division)
        System.out.println((double) a / b); // 3.5

        // String methods
        String s = "  Hello, Java World!  ";
        System.out.println(s.trim());
        System.out.println(s.trim().toLowerCase());
        System.out.println(s.contains("Java"));  // true
        System.out.println(s.trim().length());    // 19

        // printf formatting
        String item = "Coffee";
        double price = 3.75;
        int qty = 4;
        System.out.printf("%-10s x%d = $%.2f%n", item, qty, price * qty);
    }
}`,
      task: "Write a program that calculates and displays a student's grade report. Store the student's name and three test scores (as doubles). Calculate the average, determine the letter grade (A: >=90, B: >=80, C: >=70, D: >=60, F: below 60), and use `printf` to print a formatted report with the student name, scores, average (2 decimal places), and letter grade.",
      hint: "Use `Math.round(value * 100.0) / 100.0` to round a double to 2 decimal places, or just let `printf` handle the formatting with `%.2f`.",
    },
    3: {
      explanation: "Java's control flow is powerful but requires discipline with `break` statements.\n\n- **`if` / `else if` / `else`** — evaluates top to bottom; runs the first matching block\n- **`switch` / `case`** — cleaner than long if-chains for comparing one value; always add `break`\n- **Fall-through** — forgetting `break` in a `switch` causes execution to continue into the next case\n- **`for (int i = 0; i < n; i++)`** — classic loop with initialiser, condition, and update\n- **Enhanced `for`** — `for (String item : items)` — cleanly iterates arrays and collections\n- **`while`** — checks condition before each run; **`do-while`** — always runs at least once\n- Use `break` to exit a loop early and `continue` to skip to the next iteration",
      codeExample: `public class ControlFlow {
    public static void main(String[] args) {
        // Switch statement
        int day = 3;
        String dayName;
        switch (day) {
            case 1: dayName = "Monday"; break;
            case 2: dayName = "Tuesday"; break;
            case 3: dayName = "Wednesday"; break;
            default: dayName = "Unknown";
        }
        System.out.println("Day: " + dayName);

        // Standard for loop
        int sum = 0;
        for (int i = 1; i <= 10; i++) {
            sum += i;
        }
        System.out.println("Sum 1-10: " + sum);

        // Enhanced for loop over array
        String[] fruits = {"apple", "banana", "cherry"};
        for (String fruit : fruits) {
            System.out.println("Fruit: " + fruit);
        }
    }
}`,
      task: "Write a program that uses a for loop to print a multiplication table for numbers 1–10. Each row should look like: '1 x 1 = 1', '1 x 2 = 2', etc., up to '10 x 10 = 100'. Use a nested for loop (one for the outer number, one for the inner) and printf to align the output neatly.",
      hint: "Use two nested for loops: `for (int i = 1; i <= 10; i++)` as the outer and `for (int j = 1; j <= 10; j++)` as the inner. Inside use `System.out.printf('%2d x %2d = %3d%n', i, j, i*j)` for aligned columns.",
    },
    4: {
      explanation: "Java is object-oriented — classes are blueprints that bundle data and behaviour together.\n\n- **Methods** — `public int add(int a, int b) { return a + b; }` — access modifier, return type, name, params\n- **`void`** — the return type when a method returns nothing\n- **Classes** — define with `class MyClass { }` — the blueprint for creating objects\n- **Constructor** — same name as the class, no return type — runs when you do `new MyClass(...)`\n- **`this.field`** — refers to the object's own field to distinguish it from a parameter with the same name\n- **`private`** — hides fields from outside code; use **getters/setters** to expose them safely\n- **`new`** keyword — creates an instance of a class: `BankAccount acc = new BankAccount(\"Alice\", 1000);`",
      codeExample: `public class BankAccount {
    private String owner;
    private double balance;

    // Constructor
    public BankAccount(String owner, double initialBalance) {
        this.owner = owner;
        this.balance = initialBalance;
    }

    public void deposit(double amount) {
        if (amount > 0) balance += amount;
    }

    public boolean withdraw(double amount) {
        if (amount > 0 && amount <= balance) {
            balance -= amount;
            return true;
        }
        return false;
    }

    public void printStatement() {
        System.out.printf("Account: %s | Balance: $%.2f%n", owner, balance);
    }

    public static void main(String[] args) {
        BankAccount acc = new BankAccount("Alice", 1000.0);
        acc.deposit(500);
        boolean ok = acc.withdraw(200);
        System.out.println("Withdrawal succeeded: " + ok);
        acc.printStatement();
    }
}`,
      task: "Create a `Rectangle` class with `width` and `height` fields, a constructor, and methods: `area()`, `perimeter()`, and `isSquare()` (returns boolean). In the `main` method, create three Rectangle objects with different sizes and print their area, perimeter, and whether they are squares.",
      hint: "Area = width × height; Perimeter = 2 × (width + height); a rectangle is a square when width == height. Make the fields `private` and add getter methods if you want to follow encapsulation principles.",
    },
    5: {
      explanation: "You now know the complete Java foundation — build something that combines it all.\n\n- **`ArrayList<Type>`** — a resizable list; more flexible than fixed-size arrays\n- **`import java.util.ArrayList;`** — import before using; Java's standard library requires explicit imports\n- **Static methods** — `static double average(ArrayList<Double> scores)` — utility methods that don't need an object\n- **Wrapper classes** — `Double`, `Integer`, `Boolean` — the object versions of primitives, required by generics\n- **Method decomposition** — break complex logic into small, well-named methods; this is the Java way\n- **`printf` for reports** — `System.out.printf(\"%-10s %5.1f%n\", name, avg)` for aligned columns",
      codeExample: `import java.util.ArrayList;

public class GradeManager {
    static double average(ArrayList<Double> scores) {
        double sum = 0;
        for (double s : scores) sum += s;
        return sum / scores.size();
    }

    static char letterGrade(double avg) {
        if (avg >= 90) return 'A';
        if (avg >= 80) return 'B';
        if (avg >= 70) return 'C';
        if (avg >= 60) return 'D';
        return 'F';
    }

    static double highest(ArrayList<Double> scores) {
        double max = scores.get(0);
        for (double s : scores) if (s > max) max = s;
        return max;
    }

    public static void main(String[] args) {
        ArrayList<Double> scores = new ArrayList<>();
        scores.add(88.5); scores.add(92.0);
        scores.add(76.0); scores.add(95.5);
        scores.add(83.0);

        double avg = average(scores);
        System.out.println("=== Grade Report ===");
        System.out.printf("Students : %d%n", scores.size());
        System.out.printf("Average  : %.1f (%c)%n", avg, letterGrade(avg));
        System.out.printf("Highest  : %.1f%n", highest(scores));
    }
}`,
      task: "Extend the GradeManager: (1) add a `lowest()` method; (2) add a method that counts how many students passed (score >= 60); (3) add a method that returns an ArrayList of only the failing scores; (4) print a full report including all statistics. Add at least 8 scores to make the statistics meaningful.",
      hint: "For the failing scores method, iterate the list and add scores below 60 to a new ArrayList, then return it. For a clean main method, define each step as a separate method — that is the OOP way.",
    },
  },

  // ──────────────────────────────────────────────────────────
  // C++
  // ──────────────────────────────────────────────────────────
  "c++": {
    1: {
      explanation: "C++ is a compiled, statically typed language that gives you direct control over memory.\n\n- **`main()`** — every program starts here; it returns `int` (return `0` means success)\n- **`#include <iostream>`** — includes the input/output library; required before using `cout`\n- **`std::cout << value`** — outputs to the console; `endl` or `\"\n\"` ends the line\n- **`using namespace std;`** — lets you write `cout` instead of `std::cout`; common in small programs\n- **Primitive types** — `int`, `double`, `bool`, `char`; the type must always be declared\n- **`std::string`** — holds text; requires `#include <string>`\n- Compile with `g++ file.cpp -o program` and run with `./program`",
      codeExample: `#include <iostream>
#include <string>
using namespace std;

int main() {
    // Declare and initialize variables
    string name = "Alice";
    int age = 25;
    double height = 1.72;
    bool isStudent = true;

    cout << "Name: " << name << endl;
    cout << "Age: " << age << endl;
    cout << "Height: " << height << "m" << endl;
    cout << "Student: " << boolalpha << isStudent << endl;

    // String concatenation
    cout << "Hello, " << name << "! You are " << age << " years old." << endl;

    return 0;
}`,
      task: "Write a C++ program that declares variables for a product name (string), price (double), and quantity (int). Calculate the total cost and print a formatted receipt showing the product, unit price, quantity, and total. Compile with `g++ main.cpp -o main` and run with `./main`.",
      hint: "You can use `cout` with multiple `<<` operators on one line to build up output. Compile and run from the terminal: `g++ hello.cpp -o hello && ./hello`.",
    },
    2: {
      explanation: "C++ has powerful tools for arithmetic, strings, and formatted output.\n\n- **Integer division** — `7 / 2` gives `3`; cast first: `(double)7 / 2` → `3.5`\n- **`<cmath>`** — `sqrt()`, `pow()`, `abs()`, `floor()`, `ceil()`, `round()`; include at the top\n- **`cin >> variable`** — reads user input; stops at whitespace\n- **String methods** — `.length()`, `.substr(start, len)`, `.find(text)` (returns position or `string::npos`)\n- **`<iomanip>` for formatting** — `setw(10)` sets column width, `setprecision(2)` sets decimal places\n- **`fixed`** — use with `setprecision` to force a fixed number of decimal places: `cout << fixed << setprecision(2)`\n- **`M_PI`** — the value of π from `<cmath>`: `3.14159265...`",
      codeExample: `#include <iostream>
#include <iomanip>
#include <cmath>
#include <string>
using namespace std;

int main() {
    // Arithmetic
    int a = 7, b = 2;
    cout << "Integer div: " << a / b << endl;     // 3
    cout << "Double div: " << (double)a / b << endl; // 3.5
    cout << "Square root of 2: " << sqrt(2.0) << endl;

    // Formatted output
    string item = "Coffee";
    double price = 3.75;
    int qty = 4;
    cout << fixed << setprecision(2);
    cout << left << setw(12) << item
         << " x" << qty
         << " = $" << price * qty << endl;

    // User input
    double radius;
    cout << "Enter radius: ";
    cin >> radius;
    cout << "Area = " << M_PI * radius * radius << endl;

    return 0;
}`,
      task: "Write a program that reads three test scores from the user (using `cin`), calculates the average, and prints a grade report. Use `setprecision(1)` and `fixed` for the average, and determine the letter grade with if/else.",
      hint: "Read multiple values with separate `cin >>` statements. To keep the output clean, use `cout << fixed << setprecision(1)` once and it will apply to all subsequent floating-point output.",
    },
    3: {
      explanation: "C++ control flow is identical to Java — but arrays and vectors deserve special attention.\n\n- **Fixed arrays** — `int nums[5] = {1, 2, 3, 4, 5};` — size set at compile time, cannot grow\n- **Range-based for** — `for (int x : nums)` — cleanly iterates arrays and vectors\n- **`vector<int>`** — dynamic array that grows: `v.push_back(10);` adds to the end\n- **`<numeric>` — `accumulate(v.begin(), v.end(), 0)`** — sums a vector without a manual loop\n- **Function prototypes** — `double average(const vector<int>& v);` at the top allows forward references\n- **`const vector<int>& v`** — pass by const reference: no copy made, cannot be modified; use for read-only parameters\n- `v.begin()` and `v.end()` — iterators pointing to the start and past the end of a vector",
      codeExample: `#include <iostream>
#include <vector>
#include <numeric>   // for std::accumulate
using namespace std;

// Function prototype
double average(const vector<int>& v);

int main() {
    vector<int> scores = {85, 92, 78, 95, 88};

    // Range-based for loop
    cout << "Scores: ";
    for (int s : scores) cout << s << " ";
    cout << endl;

    cout << "Average: " << average(scores) << endl;

    // FizzBuzz with a regular for loop
    for (int i = 1; i <= 20; i++) {
        if (i % 15 == 0)      cout << "FizzBuzz" << endl;
        else if (i % 3 == 0)  cout << "Fizz" << endl;
        else if (i % 5 == 0)  cout << "Buzz" << endl;
        else                  cout << i << endl;
    }
    return 0;
}

double average(const vector<int>& v) {
    int sum = accumulate(v.begin(), v.end(), 0);
    return (double)sum / v.size();
}`,
      task: "Write a program with a function `isPrime(int n)` that returns true if n is a prime number. In main, use a loop to print all prime numbers from 2 to 100. Then write a second function `primeFactors(int n)` that prints the prime factors of any number.",
      hint: "For `isPrime`, check if any number from 2 to `sqrt(n)` divides n evenly — you only need to check up to the square root. Include `<cmath>` for `sqrt()`. Cast to int or use a loop condition `i * i <= n` to avoid floating-point issues.",
    },
    4: {
      explanation: "Functions, structs, and references are C++'s key tools for organising data and logic.\n\n- **Pass by value** — a copy is made; changes inside the function don't affect the original\n- **Pass by reference** `&` — the function operates on the original variable directly\n- **Pass by const reference** `const Type&` — read-only access without copying; use for large objects\n- **Structs** — group related fields: `struct Student { string name; double gpa; };`\n- **Pointers** `int*` — store a memory address; dereference with `*ptr` to get the value\n- **`nullptr`** — the safe null pointer constant; always initialise pointers to `nullptr` if not yet assigned\n- **`auto`** keyword — lets the compiler infer the type: `auto it = v.begin();`",
      codeExample: `#include <iostream>
#include <string>
#include <vector>
using namespace std;

struct Student {
    string name;
    double gpa;
};

// Pass by const reference — no copy made
void printStudent(const Student& s) {
    cout << s.name << " | GPA: " << s.gpa << endl;
}

// Pass by reference — modifies original
void normalizeGPA(double& gpa) {
    if (gpa > 4.0) gpa = 4.0;
    if (gpa < 0.0) gpa = 0.0;
}

double classAverage(const vector<Student>& students) {
    double total = 0;
    for (const auto& s : students) total += s.gpa;
    return total / students.size();
}

int main() {
    vector<Student> students = {
        {"Alice", 3.8}, {"Bob", 4.2}, {"Carol", 3.5}
    };
    for (auto& s : students) normalizeGPA(s.gpa);
    for (const auto& s : students) printStudent(s);
    cout << "Class average: " << classAverage(students) << endl;
    return 0;
}`,
      task: "Create a struct `Book` with fields: title (string), author (string), year (int), and rating (double). Write functions to: print a book's details, find the highest-rated book in a vector of books, and sort books by rating (hint: use `std::sort` from `<algorithm>` with a lambda comparator). Create at least 5 books and test all functions.",
      hint: "For sorting, `std::sort` from `<algorithm>` takes a comparator: `sort(books.begin(), books.end(), [](const Book& a, const Book& b){ return a.rating > b.rating; })` sorts highest-rated first.",
    },
    5: {
      explanation: "You know the complete C++ foundation — now build a program that ties it all together.\n\n- **Data-driven design** — define a `struct` first, then build functions that operate on it\n- **`nullptr` checks** — always check pointer results before using them: `if (ptr != nullptr)`\n- **`std::sort` + lambda** — `sort(v.begin(), v.end(), [](const T& a, const T& b){ return a.x < b.x; })`\n- **Formatted tables** — `left << setw(16) << name << \"$\" << fixed << setprecision(2) << price`\n- **Separation of concerns** — one function per operation (`printAll`, `totalValue`, `findById`)\n- **`const` correctness** — mark functions `const` when they don't modify data; pass `const&` for read-only params\n- **Build with** `g++ -std=c++17 -Wall main.cpp -o program` — enable warnings to catch bugs early",
      codeExample: `#include <iostream>
#include <vector>
#include <string>
#include <iomanip>
#include <algorithm>
using namespace std;

struct Product {
    int id;
    string name;
    double price;
    int stock;
};

void printProduct(const Product& p) {
    cout << left << setw(4) << p.id
         << setw(16) << p.name
         << "$" << fixed << setprecision(2) << setw(8) << p.price
         << "stock: " << p.stock << endl;
}

void printAll(const vector<Product>& inv) {
    cout << "---- Inventory ----" << endl;
    for (const auto& p : inv) printProduct(p);
}

double totalValue(const vector<Product>& inv) {
    double total = 0;
    for (const auto& p : inv) total += p.price * p.stock;
    return total;
}

int main() {
    vector<Product> inventory = {
        {1, "Laptop",   999.99, 5},
        {2, "Mouse",     29.99, 20},
        {3, "Keyboard",  79.99, 12},
        {4, "Monitor",  399.99, 8},
    };
    printAll(inventory);
    cout << fixed << setprecision(2);
    cout << "Total value: $" << totalValue(inventory) << endl;
    return 0;
}`,
      task: "Extend the inventory system: (1) add a `findById(vector<Product>& inv, int id)` function that returns a pointer to the product (or nullptr if not found); (2) add a `restock(Product* p, int amount)` function; (3) add a `lowStock(vector<Product>& inv, int threshold)` function that prints all products with stock below the threshold; (4) add a `sortByPrice()` function using std::sort. Test everything in main.",
      hint: "Return `nullptr` from `findById` when not found, and always null-check the result before using it: `if (p != nullptr) { restock(p, 10); }`. This is a fundamental C++ pattern.",
    },
  },

  // ──────────────────────────────────────────────────────────
  // TYPESCRIPT
  // ──────────────────────────────────────────────────────────
  typescript: {
    1: {
      explanation: "TypeScript is JavaScript with a type system — it catches errors before your code ever runs.\n\n- **Type annotations** — `let name: string = \"Alice\"` — add `: type` after a variable or parameter\n- **Compile-time safety** — type errors are caught by `tsc` before the code runs, not at runtime\n- **Core types** — `string`, `number`, `boolean`, `null`, `undefined`\n- **`any`** — disables type checking; use only as a last resort\n- **`unknown`** — a safer alternative to `any` — you must check the type before using the value\n- **Type inference** — `const pi = 3.14` → TypeScript infers `number`; you don't always need to annotate\n- Try TypeScript instantly at **[typescriptlang.org/play](https://typescriptlang.org/play)** — no install needed",
      codeExample: `// Type annotations on variables
const name: string = "Alice";
let age: number = 25;
let isActive: boolean = true;

// TypeScript infers types when you initialize
const pi = 3.14159;  // TypeScript infers: number

// Functions with typed parameters and return types
function greet(name: string, times: number): string {
    return \`Hello \${name}! \`.repeat(times).trim();
}

console.log(greet("Bob", 3));

// TypeScript catches errors before running:
// greet(42, "hello");  // Error: wrong argument types
// greet("Alice");       // Error: missing argument`,
      task: "Write a TypeScript function `calculateBMI(weightKg: number, heightM: number): number` that returns the BMI (weight / height²). Write a second function `bmiCategory(bmi: number): string` that returns 'Underweight', 'Normal', 'Overweight', or 'Obese' based on standard BMI ranges. Test with a few values.",
      hint: "BMI categories: < 18.5 = Underweight, 18.5–24.9 = Normal, 25–29.9 = Overweight, ≥ 30 = Obese. Use `Math.round(bmi * 10) / 10` to round to one decimal.",
    },
    2: {
      explanation: "TypeScript's union types, literal types, and type narrowing are its most practical features.\n\n- **Union types** — `string | number` — a value that can be either type\n- **Literal types** — `'north' | 'south' | 'east' | 'west'` — only those exact values are allowed\n- **Optional parameters** — `age?: number` — the parameter may or may not be provided\n- **Type aliases** — `type UserId = string | number` — give a reusable name to a complex type\n- **Type arrays** — `string[]` or `Array<string>` — an array where every element is a string\n- **Type narrowing** — after `if (typeof x === \"string\")`, TypeScript knows `x` is a `string` inside that block\n- **`as`** — type assertion: `const btn = el as HTMLButtonElement` — tells TypeScript the specific type",
      codeExample: `// Union types and literal types
type Direction = "north" | "south" | "east" | "west";
type Id = string | number;

function move(dir: Direction, steps: number): string {
    return \`Moving \${dir} by \${steps} steps\`;
}

// Optional parameters and default values
function createUser(
    name: string,
    age: number,
    role: "admin" | "user" = "user"
): string {
    return \`\${name} (age \${age}) — \${role}\`;
}

console.log(createUser("Alice", 25));
console.log(createUser("Bob", 30, "admin"));

// Type narrowing
function formatId(id: Id): string {
    if (typeof id === "number") {
        return \`ID-\${id.toString().padStart(4, "0")}\`;
    }
    return id.toUpperCase();
}

console.log(formatId(42));       // "ID-0042"
console.log(formatId("abc"));    // "ABC"`,
      task: "Create a type alias `Result<T>` that is either `{ success: true; data: T }` or `{ success: false; error: string }`. Write a function `divideNumbers(a: number, b: number): Result<number>` that returns a success result with the quotient or an error result when dividing by zero. Use type narrowing to handle both cases in the caller.",
      hint: "This is a discriminated union — TypeScript can narrow the type based on the `success` property. After checking `if (result.success)`, TypeScript knows `result.data` exists; in the else branch it knows `result.error` exists.",
    },
    3: {
      explanation: "Interfaces and generics are TypeScript's most powerful tools for building reusable, type-safe code.\n\n- **`interface`** — defines the shape of an object: property names and their types\n- **`readonly`** — marks a property that cannot be changed after creation\n- **`?` on interface properties** — makes a field optional: `age?: number`\n- **Generics `<T>`** — write a function once that works for any type: `function first<T>(arr: T[]): T`\n- **`Partial<T>`** — all properties become optional; **`Required<T>`** — all become required\n- **`Pick<T, K>`** — select specific properties; **`Omit<T, K>`** — exclude specific properties\n- **`Readonly<T>`** — prevents reassignment of all properties — useful for config objects",
      codeExample: `// Interface definition
interface User {
    readonly id: number;
    name: string;
    email: string;
    age?: number;   // optional
}

// Generic function — works with any type
function firstItem<T>(arr: T[]): T | undefined {
    return arr[0];
}

console.log(firstItem([1, 2, 3]));          // 1
console.log(firstItem(["a", "b"]));         // "a"

// Utility types
type UserPreview = Pick<User, "id" | "name">;
type NewUser = Omit<User, "id">;
type PartialUser = Partial<User>;

function updateUser(user: User, updates: Partial<User>): User {
    return { ...user, ...updates };
}

const alice: User = { id: 1, name: "Alice", email: "a@example.com" };
const updated = updateUser(alice, { name: "Alice Smith", age: 26 });
console.log(updated);`,
      task: "Define an interface `Product` with id, name, price, category, and optional description. Write a generic function `filterBy<T, K extends keyof T>(items: T[], key: K, value: T[K]): T[]` that filters an array by any property. Create an array of 5 products and test filtering by category and by price.",
      hint: "The constraint `K extends keyof T` ensures the key actually exists on type T. `T[K]` is the type of that property. This pattern is called a 'generic with constraint' and is very powerful for type-safe utilities.",
    },
    4: {
      explanation: "TypeScript classes extend JavaScript classes with access control and structural guarantees.\n\n- **`public`** — accessible from anywhere (default); **`private`** — only inside the class\n- **`protected`** — accessible inside the class and its subclasses\n- **Constructor shorthand** — `constructor(private name: string)` declares and assigns the field in one line\n- **`readonly`** — the field can be set in the constructor but never changed afterward\n- **`abstract class`** — a blueprint that cannot be instantiated directly; subclasses must implement abstract methods\n- **`enum`** — a named set of constants: `enum Status { Active = \"ACTIVE\", Inactive = \"INACTIVE\" }`\n- **`static`** — belongs to the class itself, not to instances: `Employee.count`",
      codeExample: `// Enum
enum Status { Active = "ACTIVE", Inactive = "INACTIVE", Pending = "PENDING" }

// Class with access modifiers and shorthand constructor
class Employee {
    private static nextId = 1;

    constructor(
        public readonly name: string,
        private salary: number,
        public status: Status = Status.Active
    ) {
        // fields are declared and assigned by the shorthand above
    }

    getSalary(): number { return this.salary; }

    raiseSalary(percent: number): void {
        this.salary *= (1 + percent / 100);
    }

    toString(): string {
        return \`\${this.name} [\${this.status}] - $\${this.salary.toFixed(2)}\`;
    }
}

const emp = new Employee("Alice", 75000);
emp.raiseSalary(10);
console.log(emp.toString());
// emp.salary = 0;  // Error: 'salary' is private`,
      task: "Create an abstract class `Shape` with an abstract method `area(): number` and a concrete method `describe(): string` that returns 'I am a [className] with area [area]'. Implement `Circle` and `Rectangle` subclasses that extend Shape. Create instances of each and call `describe()`. Add a function `totalArea(shapes: Shape[]): number` that returns the sum of all areas.",
      hint: "Use `this.constructor.name` in the abstract base class to get the actual class name at runtime. Mark the method abstract with `abstract area(): number` — TypeScript will enforce that subclasses implement it.",
    },
    5: {
      explanation: "You know the complete TypeScript foundation — now build something that showcases the type system.\n\n- **Discriminated unions** — `{ success: true; data: T } | { success: false; error: string }` — TypeScript narrows based on the `success` field\n- **`Record<K, V>`** — a typed object with keys of type `K` and values of type `V`\n- **`keyof T`** — a union of all property names of `T`; use in generic constraints\n- **`T[K]`** — the type of property `K` on type `T`; used in generic accessor patterns\n- **`Omit<T, K> & { extra: string }`** — intersect types to extend or combine shapes\n- **The real TypeScript advantage** — refactoring is safe because the compiler tells you everywhere a change breaks\n- Self-documenting code — types serve as inline documentation that is always up to date",
      codeExample: `// Typed task manager
enum Priority { Low = 1, Medium = 2, High = 3 }
enum TaskStatus { Todo = "TODO", InProgress = "IN_PROGRESS", Done = "DONE" }

interface Task {
    readonly id: number;
    title: string;
    priority: Priority;
    status: TaskStatus;
    dueDate?: Date;
    tags: string[];
}

type NewTask = Omit<Task, "id" | "status"> & { status?: TaskStatus };

class TaskManager {
    private tasks: Task[] = [];
    private nextId = 1;

    add(task: NewTask): Task {
        const newTask: Task = {
            ...task,
            id: this.nextId++,
            status: task.status ?? TaskStatus.Todo,
        };
        this.tasks.push(newTask);
        return newTask;
    }

    getByPriority(priority: Priority): Task[] {
        return this.tasks.filter(t => t.priority === priority);
    }

    complete(id: number): boolean {
        const task = this.tasks.find(t => t.id === id);
        if (!task) return false;
        task.status = TaskStatus.Done;
        return true;
    }

    summary(): Record<TaskStatus, number> {
        return this.tasks.reduce((acc, t) => {
            acc[t.status] = (acc[t.status] || 0) + 1;
            return acc;
        }, {} as Record<TaskStatus, number>);
    }
}

const tm = new TaskManager();
tm.add({ title: "Learn TypeScript", priority: Priority.High, tags: ["learning"] });
tm.add({ title: "Build project", priority: Priority.Medium, tags: ["work", "coding"] });
tm.complete(1);
console.log(tm.summary());`,
      task: "Extend the TaskManager: (1) add an `update(id: number, changes: Partial<Omit<Task, 'id'>>): boolean` method; (2) add a `filterByTag(tag: string): Task[]` method; (3) add a generic `sortBy<K extends keyof Task>(key: K): Task[]` method; (4) add a `export(): string` method that returns a JSON string of all tasks. Write tests for each method in a main block.",
      hint: "For `update`, find the task by id, then use `Object.assign(task, changes)` or spread: `this.tasks[index] = { ...this.tasks[index], ...changes }`. The `Partial<Omit<Task, 'id'>>` type ensures you can't change the id.",
    },
  },

  // ──────────────────────────────────────────────────────────
  // REACT
  // ──────────────────────────────────────────────────────────
  react: {
    1: {
      explanation: "React builds UIs by composing small, reusable functions called components.\n\n- **Component** — a function that returns JSX; name must start with a **capital letter**\n- **JSX** — looks like HTML but is actually JavaScript; compiles to `React.createElement()` calls\n- **`{expression}`** — embed any JavaScript value or expression inside JSX with curly braces\n- **Props** — data passed *into* a component from its parent: `<Greeting name=\"Alice\" />`\n- **Pure components** — same props in → same output; no side effects inside the render function\n- **`className`** — use instead of `class` in JSX (since `class` is a reserved JS keyword)\n- **Self-closing tags** — all tags must be closed: `<img />`, `<br />`, `<input />`",
      codeExample: `// A simple React component
function Greeting({ name, role }) {
  return (
    <div className="greeting">
      <h1>Hello, {name}!</h1>
      <p>You are logged in as <strong>{role}</strong>.</p>
    </div>
  );
}

// Using the component
function App() {
  return (
    <div>
      <Greeting name="Alice" role="admin" />
      <Greeting name="Bob" role="viewer" />
    </div>
  );
}

export default App;`,
      task: "Create a `ProfileCard` component that accepts `name`, `bio`, `avatarUrl`, and `jobTitle` props. It should display them nicely — name as a heading, job title in a smaller style, an image, and bio as a paragraph. Render at least three different profiles in App.",
      hint: "Use `<img src={avatarUrl} alt={name} />` for the image. Remember: in JSX, use `className` instead of `class` for CSS classes, and all tags must be closed (either `<img />` or `<img></img>`).",
    },
    2: {
      explanation: "Props and lists are how React components come alive with real data.\n\n- **Any value as a prop** — strings, numbers, booleans, arrays, objects, even functions\n- **`children` prop** — whatever you nest between `<Card>...</Card>` tags becomes `props.children`\n- **Default props** — `function Card({ title, highlighted = false })` — `false` if not passed\n- **`.map()` for lists** — `items.map(item => <Item key={item.id} {...item} />)` — renders a list of components\n- **`key` prop** — must be unique and stable; helps React update the DOM efficiently; don't use array index as key\n- **Conditional rendering** — ternary: `{isLogged ? <Dashboard /> : <Login />}`\n- **Short-circuit** — `{count > 0 && <Badge count={count} />}` — renders only when the condition is true",
      codeExample: `// A Card container that uses children
function Card({ title, children, highlighted = false }) {
  return (
    <div style={{
      border: \`2px solid \${highlighted ? "gold" : "#ddd"}\`,
      padding: "16px",
      borderRadius: "8px",
      margin: "8px",
    }}>
      <h3>{title}</h3>
      {children}
    </div>
  );
}

function TodoList({ items }) {
  return (
    <ul>
      {items.map((item) => (
        <li key={item.id} style={{ textDecoration: item.done ? "line-through" : "none" }}>
          {item.text}
          {item.done && <span> ✓</span>}
        </li>
      ))}
    </ul>
  );
}

const todos = [
  { id: 1, text: "Learn React", done: true },
  { id: 2, text: "Build a project", done: false },
];

export default function App() {
  return (
    <Card title="My Todos" highlighted>
      <TodoList items={todos} />
    </Card>
  );
}`,
      task: "Build a `ProductGrid` component that takes an array of product objects (id, name, price, category, inStock). Use `.map()` to render each as a `ProductCard`. The card should show name, price formatted as currency, and a green 'In Stock' or red 'Out of Stock' badge based on the `inStock` prop. Add a filter to show only in-stock products.",
      hint: "Format price as currency with `price.toLocaleString('en-US', { style: 'currency', currency: 'USD' })`. For conditional styling use a ternary: `style={{ color: inStock ? 'green' : 'red' }}`.",
    },
    3: {
      explanation: "`useState` is React's memory — it lets a component remember and respond to changing values.\n\n- **`const [value, setValue] = useState(initial)`** — returns [current value, setter function]\n- **Never mutate state directly** — always use the setter; direct mutation won't trigger a re-render\n- **Immutable arrays** — `setItems([...items, newItem])` to add; `.filter()` to remove\n- **Immutable objects** — `setUser({ ...user, name: \"Bob\" })` to update a single field\n- **Local state** — each component instance has its own independent state\n- **Functional updates** — `setCount(prev => prev + 1)` is safer when new state depends on old state\n- **Re-render** — React automatically re-renders the component (and its children) whenever state changes",
      codeExample: `import { useState } from "react";

function Counter() {
  const [count, setCount] = useState(0);

  return (
    <div>
      <p>Count: {count}</p>
      <button onClick={() => setCount(count + 1)}>+1</button>
      <button onClick={() => setCount(count - 1)}>-1</button>
      <button onClick={() => setCount(0)}>Reset</button>
    </div>
  );
}

function ShoppingList() {
  const [items, setItems] = useState(["Apples", "Bread"]);
  const [input, setInput] = useState("");

  const addItem = () => {
    if (!input.trim()) return;
    setItems([...items, input.trim()]);
    setInput("");
  };

  return (
    <div>
      <ul>{items.map((item, i) => <li key={i}>{item}</li>)}</ul>
      <input value={input} onChange={e => setInput(e.target.value)} />
      <button onClick={addItem}>Add</button>
    </div>
  );
}

export default function App() {
  return <><Counter /><ShoppingList /></>;
}`,
      task: "Build a full to-do app with useState. Requirements: (1) add new todos with an input and button; (2) mark todos complete by clicking them (toggle); (3) delete a todo with a '×' button; (4) show a count of remaining incomplete todos; (5) a 'Clear completed' button. Each todo should be an object `{ id, text, done }`.",
      hint: "For toggling, use `setTodos(todos.map(t => t.id === id ? { ...t, done: !t.done } : t))` — this creates a new array with only the targeted item changed. For deletion use `.filter(t => t.id !== id)`.",
    },
    4: {
      explanation: "`useEffect` handles side effects — code that reaches outside the component to the outside world.\n\n- **`useEffect(fn, [deps])`** — runs `fn` after render whenever values in `[deps]` change\n- **Empty deps `[]`** — runs once after the first render only (like `componentDidMount`)\n- **No deps array** — runs after *every* render (usually not what you want)\n- **Cleanup function** — `return () => clearInterval(timer)` — runs before the next effect or on unmount\n- **Data fetching** — fetch inside `useEffect`, set loading state before and after\n- **`e.preventDefault()`** — stops the browser's default action (e.g., form submission page reload)\n- **Controlled inputs** — `value={state}` + `onChange={e => setState(e.target.value)}` — React owns the value",
      codeExample: `import { useState, useEffect } from "react";

function UserCard({ userId }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    fetch(\`https://jsonplaceholder.typicode.com/users/\${userId}\`)
      .then(res => res.json())
      .then(data => {
        setUser(data);
        setLoading(false);
      });
  }, [userId]);   // Re-runs when userId changes

  if (loading) return <p>Loading...</p>;
  return (
    <div>
      <h2>{user?.name}</h2>
      <p>Email: {user?.email}</p>
      <p>Company: {user?.company?.name}</p>
    </div>
  );
}

export default function App() {
  const [id, setId] = useState(1);
  return (
    <div>
      <button onClick={() => setId(id > 1 ? id - 1 : 1)}>Previous</button>
      <button onClick={() => setId(id < 10 ? id + 1 : 10)}>Next</button>
      <UserCard userId={id} />
    </div>
  );
}`,
      task: "Build a search component that fetches results from an API as the user types. Use `https://jsonplaceholder.typicode.com/posts` to get posts. Debounce the search by only fetching 500ms after the user stops typing (hint: `useEffect` + `setTimeout` + returning a cleanup function that calls `clearTimeout`). Show a loading state and handle the case where no results are found.",
      hint: "The debounce pattern: inside useEffect, do `const timer = setTimeout(() => { /* fetch */ }, 500)`. Return `() => clearTimeout(timer)` as the cleanup. This cancels the fetch if the user types again before the 500ms is up.",
    },
    5: {
      explanation: "You know the complete React foundation — now build something with real data and persistence.\n\n- **Lifting state up** — move shared state to the nearest common parent, then pass it down as props\n- **Event handlers as props** — `<Card onDelete={handleDelete} />` — pass functions down to children\n- **Debouncing** — delay a fetch until the user stops typing: `useEffect` + `setTimeout` + cleanup\n- **`localStorage`** — persist state across page reloads: `JSON.stringify` to save, `JSON.parse` to load\n- **Loading/error states** — always handle three states: loading, error, and success\n- **`useState` initialiser function** — `useState(() => JSON.parse(localStorage.getItem('key') || '[]'))` loads once\n- **Component composition** — small, focused components are easier to test, reuse, and debug",
      codeExample: `import { useState, useEffect } from "react";

// A mock search — replace with a real API call
const MOCK_BOOKS = [
  { id: 1, title: "Clean Code", author: "Robert Martin", year: 2008 },
  { id: 2, title: "The Pragmatic Programmer", author: "Hunt & Thomas", year: 1999 },
  { id: 3, title: "You Don't Know JS", author: "Kyle Simpson", year: 2015 },
];

function BookCard({ book, isFav, onToggle }) {
  return (
    <div style={{ border: "1px solid #ddd", padding: 12, margin: 8, borderRadius: 8 }}>
      <h3>{book.title}</h3>
      <p>{book.author} · {book.year}</p>
      <button onClick={() => onToggle(book)}>
        {isFav ? "★ Remove" : "☆ Save"}
      </button>
    </div>
  );
}

export default function App() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState(MOCK_BOOKS);
  const [favourites, setFavourites] = useState([]);

  useEffect(() => {
    const lower = query.toLowerCase();
    setResults(MOCK_BOOKS.filter(b =>
      b.title.toLowerCase().includes(lower) ||
      b.author.toLowerCase().includes(lower)
    ));
  }, [query]);

  const toggleFav = (book) => {
    setFavourites(favs =>
      favs.find(f => f.id === book.id)
        ? favs.filter(f => f.id !== book.id)
        : [...favs, book]
    );
  };

  return (
    <div style={{ maxWidth: 600, margin: "0 auto", padding: 20 }}>
      <h1>Book Finder</h1>
      <input
        value={query}
        onChange={e => setQuery(e.target.value)}
        placeholder="Search books..."
        style={{ width: "100%", padding: 8, fontSize: 16 }}
      />
      <h2>Results ({results.length})</h2>
      {results.map(b => (
        <BookCard key={b.id} book={b}
          isFav={!!favourites.find(f => f.id === b.id)}
          onToggle={toggleFav} />
      ))}
      {favourites.length > 0 && (
        <>
          <h2>Favourites ({favourites.length})</h2>
          {favourites.map(b => <BookCard key={b.id} book={b} isFav onToggle={toggleFav} />)}
        </>
      )}
    </div>
  );
}`,
      task: "Replace the mock data with a real API. Use `https://openlibrary.org/search.json?q={query}&limit=10` to search Open Library. When the user types a search query, fetch results after a 300ms debounce. Display each book's title and author. Allow users to save favourites to `localStorage` — load them back on page reload using a `useState` initializer function.",
      hint: "To persist favourites: `useState(() => JSON.parse(localStorage.getItem('favs') || '[]'))` loads from storage on mount. Add a `useEffect([favourites])` that calls `localStorage.setItem('favs', JSON.stringify(favourites))` whenever favourites change.",
    },
  },

  // ──────────────────────────────────────────────────────────
  // SQL
  // ──────────────────────────────────────────────────────────
  sql: {
    1: {
      explanation: "SQL is the standard language for working with relational databases — data stored in tables.\n\n- **`SELECT`** — retrieves data; `SELECT *` fetches all columns; listing names fetches only those\n- **`FROM`** — specifies the table to query\n- **`WHERE`** — filters rows: `WHERE dept = 'Engineering'`\n- **Comparison operators** — `=`, `<>` (not equal), `<`, `>`, `<=`, `>=`\n- **SQL keywords** are written in UPPERCASE by convention; most databases are case-insensitive\n- **`CREATE TABLE`** — defines a new table with column names and types\n- **`INSERT INTO ... VALUES (...)`** — adds a row of data\n- Try SQL instantly at **[sqliteonline.com](https://sqliteonline.com)** — no install needed",
      codeExample: `-- Create a sample table
CREATE TABLE employees (
    id      INTEGER PRIMARY KEY,
    name    TEXT    NOT NULL,
    dept    TEXT,
    salary  REAL,
    hire_date TEXT
);

-- Insert some data
INSERT INTO employees VALUES (1, 'Alice',  'Engineering', 85000, '2021-03-15');
INSERT INTO employees VALUES (2, 'Bob',    'Marketing',   62000, '2020-07-01');
INSERT INTO employees VALUES (3, 'Carol',  'Engineering', 92000, '2019-11-20');
INSERT INTO employees VALUES (4, 'Dave',   'Marketing',   58000, '2022-01-10');
INSERT INTO employees VALUES (5, 'Eve',    'Engineering', 78000, '2023-02-28');

-- Retrieve all rows
SELECT * FROM employees;

-- Retrieve specific columns
SELECT name, salary FROM employees;

-- Filter with WHERE
SELECT name, dept, salary
FROM employees
WHERE dept = 'Engineering';`,
      task: "Create a `students` table with columns: id, name, grade (A/B/C/D/F), score (a number), and subject. Insert at least 8 students across different grades and subjects. Then write queries to: (1) select all students; (2) select only students with grade 'A'; (3) select students with score above 80.",
      hint: "Run each statement separately if your SQL tool requires it. The WHERE clause supports comparison operators: `=`, `<>` (not equal), `<`, `>`, `<=`, `>=`. Use single quotes around text values.",
    },
    2: {
      explanation: "Aggregate functions and grouping unlock the power to summarise data at scale.\n\n- **`ORDER BY column DESC`** — sorts results; add `ASC` for ascending (the default)\n- **`LIMIT n`** — returns at most n rows; combine with `ORDER BY` to get the top N\n- **`COUNT(*)`** — counts all rows; `COUNT(col)` counts non-NULL values in that column\n- **`SUM()`, `AVG()`, `MAX()`, `MIN()`** — aggregate functions that summarise numeric columns\n- **`GROUP BY`** — groups rows with the same value; aggregate functions then apply per group\n- **`HAVING`** — filters *after* grouping (like `WHERE` but for groups): `HAVING COUNT(*) > 1`\n- **`LIKE`** — pattern matching: `%` matches any text, `_` matches exactly one character",
      codeExample: `-- ORDER BY and LIMIT
SELECT name, salary
FROM employees
ORDER BY salary DESC
LIMIT 3;

-- Aggregate functions
SELECT
    COUNT(*)          AS total_employees,
    AVG(salary)       AS avg_salary,
    MAX(salary)       AS highest_salary,
    MIN(salary)       AS lowest_salary,
    SUM(salary)       AS total_payroll
FROM employees;

-- GROUP BY: stats per department
SELECT
    dept,
    COUNT(*)     AS headcount,
    AVG(salary)  AS avg_salary
FROM employees
GROUP BY dept
HAVING COUNT(*) > 1   -- only depts with more than 1 employee
ORDER BY avg_salary DESC;

-- LIKE pattern matching
SELECT name FROM employees
WHERE name LIKE 'A%';  -- names starting with A`,
      task: "Using your students table: (1) find the average score per subject using GROUP BY; (2) find the subject with the highest average score using ORDER BY + LIMIT 1; (3) count how many students got each grade; (4) find students whose name starts with a specific letter using LIKE; (5) find all students whose score is between 70 and 90 using BETWEEN.",
      hint: "`BETWEEN 70 AND 90` is inclusive on both ends. For question (2), wrap your GROUP BY query as a subquery: `SELECT subject FROM (...) ORDER BY avg_score DESC LIMIT 1`, or just use ORDER BY on the grouped results.",
    },
    3: {
      explanation: "JOINs are how you combine data from multiple related tables.\n\n- **`INNER JOIN`** — returns only rows with a match in **both** tables; unmatched rows are excluded\n- **`LEFT JOIN`** — returns **all** rows from the left table; right-side columns are `NULL` when there is no match\n- **`ON s.dept_id = d.id`** — the join condition linking the two tables\n- **Table aliases** — `FROM staff s JOIN departments d` — use short aliases to keep queries readable\n- **Normalisation** — storing data in separate related tables reduces duplication; JOINs reassemble it\n- **`COALESCE(value, fallback)`** — returns `fallback` when `value` is `NULL`\n- Multiple joins — you can join three or more tables in one query by chaining `JOIN` clauses",
      codeExample: `-- Setup: two related tables
CREATE TABLE departments (
    id   INTEGER PRIMARY KEY,
    name TEXT NOT NULL,
    budget REAL
);

CREATE TABLE staff (
    id      INTEGER PRIMARY KEY,
    name    TEXT,
    dept_id INTEGER REFERENCES departments(id),
    salary  REAL
);

INSERT INTO departments VALUES (1,'Engineering',500000),(2,'Marketing',200000),(3,'HR',150000);
INSERT INTO staff VALUES
    (1,'Alice',1,85000),(2,'Bob',2,62000),(3,'Carol',1,92000),
    (4,'Dave',2,58000),(5,'Eve',1,78000),(6,'Frank',NULL,55000);

-- INNER JOIN: only staff with a matching dept
SELECT s.name, d.name AS dept, s.salary
FROM staff s
INNER JOIN departments d ON s.dept_id = d.id
ORDER BY d.name, s.salary DESC;

-- LEFT JOIN: includes Frank (dept_id is NULL)
SELECT s.name, COALESCE(d.name, 'Unassigned') AS dept
FROM staff s
LEFT JOIN departments d ON s.dept_id = d.id;`,
      task: "Create two tables: `orders` (id, customer_name, product_id, quantity, order_date) and `products` (id, name, price, category). Insert at least 6 products and 10 orders. Write queries to: (1) list all orders with product name and total value (quantity × price); (2) show each product and how many times it was ordered (use LEFT JOIN to include products with zero orders); (3) find the total revenue per product category.",
      hint: "For query (2), a LEFT JOIN from `products` to `orders` includes products with no orders (their count will be 0). Use `COUNT(orders.id)` instead of `COUNT(*)` — the former counts non-NULL values only, giving 0 for products with no orders.",
    },
    4: {
      explanation: "Subqueries, CTEs, and data modification complete the SQL toolkit.\n\n- **Scalar subquery** — returns a single value; usable anywhere an expression is expected\n- **`IN` subquery** — `WHERE id IN (SELECT id FROM ...)` — filters against a list of values\n- **CTE** (`WITH name AS (...)`) — names a subquery for reuse; makes complex queries readable\n- **`UPDATE table SET col = val WHERE condition`** — always include `WHERE` or every row changes\n- **`DELETE FROM table WHERE condition`** — always include `WHERE` or every row is deleted\n- **`INSERT INTO ... SELECT ...`** — inserts the result of a query as new rows\n- **Transactions** — `BEGIN; UPDATE ...; DELETE ...; COMMIT;` — group changes that must all succeed or all fail",
      codeExample: `-- Subquery: employees earning above average
SELECT name, salary
FROM employees
WHERE salary > (SELECT AVG(salary) FROM employees);

-- IN subquery: employees in high-budget departments
SELECT s.name, s.salary
FROM staff s
WHERE s.dept_id IN (
    SELECT id FROM departments WHERE budget > 300000
);

-- CTE: easier to read
WITH dept_stats AS (
    SELECT dept_id, AVG(salary) AS avg_sal, COUNT(*) AS cnt
    FROM staff
    GROUP BY dept_id
)
SELECT d.name, ds.avg_sal, ds.cnt
FROM dept_stats ds
JOIN departments d ON ds.dept_id = d.id
ORDER BY ds.avg_sal DESC;

-- UPDATE and DELETE
UPDATE employees SET salary = salary * 1.10 WHERE dept = 'Engineering';
DELETE FROM employees WHERE salary < 60000;`,
      task: "Using your orders and products tables: (1) write a CTE to calculate total revenue per category, then select only categories with revenue above 500; (2) find customers who have placed more than 2 orders using a subquery or GROUP BY + HAVING; (3) update the price of all products in a specific category by 15%; (4) delete all orders older than a specific date.",
      hint: "For query (2), use `SELECT customer_name FROM orders GROUP BY customer_name HAVING COUNT(*) > 2`. For the UPDATE, use `UPDATE products SET price = price * 1.15 WHERE category = 'Electronics'`.",
    },
    5: {
      explanation: "You know the complete SQL toolkit — now design a real relational database from scratch.\n\n- **Data modelling first** — sketch your tables and relationships before writing any SQL\n- **One entity per table** — `authors`, `books`, `loans` are separate tables\n- **Foreign keys** — `book_id INTEGER REFERENCES books(id)` links tables and enforces integrity\n- **`IS NULL` / `IS NOT NULL`** — check for missing values (never use `= NULL`)\n- **`julianday('now') - julianday(date_col)`** — calculate days between two dates in SQLite\n- **`LEFT JOIN ... WHERE right.id IS NULL`** — finds records with no matching row (e.g., members who never borrowed)\n- **Indexes** — `CREATE INDEX idx_name ON table(column)` — speeds up lookups on frequently queried columns",
      codeExample: `-- Schema for a simple library system
CREATE TABLE authors (
    id   INTEGER PRIMARY KEY,
    name TEXT NOT NULL,
    country TEXT
);

CREATE TABLE books (
    id        INTEGER PRIMARY KEY,
    title     TEXT NOT NULL,
    author_id INTEGER REFERENCES authors(id),
    genre     TEXT,
    year      INTEGER,
    copies    INTEGER DEFAULT 1
);

CREATE TABLE members (
    id         INTEGER PRIMARY KEY,
    name       TEXT NOT NULL,
    joined     TEXT,
    active     INTEGER DEFAULT 1
);

CREATE TABLE loans (
    id         INTEGER PRIMARY KEY,
    book_id    INTEGER REFERENCES books(id),
    member_id  INTEGER REFERENCES members(id),
    loaned_on  TEXT,
    returned_on TEXT
);

-- Who has what book currently on loan?
SELECT m.name AS member, b.title AS book, l.loaned_on
FROM loans l
JOIN members m ON l.member_id = m.id
JOIN books b   ON l.book_id   = b.id
WHERE l.returned_on IS NULL
ORDER BY l.loaned_on;

-- Most popular books (most loans)
SELECT b.title, COUNT(l.id) AS loan_count
FROM books b
LEFT JOIN loans l ON l.book_id = b.id
GROUP BY b.id, b.title
ORDER BY loan_count DESC
LIMIT 5;`,
      task: "Build the library database above: (1) insert at least 5 authors, 10 books, 8 members, and 15 loans (some returned, some not); (2) query all currently outstanding loans with member name, book title, and how many days it has been out (using a date function); (3) find members who have never borrowed a book; (4) find authors whose books have been borrowed the most; (5) write a query that would list books available to borrow (copies > current active loans).",
      hint: "For outstanding days, SQLite uses `julianday('now') - julianday(loaned_on)` and cast to integer. For members who never borrowed, use a LEFT JOIN from members to loans WHERE loans.id IS NULL. Question (5) requires a subquery: `SELECT copies - (SELECT COUNT(*) FROM loans WHERE book_id = b.id AND returned_on IS NULL) AS available FROM books b`.",
    },
  },

  // ──────────────────────────────────────────────────────────
  // PHP
  // ──────────────────────────────────────────────────────────
  php: {
    1: {
      explanation: "PHP is a server-side scripting language built specifically for the web.\n\n- **`<?php ... ?>`** — PHP code goes inside these tags; they can be embedded anywhere in HTML\n- **Variables** — always start with `$`: `$name = \"Alice\";` — no type declaration needed\n- **`echo`** — outputs content to the page; `print` is similar but slightly slower\n- **String concatenation** — use `.` (dot): `$greeting = \"Hello, \" . $name;`\n- **`var_dump($var)`** — shows a variable's type and value; essential for debugging\n- **`<?= $name ?>`** — shorthand for `<?php echo $name; ?>` — common in HTML templates\n- Run scripts with `php filename.php` or start a server with `php -S localhost:8000`",
      codeExample: `<?php
// Variables — always start with $
$name = "Alice";
$age = 25;
$price = 9.99;
$isActive = true;

echo "Hello, " . $name . "!\n";
echo "Age: $age\n";    // Variables expand inside double-quoted strings
echo "Price: $price\n";

// var_dump shows type and value — great for debugging
var_dump($isActive);   // bool(true)
var_dump($age);        // int(25)

// String interpolation
echo "Name: {$name}, Age: {$age}\n";`,
      task: "Create a PHP script that declares variables for a product name, unit price, quantity, and a tax rate (e.g. 0.08 for 8%). Calculate the subtotal, tax amount, and total price. Echo a formatted receipt: 'Item: [name] | Qty: [qty] | Subtotal: $[subtotal] | Tax: $[tax] | Total: $[total]'. Use `number_format($value, 2)` to format dollar amounts.",
      hint: "Run your script from the command line with `php filename.php`, or place it in your web server's public folder and access it via `http://localhost:8000/filename.php`. Variables inside double-quoted strings are automatically replaced with their values.",
    },
    2: {
      explanation: "PHP's string functions and type system have some important quirks to know.\n\n- **Type juggling** — `'5' + 3` gives `8`; PHP converts the string to a number automatically\n- **`===`** — strict comparison checking both value AND type; always prefer over `==`\n- **`strlen()`** — string length; **`trim()`** — removes whitespace from both ends\n- **`strtoupper()` / `strtolower()`** — change case; **`str_replace(search, replace, str)`** — replaces text\n- **`strpos(str, needle)`** — returns position (which could be `0`!) or `false`; use `!== false` to check\n- **`substr(str, start, length)`** — extracts part of a string\n- **`sprintf()`** — formatted strings: `sprintf(\"%.2f\", 3.14159)` → `\"3.14\"`",
      codeExample: `<?php
// Arithmetic
$a = 10;
$b = 3;
echo $a / $b . "\n";    // 3.333...
echo intdiv($a, $b) . "\n";  // 3 (integer division)
echo $a % $b . "\n";    // 1 (modulo)

// String functions
$str = "  Hello, PHP World!  ";
echo strlen(trim($str)) . "\n";          // 18
echo strtoupper($str) . "\n";
echo str_replace("World", "PHP", $str);  // replaces first occurrence

// sprintf for formatting
$item = "Coffee";
$price = 3.75;
$qty = 4;
echo sprintf("%-10s x%d = $%.2f\n", $item, $qty, $price * $qty);

// strpos
$pos = strpos("Hello World", "World");
if ($pos !== false) {
    echo "Found at position: $pos\n";
}`,
      task: "Write a PHP script that reads a full name string like 'Alice Marie Smith'. Use `explode(' ', $name)` to split it into parts. Print the first name, last name, number of name parts, and the initials (first letter of each part joined with dots, e.g. 'A.M.S.'). Handle names with any number of parts.",
      hint: "After `explode`, you get an array. `$parts[0]` is the first element, `end($parts)` is the last. For initials, loop over the parts and use `substr($part, 0, 1)` to get the first character. `implode('.', $initials)` joins the array back into a string.",
    },
    3: {
      explanation: "PHP arrays are incredibly flexible — they work as lists, dictionaries, and everything in between.\n\n- **Indexed array** — `$fruits = [\"apple\", \"banana\"];` — add with `$fruits[] = \"cherry\";`\n- **Associative array** — `$person = [\"name\" => \"Alice\", \"age\" => 25];` — string keys\n- **`foreach ($array as $key => $value)`** — iterates any array; use `$value` alone if you don't need the key\n- **`count($array)`** — number of elements; **`in_array($val, $arr)`** — checks if a value exists\n- **`array_map(fn, $arr)`** — transforms every element; **`array_filter($arr, fn)`** — keeps matching elements\n- **`usort($arr, fn)`** — sorts by a custom comparison function\n- **`print_r($arr)`** — human-readable array dump for debugging; `var_dump` shows types too",
      codeExample: `<?php
// Indexed array
$fruits = ["apple", "banana", "cherry"];
$fruits[] = "date";   // append
echo count($fruits) . " fruits\n";

// Associative array
$person = [
    "name"  => "Alice",
    "age"   => 25,
    "email" => "alice@example.com"
];

foreach ($person as $key => $value) {
    echo "$key: $value\n";
}

// Array of arrays (2D)
$students = [
    ["name" => "Alice", "score" => 88],
    ["name" => "Bob",   "score" => 72],
    ["name" => "Carol", "score" => 95],
];

// Sort by score descending
usort($students, fn($a, $b) => $b["score"] - $a["score"]);

foreach ($students as $s) {
    echo "{$s['name']}: {$s['score']}\n";
}

// array_filter and array_map
$numbers = range(1, 10);
$evens   = array_filter($numbers, fn($n) => $n % 2 === 0);
$squared = array_map(fn($n) => $n ** 2, $evens);
print_r($squared);`,
      task: "Build a simple grade book using a 2D associative array. Store at least 5 students, each with a name and three test scores. Calculate each student's average and letter grade. Sort the students by average score (highest first) and print a formatted table with name, individual scores, average, and letter grade.",
      hint: "Calculate the average with `array_sum($scores) / count($scores)`. Use `usort()` with a comparison function to sort the 2D array. `printf('%-10s %5.1f  %s\\n', $name, $avg, $grade)` gives nicely aligned columns.",
    },
    4: {
      explanation: "Functions and form handling are where PHP's server-side power really shows.\n\n- **Functions** — `function name(type $param = default): returnType { }` — type hints are optional but recommended\n- **`$_POST` / `$_GET`** — superglobals holding form data sent via POST or GET\n- **`$_SERVER[\"REQUEST_METHOD\"]`** — check if a form was submitted: `=== \"POST\"`\n- **`htmlspecialchars($str)`** — escapes `<`, `>`, `&`, `\"` to prevent XSS attacks; always use on output\n- **`filter_var($email, FILTER_VALIDATE_EMAIL)`** — validates email format\n- **`trim()` + empty check** — `if (empty(trim($_POST[\"name\"])))` — validate required fields\n- **`null` coalescing** — `$_POST[\"field\"] ?? \"\"` — safe default if the key doesn't exist",
      codeExample: `<?php
// Functions
function celsiusToFahrenheit(float $c): float {
    return $c * 9/5 + 32;
}

function clamp(float $value, float $min, float $max): float {
    return max($min, min($max, $value));
}

echo celsiusToFahrenheit(100) . "°F\n";  // 212°F
echo clamp(150, 0, 100) . "\n";          // 100

// Simple form handler
// Save as form.php in your web server root
?>
<!DOCTYPE html>
<html>
<body>
<form method="POST" action="">
    <input type="text"   name="username" placeholder="Username">
    <input type="number" name="age"      placeholder="Age">
    <button type="submit">Submit</button>
</form>

<?php
if ($_SERVER["REQUEST_METHOD"] === "POST") {
    $username = htmlspecialchars(trim($_POST["username"] ?? ""));
    $age      = (int)($_POST["age"] ?? 0);

    if ($username && $age > 0) {
        echo "<p>Hello, {$username}! You are {$age} years old.</p>";
    } else {
        echo "<p style='color:red'>Please fill in all fields.</p>";
    }
}
?>
</body>
</html>`,
      task: "Build a temperature converter web page. The form should let the user enter a temperature and choose between Celsius, Fahrenheit, and Kelvin as the input unit. On submission, calculate and display the temperature in all three units. Validate that the input is a valid number and that Kelvin is not below absolute zero (−273.15°C).",
      hint: "Process the form when `$_SERVER['REQUEST_METHOD'] === 'POST'`. Use `is_numeric($_POST['temp'])` to validate. Conversion formulas: °C to °F: `(c * 9/5) + 32`; °C to K: `c + 273.15`. Convert everything to Celsius first, then to the other units.",
    },
    5: {
      explanation: "You know the complete PHP foundation — now build a full request-response cycle.\n\n- **Collect → Validate → Process** — the fundamental pattern of every PHP web application\n- **Sticky forms** — repopulate inputs with `value=\"<?= htmlspecialchars($formData['name']) ?>\"` on validation failure\n- **Error arrays** — `$errors[\"email\"] = \"Invalid email\"` — build an array of errors, display them next to inputs\n- **`preg_match(pattern, str)`** — regex validation: `preg_match('/^[0-9+\s\-()]+$/', $phone)`\n- **`mail($to, $subject, $body, $headers)`** — sends email; use PHPMailer in production\n- **Separation of logic and view** — process the form at the top of the file, render the HTML at the bottom\n- **`isset()` vs `empty()`** — `isset` checks existence; `empty` checks for falsy values including `\"\"` and `0`",
      codeExample: `<?php
$errors = [];
$success = false;
$formData = ["name" => "", "email" => "", "subject" => "", "message" => ""];

if ($_SERVER["REQUEST_METHOD"] === "POST") {
    $formData["name"]    = trim($_POST["name"]    ?? "");
    $formData["email"]   = trim($_POST["email"]   ?? "");
    $formData["subject"] = trim($_POST["subject"] ?? "");
    $formData["message"] = trim($_POST["message"] ?? "");

    if (empty($formData["name"]))
        $errors["name"] = "Name is required.";
    if (!filter_var($formData["email"], FILTER_VALIDATE_EMAIL))
        $errors["email"] = "A valid email address is required.";
    if (strlen($formData["subject"]) < 5)
        $errors["subject"] = "Subject must be at least 5 characters.";
    if (strlen($formData["message"]) < 20)
        $errors["message"] = "Message must be at least 20 characters.";

    if (empty($errors)) {
        // In production: mail($to, $subject, $message, $headers);
        $success = true;
    }
}

function field(string $key, array $data, array $errors): string {
    $val = htmlspecialchars($data[$key]);
    $err = $errors[$key] ?? "";
    $errHtml = $err ? "<span style='color:red'> $err</span>" : "";
    return $val . $errHtml;
}
?>
<!DOCTYPE html>
<html><body>
<?php if ($success): ?>
    <p style="color:green">Message sent! Thank you.</p>
<?php else: ?>
<form method="POST">
    <p>Name: <input name="name" value="<?= htmlspecialchars($formData['name']) ?>">
       <?= isset($errors['name']) ? "<span style='color:red'>{$errors['name']}</span>" : "" ?></p>
    <p>Email: <input name="email" value="<?= htmlspecialchars($formData['email']) ?>">
       <?= isset($errors['email']) ? "<span style='color:red'>{$errors['email']}</span>" : "" ?></p>
    <p>Subject: <input name="subject" value="<?= htmlspecialchars($formData['subject']) ?>"></p>
    <p>Message:<br><textarea name="message" rows="5"><?= htmlspecialchars($formData['message']) ?></textarea></p>
    <button>Send</button>
</form>
<?php endif; ?>
</body></html>`,
      task: "Extend the contact form: (1) add a phone number field with regex validation (numbers, spaces, dashes, and brackets allowed); (2) add a dropdown for inquiry type (Support, Sales, General); (3) add a checkbox for 'I agree to the terms' — make it required; (4) on success, show a summary of what was submitted; (5) limit the message length to 500 characters and show a character counter. Keep previously entered values pre-filled when validation fails.",
      hint: "For phone validation use `preg_match('/^[0-9\\s\\-\\(\\)\\+]+$/', $phone)`. For character counting without JavaScript, just show `strlen($message) . '/500 chars' after the textarea and validate with `strlen($message) <= 500`.",
    },
  },

  // ──────────────────────────────────────────────────────────
  // GO
  // ──────────────────────────────────────────────────────────
  go: {
    1: {
      explanation: "Go is a compiled, statically typed language designed for simplicity and speed.\n\n- **`package main`** — every runnable Go file belongs to `main`; execution starts in `main()`\n- **`import \"fmt\"`** — imports the format package; use `import (\"fmt\" \"math\")` for multiple\n- **`fmt.Println()`** — prints with a newline; `fmt.Printf(\"Name: %s\n\", name)` for formatting\n- **`:=` short declaration** — `name := \"Alice\"` — infers the type; most common syntax\n- **`var name type`** — explicit declaration: `var count int = 0`\n- **No semicolons** — Go's compiler inserts them; never write them yourself\n- Run with `go run main.go`; build a binary with `go build -o myapp`",
      codeExample: `package main

import "fmt"

func main() {
    // Long form declaration
    var name string = "Alice"
    var age int = 25

    // Short declaration (type inferred) — most common
    city := "London"
    salary := 75000.50
    isEmployed := true

    fmt.Println("Name:", name)
    fmt.Println("Age:", age)
    fmt.Printf("City: %s, Salary: $%.2f\\n", city, salary)
    fmt.Println("Employed:", isEmployed)

    // Multiple assignment
    x, y := 10, 20
    fmt.Printf("x=%d, y=%d, sum=%d\\n", x, y, x+y)
}`,
      task: "Write a Go program that declares variables for a rectangle's width and height (use `float64`). Calculate the area, perimeter, and diagonal (using `math.Sqrt` from the `math` package). Print the results formatted to 2 decimal places. Build with `go run main.go`.",
      hint: "Import multiple packages with `import (\"fmt\" \"math\")`. The diagonal of a rectangle is `math.Sqrt(width*width + height*height)`. Use `fmt.Printf(\"Diagonal: %.2f\\n\", diagonal)` for 2 decimal places.",
    },
    2: {
      explanation: "Go's string functions and explicit error handling are two of its most distinctive features.\n\n- **`strings` package** — `strings.ToUpper()`, `strings.TrimSpace()`, `strings.Contains()`, `strings.Split()`, `strings.Fields()`\n- **`strconv.Atoi(str)`** — converts string to int; returns `(int, error)`\n- **Explicit errors** — Go functions return `(result, error)` pairs; always check `if err != nil`\n- **`fmt.Errorf(\"message: %v\", err)`** — creates a new error with context\n- **`fmt.Scanf(\"%s\", &variable)`** — reads input from stdin; the `&` is required (pass by pointer)\n- **`strings.Fields(str)`** — splits on any whitespace (better than `strings.Split(str, \" \")` for sentences)\n- **`fmt.Sprintf()`** — builds a formatted string without printing it",
      codeExample: `package main

import (
    "fmt"
    "strings"
    "strconv"
)

func main() {
    // String operations
    sentence := "  the quick brown fox  "
    cleaned := strings.TrimSpace(sentence)
    upper := strings.ToUpper(cleaned)
    words := strings.Split(cleaned, " ")

    fmt.Println(upper)
    fmt.Printf("Word count: %d\\n", len(words))

    // strconv: string to number
    numStr := "42"
    num, err := strconv.Atoi(numStr)
    if err != nil {
        fmt.Println("Conversion error:", err)
        return
    }
    fmt.Printf("Number: %d, doubled: %d\\n", num, num*2)

    // fmt.Scanf to read input
    var firstName, lastName string
    fmt.Print("Enter first and last name: ")
    fmt.Scanf("%s %s", &firstName, &lastName)
    fmt.Printf("Hello, %s %s!\\n", firstName, lastName)
}`,
      task: "Write a program that reads a sentence from the user and produces a word frequency report. Count how many times each word appears (case-insensitive). Print the results sorted by frequency (highest first). Use `strings.Fields()` to split on any whitespace, `strings.ToLower()` for case-insensitivity, and a `map[string]int` to count.",
      hint: "Use a `map[string]int` and increment `wordCount[word]++` for each word. To sort by frequency, convert the map to a slice of structs, then use `sort.Slice()` with a comparison function. Import `sort`.",
    },
    3: {
      explanation: "Go uses a single `for` keyword for all loops, and slices and maps for collections.\n\n- **`for condition { }`** — equivalent to a while loop (Go has no `while` keyword)\n- **`for i, v := range slice`** — iterates with both index and value; use `_` to ignore either\n- **Slices** `[]Type` — dynamic arrays; always reassign after append: `s = append(s, item)`\n- **Maps** `map[string]int` — key-value store; create with `make(map[string]int)`\n- **`value, ok := m[key]`** — two-value lookup: `ok` is `false` if the key doesn't exist\n- **`switch`** — no `break` needed; cases don't fall through by default\n- **`range` on a map** — `for key, value := range m { }` — order is random each run",
      codeExample: `package main

import "fmt"

func main() {
    // Slice operations
    nums := []int{5, 2, 8, 1, 9, 3, 7}
    nums = append(nums, 4, 6)

    sum := 0
    for _, n := range nums {
        sum += n
    }
    fmt.Printf("Count: %d, Sum: %d, Avg: %.1f\\n",
        len(nums), sum, float64(sum)/float64(len(nums)))

    // Map: word count
    text := "go is great go is fast go is simple"
    count := make(map[string]int)
    for _, word := range strings.Fields(text) {
        count[word]++
    }
    for word, n := range count {
        fmt.Printf("%s: %d\\n", word, n)
    }

    // Switch
    day := 3
    switch day {
    case 1, 2, 3, 4, 5:
        fmt.Println("Weekday")
    case 6, 7:
        fmt.Println("Weekend")
    default:
        fmt.Println("Invalid")
    }
}`,
      task: "Write a Go program that generates the first 20 Fibonacci numbers, stores them in a slice, and prints them. Then write a function `isPrime(n int) bool` and use it to print all prime numbers from 2 to 100. Finally, create a map where each key is a prime number and the value is a string representation like 'prime'.",
      hint: "For Fibonacci, start with `fibs := []int{0, 1}` and loop, computing `fibs[i] = fibs[i-1] + fibs[i-2]`. For `isPrime`, iterate from 2 to `int(math.Sqrt(float64(n)))` checking for divisibility.",
    },
    4: {
      explanation: "Go's structs, methods, and interfaces are the foundation of well-organised Go code.\n\n- **Multiple return values** — `func divide(a, b float64) (float64, error)` — idiomatic Go error handling\n- **Structs** — `type Circle struct { X, Y, Radius float64 }` — groups related data\n- **Methods** — `func (c Circle) Area() float64 { }` — a function bound to a type via a receiver\n- **Pointer receiver** `*T` — allows the method to modify the struct's fields; value receivers get a copy\n- **Interfaces** — `type Shape interface { Area() float64 }` — any type with `Area()` satisfies it automatically\n- **Implicit satisfaction** — Go interfaces require no `implements` keyword; it is structural and automatic\n- **`fmt.Stringer`** — implement `String() string` and `fmt.Println(obj)` calls it automatically",
      codeExample: `package main

import (
    "fmt"
    "math"
)

// Struct with methods
type Circle struct {
    X, Y   float64 // centre
    Radius float64
}

func (c Circle) Area() float64 {
    return math.Pi * c.Radius * c.Radius
}

func (c *Circle) Scale(factor float64) {
    c.Radius *= factor
}

// Interface — satisfied by any type with Area() float64
type Shape interface {
    Area() float64
}

type Rectangle struct{ Width, Height float64 }

func (r Rectangle) Area() float64 { return r.Width * r.Height }

func printArea(s Shape) {
    fmt.Printf("Area: %.2f\\n", s.Area())
}

// Multiple return values + error
func divide(a, b float64) (float64, error) {
    if b == 0 {
        return 0, fmt.Errorf("cannot divide by zero")
    }
    return a / b, nil
}

func main() {
    c := Circle{Radius: 5}
    c.Scale(2)
    printArea(c)
    printArea(Rectangle{3, 4})

    result, err := divide(10, 3)
    if err != nil {
        fmt.Println("Error:", err)
    } else {
        fmt.Printf("Result: %.4f\\n", result)
    }
}`,
      task: "Define a `BankAccount` struct with fields Owner, Balance, and a transaction history (slice of floats). Add methods: `Deposit(amount float64) error`, `Withdraw(amount float64) error` (error if insufficient funds), `Balance() float64`, and `History() []float64`. Implement a `Stringer` interface (a `String() string` method) so `fmt.Println(account)` prints a nice summary. Create two accounts and simulate several transactions.",
      hint: "To implement the `fmt.Stringer` interface, add a method `func (a BankAccount) String() string` — then `fmt.Println(a)` will call it automatically. For errors, use `fmt.Errorf('insufficient funds: have %.2f, need %.2f', a.balance, amount)`.",
    },
    5: {
      explanation: "You know the complete Go foundation — now build a real CLI tool with file persistence.\n\n- **`encoding/json`** — `json.Marshal()` serialises to JSON bytes; `json.Unmarshal()` parses JSON\n- **`json:\"field_name\"` struct tags** — control how fields are named in the JSON output\n- **`os.ReadFile()` / `os.WriteFile()`** — read and write files; always handle the returned `error`\n- **`os.Args`** — a slice of command-line arguments: `os.Args[0]` is the program name, `os.Args[1]` is the first arg\n- **`os.IsNotExist(err)`** — check if a file-not-found error; return empty data on first run\n- **`time.Now()` / `time.Time`** — use for timestamps; marshals to RFC3339 format in JSON automatically\n- **Build and run** — `go build -o tasks && ./tasks add \"Learn Go\"` — the Go way",
      codeExample: `package main

import (
    "encoding/json"
    "fmt"
    "os"
    "time"
)

type Task struct {
    ID        int       \`json:"id"\`
    Title     string    \`json:"title"\`
    Done      bool      \`json:"done"\`
    CreatedAt time.Time \`json:"created_at"\`
}

const dbFile = "tasks.json"

func loadTasks() ([]Task, error) {
    data, err := os.ReadFile(dbFile)
    if os.IsNotExist(err) {
        return []Task{}, nil
    }
    if err != nil {
        return nil, err
    }
    var tasks []Task
    return tasks, json.Unmarshal(data, &tasks)
}

func saveTasks(tasks []Task) error {
    data, err := json.MarshalIndent(tasks, "", "  ")
    if err != nil {
        return err
    }
    return os.WriteFile(dbFile, data, 0644)
}

func main() {
    tasks, _ := loadTasks()
    if len(os.Args) < 2 {
        fmt.Println("Usage: tasks [add|done|list] [args...]")
        return
    }
    switch os.Args[1] {
    case "add":
        if len(os.Args) < 3 {
            fmt.Println("Usage: tasks add <title>")
            return
        }
        nextID := len(tasks) + 1
        tasks = append(tasks, Task{nextID, os.Args[2], false, time.Now()})
        saveTasks(tasks)
        fmt.Printf("Added task #%d: %s\\n", nextID, os.Args[2])
    case "list":
        for _, t := range tasks {
            status := "[ ]"
            if t.Done { status = "[x]" }
            fmt.Printf("%s %d. %s\\n", status, t.ID, t.Title)
        }
    case "done":
        // TODO: implement as the task challenge
    }
}`,
      task: "Complete and extend the task manager: (1) implement the `done` command that marks a task complete by ID (`tasks done 2`); (2) add a `delete` command; (3) add a `clear` command that removes all completed tasks; (4) add a `stats` command showing total, completed, and pending counts; (5) add a `--priority` flag to the `add` command using the `flag` package. Build with `go build -o tasks` and run the binary.",
      hint: "For the `done` command, find the task with matching ID using a range loop, set `tasks[i].Done = true`, then call `saveTasks`. For `os.Args` parsing with flags, look at the `flag` package's `flag.NewFlagSet` for subcommand-style flags.",
    },
  },

  // ──────────────────────────────────────────────────────────
  // RUBY
  // ──────────────────────────────────────────────────────────
  ruby: {
    1: {
      explanation: "Ruby is an expressive language built around the principle of programmer happiness.\n\n- **Everything is an object** — even `42.class` returns `Integer` and `true.class` returns `TrueClass`\n- **`puts`** — prints with a newline; **`print`** — prints without one; **`p`** — prints and returns the value (debugging)\n- **Variables** — created on first assignment: `name = \"Alice\"` — no declaration keyword needed\n- **String interpolation** — double quotes only: `\"Hello, #{name}!\"` — single quotes are literal\n- **`nil`** — Ruby's null value; any method call on `nil` raises a `NoMethodError`\n- **`snake_case`** — the Ruby convention for variable and method names\n- Run scripts with `ruby filename.rb`; use `irb` for an interactive Ruby console",
      codeExample: `# Variables and output
name = "Alice"
age = 25
height = 1.72
is_student = true

puts "Name: #{name}"
puts "Age: #{age}"
puts "Height: #{height}m"
puts "Student: #{is_student}"

# Everything is an object — call methods directly on values
puts 42.class          # Integer
puts "hello".class     # String
puts true.class        # TrueClass
puts 3.14.round(1)     # 3.1

# String interpolation
puts "Hello, #{name}! You are #{age} years old."
puts "Next year you will be #{age + 1}."`,
      task: "Create Ruby variables for your name, birth year, favourite colour, and a hobby. Use string interpolation to print a sentence: 'My name is [name], I was born in [year], I love [colour] things, and I enjoy [hobby].' Then calculate and print your approximate age using `Time.now.year - birth_year`.",
      hint: "In Ruby, you access the current year with `Time.now.year`. You can call `.to_s` on any object to get its string representation, but inside `#{}` interpolation Ruby calls `.to_s` automatically.",
    },
    2: {
      explanation: "Ruby's string and number methods are called directly on values — no helper functions needed.\n\n- **String methods** — `.length`, `.upcase`, `.downcase`, `.reverse`, `.strip`, `.split(sep)`\n- **`.include?(str)`** — returns `true` if the string contains `str`; **`.gsub(pattern, replace)`** — replaces all occurrences\n- **`?` convention** — methods ending in `?` return a boolean: `.even?`, `.nil?`, `.empty?`, `.include?`\n- **`!` convention** — methods ending in `!` modify in place: `str.upcase!` changes `str` itself\n- **`**` operator** — exponentiation: `2 ** 10` → `1024`\n- **`.to_i` / `.to_f` / `.to_s`** — convert between Integer, Float, and String\n- **Number methods** — `.abs`, `.round(n)`, `.ceil`, `.floor` — called directly on the number",
      codeExample: `# String methods
sentence = "  The quick brown fox jumps over the lazy dog  "
puts sentence.strip
puts sentence.strip.split.length       # word count = 9
puts sentence.include?("fox")          # true
puts sentence.upcase
puts sentence.strip.gsub("the", "a")   # case-sensitive replace
puts sentence.strip.gsub(/the/i, "a")  # case-insensitive with regex

# Numbers
puts 2 ** 10           # 1024
puts -42.abs           # 42
puts 7.even?           # false
puts 8.odd?            # false
puts 3.14.ceil         # 4
puts 3.14.floor        # 3
puts 3.14159.round(2)  # 3.14

# Type conversion
puts "42".to_i + 8     # 50
puts "3.14".to_f * 2   # 6.28`,
      task: "Write a Ruby program that takes a sentence (hard-code it as a string) and: counts the words; counts the characters (excluding spaces); finds the longest word using `.max_by`; reverses each word but keeps word order; checks if the sentence is a pangram (contains all 26 letters). Print each result on its own line.",
      hint: "For a pangram check: `('a'..'z').all? { |c| sentence.downcase.include?(c) }`. The range `('a'..'z')` iterates over lowercase letters. `.max_by { |w| w.length }` finds the longest word from an array.",
    },
    3: {
      explanation: "Ruby's iterators replace traditional loops with expressive, chainable methods.\n\n- **`if` / `elsif` / `else`** — standard conditional; `unless condition` is the readable opposite of `if !condition`\n- **`case / when`** — pattern matching: `when 90..100 then \"A\"` — ranges work as conditions\n- **`.each { |item| }`** — iterates; prefer over `for` loops in Ruby\n- **`.map { |item| }`** — returns a new array with each element transformed\n- **`.select { |item| }`** — keeps only elements where the block returns `true`; `.reject` is the opposite\n- **`.reduce(0) { |sum, n| sum + n }`** — accumulates a single value from the array\n- **Blocks** — code between `{ }` or `do...end` passed to a method; the core of Ruby's iterator design",
      codeExample: `# Conditional
score = 85
grade = case score
        when 90..100 then "A"
        when 80..89  then "B"
        when 70..79  then "C"
        when 60..69  then "D"
        else              "F"
        end
puts "Grade: #{grade}"

# Array iterators — the Ruby way
numbers = (1..10).to_a
evens   = numbers.select(&:even?)
doubled = evens.map { |n| n * 2 }
total   = doubled.reduce(0, :+)
puts "Evens doubled and summed: #{total}"

# Each with index
fruits = %w[apple banana cherry date]
fruits.each_with_index do |fruit, i|
    puts "#{i + 1}. #{fruit.capitalize}"
end

# FizzBuzz — the Ruby way
(1..20).each do |n|
    puts if   n % 15 == 0 then "FizzBuzz"
         elsif n % 3  == 0 then "Fizz"
         elsif n % 5  == 0 then "Buzz"
         else                    n
         end
end`,
      task: "Write a Ruby program to analyse an array of at least 10 integers. Without using built-in `.min`, `.max`, or `.sum` methods, compute: the minimum, maximum, sum, and average using `.reduce`. Then use `.select`, `.reject`, `.map`, and `.count` to: find all numbers divisible by 3; find all numbers NOT divisible by 3; square each number; count how many are greater than the average.",
      hint: "Use `reduce(:+)` for sum, `reduce { |min, n| n < min ? n : min }` for minimum. For the average, divide by `array.length.to_f` to avoid integer division. Chain methods: `numbers.select { |n| n % 3 == 0 }` filters in, `.reject` filters out.",
    },
    4: {
      explanation: "Ruby classes, methods, and hashes are the building blocks of every Ruby application.\n\n- **`def method_name(params)` ... `end`** — defines a method; the last expression is the return value\n- **`attr_accessor :field`** — generates both getter and setter; `attr_reader` for read-only, `attr_writer` for write-only\n- **`initialize`** — the constructor, called when you do `MyClass.new(...)`\n- **Instance variables** — `@name` — belong to the object; accessible in any method of the class\n- **Hashes** — symbol keys: `{ name: \"Alice\" }`; string keys: `{ \"name\" => \"Alice\" }`\n- **Hash methods** — `.keys`, `.values`, `.each { |k, v| }`, `.merge(other)`, `.select { |k, v| }`\n- **Method chaining** — `acc.deposit(500).withdraw(200)` — possible when methods return `self`",
      codeExample: `# Class with attr_accessor
class BankAccount
  attr_reader :owner, :balance

  def initialize(owner, initial_balance = 0)
    @owner   = owner
    @balance = initial_balance.to_f
    @history = []
  end

  def deposit(amount)
    raise ArgumentError, "Amount must be positive" unless amount > 0
    @balance += amount
    @history << { type: :deposit, amount: amount }
    self
  end

  def withdraw(amount)
    raise "Insufficient funds" if amount > @balance
    @balance -= amount
    @history << { type: :withdrawal, amount: amount }
    self
  end

  def statement
    puts "Account: #{@owner} | Balance: $#{'%.2f' % @balance}"
    @history.each do |tx|
      puts "  #{tx[:type].to_s.capitalize}: $#{'%.2f' % tx[:amount]}"
    end
  end
end

acc = BankAccount.new("Alice", 1000)
acc.deposit(500).deposit(200).withdraw(150)  # method chaining
acc.statement`,
      task: "Create a `Library` class that manages a collection of books. Each book is a hash with keys `:title`, `:author`, `:year`, `:checked_out`. The Library should have methods: `add_book(title, author, year)`, `checkout(title)` (sets checked_out to true, raises if already out), `return_book(title)`, `available_books` (returns array of available book hashes), `books_by_author(author)`, and `to_s` for a formatted listing. Create a library, add at least 5 books, and test all methods.",
      hint: "Store books as an array of hashes: `@books = []`. For finding a book by title: `@books.find { |b| b[:title] == title }`. Use `raise 'Book is already checked out'` for validation. `attr_reader :books` lets you access the internal array from outside.",
    },
    5: {
      explanation: "You know the complete Ruby foundation — now build something that brings it all together.\n\n- **Class composition** — a `Room` contains a hash of exits and an array of items; a `Player` has a location and inventory\n- **`attr_reader`** — expose data read-only; use `attr_accessor` only where write access is needed\n- **`raise \"message\"`** — throws an error; `rescue => e` catches it\n- **`gets.chomp`** — reads a line from the user, removing the trailing newline\n- **`loop do ... break end`** — Ruby's idiomatic infinite loop with a clean exit\n- **`hash[key]`** — lookup in a hash; returns `nil` if the key doesn't exist\n- **Extend incrementally** — start with one room and one command; add complexity step by step",
      codeExample: `# Simple text adventure
class Room
  attr_reader :name, :description, :exits, :items

  def initialize(name, description)
    @name = name
    @description = description
    @exits = {}
    @items = []
  end

  def add_exit(direction, room)
    @exits[direction] = room
  end

  def add_item(item)
    @items << item
  end

  def describe
    puts "\\n=== #{@name} ==="
    puts @description
    puts "Items here: #{@items.join(', ')}" unless @items.empty?
    puts "Exits: #{@exits.keys.join(', ')}"
  end
end

class Player
  attr_reader :name, :inventory, :location

  def initialize(name, starting_room)
    @name = name
    @location = starting_room
    @inventory = []
  end

  def move(direction)
    if @location.exits[direction]
      @location = @location.exits[direction]
      true
    else
      puts "You can't go that way."
      false
    end
  end

  def pick_up(item)
    if @location.items.include?(item)
      @inventory << @location.items.delete(item)
      puts "You picked up: #{item}"
    else
      puts "There's no #{item} here."
    end
  end
end

# Build the world
entrance = Room.new("Entrance Hall", "A grand entrance with marble floors.")
library  = Room.new("Library",       "Walls lined with ancient books.")
garden   = Room.new("Garden",        "A peaceful garden with a fountain.")

entrance.add_exit("north", library)
entrance.add_exit("east",  garden)
library.add_exit("south",  entrance)
garden.add_exit("west",    entrance)

library.add_item("old key")
garden.add_item("golden coin")

player = Player.new("Hero", entrance)

# Game loop
puts "Welcome, #{player.name}! Type 'help' for commands."
loop do
  player.location.describe
  print "> "
  input = gets.chomp.downcase.split

  case input[0]
  when "go"    then player.move(input[1])
  when "take"  then player.pick_up(input[1..].join(" "))
  when "inv"   then puts "Inventory: #{player.inventory.join(', ').then { |s| s.empty? ? 'empty' : s }}"
  when "quit"  then puts "Goodbye!"; break
  when "help"  then puts "Commands: go [dir], take [item], inv, quit"
  else              puts "Unknown command."
  end
end`,
      task: "Extend the adventure game: (1) add at least 5 rooms connected in an interesting layout; (2) add a `locked_exit` feature where a door requires a specific item to pass (like the 'old key'); (3) add a `drop` command; (4) add a simple enemy encounter in one room — if the player has a 'sword' they win the fight, otherwise they lose health points (add a `health` attribute to Player); (5) add a win condition when the player collects all treasure items.",
      hint: "For locked exits, store them in a separate `@locked_exits` hash: `{ 'north' => 'old key' }`. Before moving, check if the direction is locked and whether the player has the required item in their inventory. Use `inventory.include?` for the check.",
    },
  },
};

// Lookup a static fundamentals lesson by language and level.
// Returns null if not found (topic is not a fundamentals course for that language).
export function getFundamentalsLesson(
  language: string,
  topic: string,
  level: number,
): StaticLesson | null {
  const langKey = language.toLowerCase().trim();
  const langLessons = FUNDAMENTALS_LESSONS[langKey];
  if (!langLessons) return null;

  // Fundamentals topic titles from the frontend:
  const fundamentalsTitles: Record<string, string> = {
    python:     "Python Fundamentals",
    javascript: "JavaScript Fundamentals",
    html:       "HTML Fundamentals",
    css:        "CSS Fundamentals",
    java:       "Java Fundamentals",
    "c++":      "C++ Fundamentals",
    typescript: "TypeScript Fundamentals",
    react:      "React Fundamentals",
    sql:        "SQL Fundamentals",
    php:        "PHP Fundamentals",
    go:         "Go Fundamentals",
    ruby:       "Ruby Fundamentals",
  };

  const expectedTitle = fundamentalsTitles[langKey];
  if (!expectedTitle) return null;

  // Case-insensitive match
  if (topic.trim().toLowerCase() !== expectedTitle.toLowerCase()) return null;

  return langLessons[level] ?? null;
}
