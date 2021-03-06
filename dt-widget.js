/**
 * To work in AMD
 * @param  {[type]} root    [this]
 * @param  {[type]} factory [ChatWidget]
 * @return {[type]}         [none]
 */
(function(root, factory) {
	if (typeof define === 'function' && define.amd) {
		define(factory);
	} else if (typeof exports === 'object') {
		module.exports = factory();
	} else {
		root['ChatWidget'] = factory();
	}
}(this, function(){
	'use strict';

	var getScriptUrl = function(){
		var scripts = document.getElementsByTagName('script');
		var url = scripts[scripts.length - 1].src.replace("dt-widget.js", "").replace("dt-widget.min.js", "");
		return url;
	};

	var SCRIPT_URL = getScriptUrl();

	/**
	 * Main Class
	 */
	var ChatWidget = function(){
		this.getScriptUrl = function(){
			return SCRIPT_URL;
		};

		this.loadCSS = function(url, callback){
			var temp = document.createElement("link");
	        temp.setAttribute("rel", "stylesheet");
	        temp.setAttribute("type", "text/css");
	        temp.setAttribute("href", url);

	        temp.onreadystatechange = temp.onload = function() {
		    	if (!callback.done && (!temp.readyState || /loaded|complete/.test(temp.readyState))) {
		      		callback.done = true;
		      		callback();
		    	}
		  	};
	        document.querySelector("head").appendChild(temp);
		};

		this.loadScript = function(url, callback) {
		  	var temp = document.createElement('script');
		  	temp.src = url;
		  	temp.async = true;
		  	temp.onreadystatechange = temp.onload = function() {
		    	if (!callback.done && (!temp.readyState || /loaded|complete/.test(temp.readyState))) {
		      		callback.done = true;
		      		callback();
		    	}
		  	};
		  	document.querySelector('head').appendChild(temp);
		};

		this.$setValid = function(el){
			el.className = el.className.replace(" dt-valid", "");
			el.className = el.className.replace(" dt-invalid", "");
			el.className += " dt-valid";
			el.$valid = true;
			el.$invalid = false;
		};

		this.$setInvalid = function(el){
			el.className = el.className.replace(" dt-invalid", "");
			el.className = el.className.replace(" dt-valid", "");
			el.className += " dt-invalid";
			el.$valid = false;
			el.$invalid = true;
		};

		this.URL = this.getScriptUrl();
		this.HAS_INIT = false;
	};

	/**
	 * Function to create a widget
	 * @param  {[type]} options [object with elements needed]
	 * @return {[type]}         [description]
	 */
	ChatWidget.prototype.create = function(options){
		if(options.useMask === true && typeof VMasker === "undefined"){
			this.loadScript(this.URL + "/vendors/vanilla-masker.min.js", function(){
				this.create(options);
			}.bind(this));

			return false;
		}

		this.widget = document.createElement("div");
		this.widget.className = "dt-chat-widget";
		this.widget.header = document.createElement("div");
		this.widget.subheader = document.createElement("div");
		this.widget.body = document.createElement("div");
		this.widget.footer = document.createElement("div");
		this.widget.body.customText = document.createElement("p");
		this.widget.body.customText.innerHTML = options.customText;
		this.widget.body.appendChild(this.widget.body.customText);
		this.widget.appendChild(this.widget.header);
		this.widget.appendChild(this.widget.subheader);
		this.widget.appendChild(this.widget.body);
		this.widget.appendChild(this.widget.footer);
		this.widget.header.className = "dt-chat-widget-header";
		this.widget.subheader.className = "dt-chat-widget-subheader";
		this.widget.body.className = "dt-chat-widget-body";
		this.widget.footer.className = "dt-chat-widget-footer";
		this.widget.header.innerHTML = options.title;
		this.widget.header.onclick = this.toggle.bind(this);
		this.widget.body.form = document.createElement("form");
		this.widget.body.appendChild(this.widget.body.form);
		this.widget.body.form.name = "dt-widget-form";
		this.widget.body.form.onsubmit = this.submitForm.bind(this);
		this.widget.body.form.noValidate = true;
		this.fields  = options.fields;
		this.chatURL = options.chatURL;
		
		this.fields.forEach(function(field){
		  this.createInput(field, this.widget.body.form);
		}, this);
		
		this.widget.body.form.button = document.createElement("button");
		this.widget.body.form.button.innerHTML = options.buttonText;
		this.widget.body.form.appendChild(this.widget.body.form.button);
		this.widget.body.form.button.type = "submit";

		this.loadCSS(options.css, function(){
			document.body.appendChild(this.widget);
		
			if(typeof options.closed === "undefined" || options.closed === true){
				this.close();
			}
		}.bind(this));
		

		if(typeof this.oncreate === 'function') {
			this.oncreate();
		}

		if(options.customHtml) {
			options.customHtml.forEach(function(prop) {
				this.addCustomHtml(prop.element, prop.content);
			}, this);
		}
	};
	
	/**
	 * Create input
	 * @param  {[type]} field [description]
	 * @param  {[type]} form  [description]
	 * @return {[type]}       [description]
	 */
	ChatWidget.prototype.createInput = function(field, form){

	  	var inputWrapper = document.createElement("div");
	  	var label = document.createElement("label");
	  	var input;

		if(field.type === "text" || field.type === "number" || field.type === "email" || field.type === "hidden"){
			input = document.createElement("input");
			input.type = field.type;
		}else if(field.type === "select" || field.type === "init"){

			if(field.type === "init") {
				if(this.HAS_INIT){
					console.error('The field "' + field.name + '" cannot be set because the widget already has a "init" type field');
					return;
				}else{
					this.HAS_INIT = true;
				}
				
			}
			
			input = document.createElement("select");
			field.options.unshift({name: "Selecione", value: ""});

			field.options.forEach(function(option){
				var tempOption = document.createElement("option");
				tempOption.text = option.name;
				tempOption.value = option.value;
				input.appendChild(tempOption);
			});
		}else if(field.type === "textarea"){
			input = document.createElement("textarea");
		}else{
			input = document.createElement("input");
			input.type = "text";
		}

		if(field.placeholder){
			input.placeholder = field.placeholder;
		}

		if(typeof field.mask !== "undefined"){
			VMasker(input).maskPattern(field.mask);
		}

		input.className = "dt-input-control";
		label.className = "dt-label-control";
		inputWrapper.className = "dt-chat-widget-form-control";
		inputWrapper.appendChild(label);
		inputWrapper.appendChild(input);

		label.innerHTML = field.label || "";	
		input.required = field.required;
		input.name = field.name;

		if(field.value){
			input.value = field.value;
		}

		form.appendChild(inputWrapper);
	};
	
	/**
	 * Submit form
	 * @param  {[type]} e [description]
	 * @return {[type]}   [description]
	 */
	ChatWidget.prototype.submitForm = function(e){
	  	e.preventDefault();
	  	var isValid = true;
	  	var data = "";
		var initValue;

	  	this.fields.forEach(function(field){

	  		var value, newValue;

	  		if(field.mask) {
	  			newValue = VMasker.toNumber(this.widget.body.form[field.name].value);
	  		}

	  		value = newValue || this.widget.body.form[field.name].value;
	  		
	  		data += "&" + field.name + "=" + value;
	  		
	  		if(field.required){
	  			if(!this.validateRequired(this.widget.body.form[field.name])){
	  				isValid = false;
	  			}

	  			if(field.type === "email" && !this.validateEmail(this.widget.body.form[field.name])){
	  				isValid = false;
	  			}
	  		}else{
	  			this.$setValid(this.widget.body.form[field.name]);
	  		}

			if(field.type === "init") {
				initValue = this.widget.body.form[field.name].value;
			}

	  	}, this);

		this.chatURL = this.HAS_INIT && initValue !== "" ? initValue : this.chatURL;		

	  	if(isValid){
	  		this.$setValid(this.widget.body.form);
	  	}else{
	  		this.$setInvalid(this.widget.body.form);
	  	}
		
		if(!this.widget.body.form.$invalid){
			window.open(this.chatURL + data, "Popup", "width=480,height=520");
		}

		if(typeof this.onsubmit === 'function') {
			this.onsubmit();
		}
	};

	/**
	 * Validate required fields for empty value
	 * @param  {[type]} field [description]
	 * @return {[type]}       [description]
	 */
	ChatWidget.prototype.validateRequired = function(field){
		if(field.value === "" || typeof field.value === "undefined" || field.value === null){
			this.$setInvalid(field);
			return false;
		}else{
			this.$setValid(field);
			return true;
		}
	};

	/**
	 * Validate email fields with regex
	 * @param  {[type]} field [description]
	 * @return {[type]}       [description]
	 */
	ChatWidget.prototype.validateEmail = function(field){
		var re = /^(([^<>()\[\]\.,;:\s@\"]+(\.[^<>()\[\]\.,;:\s@\"]+)*)|(\".+\"))@(([^<>()[\]\.,;:\s@\"]+\.)+[^<>()[\]\.,;:\s@\"]{2,})$/i;
		if(typeof field.value !== "undefined" && re.test(field.value) && field.value !== ""){
			this.$setValid(field);
			return true;
		}else{
			this.$setInvalid(field);
			return false;
		}
	};

	/**
	 * Set a timer to call chat
	 * @param {[type]} seconds [description]
	 */
	ChatWidget.prototype.setTimer = function(seconds){
		setTimeout(function(){
			this.open();
		}.bind(this), seconds * 1000);
	};
	
	/**
	 * Open widget
	 * @return {[type]} [description]
	 */
	ChatWidget.prototype.open = function(){
		this.widget.body.style.display = "block";
		this.widget.subheader.style.display = "block";
		this.widget.footer.style.display = "block";
		this.widget.className = this.widget.className.replace(" open", "");
		this.widget.className = this.widget.className.replace(" closed", "");
		this.widget.className += " open";

		if(typeof this.onopen === 'function') {
			this.onopen();
		}
	};

	/**
	 * Close widget
	 * @return {[type]} [description]
	 */
	ChatWidget.prototype.close = function(){
		this.widget.body.style.display = "none";
		this.widget.subheader.style.display = "none";
		this.widget.footer.style.display = "none";
		this.widget.className = this.widget.className.replace(" closed", "");
		this.widget.className = this.widget.className.replace(" open", "");
		this.widget.className += " closed";

		if(typeof this.onclose === 'function') {
			this.onclose();
		}
	};

	/**
	 * Toggle widget
	 * @return {[type]} [description]
	 */
	ChatWidget.prototype.toggle = function(){
		if(this.widget.body.style.display === "none"){
			this.open();
		}else{
			this.close();
		}

		if(typeof this.ontoggle === 'function') {
			this.ontoggle();
		}
	};

	/**
	 * Add custom html to widget elements
	 * @param  {[type]} e [description]
	 * @param  {[type]} e [description]
	 */
	ChatWidget.prototype.addCustomHtml = function(el, content){
		
		var wrapper;
		
		switch(el) {
			case 'footer':
				wrapper = this.widget.footer;
				break;
			case 'header':
				wrapper = this.widget.subheader;
			default:
				break;
		}
		
		if(content) {
			wrapper.innerHTML = content;
		}
	};

	/**
	 * Callbacks
	 * @return void
	 */
	ChatWidget.prototype.oncreate   = function() {};
	ChatWidget.prototype.onsubmit   = function() {};
	ChatWidget.prototype.onopen     = function() {};
	ChatWidget.prototype.ontoggle   = function() {};
	ChatWidget.prototype.onclose    = function() {};


	

	return ChatWidget;
}));
