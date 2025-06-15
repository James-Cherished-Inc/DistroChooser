Hi, I'm James! I hope you're enjoying the tools I build.
I'm a solo dev and a new Linux fan.
If you find some value in the time, money and effort I've spent towards my vision, I'm glad. I'm driven by the idea of an equitable chance to anyone on Earth to freely pursue their dreams and fulfillment, for free. An Internet connection as the single requirement brings this truer and truer with each effort.
Linux contributes to this realization and I hope this can be a small gift to the community.

Why a Cherished-DistroChooser?

Arguably, choosing your Distro is one of the most fun thing about Linux. It's also one of the best way for newbies to learn about technicalities, a good reason to dive the rabbit hole and uncover its history. The existing distro chosers did not meet my needs, and I built this just for myself. A nice, filterable, exhaustive table allows me a tailored selection and quick glances to select the right choice for my different needs.

Linux Community is welcome to contribute. You can request or add a new distribution, correct mistakes or add relevant context/information for a data point, and even argue about calculation methods :) DM me on X or join the debate on Github.


----

Insecure Processing of Data
This category covers the following issues:

Cross-Site Scripting
Server-Side Request Forgery
Fixing Cross-Site Scripting
About XSS
Category-specific resources:

Encode JavaScript and delimit untrusted data
Cross-Site Scripting (Handlebars)
Rule-specific resources:

Handlebars.SafeString() API Reference
Option A: Don't use Handlebars.SafeString (Backend)
Using Handlebar's default behavior of treating the input as pure text is the safest way to fix this vulnerability.

Note that if you want HTML content to appear, you should look at option B and sanitize the user input.

Go through the issues that GuardRails identified, for a pattern similar to the following:

app.get("/render", function(req, res) {
    let template = Handlebars.compile('This is some bold text: <b>{{input}}</b>')
    // Insecure example
    let value = new Handlebars.SafeString(req.body.untrustedValue)

    res.set("Content-Type", "text/html")
    res.send(template({input: value}))
})

Remove Handlebars.SafeString

app.get("/render", function(req, res) {
    let template = Handlebars.compile('This is some bold text: <b>{{input}}</b>')
    // Secure example
    let value = req.body.untrustedValue

    res.set("Content-Type", "text/html")
    res.send(template({input: value}))
}) 

Test it

Ship it 🚢 and relax 🌴

Option B: Don't use Handlebars.SafeString (Frontend)
The safest way to fix this vulnerability is by using Handlebars' default behavior of treating any input as pure text.

Note that if you want HTML content to appear, you should look at option B and sanitize the user input.

Locate the vulnerable pattern (example below):

   function render() {
     let template = Handlebars.compile('This is some bold text: <b>{{input}}</b>')
     let request = fetch("http://example.com/example.txt")
       .then(body => body.text())
       .then(text => new Handlebars.SafeString(text))
       .then(sstring => template({input: sstring}));
   }

Replace it with one of the following patterns (example below):

Example #1

   function render() {
     let template = Handlebars.compile('This is some bold text: <b>{{input}}</b>')
     let request = fetch("http://example.com/example.txt")
       .then(body => body.text())
       .then(text => template({input: text}));
   }

Example #2

   function render() {
     let template = Handlebars.compile('This is some bold text: <b>{{input}}</b>')
     let request = fetch("http://example.com/example.txt")
       .then(body => body.text())
       .then(Handlebars.Utils.escapeExpression)
       .then(text => new Handlebars.SafeString(text))
       .then(text => template({input: text}));
   }

Test it

Ship it 🚢 and relax 🌴

Option B: Sanitize your input
This option should be used if you want some input to be interpreted as HTML content. You can use a sanitizer such as DOMPurify to make sure any HTML is sanitized before it is embedded into the DOM.

Some possible options for sanitizing HTML include:

The builtin Sanitizer.sanitize(...) and Sanitizer.sanitizeFor(...) experimental
The DOMPurify.sanitize(...) from the isomorphic-dompurify library
htmlSanitize(...) from the html-sanitize library
xss(...) from the xss library
Go through the issues that GuardRails identified, for a pattern similar to the following:

// Backend example
app.get("/render", function(req, res) {
    let template = Handlebars.compile('This is some bold text: <b>{{input}}</b>')
    // Insecure-example
    let value = new Handlebars.SafeString(req.body.untrustedValue)

    res.set("Content-Type", "text/html")
    res.send(template({input: value}))
})

