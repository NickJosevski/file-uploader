using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Web;
using System.Web.Mvc;
using System.Web.Routing;
using server.net.Repositories;

namespace server.net.Controllers
{
    public class UploadController : Controller
    {
        public IFileRepository FileRepository { get; set; }

        public UploadController()
        {
            //this project stays simple hence no IoC
            FileRepository = new FileRepository(new HttpServerUtilityWrapper(System.Web.HttpContext.Current.Server));
        }

        //
        // GET: /Upload/

        public ActionResult Index()
        {
            return View();
        }

        //[HttpPost]
        public virtual JsonResult UploadFile(object obj)
        {
            var fileName = Request.Headers["X-File-Name"];
            var fileSize = Request.Headers["X-File-Size"];
            var fileType = Request.Headers["X-File-Type"];

            var stream = Request.InputStream;

            if (String.IsNullOrWhiteSpace(fileName) && Request.Files.Count > 0)
            {
                var uri = new Uri(Request.Files[0].FileName);
                fileName = Path.GetFileName(uri.LocalPath);
            }

            var fullPath = this.FileRepository.MapPath(Path.Combine("", fileName));
            this.FileRepository.Save(stream, fullPath, false);

            return Json(new { success = "true" });
        }
    }
}
