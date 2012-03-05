test('Engine not specified', function() {
	raises(function() {
		var oStorage = new XS.Storage({
			engines: null
		});
	}, function(ex) {
		equal(ex.message, 'Specify at least one storage engine');
		ok(ex instanceof Error);
		return true;
	});
});

test('Get storage', function() {
	if (window.localStorage === undefined && window.sessionStorage === undefined)
	{
		return;
	}

	var oStorage = new XS.Storage();

	oStorage._getStorage('localStorage');

	if (window.localStorage)
	{
		equal('localStorage', oStorage._currentEngine);
	}

	oStorage._getStorage('sessionStorage');

	if (window.sessionStorage)
	{
		equal('sessionStorage', oStorage._currentEngine);
	}

	oStorage.resetStorage();
	equal(null, oStorage._currentEngine);

	// test the priority
	var oStorage = new XS.Storage({
		engines: 'sessionStorage,localStorage'
	});

	oStorage._getStorage();
	equal('sessionStorage', oStorage._currentEngine);

	if (window.localStorage)
	{
		var oStorage = new XS.Storage({
			engines: 'localStorage,sessionStorage'
		});

		oStorage._getStorage();
		equal('localStorage', oStorage._currentEngine);
	}
});

test('Local storage engine', function() {
	if (!XS.Engines['localStorage'].isAvailable())
	{
		alert('Local Storage not available');
		return;
	}

	var oStorage = new XS.Storage({
		engines: 'localStorage'
	});

	oStorage.set('test', 'test');
	equal(window.localStorage.getItem(oStorage.options.keyPrefix + 'test'), 'test', 'Record is added in the storage');

	equal(oStorage.get('test'), 'test', "Record is present with oStorage.get");
	equal(oStorage.get('test'), window.localStorage.getItem(oStorage.options.keyPrefix + 'test'), "Record is the same as with the native one");

	oStorage.remove('test');
	strictEqual(oStorage.get('test'), null, 'Record is deleted');
	strictEqual(window.localStorage.getItem(oStorage.options.keyPrefix + 'test'), null, 'Record is deleted (native check)');

	oStorage.set('test1', 'test');
	oStorage.set('test2', 'test');
	oStorage.set('test3', 'test');
	oStorage.set('test4', 'test');

	// test that other records are not deleted
	window.localStorage.setItem('test4', 'test');

	equal(oStorage.flush(), 4, 'Flush the storage');
	equal(window.localStorage.length, 1, 'One item remaining in the cache');
	equal(window.localStorage.getItem('test4'), 'test', 'Remaining item is test4');
	window.localStorage.removeItem('test4');
});

test('Session storage engine', function() {
	if (!XS.Engines['sessionStorage'].isAvailable())
	{
		alert('Session Storage not Available');
		return;
	}

	var oStorage = new XS.Storage({
		engines: 'sessionStorage'
	});

	oStorage.set('test', 'test');
	equal('test', window.sessionStorage.getItem(oStorage.options.keyPrefix + 'test'), 'Record is added in the storage');

	equal(oStorage.get('test'), 'test', "Record is present with oStorage.get");
	equal(oStorage.get('test'), window.sessionStorage.getItem(oStorage.options.keyPrefix + 'test'), "Record is the same as with the native one");

	oStorage.remove('test');
	strictEqual(oStorage.get('test'), null, 'Record is deleted');
	strictEqual(window.sessionStorage.getItem(oStorage.options.keyPrefix + 'test'), null, 'Record is deleted (native check)');

	oStorage.set('test1', 'test');
	oStorage.set('test2', 'test');
	oStorage.set('test3', 'test');
	oStorage.set('test4', 'test');

	// test that other records are not deleted
	window.sessionStorage.setItem('test4', 'test');

	equal(oStorage.flush(), 4, 'Flush the storage');
	equal(window.sessionStorage.length, 1, 'One item remaining in the cache');
	equal(window.sessionStorage.getItem('test4'), 'test', 'Remaining item is test4');
	window.sessionStorage.removeItem('test4');
});

test('Dom storage engine', function() {
	if (!XS.Engines['domStorage'].isAvailable())
	{
		alert('DOM Storage not Available')
		return;
	}

	var oStorage = new XS.Storage({
		engines: 'domStorage'
	});

	oStorage.set('test', 'test');
	equal('test', window.domStorage.getItem(oStorage.options.keyPrefix + 'test'), 'Record is added in the storage');

	equal(oStorage.get('test'), 'test', "Record is present with oStorage.get");
	equal(oStorage.get('test'), window.domStorage.getItem(oStorage.options.keyPrefix + 'test'), "Record is the same as with the native one");

	oStorage.remove('test');
	strictEqual(oStorage.get('test'), null, 'Record is deleted');
	strictEqual(window.domStorage.getItem(oStorage.options.keyPrefix + 'test'), null, 'Record is deleted (native check)');

	oStorage.set('test1', 'test');
	oStorage.set('test2', 'test');
	oStorage.set('test3', 'test');
	oStorage.set('test4', 'test');

	// test that other records are not deleted
	window.domStorage.setItem('test4', 'test');

	equal(oStorage.flush(), 4, 'Flush the storage');

	equal(window.domStorage.length, 1, 'One item remaining in the cache');
	equal(window.domStorage.getItem('test4'), 'test', 'Remaining item is test4');
	window.domStorage.removeItem('test4');
});
