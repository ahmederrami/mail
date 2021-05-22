document.addEventListener('DOMContentLoaded', function() {

  // Use buttons to toggle between views
  document.querySelector('#inbox').addEventListener('click', () => load_mailbox('inbox'));
  document.querySelector('#sent').addEventListener('click', () => load_mailbox('sent'));
  document.querySelector('#archived').addEventListener('click', () => load_mailbox('archive'));
  document.querySelector('#compose').addEventListener('click', compose_email);
  //Make json data if an email is composed
  document.querySelector('#compose-form').onsubmit = function(){
    fetch('/emails', {
      method: 'POST',
      body: JSON.stringify({
          recipients: document.querySelector('#compose-recipients').value,
          subject: document.querySelector('#compose-subject').value,
          body: document.querySelector('#compose-body').value,
      })
    })
    .then(response => response.json())
    .then(result => {
        // Print result
        console.log(result);
        load_mailbox('sent');
    });
    return false;
  };

  // By default, load the inbox
  load_mailbox('inbox');
});

function compose_email() {

  // Show compose view and hide other views
  document.querySelector('#emails-view').style.display = 'none';
  document.querySelector('#compose-view').style.display = 'block';

  // Clear out composition fields
  document.querySelector('#compose-recipients').value = '';
  document.querySelector('#compose-subject').value = '';
  document.querySelector('#compose-body').value = '';
}

function load_mailbox(mailbox) {
  
  // Show the mailbox and hide other views
  document.querySelector('#emails-view').style.display = 'block';
  document.querySelector('#compose-view').style.display = 'none';

  // Show the mailbox name
  document.querySelector('#emails-view').innerHTML = `<h3>${mailbox.charAt(0).toUpperCase() + mailbox.slice(1)}</h3>`;
  
  fetch(`/emails/${mailbox}`)
  .then(response => response.json())
  .then(emails => {
      // Print result
      //document.querySelector('#emails-view').innerHTML = emails;
      toHtmlTable(emails);
  });
  
}

function load_mail(email_id){
  // Show the mailbox and hide other views
  document.querySelector('#emails-view').style.display = 'block';
  document.querySelector('#compose-view').style.display = 'none';

  // Show the container
  document.querySelector('#emails-view').innerHTML = ``;
  
  fetch(`/emails/${email_id}`)
  .then(response => response.json())
  .then(email => {
      // Print result : sender, recipients, subject, timestamp, and body.
      div=document.querySelector('#emails-view');
      sender=document.createElement('P'); sender.innerHTML=`<b>From</b> : ${email.sender}`; div.appendChild(sender);
      recipients=document.createElement('P'); recipients.innerHTML=`<b>To</b> : ${email.recipients}`; div.appendChild(recipients);
      subject=document.createElement('P'); subject.innerHTML=`<b>Subject</b> : ${email.subject}`; div.appendChild(subject);
      timestamp=document.createElement('P'); timestamp.innerHTML=`<b>Timestamp</b> : ${email.timestamp}`; div.appendChild(timestamp);
      button=document.createElement('button'); button.innerHTML='Reply'; button.setAttribute('class',"btn btn-sm btn-outline-primary"); button.onclick=function(){alert('test');}; div.appendChild(button);
      hr=document.createElement('hr'); div.appendChild(hr);
      body=document.createElement('P'); body.innerHTML=`${email.body}`; div.appendChild(body);
  });
}

function toHtmlTable(emails) {//https://developer.mozilla.org/en-US/docs/Web/API/Document_Object_Model/Traversing_an_HTML_table_with_JavaScript_and_DOM_Interfaces
  // get the reference for the body
  var mybody = document.querySelector('#emails-view');

  // creates <table> and <tbody> elements
  mytable = document.createElement("table");
  mytablebody = document.createElement("tbody");

  // creating all cells
  const n=emails.length;
  for(var j = 0; j < n; j++) {
      // creates a <tr> element
      mycurrent_row = document.createElement("tr");
      //<a href="#" id="sampleApp" onclick="myFunction(); return false;">Click Here</a>
      var a = document.createElement('a');
      a.href=`javascript:load_mail(${emails[j].id});`;
       
      var link = document.createTextNode("#");
      a.appendChild(link);

      link_cell = document.createElement("td");
      link_cell.appendChild(a);
      mycurrent_row.appendChild(link_cell);

      var values = [emails[j].sender,emails[j].recipients,emails[j].subject,emails[j].timestamp];
      for(var i = 0; i < values.length; i++) {
          // creates a <td> element
          mycurrent_cell = document.createElement("td");
          // creates a Text Node
          currenttext = document.createTextNode(values[i]);
          // appends the Text Node we created into the cell <td>
          mycurrent_cell.appendChild(currenttext);
          // appends the cell <td> into the row <tr>
          mycurrent_row.appendChild(mycurrent_cell);
      }
      // appends the row <tr> into <tbody>
      mytablebody.appendChild(mycurrent_row);
  }

  // appends <tbody> into <table>
  mytable.appendChild(mytablebody);
  // appends <table> into <body>
  mybody.appendChild(mytable);
  // sets the border attribute of mytable to 2;
  mytable.setAttribute("border","2");
}