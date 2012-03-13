/// <reference path="jquery-1.7.1-vsdoc.js" />
/// <reference path="fileuploader.js" />

$(function () {

    function createDomElements() {
        var temp = $("#temp-elements");
        temp.append(
            $('<div id="dialog" title="Basic dialog">')
                .append($('<div id="file-uploader"></div>'))
        );
    }

    function clear() {
        $("#temp-elements").empty();
    }

    test("check if can setup FileUploader object", function () {

        // Arrange 
        var uploader;
        createDomElements();

        // Act
        uploader = new qq.FileUploader({
            element: $('#file-uploader')[0],
            jqElementId: 'file-uploader',
            jqExternalElementId: 'on-going-uploads',
            action: '/upload/UploadFile',
            debug: true
        });

        // Assert
        ok(!(uploader === "undefined"), "uploader created sucessfully");
        clear();
    });

    test("_addToList - Span setups for a new upload, expecting a spinner and supporting elements", function () {

        // Arrange 
        var uploader;
        createDomElements();
        uploader = new qq.FileUploader({
            element: $('#file-uploader')[0],
            jqElementId: 'file-uploader',
            jqExternalElementId: 'on-going-uploads',
            action: '/upload/UploadFile',
            debug: true
        });

        // Act
        uploader._addToList(1, 'bla');
        var list = $('#file-uploader').find(".qq-upload-list");
        var childSpans = list.children().find("span");
        var spinner = list.children().find(".qq-upload-spinner");
        
        // Assert
        ok(list.length === 1, "expecting only 1 file loader list");
        ok(childSpans.length === 4, "epecting 4 spans");
        ok(spinner.length === 1, "epecting 1 span to be the spinner");

        clear();
    });

});