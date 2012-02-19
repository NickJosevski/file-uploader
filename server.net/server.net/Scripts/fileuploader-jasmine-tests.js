var cl = function(d) {
    console.log(d);
};
var clp = function (prefix, d) {
    cl(prefix + ' -> ' + d);
};

var dd = dd || {};
var isChromeOrFirefox = (/chrome/.test(navigator.userAgent.toLowerCase()) || $.browser.mozilla);

describe("file-upload", function () {
    return;
    var uploader,
        templateFromFileUploader,
        BlobBuilder = window.MozBlobBuilder || window.WebKitBlobBuilder || window.BlobBuilder;

    beforeEach(function () {
        var temp = $("#temp-elements");
        temp.append(
            $('<div id="dialog" title="Basic dialog">')
                .append($('<div id="file-uploader"></div>'))
        );

        templateFromFileUploader =
            '<div class="qq-uploader">' +
            '<div class="qq-upload-drop-area"><span>Drop files here to upload</span></div>' +
            '<div class="qq-upload-button">Upload a file</div>' +
            '<ul class="qq-upload-list"></ul>' +
            '</div>';

        uploader = new qq.FileUploader({
            element: $('#file-uploader')[0],
            action: '/upload/UploadFile',
            debug: true
        });
    });

    afterEach(function () {
        $("#temp-elements").empty();
    });

    it("should have created a new uploader", function () {
        //testing the beforeEach setup is correct
        expect(uploader).toBeDefined();
    });

    it("should have _preventLeaveInProgress and therefore an attached event when calling _onSubmit", function () {

        var event;
        uploader._onSubmit(1, 'file1.name');

        event = ('onbeforeunload' in window) || ('beforeunload' in window);

        expect(event).toBeTruthy();
    });

    it("should increment the files in progress variable via _onSubmit", function () {
        uploader._onSubmit(1, 'file1.name');

        expect(uploader._filesInProgress).toEqual(1);
    });

    it("should increment the files twice in progress variable via 2 calls to _onSubmit", function () {
        uploader._onSubmit(1, 'file1.name');
        uploader._onSubmit(2, 'file2.name');

        expect(uploader._filesInProgress).toEqual(2);
    });

    it("should create 4 spans, including a spinner when _addToList is called", function () {

        var list, childSpans, spinner;

        uploader._addToList(1, 'file.name');

        list = $('#file-uploader').find(".qq-upload-list");
        childSpans = list.children().find("span");
        spinner = list.children().find(".qq-upload-spinner");

        expect(list.length).toEqual(1);
        expect(childSpans.length).toEqual(4);
        expect(spinner.length).toEqual(1);
    });

    it("should have 3 remaining spans, with the sucess one visible when _onComplete is called with a success result", function () {

        var list, children, childSpans, success, size, failed;
        uploader._addToList(1, 'file.name');
        uploader._onComplete(1, 'file.name', { success: true });

        list = $('#file-uploader').find(".qq-upload-list");
        children = list.children();
        childSpans = children.find("span");
        success = list.find(".qq-upload-success");
        size = list.find(".qq-upload-size");
        failed = list.find(".qq-upload-failed-text");

        expect(list.length).toEqual(1);
        expect(childSpans.length).toEqual(3);
        expect(success.length).toEqual(1);
        expect(size.length).toEqual(1);
        expect(failed.length).toEqual(1);
    });

    it("should show failed correctly, when _onComplete is called with a success = false result", function () {

        var list, failed;
        uploader._addToList(1, 'file.name');
        uploader._onComplete(1, 'file.name', { success: false });

        list = $('#file-uploader').find(".qq-upload-list");
        failed = list.find(".qq-upload-fail");

        expect(failed.length).toEqual(1);
    });

    it("should display 10 percent, 0.1kb file size and a cancel option, on a call to _onProgress", function () {

        var list, size, file, cancel;
        uploader._addToList(1, 'file1.name');
        //deliberate shift of filename, as it isn't used for display/locating element, only id
        uploader._onProgress(1, 'file2.name', 10, 100);

        list = $('#file-uploader').find(".qq-upload-list");
        size = list.find(".qq-upload-size");
        file = list.find(".qq-upload-file");
        cancel = list.find(".qq-upload-cancel");

        expect(file.html()).toEqual('file1.name');
        expect(size.html()).toEqual('10% from 0.1kB');
        expect(cancel.attr('href')).toEqual('#');
        expect(cancel.html()).toEqual('Cancel');
    });

    it("should display only file size when 100% percent progress on a 1MB file, on a call to _onProgress", function () {

        var list, size;
        uploader._addToList(1, 'file1.name');
        //deliberate shift of filename, as it isn't used for display/locating element, only id
        uploader._onProgress(1, 'file2.name', 1000000, 1000000);

        list = $('#file-uploader').find(".qq-upload-list");
        size = list.find(".qq-upload-size");

        expect(size.html()).toEqual('1.0MB');
    });

    it("should display complete file size with Gb suffix, on a call to _onProgress at 100%", function () {

        var list, size;
        uploader._addToList(1, 'file1.name');
        //deliberate shift of filename, as it isn't used for display/locating element, only id
        uploader._onProgress(1, 'file2.name', 1000000000, 1000000000);

        list = $('#file-uploader').find(".qq-upload-list");
        size = list.find(".qq-upload-size");

        expect(size.html()).toEqual('0.9GB');
    });

    it("should set up the visual drag and drop area on the page when created", function () {

        var list = $('#file-uploader').find(":input:file"),
            buttons = $('#file-uploader').find(".qq-upload-button"),
            dropArea = $('#file-uploader').find(".qq-upload-drop-area"),
            dropAreaText = dropArea.children(":first-child");

        expect(list.length).toEqual(1);
        expect(buttons.length).toEqual(1);
        expect(dropArea.length).toEqual(1);
        expect(dropAreaText.html()).toEqual("Drop files here to upload");
    });

    it("should find an item by fileId, when _getItemByFileId is called", function () {

        var item;
        uploader._addToList(1, 'file1.name');
        uploader._addToList(2, 'file2.name');
        uploader._addToList(3, 'file3.name');

        item = uploader._getItemByFileId(2);

        expect(item).toBeDefined();

        expect(item.firstChild.textContent).toEqual('file2.name');
        expect(qq.hasClass(item.firstChild.nextSibling, 'qq-upload-cancel')).toEqual(false);
        //expect(item.find(".qq-upload-file").html()).toEqual('file2.name');
    });

    it("should find an item by fileId, when _getItemByFileId is called", function () {

        var item;
        uploader._addToList(1, 'file1.name');
        uploader._addToList(2, 'file2.name');
        uploader._addToList(3, 'file3.name');

        item = uploader._getItemByFileId(1);

        expect(item).toBeDefined();
        //TODO: _onComplete a file, and track that on complete modified the things...
        expect(item.firstChild.textContent).toEqual('file1.name');
        //expect(item.find(".qq-upload-file").html()).toEqual('file1.name');
    });

    it("should find an item that exists on the initial setup of the uploader controls via the _find method", function () {

        var root = $('#file-uploader')[0], button, drop, list, getSuccess;

        button = uploader._find(root, 'button');
        drop = uploader._find(root, 'drop');
        list = uploader._find(root, 'list');
        getSuccess = function () { uploader._find(root, 'success'); };

        expect(button).toBeDefined();
        expect(drop).toBeDefined();
        expect(list).toBeDefined();
        expect(getSuccess).toThrow(new Error("element not found success"));
    });

    it("should find an items that exist after upload begins _find method", function () {

        var root = $('#file-uploader')[0], spinner, cancel, getSuccess;

        uploader._addToList(1, 'file1.name');
        spinner = uploader._find(root, 'spinner');
        cancel = uploader._find(root, 'cancel');
        getSuccess = function () { uploader._find(root, 'success'); };

        expect(spinner).toBeDefined();
        expect(cancel).toBeDefined();
        expect(getSuccess).toThrow(new Error("element not found success"));
    });

    it("should find an items that exist after upload begins _find method", function () {

        var root = $('#file-uploader')[0], spinner, cancel, getSuccess;

        uploader._addToList(1, 'file1.name');
        spinner = uploader._find(root, 'spinner');
        cancel = uploader._find(root, 'cancel');
        getSuccess = function () { uploader._find(root, 'success'); };

        expect(spinner).toBeDefined();
        expect(cancel).toBeDefined();
        expect(getSuccess).toThrow(new Error("element not found success"));
    });

    it("should find an items that exist after upload completes sucessfully _find method", function () {

        var root = $('#file-uploader')[0], getSpinner, getCancel, success;

        uploader._addToList(1, 'file1.name');
        uploader._onComplete(1, 'file.name', { success: true });

        getSpinner = function () { uploader._find(root, 'spinner'); };
        getCancel = function () { uploader._find(root, 'cancel'); };
        success = uploader._find(root, 'success');

        expect(getSpinner).toThrow(new Error("element not found spinner"));
        expect(getCancel).toThrow(new Error("element not found cancel"));
        expect(success).toBeDefined();
    });

    it("should attach element when qq.attach is called, using attach code taken from _bindCancelEvent", function () {

        var root = $('#file-uploader')[0],
            list = uploader._find(root, 'list');

        qq.attach(list, 'click', function (e) { console.log('unit test - ' + e); });

        expect($('.qq-upload-list').click).toBeDefined();
    });

    it("should test qq.UploadDropZone", function () {

        var dropArea = $('.qq-upload-drop-area').get(0),
            dz = new qq.UploadDropZone({
                element: dropArea
            });

        expect(dz).toBeDefined();
        expect(dz._element).toBeDefined();
        expect(dz._element).toEqual(dropArea);
    });

    it("should have the drop events set up on the dropArea when qq.UploadDropZone._attachEvents is called", function () {

        var dropAreaContent = $(templateFromFileUploader),
            dropArea,
            dz,
            root = $('#file-uploader');

        root.empty();
        root.append(dropAreaContent);
        dropArea = $('.qq-upload-drop-area').get(0);

        dz = new qq.UploadDropZone({
            element: dropArea
        });
        //call it again, in case flow changes, it is called in the creation
        dz._attachEvents();

        expect(('ondragenter' in dropArea)).toBeTruthy();
        expect(('ondragenter' in dropArea)).toBeTruthy();
        expect(('ondragleave' in dropArea)).toBeTruthy();
        expect(('ondrop' in dropArea)).toBeTruthy();
    });

    it("should have the dragover event disabled on the document when qq.UploadDropZone._disableDropOutside is called", function () {

        var dropAreaContent = $(templateFromFileUploader),
            dropArea,
            dz,
            root = $('#file-uploader');

        root.empty();
        root.append(dropAreaContent);
        dropArea = $('.qq-upload-drop-area').get(0);

        dz = new qq.UploadDropZone({
            element: dropArea
        });
        //call it again, in case flow changes, it is called in the creation
        dz._disableDropOutside();

        expect(('ondragover' in document)).toBeTruthy();
        expect(qq.UploadDropZone.dropOutsideDisabled).toBeTruthy();
    });

    it("should succesfully create a new isntance of qq.UploadButton including mapping an existing element", function () {
        var button,
            buttonDiv = $(".qq-upload-button").get(0);

        button = new qq.UploadButton({
            element: buttonDiv,
            multiple: true,
            onChange: function (input) { console.log(input); }
        });

        expect(button).toBeDefined();
        expect(button._element).toEqual(buttonDiv);
    });

    it("should have an item removed from the DOM when qq.remove is called", function () {

        var root = $('#file-uploader');

        qq.remove(root.find(':input').get(0));

        expect(root.find(':input').get(0)).toBeUndefined();
    });

    it("should test qq.UploadButton._createInput styles", function () {

        var root = $('#file-uploader'),
            buttonClass,
            buttonDiv = $(".qq-upload-button").get(0),
            fileInput;

        root.find(':input').remove();

        buttonClass = new qq.UploadButton({
            element: buttonDiv,
            multiple: true,
            onChange: function (input) { console.log(input); }
        });
        //it was created, but kill it and ensure the _createInput() call can handle it on its own
        root.find(':input').remove();
        //call it again, in case flow changes, it is called in the creation
        buttonClass._createInput();

        //fileInput = uploader._find(buttonDiv, ":input[name=file]"); // 
        fileInput = $('#file-uploader').find(':input');

        expect(fileInput).toBeDefined();
        expect(fileInput.length).toEqual(1);
    });

    it("should test qq.UploadButton._createInput events", function () {

        var root = $('#file-uploader'),
            buttonClass,
            buttonDiv = $(".qq-upload-button").get(0),
            fileInput,
            changeFunc = function (input) { console.log(input); };

        root.find(':input').remove();

        buttonClass = new qq.UploadButton({
            element: buttonDiv,
            multiple: true,
            onChange: changeFunc
        });
        //it was created, but kill it and ensure the _createInput() call can handle it on its own
        root.find(':input').remove();
        //call it again, in case flow changes, it is called in the creation
        buttonClass._createInput();

        fileInput = $('#file-uploader').find(':input');

        expect(fileInput).toBeDefined();
        expect(('change' in fileInput)).toBeTruthy();
        expect(('mouseover' in fileInput)).toBeTruthy();
        expect(('mouseout' in fileInput)).toBeTruthy();
        expect(('focus' in fileInput)).toBeTruthy();
        expect(('blur' in fileInput)).toBeTruthy();
    });

    it("should have an empty queue when UploadHandlerAbstract is called with options", function () {
        //Class for uploading files using form and iframe

        qq.UploadHandlerAbstract({ opts: '' });

        expect(qq._queue).toBeDefined();
        expect(qq._queue.length).toEqual(0);
        //not sure if these are worth checking the existance of:
        expect(qq.UploadHandlerAbstract.prototype.log).toBeDefined();
        expect(qq.UploadHandlerAbstract.prototype.add).toBeDefined();
        expect(qq.UploadHandlerAbstract.prototype.upload).toBeDefined();
        expect(qq.UploadHandlerAbstract.prototype.cancel).toBeDefined();
        expect(qq.UploadHandlerAbstract.prototype.cancelAll).toBeDefined();
    });

    it("should add an upload entry when UploadHandlerAbstract.upload is called", function () {

        var uploadHandler = new qq.UploadHandlerAbstract({ opts: '' });
        uploadHandler.upload(1, { x: 'a-param' });

        expect(uploadHandler._queue.length).toEqual(1);
        //there is always an 'undefined' leading the array
        expect(uploadHandler._params.length).toEqual(2);
        expect(uploadHandler._params[1].x).toEqual('a-param');
    });

    it("should add 3 upload entries when UploadHandlerAbstract.upload is called", function () {

        var uploadHandler = new qq.UploadHandlerAbstract({ opts: '' });

        uploadHandler.upload(1, { x: 'a-param1' });
        uploadHandler.upload(2, { x: 'a-param2' });
        uploadHandler.upload(3, { x: 'a-param3' });

        expect(uploadHandler._queue.length).toEqual(3);
        //there is always an 'undefined' leading the array
        expect(uploadHandler._params.length).toEqual(4);
        expect(uploadHandler._params[1].x).toEqual('a-param1');
        expect(uploadHandler._params[2].x).toEqual('a-param2');
        expect(uploadHandler._params[3].x).toEqual('a-param3');
    });


    it("should remove all 3 queued uploads when UploadHandlerAbstract._dequeue is called 3 times", function () {

        var uploadHandler = new qq.UploadHandlerAbstract({ opts: '' });

        uploadHandler.upload(1, { x: 'a-param1' });
        uploadHandler.upload(2, { x: 'a-param2' });
        uploadHandler.upload(3, { x: 'a-param3' });

        expect(uploadHandler._queue.length).toEqual(3);
        uploadHandler._dequeue(1);
        expect(uploadHandler._queue.length).toEqual(2);
        uploadHandler._dequeue(2);
        expect(uploadHandler._queue.length).toEqual(1);
        uploadHandler._dequeue(3);
        expect(uploadHandler._queue.length).toEqual(0);
    });

    it("should clear all 3 queued uploads when UploadHandlerAbstract.cancel is called 3 times", function () {

        var uploadHandler = new qq.UploadHandlerAbstract({ opts: '' });

        //cancel on abstract calls _cancel which is empty ready to be overridden
        //it also calls _dequeue

        uploadHandler.upload(1, { x: 'a-param1' });
        uploadHandler.upload(2, { x: 'a-param2' });
        uploadHandler.upload(3, { x: 'a-param3' });

        uploadHandler.cancel(1);
        expect(uploadHandler._queue.length).toEqual(2);
        uploadHandler.cancel(2);
        expect(uploadHandler._queue.length).toEqual(1);
        uploadHandler.cancel(3);
        expect(uploadHandler._queue.length).toEqual(0);
    });

    it("should clear the entire queue when UploadHandlerAbstract.cancelAll is called", function () {

        var uploadHandler = new qq.UploadHandlerAbstract({ opts: '' });

        //cancel on abstract calls _cancel which is empty ready to be overridden
        //it also calls _dequeue

        uploadHandler.upload(1, { x: 'a-param1' });
        uploadHandler.upload(2, { x: 'a-param2' });
        uploadHandler.upload(3, { x: 'a-param3' });

        uploadHandler.cancelAll();
        expect(uploadHandler._queue.length).toEqual(0);
        expect(uploadHandler._queue).toEqual([]);
    });

    it("should store and track files added when UploadHandlerForm.add is called", function () {
        var uhf = new qq.UploadHandlerForm({}),
            root = $('#file-uploader'),
            input = '<input id="find-me" type="file" />',
            inputElem;

        root.parent().append(input);
        inputElem = $('#find-me').get(0);


        expect(inputElem).toBeDefined();
        uhf.add(inputElem);
        //expect it to be gone, after the add is complete
        inputElem = $('#find-me').get(0);
        expect(inputElem).toBeUndefined();
    });

    it("should create and inject (into DOM) an iframe when UploadHandlerForm._createIframe is called", function () {
        var uhf = new qq.UploadHandlerForm({}),
            root = $('#file-uploader'),
            input = '<input id="find-me" type="file" />',
            inputElem,
            iframe,
            iframeViaSearch,
            id;
        root.parent().append(input);
        inputElem = $('#find-me').get(0);

        id = uhf.add(inputElem);

        iframe = uhf._createIframe(id);
        iframeViaSearch = $('#' + id);
        expect(iframe).toBeDefined();
        expect(iframeViaSearch.get(0)).toBeDefined();
    });

    it("should have inputs defined and begin upload when UploadHandlerForm._upload is called", function () {
        var uhf = new qq.UploadHandlerForm({}),
            root = $('#file-uploader'),
            input = '<input id="find-me" type="file" />',
            inputElem,
            iframeViaSearch,
            id;
        root.parent().append(input);
        inputElem = $('#find-me').get(0);

        id = uhf.add(inputElem);

        uhf._upload(id, {});
        iframeViaSearch = $('#' + id);
        expect(uhf._inputs[id]).toBeDefined();
        expect(iframeViaSearch.get(0)).toBeDefined();
    });

    it("should test that UploadHandlerForm._createIframe is called when a an upload happens", function () {

        var uhf = new qq.UploadHandlerForm({}),
            root = $('#file-uploader'),
            input = '<input id="find-me" type="file" />',
            inputElem,
            iframeViaSearch,
            id;
        root.parent().append(input);
        inputElem = $('#find-me').get(0);

        id = uhf.add(inputElem);

        uhf._upload(id, {});
        iframeViaSearch = $('#' + id);
        expect(iframeViaSearch.get(0)).toBeDefined();
    });
    
    it("should remove the iframe from the DOM when UploadHandlerForm._cancel is called", function () {

        var uhf = new qq.UploadHandlerForm({}),
            root = $('#file-uploader'),
            input = '<input id="find-me" type="file" />',
            inputElem,
            iframeViaSearch,
            id;
        root.parent().append(input);
        inputElem = $('#find-me').get(0);

        id = uhf.add(inputElem);

        uhf._upload(id, {});
        iframeViaSearch = $('#' + id);
        expect(iframeViaSearch.get(0)).toBeDefined();

        uhf._cancel(id);
        iframeViaSearch = $('#' + id);
        expect(iframeViaSearch.length).toEqual(0);
    });

    it("should be able to execute eval() on the json in an iframe via a call to UploadHandlerForm._getIframeContentJSON", function () {

        var uhf = new qq.UploadHandlerForm({}),
            root = $('#file-uploader'),
            input = '<input id="find-me" type="file" />',
            inputElem,
            iframe, id, doc, response;

        root.parent().append(input);
        inputElem = $('#find-me').get(0);

        id = uhf.add(inputElem);

        uhf._upload(id, {});

        iframe = $('#' + id)[0];
        doc = iframe.contentDocument ? iframe.contentDocument : iframe.contentWindow.document;
        doc.body.innerHTML = "{success: true}";

        response = uhf._getIframeContentJSON(iframe);
        expect(response).toEqual({ success: true });
    });
    
    it("should test UploadHandlerForm._createForm is called", function () {

        var uhf = new qq.UploadHandlerForm({}),
            root = $('#file-uploader'),
            input = '<input id="find-me" type="file" />',
            inputElem,
            iframe, id, form;

        root.parent().append(input);
        inputElem = $('#find-me').get(0);

        id = uhf.add(inputElem);
        uhf._upload(id, {});
        iframe = $('#' + id)[0];

        //security issues in modern browsers, will have to test this on older IE
        form = uhf._createForm(iframe, {});
        expect(form).toBeDefined();
        expect(form.getAttribute('target')).toEqual(id);
    });

    it("should initialise the storage arrays when a new UploadHandlerXhr is created", function () {

        var xhr = new qq.UploadHandlerXhr({});

        expect(xhr._xhrs).toBeDefined();
        expect(xhr._files).toBeDefined();
        expect(xhr._loaded).toBeDefined();
    });

    it("should test UploadHandlerXhr.isSupported", function () {

        if (!isChromeOrFirefox) {
            return;
        }

        expect(qq.UploadHandlerXhr.isSupported()).toBeTruthy();
    });

    it("should be able to take add a File (or superclass Blob) to the _files list when UploadHandlerXhr.add", function () {

        if (!isChromeOrFirefox) {
            return;
        }

        var blob,
            bb = new BlobBuilder(),
            xhr = new window.XMLHttpRequest(),
            uphxhr = new qq.UploadHandlerXhr({});

        xhr.open('GET', 'jasmine_favicon.png', true);
        xhr.responseType = 'arraybuffer';
        bb.append(this.response); // Note: not xhr.responseText
        blob = bb.getBlob('image/png');

        uphxhr.add(blob);
        expect(uphxhr._files.length).toEqual(1);
    });

    it("should be able to return the fileName property on the File object via UploadHandlerXhr.getName", function () {
        if (!isChromeOrFirefox) {
            return;
        }

        var blob,
            bb = new BlobBuilder(),
            xhr = new window.XMLHttpRequest(),
            uphxhr = new qq.UploadHandlerXhr({}),
            resultFileName,
            fileAtIndex = 0;


        xhr.open('GET', 'jasmine_favicon.png', true);
        xhr.responseType = 'arraybuffer';
        bb.append(this.response); // Note: not xhr.responseText
        blob = bb.getBlob('image/png');
        blob.fileName = 'filename.txt';
        uphxhr.add(blob);
        resultFileName = uphxhr.getName(fileAtIndex);

        expect(resultFileName).toEqual('filename.txt');
    });

    it("should be able to return the fileSize property on the File object via UploadHandlerXhr.getSize", function () {
        if (!isChromeOrFirefox) {
            return;
        }

        var blob,
            bb = new BlobBuilder(),
            xhr = new window.XMLHttpRequest(),
            uphxhr = new qq.UploadHandlerXhr({}),
            resultFileSize,
            fileAtIndex = 0;


        xhr.open('GET', 'jasmine_favicon.png', true);
        xhr.responseType = 'arraybuffer';
        bb.append(this.response); // Note: not xhr.responseText
        blob = bb.getBlob('image/png');
        blob.fileSize = 10240000;
        uphxhr.add(blob);
        resultFileSize = uphxhr.getSize(fileAtIndex);

        expect(resultFileSize).toEqual(10240000);
    });

    it("should upload the file that is fed in via BlobBuild when UploadHandlerXhr._upload is called", function () {

        //NOTE: see below for some important info about getting this test to work
        //      Also that this test will not work as a file:/// specrunner in Chrome or Firefox, it must be run as an application (hosted site)
        if (!isChromeOrFirefox) {
            return;
        }

        var blob,
            bb = new BlobBuilder(),
            xhr = new window.XMLHttpRequest(),
            uphxhr = new qq.UploadHandlerXhr({});

        xhr.open('GET', 'jasmine_favicon.png', true);
        xhr.responseType = 'arraybuffer';
        bb.append(this.response); // Note: not xhr.responseText
        blob = bb.getBlob('image/png');

        uphxhr.add(blob);
        uphxhr._options.action = '/upload/UploadFile';
        blob.fileName = 'uploadthis' + (new Date()).getTime() + '.png';
        blob.fileSize = 9;
        /*  The below line, exists in _upload, but gets in the way in Chrome during dev, for unit tests
        xhr.setRequestHeader("Access-Control-Allow-Origin: *", "XMLHttpRequest");
        it must be commented out
        */
        uphxhr._upload(0, {});
        expect(uphxhr._files.length).toEqual(1);
    });

    it("should return 0 when UploadHandlerXhr.getLoaded is called and there is no entries yet", function () {

        var uphxhr = new qq.UploadHandlerXhr({});

        expect(uphxhr.getLoaded(0)).toEqual(0);
    });
});

