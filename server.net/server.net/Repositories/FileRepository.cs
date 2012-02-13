// FileRepository source taken from https://bitbucket.org/FunnelWeb
/*
FunnelWeb is licensed under the New BSD license.
==============================================================================

Copyright (c) 2009, FunnelWeb Contributors
All rights reserved.

Redistribution and use in source and binary forms, with or without 
modification, are permitted provided that the following conditions are met:

 - Redistributions of source code must retain the above copyright notice, 
   this list of conditions and the following disclaimer.
 - Redistributions in binary form must reproduce the above copyright notice, 
   this list of conditions and the following disclaimer in the documentation 
   and/or other materials provided with the distribution.
 - Neither the name of FunnelWeb nor the names of its contributors may be used 
   to endorse or promote products derived from this software without specific 
   prior written permission.

THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS" 
AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE 
IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE 
DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT HOLDER OR CONTRIBUTORS BE LIABLE 
FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL 
DAMAGES (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR 
SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER 
CAUSED AND ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, 
OR TORT (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE 
OF THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
*/

using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Security;
using System.Text.RegularExpressions;
using System.Web;

namespace server.net.Repositories
{
    public interface IFileRepository
    {
        string MapPath(string path);
        string UnmapPath(string fullPath);
        bool IsFile(string path);
        FileItem[] GetItems(string path);
        DirectoryInfo[] GetDirectories(string path);
        FileInfo[] GetFiles(string path);

        void Move(string oldPath, string newPath);
        void Delete(string filePath);

        void CreateDirectory(string path, string name);
        void Save(Stream inputStream, string fullPath, bool unzip);
    }

    public class FileItem
    {
        public string Image { get; set; }
        public string Name { get; set; }
        public string Path { get; set; }
        public bool IsDirectory { get; set; }
        public string Extension { get; set; }
        public string FileSize { get; set; }
        public string Modified { get; set; }
    }

    public static class NumericExtensions
    {
        private const long Kilobyte = 1024;
        private const long Megabyte = 1024 * Kilobyte;
        private const long Gigabyte = 1024 * Megabyte;
        private const long Terabyte = 1024 * Gigabyte;

        public static string ToFileSizeString(this long bytes)
        {
            if (bytes > Terabyte) return (bytes / Terabyte).ToString("0.00 TB");
            if (bytes > Gigabyte) return (bytes / Gigabyte).ToString("0.00 GB");
            if (bytes > Megabyte) return (bytes / Megabyte).ToString("0.00 MB");
            if (bytes > Kilobyte) return (bytes / Kilobyte).ToString("0.00 KB");
            return bytes + " bytes";
        }
    }

    public class FileRepository : IFileRepository
    {
        private readonly string root;

        public FileRepository(HttpServerUtilityBase server)
        {
            //root = settingsProvider.GetSettings<Settings.FunnelWebSettings>().UploadPath;
            this.root = "~/UploadedFiles";
            // If it's a virtual path then we can map it, otherwise we'll expect that it's a windows path
            if (this.root.StartsWith("~"))
            {
                this.root = server.MapPath(this.root);
            }
        }

        public string MapPath(string path)
        {
            path = (path ?? string.Empty).Trim();
            while (path.StartsWith("/"))
            {
                path = path.Substring(1);
            }

            if (path.Contains("..")) throw new SecurityException("The path contained '..', which indicates an attempt to access another directory.");
            if (Regex.IsMatch(path, "^[A-z]:")) throw new SecurityException("An attempt was made to access a different drive");
            var fullPath = Path.GetFullPath(Path.Combine(this.root, path));
            if (!fullPath.StartsWith(this.root)) throw new SecurityException("An attempt was made to access an alternative file path");
            return fullPath;
        }

        public string UnmapPath(string fullPath)
        {
            var path = fullPath.Substring(this.root.Length);
            path = path.Replace("\\", "/");
            return path;
        }

        public bool IsFile(string path)
        {
            var fullPath = this.MapPath(path);
            return File.Exists(fullPath);
        }

        public FileItem[] GetItems(string path)
        {
            var directories = this.GetDirectories(path);
            var files = this.GetFiles(path);
            return
                directories.Select(dir => new FileItem
                {
                    Extension = "",
                    Name = dir.Name,
                    Path = this.UnmapPath(dir.FullName),
                    FileSize = "",
                    Image = "dir.png",
                    IsDirectory = true,
                    Modified = dir.LastWriteTime.ToString("dd-MMM-yyyy")
                }).Union(files.Select(file => new FileItem
                {
                    Extension = file.Extension,
                    Name = file.Name,
                    Path = this.UnmapPath(file.FullName),
                    FileSize = file.Length.ToFileSizeString(),
                    Image = GetImage(file),
                    Modified = file.LastWriteTime.ToString("dd-MMM-yyyy")
                })).ToArray();
        }

        private static string GetImage(FileSystemInfo file)
        {
            var extension = (file.Extension ?? string.Empty).Trim();
            if (string.IsNullOrEmpty(extension) || extension == ".") return "default.png";
            if (extension.StartsWith(".")) extension = extension.Substring(1);
            extension = extension.ToLowerInvariant();
            if (File.Exists(HttpContext.Current.Server.MapPath("/Content/Images/FileTypes/" + extension + ".png")))
            {
                return extension + ".png";
            }
            return "default.png";
        }

        public DirectoryInfo[] GetDirectories(string path)
        {
            var fullPath = this.MapPath(path);
            return Directory.Exists(fullPath)
                       ? Directory.GetDirectories(fullPath).Select(x => new DirectoryInfo(x)).ToArray()
                       : new DirectoryInfo[0];
        }

        public FileInfo[] GetFiles(string path)
        {
            var fullPath = this.MapPath(path);
            return Directory.Exists(fullPath)
                       ? Directory.GetFiles(fullPath).Select(x => new FileInfo(x)).ToArray()
                       : new FileInfo[0];
        }

        public void Move(string oldPath, string newPath)
        {
            oldPath = this.MapPath(oldPath);
            newPath = this.MapPath(newPath);
            if (!File.Exists(oldPath)) return;
            Directory.CreateDirectory(Path.GetDirectoryName(newPath));
            File.Move(oldPath, newPath);
        }

        public void Delete(string filePath)
        {
            var fullPath = this.MapPath(filePath);
            if (this.IsFile(filePath))
            {
                File.Delete(fullPath);
            }
            else
            {
                Directory.Delete(fullPath, true);
            }
        }

        public void CreateDirectory(string path, string name)
        {
            var fullPath = this.MapPath(Path.Combine(path, name));
            Directory.CreateDirectory(fullPath);
        }

        public void Save(Stream inputStream, string fullPath, bool unzip)
        {
            inputStream.Save(fullPath);
        }
    }

    public static class StreamExtensions
    {
        public static void Save(this Stream stream, string fileName)
        {
            var directoryName = Path.GetDirectoryName(fileName);
            Directory.CreateDirectory(directoryName);

            using (var output = new FileStream(fileName, FileMode.Create, FileAccess.Write))
            {
                var size = 2048;
                var data = new byte[size];
                while (size > 0)
                {
                    size = stream.Read(data, 0, data.Length);
                    if (size > 0) output.Write(data, 0, size);
                }
            }
        }
    }
}