;(function($) {

	if (typeof XS === 'undefined')
	{
		XS = {};
	}

	String.prototype.hashCode = function(){
		var hash = 0;
		if (this.length == 0) return hash;
		for (i = 0; i < this.length; i++) {
			char = this.charCodeAt(i);
			hash = ((hash<<5)-hash)+char;
			hash = hash & hash; // Convert to 32bit integer
		}
		return hash;
	}

	window.domStorage = {
		getItem: function(key) {
			key = $.camelCase(key);

			return $('body').data(key) !== undefined ? $('body').data(key) : null;
		},

		removeItem: function(key) {
			key = $.camelCase(key);

			if (this.getItem(key) !== null)
			{
				this.length--;
				$('body').removeData(key);
			}

			return undefined;
		},

		setItem: function(key, value) {
			key = $.camelCase(key);
			this.length++;
			$('body').data(key, value);
		},

		clear: function() {
			$.each($('body').data(), function(key, value) {
				$('body').removeData(key);
			});

			this.length = 0;

			return undefined;
		},

		length: 0,

		key: function(index) {
			var aKeys = new Array;

			$.each($('body').data(), function(key, value) {
				aKeys.push(key);
			});

			return aKeys[index] !== undefined ? aKeys[index] : null;
		}
	};

	XS.AbstractEngines = {
		keyPrefix: null,
		log: function(message) {
			if (window.console && window.console.log)
			{
				console.log(message);
			}
		},
		get: function(key) {
			this._clean(key);
			var result = this._getEngine().getItem(key);

			try
			{
				result = JSON.parse(result);
			}
			catch (e)
			{
				this.log('Maybe not json?');
			}

			return result;
		},
		set: function(key, value, ttl) {
			try
			{
				this._addTTLRecord(key, ttl);

				if (value instanceof Object)
				{
					value = JSON.stringify(value);
				}

				return this._getEngine().setItem(key, value);
			}
			catch (e)
			{
				this.log(e.toString());

				return false;
			}
		},
		remove: function(key) {
			this._removeTTLRecord(key);
			return this._getEngine().removeItem(key);
		},
		isAvailable: function() {
			return false;
		},
		flush: function() {
			var self = this;
			var i    = 0;

			if (self.keyPrefix === null)
			{
				return false;
			}

			var camelCaseKeyPrefix = $.camelCase(self.keyPrefix);

			var regExp = new RegExp("^(?:"+camelCaseKeyPrefix+")");
			var aKeys  = self.getKeys();

			$.each(aKeys, function(key, value) {
				if (regExp.test(value))
				{
					self.remove(value);
					i++;
				}
			});

			return i;
		},

		_getEngine: function() {},

		_addTTLRecord: function(key, ttl) {
			if (ttl === undefined)
			{
				return;
			}

			var oTTL  = this._getTTLRecord();
			oTTL[key] = ttl * 1000 + (new Date()).getTime();

			this._saveTTL(oTTL);
		},

		_removeTTLRecord: function(key) {
			var oTTL = this._getTTLRecord();

			if (oTTL[key] !== undefined)
			{
				delete oTTL[key];
			}

			this._saveTTL(oTTL);
		},

		_clean: function(key) {
			var oTTL = this._getTTLRecord();

			if (oTTL[key] === undefined)
			{
				return false;
			}

			var currentTime = (new Date()).getTime();

			if (oTTL[key] < currentTime)
			{
				this.remove(key);
				return true;
			}

			return false;
		},

		_saveTTL: function(oTTL) {
			var length = 0;
			$.each(oTTL, function(){
				length++;
			});

			if (length > 0)
			{
				this._getEngine().setItem(this.keyPrefix + 'ttl', JSON.stringify(oTTL));
			}
			else
			{
				this._getEngine().removeItem(this.keyPrefix + 'ttl');
			}
		},

		_getTTLRecord: function() {
			var sTTL = this._getEngine().getItem(this.keyPrefix + 'ttl') || null;

			if (sTTL === null)
			{
				return {};
			}

			return JSON.parse(sTTL);
		},

		resetEngine: function() {
			this.keyPrefix = null;
		},

		getKeys: function() {
			var aKeys = new Array;

			for (var j=0; j < this._getEngine().length; j++)
			{
				aKeys.push(this._getEngine().key(j));
			}

			return aKeys;
		}
	};

	XS.Engines = {
		localStorage  : $.extend({}, XS.AbstractEngines, {
			isAvailable: function() {
				return typeof window.localStorage !== 'undefined'
			},

			_getEngine: function() {
				return window.localStorage;
			}
		}),
		sessionStorage: $.extend({}, XS.AbstractEngines, {
			isAvailable: function() {
				return typeof window.sessionStorage !== 'undefined'
			},

			_getEngine: function() {
				return window.sessionStorage;
			}
		}),

		domStorage: $.extend({}, XS.AbstractEngines, {
			isAvailable: function() {
				return $.fn.data !== undefined;
			},

			_getEngine: function() {
				return window.domStorage;
			}
		})
	};

	XS.Storage = function(options) {
		this._currentEngine = null;
		this.options        = $.extend({}, this.options, options);

		if (this.options.engines === null || this.options.engines === undefined)
		{
			throw Error('Specify at least one storage engine');
		}

		if (this.options.keyPrefix === null)
		{
			this.options.keyPrefix = Math.abs(window.location.hostname.hashCode()).toString();
		}
	};

	$.extend(XS.Storage.prototype, {
		options: {
			debug    : true,
			keyPrefix: null,
			engines  : 'localStorage,sessionStorage,domStorage'
		},

		generateKey: function(key) {
			return this.options.keyPrefix + key;
		},

		get: function(key, engine) {
			return this._getStorage(engine).get(this.generateKey(key));
		},

		set: function(key, value, ttl, engine) {
			return this._getStorage(engine).set(this.generateKey(key), value, ttl);
		},

		remove: function(key, engine) {
			return this._getStorage(engine).remove(this.generateKey(key));
		},

		resetStorage: function() {
			this._currentEngine = null;
		},

		flush: function(engine) {
			return this._getStorage(engine).flush();
		},

		log: function(message) {
			if (window.console && window.console.log && this.options.debug == true)
			{
				console.log(message);
			}
		},

		_getStorage: function(engine) {
			var self     = this;
			var aEngines = self.options.engines.split(',');

			if (engine !== undefined && XS.Engines[engine] !== undefined && XS.Engines[engine].isAvailable() === true)
			{
				self._currentEngine = $.trim(engine);
				var oEngine         = XS.Engines[engine];
				oEngine.resetEngine();
				oEngine.keyPrefix   = self.options.keyPrefix;
				return oEngine;
			}

			if (self._currentEngine !== null)
			{
				return XS.Engines[self._currentEngine];
			}

			var oEngine = null;

			$.each(aEngines, function(key, value){
				if (XS.Engines[value] !== undefined && XS.Engines[value].isAvailable() === true)
				{
					self._currentEngine = $.trim(value);
					oEngine             = XS.Engines[self._currentEngine];
					oEngine.resetEngine();

					self.log('Selecting ' + self._currentEngine + ' engine');

					return false;
				}
			});

			oEngine.keyPrefix = self.options.keyPrefix;

			return oEngine;
		}
	});
})(jQuery);
