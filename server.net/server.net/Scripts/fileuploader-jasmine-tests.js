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
        //$("#temp-elements").empty();
    });

    it("should have created a new uploader", function () {
        //testing the beforeEach setup is correct
        expect(uploader).toBeDefined();
    });

    it("should have _preventLeaveInProgress and therefore an attached event when calling _onSubmit", function () {
        uploader._onSubmit(1, 'file1.name');

        var event = ('onbeforeunload' in window) || ('beforeunload' in window);

        expect(event).toBeTruthy();

        $("#temp-elements").empty(); // <-- remove
    });

    it("should increment the files in progress variable via _onSubmit", function () {
        uploader._onSubmit(1, 'file1.name');

        expect(uploader._filesInProgress).toEqual(1);

        $("#temp-elements").empty(); // <-- remove
    });

    it("should increment the files twice in progress variable via 2 calls to _onSubmit", function () {
        uploader._onSubmit(1, 'file1.name');
        uploader._onSubmit(2, 'file2.name');

        expect(uploader._filesInProgress).toEqual(2);

        $("#temp-elements").empty(); // <-- remove
    });

    it("should create 4 spans, including a spinner when _addToList is called", function () {

        uploader._addToList(1, 'file.name');
        var list = $('#file-uploader').find(".qq-upload-list");
        var childSpans = list.children().find("span");
        var spinner = list.children().find(".qq-upload-spinner");

        expect(list.length).toEqual(1);
        expect(childSpans.length).toEqual(4);
        expect(spinner.length).toEqual(1);

        $("#temp-elements").empty(); // <-- remove
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

        $("#temp-elements").empty(); // <-- remove
    });

    it("should show failed correctly, when _onComplete is called with a success = false result", function () {
        uploader._addToList(1, 'file.name');
        uploader._onComplete(1, 'file.name', { success: false });

        var list = $('#file-uploader').find(".qq-upload-list");
        var failed = list.find(".qq-upload-fail");

        expect(failed.length).toEqual(1);

        $("#temp-elements").empty(); // <-- remove
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

        $("#temp-elements").empty(); // <-- remove
    });

    it("should display only file size when 100% percent progress on a 1MB file, on a call to _onProgress", function () {

        uploader._addToList(1, 'file1.name');
        //deliberate shift of filename, as it isn't used for display/locating element, only id
        uploader._onProgress(1, 'file2.name', 1000000, 1000000);

        var list = $('#file-uploader').find(".qq-upload-list");
        var size = list.find(".qq-upload-size");

        expect(size.html()).toEqual('1.0MB');

        $("#temp-elements").empty(); // <-- remove
    });

    it("should display complete file size with Gb suffix, on a call to _onProgress at 100%", function () {

        uploader._addToList(1, 'file1.name');
        //deliberate shift of filename, as it isn't used for display/locating element, only id
        uploader._onProgress(1, 'file2.name', 1000000000, 1000000000);

        var list = $('#file-uploader').find(".qq-upload-list");
        var size = list.find(".qq-upload-size");

        expect(size.html()).toEqual('0.9GB');

        $("#temp-elements").empty(); // <-- remove
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

        $("#temp-elements").empty(); // <-- remove
    });

    //this test can't really work, it is truly dependant on the construction of 'uploader'
    /*it("should set up the drag drop area when _setupDragDrop is called", function () {
    $("#temp-elements").empty();

    uploader._setupDragDrop();
        
    var dialog = $("#dialog");
    var uploadArea = dialog.find(":qq-uploader");

    expect(dialog.length).toEqual(1);
    expect(uploadArea.length).toEqual(1);

    //
    });*/

    it("should find an item by fileId, when _getItemByFileId is called", function () {
        uploader._addToList(1, 'file1.name');
        uploader._addToList(2, 'file2.name');
        uploader._addToList(3, 'file3.name');

        var item = uploader._getItemByFileId(2);

        console.log(item.firstChild.nextSibling);
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

        console.log(item);
        expect(item).toBeDefined();
        //TODO: _onComplete a file, and track that on complete modified the things...
        expect(item.firstChild.textContent).toEqual('file1.name');
        //expect(item.find(".qq-upload-file").html()).toEqual('file1.name');
    });

    it("should test _find", function () {
        
    });

    it("should test qq.attach", function () {
        //to simple? maybe no such thing on this lib...
    });

    it("should test qq.UploadDropZone", function () {

    });

    it("should test qq.UploadDropZone._attachEvents", function () {

    });

    it("should test qq.UploadDropZone._isValidFileDrag", function () {

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

    $("#temp-elements").empty(); // <-- remove
    });*/


    //features:
    // - can re-set itself correctly when page navigated away but in scope still attempting via _setupTemplate()
    // - use jQuery instead of pure javascript, then we diverge and can't really support taking new patches from original creators, or sending stuff back to them...
    // - solve the bug in Chrome about the div not dissapearing
    // - introduce the better hover mechanism from the custom one I adjusted
    // - can re-seed itself from past values (if page was navigated away)
});