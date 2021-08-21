const socket = io('http://localhost:5000');
const messages = document.getElementById('messages');
const msgForm = document.getElementById('msgForm');

/////////////////

let url1 = window.location.href;
let ind1 = url1.indexOf('channel/');
let channel1 = url1.substr(ind1+'channel/'.length);
socket.emit('join',{channel1});

//////////////////


msgForm.addEventListener('submit', e => {

    e.preventDefault();
    let url = window.location.href;
    let ind = url.indexOf('channel/');
    let channel = url.substr(ind+'channel/'.length);
    socket.emit('chatmessage', { msg : msgForm.msg.value , owner : localStorage.getItem('username') , channel} )
    console.log('submit from msgfrom', msgForm.msg.value);
    msgForm.msg.value = '';

})

socket.on('message', data => {
    appendMessages(data);
})

function appendMessages(data){
    const html = `<li>${data.owner} --- ${data.msg}</li>`;
    messages.innerHTML += html;
}