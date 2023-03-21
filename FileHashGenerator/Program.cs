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
            else if (args[0] == "-v")
            {
                VerifyHashes(args[1]);
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

        static void VerifyHashes(string outputPath)
        {
            var fileLines = File.ReadAllLines(outputPath);
            for (int i = 0; i < fileLines.Length; i++)
            {
                var line = fileLines[i];
                if (line.StartsWith("File Name: "))
                {
                    var fileName = line.Substring("File Name: ".Length);
                    var expectedHash = fileLines[++i].Substring("Hash: ".Length);

                    var actualHash = GetSha256Hash(fileName);

                    if (expectedHash.Equals(actualHash, StringComparison.OrdinalIgnoreCase))
                    {
                        Console.WriteLine($"File: {fileName} - Hash Match: {actualHash}");
                    }
                    else
                    {
                        Console.WriteLine($"File: {fileName} - Hash Mismatch! Expected: {expectedHash}, Actual: {actualHash}");
                    }
                }
            }
        }

    }
}
