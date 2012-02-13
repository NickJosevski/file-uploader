describe("file-upload", function () {
    var uploader;
    var somethignelse;

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
        expect(uploader).toBeDefined();
    });

    it("should create 4 spans, including a spinner when _addToList is called", function () {

        uploader._addToList(1, 'bla');
        var list = $('#file-uploader').find(".qq-upload-list");
        var childSpans = list.children().find("span");
        var spinner = list.children().find(".qq-upload-spinner");

        expect(list.length).toEqual(1);
        expect(childSpans.length).toEqual(4);
        expect(spinner.length).toEqual(1);
    });
}
);