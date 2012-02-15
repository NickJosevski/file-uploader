describe("file-upload", function () {
    var uploader;

    beforeEach(function () {
        var temp = $("#temp-elements");
        temp.append(
            $('<div id="dialog" title="Basic dialog">')
                .append($('<div id="file-uploader"></div>'))
        );

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
        uploader._onSubmit(1, 'file1.name');

        var event = ('onbeforeunload' in window) || ('beforeunload' in window);

        expect(event).toBeTruthy();

        //$("#temp-elements").empty(); // <-- remove
    });

    it("should increment the files in progress variable via _onSubmit", function () {
        uploader._onSubmit(1, 'file1.name');

        expect(uploader._filesInProgress).toEqual(1);

        //$("#temp-elements").empty(); // <-- remove
    });

    it("should increment the files twice in progress variable via 2 calls to _onSubmit", function () {
        uploader._onSubmit(1, 'file1.name');
        uploader._onSubmit(2, 'file2.name');

        expect(uploader._filesInProgress).toEqual(2);

        //$("#temp-elements").empty(); // <-- remove
    });

    it("should create 4 spans, including a spinner when _addToList is called", function () {

        uploader._addToList(1, 'file.name');
        var list = $('#file-uploader').find(".qq-upload-list");
        var childSpans = list.children().find("span");
        var spinner = list.children().find(".qq-upload-spinner");

        expect(list.length).toEqual(1);
        expect(childSpans.length).toEqual(4);
        expect(spinner.length).toEqual(1);

        //$("#temp-elements").empty(); // <-- remove
    });

    it("should have 3 remaining spans, with the sucess one visible when _onComplete is called with a success result", function () {
        uploader._addToList(1, 'file.name');
        uploader._onComplete(1, 'file.name', { success: true });

        var list = $('#file-uploader').find(".qq-upload-list");
        var children = list.children();
        var childSpans = children.find("span");
        var success = list.find(".qq-upload-success");
        var size = list.find(".qq-upload-size");
        var failed = list.find(".qq-upload-failed-text");

        expect(list.length).toEqual(1);
        expect(childSpans.length).toEqual(3);
        expect(success.length).toEqual(1);
        expect(size.length).toEqual(1);
        expect(failed.length).toEqual(1);

        //$("#temp-elements").empty(); // <-- remove
    });

    it("should show failed correctly, when _onComplete is called with a success = false result", function () {
        uploader._addToList(1, 'file.name');
        uploader._onComplete(1, 'file.name', { success: false });

        var list = $('#file-uploader').find(".qq-upload-list");
        var failed = list.find(".qq-upload-fail");

        expect(failed.length).toEqual(1);

        //$("#temp-elements").empty(); // <-- remove
    });

    it("should display 10 percent, 0.1kb file size and a cancel option, on a call to _onProgress", function () {

        uploader._addToList(1, 'file1.name');
        //deliberate shift of filename, as it isn't used for display/locating element, only id
        uploader._onProgress(1, 'file2.name', 10, 100);

        var list = $('#file-uploader').find(".qq-upload-list");
        var size = list.find(".qq-upload-size");
        var file = list.find(".qq-upload-file");
        var cancel = list.find(".qq-upload-cancel");

        expect(file.html()).toEqual('file1.name');
        expect(size.html()).toEqual('10% from 0.1kB');
        expect(cancel.attr('href')).toEqual('#');
        expect(cancel.html()).toEqual('Cancel');

        //$("#temp-elements").empty(); // <-- remove
    });

    it("should display only file size when 100% percent progress on a 1MB file, on a call to _onProgress", function () {

        uploader._addToList(1, 'file1.name');
        //deliberate shift of filename, as it isn't used for display/locating element, only id
        uploader._onProgress(1, 'file2.name', 1000000, 1000000);

        var list = $('#file-uploader').find(".qq-upload-list");
        var size = list.find(".qq-upload-size");

        expect(size.html()).toEqual('1.0MB');

        //$("#temp-elements").empty(); // <-- remove
    });

    it("should display complete file size with Gb suffix, on a call to _onProgress at 100%", function () {

        uploader._addToList(1, 'file1.name');
        //deliberate shift of filename, as it isn't used for display/locating element, only id
        uploader._onProgress(1, 'file2.name', 1000000000, 1000000000);

        var list = $('#file-uploader').find(".qq-upload-list");
        var size = list.find(".qq-upload-size");

        expect(size.html()).toEqual('0.9GB');

        //$("#temp-elements").empty(); // <-- remove
    });

    it("should set up the visual drag and drop area on the page when created", function () {

        var list = $('#file-uploader').find(":input:file");
        var buttons = $('#file-uploader').find(".qq-upload-button");
        var dropArea = $('#file-uploader').find(".qq-upload-drop-area");
        var dropAreaText = dropArea.children(":first-child");

        expect(list.length).toEqual(1);
        expect(buttons.length).toEqual(1);
        expect(dropArea.length).toEqual(1);
        expect(dropAreaText.html()).toEqual("Drop files here to upload");

        //$("#temp-elements").empty(); // <-- remove
    });

    it("should find an item by fileId, when _getItemByFileId is called", function () {
        uploader._addToList(1, 'file1.name');
        uploader._addToList(2, 'file2.name');
        uploader._addToList(3, 'file3.name');

        var item = uploader._getItemByFileId(2);

        expect(item).toBeDefined();

        expect(item.firstChild.textContent).toEqual('file2.name');
        expect(qq.hasClass(item.firstChild.nextSibling, 'qq-upload-cancel')).toEqual(false);
        //expect(item.find(".qq-upload-file").html()).toEqual('file2.name');
    });

    it("should find an item by fileId, when _getItemByFileId is called", function () {
        uploader._addToList(1, 'file1.name');
        uploader._addToList(2, 'file2.name');
        uploader._addToList(3, 'file3.name');

        var item = uploader._getItemByFileId(1);

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

    it("should have the drop events set up on the dropArea when qq.UploadDropZone._attachEvents is called", function () {

        var dropAreaContent = $('<div class="qq-upload-drop-area"><span>Drop files here to upload</span></div>'),
            dropArea,
            root = $('#file-uploader');

        root.empty();
        root.append(dropAreaContent);
        dropArea = $('.qq-upload-drop-area').get(0);

        var dz = new qq.UploadDropZone({
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

        var dropAreaContent = $('<div class="qq-upload-drop-area"><span>Drop files here to upload</span></div>'),
            dropArea,
            root = $('#file-uploader');

        root.empty();
        root.append(dropAreaContent);
        dropArea = $('.qq-upload-drop-area').get(0);

        var dz = new qq.UploadDropZone({
            element: dropArea
        });
        //call it again, in case flow changes, it is called in the creation
        dz._disableDropOutside();

        expect(('ondragover' in document)).toBeTruthy();
        expect(qq.UploadDropZone.dropOutsideDisabled).toBeTruthy();
    });
});

//planned features, once initial operation is unit tested:
// - can re-set itself correctly when page navigated away but in scope still attempting via _setupTemplate()
// - use jQuery instead of pure javascript, then we diverge and can't really support taking new patches from original creators, or sending stuff back to them...
// - solve the issue in Chrome about the drag div not dissapearing
// - introduce the better hover mechanism from the custom one I adjusted
// - can re-seed itself from past values (if page was navigated away)

describe("file-upload-in-progress-has-no-after-each-cleanup-task", function () {
    var uploader;

    it("should test qq.UploadDropZone", function () {

    });

    it("should test qq.UploadDropZone._isValidFileDrag", function () {
        //can't easily test as it requires the dropped file event
    });


    it("should test qq.UploadButton", function () {

    });

    it("should test qq.UploadButton._createInput styles", function () {

    });


    it("should test qq.UploadButton._createInput events", function () {

    });


    it("should test UploadHandlerAbstract", function () {
        //is this the magic of the arrays, that could be fixed to be more verbose?
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

        uploader = new qq.FileUploader({
            element: $('#file-uploader')[0],
            action: '/upload/UploadFile',
            debug: true
        });
    });

    //No after each, here in the in progress so we can debug elements
});