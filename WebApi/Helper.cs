using System;
using System.Security.Cryptography;

namespace WebApi
{
    public static class Helper
    {
        public static string GetHash(string input)
        {
            if(String.IsNullOrWhiteSpace(input))
                throw new ArgumentNullException("input");

            HashAlgorithm hashAlgorithm = new SHA256CryptoServiceProvider();

            byte[] byteValue = System.Text.Encoding.UTF8.GetBytes(input);
            byte[] byteHash = hashAlgorithm.ComputeHash(byteValue);

            return Convert.ToBase64String(byteHash);
        }
    }
}