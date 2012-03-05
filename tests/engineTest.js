test('Engine: localStorage', function() {
	var oEngine = XS.Engines['localStorage'];
	oEngine.resetEngine();

	if (!oEngine.isAvailable())
	{
		return;
	}

	window.localStorage.clear();

	strictEqual(oEngine.keyPrefix, null, 'Key prefix is null');
	strictEqual(oEngine._clean('nothing'), false, "Clean Storage");
	strictEqual(oEngine.flush(), false, "Flush Storage without keyPrefix");

	oEngine.keyPrefix = 'xs-';
	equal(oEngine.flush(), 0, 'Flush Storage with keyPrefix');

	oEngine.set('test', 'test');
	equal(oEngine.get('test'), 'test', "Get record with oEngine.get");
	equal(window.localStorage.getItem('test'), 'test', "Get record with native engine");
	oEngine.remove('test');
	equal(oEngine.get('test'), null, "Get record with oEngine.get after delete");
	equal(window.localStorage.getItem('test'), null, 'Get record with native engine after delete');

	var totalItems = 0;
	$.each(oEngine._getTTLRecord(), function(key, value){
		totalItems++;
	});
	equal(totalItems, 0, 'No ttl record');

	oEngine._addTTLRecord('test', 100);
	oEngine._addTTLRecord('test2', 1);
	var oTTL = oEngine._getTTLRecord();
	ok(oTTL.test !== undefined, 'TTL1 present');
	ok(oTTL.test2 !== undefined, 'TTL2 present');

	oEngine._removeTTLRecord('test');

	var totalItems = 0;
	$.each(oEngine._getTTLRecord(), function(key, value){
		totalItems++;
	});
	equal(totalItems, 1, 'Remove one TTL, one remains');

	strictEqual(oEngine._clean('test2'), false, 'Clean key, not cleared because ttl still active');
	sleep(2);
	strictEqual(oEngine._clean('test2'), true, 'Clean key, cleared');

	var oTTL = oEngine._getTTLRecord();
	ok(oTTL.test2 === undefined, 'TTL key cleared');
	strictEqual(window.localStorage.getItem('xs-ttl'), null, 'TTL record deleted');

	oEngine.set('test', 'test', 1);
	equal(oEngine.get('test'), 'test', "Get a key, cache still active");
	sleep(2);
	strictEqual(oEngine.get('test'), null, "Get a key, cache inactive, delete key");

	oEngine.set('test', 'test', 1);
	equal(oEngine.get('test'), 'test', 'Get a key, cache still active');
	var oTTL = oEngine._getTTLRecord();
	ok(oTTL.test !== undefined);
	oEngine.remove('test');
	strictEqual(oEngine.get('test'), null, 'Get a deleted key');
	var oTTL = oEngine._getTTLRecord();
	ok(oTTL.test === undefined, 'TTL is deleted also for a deleted key');

	oEngine.set('test', {test: 1});
	var oRecord = oEngine.get('test');
	equal(oRecord.test, 1, 'Get a key from a stored object');
	equal(window.localStorage.getItem('test'), '{"test":1}', 'Get the actual record from the native storage');
	oEngine.remove('test');
});

test('Engine: sessionStorage', function() {
	var oEngine = XS.Engines['sessionStorage'];
	oEngine.resetEngine();

	if (!oEngine.isAvailable())
	{
		return;
	}

	window.sessionStorage.clear();

	strictEqual(oEngine.keyPrefix, null, 'Key prefix is null');
	strictEqual(oEngine._clean('nothing'), false, "Clean Storage");
	strictEqual(oEngine.flush(), false, "Flush Storage without keyPrefix");

	oEngine.keyPrefix = 'xs-';
	equal(oEngine.flush(), 0, 'Flush Storage with keyPrefix');

	oEngine.set('test', 'test');
	equal(oEngine.get('test'), 'test', "Get record with oEngine.get");
	equal(window.sessionStorage.getItem('test'), 'test', "Get record with native engine");
	oEngine.remove('test');
	equal(oEngine.get('test'), null, "Get record with oEngine.get after delete");
	equal(window.sessionStorage.getItem('test'), null, 'Get record with native engine after delete');

	var totalItems = 0;
	$.each(oEngine._getTTLRecord(), function(key, value){
		totalItems++;
	});
	equal(totalItems, 0, 'No ttl record');

	oEngine._addTTLRecord('test', 100);
	oEngine._addTTLRecord('test2', 1);
	var oTTL = oEngine._getTTLRecord();
	ok(oTTL.test !== undefined, 'TTL1 present');
	ok(oTTL.test2 !== undefined, 'TTL2 present');

	oEngine._removeTTLRecord('test');

	var totalItems = 0;
	$.each(oEngine._getTTLRecord(), function(key, value){
		totalItems++;
	});

	equal(totalItems, 1, 'Remove one TTL, one remains');

	strictEqual(oEngine._clean('test2'), false, 'Clean key, not cleared because ttl still active');
	sleep(2);
	strictEqual(oEngine._clean('test2'), true, 'Clean key, cleared');

	var oTTL = oEngine._getTTLRecord();
	ok(oTTL.test2 === undefined, 'TTL key cleared');
	strictEqual(window.sessionStorage.getItem('xs-ttl'), null, 'TTL record deleted');

	oEngine.set('test', 'test', 1);
	equal(oEngine.get('test'), 'test', "Get a key, cache still active");
	sleep(2);
	strictEqual(oEngine.get('test'), null, "Get a key, cache inactive, delete key");

	oEngine.set('test', 'test', 1);
	equal(oEngine.get('test'), 'test', 'Get a key, cache still active');
	var oTTL = oEngine._getTTLRecord();
	ok(oTTL.test !== undefined);
	oEngine.remove('test');
	strictEqual(oEngine.get('test'), null, 'Get a deleted key');
	var oTTL = oEngine._getTTLRecord();
	ok(oTTL.test === undefined, 'TTL is deleted also for a deleted key');

	oEngine.set('test', {test: 1});
	var oRecord = oEngine.get('test');
	equal(oRecord.test, 1, 'Get a key from a stored object');
	equal(window.sessionStorage.getItem('test'), '{"test":1}', 'Get the actual record from the native storage');
	oEngine.remove('test');
});

