using System;
using System.IO;
using System.Security.Cryptography;
using System.Text;

namespace FileHashGenerator
{
    class Program
    {
        static void Main(string[] args)
        {
            if (args.Length == 0)
            {
                Console.WriteLine("Please provide file paths as arguments.");
                return;
            }

            var outputPath = "README.txt";
            using var outputFile = File.CreateText(outputPath);
            
            outputFile.WriteLine("P/N  <PART NUMBER DESCRIPTION HERE>");
            outputFile.WriteLine();

            foreach (var filePath in args)
            {
                var fileName = Path.GetFileName(filePath);
                var hash = GetSha256Hash(filePath);

                outputFile.WriteLine($"File Name: {fileName}");
                outputFile.WriteLine($"Hash: {hash}");
                outputFile.WriteLine();  
            }

            outputFile.WriteLine(GetEmbeddedResource("FileHashGenerator.template.txt"));
            outputFile.WriteLine();
        }

        static string GetSha256Hash(string filePath)
        {
            using var stream = File.OpenRead(filePath);
            using var sha256 = SHA256.Create();
            var hashBytes = sha256.ComputeHash(stream);
            return BitConverter.ToString(hashBytes).Replace("-", string.Empty);
        }

        static string GetEmbeddedResource(string resourceName)
        {
            using var stream = typeof(Program).Assembly.GetManifestResourceStream(resourceName);
            if (null == stream)
            {
                Console.WriteLine("Template is missing!");
                return String.Empty;                
            }

            using var reader = new StreamReader(stream);
            return reader.ReadToEnd();
        }
    }
}