//planned features, once initial operation is unit tested:
// - can re-set itself correctly when page navigated away but in scope still attempting via _setupTemplate()
// - use jQuery instead of pure javascript, then we diverge and can't really support taking new patches from original creators, or sending stuff back to them...
// - solve the issue in Chrome about the drag div not dissapearing
// - introduce the better hover mechanism from the custom one I adjusted
// - can re-seed itself from past values (if page was navigated away)


describe("file-upload-in-progress-has-no-after-each-cleanup-task", function () {
    var uploader,
        templateFromFileUploader,
        BlobBuilder = window.MozBlobBuilder || window.WebKitBlobBuilder || window.BlobBuilder;

    /*it("should test qq.UploadDropZone._isValidFileDrag", function () {
    //can't easily test as it requires the dropped file event
    });*/

    //FileUploaderBasic._createUploadHandler

    /*expect(uploadHandler._xhrs[1]).toBeNull();
    expect(uploadHandler._files[2]).toBeNull();
    expect(uploadHandler._xhrs[2]).toBeNull();
    expect(uploadHandler._files[3]).toBeNull();
    expect(uploadHandler._xhrs[3]).toBeNull();*/

    /*it("should be able to call the callback when UploadHandlerForm._attachLoadEvent is called", function () {

    var uhf = new qq.UploadHandlerForm({}),
    root = $('#file-uploader'),
    input = '<input id="find-me" type="file" />',
    cb = function () {
    root.append('<div id="created-by-callback"');
    return false;
    },
    doc,
    iframe,
    id = "i-frame0",
    //inputElem,
    expectedElement;

    root.parent().append(input);
    //inputElem = $('#find-me').get(0);
    //id = uhf.add(inputElem);
    iframe = uhf._createIframe(id);

    uhf._attachLoadEvent(iframe, cb);
    //$("#i-frame0").trigger('load');

    //ARGHHH, cannot for the life of me call .load() or onload, tried so many ways
    iframe = $("#i-frame0").get(0);
    //doc = iframe.contentDocument ? iframe.contentDocument : iframe.contentWindow.document;
    //doc.body.innerHTML = "{success: true}";
        

    expectedElement = $('#created-by-callback');
    expect(expectedElement.get(0)).toBeDefined();
    expectedElement.remove();
    });*/


    it("should test UploadHandlerXhr.getLoaded", function () {

        //NOTE: see below for some important info about getting this test to work
        //      Also that this test will not work as a file:/// specrunner in Chrome or Firefox, it must be run as an application (hosted site)
        if (!isChromeOrFirefox) {
            return;
        }

        var blob,
            bb = new BlobBuilder(),
            xhr = new window.XMLHttpRequest(),
            uphxhr = new qq.UploadHandlerXhr({});

        xhr.open('GET', 'jasmine_favicon.png', true);
        xhr.responseType = 'arraybuffer';
        bb.append(this.response); // Note: not xhr.responseText
        blob = bb.getBlob('image/png');

        uphxhr.add(blob);
        uphxhr._options.action = '/upload/UploadFile';
        blob.fileName = 'uploadthis' + (new Date()).getTime() + '.png';
        blob.fileSize = 9;
        /*  The below line, exists in _upload, but gets in the way in Chrome during dev, for unit tests
        xhr.setRequestHeader("Access-Control-Allow-Origin: *", "XMLHttpRequest");
        it must be commented out
        */
        uphxhr._upload(0, {});
        cl('here---- \\/');
        cl(uphxhr._loaded);
        expect(uphxhr._files.length).toEqual(1);
        expect(uphxhr.getLoaded(0)).toEqual(blob.fileSize);
    });

    it("should test UploadHandlerXhr._onComplete", function () {

    });

    it("should test UploadHandlerXhr._cancel", function () {

    });

    //NEED to go further in unit testing this lib, as the few hours spent on trying to get _setupTemplate working fell over badly with it just refusing to work!

    //NOTE: This test cannot be active yet, as the fileuploader.js must remain unmodified for now, until enough tests can be created, 
    //the section that defines this in fileuploader.js can be uncommented at that point too
    /*
    //need a test for the re-creation re-init of the uploader, the setup of that button
    it("should re-setup the drop area and upload button when setupTemplate() is called", function() {
    //clear our the setup as if we're coming back to the same page via ajax, and uploader is not gettin re-created
    $('#file-uploader').empty();

    uploader._setupTemplate();
        
    var list = $('#file-uploader').find(":input:file");
    var buttons = $('#file-uploader').find(".qq-upload-button");
    var dropArea = $('#file-uploader').find(".qq-upload-drop-area");
    var dropAreaText = dropArea.children(":first-child");
        
    expect(list.length).toEqual(1);
    expect(buttons.length).toEqual(1);
    expect(dropArea.length).toEqual(1);
    expect(dropAreaText.html()).toEqual("Drop files here to upload");
    });*/

    //this test can't really work, it is truly dependant on the construction of 'uploader'
    //so resetting the display area, and then only calling _setupDragDrop will only a subset of the correction actions done.

    /*it("should set up the drag drop area when _setupDragDrop is called", function () {
    $("#temp-elements").empty();

    uploader._setupDragDrop();
        
    var dialog = $("#dialog");
    var uploadArea = dialog.find(":qq-uploader");

    expect(dialog.length).toEqual(1);
    expect(uploadArea.length).toEqual(1);

    //
    });*/

    beforeEach(function () {
        var temp = $("#temp-elements");
        temp.append(
            $('<div id="dialog" title="Basic dialog">')
                .append($('<div id="file-uploader"></div>'))
        );

        templateFromFileUploader =
            '<div class="qq-uploader">' +
                '<div class="qq-upload-drop-area"><span>Drop files here to upload</span></div>' +
                    '<div class="qq-upload-button">Upload a file</div>' +
                        '<ul class="qq-upload-list"></ul>' +
                            '</div>';

        uploader = new qq.FileUploader({
            element: $('#file-uploader')[0],
            action: '/upload/UploadFile',
            debug: true
        });
    });

    //No after each, here in the in progress so we can debug elements
});