test('Engine: domStorage', function() {
	var oEngine = XS.Engines['domStorage'];
	oEngine.resetEngine();

	if (!oEngine.isAvailable())
	{
		return;
	}

	window.domStorage.clear();

	strictEqual(oEngine.keyPrefix, null, 'Key prefix is null');
	strictEqual(oEngine._clean('nothing'), false, "Clean Storage");
	strictEqual(oEngine.flush(), false, "Flush Storage without keyPrefix");

	oEngine.keyPrefix = 'xs-';
	equal(oEngine.flush(), 0, 'Flush Storage with keyPrefix');

	oEngine.set('test', 'test');
	equal(oEngine.get('test'), 'test', "Get record with oEngine.get");
	equal(window.domStorage.getItem('test'), 'test', "Get record with native engine");
	oEngine.remove('test');
	equal(oEngine.get('test'), null, "Get record with oEngine.get after delete");
	equal(window.domStorage.getItem('test'), null, 'Get record with native engine after delete');

	var totalItems = 0;
	$.each(oEngine._getTTLRecord(), function(key, value){
		totalItems++;
	});
	equal(totalItems, 0, 'No ttl record');

	oEngine._addTTLRecord('test', 100);
	oEngine._addTTLRecord('test2', 1);
	var oTTL = oEngine._getTTLRecord();
	ok(oTTL.test !== undefined, 'TTL1 present');
	ok(oTTL.test2 !== undefined, 'TTL2 present');

	oEngine._removeTTLRecord('test');

	var totalItems = 0;
	$.each(oEngine._getTTLRecord(), function(key, value){
		totalItems++;
	});

	equal(totalItems, 1, 'Remove one TTL, one remains');

	strictEqual(oEngine._clean('test2'), false, 'Clean key, not cleared because ttl still active');
	sleep(2);
	strictEqual(oEngine._clean('test2'), true, 'Clean key, cleared');

	var oTTL = oEngine._getTTLRecord();
	ok(oTTL.test2 === undefined, 'TTL key cleared');
	strictEqual(window.domStorage.getItem('xs-ttl'), null, 'TTL record deleted');

	oEngine.set('test', 'test', 1);
	equal(oEngine.get('test'), 'test', "Get a key, cache still active");
	sleep(2);
	strictEqual(oEngine.get('test'), null, "Get a key, cache inactive, delete key");

	oEngine.set('test', 'test', 1);
	equal(oEngine.get('test'), 'test', 'Get a key, cache still active');
	var oTTL = oEngine._getTTLRecord();
	ok(oTTL.test !== undefined);
	oEngine.remove('test');
	strictEqual(oEngine.get('test'), null, 'Get a deleted key');
	var oTTL = oEngine._getTTLRecord();
	ok(oTTL.test === undefined, 'TTL is deleted also for a deleted key');

	oEngine.set('test', {test: 1});
	var oRecord = oEngine.get('test');
	equal(oRecord.test, 1, 'Get a key from a stored object');
	equal(window.domStorage.getItem('test'), '{"test":1}', 'Get the actual record from the native storage');
	oEngine.remove('test');
});

function sleep(sec) {
	var ms = sec * 1000;
	ms += new Date().getTime();
	while (new Date() < ms){}
}