// Frontend example
function render() {
  let template = Handlebars.compile('I want custom HTML: <b>{{input}}</b>')
  let request = fetch("http://example.com/example.txt")
     .then(body => body.text())
     .then(text => new Handlebars.SafeString(text))
     .then(sstring => template({input: sstring}));
}

Sanitize user input before passing it to Handlebars.SafeString

// Backend example
const DOMPurify = require('isomorphic-dompurify');

app.get("/render", function(req, res) {
    let template = Handlebars.compile('This is some bold text: <b>{{input}}</b>')
    // Secure examples
    let value = DOMPurify.sanitize(req.body.untrustedValue)
    value = new Handlebars.SafeString(value)

    res.set("Content-Type", "text/html")
    res.send(template({input: value}))
}) 

// Frontend example
function render() {
  let template = Handlebars.compile('I want custom HTML: <b>{{input}}</b>')
  let request = fetch("http://example.com/example.txt")
     .then(body => body.text())
     .then(DOMPurify.sanitize)
     .then(text => new Handlebars.SafeString(text))
     .then(sstring => template({input: sstring}));
}

Test it

Ship it 🚢 and relax 🌴

Cross-Site Scripting (Frontend)
Injecting unsanitized HTML from untrusted sources into the DOM without prior sanitization can lead to Cross-Site Scripting vulnerabilities.

Option A: Treat all data purely as text
The safest way to fix this kind of vulnerability is to simply use methods/properties that will treat all your data as text (not as HTML). These include:

document.createTextNode(<UNTRUSTED_INPUT>)
Node.textContent = <UNTRUSTED_INPUT>
Note that document.createTextNode(...) creates a Node object that can be used in the DOM whereas the other properties simply overwrite the content inside the selected element/node. selected.

Another option that you can use is innerText or outerText, note, however, that these elements are susceptible to forms of XSS

HTMLElement.innerText = <UNTRUSTED_INPUT>
HTMLElement.outerText = <UNSTRUSTED_INPUT>
Locate the vulnerable pattern (example below):

async function updateComment(id) {
   let data = await fetch(`api.example.com/v1/comments/${id}`);
   // Vunerable line of code here
   document.getElementById("comments").innerHTML = await data.text();
}

Replace it with one of the following patterns (example below):

Example #1 (using HTMLElement.textContent)

async function updateComment(id) {
   let data = await fetch(`api.example.com/v1/comments/${id}`);
   // Fixed
   document.getElementById("comments").textContent = await data.text();
}

Example #2 (using document.createTextNode(...)

async function updateComment(id) {
   let data = await fetch(`api.example.com/v1/comments/${id}`);
   // Fixed
   let node = document.createTextNode(await data.text());
   document.getElementById("comments").appendChild(node)
}

Test it

Ship it 🚢 and relax 🌴

Option B: Sanitize your HTML
This option should be used if you want some input to be interpreted as HTML content. You can use a sanitizer such as DOMPurify to make sure any HTML is sanitized before it is embedded into the DOM.

Some possible options for sanitizing HTML include:

the builtin Element.setHTML(...) experimental
the builtin Sanitizer.sanitize(...) and Sanitizer.sanitizeFor(...) experimental
the DOMPurify.sanitize(...) from the DOMPurify library
htmlSanitize(...) from the html-sanitize library
xss(...) from the xss library
Locate the vulnerable pattern (example below):

async function updateComment(id) {
   let data = await fetch(`api.example.com/v1/comments/${id}`);
   // Vunerable line of code here
   document.getElementById("comments").innerHTML = await data.text();
}

Replace it with one of the following patterns (example below):

async function updateComment(id) {
   let data = await fetch(`api.example.com/v1/comments/${id}`);
   // Fixed
   document.getElementById("comments").innerHTML = DOMPurify.sanitize(await data.text());
}

Test it

Ship it 🚢 and relax 🌴

Cross-Site Scripting (React)
Inserting raw HTML via dangerouslySetInnerHTML can lead to Cross Site Scripting vulnerabilities.

Rule-specific references:

React dangerouslySetInnerHTML Reference
Option A: Don't use dangersouslySetInnerHTML
The safest way to fix this kind of vulnerability is to simply not use dangerouslySetInnerHTML. If you don't require your input to be able to customize HTML then you're fine.

Locate the vulnerable pattern (example below):

function Comment({username, message}) {
   let inner = `<b>${username}</b>: <span style='color: blue'>${message}</span>`
   return <div dangerouslySetInnerHTML={{__html: inner}}/> 
}