function manualUpload() {
    var uhf = new qq.UploadHandlerForm({}),
            root = $('#file-uploader'),
            input = '<input id="find-me" type="file" />',
            cb = function () {
                cl('calll me - holla!');
                root.append('<div id="created-by-callback"');
                return false;
            },
            iframe,
            doc,
            id = "i-frame0",
    //inputElem,
            expectedElement;

    root.parent().append(input);
    //inputElem = $('#find-me').get(0);
    //id = uhf.add(inputElem);
    iframe = uhf._createIframe(id);

    uhf._attachLoadEvent(iframe, cb);
    
    cl($("#i-frame0")[0]);
    cl('about to trigger load...');
    //$("#i-frame0")[0].load();
    //$("#i-frame0")[0].load.apply()
    //($("#i-frame0").get(0))["load"].call();
    //($("#i-frame0").get(0))["onload"].call();
    //($("#i-frame0").get(0)).load.call();
    
    iframe = $("#i-frame0").get(0);
    doc = iframe.contentDocument ? iframe.contentDocument : iframe.contentWindow.document;
    doc = "{ success: true }";

    
    expectedElement = $('#created-by-callback');
    expect(expectedElement.get(0)).toBeDefined();
    cl('blaaaa');
    cl(expectedElement.get(0));
    expectedElement.remove();
};
    
function blablabla() {
    var BlobBuilder = window.MozBlobBuilder || window.WebKitBlobBuilder || window.BlobBuilder;

    var bb = new BlobBuilder();

    var xhr = new XMLHttpRequest();
    xhr.open('GET', 'http://jsfiddle.net/img/logo.png', true);

    xhr.responseType = 'arraybuffer';

    bb.append(this.response); // Note: not xhr.responseText

    var blob = bb.getBlob('image/png');

    var queryString = '/upload/UploadFile?logo-up.png';

    xhr = new XMLHttpRequest();
    xhr.open("POST", queryString, true);

    //xhr.setRequestHeader("Access-Control-Allow-Origin: *", "XMLHttpRequest");
    xhr.setRequestHeader("X-Requested-With", "XMLHttpRequest");
    xhr.setRequestHeader("X-File-Name", encodeURIComponent('logo-' + (new Date()).getTime() + '.png'));
    xhr.setRequestHeader("Content-Type", "application/octet-stream");
    xhr.send(blob);
};