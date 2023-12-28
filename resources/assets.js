Neutralino.init()
Neutralino.events.on("windowClose", function() { Neutralino.app.exit() })
document.getElementById('password').focus()

// LISTENERS ------------------------------------------------------------------------
document.querySelector('form.password-container').onsubmit = function(e) {
	e.preventDefault()
	
	e.target.style.display = 'none'
	document.querySelector('.loading-container').style.display = 'grid'
	startSystem()
}

document.querySelector('form.change-container').onsubmit = function(e) {
	e.preventDefault()
	
	e.target.style.display = 'none'
	document.querySelector('.loading-container').style.display = 'grid'
	changePassword()
}

document.addEventListener('keydown', function(e) {
	const $event = window.event ? event : e;
	const $key = $event.key?.toLowerCase() || null;
	
	switch($key) {
	case 't':
		if($event.ctrlKey && document.querySelector('.text-base').style.display == 'block') {
			document.querySelector('.text-base').style.display = 'none'
			document.querySelector('.change-container').style.display = 'grid'
		}
		break;
	case 's':
		if($event.ctrlKey && document.querySelector('.text-base').style.display == 'block') {
			HashCrypto.build(document.querySelector('.text-base').innerHTML).then(cipher => {
				saveFile(cipher)
			})
		}
		break;
	}

})

// METHODS -------------------------------------------------------------------------
const saveFile = function(content) {
	try { Neutralino.filesystem.writeFile(`./data`, content) }
	catch(e) { console.log('Failed to save the file !') }
}

const showContent = function(content) {
	document.querySelector('.loading-container').style.display = 'none'
	document.querySelector('.text-base').innerHTML = content
	document.querySelector('.text-base').style.display = 'block'
	document.querySelector('.text-base').focus()
}

const startSystem = async function() {
	const pass = document.getElementById('password').value
	
	Neutralino.filesystem.readFile(`./data`).then(function(data) {
		const cipher = data.toString()

		HashCrypto.password = pass

		if(cipher.length) {
			HashCrypto.decrypt(cipher).then(ok => {
				showContent(ok)
			}).catch(err => {
				document.getElementById('password').value = ''
				alert('Incorrect password!')
				document.querySelector('.loading-container').style.display = 'none'
				document.querySelector('.password-container').style.display = 'grid'
			})
		} else {
			showContent('<li></li>')
		}
	}).catch(err => { if(err) { console.log(err); alert('Not possible to read data, please create a empty file called "data".'); return; } })
}

const changePassword = function() {
	const pass = document.querySelector('#password_new').value
	document.getElementById('password').value = pass
	HashCrypto.password = pass
	HashCrypto.build(document.querySelector('.text-base').innerHTML).then(cipher => {
		saveFile(cipher)
		alert('Password changed!')
		document.querySelector('.change-container').style.display = 'none'
		document.querySelector('.loading-container').style.display = 'none'
		document.querySelector('.password-container').style.display = 'grid'
	})
}