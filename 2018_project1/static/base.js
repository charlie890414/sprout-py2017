var headers = new Headers();
headers.append('Accept', "application/json");
headers.append('Content-Type', "application/json");

var filter ;
var sort;
var page;
var url;

$(function getParam() {
	var messageList = $("#messageList")[0] ;
	var page_num = $("#page_num")[0] ;
	console.log(window.location.search)
	let searchParams = new URLSearchParams(window.location.search);
	sort = searchParams.get('sort') || '';
	page = searchParams.get('page') || 1;
	filter = searchParams.get('filter') || '';
	/*
	if (sort != '' || page != 1 || filter != '') {
		console.log("weirw") ;
		$('#board')[0].scrollIntoView( true ) ;
	}
	*/
	console.log(filter);
	$("#filter").val(filter) ;
	try {
		page = Number(page);
	}
	catch(e) {
		page = 1 ;
		alert(e) ;
	}
	page_num.innerText = `第 ${page} 頁` ;
	if (sort != "") {
		if (sort.indexOf("r_") == -1)		// not reversed
			$(`#${sort}_btn`).addClass("enable-btn") ;
		else								// reversed
			$(`#${sort.slice(2)}_btn`).addClass("rv-btn") ;
	}
})


function getPageRel(num) {
	if (Number.isInteger(page)){
		page = Number(page);
	}
	if (num == -1)
		getList(page-1) ;
	else if (num == 1)
		getList(page+1) ;
}

function getPageDir(event) {
	var num ;
	try {
		num = Number(event.target.childNodes[1].value) ;
		if (Number.isInteger(num))
			getList(num) ;
		else
			alert("頁數需是整數!") ;
	}
	catch(e) {
		alert(e) ;
		alert("頁數需是整數!") ;
	}
}

function getFilter() {
	filter = encodeURIComponent($("#filter").val()) ;
	getList(1) ;
}

function clearFilter() {
	filter = "" ;
	$("#filter").val("") ;
	getList(1) ;
}

function change_sort(attr) {
	$("#time_btn").removeClass("enable-btn") ;
	$("#time_btn").removeClass("rv-btn") ;
	$("#user_btn").removeClass("enable-btn") ;
	$("#user_btn").removeClass("rv-btn") ;
	$("#len_btn").removeClass("enable-btn") ;
	$("#len_btn").removeClass("rv-btn") ;

	if (attr == sort){
		sort = "r_" + attr;
		$(`#${attr}_btn`).addClass("rv-btn") ;
	}
	else{
		sort = attr;
		$(`#${attr}_btn`).addClass("enable-btn") ;
	}
}

function getList(request_page) {
	console.log(request_page) ;
	url = `?sort=${sort}&filter=${filter}&page=${request_page}`;
	this.parent.location.href = url;
	/*fetch(url, {
		method: 'get', 
		headers: headers,
		credentials: 'include'
	}).then(function(res) {
		if (res.ok) {
			res.json().then(function(data) {
//				console.log(data) ;
				page = data.page ;
       			updatePage(data.message_pool) ;
			}) ;
		} 
		else
			alert('Error!')
	}).catch(function(err) {
		alert("Error!") ;
	})*/
}

function Delete(id) {
	console.log("start delete");

	url = "/delete" ;
	fetch(url, {
		method: 'delete', 
		body: JSON.stringify({'index': id}),
		headers: headers,
		credentials: 'include'
	}).then(function(res) {
		if (res.ok) {
			console.log("get ok, start redirect");
			url = `?sort=${sort}&filter=${filter}&page=${page}`;
			this.parent.location.href = url;
			return false;
		} 
		else
			alert('Error!')
	}).catch(function(err) {
		console.log(err);
		alert("Error!") ;
	})

	console.log("delete " + id) ;
}

function updatePage(message_pool) {
//	console.log(message_pool) ;
//	console.log(typeof(message_pool)) ;
	messageList.innerHTML = "" ;

	message_pool.forEach(function(message, index) {
//		console.log(message) ;
		var li = document.createElement("li") ;
		li.className = "message";

		for(i = 0 ; i < 3 ; i++) {
			if (i == 2)
				continue ;
			message[i] = message[i].replace(/</g, "&lt;").replace(/>/g, "&gt;");
		}

		li.innerHTML = `<span>
                        <span style="float:right;" >
                            <a class="close" href="javascript:Delete(${message[2]});">×</a>
                        </span>
                        <div class="content">
                            <p id="from">From: ${message[0]}</p>
                            <p>${message[1]}</p>
                        </div>
                        <br>
                        <div class="rightbottom">
                            ${message[3]}
                        </div> 
                    </span>` ;
		messageList.appendChild(li) ;
		messageList.innerHTML += `<br>` ;
	})
	page_num.innerText = `第 ${page} 頁` ;
}

