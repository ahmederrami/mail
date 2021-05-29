document.addEventListener('DOMContentLoaded', function() {

  // Use buttons to toggle between views
  document.querySelector('#inbox').addEventListener('click', () => load_mailbox('inbox'));
  document.querySelector('#sent').addEventListener('click', () => load_mailbox('sent'));
  document.querySelector('#archived').addEventListener('click', () => load_mailbox('archive'));
  document.querySelector('#compose').addEventListener('click', compose_email);


  // By default, load the inbox
  load_mailbox('inbox');
});

//---------------------------------------------------------------------------------------------
//---------------------------------compose_email()---------------------------------------------
//---------------------------------------------------------------------------------------------

function compose_email() {

  // Show compose view and hide other views
  document.querySelector('#emails-view').style.display = 'none';
  document.querySelector('#email-view').style.display = 'none';
  document.querySelector('#compose-view').style.display = 'block';

  // Clear out composition fields
  document.querySelector('#compose-recipients').value = '';
  document.querySelector('#compose-subject').value = '';
  document.querySelector('#compose-body').value = '';

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
}

//--------------------------------------------------------------------------------------------
//---------------------------------load_mailbox()---------------------------------------------
//--------------------------------------------------------------------------------------------

function load_mailbox(mailbox) {
  
  // Show the mailbox and hide other views
  document.querySelector('#emails-view').style.display = 'block';
  document.querySelector('#email-view').style.display = 'none';
  document.querySelector('#compose-view').style.display = 'none';

  // Show the mailbox name
  document.querySelector('#emails-view').innerHTML = `<h3>${mailbox.charAt(0).toUpperCase() + mailbox.slice(1)}</h3>`;
  
  fetch(`/emails/${mailbox}`) //getting emails in mailbox
  .then(response => response.json())
  .then(emails => {
    // let count=0;
    emails.forEach(email => {
      const div = document.createElement('div');
      // count++;
      if(email.read === true){
        div.setAttribute('class',"Email-Container-Read");
        div.innerHTML=`<div class="container" style="max-width:99%;"><div class="card" style="padding:10px;background-color:gray;"><div class="col-sm"><i class="fas fa-envelope-open-text fa-1x"></i><b> ${email.subject} </b></div><div class="col-sm"><p>From: ${email.sender} - ${email.timestamp}</p></div></div><br/></div>`;
        // if(mailbox==='inbox'){
        //   count--;
        //   document.querySelector('#count').innerHTML=count;
        // }
      }
      else {
        div.setAttribute('class',"Email-Container-NotRead");
        // document.querySelector('#count').innerHTML=count;
        div.innerHTML=`<div class="container" style="max-width:99%;"><div class="card" style="padding:10px;"><div class="col-sm"><i class="fas fa-envelope-open-text fa-1x"></i><b> ${email.subject} </b></div><div class="col-sm"><p>From: ${email.sender} - ${email.timestamp}</p></div></div><br/></div>`;
      }
      div.addEventListener('click', function(){
        view_email(email,mailbox);
      })
      document.querySelector('#emails-view').append(div);
    });
    
      //toHtmlTable(emails,mailbox);
  });
  
}
//-----------------------------------------------------------------------------------------
//---------------------------------view_email()---------------------------------------------
//-----------------------------------------------------------------------------------------

function view_email(email,mailbox){ //mailbox parameter to allow adding reply button only to inbox mails
  // Show the mailbox and hide other views
  document.querySelector('#emails-view').style.display = 'none';
  document.querySelector('#email-view').style.display = 'block';
  document.querySelector('#compose-view').style.display = 'none';

  // Show the container
  document.querySelector('#email-view').innerHTML = ``;
  
  if(mailbox==='inbox'){
    fetch(`/emails/${email.id}`, {//mark the email as read
      method: 'PUT',
      body: JSON.stringify({
          read: true,
      })
    });
  }
  fetch(`/emails/${email.id}`) //display email detail
  .then(response => response.json())
  .then(email => {
      // Print result : sender, recipients, subject, timestamp, and body.
      let div=document.querySelector('#email-view');
      let sender=document.createElement('P'); sender.innerHTML=`<b>From</b> : ${email.sender}`; div.appendChild(sender);
      let recipients=document.createElement('P'); recipients.innerHTML=`<b>To</b> : ${email.recipients}`; div.appendChild(recipients);
      let subject=document.createElement('P'); subject.innerHTML=`<b>Subject</b> : ${email.subject}`; div.appendChild(subject);
      let timestamp=document.createElement('P'); timestamp.innerHTML=`<b>Timestamp</b> : ${email.timestamp}`; div.appendChild(timestamp);
      if(mailbox==="inbox"){ // add reply button to inbox emails only
        let repButton=document.createElement('button'); repButton.innerHTML="Reply  <i class='fa fa-reply'></i>"; repButton.setAttribute('class',"btn btn-sm btn-outline-primary"); repButton.addEventListener('click',()=>{reply_email(email);}); div.appendChild(repButton);
      }
      if(mailbox!="archive"){ // you can archive any email out of archive mailbox
        let arButton=document.createElement('button'); arButton.innerHTML="Archive"; arButton.setAttribute('class',"btn btn-sm btn-outline-primary"); arButton.addEventListener('click',()=>archive_email(email)); div.appendChild(arButton);
      }
      else { // you can unarchive it
        let arButton=document.createElement('button'); arButton.innerHTML="Unarchive"; arButton.setAttribute('class',"btn btn-sm btn-outline-primary"); arButton.addEventListener('click',()=>unarchive_email(email)); div.appendChild(arButton);
      }

      let hr=document.createElement('hr'); div.appendChild(hr);
      let body=document.createElement('P'); body.innerHTML=`${email.body}`; div.appendChild(body);
  });
}

//-------------------------------------------------------------------------------------------
//---------------------------------archive an email---------------------------------------------
//-------------------------------------------------------------------------------------------

function archive_email(mail){
  fetch(`/emails/${mail.id}`,{
    method:'PUT',
    body: JSON.stringify({
      archived:true,
    })
  });
  load_mailbox('inbox');
}

//-------------------------------------------------------------------------------------------
//---------------------------------unarchive an email---------------------------------------------
//-------------------------------------------------------------------------------------------

function unarchive_email(mail){
  fetch(`/emails/${mail.id}`,{
    method:'PUT',
    body: JSON.stringify({
      archived:false,
    })
  })
  load_mailbox('inbox');
}

//-------------------------------------------------------------------------------------------
//---------------------------------reply to an email---------------------------------------------
//-------------------------------------------------------------------------------------------

function reply_email(email){
  var subject = email.subject;
  if (!subject.startsWith("Re:")){
    subject = `Re: ${subject}`
  }
  compose_email();
  document.querySelector('#compose-recipients').value = `${email.sender}`;
  document.querySelector('#compose-subject').value = `${subject}`;
  document.querySelector('#compose-body').value = `\nOn ${email.timestamp} ${email.sender} wrote: \n${email.body}....`;
}