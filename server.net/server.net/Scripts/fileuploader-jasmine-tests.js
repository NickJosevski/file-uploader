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
        expect(uploader).toBeDefined();
    });

    it("should create 4 spans, including a spinner when _addToList is called", function () {

        uploader._addToList(1, 'file.name');
        var list = $('#file-uploader').find(".qq-upload-list");
        var childSpans = list.children().find("span");
        var spinner = list.children().find(".qq-upload-spinner");

        expect(list.length).toEqual(1);
        expect(childSpans.length).toEqual(4);
        expect(spinner.length).toEqual(1);

        //remove:
        $("#temp-elements").empty();
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

        //remove:
        $("#temp-elements").empty();
    });

    it("should show failed correctly, when _onComplete is called with a success = false result", function () {
        uploader._addToList(1, 'file.name');
        uploader._onComplete(1, 'file.name', { success: false });

        var list = $('#file-uploader').find(".qq-upload-list");
        var failed = list.find(".qq-upload-fail");

        expect(failed.length).toEqual(1);
    });

    it("should report progress on a call to _onProgress", function () {
        //remove:
        $("#temp-elements").empty();

    });
}
);