Replace it with a pattern similar to the one below:

function Comment({username, message}) {
   return (<div> 
            <b> {username} </b>
            <span style='color: blue'>{message}</span>
          </div>);
}

Test it

Ship it 🚢 and relax 🌴

Option B: Sanitize the user input
Some possible options for sanitizing HTML include:

the builtin Sanitizer.sanitize(...) and Sanitizer.sanitizeFor(...) experimental
the DOMPurify.sanitize(...) from the DOMPurify library
htmlSanitize(...) from the html-sanitize library
xss(...) from the xss library
Locate the vulnerable pattern (example below):

function Comment({username, message}) {
   let inner = `<b>${username}</b>: <span style='color: blue'>${message}</span>`
   return <div dangerouslySetInnerHTML={{__html: inner}}/> 
}

Replace it with one of the following patterns (example below):

import * as DOMPurify from 'isomorphic-dompurify';

function Comment({username, message}) {
   let inner = `<b>${username}</b>: <span style='color: blue'>${message}</span>`
   return <div dangerouslySetInnerHTML={{__html: DOMPurify.sanitize(inner)}}/> 
}

Test it

Ship it 🚢 and relax 🌴

Option C: Use a different form of customization
This option should be used if you want HTML content to be customized by your input. Instead of allowing input to use HTML for customization, you can switch to using something like react-markdown, and the input can be embedded through markdown (much safer).

Locate the vulnerable pattern (example below):

function Comment({username, message}) {
   let inner = `<b>${username}</b>: <span style='color: blue'>${message}</span>`
   return <div dangerouslySetInnerHTML={{__html: inner}}/> 
}

Replace it with one of the following patterns (example below):

import ReactMarkdown from 'react-markdown'

function Comment({username, message}) {
   return (<b>{username}:</b>
           <ReactMarkdown>{message}</ReactMarkdown>);
}

Test it

Ship it 🚢 and relax 🌴

Cross-Site Scripting (Generic)
Option A: Ensure Unescaped Variables are Safe
Go through the issues that GuardRails identified in the PR/MR

Identify the code with one of these patterns:

// Dust.js
{variable}
// Pug.js
!{variable}
// ECT templates
<% ... >
// EJT templates
<% ... >

And ensure that all of these unescaped variables don't contain any unsanitized user input

Test it, ship it 🚢 and relax 🌴

Option B: Ensure XSS Security Headers are enabled
Go through the issues that GuardRails identified in the PR/MR

Identify the code with one of these patterns:

// XSS Security Headers
lusca.xssProtection(false);
X-XSS-Protection = 0;

And ensure the headers are enabled. Note: It may be possible that this is handled on the load balancer or web server level

Test it, ship it 🚢 and relax 🌴

Option C: Ensure No User Input is Passed to res()
Go through the issues that GuardRails identified in the PR/MR

Identify the code with one of these patterns:

res.write(req.body.evil);
res.send();

And ensure that no user input is passed to these functions

Test it, ship it 🚢 and relax 🌴

Option D: Perform Output Encoding
Go through the issues that GuardRails identified in the PR/MR

Identify code that matches *.escapeMarkup = false:

var template: Object = new Object();
template.escapeMarkup = false;

And replace it with *.escapeMarkup = true,

template.escapeMarkup = true;

Setting escapeMarkup = false can be used with some template engines to disable escaping of HTML entities which could potentially lead to Cross-Site Scripting (XSS) vulnerabilities.

Identify code that matches any of the following patterns:

document.write(variable);
document.writeln(variable);
Element.innerHTML = variable;
Element.outerHTML = variable;
el.insertAdjacentHTML(variable);

For example:

var element: Element = document.getElementById("mydiv");
var content: String = "some content";
Element.innerHTML = content;

Ensure that the content is not coming from request parameters, and is sanitized and escaped before being passed to the affected method

Test it

Ship it 🚢 and relax 🌴

Fixing Server-Side Request Forgery
About SSRF
Option A: Ensure that User Controlled Data is Sanitized
Go through the issues that GuardRails identified in the PR/MR

Identify the code with one of these patterns:

request(req.body.evil);
request.get();
needle.get();

And replace any dynamic user input with either a list of allowed options that is referenced by a UUID, or alternatively, re-write the code to ensure no dangerous or unauthorized functionality can be triggered by users

Test it, ship it 🚢 and relax 🌴