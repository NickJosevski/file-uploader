using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Web.Mvc;

namespace server.net.Controllers
{
    public class HomeController : Controller
    {
        public ActionResult Index()
        {
            ViewBag.Message = "Including an ASP.NET MVC server controller";

            return View();
        }

        public ActionResult About()
        {
            ViewBag.Message = "A Fork of 'file-uploader' with an ASP.NET MVC server component";

            return View();
        }

        public ActionResult Contact()
        {
            ViewBag.Message = "Reach the original creators.";

            return View();
        }
    }
}
